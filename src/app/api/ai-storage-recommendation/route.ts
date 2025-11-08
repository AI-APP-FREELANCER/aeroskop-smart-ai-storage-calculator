import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { generateGeminiStorageRecommendation } from '@/lib/gemini';
import { StorageRecommendationRequest, AIRecommendationResponse } from '@/lib/types';
import { createHash } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body: StorageRecommendationRequest = await request.json();
    
    console.log('Received request body:', body);
    console.log('Body type:', typeof body);
    console.log('Body keys:', Object.keys(body));
    
    // Validate required fields (handle zero values properly)
    if (body.cameras === undefined || body.cameras === null || 
        !body.resolution || 
        body.fps === undefined || body.fps === null ||
        !body.codec || 
        !body.quality || 
        body.activity_percent === undefined || body.activity_percent === null ||
        body.recording_hours_per_day === undefined || body.recording_hours_per_day === null ||
        body.retention_days === undefined || body.retention_days === null ||
        !body.recording_mode) {
      console.log('Missing required fields. Body:', body);
      return NextResponse.json(
        { error: 'Missing required fields', received: body },
        { status: 400 }
      );
    }

    // Generate hash for cache lookup - include all parameters
    const inputString = JSON.stringify({
      cameras: body.cameras,
      resolution: body.resolution,
      fps: body.fps,
      codec: body.codec,
      quality: body.quality || 'Medium',
      activity_percent: body.activity_percent,
      recording_hours_per_day: body.recording_hours_per_day,
      retention_days: body.retention_days,
      recording_mode: body.recording_mode,
      pre_record_seconds: body.pre_record_seconds || 2,
      post_record_seconds: body.post_record_seconds || 5,
      custom_bitrate: body.custom_bitrate || undefined
    });
    
    const inputHash = createHash('md5').update(inputString).digest('hex');

    // Check cache first
    const cacheResult = await query(
      'SELECT * FROM storage_recommendations_cache WHERE input_hash = $1',
      [inputHash]
    );

    if (cacheResult.rows.length > 0) {
      // Cache hit - return cached result and update usage
      const cached = cacheResult.rows[0];
      
      // Update usage count and last accessed
      await query(
        'UPDATE storage_recommendations_cache SET usage_count = usage_count + 1, last_accessed_at = CURRENT_TIMESTAMP WHERE id = $1',
        [cached.id]
      );

      const response: AIRecommendationResponse = {
        cached: true,
        recommendation: cached.recommended_product_better || cached.recommended_product_good || cached.recommended_product_best, // Use the "better" recommendation as the single best choice
        calculations: {
          total_storage_tb: cached.total_storage_tb,
          daily_storage_tb: cached.daily_storage_tb,
          total_bitrate_mbps: 0, // Will be calculated from other fields
          retention_days: cached.retention_days
        },
        optimization: cached.optimization_suggestions,
        summary: cached.ai_insights || 'Cached recommendation based on your requirements'
      };

      return NextResponse.json(response);
    }

    // Cache miss - generate new recommendation
    const startTime = Date.now();
    
    try {
      // Use provided calculated values if available, otherwise let AI calculate
      const aiResponse = await generateGeminiStorageRecommendation(body, {
        sessionId: body.sessionId || 'anonymous',
        userId: body.userId || null
      });
      const responseTime = Date.now() - startTime;
      
      // Extract token usage from AI response (if available)
      const tokensUsed = (aiResponse as any).tokens_used || 0;
      const modelUsed = (aiResponse as any).model_used || 'gemini-2.5-flash';
      
      // Store in cache
      await query(
        `INSERT INTO storage_recommendations_cache (
          input_hash, cameras, resolution, fps, codec, activity_level, 
          retention_days, recording_mode, recommended_product_good, 
          recommended_product_better, recommended_product_best, 
          storage_calculation, optimization_suggestions, 
          total_storage_tb, daily_storage_tb, ai_insights
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
        [
          inputHash,
          body.cameras,
          body.resolution,
          body.fps,
          body.codec,
          body.activity_percent, // Use new activity_percent instead of activity_level
          body.retention_days,
          body.recording_mode,
          JSON.stringify(aiResponse.recommendation), // Store single recommendation in good field
          JSON.stringify(aiResponse.recommendation), // Store same recommendation in better field
          JSON.stringify(aiResponse.recommendation), // Store same recommendation in best field
          JSON.stringify(aiResponse.calculations),
          JSON.stringify(aiResponse.optimization),
          aiResponse.calculations.total_storage_tb,
          aiResponse.calculations.daily_storage_tb,
          aiResponse.summary
        ]
      );

      // Log AI usage
      try {
        await query(
          `INSERT INTO ai_usage_logs (
            session_id, user_id, input_parameters, tokens_used, model_used, 
            response_time_ms, cached
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            body.session_id || null,
            body.user_id || null,
            JSON.stringify(body),
            tokensUsed,
            modelUsed,
            responseTime,
            false
          ]
        );
      } catch (logError) {
        console.error('Failed to log AI usage:', logError);
      }

      return NextResponse.json(aiResponse);

    } catch (aiError) {
      console.error('AI Generation Error:', aiError);
      
      // Return professional error message
      return NextResponse.json(
        { error: 'An issue occurred while fetching recommendations from the AI system. Please try again or report this inconsistency to our support team.' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Storage Recommendation API Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate storage recommendation' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    
    const result = await query(
      'SELECT * FROM storage_recommendations_cache ORDER BY usage_count DESC, created_at DESC LIMIT $1',
      [limit]
    );

    return NextResponse.json({
      recommendations: result.rows,
      total: result.rows.length
    });

  } catch (error) {
    console.error('Error fetching cached recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recommendations' },
      { status: 500 }
    );
  }
}
