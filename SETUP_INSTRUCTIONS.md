# 🚀 AI Storage Recommendation Setup Instructions

## ✅ Solution Steps

### 1. Get Your Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key

### 2. Configure the API Key
1. Open the `.env.local` file in your project root
2. Add your Gemini API key:

```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash
```

### 3. Restart the Development Server
```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### 4. Test the Integration
1. Go to the calculator page
2. Enter some test data:
   - Cameras: 4
   - Resolution: 4K
   - FPS: 30
   - Codec: H.265
   - Activity Level: Medium
   - Retention Days: 30
   - Recording Mode: Continuous
3. Click "Calculate Storage Needs"
4. You should now see AI recommendations!

## 🐛 Troubleshooting

### If you still get errors:

1. **Check the server logs** in your terminal for detailed error messages
2. **Verify the .env.local file** has the correct Gemini API key
3. **Restart the server** after changing environment variables
4. **Check your Gemini API key** is valid and has quota

### Common Issues:
- **"Gemini API key not configured"** → Set the GEMINI_API_KEY in .env.local
- **"API quota exceeded"** → Check your Google AI Studio quota
- **"Rate limit exceeded"** → Wait a few minutes and try again

## 📊 Expected Behavior After Setup

Once configured, you should see:
1. ✅ Storage calculations appear instantly
2. ✅ AI recommendations modal opens
3. ✅ Good/Better/Best product tiers
4. ✅ Optimization suggestions
5. ✅ Cost analysis and savings

## 💡 Next Steps

After getting the basic integration working:
1. Test with different camera configurations
2. Verify the recommendations make sense
3. Check the database for cached results
4. Monitor Gemini API usage and costs

Let me know once you've set up the API key and I can help with any remaining issues!
