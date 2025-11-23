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
    
    // Apply guardrails: prevent 0 values for critical fields
    const validatedBody = {
      ...body,
      cameras: body.cameras > 0 ? body.cameras : 1,
      activity_percent: body.activity_percent > 0 ? body.activity_percent : 1,
      retention_days: body.retention_days > 0 ? body.retention_days : 1,
      recording_hours_per_day: body.recording_hours_per_day > 0 ? body.recording_hours_per_day : 1,
      custom_bitrate: body.custom_bitrate !== undefined && body.custom_bitrate > 0 ? body.custom_bitrate : undefined,
      custom_fps: body.custom_fps !== undefined && body.custom_fps > 0 ? body.custom_fps : undefined
    };
    
    // Log validation results
    if (body.cameras === 0 || body.activity_percent === 0 || body.retention_days === 0 || body.recording_hours_per_day === 0) {
      console.warn('⚠️ Guardrail applied: Zero values detected and corrected:', {
        original: {
          cameras: body.cameras,
          activity_percent: body.activity_percent,
          retention_days: body.retention_days,
          recording_hours_per_day: body.recording_hours_per_day,
          custom_bitrate: body.custom_bitrate
        },
        corrected: {
          cameras: validatedBody.cameras,
          activity_percent: validatedBody.activity_percent,
          retention_days: validatedBody.retention_days,
          recording_hours_per_day: validatedBody.recording_hours_per_day,
          custom_bitrate: validatedBody.custom_bitrate
        }
      });
    }

    // Use validated body for all operations
    const bodyToUse = validatedBody;
    
    // Generate hash for cache lookup - include all parameters
    const inputString = JSON.stringify({
      cameras: bodyToUse.cameras,
      resolution: bodyToUse.resolution,
      fps: bodyToUse.fps,
      codec: bodyToUse.codec,
      quality: bodyToUse.quality || 'Medium',
      activity_percent: bodyToUse.activity_percent,
      recording_hours_per_day: bodyToUse.recording_hours_per_day,
      retention_days: bodyToUse.retention_days,
      recording_mode: bodyToUse.recording_mode,
      pre_record_seconds: bodyToUse.pre_record_seconds || 2,
      post_record_seconds: bodyToUse.post_record_seconds || 5,
      custom_bitrate: bodyToUse.custom_bitrate || undefined,
      custom_fps: bodyToUse.custom_fps || undefined
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

      // Parse cached data
      const cachedCalculations = typeof cached.storage_calculation === 'string' 
        ? JSON.parse(cached.storage_calculation) 
        : cached.storage_calculation;
      
      // Try to get top_products from cache, fallback to single recommendation
      let topProducts = undefined;
      if (cached.recommended_product_best && cached.recommended_product_better) {
        try {
          const best = typeof cached.recommended_product_best === 'string' 
            ? JSON.parse(cached.recommended_product_best) 
            : cached.recommended_product_best;
          const better = typeof cached.recommended_product_better === 'string' 
            ? JSON.parse(cached.recommended_product_better) 
            : cached.recommended_product_better;
          
          // Filter out duplicates by product_name
          const products = [better, best].filter(p => p !== null);
          const uniqueProducts = products.filter((product, index, self) =>
            index === self.findIndex((p) => p.product_name === product.product_name)
          );
          
          // Only return 2 products if they are different
          topProducts = uniqueProducts.length >= 2 ? uniqueProducts : (uniqueProducts.length === 1 ? uniqueProducts : undefined);
        } catch (e) {
          console.error('Error parsing cached products:', e);
        }
      }
      
      const primaryRecommendation = topProducts?.[0] || 
        (typeof cached.recommended_product_better === 'string' 
          ? JSON.parse(cached.recommended_product_better) 
          : cached.recommended_product_better) ||
        (typeof cached.recommended_product_good === 'string' 
          ? JSON.parse(cached.recommended_product_good) 
          : cached.recommended_product_good) ||
        (typeof cached.recommended_product_best === 'string' 
          ? JSON.parse(cached.recommended_product_best) 
          : cached.recommended_product_best);

      const response: AIRecommendationResponse = {
        cached: true,
        recommendation: primaryRecommendation,
        top_products: topProducts,
        calculations: {
          total_storage_tb: cachedCalculations?.total_storage_tb || cached.total_storage_tb || 0,
          daily_storage_tb: cachedCalculations?.daily_storage_tb || cached.daily_storage_tb || 0,
          daily_storage_per_camera_gb: cachedCalculations?.daily_storage_per_camera_gb || 0,
          total_bitrate_mbps: cachedCalculations?.total_bitrate_mbps || 0,
          bitrate_per_camera: cachedCalculations?.bitrate_per_camera || 0,
          adjusted_bitrate: cachedCalculations?.adjusted_bitrate || 0,
          overhead_factor: cachedCalculations?.overhead_factor || 1.2,
          retention_days: cachedCalculations?.retention_days || cached.retention_days
        },
        optimization: typeof cached.optimization_suggestions === 'string' 
          ? JSON.parse(cached.optimization_suggestions) 
          : cached.optimization_suggestions,
        summary: cached.ai_insights || 'Cached recommendation based on your requirements'
      };

      return NextResponse.json(response);
    }

    // Cache miss - generate new recommendation
    const startTime = Date.now();
    
    try {
      // Log all parameters being sent to Gemini for verification (using validated values)
      console.log('📤 Sending to Gemini AI (validated):', {
        cameras: bodyToUse.cameras,
        resolution: bodyToUse.resolution,
        fps: bodyToUse.fps,
        codec: bodyToUse.codec,
        quality: bodyToUse.quality || 'Medium',
        activity_percent: bodyToUse.activity_percent,
        recording_hours_per_day: bodyToUse.recording_hours_per_day,
        retention_days: bodyToUse.retention_days,
        recording_mode: bodyToUse.recording_mode,
        custom_bitrate: bodyToUse.custom_bitrate,
        custom_fps: bodyToUse.custom_fps,
        pre_record_seconds: bodyToUse.pre_record_seconds,
        post_record_seconds: bodyToUse.post_record_seconds
      });
      
      // Send validated parameters to Gemini - it will calculate everything
      const aiResponse = await generateGeminiStorageRecommendation({
        cameras: bodyToUse.cameras,
        resolution: bodyToUse.resolution,
        fps: bodyToUse.fps,
        codec: bodyToUse.codec,
        quality: bodyToUse.quality || 'Medium',
        activity_percent: bodyToUse.activity_percent,
        recording_hours_per_day: bodyToUse.recording_hours_per_day,
        retention_days: bodyToUse.retention_days,
        recording_mode: bodyToUse.recording_mode,
        pre_record_seconds: bodyToUse.pre_record_seconds,
        post_record_seconds: bodyToUse.post_record_seconds,
        custom_bitrate: bodyToUse.custom_bitrate,
        custom_fps: bodyToUse.custom_fps
      }, {
        sessionId: body.sessionId || body.session_id || 'anonymous',
        userId: body.userId ? String(body.userId) : (body.user_id ? String(body.user_id) : undefined)
      });
      const responseTime = Date.now() - startTime;
      
      // Extract token usage from AI response (if available)
      const tokensUsed = (aiResponse as any).tokens_used || 0;
      const modelUsed = (aiResponse as any).model_used || 'gemini-2.5-flash';
      
      // Store in cache - store top 2 products if available
      const topProducts = aiResponse.top_products || [aiResponse.recommendation];
      const product1 = topProducts[0] || aiResponse.recommendation;
      const product2 = topProducts[1] || aiResponse.recommendation;
      
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
          bodyToUse.cameras,
          bodyToUse.resolution,
          bodyToUse.fps,
          bodyToUse.codec,
          bodyToUse.activity_percent, // Use new activity_percent instead of activity_level
          bodyToUse.retention_days,
          bodyToUse.recording_mode,
          JSON.stringify(product1), // Store first product in good field
          JSON.stringify(product1), // Store first product in better field (primary)
          JSON.stringify(product2), // Store second product in best field
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
