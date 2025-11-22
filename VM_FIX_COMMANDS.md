# Step-by-Step Commands to Fix Gemini API Key on VM

## Prerequisites
- You should already be SSH'd into your VM
- Have your Gemini API key ready (starts with `AIza...`)

---

## Step 1: Navigate to Project Directory
```bash
cd /home/ubuntu/aeroskop/aeroskop-smart-ai-storage-calculator
```

---

## Step 2: Check Current .env.local Status
```bash
cat .env.local | grep GEMINI_API_KEY
```

**Expected output:** You'll see either:
- `GEMINI_API_KEY=your_gemini_api_key_here` (placeholder - needs fixing)
- `GEMINI_API_KEY=AIza...` (already set - might be wrong key)

---

## Step 3: Edit .env.local File
```bash
nano .env.local
```

**What to do in nano editor:**
1. Use arrow keys to find the line: `GEMINI_API_KEY=your_gemini_api_key_here`
2. Delete everything after the `=` sign
3. Type your actual Gemini API key (should start with `AIza...`)
4. Press `Ctrl + X` to exit
5. Press `Y` to confirm save
6. Press `Enter` to confirm filename

---

## Step 4: Verify API Key Was Saved Correctly
```bash
cat .env.local | grep GEMINI_API_KEY
```

**Expected output:** Should show your actual API key (starts with `AIza...`)

---

## Step 5: Stop Current Dev Server
```bash
pkill -f "npm run dev"
```

Wait 2 seconds, then verify it's stopped:
```bash
ps aux | grep "npm run dev" | grep -v grep
```

**Expected output:** Should be empty (no process found)

---

## Step 6: Start Dev Server with New Environment
```bash
cd /home/ubuntu/aeroskop/aeroskop-smart-ai-storage-calculator
PORT=3000 npm run dev > app.log 2>&1 &
```

---

## Step 7: Wait for Server to Start
```bash
sleep 15
```

---

## Step 8: Verify Server is Running
```bash
ps aux | grep "npm run dev" | grep -v grep
```

**Expected output:** Should show a process running

---

## Step 9: Check Server Logs for Errors
```bash
tail -50 app.log
```

**Look for:**
- ✅ `✅ Gemini API key is configured` (good!)
- ❌ `⚠️ GEMINI_API_KEY environment variable is not set` (bad - key not loaded)
- ❌ `API key not valid` (bad - wrong key)

---

## Step 10: Test if Server is Responding
```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
```

**Expected output:** `200` (server is working)

---

## Step 11: Test Gemini API (Optional - Check if Key Works)
```bash
curl -s http://localhost:3000/api/gemini-chat -X POST -H "Content-Type: application/json" -d '{"prompt":"test"}' | head -20
```

**Expected output:** Should return JSON with `"response": "API is working! Gemini integration is functional."`

---

## Troubleshooting

### If Step 9 shows "API key not valid":
1. Double-check your API key in Step 3
2. Make sure there are no extra spaces
3. Make sure the key starts with `AIza`

### If server doesn't start:
```bash
tail -100 app.log
```
Look for error messages

### If you need to restart from scratch:
```bash
cd /home/ubuntu/aeroskop/aeroskop-smart-ai-storage-calculator
bash nuclear-clean-restart.sh
```
Then repeat Steps 3-11

---

## Success Indicators

✅ Server is running (Step 8 shows process)
✅ Server responds with HTTP 200 (Step 10)
✅ Logs show "Gemini API key is configured" (Step 9)
✅ Chat feature works in the web app

---

## Next Steps After Fix

Once everything is working:
1. Test the chat feature in your web browser
2. Test the storage calculator
3. The API key will be preserved on future restarts (thanks to the updated script)

