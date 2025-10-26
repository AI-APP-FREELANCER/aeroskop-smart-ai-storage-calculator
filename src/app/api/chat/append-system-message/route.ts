import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, message, metadata } = body;

    // Store system message for chat context
    const result = await query(
      `INSERT INTO chat_messages (
        session_id, sender, message, metadata, created_at
      ) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [
        sessionId,
        'ai',
        message,
        JSON.stringify(metadata),
        new Date().toISOString()
      ]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error: any) {
    console.error('Error appending system message:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to append system message' },
      { status: 500 }
    );
  }
}
