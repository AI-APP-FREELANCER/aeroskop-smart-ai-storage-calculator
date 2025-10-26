import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      session_id,
      page_url,
      time_spent_seconds,
      scroll_depth
    } = body;

    // Update the most recent page analytics record for this session and page
    await query(
      `UPDATE page_analytics 
       SET time_spent_seconds = $1, scroll_depth = $2
       WHERE session_id = $3 AND page_url = $4
       ORDER BY created_at DESC
       LIMIT 1`,
      [time_spent_seconds, scroll_depth, session_id, page_url]
    );

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Page Analytics Update API Error:', error);
    return NextResponse.json(
      { error: 'Failed to update page analytics' },
      { status: 500 }
    );
  }
}
