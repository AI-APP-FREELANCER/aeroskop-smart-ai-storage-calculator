#!/bin/bash
# Quick PM2 Setup and Start Script
# Run this after cloning the repository

set -e

echo "🚀 Aeroskop PM2 Quick Setup"
echo "============================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

PROJECT_DIR="$HOME/aeroskop/aeroskop"

# Navigate to project
cd "$PROJECT_DIR"

# Step 1: Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm install
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Step 2: Check .env.local
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}⚠️  .env.local not found${NC}"
    if [ -f "production.env" ]; then
        cp production.env .env.local
        echo -e "${GREEN}✅ Created .env.local from production.env${NC}"
        echo -e "${YELLOW}⚠️  Please edit .env.local with your actual credentials:${NC}"
        echo "   - DATABASE_URL"
        echo "   - GEMINI_API_KEY"
        echo ""
        read -p "Edit .env.local now? (y/n): " edit_env
        if [ "$edit_env" = "y" ] || [ "$edit_env" = "Y" ]; then
            nano .env.local
        fi
    else
        echo -e "${RED}❌ production.env not found. Please create .env.local manually.${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ .env.local exists${NC}"
fi
echo ""

# Step 3: Test database connection
echo -e "${BLUE}🔌 Testing database connection...${NC}"
if [ -f "test-do-db-connection.js" ]; then
    node test-do-db-connection.js
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Database connection successful${NC}"
    else
        echo -e "${YELLOW}⚠️  Database connection test failed. Please check your DATABASE_URL in .env.local${NC}"
        read -p "Continue anyway? (y/n): " continue_setup
        if [ "$continue_setup" != "y" ] && [ "$continue_setup" != "Y" ]; then
            exit 1
        fi
    fi
else
    echo -e "${YELLOW}⚠️  test-do-db-connection.js not found. Skipping database test.${NC}"
fi
echo ""

# Step 4: Build application
echo -e "${BLUE}🏗️  Building application...${NC}"
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build successful${NC}"
else
    echo -e "${RED}❌ Build failed. Please check the errors above.${NC}"
    exit 1
fi
echo ""

# Step 5: Install PM2
if ! command -v pm2 &> /dev/null; then
    echo -e "${BLUE}📥 Installing PM2...${NC}"
    npm install -g pm2
    echo -e "${GREEN}✅ PM2 installed${NC}"
else
    echo -e "${GREEN}✅ PM2 already installed${NC}"
fi
echo ""

# Step 6: Check if already running
if pm2 list | grep -q "aeroskop"; then
    echo -e "${YELLOW}⚠️  Application already running in PM2${NC}"
    read -p "Restart it? (y/n): " restart_app
    if [ "$restart_app" = "y" ] || [ "$restart_app" = "Y" ]; then
        pm2 restart aeroskop
        echo -e "${GREEN}✅ Application restarted${NC}"
    else
        echo -e "${BLUE}ℹ️  Keeping existing process${NC}"
    fi
else
    # Step 7: Start with PM2
    echo -e "${BLUE}🚀 Starting application with PM2...${NC}"
    pm2 start npm --name aeroskop -- run start
    pm2 save
    echo -e "${GREEN}✅ Application started with PM2${NC}"
fi
echo ""

# Step 8: Show status
echo -e "${BLUE}📊 Application Status:${NC}"
pm2 status
echo ""

# Step 9: Show logs
echo -e "${BLUE}📋 Recent logs (last 20 lines):${NC}"
pm2 logs aeroskop --lines 20 --nostream
echo ""

# Step 10: Setup startup (optional)
echo -e "${BLUE}⚙️  Setup PM2 to start on boot? (y/n)${NC}"
read -p "> " setup_startup
if [ "$setup_startup" = "y" ] || [ "$setup_startup" = "Y" ]; then
    echo ""
    echo -e "${YELLOW}Run this command (usually shown below):${NC}"
    pm2 startup
    echo ""
    echo -e "${YELLOW}Copy and run the command shown above, then run: pm2 save${NC}"
fi
echo ""

echo -e "${GREEN}════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════${NC}"
echo ""
echo "📊 View status: pm2 status"
echo "📋 View logs: pm2 logs aeroskop"
echo "🔄 Restart: pm2 restart aeroskop"
echo "🛑 Stop: pm2 stop aeroskop"
echo ""

