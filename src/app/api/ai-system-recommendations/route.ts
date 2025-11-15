import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { query } from '@/lib/db';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const SYSTEM_RECOMMENDATION_PROMPT = `
You are an expert system architect for surveillance storage solutions. Based on the user's camera setup and storage requirements, recommend optimal server hardware configuration.

CRITICAL: You MUST provide DYNAMIC recommendations that vary based on the actual parameters provided. Do NOT return the same values for different inputs.

Provide recommendations in JSON format with this exact structure:
{
  "numberOfServers": number (calculate based on storage: <150 TB = 1, 150-250 TB = 2, >250 TB = 3+),
  "drivesPerServer": number (calculate based on storage per server: <100 TB/server = 6-12, 100-200 TB/server = 12-18, >200 TB/server = 18-24),
  "driveType": "Enterprise 16 TB" | "Enterprise 18 TB" | "Enterprise 20-22 TB" (choose based on capacity needs),
  "network": "Dual 10 GbE links" | "Dual 25 GbE links" (choose based on bitrate: <500 Mbps = 10 GbE, >=500 Mbps or >100 cameras = 25 GbE),
  "cpu": "Intel Xeon Silver 4410Y (12 Core) or AMD EPYC 7313+" (adjust based on load),
  "memory": "96-128 GB RAM per server" | "128 GB RAM per server" (more for larger deployments),
  "osFilesystem": "Ubuntu Server 22.04 LTS with OpenZFS" | "Ubuntu Server 22.04 LTS with Ceph" (Ceph for multi-server),
  "rationale": ["specific reason 1 based on parameters", "specific reason 2", "specific reason 3"],
  "serverModel": "Rhino ASK-SR212" | "Rhino ASK-SR224" | "other model" (choose based on capacity)
}

IMPORTANT CALCULATION RULES:
- Calculate numberOfServers: Math.ceil(totalStorageTB / 150) but max 5, min 1
- Calculate drivesPerServer: Based on (totalStorageTB / numberOfServers), choose appropriate drive count
- Choose driveType: Larger storage needs = larger drives (20-22 TB for >300 TB, 18 TB for 150-300 TB, 16 TB for <150 TB)
- Choose network: totalBitrateMbps >= 500 OR cameras > 100 = Dual 25 GbE, else Dual 10 GbE
- Choose memory: numberOfServers > 1 OR totalStorageTB > 200 = "128 GB RAM per server", else "96-128 GB RAM per server"
- Choose osFilesystem: numberOfServers > 1 = "Ubuntu Server 22.04 LTS with Ceph", else "Ubuntu Server 22.04 LTS with OpenZFS"
- Generate specific rationale based on actual numbers provided

Return ONLY valid JSON, no additional text. Make sure values change based on input parameters.
`;

interface SystemRecommendationRequest {
  cameras: number;
  totalStorageTB: number;
  totalBitrateMbps: number;
  retentionDays: number;
  resolution: string;
  sessionId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: SystemRecommendationRequest = await request.json();
    
