import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      sessionId,
      userId,
      endpoint,
      model,
      requestTime,
      responseTime,
      latencyMs,
      status,
      tokensInput,
      tokensOutput,
      tokensTotal,
      apiCallsCount,
      costEstimate,
      errorCode,
      errorMessage
    } = body;

    // Store Gemini usage analytics
    const result = await query(
      `INSERT INTO gemini_usage (
        session_id, user_id, endpoint, model, request_time, response_time, 
        latency_ms, status, tokens_input, tokens_output, tokens_total, 
        api_calls_count, cost_estimate, error_code, error_message, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING *`,
      [
        sessionId,
        userId || null,
        endpoint,
        model,
        requestTime,
        responseTime,
        latencyMs,
        status,
        tokensInput || 0,
        tokensOutput || 0,
        tokensTotal || 0,
        apiCallsCount || 1,
        costEstimate || 0,
        errorCode || null,
        errorMessage || null,
        new Date().toISOString()
      ]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error: any) {
    console.error('Error storing Gemini analytics:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to store Gemini analytics' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '24h';
    const userId = searchParams.get('userId');

    let timeFilter = '';
    switch (period) {
      case '24h':
        timeFilter = "created_at >= NOW() - INTERVAL '24 hours'";
        break;
      case '7d':
        timeFilter = "created_at >= NOW() - INTERVAL '7 days'";
        break;
      case '30d':
        timeFilter = "created_at >= NOW() - INTERVAL '30 days'";
        break;
      default:
        timeFilter = "created_at >= NOW() - INTERVAL '24 hours'";
    }

    const userFilter = userId ? `AND user_id = '${userId}'` : '';

    // Get aggregated analytics
    const analytics = await query(`
      SELECT 
        COUNT(*) as total_requests,
        SUM(tokens_input) as total_tokens_input,
        SUM(tokens_output) as total_tokens_output,
        SUM(tokens_total) as total_tokens,
        AVG(latency_ms) as avg_latency,
        COUNT(CASE WHEN status = 'error' THEN 1 END) as error_count,
        COUNT(CASE WHEN status = 'error' THEN 1 END)::float / COUNT(*)::float * 100 as error_rate,
        SUM(cost_estimate) as total_cost
      FROM gemini_usage 
      WHERE ${timeFilter} ${userFilter}
    `);

    // Get top failing endpoints
    const failingEndpoints = await query(`
      SELECT endpoint, error_code, error_message, COUNT(*) as error_count
      FROM gemini_usage 
      WHERE ${timeFilter} ${userFilter} AND status = 'error'
      GROUP BY endpoint, error_code, error_message
      ORDER BY error_count DESC
      LIMIT 10
    `);

    // Get top consumers
    const topConsumers = await query(`
      SELECT user_id, session_id, COUNT(*) as request_count, SUM(tokens_total) as total_tokens
      FROM gemini_usage 
      WHERE ${timeFilter}
      GROUP BY user_id, session_id
      ORDER BY total_tokens DESC
      LIMIT 10
    `);

    return NextResponse.json({
      analytics: analytics.rows[0],
      failingEndpoints: failingEndpoints.rows,
      topConsumers: topConsumers.rows,
      lastUpdated: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error fetching Gemini analytics:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch Gemini analytics' },
      { status: 500 }
    );
  }
}
