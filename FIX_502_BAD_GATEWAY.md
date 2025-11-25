# Fix 502 Bad Gateway Error

## Problem
502 Bad Gateway means Nginx is running but can't connect to the Next.js server on port 3000.

## Diagnosis Steps

### Step 1: Check if Next.js server is running

```bash
# Check if Next.js process is running
ps aux | grep "next dev"
ps aux | grep "node.*next"

# Check if port 3000 is listening
sudo ss -tlnp | grep ":3000 "
```

### Step 2: Check server logs

```bash
cd /home/ubuntu/aeroskop/aeroskop-smart-ai-storage-calculator
tail -50 app.log
# Or if using PM2
pm2 logs aeroskop-app
```

### Step 3: Check Nginx error logs

```bash
sudo tail -50 /var/log/nginx/error.log
```

### Step 4: Test if server responds directly

```bash
# Test localhost
curl http://localhost:3000

# Test with verbose output
curl -v http://localhost:3000
```

## Solutions

### Solution 1: Start the Next.js server

If the server is not running:

```bash
cd /home/ubuntu/aeroskop/aeroskop-smart-ai-storage-calculator

# Start in background
npm run dev > app.log 2>&1 &

# Wait a few seconds
sleep 5

# Check if it's running
ps aux | grep "next dev"
curl http://localhost:3000
```

### Solution 2: Restart with PM2 (Recommended)

```bash
cd /home/ubuntu/aeroskop/aeroskop-smart-ai-storage-calculator

# Install PM2 if not installed
sudo npm install -g pm2

# Stop any existing PM2 processes
pm2 stop all
pm2 delete all

# Start the app
pm2 start npm --name "aeroskop-app" -- run dev

# Check status
pm2 status
pm2 logs aeroskop-app --lines 50
```

### Solution 3: Check for port conflicts

```bash
# See what's using port 3000
sudo ss -tlnp | grep ":3000 "

# If something else is using it, kill it
sudo fuser -k 3000/tcp
```

### Solution 4: Check Nginx configuration

```bash
# Test Nginx config
sudo nginx -t

# Check Nginx is pointing to correct port
sudo cat /etc/nginx/sites-available/aeroskop-storage-calculator | grep proxy_pass

# Should show: proxy_pass http://localhost:3000;
```

### Solution 5: Restart Nginx

```bash
sudo systemctl restart nginx
sudo systemctl status nginx
```

## Quick Fix Script

```bash
#!/bin/bash
# Quick fix for 502 Bad Gateway

echo "🔧 Fixing 502 Bad Gateway..."

# Kill any existing processes
sudo pkill -9 node
sudo fuser -k 3000/tcp 2>/dev/null || true

# Navigate to project
cd /home/ubuntu/aeroskop/aeroskop-smart-ai-storage-calculator

# Start server
echo "Starting Next.js server..."
npm run dev > app.log 2>&1 &

# Wait for server to start
echo "Waiting for server to start..."
sleep 10

# Check if server is running
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Server is running on port 3000"
else
    echo "❌ Server failed to start. Check app.log:"
    tail -30 app.log
    exit 1
fi

# Restart Nginx
echo "Restarting Nginx..."
sudo systemctl restart nginx

echo "✅ Done! Test your site now."
```

## Common Issues

1. **Server crashed**: Check `app.log` for errors
2. **Port conflict**: Another process using port 3000
3. **Build errors**: Run `npm run build` to check for compilation errors
4. **Memory issues**: Server might have run out of memory
5. **Database connection**: Check if database is accessible

