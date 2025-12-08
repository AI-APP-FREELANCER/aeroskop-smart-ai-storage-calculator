#!/bin/bash
# Quick HTTPS Setup Script for aeroskope.com
# Run this on your DigitalOcean VM

set -e

echo "🔒 HTTPS Setup for aeroskope.com"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

DOMAIN="aeroskope.com"
VM_IP="157.245.54.198"

echo -e "${BLUE}📋 Configuration:${NC}"
echo "   Domain: $DOMAIN"
echo "   VM IP: $VM_IP"
echo ""

# Step 1: Install Nginx
echo -e "${BLUE}📦 Installing Nginx...${NC}"
sudo apt-get update
sudo apt-get install -y nginx
sudo systemctl enable nginx
echo -e "${GREEN}✅ Nginx installed${NC}"
echo ""

# Step 2: Install Certbot
echo -e "${BLUE}📦 Installing Certbot...${NC}"
sudo apt-get install -y certbot python3-certbot-nginx
echo -e "${GREEN}✅ Certbot installed${NC}"
echo ""

# Step 3: Create Nginx config
echo -e "${BLUE}⚙️  Creating Nginx configuration...${NC}"
sudo tee /etc/nginx/sites-available/$DOMAIN > /dev/null <<EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    access_log /var/log/nginx/aeroskope-access.log;
    error_log /var/log/nginx/aeroskope-error.log;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    client_max_body_size 10M;
}
EOF

# Enable site
sudo ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test configuration
if sudo nginx -t; then
    sudo systemctl reload nginx
    echo -e "${GREEN}✅ Nginx configured${NC}"
else
    echo -e "${RED}❌ Nginx configuration error${NC}"
    exit 1
fi
echo ""

# Step 4: Update .env.local
echo -e "${BLUE}⚙️  Updating application environment...${NC}"
cd ~/aeroskop/aeroskop

if [ -f ".env.local" ]; then
    # Update NEXT_PUBLIC_APP_URL
    if grep -q "NEXT_PUBLIC_APP_URL" .env.local; then
        sed -i "s|NEXT_PUBLIC_APP_URL=.*|NEXT_PUBLIC_APP_URL=https://$DOMAIN|" .env.local
    else
        echo "NEXT_PUBLIC_APP_URL=https://$DOMAIN" >> .env.local
    fi
    echo -e "${GREEN}✅ .env.local updated${NC}"
else
    echo -e "${YELLOW}⚠️  .env.local not found. Please create it manually.${NC}"
fi
echo ""

# Step 5: Instructions for SSL
echo -e "${YELLOW}⚠️  IMPORTANT: Before running Certbot:${NC}"
echo "   1. Configure GoDaddy DNS:"
echo "      - Add A record: @ → $VM_IP"
echo "      - Add CNAME: www → $DOMAIN"
echo "   2. Wait 5-10 minutes for DNS propagation"
echo "   3. Verify DNS: nslookup $DOMAIN"
echo ""
echo -e "${BLUE}📝 After DNS is configured, run:${NC}"
echo "   sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
echo ""
echo -e "${BLUE}📝 Then rebuild and restart:${NC}"
echo "   cd ~/aeroskop/aeroskop"
echo "   npm run build"
echo "   pm2 restart aeroskop"
echo ""

echo -e "${GREEN}✅ Setup script completed!${NC}"
echo ""

