# Fix Server Startup Issues

## Problem
Next.js server exits with code 1 and won't start.

## Diagnostic Steps

### Step 1: Check the error logs

```bash
cd /home/ubuntu/aeroskop/aeroskop-smart-ai-storage-calculator
tail -100 app.log
```

### Step 2: Check for common issues

```bash
# Check if .env.local exists
ls -la .env.local

# Check if GEMINI_API_KEY is set
grep GEMINI_API_KEY .env.local

# Check if node_modules exists
ls -la node_modules | head -5

# Check Node.js version
node --version
```

### Step 3: Try building first

```bash
cd /home/ubuntu/aeroskop/aeroskop-smart-ai-storage-calculator
npm run build
```

This will show any compilation errors.

### Step 4: Start server in foreground to see errors

```bash
cd /home/ubuntu/aeroskop/aeroskop-smart-ai-storage-calculator
npm run dev
```

Don't run in background - let it show errors directly.

## Common Issues and Fixes

### Issue 1: Missing .env.local

```bash
cd /home/ubuntu/aeroskop/aeroskop-smart-ai-storage-calculator
if [ ! -f .env.local ]; then
    cp production.env .env.local
    echo "⚠️  Please update GEMINI_API_KEY in .env.local"
    nano .env.local
fi
```

### Issue 2: Missing node_modules

```bash
cd /home/ubuntu/aeroskop/aeroskop-smart-ai-storage-calculator
npm install
```

### Issue 3: Build errors

```bash
cd /home/ubuntu/aeroskop/aeroskop-smart-ai-storage-calculator
npm run build
# Fix any errors shown
```

### Issue 4: Port already in use

```bash
sudo ss -tlnp | grep ":3000 "
sudo fuser -k 3000/tcp
```

### Issue 5: Memory issues

```bash
# Check available memory
free -h

# If low, try increasing Node.js memory
export NODE_OPTIONS="--max-old-space-size=4096"
npm run dev
```

## Complete Fix Script

```bash
#!/bin/bash
cd /home/ubuntu/aeroskop/aeroskop-smart-ai-storage-calculator

# 1. Ensure .env.local exists
if [ ! -f .env.local ]; then
    echo "Creating .env.local..."
    cp production.env .env.local
fi

# 2. Install dependencies if needed
if [ ! -d node_modules ]; then
    echo "Installing dependencies..."
    npm install
fi

# 3. Build the project
echo "Building project..."
npm run build

# 4. Kill any existing processes
sudo pkill -9 node
sudo fuser -k 3000/tcp
sleep 2

# 5. Start server in foreground to see errors
echo "Starting server (press Ctrl+C to stop)..."
npm run dev
```

