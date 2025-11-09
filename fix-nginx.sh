#!/bin/bash

# Fix and Start Nginx Script

echo "🔧 Fixing and Starting Nginx"
echo "============================="
echo ""

# Step 1: Check nginx status
echo "1️⃣  Checking nginx status..."
sudo systemctl status nginx --no-pager | head -5
echo ""

# Step 2: Remove conflicting configs
echo "2️⃣  Removing conflicting nginx configs..."
sudo rm -f /etc/nginx/sites-enabled/default
sudo rm -f /etc/nginx/sites-enabled/aeroskop-storage-calculator
echo "✅ Old configs removed"
echo ""

# Step 3: Create clean nginx config
echo "3️⃣  Creating clean nginx configuration..."
sudo tee /etc/nginx/sites-available/aeroskop-storage-calculator > /dev/null << 'EOF'
server {
    listen 80;
    server_name _;

    proxy_cache off;
    proxy_buffering off;
    
    add_header Cache-Control "no-store, no-cache, must-revalidate";
    add_header Pragma "no-cache";

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_cache_bypass $http_upgrade;
        proxy_no_cache 1;
    }
}
EOF

echo "✅ Nginx config created"
echo ""

# Step 4: Enable site
echo "4️⃣  Enabling nginx site..."
sudo ln -sf /etc/nginx/sites-available/aeroskop-storage-calculator /etc/nginx/sites-enabled/
echo "✅ Site enabled"
echo ""

# Step 5: Test nginx config
echo "5️⃣  Testing nginx configuration..."
if sudo nginx -t; then
    echo "✅ Nginx config is valid"
else
    echo "❌ Nginx config has errors!"
    exit 1
fi
echo ""

# Step 6: Clear nginx cache
echo "6️⃣  Clearing nginx cache..."
sudo rm -rf /var/cache/nginx/*
sudo rm -rf /var/lib/nginx/cache/*
echo "✅ Cache cleared"
echo ""

# Step 7: Start nginx
echo "7️⃣  Starting nginx..."
sudo systemctl start nginx
sudo systemctl enable nginx
sleep 2

# Check status
if sudo systemctl is-active --quiet nginx; then
    echo "✅ Nginx is running"
else
    echo "❌ Nginx failed to start"
    echo "Checking error logs:"
    sudo tail -20 /var/log/nginx/error.log
    exit 1
fi
echo ""

# Step 8: Test connections
echo "8️⃣  Testing connections..."
echo "   Testing port 3000 (dev server):"
HTTP_3000=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 || echo "ERROR")
echo "   HTTP $HTTP_3000"

echo "   Testing port 80 (nginx):"
HTTP_80=$(curl -s -o /dev/null -w "%{http_code}" http://localhost || echo "ERROR")
echo "   HTTP $HTTP_80"
echo ""

# Summary
echo "=========================================="
if [ "$HTTP_3000" = "200" ] && [ "$HTTP_80" = "200" ]; then
    echo "✅ SUCCESS! Everything is working!"
    echo ""
    echo "🌐 Your app is accessible on:"
    SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || echo "YOUR_SERVER_IP")
    echo "   - Direct: http://$SERVER_IP:3000"
    echo "   - Via Nginx: http://$SERVER_IP"
else
    echo "⚠️  WARNING: Some checks failed"
    echo "   - Port 3000: HTTP $HTTP_3000"
    echo "   - Port 80: HTTP $HTTP_80"
    echo ""
    echo "📋 Check nginx logs: sudo tail -f /var/log/nginx/error.log"
fi
echo ""

