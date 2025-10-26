import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Get total page views
    const totalResult = await query('SELECT COUNT(*) as total FROM page_analytics');
    const total = parseInt(totalResult.rows[0].total);

    // Get today's page views
    const todayResult = await query(
      `SELECT COUNT(*) as today FROM page_analytics 
       WHERE DATE(created_at) = CURRENT_DATE`
    );
    const today = parseInt(todayResult.rows[0].today);

    // Get page views by page
    const byPageResult = await query(
      `SELECT page_url as page, COUNT(*) as views 
       FROM page_analytics 
       GROUP BY page_url 
       ORDER BY views DESC 
       LIMIT 10`
    );

    return NextResponse.json({
      total,
      today,
      byPage: byPageResult.rows
    });

  } catch (error) {
    console.error('Error fetching page analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch page analytics' },
      { status: 500 }
    );
  }
}
