import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { query } from '@/lib/db';
import { calculateAccurateStorage } from '@/lib/storageCalculations';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const SYSTEM_RECOMMENDATION_PROMPT = `
You are an expert system architect for surveillance storage solutions. Based on the user's camera setup and storage requirements, recommend optimal server hardware configuration.

Provide recommendations in JSON format with this exact structure:
{
  "numberOfServers": number (1-5 based on storage needs),
  "drivesPerServer": number (4-24 based on capacity),
  "driveType": "Enterprise 16 TB" | "Enterprise 18 TB" | "Enterprise 20-22 TB",
  "network": "Dual 10 GbE links" | "Dual 25 GbE links",
  "cpu": "Intel Xeon Silver 4410Y (12 Core) or AMD EPYC 7313+",
  "memory": "96-128 GB RAM per server" | "128 GB RAM per server",
  "osFilesystem": "Ubuntu Server 22.04 LTS with OpenZFS" | "Ubuntu Server 22.04 LTS with Ceph",
  "rationale": ["reason 1", "reason 2", "reason 3"],
  "serverModel": "suggested model name (e.g., Rhino ASK-SR224)"
}

SCALING RULES:
- <150 TB usable: 1 server
- 150-250 TB: 2 servers (cluster)
- >250 TB: 3+ servers (distributed cluster)

NETWORK RULES:
- <500 Mbps total: Dual 10 GbE
- >500 Mbps or >100 cameras: Dual 25 GbE

Return ONLY valid JSON, no additional text.
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

    // Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      console.log('🔧 Gemini API key not configured, using intelligent fallback recommendations');
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

      // Validate and enhance recommendations
      const validatedRecommendations = {
        numberOfServers: recommendations.numberOfServers || calculateServers(body.totalStorageTB),
        drivesPerServer: recommendations.drivesPerServer || calculateDrives(body.totalStorageTB, recommendations.numberOfServers || 1),
        driveType: recommendations.driveType || 'Enterprise 18 TB',
        network: recommendations.network || (body.totalBitrateMbps > 1000 ? 'Dual 25 GbE links' : 'Dual 10 GbE links'),
        cpu: recommendations.cpu || 'Intel Xeon Silver 4410Y (12 Core) or AMD EPYC 7313+',
        memory: recommendations.memory || '96-128 GB RAM per server',
        osFilesystem: recommendations.osFilesystem || (recommendations.numberOfServers > 1 ? 'Ubuntu Server 22.04 LTS with Ceph' : 'Ubuntu Server 22.04 LTS with OpenZFS'),
        rationale: Array.isArray(recommendations.rationale) ? recommendations.rationale : generateRationale(body, recommendations),
        serverModel: recommendations.serverModel || 'Rhino ASK-SR224',
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

