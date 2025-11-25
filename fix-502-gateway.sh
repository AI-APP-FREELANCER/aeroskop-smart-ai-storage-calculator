#!/bin/bash
# Fix 502 Bad Gateway Error

echo "🔧 Fixing 502 Bad Gateway Error"
echo "================================"
echo ""

# Step 1: Check current status
echo "📊 Step 1: Checking current status..."
echo ""

echo "Checking if Next.js server is running:"
if ps aux | grep -q "[n]ext dev"; then
    echo "✅ Next.js server process found"
    ps aux | grep "[n]ext dev" | head -2
else
    echo "❌ Next.js server is NOT running"
fi

echo ""
echo "Checking port 3000:"
if sudo ss -tlnp | grep -q ":3000 "; then
    echo "✅ Port 3000 is listening"
    sudo ss -tlnp | grep ":3000 "
else
    echo "❌ Port 3000 is NOT listening"
fi

echo ""
echo "Testing server response:"
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200\|404"; then
    echo "✅ Server responds on localhost:3000"
else
    echo "❌ Server does NOT respond on localhost:3000"
fi

echo ""
echo "Checking Nginx status:"
sudo systemctl status nginx --no-pager | head -5

echo ""
echo "Checking Nginx error logs (last 10 lines):"
sudo tail -10 /var/log/nginx/error.log

echo ""
echo "Checking app.log (last 20 lines):"
cd /home/ubuntu/aeroskop/aeroskop-smart-ai-storage-calculator
if [ -f app.log ]; then
    tail -20 app.log
else
    echo "⚠️  app.log not found"
fi

echo ""
echo "================================"
echo "🔧 Step 2: Fixing the issue..."
echo ""

# Kill all existing processes
echo "🛑 Killing all Node/Next.js processes..."
sudo pkill -9 node 2>/dev/null || true
sudo pkill -9 -f "npm" 2>/dev/null || true
sudo pkill -9 -f "next" 2>/dev/null || true
sudo fuser -k 3000/tcp 2>/dev/null || true
sleep 2

# Navigate to project
cd /home/ubuntu/aeroskop/aeroskop-smart-ai-storage-calculator || exit 1

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "⚠️  .env.local not found, creating from production.env..."
    if [ -f production.env ]; then
        cp production.env .env.local
    fi
fi

# Start the server
echo "▶️  Starting Next.js server..."
export PORT=3000
npm run dev > app.log 2>&1 &
SERVER_PID=$!

echo "Server started with PID: $SERVER_PID"

# Wait for server to start
echo "⏳ Waiting 15 seconds for server to start..."
sleep 15

# Check if process is still running
if ! ps -p $SERVER_PID > /dev/null 2>&1; then
    echo "❌ Server process died! Checking logs..."
    tail -50 app.log
    echo ""
    echo "⚠️  Server failed to start. Common issues:"
    echo "   1. Check app.log for errors"
    echo "   2. Check if port 3000 is available"
    echo "   3. Check if .env.local has correct GEMINI_API_KEY"
    exit 1
fi

# Test server
echo ""
echo "🧪 Testing server..."
for i in {1..5}; do
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo "✅ Server is responding!"
        break
    else
        echo "⏳ Attempt $i/5: Waiting for server..."
        sleep 3
    fi
done

# Final check
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo ""
    echo "✅ Server is running and responding!"
    echo ""
    echo "🔄 Restarting Nginx..."
    sudo systemctl restart nginx
    sleep 2
    
    echo ""
    echo "✅ Done! Your site should be working now."
    echo ""
    echo "📋 Useful commands:"
    echo "   View logs: tail -f app.log"
    echo "   Check status: ps aux | grep 'next dev'"
    echo "   Test server: curl http://localhost:3000"
    echo "   Test site: curl http://localhost"
else
    echo ""
    echo "❌ Server is not responding. Check logs:"
    tail -50 app.log
    exit 1
fi