    // Validate required fields
    if (!body.cameras || !body.totalStorageTB || body.totalBitrateMbps === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: cameras, totalStorageTB, totalBitrateMbps' },
        { status: 400 }
      );
    }

    // Check if Gemini API key is configured and valid
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || 
        apiKey === 'your_gemini_api_key_here' || 
        apiKey.length < 20 || 
        !apiKey.startsWith('AIza')) {
      console.log('🔧 Gemini API key not configured or invalid, using intelligent fallback recommendations');
      console.log('🔧 API Key length:', apiKey?.length || 0);
      return NextResponse.json({
        ...generateFallbackRecommendations(body),
        isFallback: true
      });
    }

    try {
      // Get Gemini model
      // Using gemini-2.5-flash as it's available for v1beta API
      // gemini-pro and gemini-1.5-flash were returning 404 Not Found for v1beta API
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      
      // Build prompt
      const prompt = `${SYSTEM_RECOMMENDATION_PROMPT}

USER REQUIREMENTS:
- Cameras: ${body.cameras}
- Total Storage Required: ${body.totalStorageTB.toFixed(2)} TB
- Total Bitrate: ${body.totalBitrateMbps.toFixed(2)} Mbps
- Retention: ${body.retentionDays} days
- Resolution: ${body.resolution}

Generate server configuration recommendations:`;

      console.log('🤖 Requesting system recommendations from Gemini AI...');
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Parse JSON response
      let recommendations;
      try {
        // Extract JSON from response (handle markdown code blocks)
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          recommendations = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        console.error('Failed to parse Gemini response:', text);
        // Fall back to intelligent recommendations
        return NextResponse.json({
          ...generateFallbackRecommendations(body),
          isFallback: true,
          fallbackReason: 'Failed to parse AI response'
        });
      }

      // Validate recommendations from Gemini - use Gemini's values, only validate types
      const validatedRecommendations = {
        numberOfServers: typeof recommendations.numberOfServers === 'number' ? recommendations.numberOfServers : calculateServers(body.totalStorageTB),
        drivesPerServer: typeof recommendations.drivesPerServer === 'number' ? recommendations.drivesPerServer : calculateDrives(body.totalStorageTB, recommendations.numberOfServers || 1),
        driveType: typeof recommendations.driveType === 'string' ? recommendations.driveType : (body.totalStorageTB > 300 ? 'Enterprise 20-22 TB' : body.totalStorageTB > 150 ? 'Enterprise 18 TB' : 'Enterprise 16 TB'),
        network: typeof recommendations.network === 'string' ? recommendations.network : (body.totalBitrateMbps >= 500 || body.cameras > 100 ? 'Dual 25 GbE links' : 'Dual 10 GbE links'),
        cpu: typeof recommendations.cpu === 'string' ? recommendations.cpu : 'Intel Xeon Silver 4410Y (12 Core) or AMD EPYC 7313+',
        memory: typeof recommendations.memory === 'string' ? recommendations.memory : ((recommendations.numberOfServers > 1 || body.totalStorageTB > 200) ? '128 GB RAM per server' : '96-128 GB RAM per server'),
        osFilesystem: typeof recommendations.osFilesystem === 'string' ? recommendations.osFilesystem : (recommendations.numberOfServers > 1 ? 'Ubuntu Server 22.04 LTS with Ceph' : 'Ubuntu Server 22.04 LTS with OpenZFS'),
        rationale: Array.isArray(recommendations.rationale) && recommendations.rationale.length > 0 ? recommendations.rationale : generateRationale(body, recommendations),
        serverModel: typeof recommendations.serverModel === 'string' ? recommendations.serverModel : (recommendations.numberOfServers > 1 ? 'Rhino ASK-SR224' : 'Rhino ASK-SR212'),
        isFallback: false
      };

      console.log('✅ Gemini system recommendations received');
      return NextResponse.json(validatedRecommendations);

    } catch (error: any) {
      console.error('❌ Gemini API Error:', error);
      console.log('🔄 Falling back to intelligent recommendations');
      
      return NextResponse.json({
        ...generateFallbackRecommendations(body),
        isFallback: true,
        fallbackReason: 'An issue occurred while fetching recommendations from the AI system. Please try again or report this inconsistency to our support team.'
      });
    }

  } catch (error: any) {
    console.error('System recommendations API error:', error);
    return NextResponse.json(
      { 
        error: 'An issue occurred while fetching recommendations from the AI system. Please try again or report this inconsistency to our support team.',
        isFallback: true,
        ...generateFallbackRecommendations({ cameras: 0, totalStorageTB: 0, totalBitrateMbps: 0, retentionDays: 30, resolution: '1080p' })
      },
      { status: 500 }
    );
  }
}

function calculateServers(totalTB: number): number {
  if (totalTB >= 250) return 3;
  if (totalTB >= 150) return 2;
  return 1;
}

function calculateDrives(totalTB: number, servers: number): number {
  const perServer = totalTB / servers;
  if (perServer > 300) return 24;
  if (perServer > 200) return 18;
  if (perServer > 100) return 12;
  return 6;
}

function generateRationale(body: SystemRecommendationRequest, recommendations: any): string[] {
  return [
    `Total usable storage requirement: ${body.totalStorageTB.toFixed(1)} TB`,
    `Camera count: ${body.cameras} cameras`,
    `${recommendations.numberOfServers || calculateServers(body.totalStorageTB)} ${recommendations.numberOfServers > 1 ? 'servers' : 'server'} recommended for ${body.totalStorageTB >= 250 ? 'large-scale' : body.totalStorageTB >= 150 ? 'medium-scale' : 'small-scale'} deployment`,
    `${recommendations.drivesPerServer || calculateDrives(body.totalStorageTB, recommendations.numberOfServers || 1)} drives per server using ${recommendations.driveType || 'Enterprise 18 TB'} drives`,
    `${recommendations.network || (body.totalBitrateMbps > 1000 ? 'Dual 25 GbE links' : 'Dual 10 GbE links')} recommended for ${body.totalBitrateMbps > 1000 ? 'high' : body.totalBitrateMbps > 500 ? 'medium-high' : 'standard'} throughput requirements`
  ];
}

function generateFallbackRecommendations(body: SystemRecommendationRequest) {
  const numberOfServers = calculateServers(body.totalStorageTB);
  const drivesPerServer = calculateDrives(body.totalStorageTB, numberOfServers);
  
  return {
    numberOfServers,
    drivesPerServer,
    driveType: body.totalStorageTB > 300 ? 'Enterprise 20-22 TB' : body.totalStorageTB > 150 ? 'Enterprise 18 TB' : 'Enterprise 16 TB',
    network: body.totalBitrateMbps > 1000 || body.cameras > 200 ? 'Dual 25 GbE links' : 'Dual 10 GbE links',
    cpu: 'Intel Xeon Silver 4410Y (12 Core) or AMD EPYC 7313+',
    memory: numberOfServers > 1 ? '128 GB RAM per server' : '96-128 GB RAM per server',
    osFilesystem: numberOfServers > 1 ? 'Ubuntu Server 22.04 LTS with Ceph (distributed)' : 'Ubuntu Server 22.04 LTS with OpenZFS',
    rationale: generateRationale(body, { numberOfServers, drivesPerServer }),
    serverModel: numberOfServers > 1 ? 'Rhino ASK-SR224 (4U)' : 'Rhino ASK-SR212 (2U)'
  };
}

