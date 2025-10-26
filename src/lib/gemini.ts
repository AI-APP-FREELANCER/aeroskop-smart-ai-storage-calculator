import { GoogleGenerativeAI } from '@google/generative-ai';
import { calculateAccurateStorage } from './storageCalculations';
import { AIRecommendationResponse, StorageRecommendation } from './types';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Aeroskop Product Specifications
const PRODUCT_SPECIFICATIONS = {
  'AeroFlex AF-1632 NVR': {
    product_model: 'AF-1632',
    channel_capacity: '16-32 channels',
    storage_capacity_tb: 36,
    cpu: 'Intel Core i5',
    ram: '16GB DDR4',
    raid_support: 'RAID 0, 1, 5, 6, 10',
    suitable_for: ['Small to medium businesses', '16-32 cameras', 'Entry-level deployments'],
    key_features: ['VMS + Recording', 'Workstation + Video Wall', 'NVIDIA T 400 4GB']
  },
  'AeroFlex AF-3264 NVR': {
    product_model: 'AF-3264',
    channel_capacity: '32-64 channels',
    storage_capacity_tb: 72,
    cpu: 'Intel Core i7',
    ram: '32GB DDR4',
    raid_support: 'RAID 0, 1, 5, 6, 10',
    suitable_for: ['Medium to large businesses', '32-64 cameras', 'Mid-range deployments'],
    key_features: ['VMS + Recording', 'Workstation + Video Wall', 'NVIDIA RTX 1000 4GB']
  },
  'AeroFlex AF-64128 NVR': {
    product_model: 'AF-64128',
    channel_capacity: '64-128 channels',
    storage_capacity_tb: 144,
    cpu: 'Intel Core i9',
    ram: '64GB DDR4',
    raid_support: 'RAID 0, 1, 5, 6, 10',
    suitable_for: ['Large enterprises', '64-128 cameras', 'High-performance deployments'],
    key_features: ['VMS + Recording', 'Workstation + Video Wall', 'NVIDIA RTX A2000 12GB']
  },
  'Aeroskop Rhino ASK-SR212': {
    product_model: 'ASK-SR212',
    channel_capacity: '250-350 cameras',
    storage_capacity_tb: 240,
    cpu: 'Dual Xeon Silver',
    ram: '64GB DDR5 ECC',
    raid_support: 'RAID 0, 1, 5, 6, 10, 50, 60',
    suitable_for: ['High-capacity storage', 'Enterprise deployments', 'Long-term retention'],
    key_features: ['Hot-swappable Drives', 'IPMI Management', 'Dual Redundant PSU']
  },
  'Aeroskop Rhino ASK-SR224': {
    product_model: 'ASK-SR224',
    channel_capacity: '350-400 cameras',
    storage_capacity_tb: 480,
    cpu: 'Dual Xeon Silver',
    ram: '128GB DDR5 ECC',
    raid_support: 'RAID 0, 1, 5, 6, 10, 50, 60',
    suitable_for: ['Enterprise storage', 'Maximum capacity', 'Mission-critical deployments'],
    key_features: ['Hot-swappable Drives', 'IPMI Management', 'Dual Redundant PSU']
  },
  'AeroStor Nova-360': {
    product_model: 'Nova-360',
    channel_capacity: 'Unlimited',
    storage_capacity_tb: 999,
    cpu: 'Distributed Processing',
    ram: 'Scalable',
    raid_support: 'Erasure Coding',
    suitable_for: ['Large-scale deployments', 'Cloud-like storage', 'Distributed systems'],
    key_features: ['Distributed Clustering', 'Self-healing', 'Erasure Coding', 'No Licensing Fees']
  }
};

