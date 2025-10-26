import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { UserAnalytics } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.userSessionId || !body.parameterSelections) {
      return NextResponse.json(
        { error: 'Missing required fields: userSessionId, parameterSelections' },
        { status: 400 }
      );
    }

    // Insert analytics data
    const result = await query(
      `INSERT INTO user_analytics (
        user_session_id,
        parameter_data,
        start_time,
        end_time,
        time_spent_seconds,
        actions,
        page_url,
        user_agent
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        body.userSessionId,
        JSON.stringify(body.parameterSelections),
        body.startTime,
        body.endTime || null,
        body.timeSpent || 0,
        JSON.stringify(body.actionSequence || []),
        body.pageUrl || '',
        body.userAgent || ''
      ]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error: any) {
    console.error('Analytics tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track analytics data' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    
    if (sessionId) {
      const result = await query(
        'SELECT * FROM user_analytics WHERE user_session_id = $1 ORDER BY created_at DESC',
        [sessionId]
      );
      return NextResponse.json(result.rows);
    }
    
    // Get all analytics data with pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;
    
    const result = await query(
      `SELECT * FROM user_analytics 
       ORDER BY created_at DESC 
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Analytics fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}
