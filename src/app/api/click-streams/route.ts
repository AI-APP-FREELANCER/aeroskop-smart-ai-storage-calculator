import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      session_id,
      element_id,
      element_class,
      element_text,
      page_url,
      click_x,
      click_y
    } = body;

    // Insert click stream record
    await query(
      `INSERT INTO click_streams (
        session_id, element_id, element_class, element_text,
        page_url, click_x, click_y
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [session_id, element_id, element_class, element_text, page_url, click_x, click_y]
    );

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Click Streams API Error:', error);
    return NextResponse.json(
      { error: 'Failed to track click stream' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    
    const result = await query(
      `SELECT * FROM click_streams 
       ORDER BY timestamp DESC 
       LIMIT $1`,
      [limit]
    );

    return NextResponse.json({
      clickStreams: result.rows,
      total: result.rows.length
    });

  } catch (error) {
    console.error('Error fetching click streams:', error);
    return NextResponse.json(
      { error: 'Failed to fetch click streams' },
      { status: 500 }
    );
  }
}