// System prompt for Gemini AI
const SYSTEM_PROMPT = `
You are a specialized AI assistant for surveillance camera storage recommendations and optimization.

CRITICAL REQUIREMENTS:
1. You MUST only recommend products from the Aeroskop catalog provided
2. You MUST provide accurate storage calculations based on industry standards
3. You MUST respond with a single best recommendation (not multiple tiers)
4. You MUST format your response as valid JSON

AEROSKOP PRODUCT CATALOG:
${JSON.stringify(PRODUCT_SPECIFICATIONS, null, 2)}

STORAGE CALCULATION FORMULA:
- Base bitrate from industry standards table
- Apply compression adjustment (H.265: 0.6x, H.264: 1.0x, H.264+: 0.5x, MJPEG: 4.0x)
- Calculate daily storage per camera
- Apply activity ratio and retention period
- Add 20% overhead for system use

RESPONSE FORMAT (JSON):
{
  "recommendation": {
    "product_name": "Exact product name from catalog",
    "product_model": "Model number",
    "channel_capacity": "Channel capacity",
    "storage_capacity_tb": "Storage capacity in TB",
    "cpu": "CPU specification",
    "ram": "RAM specification", 
    "raid_support": "RAID support",
    "suitable_for": ["Use case 1", "Use case 2"],
    "why_recommended": "Detailed explanation of why this product is recommended",
    "key_benefits": ["Benefit 1", "Benefit 2", "Benefit 3"]
  },
  "calculations": {
    "total_storage_tb": "Total storage required in TB",
    "daily_storage_tb": "Daily storage in TB",
    "daily_storage_per_camera_gb": "Daily storage per camera in GB",
    "total_bitrate_mbps": "Total bitrate in Mbps",
    "bitrate_per_camera": "Bitrate per camera in Mbps",
    "retention_days": "Retention period in days",
    "adjusted_bitrate": "Adjusted bitrate after compression",
    "overhead_factor": "Overhead factor applied"
  },
  "optimization": {
    "suggestions": ["Optimization suggestion 1", "Optimization suggestion 2"],
    "insights": ["Technical insight 1", "Technical insight 2"]
  },
  "summary": "Brief summary of the recommendation"
}

IMPORTANT: Only recommend products that can handle the specified camera count and storage requirements.
`;

export async function generateGeminiStorageRecommendation(input: {
  cameras: number;
  resolution: string;
  fps: number;
  codec: string;
  quality: string;
  activity_percent: number;
  recording_hours_per_day: number;
  retention_days: number;
  recording_mode: string;
}, analyticsContext?: {
  sessionId?: string;
  userId?: string;
}): Promise<AIRecommendationResponse> {
  const requestStartTime = new Date();
  let requestEndTime: Date;
  let status = 'success';
  let errorCode: string | undefined;
  let errorMessage: string | undefined;
  let tokensInput = 0;
  let tokensOutput = 0;
  let tokensTotal = 0;

  try {
    // Check if Gemini API key is configured and valid
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      console.log('🔧 Gemini API key not configured, using intelligent mock recommendations');
      requestEndTime = new Date();
      console.log('📊 Using mock recommendations - no analytics capture needed');
      return generateMockRecommendations(input);
    }

    // Calculate accurate storage requirements
    console.log('🧮 Gemini calculation input:', input);
    
    const storageCalc = calculateAccurateStorage({
      cameras: input.cameras,
      resolution: input.resolution,
      fps: input.fps,
      codec: input.codec,
      quality: input.quality,
      recordingHoursPerDay: input.recording_hours_per_day,
      activityPercent: input.activity_percent,
      retentionDays: input.retention_days
    });
    
    console.log('📊 Gemini storage calculation result:', storageCalc);
    console.log('💾 Total storage TB from Gemini:', storageCalc.totalStorageTB);

    // Build the prompt for Gemini
    const userPrompt = `
Calculate storage requirements and recommend the best Aeroskop product for:

CAMERA PARAMETERS:
- Number of Cameras: ${input.cameras}
- Resolution: ${input.resolution}
- Frame Rate: ${input.fps} FPS
- Codec: ${input.codec}
- Quality: ${input.quality}
- Activity Level: ${input.activity_percent}%
- Recording Hours/Day: ${input.recording_hours_per_day}
- Retention Days: ${input.retention_days}
- Recording Mode: ${input.recording_mode}

CALCULATED STORAGE REQUIREMENTS:
- Total Storage Required: ${storageCalc.totalStorageTB.toFixed(2)} TB
- Daily Storage: ${storageCalc.dailyStoragePerCameraGB.toFixed(2)} GB per camera
- Total Bitrate: ${storageCalc.totalBitrateMbps.toFixed(2)} Mbps
- Bitrate per Camera: ${storageCalc.bitratePerCamera.toFixed(2)} Mbps

Please recommend the single most appropriate Aeroskop product and provide detailed reasoning.
`;

    // Estimate input tokens (rough approximation)
    tokensInput = Math.ceil((SYSTEM_PROMPT + userPrompt).length / 4);

    // Get Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Generate response from Gemini
    const result = await model.generateContent(SYSTEM_PROMPT + '\n\n' + userPrompt);
    const response = await result.response;
    const text = response.text();

    // Estimate output tokens
    tokensOutput = Math.ceil(text.length / 4);
    tokensTotal = tokensInput + tokensOutput;

    requestEndTime = new Date();

    // Parse and validate the response
    const aiResponse = validateAndFormatGeminiResponse(text, input, storageCalc);

    // Capture analytics (non-blocking) - simplified for now
    console.log('📊 Gemini Analytics:', {
      sessionId: analyticsContext?.sessionId,
      model: 'gemini-1.5-flash',
      latencyMs: requestEndTime.getTime() - requestStartTime.getTime(),
      status: 'success',
      tokensTotal
    });

    return aiResponse;

  } catch (error: any) {
    console.error('Gemini API Error:', error);
    console.log('🔄 Falling back to intelligent mock recommendations');
    
    requestEndTime = new Date();
    status = 'error';
    errorCode = error.code || 'UNKNOWN_ERROR';
    errorMessage = error.message;

    // Capture error analytics (non-blocking) - simplified for now
    console.log('📊 Gemini Error Analytics:', {
      sessionId: analyticsContext?.sessionId,
      model: 'gemini-1.5-flash',
      latencyMs: requestEndTime.getTime() - requestStartTime.getTime(),
      status: 'error',
      errorCode,
      errorMessage
    });
    
    // Fallback to mock recommendations
    return generateMockRecommendations(input);
  }
}

