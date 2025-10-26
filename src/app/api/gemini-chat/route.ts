import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { query } from '@/lib/db';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Allowed topics for camera storage discussions (expanded)
const ALLOWED_TOPICS = [
  'storage', 'camera', 'cameras', 'bitrate', 'frame', 'recording', 'vms', 
  'optimization', 'surveillance', 'video', 'compression', 'retention', 
  'fps', 'resolution', 'codec', 'h264', 'h265', 'mjpeg', 'quality',
  'capacity', 'hardware', 'nvr', 'server', 'raid', 'ssd', 'hdd',
  'network', 'bandwidth', 'analytics', 'ai', 'recommendation',
  'calculate', 'calculation', 'need', 'help', 'how', 'what', 'why',
  'compare', 'difference', 'better', 'best', 'recommend', 'suggest',
  'system', 'setup', 'install', 'deploy', 'configure', 'settings',
  'performance', 'speed', 'fast', 'slow', 'efficient', 'optimize',
  'cost', 'price', 'budget', 'expensive', 'cheap', 'affordable',
  'security', 'safe', 'secure', 'protection', 'monitor', 'watch'
];

// Restriction prompt for Gemini
const RESTRICTION_PROMPT = `
You are a friendly AI assistant specializing in surveillance camera storage advice and optimization.

Focus on providing helpful guidance about:
- Storage optimization tips and best practices
- Product recommendations and comparisons
- Cost-saving strategies for surveillance storage
- System setup and configuration advice
- Troubleshooting common storage issues
- Hardware selection guidance
- Network considerations for surveillance systems
- Security best practices

Keep responses conversational and practical. Avoid showing detailed calculations or technical formulas - instead focus on actionable advice and recommendations. Be encouraging and helpful.

If someone asks about completely unrelated topics (like cooking, weather, etc.), politely redirect them to surveillance and storage topics.

User query: `;

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

    // Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      console.log('🔧 Gemini API key not configured, using intelligent fallback response');
      const fallbackResponse = generateFallbackResponse(prompt);
      return NextResponse.json({
        response: fallbackResponse,
        isRestricted: false,
        timestamp: new Date().toISOString(),
        isFallback: true
      });
    }

    // Client-side topic validation - only restrict if clearly off-topic
    const userInput = prompt.toLowerCase();
    const isAllowedTopic = ALLOWED_TOPICS.some(topic => 
      userInput.includes(topic.toLowerCase())
    );

    // Only restrict if the query is clearly unrelated to surveillance/storage
    const offTopicKeywords = ['weather', 'cooking', 'sports', 'politics', 'entertainment', 'music', 'movies', 'games', 'shopping', 'travel', 'food', 'restaurant'];
    const isOffTopic = offTopicKeywords.some(keyword => userInput.includes(keyword));

    // Very minimal restriction - only block completely unrelated topics
    if (isOffTopic && !isAllowedTopic && userInput.length < 15) {
      // Only restrict very short, clearly off-topic queries
      return NextResponse.json({
        response: "I'm here to help with surveillance and storage topics! Feel free to ask about cameras, storage requirements, or any technical questions.",
        isRestricted: false
      });
    }

    // Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      console.log('🔧 Gemini API key not configured, using fallback response');
      const fallbackResponse = generateFallbackResponse(prompt);
      return NextResponse.json({
        response: fallbackResponse,
        isRestricted: false,
        timestamp: new Date().toISOString(),
        isFallback: true
      });
    }

    // Get Gemini model
    console.log('🤖 Initializing Gemini model...');
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Create the full prompt with restrictions
    const fullPrompt = RESTRICTION_PROMPT + prompt;
    console.log('📝 Sending prompt to Gemini...');
    console.log('🔑 Gemini API Key configured:', !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here');

    // Generate response from Gemini
    try {
      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      const text = response.text();
      console.log('✅ Gemini response received:', text.substring(0, 100) + '...');
      console.log('🤖 This is a REAL Gemini response, not hardcoded!');
      console.log('📊 Full response length:', text.length);
      
      return NextResponse.json({
        response: text,
        isRestricted: false,
        timestamp: new Date().toISOString(),
        isFallback: false
      });
    } catch (error: any) {
      console.error('❌ Gemini API Error:', error);
      console.log('🔄 Falling back to intelligent response');
      const fallbackResponse = generateFallbackResponse(prompt);
      return NextResponse.json({
        response: fallbackResponse,
        isRestricted: false,
        timestamp: new Date().toISOString(),
        isFallback: true
      });
    }

  } catch (error: any) {
    console.error('Gemini API Error:', error);
    console.log('🔄 Falling back to intelligent response');
    
    // Provide intelligent fallback response immediately
    const fallbackResponse = generateFallbackResponse(body?.prompt || 'storage question');
    
    return NextResponse.json({
      response: fallbackResponse,
      isRestricted: false,
      timestamp: new Date().toISOString(),
      isFallback: true
    });
  }
}

