# Deployment Instructions

## Step 1: Push Changes to GitHub (Run on Local Machine)

Open PowerShell or Terminal in your project directory and run:

```powershell
# Check current status
git status

# Add all changes
git add .

# Commit changes with a descriptive message
git commit -m "Add Aeroskop product recommendations, remove system recommendations, fix product duplication"

# Push to GitHub
git push origin main
```

**Note:** If you're on a different branch, replace `main` with your branch name (e.g., `git push origin master` or `git push origin your-branch-name`)

---

## Step 2: Restart App on Ubuntu VM

SSH into your Ubuntu VM, then run these commands:

```bash
# Navigate to the project directory
cd /home/ubuntu/aeroskop/aeroskop-smart-ai-storage-calculator

# Kill any running Node/Next.js processes
pkill -9 -f "npm" 2>/dev/null || true
pkill -9 -f "next" 2>/dev/null || true
sudo killall -9 node 2>/dev/null || true
sudo kill -9 $(sudo lsof -t -i:3000) 2>/dev/null || true

# Fetch latest changes from GitHub
git fetch origin

# Reset to match remote (discards local changes)
git reset --hard origin/main

# Clean untracked files
git clean -fd

# Pull latest code
git pull origin main

# Install/update dependencies
npm install

# Copy production environment file
cp production.env .env.local

# Set port
export PORT=3000

# Start the dev server in background
npm run dev > app.log 2>&1 &

# Restart Nginx
sudo systemctl restart nginx

# Verify the app is running
sleep 3
curl http://localhost:3000 || echo "App may still be starting..."
```

---

## Alternative: Use the Existing Script (If Available)

If the `nuclear-clean-restart.sh` script exists on the VM, you can simply run:

```bash
cd /home/ubuntu/aeroskop/aeroskop-smart-ai-storage-calculator
bash nuclear-clean-restart.sh
```

---

## Verify Deployment

After restarting, check:

1. **Check if app is running:**
   ```bash
   ps aux | grep "npm run dev"
   ```

2. **Check app logs:**
   ```bash
   tail -f app.log
   ```

3. **Test the application:**
   - Open browser and go to: `http://your-vm-ip:3000/unified-calculator`
   - Test the calculator and verify product recommendations appear

4. **Check Nginx status:**
   ```bash
   sudo systemctl status nginx
   ```

---

## Troubleshooting

If the app doesn't start:

1. **Check for port conflicts:**
   ```bash
   sudo lsof -i :3000
   ```

2. **Check Node.js version:**
   ```bash
   node --version
   npm --version
   ```

3. **Check environment variables:**
   ```bash
   cat .env.local | grep -v "PASSWORD\|SECRET\|KEY"  # Don't show sensitive data
   ```

4. **View full error logs:**
   ```bash
   cat app.log
   ```

---

## Quick Reference

**Local Machine (Windows PowerShell):**
```powershell
git add .
git commit -m "Your commit message"
git push origin main
```

**Ubuntu VM (SSH):**
```bash
cd /home/ubuntu/aeroskop/aeroskop-smart-ai-storage-calculator
pkill -9 -f "npm"; pkill -9 -f "next"; sudo killall -9 node
git fetch origin && git reset --hard origin/main && git pull origin main
npm install && cp production.env .env.local
export PORT=3000 && npm run dev > app.log 2>&1 &
sudo systemctl restart nginx
```

