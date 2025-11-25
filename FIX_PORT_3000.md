# Fix Port 3000 Issue on Ubuntu VM

## Problem
Port 3000 is already in use, preventing the Next.js server from starting.

## Solution Steps

### Step 1: Find what's using port 3000

```bash
# Option 1: Using lsof (if available)
sudo lsof -i :3000

# Option 2: Using ss (usually available on Ubuntu)
sudo ss -tlnp | grep :3000

# Option 3: Using fuser
sudo fuser 3000/tcp
```

### Step 2: Kill the process

Once you find the PID (process ID), kill it:

```bash
# Replace <PID> with the actual process ID from Step 1
sudo kill -9 <PID>

# Or if multiple processes, kill all Node processes
sudo pkill -9 node
sudo pkill -9 -f "next"
sudo pkill -9 -f "npm"
```

### Step 3: Verify port is free

```bash
sudo ss -tlnp | grep :3000
# Should return nothing if port is free
```

### Step 4: Start the server manually

```bash
cd /home/ubuntu/aeroskop/aeroskop-smart-ai-storage-calculator
npm run dev > app.log 2>&1 &
```

### Step 5: Verify server is running

```bash
# Check if process is running
ps aux | grep "next dev"

# Check if port 3000 is listening
sudo ss -tlnp | grep :3000

# Test the server
curl http://localhost:3000
```

## Alternative: Use PM2 (Recommended for Production)

If you want a more robust solution:

```bash
# Install PM2 globally
sudo npm install -g pm2

# Start the app with PM2
cd /home/ubuntu/aeroskop/aeroskop-smart-ai-storage-calculator
pm2 start npm --name "aeroskop-app" -- start

# Or for dev mode
pm2 start npm --name "aeroskop-app" -- run dev

# Check status
pm2 status

# View logs
pm2 logs aeroskop-app

# Restart
pm2 restart aeroskop-app

# Stop
pm2 stop aeroskop-app
```

## Quick One-Liner Fix

```bash
sudo pkill -9 node && sudo pkill -9 -f "next" && sudo pkill -9 -f "npm" && sleep 2 && cd /home/ubuntu/aeroskop/aeroskop-smart-ai-storage-calculator && npm run dev > app.log 2>&1 &
```

