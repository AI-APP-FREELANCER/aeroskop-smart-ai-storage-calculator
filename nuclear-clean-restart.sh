#!/bin/bash

# Nuclear Clean and Restart Script
# This script completely cleans everything and starts fresh

# Don't exit on error - we want to see what's happening
set +e

echo "💣 NUCLEAR OPTION - Complete Fresh Start"
echo "=========================================="
echo ""

# Step 1: Navigate to project directory
echo "📁 Step 1: Navigating to project directory..."
cd /home/ubuntu/aeroskop/aeroskop-smart-ai-storage-calculator
pwd

# Step 2: Kill EVERYTHING
echo ""
echo "🛑 Step 2: Killing ALL processes..."
pkill -9 -f "npm" 2>/dev/null || true
pkill -9 -f "next" 2>/dev/null || true
pkill -9 -f "node.*next" 2>/dev/null || true
sudo killall -9 node 2>/dev/null || true
sudo kill -9 $(sudo lsof -t -i:3000) 2>/dev/null || true
sudo kill -9 $(sudo lsof -t -i:3001) 2>/dev/null || true
sudo kill -9 $(sudo lsof -t -i:3002) 2>/dev/null || true
sleep 3
echo "✅ All processes killed"

# Step 3: Stop nginx
echo ""
echo "🛑 Step 3: Stopping nginx..."
sudo systemctl stop nginx 2>/dev/null || true
echo "✅ Nginx stopped"

