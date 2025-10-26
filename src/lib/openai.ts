import OpenAI from 'openai';
import { StorageRecommendationRequest, AIRecommendationResponse } from './types';
import { calculateAccurateStorage } from './storageCalculations';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key',
});


// Product specifications for Aeroskop storage solutions
const PRODUCT_SPECIFICATIONS = `
AEROSKOP STORAGE SOLUTIONS:

1. AeroFlex AF-1632 NVR (All-in-One Solution):
   - Channels: 16-32 (expandable to 50)
   - CPU: Intel Core i5, 14th Gen
   - RAM: 16 GB DDR4 (expandable to 64 GB)
   - Storage: 9 x 3.5" SATA III HDD bays (HDD not included)
   - RAID: OpenZFS RAID-Z1/Z2/MIRRORING
   - Graphics: NVIDIA T 400 4GB with 3 HDMI ports
   - Storage Options: 4TB/8TB/12TB/20TB/22TB SATA III
   - Features: VMS + Recording + Workstation + Video Wall
   - Network: 5 x Gigabit Ethernet Ports
   - Power: 500W ATX Standard PSU
   - Best for: Small to medium businesses, 16-32 cameras
   - Estimated Cost: $3,500 - $5,000

2. AeroFlex AF-3264 NVR (Mid-Range Solution):
   - Channels: 32-64 (expandable to 80)
   - CPU: Intel Core i7, 14th Gen
   - RAM: 32 GB DDR4 (expandable to 64 GB)
   - Storage: 9 x 3.5" SATA III HDD bays (HDD not included)
   - RAID: OpenZFS RAID-Z1/Z2
   - Graphics: NVIDIA RTX 1000 4GB
   - Storage Options: 4TB/8TB/12TB/20TB/22TB SATA III
   - Features: VMS + Recording + Workstation + Video Wall
   - Network: 5 x Gigabit Ethernet Ports
   - Power: 500W ATX Standard PSU
   - Best for: Medium to large businesses, 32-64 cameras
   - Estimated Cost: $6,000 - $8,500

3. AeroFlex AF-64128 NVR (Enterprise Solution):
   - Channels: 64-128 (expandable to 150)
   - CPU: Intel Core i9, 14th Gen
   - RAM: 64 GB DDR4 (expandable to 64 GB)
   - Storage: 9 x 3.5" SATA III HDD bays (HDD not included)
   - RAID: OpenZFS RAID-Z1/Z2
   - Graphics: NVIDIA RTX A2000 12GB with 4 HDMI ports
   - Storage Options: 4TB/8TB/12TB/20TB/22TB SATA III
   - Features: VMS + Recording + Workstation + Video Wall
   - Network: 5 x Gigabit Ethernet Ports
   - Power: 800W Dual Redundant ATX Standard PSU
   - Best for: Large enterprises, 64-128 cameras
   - Estimated Cost: $10,000 - $15,000

4. Aeroskop Rhino ASK-SR212 (2U Storage Server):
   - CPU: 1-2 x Intel Xeon Silver 4410Y 12 Core (24 cores total)
   - RAM: 64 GB DDR5 ECC (maximum 4 TB)
   - Storage: 12 x 3.5" HDD bays (240 TB raw capacity)
   - RAID: OpenZFS RAID-Z1/Z2/Z3
   - Network: 2 x 10GBASE-T + 1 x 1Gbps RJ45 + IPMI
   - Power: Dual Hot-plug Redundant PSU (800W each)
   - Features: Hot-swappable drives, IPMI management
   - Best for: High-capacity storage, 250-350 cameras
   - Estimated Cost: $8,000 - $12,000

5. Aeroskop Rhino ASK-SR224 (4U Storage Server):
   - CPU: 2 x Intel Xeon Silver 4410Y 12 Core (24 cores total)
   - RAM: 128 GB DDR5 ECC (maximum 4 TB)
   - Storage: 24 x 3.5" HDD bays (480 TB raw capacity)
   - RAID: OpenZFS RAID-Z1/Z2/Z3
   - Network: 2 x 10GBASE-T + 1 x 1Gbps RJ45 + IPMI
   - Power: Dual Hot-plug Redundant PSU (1300W each)
   - Features: Hot-swappable drives, IPMI management
   - Best for: Enterprise storage, 350-400 cameras
   - Estimated Cost: $15,000 - $25,000

6. AeroStor Nova-360 (Software-Defined Storage):
   - Technology: Ceph-powered SDS (Software-Defined Storage)
   - Architecture: Distributed storage clustering
   - Features: High availability, fault tolerance, self-healing
   - Benefits: Scalable, cost-effective, no licensing fees
   - Storage: Unlimited (scales with nodes)
   - Redundancy: Erasure coding (4:2, 6:2) and replication
   - Best for: Large-scale deployments, cloud-like storage
   - Estimated Cost: $5,000 - $20,000 (depending on configuration)
`;

