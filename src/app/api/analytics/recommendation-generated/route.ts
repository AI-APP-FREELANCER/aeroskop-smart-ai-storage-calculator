import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.sessionId || !body.recommendationData) {
      return NextResponse.json(
        { error: 'Missing required fields: sessionId, recommendationData' },
        { status: 400 }
      );
    }

    // Insert recommendation analytics data
    const result = await query(
      `INSERT INTO recommendation_analytics (
        session_id,
        parameters,
        recommendation_data,
        timestamp,
        page_url
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *`,
      [
        body.sessionId,
        JSON.stringify(body.parameters || {}),
        JSON.stringify(body.recommendationData),
        body.timestamp,
        body.pageUrl || ''
      ]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error: any) {
    console.error('Recommendation analytics tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track recommendation analytics' },
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
        'SELECT * FROM recommendation_analytics WHERE session_id = $1 ORDER BY created_at DESC',
        [sessionId]
      );
      return NextResponse.json(result.rows);
    }
    
    // Get all recommendation analytics with pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;
    
    const result = await query(
      `SELECT * FROM recommendation_analytics 
       ORDER BY created_at DESC 
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Recommendation analytics fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recommendation analytics' },
      { status: 500 }
    );
  }
}
