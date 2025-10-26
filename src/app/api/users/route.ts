import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { CreateUserRequest } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body: CreateUserRequest = await request.json();
    
    const result = await query(
      `INSERT INTO users (first_name, last_name, email, country_code, phone_number, company) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [body.first_name, body.last_name, body.email, body.country_code, body.phone_number, body.company]
    );
    
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error: any) {
    if (error.code === '23505') { // Unique constraint violation
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to create user' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (email) {
      const result = await query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );
      return NextResponse.json(result.rows[0] || null);
    }
    
    const result = await query('SELECT * FROM users ORDER BY created_at DESC');
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
