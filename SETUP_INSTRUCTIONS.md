# 🚀 AI Storage Recommendation Setup Instructions

## ❌ Current Issue
The AI recommendation is failing because the OpenAI API key is not configured. You're seeing the error:
```
"AI recommendation failed. Please try again."
```

## ✅ Solution Steps

### 1. Get Your OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in to your OpenAI account
3. Click "Create new secret key"
4. Copy the API key (starts with `sk-`)

### 2. Configure the API Key
1. Open the `.env.local` file in your project root
2. Replace `your_openai_api_key_here` with your actual API key:

```env
OPENAI_API_KEY=sk-your-actual-api-key-here
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

## 🔧 Alternative: Test Without OpenAI (Fallback Mode)

If you don't have an OpenAI API key yet, I can create a fallback mode that provides mock recommendations. Let me know if you'd like me to implement this.

## 🐛 Troubleshooting

### If you still get errors:

1. **Check the server logs** in your terminal for detailed error messages
2. **Verify the .env.local file** has the correct API key
3. **Restart the server** after changing environment variables
4. **Check your OpenAI account** has sufficient credits

### Common Issues:
- **"OpenAI API key not configured"** → Set the API key in .env.local
- **"Insufficient credits"** → Add credits to your OpenAI account
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
4. Monitor OpenAI usage and costs

Let me know once you've set up the API key and I can help with any remaining issues!
