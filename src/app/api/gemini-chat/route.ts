import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { query } from '@/lib/db';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Simplified system prompt - keep it short to avoid API errors
const SYSTEM_PROMPT = `You are an expert surveillance storage assistant. Answer questions directly using the conversation context and any calculation results provided. Be conversational and helpful.`;

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Gemini Chat API is running',
    timestamp: new Date().toISOString()
  });
}

export async function POST(request: NextRequest) {
  let body;
  try {
    console.log('🔧 Gemini Chat API called');
    body = await request.json();
    console.log('📤 Request body:', { prompt: body.prompt?.substring(0, 50) + '...', sessionId: body.sessionId });
    
    const { prompt, sessionId, pageUrl } = body;

    // Quick test - if prompt is "test", return immediately
    if (prompt === 'test') {
      return NextResponse.json({
        response: 'API is working! Gemini integration is functional.',
        isRestricted: false,
        timestamp: new Date().toISOString(),
        isTest: true
      });
    }

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required and must be a string' },
        { status: 400 }
      );
    }

    // Check if Gemini API key is configured (but allow the API call to proceed)
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.trim() === '') {
      console.warn('⚠️ GEMINI_API_KEY environment variable is not set');
      // Continue anyway - let Gemini API handle the error
    } else {
      console.log('✅ Gemini API key is configured');
    }

    // Fetch conversation history from database
    let conversationHistory: Array<{ role: 'user' | 'model'; parts: string }> = [];
    let calculationContextMessage: string | null = null;
    
    if (sessionId) {
      try {
        // Fetch chat history for this session
        const historyResult = await query(
          `SELECT sender, message, created_at 
           FROM chat_messages 
           WHERE session_id = $1 
           ORDER BY created_at ASC 
           LIMIT 20`,
          [sessionId]
        );

        // Convert database messages to Gemini chat history format
        conversationHistory = historyResult.rows.map((row: any) => ({
          role: row.sender === 'user' ? 'user' : 'model',
          parts: row.message
        }));

        // Fetch recent calculation context for this session
        // Match by sessionId in result_id or fetch most recent for this session
        const contextResult = await query(
          `SELECT summary, params, product_mapping, timestamp, result_id
           FROM calculation_contexts 
           WHERE result_id LIKE $1 OR result_id LIKE $2
           ORDER BY timestamp DESC 
           LIMIT 1`,
          [`%${sessionId}%`, `result-%`]
        );

        if (contextResult.rows.length > 0) {
          const context = contextResult.rows[0];
          const params = typeof context.params === 'string' ? JSON.parse(context.params) : context.params;
          const productMapping = typeof context.product_mapping === 'string' ? JSON.parse(context.product_mapping) : context.product_mapping;
          
          // Build calculation context as a synthetic user message (not in system_instruction)
          // This avoids the 400 error from system_instruction being too long
          calculationContextMessage = `[User's Current Calculation Results]\n\n${context.summary || ''}\n\nWhen I ask about "this system", "the recommended product", "my calculation", or "the storage", I'm referring to these specific results. Please use these exact values in your answers.`;
          
          // Sanitize the context message - remove excessive newlines and control characters
          calculationContextMessage = calculationContextMessage
            .replace(/\n{3,}/g, '\n\n') // Replace 3+ newlines with 2
            .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // Remove control characters
            .trim();
          
          console.log(`📊 Loaded calculation context for session ${sessionId}:`, {
            summary: context.summary?.substring(0, 100) + '...',
            product: productMapping?.sku,
            contextLength: calculationContextMessage.length
          });
        } else {
          console.log(`⚠️ No calculation context found for session ${sessionId}`);
        }

        console.log(`📚 Loaded ${conversationHistory.length} previous messages for context`);
      } catch (dbError: any) {
        console.warn('⚠️ Could not fetch conversation history:', dbError.message);
        // Continue without history if database query fails
      }
    }

    // Get Gemini model
    // Using gemini-2.5-flash as it's available for v1beta API
    // gemini-pro and gemini-1.5-flash were returning 404 Not Found for v1beta API
    console.log('🤖 Initializing Gemini model with chat history...');
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Build the chat with history
    // IMPORTANT: Remove system_instruction entirely to avoid 400 errors
    // Instead, add system instructions as the first user message in history
    let historyForGemini: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];
    
    // Add system instructions as first user message (if no history exists)
    if (conversationHistory.length === 0) {
      historyForGemini.push({
        role: 'user',
        parts: [{ text: SYSTEM_PROMPT }]
      });
      // Add a model acknowledgment
      historyForGemini.push({
        role: 'model',
        parts: [{ text: 'I understand. I am an expert surveillance storage assistant ready to help.' }]
      });
    }
    
    // Add calculation context as next message if available
    if (calculationContextMessage) {
      historyForGemini.push({
        role: 'user',
        parts: [{ text: calculationContextMessage }]
      });
      // Add a model acknowledgment to maintain conversation flow
      historyForGemini.push({
        role: 'model',
        parts: [{ text: 'I understand. I have your calculation results and will use them when answering your questions.' }]
      });
    }
    
    // Add existing conversation history
    const existingHistory = conversationHistory.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.parts }]
    }));
    historyForGemini = [...historyForGemini, ...existingHistory];
    
    let chat;
    if (historyForGemini.length > 0) {
      // Start chat with history - NO system_instruction to avoid 400 errors
      chat = model.startChat({
        history: historyForGemini
      });
    } else {
      // Start new chat without system_instruction
      chat = model.startChat();
    }

    // Store user message in database
    if (sessionId) {
      try {
        await query(
          `INSERT INTO chat_messages (session_id, sender, message, metadata, created_at) 
           VALUES ($1, $2, $3, $4, $5)`,
          [
            sessionId,
            'user',
            prompt,
            JSON.stringify({ pageUrl: pageUrl || 'unknown' }),
            new Date().toISOString()
          ]
        );
      } catch (dbError: any) {
        console.warn('⚠️ Could not store user message:', dbError.message);
      }
    }

    console.log('📝 Sending prompt to Gemini with context...');
    console.log('🔑 Gemini API Key configured:', !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here');
    console.log('📤 Full request payload:', {
      prompt: prompt.substring(0, 200) + (prompt.length > 200 ? '...' : ''),
      sessionId: sessionId,
      conversationHistoryLength: conversationHistory.length,
      hasCalculationContext: !!calculationContextMessage,
      calculationContextLength: calculationContextMessage?.length || 0,
      totalHistoryLength: historyForGemini.length,
      usingSystemInstruction: false, // Removed to avoid 400 errors
      systemPromptInHistory: conversationHistory.length === 0 // System prompt is in history if no previous messages
    });

    // Generate response from Gemini using chat
    try {
      console.log('🔄 Calling Gemini API sendMessage...');
      console.log('📝 Prompt being sent:', prompt.substring(0, 100) + '...');
      console.log('🔑 API Key check:', {
        hasKey: !!process.env.GEMINI_API_KEY,
        keyLength: process.env.GEMINI_API_KEY?.length || 0,
        keyPrefix: process.env.GEMINI_API_KEY?.substring(0, 10) + '...' || 'N/A'
      });
      
      const result = await chat.sendMessage(prompt);
      console.log('✅ Gemini sendMessage completed, getting response...');
      
      const response = await result.response;
      console.log('✅ Gemini response object received:', {
        responseType: typeof response,
        hasText: typeof response.text === 'function',
        responseKeys: Object.keys(response),
        responseString: JSON.stringify(response).substring(0, 200)
      });
      
      let text: string;
      try {
        text = response.text();
      } catch (textError: any) {
        console.error('❌ Error extracting text from response:', {
          error: textError?.message,
          errorType: textError?.constructor?.name,
          response: JSON.stringify(response).substring(0, 500)
        });
        throw new Error(`Failed to extract text from Gemini response: ${textError?.message}`);
      }
      
      console.log('✅ Gemini text extracted:', {
        textLength: text?.length || 0,
        textPreview: text?.substring(0, 200) + (text?.length > 200 ? '...' : ''),
        isEmpty: !text || text.trim().length === 0
      });
      
      if (!text || text.trim().length === 0) {
        console.error('❌ Gemini returned empty text response');
        throw new Error('Gemini API returned an empty response');
      }
      
      console.log('🤖 This is a REAL Gemini response with conversation context!');
      console.log('📊 Full response length:', text.length);
      
      // Store AI response in database
      if (sessionId) {
        try {
          await query(
            `INSERT INTO chat_messages (session_id, sender, message, metadata, created_at) 
             VALUES ($1, $2, $3, $4, $5)`,
            [
              sessionId,
              'ai',
              text,
              JSON.stringify({ pageUrl: pageUrl || 'unknown', isFallback: false }),
              new Date().toISOString()
            ]
          );
        } catch (dbError: any) {
          console.warn('⚠️ Could not store AI message:', dbError.message);
        }
      }
      
      const responsePayload = {
        response: text,
        isRestricted: false,
        timestamp: new Date().toISOString(),
        isFallback: false
      };
      
      console.log('📤 Sending response to frontend:', {
        responseLength: text.length,
        hasResponse: !!responsePayload.response,
        isFallback: responsePayload.isFallback
      });
      
      return NextResponse.json(responsePayload);
    } catch (error: any) {
      console.error('❌ Gemini API Error Details:', {
        errorType: error?.constructor?.name,
        errorMessage: error?.message,
        errorStack: error?.stack?.substring(0, 1000),
        errorCode: error?.code,
        errorStatus: error?.status,
        errorName: error?.name,
        fullError: JSON.stringify(error, Object.getOwnPropertyNames(error)).substring(0, 1000)
      });
      
      // Check for specific error types
      const isApiKeyError = error?.message?.includes('API_KEY') || error?.message?.includes('api key') || error?.code === 401 || error?.status === 401;
      const isRateLimitError = error?.message?.includes('rate limit') || error?.message?.includes('quota') || error?.code === 429 || error?.status === 429;
      const isNetworkError = error?.message?.includes('network') || error?.message?.includes('fetch') || error?.code === 'ECONNREFUSED';
      
      let errorMessage = 'An issue occurred while fetching recommendations from the AI system. Please try again or report this inconsistency to our support team.';
      
      if (isApiKeyError) {
        errorMessage = 'The AI service is currently unavailable due to API configuration issues. Please contact support.';
        console.error('🔑 API Key Error detected');
      } else if (isRateLimitError) {
        errorMessage = 'The AI service is temporarily unavailable due to high demand. Please try again in a few moments.';
        console.error('⏱️ Rate Limit Error detected');
      } else if (isNetworkError) {
        errorMessage = 'Unable to connect to the AI service. Please check your internet connection and try again.';
        console.error('🌐 Network Error detected');
      }
      
      // Store error message in database
      if (sessionId) {
        try {
          await query(
            `INSERT INTO chat_messages (session_id, sender, message, metadata, created_at) 
             VALUES ($1, $2, $3, $4, $5)`,
            [
              sessionId,
              'ai',
              errorMessage,
              JSON.stringify({ 
                pageUrl: pageUrl || 'unknown', 
                error: error.message, 
                errorType: error?.constructor?.name,
                errorCode: error?.code,
                isFallback: true 
              }),
              new Date().toISOString()
            ]
          );
        } catch (dbError: any) {
          console.warn('⚠️ Could not store error message:', dbError.message);
        }
      }
      
      return NextResponse.json({
        response: errorMessage,
        isRestricted: false,
        timestamp: new Date().toISOString(),
        isFallback: true,
        error: error?.message || 'Unknown error'
      });
    }

  } catch (error: any) {
    console.error('Gemini API Error:', error);
    
    return NextResponse.json({
      response: 'An issue occurred while fetching recommendations from the AI system. Please try again or report this inconsistency to our support team.',
      isRestricted: false,
      timestamp: new Date().toISOString(),
      isFallback: true
    });
  }
}

// Removed generateFallbackResponse - using Gemini's natural responses instead
