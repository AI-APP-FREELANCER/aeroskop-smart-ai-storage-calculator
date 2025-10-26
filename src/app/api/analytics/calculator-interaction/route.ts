import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.sessionId || !body.action) {
      return NextResponse.json(
        { error: 'Missing required fields: sessionId, action' },
        { status: 400 }
      );
    }

    // Insert calculator interaction data
    const result = await query(
      `INSERT INTO calculator_interactions (
        session_id,
        action,
        parameters,
        timestamp,
        page_url
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *`,
      [
        body.sessionId,
        body.action,
        JSON.stringify(body.parameters || {}),
        body.timestamp,
        body.pageUrl || ''
      ]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error: any) {
    console.error('Calculator interaction tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track calculator interaction' },
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
        'SELECT * FROM calculator_interactions WHERE session_id = $1 ORDER BY created_at DESC',
        [sessionId]
      );
      return NextResponse.json(result.rows);
    }
    
    // Get all interactions with pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;
    
    const result = await query(
      `SELECT * FROM calculator_interactions 
       ORDER BY created_at DESC 
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Calculator interactions fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calculator interactions' },
      { status: 500 }
    );
  }
}
