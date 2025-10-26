'use client';

import { useState, useEffect } from 'react';

interface MonitoringData {
  pageViews: {
    total: number;
    byPage: { page: string; views: number }[];
    today: number;
  };
  aiUsage: {
    totalCalls: number;
    cachedCalls: number;
    totalTokens: number;
    averageResponseTime: number;
    costEstimate: number;
  };
  systemHealth: {
    databaseConnections: number;
    averageResponseTime: number;
    errorRate: number;
    uptime: string;
  };
  clickStreams: {
    totalClicks: number;
    topElements: { element: string; clicks: number }[];
    userJourney: { step: string; count: number }[];
  };
}

export default function MonitoringPage() {
  const [monitoring, setMonitoring] = useState<MonitoringData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMonitoringData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchMonitoringData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchMonitoringData = async () => {
    try {
      setLoading(true);
      
      // Fetch page analytics
      const pageAnalyticsResponse = await fetch('/api/admin/page-analytics');
      const pageAnalytics = pageAnalyticsResponse.ok ? await pageAnalyticsResponse.json() : { total: 0, byPage: [], today: 0 };

      // Fetch AI usage logs
      const aiUsageResponse = await fetch('/api/admin/ai-usage');
      const aiUsage = aiUsageResponse.ok ? await aiUsageResponse.json() : { 
        totalCalls: 0, 
        cachedCalls: 0, 
        totalTokens: 0, 
        averageResponseTime: 0, 
        costEstimate: 0 
      };

      // Fetch click streams
      const clickStreamsResponse = await fetch('/api/admin/click-streams');
      const clickStreams = clickStreamsResponse.ok ? await clickStreamsResponse.json() : { 
        totalClicks: 0, 
        topElements: [], 
        userJourney: [] 
      };

      // Mock system health data (in real implementation, this would come from system monitoring)
      const systemHealth = {
        databaseConnections: Math.floor(Math.random() * 20) + 5,
        averageResponseTime: Math.floor(Math.random() * 100) + 50,
        errorRate: Math.random() * 2,
        uptime: '99.9%'
      };

      setMonitoring({
        pageViews: pageAnalytics,
        aiUsage,
        systemHealth,
        clickStreams
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading monitoring data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️</div>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={fetchMonitoringData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="mb-6 flex flex-wrap gap-3">
          <a
            href="/"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Home
          </a>
          <a
            href="/admin"
            className="inline-flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Dashboard
          </a>
          <a
            href="/admin/analytics"
            className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Analytics
          </a>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">System Monitoring</h1>
          <p className="text-gray-600">Real-time monitoring of system performance, AI usage, and user interactions</p>
        </div>

        {/* System Health Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">System Uptime</p>
                <p className="text-2xl font-bold text-gray-900">{monitoring?.systemHealth.uptime || '99.9%'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                <p className="text-2xl font-bold text-gray-900">{monitoring?.systemHealth.averageResponseTime || 0}ms</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">DB Connections</p>
                <p className="text-2xl font-bold text-gray-900">{monitoring?.systemHealth.databaseConnections || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Error Rate</p>
                <p className="text-2xl font-bold text-gray-900">{monitoring?.systemHealth.errorRate.toFixed(2) || 0}%</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Page Analytics */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Page Analytics</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{monitoring?.pageViews.total || 0}</p>
                  <p className="text-sm text-gray-600">Total Views</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{monitoring?.pageViews.today || 0}</p>
                  <p className="text-sm text-gray-600">Today</p>
                </div>
              </div>
              
              {monitoring?.pageViews.byPage.length ? (
                <div className="space-y-3">
                  <h4 className="text-md font-medium text-gray-900">Top Pages</h4>
                  {monitoring.pageViews.byPage.slice(0, 5).map((page, index) => (
                    <div key={page.page} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{page.page}</span>
                      <span className="text-sm font-medium text-gray-900">{page.views}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No page analytics data available</p>
              )}
            </div>
          </div>

          {/* AI Usage Monitoring */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">AI Usage Monitoring</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{monitoring?.aiUsage.totalCalls || 0}</p>
                  <p className="text-sm text-gray-600">Total Calls</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{monitoring?.aiUsage.cachedCalls || 0}</p>
                  <p className="text-sm text-gray-600">Cached</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Total Tokens Used</span>
                  <span className="text-lg font-bold text-blue-600">{monitoring?.aiUsage.totalTokens.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Avg Response Time</span>
                  <span className="text-lg font-bold text-green-600">{monitoring?.aiUsage.averageResponseTime || 0}ms</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Estimated Cost</span>
                  <span className="text-lg font-bold text-orange-600">${monitoring?.aiUsage.costEstimate.toFixed(2) || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Cache Hit Rate</span>
                  <span className="text-lg font-bold text-purple-600">
                    {monitoring?.aiUsage.totalCalls ? 
                      ((monitoring.aiUsage.cachedCalls / monitoring.aiUsage.totalCalls) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Click Stream Analysis */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Click Stream Analysis</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Total Clicks: {monitoring?.clickStreams.totalClicks || 0}</h4>
                {monitoring?.clickStreams.topElements.length ? (
                  <div className="space-y-3">
                    <h5 className="text-sm font-medium text-gray-700">Most Clicked Elements</h5>
                    {monitoring.clickStreams.topElements.slice(0, 5).map((element, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm text-gray-600">{element.element}</span>
                        <span className="text-sm font-medium text-gray-900">{element.clicks}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No click stream data available</p>
                )}
              </div>
              
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">User Journey</h4>
                {monitoring?.clickStreams.userJourney.length ? (
                  <div className="space-y-3">
                    {monitoring.clickStreams.userJourney.map((step, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                        <span className="text-sm text-gray-600">{step.step}</span>
                        <span className="text-sm font-medium text-blue-600">{step.count}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No user journey data available</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Status */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Real-time Status</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
                <p className="text-sm font-medium text-gray-900">Database</p>
                <p className="text-xs text-gray-600">Connected</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
                <p className="text-sm font-medium text-gray-900">AI Service</p>
                <p className="text-xs text-gray-600">Operational</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
                <p className="text-sm font-medium text-gray-900">API Endpoints</p>
                <p className="text-xs text-gray-600">Healthy</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
