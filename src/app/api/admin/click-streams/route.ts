import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Get total clicks
    const totalClicksResult = await query('SELECT COUNT(*) as total FROM click_streams');
    const totalClicks = parseInt(totalClicksResult.rows[0].total);

    // Get top clicked elements
    const topElementsResult = await query(
      `SELECT element_id as element, COUNT(*) as clicks 
       FROM click_streams 
       WHERE element_id IS NOT NULL 
       GROUP BY element_id 
       ORDER BY clicks DESC 
       LIMIT 10`
    );

    // Get user journey (simplified - most common page sequences)
    const userJourneyResult = await query(
      `SELECT page_url as step, COUNT(*) as count 
       FROM click_streams 
       GROUP BY page_url 
       ORDER BY count DESC 
       LIMIT 10`
    );

    return NextResponse.json({
      totalClicks,
      topElements: topElementsResult.rows,
      userJourney: userJourneyResult.rows
    });

  } catch (error) {
    console.error('Error fetching click streams:', error);
    return NextResponse.json(
      { error: 'Failed to fetch click stream data' },
      { status: 500 }
    );
  }
}
