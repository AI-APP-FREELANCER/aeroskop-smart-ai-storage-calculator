#!/bin/bash

echo "🚀 Starting Aeroskop deployment..."

# Navigate to application directory
cd /home/ubuntu/aeroskop-smart-ai-storage-calculator

# Pull latest changes from GitHub
echo "📥 Pulling latest changes from GitHub..."
git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building application..."
npm run build

# Copy production environment file
echo "⚙️ Setting up production environment..."
cp production.env .env.local

# Restart PM2 process
echo "🔄 Restarting application..."
pm2 restart aeroskop-storage-calculator

# Show status
echo "📊 Application status:"
pm2 status

echo "✅ Deployment completed successfully!"
echo "🌐 Application is running on: http://$(curl -s ifconfig.me):3000"