# Step 4: Delete EVERYTHING
echo ""
echo "🗑️  Step 4: Deleting all build artifacts and caches..."
rm -rf .next 2>/dev/null || true
rm -rf node_modules 2>/dev/null || true
rm -rf package-lock.json 2>/dev/null || true
rm -rf .turbo 2>/dev/null || true
rm -rf out 2>/dev/null || true
rm -rf app.log 2>/dev/null || true
rm -rf *.log 2>/dev/null || true
npm cache clean --force 2>/dev/null || true
sudo rm -rf /var/cache/nginx/* 2>/dev/null || true
sudo rm -rf /var/lib/nginx/cache/* 2>/dev/null || true
echo "✅ All caches and build artifacts deleted"

# Step 5: Pull fresh code from GitHub
echo ""
echo "📥 Step 5: Pulling fresh code from GitHub..."
git fetch origin
git reset --hard origin/main
git clean -fd
git pull origin main
echo ""
echo "📋 Latest commit:"
git log -1 --oneline

# Step 6: Fresh install
echo ""
echo "📦 Step 6: Fresh npm install..."
npm install
echo "✅ Dependencies installed"

# Step 7: Setup environment
echo ""
echo "⚙️  Step 7: Setting up environment..."
# Copy production.env to .env.local only if .env.local doesn't exist
# This preserves any custom API keys that were set manually
if [ ! -f .env.local ]; then
cp production.env .env.local
    echo "✅ Environment file created from production.env"
    echo "⚠️  WARNING: GEMINI_API_KEY is set to placeholder value!"
    echo "⚠️  Please update .env.local with your actual Gemini API key:"
    echo "   nano .env.local"
    echo "   (Change GEMINI_API_KEY=your_gemini_api_key_here to your actual key)"
else
    echo "✅ .env.local already exists, preserving existing configuration"
    # Check if API key is still placeholder
    if grep -q "GEMINI_API_KEY=your_gemini_api_key_here" .env.local; then
        echo "⚠️  WARNING: GEMINI_API_KEY is still set to placeholder value!"
        echo "⚠️  Please update .env.local with your actual Gemini API key:"
        echo "   nano .env.local"
    else
        echo "✅ GEMINI_API_KEY appears to be configured"
    fi
fi

# Step 8: Make sure port 3000 is free
echo ""
echo "🔌 Step 8: Freeing port 3000..."
sudo kill -9 $(sudo lsof -t -i:3000) 2>/dev/null || true
sleep 2
if sudo lsof -i :3000 > /dev/null 2>&1; then
    echo "⚠️  Port 3000 still in use, force killing..."
    sudo fuser -k 3000/tcp 2>/dev/null || true
    sleep 2
fi
echo "✅ Port 3000 is free"

# Step 9: Start dev server on port 3000
echo ""
echo "▶️  Step 9: Starting dev server on port 3000..."

# Kill any existing dev server
pkill -f "npm run dev" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true
sleep 2

# Start dev server with explicit port
cd /home/ubuntu/aeroskop/aeroskop-smart-ai-storage-calculator
export PORT=3000
npm run dev > app.log 2>&1 &
DEV_PID=$!

echo "Dev server started with PID: $DEV_PID"

# Wait for startup
echo "⏳ Waiting 20 seconds for server to start..."
sleep 20

# Check if process is still running
if ! ps -p $DEV_PID > /dev/null 2>&1; then
    echo "❌ Dev server process died!"
    echo "📋 Checking logs..."
    tail -100 app.log
    echo ""
    echo "⚠️  Dev server failed to start. Check logs above."
    echo "Trying to start manually..."
    cd /home/ubuntu/aeroskop/aeroskop-smart-ai-storage-calculator
    PORT=3000 npm run dev > app.log 2>&1 &
    sleep 15
fi

# Step 10: Verify it's on port 3000
echo ""
echo "🧪 Step 10: Verifying dev server..."

# Check if process is running
if ps aux | grep -q "[n]pm run dev"; then
    echo "✅ Dev server process is running"
    ps aux | grep "[n]pm run dev" | grep -v grep
else
    echo "❌ Dev server process is NOT running"
    echo "📋 Checking logs..."
    tail -100 app.log
fi

# Check port
if sudo netstat -tlnp | grep -q ":3000"; then
    echo "✅ Port 3000 is listening"
    sudo netstat -tlnp | grep ":3000"
else
    echo "⚠️  Port 3000 is NOT listening"
    echo "📋 Checking what ports are in use..."
    sudo netstat -tlnp | grep -E ":(3000|3001|3002)"
    echo ""
    echo "📋 Recent logs:"
    tail -50 app.log
fi

# Test app response
echo ""
echo "🧪 Testing app response..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>&1 || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ App responding on port 3000 (HTTP $HTTP_CODE)"
else
    echo "⚠️  App response: HTTP $HTTP_CODE"
    echo "📋 Full curl output:"
    curl -v http://localhost:3000 2>&1 | head -20
    echo ""
    echo "📋 Recent logs:"
    tail -30 app.log
fi

# Step 11: Configure nginx
echo ""
echo "⚙️  Step 11: Configuring nginx..."
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

# Enable nginx site
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf /etc/nginx/sites-available/aeroskop-storage-calculator /etc/nginx/sites-enabled/

# Test nginx config
echo "🧪 Testing nginx configuration..."
if sudo nginx -t; then
    echo "✅ Nginx configuration is valid"
else
    echo "❌ Nginx configuration has errors!"
    exit 1
fi

# Restart nginx
echo "🔄 Restarting nginx..."
sudo systemctl restart nginx
sudo systemctl enable nginx
echo "✅ Nginx restarted"

# Step 12: Final verification
echo ""
echo "📊 Step 12: Final Verification"
echo "=========================================="
echo ""
echo "Dev server process:"
ps aux | grep "[n]pm run dev" | head -1 || echo "⚠️  Dev server process not found"
echo ""
echo "Port 3000 status:"
sudo netstat -tlnp | grep ":3000" || echo "⚠️  Port 3000 not listening"
echo ""
echo "Test port 3000:"
HTTP_3000=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 || echo "000")
echo "  HTTP $HTTP_3000"
echo ""
echo "Test port 80 (nginx):"
HTTP_80=$(curl -s -o /dev/null -w "%{http_code}" http://localhost || echo "000")
echo "  HTTP $HTTP_80"
echo ""
echo "Nginx status:"
sudo systemctl is-active nginx && echo "  ✅ Nginx is running" || echo "  ❌ Nginx is not running"
echo ""

# Summary
echo "=========================================="
echo ""
echo "📊 DIAGNOSTIC INFORMATION:"
echo "=========================="
echo ""
echo "Dev server process:"
ps aux | grep "[n]pm run dev" | grep -v grep || echo "  ❌ Not running"
echo ""
echo "Port 3000:"
sudo netstat -tlnp | grep ":3000" || echo "  ❌ Not listening"
echo ""
echo "Port 80 (nginx):"
sudo netstat -tlnp | grep ":80 " || echo "  ❌ Not listening"
echo ""
echo "Nginx status:"
sudo systemctl status nginx --no-pager | head -5
echo ""
echo "Recent app logs (last 30 lines):"
tail -30 app.log
echo ""

if [ "$HTTP_3000" = "200" ] && [ "$HTTP_80" = "200" ]; then
    echo "✅ SUCCESS! Everything is working!"
    echo ""
    echo "🌐 Your app is accessible on:"
    echo "   - Direct: http://$(curl -s ifconfig.me 2>/dev/null || echo 'YOUR_SERVER_IP'):3000"
    echo "   - Via Nginx: http://$(curl -s ifconfig.me 2>/dev/null || echo 'YOUR_SERVER_IP')"
else
    echo "⚠️  WARNING: Some checks failed"
    echo "   - Port 3000: HTTP $HTTP_3000"
    echo "   - Port 80: HTTP $HTTP_80"
    echo ""
    echo "🔍 TROUBLESHOOTING:"
    echo "   1. Check if dev server is running: ps aux | grep 'npm run dev'"
    echo "   2. Check logs: tail -f app.log"
    echo "   3. Check port 3000: sudo netstat -tlnp | grep 3000"
    echo "   4. Check nginx logs: sudo tail -f /var/log/nginx/error.log"
    echo "   5. Try starting manually: cd /home/ubuntu/aeroskop/aeroskop-smart-ai-storage-calculator && PORT=3000 npm run dev"
fi

echo ""
echo "📋 Useful Commands:"
echo "   View logs: tail -f app.log"
echo "   Restart: pkill -f 'npm run dev' && PORT=3000 npm run dev > app.log 2>&1 &"
echo "   Check status: ps aux | grep 'npm run dev'"
echo "   Check port: sudo netstat -tlnp | grep 3000"
echo ""
echo "⚠️  IMPORTANT: Clear your browser cache or use Incognito mode!"
echo ""

