import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { CreateAIRecommendationRequest } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body: CreateAIRecommendationRequest = await request.json();
    
    // Validate required fields and provide defaults
    const validatedData = {
      session_id: body.session_id,
      user_id: body.user_id || null,
      cameras: body.cameras || 0,
      resolution: body.resolution || '4K',
      fps: body.fps || 30,
      codec: body.codec || 'H.265',
      activity_level: body.activity_level || 'medium',
      retention_days: body.retention_days || 30,
      recording_mode: body.recording_mode || 'continuous',
      total_storage_tb: body.total_storage_tb || 0,
      daily_storage_tb: body.daily_storage_tb || 0,
      total_bitrate_mbps: body.total_bitrate_mbps || 0,
      estimated_cost: body.estimated_cost || 0,
      standard_cost: body.standard_cost || 0,
      savings_amount: body.savings_amount || 0,
      ai_insights: body.ai_insights || null,
      optimization_suggestions: body.optimization_suggestions || null,
      risk_assessment: body.risk_assessment || null
    };
    
    const result = await query(
      `INSERT INTO ai_recommendations (
        session_id, user_id, cameras, resolution, fps, codec, 
        activity_level, retention_days, recording_mode,
        total_storage_tb, daily_storage_tb, total_bitrate_mbps,
        estimated_cost, standard_cost, savings_amount,
        ai_insights, optimization_suggestions, risk_assessment
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *`,
      [
        validatedData.session_id, validatedData.user_id, validatedData.cameras, 
        validatedData.resolution, validatedData.fps, validatedData.codec, 
        validatedData.activity_level, validatedData.retention_days, validatedData.recording_mode,
        validatedData.total_storage_tb, validatedData.daily_storage_tb, validatedData.total_bitrate_mbps,
        validatedData.estimated_cost, validatedData.standard_cost, validatedData.savings_amount,
        validatedData.ai_insights ? JSON.stringify(validatedData.ai_insights) : null,
        validatedData.optimization_suggestions ? JSON.stringify(validatedData.optimization_suggestions) : null,
        validatedData.risk_assessment ? JSON.stringify(validatedData.risk_assessment) : null
      ]
    );
    
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating AI recommendation:', error);
    return NextResponse.json(
      { error: 'Failed to create AI recommendation' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');
    const userId = searchParams.get('user_id');
    
    let queryText = 'SELECT * FROM ai_recommendations';
    let params: any[] = [];
    
    if (sessionId) {
      queryText += ' WHERE session_id = $1';
      params.push(sessionId);
    } else if (userId) {
      queryText += ' WHERE user_id = $1';
      params.push(userId);
    }
    
    queryText += ' ORDER BY created_at DESC';
    
    const result = await query(queryText, params);
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch AI recommendations' },
      { status: 500 }
    );
  }
}
