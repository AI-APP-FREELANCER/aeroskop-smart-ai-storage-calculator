#!/bin/bash

# Diagnostic Script - Find out why the app isn't running

echo "🔍 DIAGNOSTIC SCRIPT"
echo "===================="
echo ""

cd /home/ubuntu/aeroskop/aeroskop-smart-ai-storage-calculator

# Check 1: Is dev server process running?
echo "1️⃣  Checking if dev server process is running..."
if ps aux | grep -q "[n]pm run dev"; then
    echo "   ✅ Dev server process is running"
    ps aux | grep "[n]pm run dev" | grep -v grep
else
    echo "   ❌ Dev server process is NOT running"
fi
echo ""

# Check 2: Is port 3000 listening?
echo "2️⃣  Checking if port 3000 is listening..."
if sudo netstat -tlnp | grep -q ":3000"; then
    echo "   ✅ Port 3000 is listening"
    sudo netstat -tlnp | grep ":3000"
else
    echo "   ❌ Port 3000 is NOT listening"
    echo "   Checking what ports are in use..."
    sudo netstat -tlnp | grep -E ":(3000|3001|3002|3003)"
fi
echo ""

# Check 3: Can we connect to port 3000?
echo "3️⃣  Testing connection to port 3000..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>&1 || echo "ERROR")
if [ "$HTTP_CODE" = "200" ]; then
    echo "   ✅ Port 3000 is responding (HTTP $HTTP_CODE)"
else
    echo "   ❌ Port 3000 is NOT responding (HTTP $HTTP_CODE)"
    echo "   Full curl output:"
    curl -v http://localhost:3000 2>&1 | head -10
fi
echo ""

# Check 4: Check app logs
echo "4️⃣  Checking app logs..."
if [ -f "app.log" ]; then
    echo "   Last 50 lines of app.log:"
    tail -50 app.log
else
    echo "   ❌ app.log file not found"
fi
echo ""

# Check 5: Check nginx status
echo "5️⃣  Checking nginx status..."
if sudo systemctl is-active --quiet nginx; then
    echo "   ✅ Nginx is running"
else
    echo "   ❌ Nginx is NOT running"
fi
echo "   Nginx status:"
sudo systemctl status nginx --no-pager | head -10
echo ""

# Check 6: Check nginx config
echo "6️⃣  Checking nginx configuration..."
if sudo nginx -t 2>&1; then
    echo "   ✅ Nginx config is valid"
else
    echo "   ❌ Nginx config has errors"
fi
echo ""

# Check 7: Check nginx proxy target
echo "7️⃣  Checking nginx proxy configuration..."
if [ -f "/etc/nginx/sites-available/aeroskop-storage-calculator" ]; then
    echo "   Nginx config file exists"
    echo "   Proxy target:"
    grep "proxy_pass" /etc/nginx/sites-available/aeroskop-storage-calculator
else
    echo "   ❌ Nginx config file not found"
fi
echo ""

# Check 8: Test nginx proxy
echo "8️⃣  Testing nginx proxy..."
HTTP_NGINX=$(curl -s -o /dev/null -w "%{http_code}" http://localhost 2>&1 || echo "ERROR")
if [ "$HTTP_NGINX" = "200" ]; then
    echo "   ✅ Nginx proxy is working (HTTP $HTTP_NGINX)"
else
    echo "   ❌ Nginx proxy is NOT working (HTTP $HTTP_NGINX)"
    echo "   Checking nginx error logs:"
    sudo tail -20 /var/log/nginx/error.log
fi
echo ""

# Check 9: Check environment
echo "9️⃣  Checking environment..."
echo "   Current directory: $(pwd)"
echo "   Node version: $(node --version 2>/dev/null || echo 'NOT FOUND')"
echo "   NPM version: $(npm --version 2>/dev/null || echo 'NOT FOUND')"
echo "   .env.local exists: $([ -f .env.local ] && echo 'YES' || echo 'NO')"
echo ""

# Check 10: Check if code is latest
echo "🔟 Checking git status..."
echo "   Latest commit:"
git log -1 --oneline 2>/dev/null || echo "   ❌ Not a git repository or git error"
echo "   Git status:"
git status --short 2>/dev/null || echo "   ❌ Git error"
echo ""

# Summary
echo "=========================================="
echo "📊 SUMMARY"
echo "=========================================="
echo ""
echo "If dev server is not running, try:"
echo "  cd /home/ubuntu/aeroskop/aeroskop-smart-ai-storage-calculator"
echo "  PORT=3000 npm run dev > app.log 2>&1 &"
echo ""
echo "If port 3000 is not listening, check logs:"
echo "  tail -f app.log"
echo ""
echo "If nginx is not working, check:"
echo "  sudo tail -f /var/log/nginx/error.log"
echo "  sudo nginx -t"
echo ""

