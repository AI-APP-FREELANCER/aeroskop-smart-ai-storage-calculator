import { GoogleGenerativeAI } from '@google/generative-ai';
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

// Product URL mapping
const PRODUCT_URLS: Record<string, string> = {
  'AeroFlex AF-1632 NVR': '/products/aeroflex-af-1632',
  'AeroFlex AF-3264 NVR': '/products/aeroflex-af-3264',
  'AeroFlex AF-64128 NVR': '/products/aeroflex-af-64128',
  'Aeroskop Rhino ASK-SR212': '/products/rhino-ask-sr212',
  'Aeroskop Rhino ASK-SR224': '/products/rhino-ask-sr224',
  'AeroStor Nova-360': '/products/aerostor-nova-360'
};

// Helper function to get product URL
function getProductUrl(productName: string): string {
  return PRODUCT_URLS[productName] || '/products';
}

// System prompt for Gemini AI
const SYSTEM_PROMPT = `You are a specialized AI assistant for surveillance camera storage calculations and analysis. Your primary goal is to provide accurate, slightly generous storage recommendations based on industry-standard formulas.

CRITICAL REQUIREMENTS:
You MUST calculate storage requirements using the exact formulas provided below.
You MUST format your response as valid JSON, strictly following the RESPONSE FORMAT defined below.
You MUST include the single best Aeroskop/Aeroflex product recommendation based on the calculated storage requirements.
You MUST NOT include system configuration recommendations.

RESOLUTION MEGAPIXEL (MP) REFERENCE TABLE:
3840 x 2160 (4K): 8.29 MP
3072 x 2048: 6.29 MP
2592 x 1944: 5.04 MP
2592 x 1520: 3.93 MP
2560 x 1440: 3.69 MP
2304 x 1296: 2.99 MP
1920 x 1080 (1080p): 2.07 MP
1280 x 720 (720p): 0.92 MP

STORAGE CALCULATION FORMULAS (USE THESE EXACT FORMULAS):

Step 1: Determine Base Bitrate (Mbps)
Use this bitrate lookup table based on resolution, FPS, and quality:
720p (0.92 MP): 15fps (Low: 0.9, Medium: 1.2, High: 1.5), 30fps (Low: 1.2, Medium: 1.6, High: 2.0), 60fps (Low: 2.4, Medium: 3.2, High: 4.0)
1080p (2.07 MP): 15fps (Low: 2.0, Medium: 2.5, High: 3.0), 30fps (Low: 3.0, Medium: 3.5, High: 4.0), 60fps (Low: 6.0, Medium: 7.0, High: 8.0)
4MP: 15fps (Low: 3.0, Medium: 4.0, High: 5.0), 30fps (Low: 4.0, Medium: 5.0, High: 6.0), 60fps (Low: 8.0, Medium: 10.0, High: 12.0)
4K (8.29 MP): 15fps (Low: 6.0, Medium: 8.0, High: 10.0), 30fps (Low: 8.0, Medium: 10.0, High: 12.0), 60fps (Low: 16.0, Medium: 20.0, High: 24.0)
8K: 15fps (Low: 20.0, Medium: 25.0, High: 30.0), 30fps (Low: 30.0, Medium: 40.0, High: 50.0), 60fps (Low: 60.0, Medium: 80.0, High: 100.0)

If custom_bitrate is provided, use that value directly. Otherwise, use the table above.
If custom_fps is provided, scale the bitrate: baseBitrate * (custom_fps / 30)
If fps differs from 30, scale: baseBitrate * (fps / 30)

Step 2: Apply Compression Factor
H.265: multiply by 0.6
H.264: multiply by 1.0
MJPEG: multiply by 4.0
adjusted_bitrate = baseBitrate * compressionFactor

Step 3: Handle Motion Recording (if recording_mode is "motion")
Average motion event duration: 10 seconds
Effective percentage = activity_percent * ((pre_record_seconds + 10 + post_record_seconds) / 10)
Cap at 100%
adjusted_motion_percent = min(100, activity_percent * timeMultiplier)

Step 4: Calculate Daily Storage per Camera
CRITICAL: Convert time using the input recording_hours_per_day.
seconds_to_record = recording_hours_per_day * 3600

Step 4a: Convert bitrate to MB/second
bytes_per_second_mb = adjusted_bitrate (in Mbps) / 8

Step 4b: Calculate per-day data
daily_storage_mb = bytes_per_second_mb * seconds_to_record

Step 4c: Apply motion activity as MULTIPLIER
daily_storage_with_activity_mb = daily_storage_mb * (adjusted_motion_percent / 100)

Step 4d: Convert to GB
daily_storage_per_camera_gb = daily_storage_with_activity_mb / 1024

Step 5: Calculate Total Usable Storage
total_storage_mb = daily_storage_with_activity_mb * retention_days * cameras
Convert MB to TB: total_storage_tb = total_storage_mb / 1048576 (Note: 1024 * 1024)

Step 6: Apply Safety Margin (CRITICAL)
For customer satisfaction, you MUST round the final total_storage_tb value UP to the nearest whole number (integer).

Step 7: Calculate Total Bitrate
total_bitrate_mbps = adjusted_bitrate * cameras

REFERENCE CALCULATION EXAMPLE (MUST MATCH THIS EXACTLY):
1 camera, 1080p (2.07 MP), 25 fps, H.264, 4 Mbps, 24 hours/day, 1 day, 100% activity:
Bitrate: 4 Mbps (adjusted)
Seconds to record: 24 * 3600 = 86400 s
Convert to MB/s: 4 Mbps ÷ 8 = 0.5 MB/s
Daily storage MB: 0.5 MB/s × 86,400 s = 43,200 MB
Convert to GB: 43,200 MB ÷ 1024 = 42.19 GB
Total Storage (1 day, 1 cam): 43,200 MB
Convert to TB: 43,200 / 1048576 = 0.0412 TB
Safety Margin (Round up): 1 TB (Result must be at least 1 TB for usable storage)

AVAILABLE AEROSKOP/AEROFLEX PRODUCTS:
"AeroFlex AF-1632 NVR" - 16-32 channels, 36 TB storage, Intel Core i5, 16GB RAM
"AeroFlex AF-3264 NVR" - 32-64 channels, 72 TB storage, Intel Core i7, 32GB RAM
"AeroFlex AF-64128 NVR" - 64-128 channels, 144 TB storage, Intel Core i9, 64GB RAM
"Aeroskop Rhino ASK-SR212" - 250-350 cameras, 240 TB storage, Dual Xeon Silver, 64GB DDR5 ECC
"Aeroskop Rhino ASK-SR224" - 350-400 cameras, 480 TB storage, Dual Xeon Silver, 128GB DDR5 ECC
"AeroStor Nova-360" - Unlimited channels, 999 TB storage, Distributed Processing

PRODUCT RECOMMENDATION RULES:
Recommend the SINGLE best-fitting product from the list above.
The product should match or exceed the Total Usable Storage (rounded up) and the camera count.
Prioritize AeroFlex products for smaller deployments (<128 cameras).
Prioritize Rhino products for larger deployments (>=128 cameras).
Choose the most cost-effective option that meets all requirements.

RESPONSE FORMAT (JSON):
{
  "calculations": {
    "total_usable_storage_tb": <calculated total storage, rounded UP to the nearest integer TB>,
    "daily_storage_per_camera_gb": <calculated GB value, to two decimal places>,
    "total_bitrate_mbps": <calculated number>,
    "bitrate_per_camera": <input custom_bitrate or calculated adjusted_bitrate>,
    "retention_days": <input value>,
    "adjusted_bitrate": <calculated adjusted_bitrate>
  },
  "top_products": [
    {
      "product_name": "Product Name",
      "product_model": "Model Code",
      "channel_capacity": "Capacity Range",
      "storage_capacity_tb": <TB capacity from list>,
      "why_recommended": "Detailed explanation why this product is the best match for the calculated storage and camera count requirements."
    }
  ],
  "summary": "Brief summary of the storage analysis results and the recommended product."
}

CRITICAL INSTRUCTIONS:
You MUST use the recording_hours_per_day input variable in your calculation (Step 4).
You MUST use 1,048,576 as the divisor for MB to TB conversion (1024 * 1024).
You MUST round the final total_usable_storage_tb value UP to the nearest whole integer TB for the calculation and product recommendation.
DO NOT include system configuration recommendations.`;

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
  pre_record_seconds?: number;
  post_record_seconds?: number;
  custom_bitrate?: number;
  custom_fps?: number;
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
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || 
        apiKey === 'your_gemini_api_key_here' || 
        apiKey.length < 20 || 
        !apiKey.startsWith('AIza')) {
      console.log('🔧 Gemini API key not configured or invalid, using intelligent mock recommendations');
      console.log('🔧 API Key length:', apiKey?.length || 0);
      requestEndTime = new Date();
      console.log('📊 Using mock recommendations - no analytics capture needed');
      return generateMockRecommendations(input);
    }

    // Build the prompt for Gemini with all parameters
    console.log('🧮 Gemini calculation input:', input);
    
    const userPrompt = `
Calculate storage requirements AND recommend the single best Aeroskop/Aeroflex product:

CAMERA PARAMETERS:

Number of Cameras: ${input.cameras}
Resolution: ${input.resolution}${input.resolution === '1080p' ? ' (2.07 MP)' : input.resolution === '720p' ? ' (0.92 MP)' : input.resolution === '4MP' ? ' (4 MP)' : input.resolution === '4K' ? ' (8.29 MP)' : ''}
Frame Rate: ${input.fps} FPS
Codec: ${input.codec}
Quality: ${input.quality}
Activity Level: ${input.activity_percent}%
Recording Hours/Day: ${input.recording_hours_per_day}
Retention Days: ${input.retention_days}
Recording Mode: ${input.recording_mode}
${input.custom_bitrate !== undefined && input.custom_bitrate > 0 ? `Custom Bitrate: ${input.custom_bitrate} Mbps` : ''}
${input.custom_fps !== undefined && input.custom_fps > 0 ? `Custom FPS: ${input.custom_fps}` : ''}
${input.pre_record_seconds !== undefined ? `Pre-record Seconds: ${input.pre_record_seconds}` : ''}
${input.post_record_seconds !== undefined ? `Post-record Seconds: ${input.post_record_seconds}` : ''}

CRITICAL INSTRUCTIONS:

Use the exact formulas provided in the system prompt.

GUARDRAIL: If you receive a value of 0 for Number of Cameras, Custom Bitrate, Activity Level, or Retention Days, you MUST treat that value as 1 for the purpose of calculation. This prevents a final result of 0.

CRITICAL: Use recording_hours_per_day (${input.recording_hours_per_day}) in Step 4 calculation: seconds_to_record = ${input.recording_hours_per_day} * 3600

Use 1,048,576 (1024 * 1024) for MB to TB conversion.

Round the final total_usable_storage_tb UP to the nearest whole integer TB.

Motion activity acts as a MULTIPLIER on daily data.

MUST include top_products array with exactly 1 best-fitting Aeroskop/Aeroflex product.

Recommend the single most suitable product that best matches the requirements.

DO NOT include system configuration recommendations.

Calculate all values from scratch using the provided parameters.
`;

    // Estimate input tokens (rough approximation)
    tokensInput = Math.ceil((SYSTEM_PROMPT + userPrompt).length / 4);

    // Get Gemini model
    // Using gemini-2.5-flash as it's available for v1beta API
    // gemini-pro and gemini-1.5-flash were returning 404 Not Found for v1beta API
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Generate response from Gemini
    const result = await model.generateContent(SYSTEM_PROMPT + '\n\n' + userPrompt);
    const response = await result.response;
    const text = response.text();

    // Log raw response for debugging
    console.log('📥 Raw Gemini Response:', {
      textLength: text.length,
      textPreview: text.substring(0, 500),
      fullText: text
    });

    // Estimate output tokens
    tokensOutput = Math.ceil(text.length / 4);
    tokensTotal = tokensInput + tokensOutput;

    requestEndTime = new Date();

    // Parse and validate the response
    const aiResponse = validateAndFormatGeminiResponse(text, input);
    
    // Log parsed response for debugging
    console.log('✅ Parsed AI Response:', {
      total_storage_tb: aiResponse.calculations.total_storage_tb,
      total_usable_storage_tb: aiResponse.calculations.total_usable_storage_tb || aiResponse.calculations.total_storage_tb,
      daily_storage_per_camera_gb: aiResponse.calculations.daily_storage_per_camera_gb,
      calculations: aiResponse.calculations
    });

    // Capture analytics (non-blocking) - simplified for now
    console.log('📊 Gemini Analytics:', {
      sessionId: analyticsContext?.sessionId,
      model: 'gemini-2.5-flash',
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
      model: 'gemini-2.5-flash',
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
  input: any
): AIRecommendationResponse {
  try {
    console.log('🔍 Parsing Gemini response...', {
      responseLength: responseText.length,
      responsePreview: responseText.substring(0, 300)
    });
    
    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('❌ No JSON found in response. Full response:', responseText);
      throw new Error('No JSON found in response');
    }

    console.log('📋 Extracted JSON:', jsonMatch[0].substring(0, 500));
    
    const aiData = JSON.parse(jsonMatch[0]);
    console.log('✅ Parsed JSON data:', {
      hasCalculations: !!aiData.calculations,
      calculations: aiData.calculations,
      total_usable_storage_tb: aiData.calculations?.total_usable_storage_tb,
      total_storage_tb: aiData.calculations?.total_storage_tb
    });

    // Validate required fields
    if (!aiData.calculations) {
      throw new Error('Invalid response structure - missing calculations');
    }

    // Validate calculations are numbers
    // Support both old format (total_storage_tb) and new format (total_usable_storage_tb)
    let totalStorage = aiData.calculations.total_usable_storage_tb !== undefined 
      ? Number(aiData.calculations.total_usable_storage_tb)
      : Number(aiData.calculations.total_storage_tb) || 0;
    
    const dailyStoragePerCameraGB = Number(aiData.calculations.daily_storage_per_camera_gb) || 0;
    const adjustedBitrate = Number(aiData.calculations.adjusted_bitrate) || 0;
    const totalBitrate = Number(aiData.calculations.total_bitrate_mbps) || 0;
    const bitratePerCamera = Number(aiData.calculations.bitrate_per_camera) || 0;
    
    // Safety check: If storage is 0 or invalid, recalculate from parameters
    if (totalStorage === 0 || isNaN(totalStorage)) {
      console.warn('⚠️ Gemini returned 0 or invalid storage. Recalculating from parameters...', {
        totalStorage,
        dailyStoragePerCameraGB,
        adjustedBitrate,
        input
      });
      
      // Recalculate using the formulas
      const effectiveBitrate = input.custom_bitrate || adjustedBitrate || 4.0;
      const compressionFactor = input.codec === 'H.265' ? 0.6 : input.codec === 'H.264' ? 1.0 : 0.8;
      const finalBitrate = effectiveBitrate * compressionFactor;
      const secondsToRecord = input.recording_hours_per_day * 3600;
      const dailyStorageMB = (finalBitrate * secondsToRecord) / 8;
      const dailyWithActivity = dailyStorageMB * (input.activity_percent / 100);
      const totalStorageMB = dailyWithActivity * input.retention_days * input.cameras;
      totalStorage = Math.ceil(totalStorageMB / 1_048_576); // Round up to nearest TB
      
      console.log('✅ Recalculated storage:', {
        effectiveBitrate,
        finalBitrate,
        secondsToRecord,
        dailyStorageMB,
        dailyWithActivity,
        totalStorageMB,
        totalStorage
      });
    }
    
    const calculations = {
      total_storage_tb: totalStorage, // Keep for backward compatibility
      total_usable_storage_tb: totalStorage, // New field name
      daily_storage_tb: 0, // Removed from new format, calculate if needed
      daily_storage_per_camera_gb: dailyStoragePerCameraGB || (totalStorage > 0 ? (totalStorage * 1024) / (input.cameras * input.retention_days) : 0),
      total_bitrate_mbps: totalBitrate || (adjustedBitrate * input.cameras),
      bitrate_per_camera: bitratePerCamera || adjustedBitrate,
      retention_days: input.retention_days,
      adjusted_bitrate: adjustedBitrate || (input.custom_bitrate || 4.0) * (input.codec === 'H.265' ? 0.6 : input.codec === 'H.264' ? 1.0 : 0.8),
      overhead_factor: 0 // No longer used, but required by interface
    };
    
    // Calculate daily_storage_tb if not provided (for backward compatibility)
    if (!aiData.calculations.daily_storage_tb && calculations.daily_storage_per_camera_gb > 0) {
      calculations.daily_storage_tb = (calculations.daily_storage_per_camera_gb * input.cameras) / 1000;
    }

    // Parse product recommendations from Gemini
    let topProducts: StorageRecommendation[] = [];
    let primaryRecommendation: StorageRecommendation | null = null;

    if (aiData.top_products && Array.isArray(aiData.top_products) && aiData.top_products.length > 0) {
      // Map products and filter out duplicates by product_name
      const productMap = new Map<string, StorageRecommendation>();
      
      aiData.top_products.forEach((product: any) => {
        const productName = product.product_name || '';
        // Skip if we already have this product
        if (productMap.has(productName)) {
          return;
        }
        
        const productSpecs = PRODUCT_SPECIFICATIONS[productName as keyof typeof PRODUCT_SPECIFICATIONS];
        
        productMap.set(productName, {
          product_name: productName,
          product_model: product.product_model || productSpecs?.product_model || 'N/A',
          product_image_url: `/images/products/${(product.product_model || productSpecs?.product_model || 'default').toLowerCase().replace(/\s+/g, '-')}.jpg`,
          product_url: getProductUrl(productName),
          channel_capacity: product.channel_capacity || productSpecs?.channel_capacity || 'N/A',
          storage_capacity_tb: product.storage_capacity_tb || productSpecs?.storage_capacity_tb || 0,
          cpu: product.cpu || productSpecs?.cpu || 'N/A',
          ram: product.ram || productSpecs?.ram || 'N/A',
          pros: product.pros || ['High performance', 'Reliable storage'],
          cons: product.cons || [],
          raid_support: product.raid_support || productSpecs?.raid_support || 'N/A',
          suitable_for: product.suitable_for || productSpecs?.suitable_for || [],
          why_recommended: product.why_recommended || `Recommended for your ${input.cameras} camera deployment`,
          key_benefits: product.key_benefits || productSpecs?.key_features || []
        });
      });
      
      topProducts = Array.from(productMap.values());
      primaryRecommendation = topProducts[0];
    } else {
      // Fallback: generate recommendations based on calculations
      const storageForRecommendation = calculations.total_usable_storage_tb || calculations.total_storage_tb;
      const bestProduct = findBestProduct(storageForRecommendation, input.cameras) as keyof typeof PRODUCT_SPECIFICATIONS;
      const secondBestProduct = findSecondBestProduct(storageForRecommendation, input.cameras, bestProduct) as keyof typeof PRODUCT_SPECIFICATIONS;
      
      const productSpecs = PRODUCT_SPECIFICATIONS[bestProduct];
      const secondProductSpecs = PRODUCT_SPECIFICATIONS[secondBestProduct];
      
      // Only add second product if it's different from the first
      topProducts = [
        {
          product_name: bestProduct,
          product_model: productSpecs.product_model,
          product_image_url: `/images/products/${productSpecs.product_model.toLowerCase().replace(/\s+/g, '-')}.jpg`,
          product_url: getProductUrl(bestProduct),
          channel_capacity: productSpecs.channel_capacity,
          storage_capacity_tb: productSpecs.storage_capacity_tb,
          cpu: productSpecs.cpu,
          ram: productSpecs.ram,
          pros: ['High performance', 'Reliable storage', 'Scalable solution'],
          cons: ['Requires professional installation'],
          raid_support: productSpecs.raid_support,
          suitable_for: productSpecs.suitable_for,
          why_recommended: `Perfect for your ${input.cameras} camera deployment requiring ${(calculations.total_usable_storage_tb || calculations.total_storage_tb).toFixed(1)} TB storage`,
          key_benefits: productSpecs.key_features
        }
      ];
      
      // Only add second product if it's different from the first
      if (secondBestProduct && secondBestProduct !== bestProduct) {
        topProducts.push({
          product_name: secondBestProduct,
          product_model: secondProductSpecs.product_model,
          product_image_url: `/images/products/${secondProductSpecs.product_model.toLowerCase().replace(/\s+/g, '-')}.jpg`,
          product_url: getProductUrl(secondBestProduct),
          channel_capacity: secondProductSpecs.channel_capacity,
          storage_capacity_tb: secondProductSpecs.storage_capacity_tb,
          cpu: secondProductSpecs.cpu,
          ram: secondProductSpecs.ram,
          pros: ['Good performance', 'Cost-effective'],
          cons: ['May require expansion'],
          raid_support: secondProductSpecs.raid_support,
          suitable_for: secondProductSpecs.suitable_for,
          why_recommended: `Alternative option for your ${input.cameras} camera deployment`,
          key_benefits: secondProductSpecs.key_features
        });
      }
      
      primaryRecommendation = topProducts[0];
    }

    // Final deduplication: remove any duplicates by product_name
    const uniqueProducts = topProducts.filter((product, index, self) =>
      index === self.findIndex((p) => p.product_name === product.product_name)
    );

    return {
      cached: false,
      calculations,
      recommendation: primaryRecommendation,
      top_products: uniqueProducts.length >= 2 ? uniqueProducts : (uniqueProducts.length === 1 ? uniqueProducts : undefined),
      optimization: aiData.optimization || {
        suggestions: ['Optimize compression settings', 'Consider motion-based recording'],
        insights: ['Storage requirements calculated using industry standards', 'Recommendation based on camera count and retention needs']
      },
      summary: aiData.summary || `Storage analysis completed for ${input.cameras} camera deployment`,
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
  
  // Simple mock calculation for fallback (when API is not available)
  // This is a basic estimation - real calculations should come from Gemini
  const estimatedBitrate = 4.0; // Default estimate
  const compressionFactor = input.codec === 'H.265' ? 0.6 : input.codec === 'H.264' ? 1.0 : 0.8;
  const adjustedBitrate = estimatedBitrate * compressionFactor;
  // Use recording_hours_per_day dynamically (not hardcoded 24 hours)
  const secondsToRecord = input.recording_hours_per_day * 3600;
  const dailyStorageMB = (adjustedBitrate * secondsToRecord) / 8;
  const dailyWithActivity = dailyStorageMB * (input.activity_percent / 100);
  const totalStorageMB = dailyWithActivity * input.retention_days * input.cameras;
  // Use 1,048,576 (1024 * 1024) for MB to TB conversion
  const totalStorageTB = totalStorageMB / 1_048_576;

  console.log('📊 Mock storage calculation result:', { totalStorageTB });

  const bestProduct = findBestProduct(totalStorageTB, input.cameras) as keyof typeof PRODUCT_SPECIFICATIONS;
  const secondBestProduct = findSecondBestProduct(totalStorageTB, input.cameras, bestProduct) as keyof typeof PRODUCT_SPECIFICATIONS;
  
  const productSpecs = PRODUCT_SPECIFICATIONS[bestProduct];
  const secondProductSpecs = PRODUCT_SPECIFICATIONS[secondBestProduct];
  
  console.log('🏷️ Best products found:', bestProduct, secondBestProduct);

  // Round up to nearest whole TB for safety margin (calculate before using)
  const totalUsableStorageTB = Math.ceil(totalStorageTB);

  const topProducts: StorageRecommendation[] = [
    {
      product_name: bestProduct,
      product_model: productSpecs.product_model,
      product_image_url: `/images/products/${productSpecs.product_model.toLowerCase().replace(/\s+/g, '-')}.jpg`,
      product_url: getProductUrl(bestProduct),
      channel_capacity: productSpecs.channel_capacity,
      storage_capacity_tb: productSpecs.storage_capacity_tb,
      cpu: productSpecs.cpu,
      ram: productSpecs.ram,
      pros: ['High performance', 'Reliable storage', 'Scalable solution'],
      cons: ['Requires professional installation', 'Initial setup complexity'],
      raid_support: productSpecs.raid_support,
      suitable_for: productSpecs.suitable_for,
      why_recommended: `Perfect for your ${input.cameras} camera deployment requiring ${totalUsableStorageTB} TB storage with ${input.retention_days} days retention`,
      key_benefits: productSpecs.key_features
    },
    {
      product_name: secondBestProduct,
      product_model: secondProductSpecs.product_model,
      product_image_url: `/images/products/${secondProductSpecs.product_model.toLowerCase().replace(/\s+/g, '-')}.jpg`,
      product_url: getProductUrl(secondBestProduct),
      channel_capacity: secondProductSpecs.channel_capacity,
      storage_capacity_tb: secondProductSpecs.storage_capacity_tb,
      cpu: secondProductSpecs.cpu,
      ram: secondProductSpecs.ram,
      pros: ['Good performance', 'Reliable storage', 'Cost-effective'],
      cons: ['May require expansion', 'Limited scalability'],
      raid_support: secondProductSpecs.raid_support,
      suitable_for: secondProductSpecs.suitable_for,
      why_recommended: `Alternative option for your ${input.cameras} camera deployment`,
      key_benefits: secondProductSpecs.key_features
    }
  ];
  
  return {
    cached: false,
    calculations: {
      total_storage_tb: totalUsableStorageTB, // Keep for backward compatibility
      total_usable_storage_tb: totalUsableStorageTB, // New field name
      daily_storage_tb: (dailyWithActivity * input.cameras) / 1000,
      daily_storage_per_camera_gb: dailyWithActivity / 1024,
      total_bitrate_mbps: adjustedBitrate * input.cameras,
      bitrate_per_camera: adjustedBitrate,
      retention_days: input.retention_days,
      adjusted_bitrate: adjustedBitrate,
      overhead_factor: 0 // No longer used, but required by interface
    },
    recommendation: topProducts[0],
    top_products: topProducts,
    optimization: {
      suggestions: [
        'Consider H.265 compression for 50% storage savings',
        'Implement motion-based recording to reduce storage needs'
      ],
      insights: [
        'Storage calculated using industry-standard bitrate tables',
        'Recommendation optimized for your specific camera configuration',
        'Storage rounded up to nearest whole TB for safety margin'
      ]
    },
    summary: `Recommended ${bestProduct} and ${secondBestProduct} for your ${input.cameras} camera surveillance system`,
    is_fallback: true,
    fallback_reason: 'Gemini API not configured - using intelligent mock recommendations'
  };
}

function findSecondBestProduct(requiredStorageTB: number, cameraCount: number, excludeProduct: string): string {
  const products = Object.entries(PRODUCT_SPECIFICATIONS);
  
  // Find products that can handle the requirements, excluding the best product
  const suitableProducts = products.filter(([name, specs]) => {
    if (name === excludeProduct) return false;
    
    const maxCameras = parseInt(specs.channel_capacity.split('-').pop() || '0');
    const minCameras = parseInt(specs.channel_capacity.split('-')[0] || '0');
    
    const cameraMatch = (cameraCount >= minCameras && cameraCount <= maxCameras) || 
                       (cameraCount > maxCameras && cameraCount <= maxCameras * 1.2);
    const storageMatch = specs.storage_capacity_tb >= requiredStorageTB * 0.5;
    
    return cameraMatch && storageMatch;
  });

  if (suitableProducts.length === 0) {
    // If no exact match, find the closest product by storage capacity (excluding best)
    const sortedByStorage = products
      .filter(([name]) => name !== excludeProduct)
      .sort((a, b) => 
        Math.abs(a[1].storage_capacity_tb - requiredStorageTB) - 
        Math.abs(b[1].storage_capacity_tb - requiredStorageTB)
      );
    return sortedByStorage[0]?.[0] || excludeProduct;
  }

  // Return the second most cost-effective option
  return suitableProducts[0][0];
}
