#!/bin/bash
# Complete fresh deployment script - clears all caches and rebuilds

echo "🚀 Starting Fresh Deployment..."

# Navigate to project
cd /home/ubuntu/aeroskop/aeroskop-smart-ai-storage-calculator

# Step 1: Pull latest code
echo "📥 Pulling latest code from GitHub..."
git fetch origin
git reset --hard origin/main
git pull origin main

# Step 2: Stop PM2 process
echo "🛑 Stopping PM2 process..."
npx pm2 delete aeroskop-storage-calculator 2>/dev/null || true
npx pm2 kill 2>/dev/null || true

# Step 3: Kill port 3000
echo "🛑 Freeing port 3000..."
sudo kill -9 $(sudo lsof -t -i:3000) 2>/dev/null || true
sleep 2

# Step 4: Clear ALL caches
echo "🧹 Clearing all caches..."

# Clear Next.js build cache
rm -rf .next
rm -rf .next/cache
rm -rf out

# Clear npm cache
npm cache clean --force
rm -rf ~/.npm
rm -rf node_modules/.cache

# Clear node_modules and reinstall
echo "📦 Removing node_modules for fresh install..."
rm -rf node_modules
rm -rf package-lock.json

# Clear nginx cache
echo "🧹 Clearing nginx cache..."
sudo rm -rf /var/cache/nginx/*
sudo rm -rf /var/lib/nginx/cache/*

# Clear system caches
sudo apt clean
sudo apt autoclean

# Step 5: Fresh install dependencies
echo "📦 Installing dependencies..."
npm install

# Step 6: Setup environment
echo "⚙️ Setting up environment..."
cp production.env .env.local

# Step 7: Fresh build
echo "🔨 Building application (fresh build)..."
npm run build

# Verify build
if [ ! -d ".next" ]; then
    echo "❌ Build failed! Check errors above."
    exit 1
fi

echo "✅ Build completed successfully!"

# Step 8: Start PM2
echo "▶️ Starting application with PM2..."
npx pm2 start ecosystem.config.js

# Wait for app to start
sleep 5

# Step 9: Verify PM2 is running
echo "📊 Checking PM2 status..."
npx pm2 status

# Step 10: Test port 3000
echo "🧪 Testing port 3000..."
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Application is responding on port 3000"
else
    echo "❌ Application not responding on port 3000"
    echo "Check logs: npx pm2 logs aeroskop-storage-calculator --err"
fi

# Step 11: Restart nginx
echo "🔄 Restarting nginx..."
sudo systemctl stop nginx
sleep 2
sudo rm -rf /var/cache/nginx/*
sudo systemctl start nginx
sudo systemctl reload nginx

# Step 12: Save PM2 config
echo "💾 Saving PM2 configuration..."
npx pm2 save

# Step 13: Final verification
echo ""
echo "📊 Final Status:"
echo "=================="
npx pm2 status
echo ""
echo "🌐 Testing connections:"
echo "Port 3000: $(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000)"
echo "Port 80 (nginx): $(curl -s -o /dev/null -w '%{http_code}' http://localhost)"
echo ""
echo "✅ Fresh deployment complete!"
echo "🌐 Application should be accessible with latest code"

