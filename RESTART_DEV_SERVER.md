# How to Restart Dev Server to See Changes

## ✅ All Changes Are Confirmed in Code
- Recording Mode Lock (lines 801-848)
- Resolution MP Values (lines 651-654)  
- Storage Analysis Result (lines 1094-1128)

## Steps to See Changes

### Step 1: Stop the Dev Server
1. Find the terminal window running `npm run dev`
2. Press `Ctrl+C` to stop it
3. Wait until it says "Terminated" or the prompt returns

### Step 2: Clear Any Cache (Optional but Recommended)
```powershell
# If .next exists, delete it
if (Test-Path .next) { Remove-Item -Recurse -Force .next }

# Clear Turbopack cache
if (Test-Path ".turbo") { Remove-Item -Recurse -Force .turbo }
```

### Step 3: Restart Dev Server
```powershell
npm run dev
```

### Step 4: Hard Refresh Browser
1. Open `http://localhost:3000/unified-calculator`
2. Press `Ctrl+Shift+R` (or `Ctrl+F5`) to hard refresh
3. Or open DevTools (F12) → Right-click refresh button → "Empty Cache and Hard Reload"

## What to Check After Restart

1. **Resolution Dropdown**: Should show "720p (0.92 MP)", "1080p (2.07 MP)", etc.
2. **Recording Mode**: 
   - Move Motion Activity slider to 90% or above
   - Should see 🔒 Locked badge
   - Dropdown should be grayed out and disabled
3. **After Calculation**: Should see "Storage Analysis Result" section with 4 cards

## If Still Not Working

1. Check browser console (F12) for errors
2. Verify you're on `/unified-calculator` route (not `/calculator` or other)
3. Try incognito/private window
4. Check if multiple dev servers are running on different ports

