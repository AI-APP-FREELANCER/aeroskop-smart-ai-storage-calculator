#!/bin/bash
# Quick fix script to kill processes on port 3000 and start the server

echo "🔧 Quick Fix: Port 3000 Issue"
echo "=============================="
echo ""

# Kill all Node/Next.js processes
echo "🛑 Killing all Node/Next.js processes..."
sudo pkill -9 node 2>/dev/null || true
sudo pkill -9 -f "npm" 2>/dev/null || true
sudo pkill -9 -f "next" 2>/dev/null || true

# Kill process on port 3000 using ss
echo "🔌 Freeing port 3000..."
PID=$(sudo ss -tlnp 2>/dev/null | grep ":3000 " | awk '{print $6}' | cut -d',' -f2 | cut -d'=' -f2 | head -1)
if [ ! -z "$PID" ]; then
    echo "Found process $PID on port 3000, killing it..."
    sudo kill -9 $PID 2>/dev/null || true
fi

# Also try fuser
sudo fuser -k 3000/tcp 2>/dev/null || true

sleep 2

# Verify port is free
echo "✅ Verifying port 3000 is free..."
if sudo ss -tlnp | grep -q ":3000 "; then
    echo "⚠️  Port 3000 is still in use!"
    sudo ss -tlnp | grep ":3000 "
    exit 1
else
    echo "✅ Port 3000 is free"
fi

# Navigate to project directory
cd /home/ubuntu/aeroskop/aeroskop-smart-ai-storage-calculator || exit 1

# Start the server
echo ""
echo "▶️  Starting Next.js server..."
npm run dev > app.log 2>&1 &
SERVER_PID=$!

sleep 5

# Check if server started
if ps -p $SERVER_PID > /dev/null; then
    echo "✅ Server started with PID: $SERVER_PID"
    echo "📋 Logs: tail -f app.log"
    echo "🌐 Test: curl http://localhost:3000"
else
    echo "❌ Server failed to start. Check app.log for errors:"
    tail -20 app.log
    exit 1
fi

