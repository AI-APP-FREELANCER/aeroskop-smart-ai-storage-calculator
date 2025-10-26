import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { CreateSessionRequest } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body: CreateSessionRequest = await request.json();
    
    const result = await query(
      `INSERT INTO sessions (user_id, session_type, ip_address, user_agent) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [body.user_id, body.session_type, body.ip_address, body.user_agent]
    );
    
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('id');
    
    if (sessionId) {
      const result = await query(
        'SELECT * FROM sessions WHERE id = $1',
        [sessionId]
      );
      return NextResponse.json(result.rows[0] || null);
    }
    
    const result = await query('SELECT * FROM sessions ORDER BY created_at DESC');
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('id');
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }
    
    const result = await query(
      'UPDATE sessions SET last_activity = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
      [sessionId]
    );
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update session' },
      { status: 500 }
    );
  }
}
