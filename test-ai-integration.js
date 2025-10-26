// Test script to verify OpenAI integration
const { generateStorageRecommendation } = require('./src/lib/openai.ts');

async function testAI() {
  try {
    console.log('Testing AI integration...');
    
    const testInput = {
      cameras: 4,
      resolution: '1080p',
      fps: 30,
      codec: 'H.265',
      activity_level: 'Medium',
      retention_days: 30,
      recording_mode: 'Continuous'
    };
    
    console.log('Input:', testInput);
    
    const result = await generateStorageRecommendation(testInput);
    
    console.log('AI Response:', JSON.stringify(result, null, 2));
    
    if (result.summary && result.summary.includes('Mock')) {
      console.log('❌ Still using mock recommendations');
    } else {
      console.log('✅ Real AI recommendations working!');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAI();
