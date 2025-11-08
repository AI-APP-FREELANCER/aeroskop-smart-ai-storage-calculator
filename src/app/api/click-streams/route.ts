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

    // Validate required fields
    if (!session_id) {
      // Return success but don't insert if session_id is missing
      // This prevents errors from breaking the user experience
      return NextResponse.json({ success: true, skipped: 'No session ID' });
    }

    // Insert click stream record
    // Use try-catch for database operations to handle schema mismatches gracefully
    try {
      await query(
        `INSERT INTO click_streams (
          session_id, element_id, element_class, element_text,
          page_url, click_x, click_y
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [session_id, element_id || null, element_class || null, element_text || null, page_url || null, click_x || null, click_y || null]
      );
    } catch (dbError: any) {
      // Log error but don't fail the request
      // Click tracking is non-critical and shouldn't break user experience
      console.warn('Click stream tracking failed (non-critical):', dbError.message);
      return NextResponse.json({ success: true, skipped: 'Database error (non-critical)' });
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    // Log error but return success to prevent breaking user experience
    // Click tracking is non-critical
    console.warn('Click Streams API Error (non-critical):', error?.message || error);
    return NextResponse.json(
      { success: true, skipped: 'Tracking error (non-critical)' },
      { status: 200 }
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
