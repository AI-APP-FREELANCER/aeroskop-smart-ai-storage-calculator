import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // Check if table exists
    const tableCheck = await query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'consultation_enquiry'
      )`
    );

    const tableExists = tableCheck.rows[0]?.exists || false;

    if (!tableExists) {
      return NextResponse.json(
        {
          tableExists: false,
          message: 'Table consultation_enquiry does not exist. Please run the migration: database/migrations/add_consultation_enquiry_table.sql',
          migrationFile: 'database/migrations/add_consultation_enquiry_table.sql'
        },
        { status: 404 }
      );
    }

    // If table exists, get count of records
    const countResult = await query('SELECT COUNT(*) as count FROM consultation_enquiry');
    const recordCount = parseInt(countResult.rows[0]?.count || '0');

    // Get table structure
    const structureResult = await query(
      `SELECT column_name, data_type, is_nullable
       FROM information_schema.columns
       WHERE table_schema = 'public' 
       AND table_name = 'consultation_enquiry'
       ORDER BY ordinal_position`
    );

    return NextResponse.json({
      tableExists: true,
      recordCount,
      columns: structureResult.rows,
      message: 'Table exists and is accessible'
    });
  } catch (error: any) {
    console.error('Error checking table:', error);
    return NextResponse.json(
      {
        tableExists: false,
        error: error.message,
        code: error.code,
        message: 'Error checking database table'
      },
      { status: 500 }
    );
  }
}

