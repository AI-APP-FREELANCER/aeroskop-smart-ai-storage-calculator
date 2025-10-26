import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      session_id,
      page_url,
      page_title,
      referrer,
      time_spent_seconds,
      scroll_depth,
      clicks_count
    } = body;

    // Insert page analytics record
    await query(
      `INSERT INTO page_analytics (
        session_id, page_url, page_title, referrer, 
        time_spent_seconds, scroll_depth, clicks_count
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [session_id, page_url, page_title, referrer, time_spent_seconds, scroll_depth, clicks_count]
    );

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Page Analytics API Error:', error);
    return NextResponse.json(
      { error: 'Failed to track page analytics' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    
    const result = await query(
      `SELECT * FROM page_analytics 
       ORDER BY created_at DESC 
       LIMIT $1`,
      [limit]
    );

    return NextResponse.json({
      analytics: result.rows,
      total: result.rows.length
    });

  } catch (error) {
    console.error('Error fetching page analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch page analytics' },
      { status: 500 }
    );
  }
}
