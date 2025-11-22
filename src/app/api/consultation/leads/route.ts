import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Fetch all consultation enquiries ordered by newest first
    const result = await query(
      `SELECT 
        id,
        first_name,
        last_name,
        email,
        company,
        phone_number,
        area_of_interest,
        message_content,
        created_at
       FROM consultation_enquiry
       ORDER BY created_at DESC`
    );

    return NextResponse.json({
      success: true,
      leads: result.rows,
      count: result.rows.length
    });
  } catch (error: any) {
    console.error('Error fetching consultation leads:', error);
    console.error('Error details:', {
      message: error?.message,
      code: error?.code,
      detail: error?.detail
    });
    
    // Handle table doesn't exist error
    if (error.code === '42P01' || error?.message?.includes('does not exist')) {
      console.error('Table consultation_enquiry does not exist. Please run the migration.');
      return NextResponse.json(
        { 
          success: false,
          error: 'Database table not found. Please contact the administrator.',
          leads: [],
          count: 0
        },
        { status: 500 }
      );
    }

    // Handle connection errors
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Database connection failed. Please try again later.',
          leads: [],
          count: 0
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: error?.message || 'Failed to fetch consultation leads',
        leads: [],
        count: 0
      },
      { status: 500 }
    );
  }
}

