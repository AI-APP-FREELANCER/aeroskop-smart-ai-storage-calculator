# Setting Up Gemini API Key on VM

## Problem
The `production.env` file contains a placeholder API key (`your_gemini_api_key_here`). When the nuclear restart script runs, it copies this to `.env.local`, causing the "API key not valid" error.

## Solution: Set API Key on VM

### Option 1: Edit .env.local directly on VM (Recommended)

1. SSH into your VM
2. Navigate to the project directory:
   ```bash
   cd /home/ubuntu/aeroskop/aeroskop-smart-ai-storage-calculator
   ```

3. Edit the `.env.local` file:
   ```bash
   nano .env.local
   ```

4. Find the line:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

5. Replace it with your actual Gemini API key:
   ```
   GEMINI_API_KEY=AIzaSy...your_actual_key_here
   ```

6. Save and exit (Ctrl+X, then Y, then Enter)

7. Restart the dev server:
   ```bash
   pkill -f "npm run dev"
   PORT=3000 npm run dev > app.log 2>&1 &
   ```

### Option 2: Update production.env (will be overwritten on next pull)

If you want to update `production.env` (not recommended as it will be overwritten):

```bash
cd /home/ubuntu/aeroskop/aeroskop-smart-ai-storage-calculator
nano production.env
# Update GEMINI_API_KEY line
cp production.env .env.local
```

### Option 3: Set as environment variable (alternative)

You can also set it as a system environment variable, but `.env.local` is easier for Next.js.

## Verify It's Working

After setting the API key, test it:

1. Check if the key is loaded:
   ```bash
   grep GEMINI_API_KEY .env.local
   ```

2. Restart the server and check logs:
   ```bash
   tail -f app.log
   ```

3. Try using the chat feature in the app - it should work now!

## Important Notes

- **Never commit your actual API key to GitHub!** The `.env.local` file should be in `.gitignore` (which it should be).
- The updated `nuclear-clean-restart.sh` script now preserves your `.env.local` file if it exists, so your API key won't be overwritten on future restarts.
- If you need to get a new Gemini API key, visit: https://aistudio.google.com/app/apikey