function generateFallbackResponse(prompt: string): string {
  const userInput = prompt.toLowerCase();
  
  // Storage advice responses
  if (userInput.includes('storage') && userInput.includes('need')) {
    return `I'd be happy to help you figure out your storage needs! 

Here's what I consider when recommending storage solutions:
• How many cameras you're planning to deploy
• The video quality you need (HD, 4K, etc.)
• How long you want to keep recordings
• Whether you're recording 24/7 or just when motion is detected

💡 **Pro Tip:** H.265 compression can cut your storage needs in half compared to older formats!

What's your surveillance setup looking like? I can give you some personalized recommendations!`;
  }
  
  // H.264 vs H.265 comparison
  if (userInput.includes('h.264') || userInput.includes('h.265') || userInput.includes('compression')) {
    return `Great question about video compression! Here's the simple breakdown:

**H.264 (The Classic):**
• Works with almost everything
• Takes up more storage space
• Perfect for older systems
• Still widely used

**H.265 (The Modern Choice):**
• Cuts your storage needs in half! 🎉
• Better for 4K and high-resolution cameras
• Requires newer equipment
• Worth the upgrade for new installations

**My Recommendation:** If you're setting up a new system, definitely go with H.265. You'll save tons of storage space and get better video quality. For existing systems, H.264 works perfectly fine!

Need help choosing the right compression for your setup?`;
  }
  
  // Bitrate questions
  if (userInput.includes('bitrate') || userInput.includes('bandwidth')) {
    return `Great question about network requirements! Here's what you need to know:

**Typical Bandwidth Needs:**
• HD cameras: About 2-4 Mbps each
• 4K cameras: Around 8-12 Mbps each
• The more cameras, the more bandwidth you'll need

**Smart Tips:**
• H.265 compression cuts bandwidth in half! 🎯
• Plan for some extra capacity (about 20% more)
• Use good quality network switches
• PoE+ switches are perfect for power and data

**Pro Advice:** Start with a gigabit network - it's affordable and gives you room to grow. Most modern cameras work great with this setup!

What kind of cameras are you planning to use?`;
  }
  
  // General storage optimization
  if (userInput.includes('optimize') || userInput.includes('optimization')) {
    return `I love helping with storage optimization! Here are my top tips:

**Easy Wins:**
• Switch to H.265 compression - instant 50% storage savings! 🎉
• Use motion detection instead of 24/7 recording
• Set up smart recording schedules (business hours, etc.)

**Smart Storage Setup:**
• Use RAID for data protection
• Consider a mix of fast and economical drives
• Set up automatic cleanup of old footage

**Pro Tips:**
• Regular system maintenance keeps everything running smoothly
• Keep your firmware updated for best performance
• Plan for growth - storage needs always increase!

What's your current setup like? I can give you some personalized optimization suggestions!`;
  }
  
  // Check if it's a storage-related question
  const storageKeywords = ['storage', 'camera', 'bitrate', 'compression', 'h.264', 'h.265', 'fps', 'resolution', 'recording', 'retention', 'surveillance', 'vms', 'nvr', 'server'];
  const isStorageRelated = storageKeywords.some(keyword => userInput.includes(keyword));

  if (!isStorageRelated) {
    return `I'm specialized in surveillance and storage topics! I'd love to help you with camera storage, system optimization, or any surveillance-related questions. What can I help you with today?`;
  }

  // Default response for storage-related questions
  return `I'm here to help with your surveillance storage needs! 

**I can help you with:**
• Finding the right storage solution for your cameras
• Optimizing your current setup for better performance
• Choosing the best compression settings
• Planning for future growth
• Troubleshooting storage issues

**Just ask me things like:**
• "What's the best storage setup for my cameras?"
• "How can I save space on my surveillance recordings?"
• "What's the difference between H.264 and H.265?"
• "How do I plan storage for a new installation?"

What would you like to know about your surveillance storage?`;
}
