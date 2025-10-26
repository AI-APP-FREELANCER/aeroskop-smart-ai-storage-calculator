import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resultId, userId, timestamp, params, summary, productMapping } = body;

    // Store calculation context for chat awareness
    const result = await query(
      `INSERT INTO calculation_contexts (
        result_id, user_id, timestamp, params, summary, product_mapping, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        resultId,
        userId || null,
        timestamp,
        JSON.stringify(params),
        summary,
        JSON.stringify(productMapping),
        new Date().toISOString()
      ]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error: any) {
    console.error('Error storing calculation context:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to store calculation context' },
      { status: 500 }
    );
  }
}
