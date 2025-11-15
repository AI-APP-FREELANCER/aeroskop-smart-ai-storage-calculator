# Clear Cache and Restart Instructions

## All Changes Are Confirmed in Code

All changes ARE implemented in `src/components/EnhancedUnifiedAICalculator.tsx`. If you're not seeing them, it's a caching issue.

## Steps to Fix

### Option 1: Quick Fix (Recommended)
1. **Stop the dev server** (Ctrl+C in terminal)
2. **Delete `.next` folder**: `rm -rf .next` (Linux/Mac) or `Remove-Item -Recurse -Force .next` (Windows PowerShell)
3. **Restart dev server**: `npm run dev`
4. **Hard refresh browser**: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

### Option 2: Full Clean Restart
1. Stop dev server
2. Delete `.next` folder
3. Delete `node_modules/.cache` if it exists
4. Run `npm run dev`
5. Hard refresh browser

### Option 3: Verify You're on Correct Route
- Make sure you're visiting: `http://localhost:3000/unified-calculator`
- NOT any other route

## What to Look For After Restart

1. **Resolution Dropdown**: Should show "720p (0.92 MP)", "1080p (2.07 MP)", etc.
2. **Recording Mode Lock**: When Motion Activity slider is at 90%+, you should see:
   - 🔒 Locked badge
   - Dropdown disabled (grayed out)
   - Cannot open dropdown
3. **Storage Analysis Result**: After calculating, you should see:
   - "Storage Analysis Result" heading
   - "Total Usable Capacity" (GB if < 1 TB, TB if >= 1 TB)
   - "Daily Storage Capacity" (ALWAYS in GB)
   - "Bitrate Per Camera" (Mbps)
   - "Total Bit Rate" (Mbps)

## Verification Commands

Run these to verify the file has changes:
```bash
# Check for Recording Mode lock
grep -n "Locked" src/components/EnhancedUnifiedAICalculator.tsx

# Check for MP values
grep -n "0.92 MP\|2.07 MP\|8.29 MP" src/components/EnhancedUnifiedAICalculator.tsx

# Check for Storage Analysis Result
grep -n "Storage Analysis Result" src/components/EnhancedUnifiedAICalculator.tsx
```

