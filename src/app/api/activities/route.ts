import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { CreateActivityRequest } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body: CreateActivityRequest = await request.json();
    
    const result = await query(
      `INSERT INTO user_activities (session_id, user_id, activity_type, page_url, time_spent_seconds, activity_data) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [
        body.session_id, 
        body.user_id, 
        body.activity_type, 
        body.page_url, 
        body.time_spent_seconds,
        JSON.stringify(body.activity_data)
      ]
    );
    
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create activity' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');
    const userId = searchParams.get('user_id');
    const activityType = searchParams.get('activity_type');
    
    let queryText = 'SELECT * FROM user_activities';
    let params: any[] = [];
    let conditions: string[] = [];
    
    if (sessionId) {
      conditions.push('session_id = $' + (params.length + 1));
      params.push(sessionId);
    }
    
    if (userId) {
      conditions.push('user_id = $' + (params.length + 1));
      params.push(userId);
    }
    
    if (activityType) {
      conditions.push('activity_type = $' + (params.length + 1));
      params.push(activityType);
    }
    
    if (conditions.length > 0) {
      queryText += ' WHERE ' + conditions.join(' AND ');
    }
    
    queryText += ' ORDER BY created_at DESC';
    
    const result = await query(queryText, params);
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}
