import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📥 Received consultation enquiry request:', {
      first_name: body.first_name,
      last_name: body.last_name,
      email: body.email,
      has_company: !!body.company,
      has_phone: !!body.phone_number,
      has_interest: !!body.area_of_interest,
      has_message: !!body.message_content
    });
    
    // Extract form data
    const {
      first_name,
      last_name,
      email,
      company,
      phone_number,
      area_of_interest,
      message_content
    } = body;

    // Validate required fields
    if (!first_name || !last_name || !email || !message_content) {
      console.error('❌ Validation failed: Missing required fields');
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required fields. First name, last name, email, and message are required.' 
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error('❌ Validation failed: Invalid email format');
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid email format.' 
        },
        { status: 400 }
      );
    }

    // Check if table exists first
    try {
      const tableCheck = await query(
        `SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'consultation_enquiry'
        )`
      );
      
      if (!tableCheck.rows[0]?.exists) {
        console.error('❌ Table consultation_enquiry does not exist in database');
        return NextResponse.json(
          { 
            success: false,
            error: 'Database table not found. Please run the migration: database/migrations/add_consultation_enquiry_table.sql' 
          },
          { status: 500 }
        );
      }
    } catch (checkError: any) {
      console.error('❌ Error checking table existence:', checkError);
      // Continue anyway, let the INSERT fail with a clearer error
    }

    // Insert into consultation_enquiry table
    console.log('💾 Attempting to insert consultation enquiry into database...');
    const result = await query(
      `INSERT INTO consultation_enquiry 
       (first_name, last_name, email, company, phone_number, area_of_interest, message_content)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, created_at`,
      [
        first_name.trim(),
        last_name.trim(),
        email.trim().toLowerCase(),
        company?.trim() || null,
        phone_number?.trim() || null,
        area_of_interest?.trim() || null,
        message_content.trim()
      ]
    );

    if (result.rows.length === 0) {
      console.error('❌ Insert returned no rows');
      throw new Error('Failed to insert consultation enquiry - no rows returned');
    }

    console.log('✅ Successfully inserted consultation enquiry:', {
      id: result.rows[0].id,
      created_at: result.rows[0].created_at
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Consultation enquiry submitted successfully',
        id: result.rows[0].id,
        created_at: result.rows[0].created_at
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error submitting consultation enquiry:', error);
    console.error('Error details:', {
      message: error?.message,
      code: error?.code,
      detail: error?.detail,
      stack: error?.stack
    });
    
    // Handle database constraint violations
    if (error.code === '23505') { // Unique constraint violation
      return NextResponse.json(
        { 
          success: false,
          error: 'An enquiry with this email already exists.' 
        },
        { status: 409 }
      );
    }

    // Handle table doesn't exist error
    if (error.code === '42P01' || error?.message?.includes('does not exist')) {
      console.error('Table consultation_enquiry does not exist. Please run the migration.');
      return NextResponse.json(
        { 
          success: false,
          error: 'Database table not found. Please contact the administrator.' 
        },
        { status: 500 }
      );
    }

    // Handle connection errors
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Database connection failed. Please try again later.' 
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { 
        success: false,
        error: error?.message || 'Failed to submit consultation enquiry. Please try again later.' 
      },
      { status: 500 }
    );
  }
}