// Helper function to capture analytics
async function captureAnalytics(data: {
  sessionId?: string;
  userId?: string;
  endpoint: string;
  model: string;
  requestTime: string;
  responseTime: string;
  latencyMs: number;
  status: string;
  tokensInput: number;
  tokensOutput: number;
  tokensTotal: number;
  apiCallsCount: number;
  costEstimate: number;
  errorCode?: string;
  errorMessage?: string;
}) {
  try {
    // Import the database query function
    const { query } = await import('@/lib/db');
    
    // Store directly in database instead of making HTTP call
    await query(
      `INSERT INTO gemini_usage (
        session_id, user_id, endpoint, model, request_time, response_time, 
        latency_ms, status, tokens_input, tokens_output, tokens_total, 
        api_calls_count, cost_estimate, error_code, error_message, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
      [
        data.sessionId || null,
        data.userId || null,
        data.endpoint,
        data.model,
        data.requestTime,
        data.responseTime,
        data.latencyMs,
        data.status,
        data.tokensInput,
        data.tokensOutput,
        data.tokensTotal,
        data.apiCallsCount,
        data.costEstimate,
        data.errorCode || null,
        data.errorMessage || null,
        new Date().toISOString()
      ]
    );
  } catch (error) {
    console.error('Failed to capture Gemini analytics:', error);
  }
}

function validateAndFormatGeminiResponse(
  responseText: string,
  input: any,
  storageCalc: any
): AIRecommendationResponse {
  try {
    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const aiData = JSON.parse(jsonMatch[0]);

    // Validate required fields
    if (!aiData.recommendation || !aiData.calculations) {
      throw new Error('Invalid response structure');
    }

    // Ensure product is from Aeroskop catalog
    const validProducts = Object.keys(PRODUCT_SPECIFICATIONS);
    if (!validProducts.includes(aiData.recommendation.product_name)) {
      // Find the best matching product based on storage requirements
      const bestProduct = findBestProduct(storageCalc.totalStorageTB, input.cameras);
      aiData.recommendation = {
        ...PRODUCT_SPECIFICATIONS[bestProduct],
        product_name: bestProduct,
        why_recommended: `Recommended for ${input.cameras} cameras requiring ${storageCalc.totalStorageTB.toFixed(1)} TB storage`,
        key_benefits: PRODUCT_SPECIFICATIONS[bestProduct].key_features
      };
    }

    return {
      parameters: input,
      calculations: {
        total_storage_tb: Number(aiData.calculations.total_storage_tb || storageCalc.totalStorageTB),
        daily_storage_tb: Number(aiData.calculations.daily_storage_tb || (storageCalc.dailyStoragePerCameraGB * input.cameras / 1000)),
        daily_storage_per_camera_gb: Number(aiData.calculations.daily_storage_per_camera_gb || storageCalc.dailyStoragePerCameraGB),
        total_bitrate_mbps: Number(aiData.calculations.total_bitrate_mbps || storageCalc.totalBitrateMbps),
        bitrate_per_camera: Number(aiData.calculations.bitrate_per_camera || storageCalc.bitratePerCamera),
        retention_days: input.retention_days,
        adjusted_bitrate: Number(aiData.calculations.adjusted_bitrate || storageCalc.adjustedBitrate),
        overhead_factor: Number(aiData.calculations.overhead_factor || 1.2)
      },
      recommendation: aiData.recommendation,
      optimization: aiData.optimization || {
        suggestions: ['Optimize compression settings', 'Consider motion-based recording'],
        insights: ['Storage requirements calculated using industry standards', 'Recommendation based on camera count and retention needs']
      },
      summary: aiData.summary || `Recommended ${aiData.recommendation.product_name} for your ${input.cameras} camera deployment`,
      is_fallback: false,
      fallback_reason: undefined
    };

  } catch (error) {
    console.error('Error parsing Gemini response:', error);
    return generateMockRecommendations(input);
  }
}

function findBestProduct(requiredStorageTB: number, cameraCount: number): string {
  const products = Object.entries(PRODUCT_SPECIFICATIONS);
  
  // More flexible matching - find products that can handle the requirements
  const suitableProducts = products.filter(([name, specs]) => {
    // Extract max cameras from channel capacity (e.g., "16-32" -> 32, "250-350" -> 350)
    const maxCameras = parseInt(specs.channel_capacity.split('-').pop() || '0');
    const minCameras = parseInt(specs.channel_capacity.split('-')[0] || '0');
    
    // Product is suitable if:
    // 1. Camera count is within range OR camera count is close to max (within 20%)
    // 2. Storage capacity is sufficient OR within 50% of requirement
    const cameraMatch = (cameraCount >= minCameras && cameraCount <= maxCameras) || 
                       (cameraCount > maxCameras && cameraCount <= maxCameras * 1.2);
    const storageMatch = specs.storage_capacity_tb >= requiredStorageTB * 0.5;
    
    return cameraMatch && storageMatch;
  });

  if (suitableProducts.length === 0) {
    // If no exact match, find the closest product by storage capacity
    const sortedByStorage = products.sort((a, b) => 
      Math.abs(a[1].storage_capacity_tb - requiredStorageTB) - 
      Math.abs(b[1].storage_capacity_tb - requiredStorageTB)
    );
    return sortedByStorage[0][0];
  }

  // Return the most cost-effective option (smallest suitable product)
  return suitableProducts[0][0];
}

function generateMockRecommendations(input: any): AIRecommendationResponse {
  console.log('🧮 Mock calculation input:', input);
  
  const storageCalc = calculateAccurateStorage({
    cameras: input.cameras,
    resolution: input.resolution,
    fps: input.fps,
    codec: input.codec,
    quality: input.quality,
    recordingHoursPerDay: input.recording_hours_per_day,
    activityPercent: input.activity_percent,
    retentionDays: input.retention_days
  });

  console.log('📊 Storage calculation result:', storageCalc);
  console.log('💾 Total storage TB:', storageCalc.totalStorageTB);

  const bestProduct = findBestProduct(storageCalc.totalStorageTB, input.cameras);
  const productSpecs = PRODUCT_SPECIFICATIONS[bestProduct];
  
  console.log('🏷️ Best product found:', bestProduct);

  return {
    parameters: input,
    calculations: {
      total_storage_tb: storageCalc.totalStorageTB,
      daily_storage_tb: storageCalc.dailyStoragePerCameraGB * input.cameras / 1000,
      daily_storage_per_camera_gb: storageCalc.dailyStoragePerCameraGB,
      total_bitrate_mbps: storageCalc.totalBitrateMbps,
      bitrate_per_camera: storageCalc.bitratePerCamera,
      retention_days: input.retention_days,
      adjusted_bitrate: storageCalc.adjustedBitrate,
      overhead_factor: 1.2
    },
    recommendation: {
      product_name: bestProduct,
      product_model: productSpecs.product_model,
      channel_capacity: productSpecs.channel_capacity,
      storage_capacity_tb: productSpecs.storage_capacity_tb,
      cpu: productSpecs.cpu,
      ram: productSpecs.ram,
      raid_support: productSpecs.raid_support,
      suitable_for: productSpecs.suitable_for,
      why_recommended: `Perfect for your ${input.cameras} camera deployment requiring ${storageCalc.totalStorageTB.toFixed(1)} TB storage with ${input.retention_days} days retention`,
      key_benefits: productSpecs.key_features
    },
    optimization: {
      suggestions: [
        'Consider H.265 compression for 50% storage savings',
        'Implement motion-based recording to reduce storage needs',
        'Use RAID 5 for optimal performance and redundancy'
      ],
      insights: [
        'Storage calculated using industry-standard bitrate tables',
        'Recommendation optimized for your specific camera configuration',
        'Includes 20% overhead for system metadata and indexing'
      ]
    },
    summary: `Recommended ${bestProduct} for your ${input.cameras} camera surveillance system`,
    is_fallback: true,
    fallback_reason: 'Gemini API not configured - using intelligent mock recommendations'
  };
}
