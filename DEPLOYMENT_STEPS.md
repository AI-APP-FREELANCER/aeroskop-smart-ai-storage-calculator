# Deployment Steps for Ubuntu VM

## Step 1: On Your Local Windows Machine

### 1.1 Check current changes
```bash
git status
```

### 1.2 Stage the changes
```bash
git add src/lib/pdfGenerator.ts
```

### 1.3 Commit the changes
```bash
git commit -m "Fix: Add missing generateEnhancedPDFReport function to pdfGenerator"
```

### 1.4 Push to GitHub
```bash
git push origin main
```
(Replace `main` with your branch name if different, e.g., `master` or `develop`)

---

## Step 2: On Your Ubuntu VM (SSH into it)

### 2.1 SSH into your VM
```bash
ssh ubuntu@your-vm-ip-address
```
(Replace `your-vm-ip-address` with your actual VM IP or hostname)

### 2.2 Navigate to your project directory
```bash
cd /home/ubuntu/aeroskop/aeroskop-smart-ai-storage-calculator
```

### 2.3 Pull the latest changes from GitHub
```bash
git pull origin main
```
(Replace `main` with your branch name if different)

### 2.4 Verify the changes were pulled
```bash
git log -1
```
This should show your recent commit.

### 2.5 Check if the file was updated
```bash
grep -n "generateEnhancedPDFReport" src/lib/pdfGenerator.ts
```
This should show the function definition.

---

## Step 3: Restart the Application

### Option A: Using the Nuclear Clean Restart Script (Recommended)
```bash
cd /home/ubuntu/aeroskop/aeroskop-smart-ai-storage-calculator
bash nuclear-clean-restart.sh
```

### Option B: Manual Restart (If script doesn't work)

#### 3.1 Stop the current application
```bash
# Kill all Node processes
pkill -9 -f "npm"
pkill -9 -f "next"
pkill -9 -f "node.*next"
sudo killall -9 node 2>/dev/null || true
sudo kill -9 $(sudo lsof -t -i:3000) 2>/dev/null || true
```

#### 3.2 Install dependencies (if needed)
```bash
npm install
```

#### 3.3 Build the application
```bash
npm run build
```

#### 3.4 Start the application
```bash
# If using PM2
pm2 restart all
# OR
pm2 start npm --name "aeroskop-app" -- start

# If using npm directly
npm start
# OR for development
npm run dev
```

---

## Step 4: Verify the Fix

### 4.1 Check if the application is running
```bash
curl http://localhost:3000
# OR
curl http://your-vm-ip:3000
```

### 4.2 Check the browser console
- Open your application in a browser
- Open Developer Tools (F12)
- Check the Console tab - the error about `generateEnhancedPDFReport` should be gone
- The page should load without blank screen

### 4.3 Test the Enhanced Calculator page
- Navigate to `/enhanced-calculator`
- The page should load correctly
- Try exporting a PDF report to verify the function works

---

## Troubleshooting

### If git pull fails with conflicts:
```bash
# Stash local changes (if any)
git stash

# Pull again
git pull origin main

# Apply stashed changes if needed
git stash pop
```

### If the application still shows errors:
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules
npm install

# Rebuild
npm run build

# Restart
npm start
```

### If port 3000 is still in use:
```bash
# Find what's using port 3000
sudo lsof -i :3000

# Kill the process
sudo kill -9 <PID>
```

### Check application logs:
```bash
# If using PM2
pm2 logs

# If using npm directly, check the terminal output
```

---

## Quick One-Liner (After SSH into VM)
```bash
cd /home/ubuntu/aeroskop/aeroskop-smart-ai-storage-calculator && git pull origin main && bash nuclear-clean-restart.sh
```