export async function generateStorageRecommendation(
  input: StorageRecommendationRequest
): Promise<AIRecommendationResponse> {
  try {
    // Check if OpenAI API key is properly configured
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
      console.warn('OpenAI API key not configured. Using mock recommendations for testing.');
      return generateMockRecommendations(input);
    }

    console.log('OpenAI Service - Received input:', input);
    const prompt = buildPrompt(input);
    console.log('Generated prompt:', prompt);
    
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are an expert surveillance storage consultant with deep knowledge of Aeroskop's storage solutions. Your task is to analyze user requirements and provide the single best storage recommendation from the available Aeroskop products.

CRITICAL REQUIREMENTS:
1. You MUST only recommend Aeroskop products listed in the specifications
2. Provide exactly 1 recommendation: the optimal solution for the user's needs
3. The recommendation must include all required fields in the JSON structure
4. Base recommendation on actual product capabilities and user requirements
5. Consider storage capacity, channel count, performance requirements, and future scalability
6. Include key_benefits array highlighting the main advantages of the chosen solution

STORAGE CALCULATION FORMULA:
- Bitrate per camera = Base bitrate × (FPS/30) × Activity multiplier × Recording multiplier
- Base bitrates: 1080p=4Mbps, 4K=16Mbps, 8K=64Mbps (H.264) or 50% less (H.265)
- Activity multipliers: Low=0.3, Medium=0.6, High=1.0
- Recording multipliers: Continuous=1.0, Motion-based=0.3
- Daily storage (TB) = (Total bitrate × 3600 × 24) / (8 × 1024³)
- Total storage (TB) = Daily storage × Retention days

PRODUCT MATCHING LOGIC:
- Camera count must fit within channel capacity
- Total storage must fit within physical capacity (consider RAID overhead)
- Scale considerations: NVR for <100 cameras, Storage Server for 100-400 cameras, SDS for >400 cameras
- Select the optimal solution based on: meets all requirements with appropriate headroom, optimal balance of cost/performance/features, future-proofing and scalability needs

RESPONSE FORMAT: Return ONLY valid JSON matching this exact structure:
{
  "recommendation": {
    "product_name": "string",
    "product_model": "string", 
    "product_image_url": "string",
    "channel_capacity": "string",
    "storage_capacity_tb": number,
    "cpu": "string",
    "ram": "string",
    "estimated_cost": number,
    "pros": ["string"],
    "cons": ["string"],
    "raid_support": "string",
    "suitable_for": ["string"],
    "why_recommended": "string",
    "key_benefits": ["string"]
  },
  "calculations": {
    "total_storage_tb": number,
    "daily_storage_tb": number,
    "total_bitrate_mbps": number,
    "retention_days": number
  },
  "optimization": {
    "suggestions": ["string"],
    "insights": ["string"],
    "cost_savings": ["string"]
  },
  "summary": "string"
}`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS || '2000'),
      temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.3'),
    });

    const response = completion.choices[0]?.message?.content;
    console.log('OpenAI raw response:', response);
    
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    // Parse and validate JSON response
    const parsedResponse = JSON.parse(response);
    console.log('Parsed AI response:', parsedResponse);
    
    // Extract token usage information
    const tokensUsed = completion.usage?.total_tokens || 0;
    const modelUsed = completion.model;
    
    const result = validateAndFormatResponse(parsedResponse, input);
    
    // Add token usage information to the result
    (result as any).tokens_used = tokensUsed;
    (result as any).model_used = modelUsed;
    
    return result;

  } catch (error: any) {
    // Detect OpenAI specific errors
    const isQuotaError = error?.status === 429 || error?.code === 'insufficient_quota';
    const isRateLimit = error?.status === 429 || error?.code === 'rate_limit_exceeded';
    const isAPIError = error?.status >= 400;
    
    if (isQuotaError) {
      console.warn('⚠️  OpenAI API quota exceeded. Falling back to mock recommendations.');
      console.warn('💡 To enable AI: Add credits at https://platform.openai.com/account/billing');
    } else if (isRateLimit) {
      console.warn('⚠️  OpenAI API rate limit exceeded. Falling back to mock recommendations.');
    } else if (isAPIError) {
      console.warn('⚠️  OpenAI API error:', error.message);
      console.warn('💡 Falling back to mock recommendations.');
    } else {
      console.error('❌ Unexpected error:', error);
    }
    
    // Always fallback to mock recommendations instead of throwing
    console.log('✅ Using intelligent mock recommendations based on your parameters...');
    return generateMockRecommendations(input);
  }
}

function buildPrompt(input: StorageRecommendationRequest): string {
  return `
SURVEILLANCE STORAGE REQUIREMENTS ANALYSIS:

USER SPECIFICATIONS:
- Number of Cameras: ${input.cameras}
- Resolution: ${input.resolution}
- FPS: ${input.fps}
- Codec: ${input.codec}
- Activity Level: ${input.activity_percent}%
- Retention Days: ${input.retention_days}
- Recording Mode: ${input.recording_mode}

STORAGE CALCULATION INSTRUCTIONS:
1. Calculate bitrate per camera using the formula: Base bitrate × (FPS/30) × Activity multiplier × Recording multiplier
2. Calculate total bitrate: bitrate per camera × number of cameras
3. Calculate daily storage: (Total bitrate × 3600 × 24) / (8 × 1024³) in TB
4. Calculate total storage: Daily storage × Retention days
5. Consider RAID overhead (typically 20-25% for RAID-Z1, 40-50% for RAID-Z2)

PRODUCT MATCHING REQUIREMENTS:
- Camera count must be within the product's channel capacity
- Total storage must fit within the product's physical capacity
- Consider future growth and scalability needs
- Match deployment scale: NVR for small/medium, Storage Server for large, SDS for enterprise

${PRODUCT_SPECIFICATIONS}

ANALYSIS TASKS:
1. Calculate exact storage requirements using the provided formulas
2. Match requirements to the single most appropriate Aeroskop product
3. Select the optimal solution based on:
   - Meets all requirements with appropriate headroom
   - Optimal balance of cost/performance/features
   - Future-proofing and scalability needs
4. Provide optimization suggestions for cost savings and performance
5. Include technical insights about storage calculations and deployment considerations
6. List key benefits that make this the best choice

Please analyze these requirements and provide your recommendation in the exact JSON format specified.
`;
}

function validateAndFormatResponse(
  response: any, 
  input: StorageRecommendationRequest
): AIRecommendationResponse {
  // Validate required structure
  if (!response.recommendation || !response.calculations || !response.optimization) {
    throw new Error('Invalid response structure from OpenAI - missing required fields');
  }

  // Validate recommendation structure
  const rec = response.recommendation;
  if (!rec.product_name || !rec.product_model) {
    throw new Error('Missing product name or model in recommendation');
  }
  
  if (!rec.estimated_cost || rec.estimated_cost <= 0) {
    throw new Error('Invalid cost in recommendation');
  }

  // Validate product is from Aeroskop catalog
  const validProducts = [
    'AeroFlex AF-1632', 'AeroFlex AF-3264', 'AeroFlex AF-64128',
    'Aeroskop Rhino ASK-SR212', 'Aeroskop Rhino ASK-SR224', 'AeroStor Nova-360'
  ];
  
  const isValidProduct = validProducts.some(valid => 
    rec.product_name.includes(valid) || rec.product_model.includes(valid)
  );
  
  if (!isValidProduct) {
    console.warn(`Warning: Recommended product may not be from Aeroskop catalog: ${rec.product_name}`);
  }

  // Use provided calculated values if available
  const totalStorage = (input as any).calculated_storage_tb || 
    calculateTotalStorage(input);
  const dailyStorage = (input as any).calculated_daily_storage_tb || 
    calculateDailyStorage(input);
  const totalBitrate = (input as any).calculated_bitrate_mbps || 
    calculateTotalBitrate(input);

  // Validate calculations are reasonable
  if (totalStorage <= 0 || dailyStorage <= 0 || totalBitrate <= 0) {
    throw new Error('Invalid storage calculations');
  }

  // Validate camera capacity
  if (rec.channel_capacity) {
    const maxChannels = parseInt(rec.channel_capacity.split('-').pop() || '0');
    if (maxChannels && input.cameras > maxChannels) {
      console.warn(`Warning: Recommended product may not support ${input.cameras} cameras (max: ${maxChannels})`);
    }
  }

  return {
    cached: false,
    recommendation: rec,
    calculations: {
      total_storage_tb: Number(totalStorage) || 0,
      daily_storage_tb: Number(dailyStorage) || 0,
      daily_storage_per_camera_gb: Number(dailyStorage) / input.cameras / 1000 || 0,
      total_bitrate_mbps: Number(totalBitrate) || 0,
      bitrate_per_camera: Number(totalBitrate) / input.cameras || 0,
      retention_days: input.retention_days,
      adjusted_bitrate: Number(totalBitrate) / input.cameras || 0,
      overhead_factor: 1.2
    },
    optimization: response.optimization,
    summary: response.summary || 'AI-powered storage recommendation'
  };
}

function calculateBitrate(resolution: string, fps: number, codec: string): number {
  // Base bitrate calculations (Mbps)
  const baseBitrates: { [key: string]: number } = {
    '1080p': 4,
    '4K': 16,
    '8K': 32
  };

  const baseBitrate = baseBitrates[resolution] || 4;
  const fpsMultiplier = fps / 30; // Normalize to 30fps
  const codecMultiplier = codec === 'H.265' ? 0.6 : 1.0; // H.265 is more efficient

  return baseBitrate * fpsMultiplier * codecMultiplier;
}


// Legacy functions for backward compatibility
function calculateTotalStorage(input: StorageRecommendationRequest): number {
  const result = calculateAccurateStorage({
    cameras: input.cameras,
    resolution: input.resolution,
    fps: input.fps,
    codec: input.codec,
    quality: 'Medium', // Default quality
    recordingHoursPerDay: 24, // Default 24 hours
    activityPercent: 70, // Default 70% activity
    retentionDays: input.retention_days
  });
  return result.totalStorageTB;
}

function calculateDailyStorage(input: StorageRecommendationRequest): number {
  const result = calculateAccurateStorage({
    cameras: input.cameras,
    resolution: input.resolution,
    fps: input.fps,
    codec: input.codec,
    quality: 'Medium',
    recordingHoursPerDay: 24,
    activityPercent: 70,
    retentionDays: input.retention_days
  });
  return result.dailyStoragePerCameraGB;
}

function calculateTotalBitrate(input: StorageRecommendationRequest): number {
  const result = calculateAccurateStorage({
    cameras: input.cameras,
    resolution: input.resolution,
    fps: input.fps,
    codec: input.codec,
    quality: 'Medium',
    recordingHoursPerDay: 24,
    activityPercent: 70,
    retentionDays: input.retention_days
  });
  return result.totalBitrateMbps;
}

function generateMockRecommendations(input: StorageRecommendationRequest): AIRecommendationResponse {
  // Use accurate calculation logic
  const accurateCalc = calculateAccurateStorage({
    cameras: input.cameras,
    resolution: input.resolution,
    fps: input.fps,
    codec: input.codec,
    quality: input.quality,
    recordingHoursPerDay: input.recording_hours_per_day,
    activityPercent: input.activity_percent,
    retentionDays: input.retention_days
  });
  
  const totalStorage = accurateCalc.totalStorageTB;
  const dailyStorage = accurateCalc.dailyStoragePerCameraGB * input.cameras / 1000; // Convert to TB
  const totalBitrate = accurateCalc.totalBitrateMbps;
  const bitratePerCamera = accurateCalc.bitratePerCamera;

  // Ensure all values are numbers
  const safeTotalStorage = Number(totalStorage) || 0;
  const safeDailyStorage = Number(dailyStorage) || 0;
  const safeTotalBitrate = Number(totalBitrate) || 0;

  console.log('Mock AI - Input parameters:', input);
  console.log('Mock AI - Calculated storage:', { totalStorage, dailyStorage, totalBitrate });

  // Select the single best Aeroskop solution based on requirements
  let recommendedProduct;

  // Intelligent product selection based on actual requirements
  if (input.cameras <= 32 && totalStorage <= 50) {
    // Small deployment - AeroFlex NVR
    recommendedProduct = {
      product_name: "AeroFlex AF-1632 NVR",
      product_model: "AF-1632",
      product_image_url: "/images/aeroflex-1632.jpg",
      channel_capacity: "16-32 channels",
      storage_capacity_tb: Math.max(50, totalStorage * 1.5),
      cpu: "Intel Core i5, 14th Gen",
      ram: "16 GB DDR4",
      estimated_cost: Math.round(3500 + (totalStorage * 20)),
      pros: ["All-in-one solution", "Easy setup", "Budget-friendly", "VMS + Recording + Workstation"],
      cons: ["Limited scalability"],
      raid_support: "OpenZFS RAID-Z1/Z2/MIRRORING",
      suitable_for: ["Small offices", "Retail stores", "Basic surveillance"],
      why_recommended: `Perfect all-in-one solution for ${input.cameras} cameras with ${totalStorage.toFixed(1)}TB storage needs`,
      key_benefits: [
        "Complete surveillance solution in one device",
        "No additional software licensing required",
        "Built-in video wall support with 3 HDMI ports",
        "Easy to install and configure"
      ]
    };
  } else if (input.cameras <= 64 && totalStorage <= 200) {
    // Medium deployment - AeroFlex higher model
    recommendedProduct = {
      product_name: "AeroFlex AF-3264 NVR",
      product_model: "AF-3264",
      product_image_url: "/images/aeroflex-3264.jpg",
      channel_capacity: "32-64 channels",
      storage_capacity_tb: Math.max(100, totalStorage * 1.5),
      cpu: "Intel Core i7, 14th Gen",
      ram: "32 GB DDR4",
      estimated_cost: Math.round(6000 + (totalStorage * 25)),
      pros: ["High performance", "More channels", "GPU acceleration", "Dual redundant PSU"],
      cons: ["Higher cost"],
      raid_support: "OpenZFS RAID-Z1/Z2",
      suitable_for: ["Medium businesses", "Warehouses", "Multi-building sites"],
      why_recommended: `Optimal solution for ${input.cameras} cameras with room for growth`,
      key_benefits: [
        "Enterprise-grade performance with Intel Core i7",
        "NVIDIA RTX 1000 GPU for advanced video processing",
        "Dual redundant power supply for reliability",
        "Expandable to 80 channels for future growth"
      ]
    };
  } else if (input.cameras <= 128 && totalStorage <= 400) {
    // Large deployment - AeroFlex Enterprise
    recommendedProduct = {
      product_name: "AeroFlex AF-64128 NVR",
      product_model: "AF-64128",
      product_image_url: "/images/aeroflex-64128.jpg",
      channel_capacity: "64-128 channels",
      storage_capacity_tb: Math.max(200, totalStorage * 1.5),
      cpu: "Intel Core i9, 14th Gen",
      ram: "64 GB DDR4",
      estimated_cost: Math.round(10000 + (totalStorage * 30)),
      pros: ["Enterprise features", "GPU acceleration", "Video wall support", "Dual redundant PSU"],
      cons: ["Premium pricing"],
      raid_support: "OpenZFS RAID-Z1/Z2",
      suitable_for: ["Large enterprises", "Control rooms", "High-security facilities"],
      why_recommended: `Enterprise solution for ${input.cameras} cameras with ${totalStorage.toFixed(1)}TB storage`,
      key_benefits: [
        "Top-tier Intel Core i9 processor for maximum performance",
        "NVIDIA RTX A2000 12GB GPU with 4 HDMI ports for video walls",
        "800W Dual Redundant PSU for enterprise reliability",
        "Expandable to 150 channels for large deployments"
      ]
    };
  } else if (input.cameras <= 400 && totalStorage <= 1000) {
    // Very large deployment - Rhino Storage Server
    recommendedProduct = {
      product_name: "Aeroskop Rhino ASK-SR224",
      product_model: "ASK-SR224",
      product_image_url: "/images/rhino-sr224.jpg",
      channel_capacity: "350-400 cameras",
      storage_capacity_tb: Math.max(480, totalStorage * 1.2),
      cpu: "2 x Intel Xeon Silver 4410Y (24 cores total)",
      ram: "128 GB DDR5 ECC",
      estimated_cost: Math.round(15000 + (totalStorage * 25)),
      pros: ["Maximum capacity", "Enterprise reliability", "Hot-swappable drives", "Dual CPU"],
      cons: ["Requires separate NVR", "Higher complexity"],
      raid_support: "OpenZFS RAID-Z1/Z2/Z3",
      suitable_for: ["Enterprise facilities", "Data centers", "Critical infrastructure"],
      why_recommended: `High-capacity storage server for ${input.cameras} cameras with ${totalStorage.toFixed(1)}TB storage`,
      key_benefits: [
        "24-core processing power with dual Xeon processors",
        "24 x 3.5\" HDD bays for 480TB raw capacity",
        "Hot-swappable drives for zero-downtime maintenance",
        "Dual 1300W redundant PSU for enterprise reliability"
      ]
    };
  } else {
    // Massive deployment - Software-Defined Storage
    recommendedProduct = {
      product_name: "AeroStor Nova-360",
      product_model: "Nova-360",
      product_image_url: "/images/novastor-360.jpg",
      channel_capacity: "Unlimited (scales with nodes)",
      storage_capacity_tb: Math.max(1000, totalStorage * 1.5),
      cpu: "Distributed across nodes",
      ram: "Scalable",
      estimated_cost: Math.round(12000 + (totalStorage * 15)),
      pros: ["Unlimited scalability", "Self-healing", "No licensing fees", "High availability"],
      cons: ["Complex architecture", "Requires expertise"],
      raid_support: "Ceph erasure coding",
      suitable_for: ["Massive deployments", "Cloud-like storage", "Future growth"],
      why_recommended: `Ultimate scalability solution for ${input.cameras} cameras with ${totalStorage.toFixed(1)}TB storage`,
      key_benefits: [
        "Unlimited storage capacity that scales with your needs",
        "Self-healing architecture with automatic fault recovery",
        "No licensing fees - pure open-source Ceph technology",
        "Cloud-like storage with erasure coding for maximum efficiency"
      ]
    };
  }

  return {
    cached: false,
    is_fallback: true, // NEW: Indicates this is a fallback response
    fallback_reason: 'OpenAI API unavailable', // NEW: Why fallback was used
    recommendation: recommendedProduct, // Single recommended solution
    calculations: {
      total_storage_tb: safeTotalStorage,
      daily_storage_tb: safeDailyStorage,
      daily_storage_per_camera_gb: safeDailyStorage / input.cameras / 1000,
      total_bitrate_mbps: safeTotalBitrate,
      bitrate_per_camera: safeTotalBitrate / input.cameras,
      retention_days: input.retention_days,
      adjusted_bitrate: safeTotalBitrate / input.cameras,
      overhead_factor: 1.2
    },
    optimization: {
      suggestions: generateOptimizationSuggestions(input, safeTotalStorage, safeDailyStorage),
      insights: [
        `Storage requirement: ${safeTotalStorage.toFixed(1)} TB for ${input.retention_days} days retention`,
        `Daily storage: ${safeDailyStorage.toFixed(2)} TB per day`,
        `Total bitrate: ${safeTotalBitrate.toFixed(1)} Mbps across ${input.cameras} cameras`,
        `Bitrate per camera: ${bitratePerCamera.toFixed(1)} Mbps (${input.resolution}, ${input.fps}fps, ${input.codec})`
      ],
      cost_savings: generateCostSavings(input, safeTotalStorage)
    },
    summary: "Intelligent storage recommendations based on your parameters (Demo Mode - Add OpenAI credits for AI-powered analysis)"
  };
}

function generateOptimizationSuggestions(input: StorageRecommendationRequest, totalStorage: number, dailyStorage: number): string[] {
  const suggestions: string[] = [];
  
  // Codec optimization
  if (input.codec === 'H.264') {
    suggestions.push("Switch to H.265 codec for 50% storage reduction (saves " + (totalStorage * 0.5).toFixed(1) + " TB)");
  }
  
  // Recording mode optimization
  if (input.recording_mode === 'Continuous') {
    suggestions.push("Motion-based recording could reduce storage by 70% (saves " + (totalStorage * 0.7).toFixed(1) + " TB)");
  }
  
  // Activity level optimization
  if (input.activity_percent > 80) {
    suggestions.push("Consider reducing activity zones to lower storage requirements");
  } else if (input.activity_percent < 30) {
    suggestions.push("Current low activity level is optimal for storage efficiency");
  }
  
  // Retention optimization
  if (input.retention_days > 90) {
    suggestions.push("Consider tiered storage: hot storage for 30 days, cold storage for longer retention");
  }
  
  // Resolution optimization
  if (input.resolution === '8K') {
    suggestions.push("8K resolution requires significant storage - consider 4K for most applications");
  } else if (input.resolution === '4K' && input.cameras > 50) {
    suggestions.push("For large deployments, consider 1080p for non-critical areas to reduce storage");
  }
  
  // FPS optimization
  if (input.fps > 30) {
    suggestions.push("Consider 30fps for most surveillance applications to reduce storage requirements");
  }
  
  return suggestions;
}

function generateCostSavings(input: StorageRecommendationRequest, totalStorage: number): string[] {
  const savings: string[] = [];
  
  // Aeroskop vs generic solutions
  const genericCost = totalStorage * 100; // Generic storage cost per TB
  const aeroskopCost = totalStorage * 60; // Aeroskop cost per TB
  const savingsAmount = genericCost - aeroskopCost;
  
  savings.push(`Estimated ${Math.round((savingsAmount / genericCost) * 100)}% savings with Aeroskop solutions ($${savingsAmount.toFixed(0)} savings)`);
  
  // SDS benefits
  if (input.cameras > 100) {
    savings.push("No licensing fees with AeroStor Nova-360 (saves $5,000-15,000 annually)");
  }
  
  // Enterprise benefits
  if (input.cameras > 50) {
    savings.push("Reduced maintenance costs with enterprise hardware (saves $2,000-5,000 annually)");
  }
  
  // Storage efficiency
  if (input.codec === 'H.265') {
    savings.push("H.265 codec already optimized for storage efficiency");
  } else {
    savings.push("H.265 codec could save 50% on storage costs");
  }
  
  return savings;
}
