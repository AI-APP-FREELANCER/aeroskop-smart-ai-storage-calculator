# Gemini API Setup Guide

## 🚨 **Current Issue**

The Gemini API is returning a 404 error, which means either:
1. The API key is invalid
2. The Gemini API is not enabled in your Google Cloud project
3. The model names have changed

## 🔧 **Solution Steps**

### **Step 1: Enable Gemini API in Google Cloud Console**

1. **Go to**: [Google Cloud Console](https://console.cloud.google.com/)
2. **Select your project** (or create a new one)
3. **Navigate to**: APIs & Services > Library
4. **Search for**: "Generative Language API"
5. **Click**: "Enable API"
6. **Wait**: 2-3 minutes for the API to be fully enabled

### **Step 2: Verify API Key Permissions**

1. **Go to**: [Google AI Studio](https://aistudio.google.com/app/apikey)
2. **Check**: Your API key is still valid
3. **Verify**: The key has access to the Generative Language API
4. **Create new key**: If needed, create a new API key

### **Step 3: Test with Correct Model Names**

The model names might have changed. Try these alternatives:

- `gemini-1.5-flash` (newer model)
- `gemini-1.5-pro` (newer model)  
- `gemini-pro` (standard model)
- `gemini-pro-vision` (if using images)

### **Step 4: Update Environment Variables**

Once the API is working, update your `.env.local`:

```env
GEMINI_API_KEY=your_actual_api_key_here
GEMINI_MODEL=gemini-pro
```

## 🧪 **Test Script**

I've created a test script to verify the API is working:

```bash
node test-gemini-api.js
```

## 🔄 **Fallback Solution**

While you're setting up the Gemini API, the application will use intelligent mock recommendations that are:

- ✅ **Accurate**: Based on real storage calculations
- ✅ **Dynamic**: Change based on your input parameters
- ✅ **Professional**: Include proper product recommendations
- ✅ **Functional**: Work without API calls

## 📞 **Support**

If you continue to have issues:

1. **Check Google Cloud Console** - Ensure the API is enabled
2. **Verify API Key** - Make sure it's valid and has permissions
3. **Try Different Models** - The model names might have changed
4. **Check Billing** - Some APIs require billing to be enabled

## 🎯 **Next Steps**

1. **Enable the Gemini API** in Google Cloud Console
2. **Test the API** with the provided script
3. **Update the model name** if needed
4. **Restart your development server**

The application will work with mock recommendations until the API is properly configured!
