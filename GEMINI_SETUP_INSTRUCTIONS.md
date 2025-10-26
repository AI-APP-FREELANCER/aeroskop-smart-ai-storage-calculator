# Gemini AI Integration Setup Instructions

## Overview
This document provides step-by-step instructions to set up Google Gemini AI integration for the Aeroskop storage calculator application.

## Prerequisites
- Node.js and npm installed
- PostgreSQL database running
- Google AI Studio account

## Step 1: Get Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

## Step 2: Configure Environment Variables

Create or update your `.env.local` file in the project root with the following variables:

```env
# OpenAI Configuration (existing)
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4-turbo-preview
OPENAI_MAX_TOKENS=2500
OPENAI_TEMPERATURE=0.2

# Google Gemini AI Configuration (NEW)
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash

# Database Configuration (existing)
DATABASE_URL=postgresql://aeroskop_user:aeroskop_password@localhost:5433/aeroskop_db

# Application Configuration (existing)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Chat Session Configuration (NEW)
CHAT_SESSION_TIMEOUT=3600000
MAX_CHAT_HISTORY=50

# Analytics Configuration (NEW)
ENABLE_CHAT_ANALYTICS=true
LOG_RESTRICTED_QUERIES=true
```

## Step 3: Install Dependencies

The Google Generative AI SDK has already been installed. If you need to reinstall:

```bash
npm install @google/generative-ai
```

## Step 4: Database Setup

The analytics tables for chat tracking have been created. If you need to recreate them:

```sql
-- User Analytics Table
CREATE TABLE IF NOT EXISTS user_analytics (
    id SERIAL PRIMARY KEY,
    user_session_id VARCHAR(100) NOT NULL,
    parameter_data JSONB NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    time_spent_seconds INTEGER DEFAULT 0,
    actions JSONB DEFAULT '[]',
    page_url TEXT,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Calculator Interactions Table
CREATE TABLE IF NOT EXISTS calculator_interactions (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    parameters JSONB,
    timestamp TIMESTAMP NOT NULL,
    page_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recommendation Analytics Table
CREATE TABLE IF NOT EXISTS recommendation_analytics (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(100) NOT NULL,
    parameters JSONB,
    recommendation_data JSONB NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    page_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Step 5: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `/ai-chat` in your browser

3. Test the chat interface with storage-related questions:
   - "How much storage do I need for 50 cameras at 4K resolution?"
   - "What's the difference between H.264 and H.265 compression?"
   - "How do I calculate bitrate for 30fps recording?"

4. Test restriction by asking off-topic questions:
   - "What's the weather like today?"
   - "Tell me a joke"
   - "How do I cook pasta?"

## Features

### ✅ Implemented Features

1. **Restricted AI Chat Console**
   - Only allows camera storage and surveillance-related discussions
   - Client-side and server-side topic validation
   - Polite refusal for off-topic queries

2. **Analytics Integration**
   - Tracks chat interactions in the database
   - Logs restricted query attempts
   - Monitors user behavior and session data

3. **Professional UI**
   - Clean, modern chat interface
   - Real-time typing indicators
   - Message timestamps
   - Error handling and loading states

4. **Database Integration**
   - Uses existing PostgreSQL database
   - Stores chat analytics in dedicated tables
   - Tracks session data and user interactions

### 🔒 Security Features

1. **Topic Restrictions**
   - Validates queries against allowed topics
   - Prevents off-topic discussions
   - Logs restricted query attempts

2. **API Key Security**
   - Environment variable configuration
   - Server-side API key handling
   - No client-side exposure of API keys

3. **Input Validation**
   - Sanitizes user input
   - Prevents injection attacks
   - Validates request structure

## API Endpoints

### POST /api/gemini-chat

**Request Body:**
```json
{
  "prompt": "How much storage do I need for 50 cameras?",
  "sessionId": "chat-session-123",
  "pageUrl": "/ai-chat"
}
```

**Response:**
```json
{
  "response": "For 50 cameras at 4K resolution...",
  "isRestricted": false,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Troubleshooting

### Common Issues

1. **"Failed to generate response from Gemini AI"**
   - Check your GEMINI_API_KEY in .env.local
   - Verify the API key is valid and has proper permissions
   - Check your internet connection

2. **"I can only assist with camera storage topics"**
   - This is expected behavior for off-topic queries
   - Try asking about storage, cameras, bitrate, VMS, etc.

3. **Database connection errors**
   - Ensure PostgreSQL is running
   - Check DATABASE_URL in .env.local
   - Verify database tables exist

### Debug Mode

To enable debug logging, add to your `.env.local`:

```env
DEBUG_GEMINI=true
LOG_LEVEL=debug
```

## Monitoring and Analytics

The system tracks:
- Total chat sessions
- Query topics and frequency
- Restricted query attempts
- Response times and success rates
- User engagement metrics

View analytics in the admin dashboard at `/admin/analytics`.

## Next Steps

1. **Customize the AI Personality**
   - Modify the restriction prompt in `/api/gemini-chat/route.ts`
   - Adjust the allowed topics list
   - Customize response templates

2. **Add More Features**
   - File upload for storage calculations
   - Voice input support
   - Multi-language support
   - Advanced analytics dashboard

3. **Production Deployment**
   - Set up proper API key management
   - Configure rate limiting
   - Add monitoring and alerting
   - Set up backup and recovery

## Support

For issues or questions:
1. Check the browser console for errors
2. Review the server logs
3. Verify environment variables
4. Test with simple queries first
