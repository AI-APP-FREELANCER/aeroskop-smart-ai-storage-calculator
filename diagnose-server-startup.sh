#!/bin/bash
# Diagnose why Next.js server won't start

echo "🔍 Diagnosing Server Startup Issue"
echo "===================================="
echo ""

cd /home/ubuntu/aeroskop/aeroskop-smart-ai-storage-calculator || exit 1

echo "📋 Step 1: Check app.log for errors..."
echo "----------------------------------------"
if [ -f app.log ]; then
    echo "Last 50 lines of app.log:"
    tail -50 app.log
else
    echo "⚠️  app.log not found"
fi

echo ""
echo "📋 Step 2: Check if .env.local exists..."
echo "----------------------------------------"
if [ -f .env.local ]; then
    echo "✅ .env.local exists"
    echo "Checking GEMINI_API_KEY:"
    if grep -q "GEMINI_API_KEY=" .env.local; then
        if grep -q "GEMINI_API_KEY=your_gemini_api_key_here" .env.local; then
            echo "⚠️  WARNING: GEMINI_API_KEY is still set to placeholder!"
        else
            echo "✅ GEMINI_API_KEY appears to be configured"
        fi
    else
        echo "❌ GEMINI_API_KEY not found in .env.local"
    fi
else
    echo "❌ .env.local does NOT exist"
    if [ -f production.env ]; then
        echo "Creating .env.local from production.env..."
        cp production.env .env.local
    fi
fi

echo ""
echo "📋 Step 3: Check Node.js and npm versions..."
echo "----------------------------------------"
node --version
npm --version

echo ""
echo "📋 Step 4: Check if node_modules exists..."
echo "----------------------------------------"
if [ -d node_modules ]; then
    echo "✅ node_modules exists"
else
    echo "❌ node_modules does NOT exist - need to run npm install"
fi

echo ""
echo "📋 Step 5: Try building the project..."
echo "----------------------------------------"
echo "Running: npm run build"
npm run build 2>&1 | tail -30

echo ""
echo "📋 Step 6: Try starting server in foreground (will show errors)..."
echo "----------------------------------------"
echo "Starting server (will timeout after 10 seconds)..."
timeout 10 npm run dev 2>&1 || echo "Server startup timed out or failed"

echo ""
echo "===================================="
echo "📊 Summary"
echo "===================================="
echo "Check the errors above to identify the issue."

