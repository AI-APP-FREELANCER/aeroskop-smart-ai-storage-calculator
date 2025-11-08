import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Get total AI calls
    const totalCallsResult = await query('SELECT COUNT(*) as total FROM ai_usage_logs');
    const totalCalls = parseInt(totalCallsResult.rows[0].total);

    // Get cached calls
    const cachedCallsResult = await query(
      'SELECT COUNT(*) as cached FROM ai_usage_logs WHERE cached = true'
    );
    const cachedCalls = parseInt(cachedCallsResult.rows[0].cached);

    // Get total tokens used
    const tokensResult = await query(
      'SELECT COALESCE(SUM(tokens_used), 0) as total_tokens FROM ai_usage_logs'
    );
    const totalTokens = parseInt(tokensResult.rows[0].total_tokens);

    // Get average response time
    const avgResponseResult = await query(
      'SELECT COALESCE(AVG(response_time_ms), 0) as avg_response FROM ai_usage_logs'
    );
    const averageResponseTime = parseFloat(avgResponseResult.rows[0].avg_response);

    // Calculate cost estimate (rough estimate: $0.0001 per 1K tokens for Gemini 1.5 Flash)
    const costEstimate = (totalTokens / 1000) * 0.0001;

    return NextResponse.json({
      totalCalls,
      cachedCalls,
      totalTokens,
      averageResponseTime,
      costEstimate
    });

  } catch (error) {
    console.error('Error fetching AI usage:', error);
    return NextResponse.json(
      { error: 'Failed to fetch AI usage data' },
      { status: 500 }
    );
  }
}
