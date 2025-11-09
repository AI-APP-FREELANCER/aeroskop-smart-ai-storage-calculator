'use client';

import { useState, useEffect } from 'react';
import { User } from '@/lib/types';

interface AnalyticsData {
  totalUsers: number;
  totalSessions: number;
  totalCalculations: number;
  usersByCountry: { country: string; count: number }[];
  usersByCompany: { company: string; count: number }[];
  recentUsers: User[];
  calculatorUsage: {
    mostCommonSettings: {
      resolution: string;
      fps: number;
      codec: string;
      retentionDays: number;
    }[];
    averageStorage: number;
    totalStorageCalculated: number;
  };
  geminiAnalytics: {
    totalRequests: number;
    totalTokensInput: number;
    totalTokensOutput: number;
    totalTokens: number;
    avgLatency: number;
    errorRate: number;
    totalCost: number;
    lastUpdated: string;
  };
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch users data
      const usersResponse = await fetch('/api/users');
      if (!usersResponse.ok) throw new Error('Failed to fetch users');
      const users: User[] = await usersResponse.json();

      // Fetch sessions data
      const sessionsResponse = await fetch('/api/sessions');
      const sessions = sessionsResponse.ok ? await sessionsResponse.json() : [];

      // Fetch activities data
      const activitiesResponse = await fetch('/api/activities');
      const activities = activitiesResponse.ok ? await activitiesResponse.json() : [];

      // Fetch Gemini analytics
      const geminiResponse = await fetch('/api/analytics/gemini?period=24h');
      const geminiAnalytics = geminiResponse.ok ? await geminiResponse.json() : {
        analytics: {
          total_requests: 0,
          total_tokens_input: 0,
          total_tokens_output: 0,
          total_tokens: 0,
          avg_latency: 0,
          error_rate: 0,
          total_cost: 0
        },
        lastUpdated: new Date().toISOString()
      };

      // Calculate analytics
      const totalUsers = users.length;
      const totalSessions = sessions.length;
      const totalCalculations = activities.filter((a: any) => a.activity_type === 'calculator_use').length;

      // Geographic distribution
      const countryStats = users.reduce((acc, user) => {
        const country = user.country_code;
        acc[country] = (acc[country] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const usersByCountry = Object.entries(countryStats)
        .map(([country, count]) => ({ country, count }))
        .sort((a, b) => b.count - a.count);

      // Company analysis
      const companyStats = users.reduce((acc, user) => {
        if (user.company) {
          acc[user.company] = (acc[user.company] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      const usersByCompany = Object.entries(companyStats)
        .map(([company, count]) => ({ company, count: count as number }))
        .sort((a, b) => b.count - a.count);

      // Recent users
      const recentUsers = users
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 20);

      // Calculator usage patterns
      const calculatorActivities = activities.filter((a: any) => a.activity_type === 'calculator_use');
      const mostCommonSettings = calculatorActivities.reduce((acc: any, activity: any) => {
        const data = activity.activity_data?.formData;
        if (data) {
          const key = `${data.resolution}-${data.fps}-${data.codec}-${data.retentionDays}`;
          acc[key] = (acc[key] || 0) + 1;
        }
        return acc;
      }, {});

      const sortedSettings = Object.entries(mostCommonSettings)
        .map(([key, count]) => {
          const [resolution, fps, codec, retentionDays] = key.split('-');
          return { resolution, fps: parseInt(fps), codec, retentionDays: parseInt(retentionDays), count: count as number };
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const averageStorage = calculatorActivities.reduce((sum: number, activity: any) => {
        const storage = activity.activity_data?.calculationResult?.totalStorageTB || 0;
        return sum + storage;
      }, 0) / Math.max(calculatorActivities.length, 1);

      const totalStorageCalculated = calculatorActivities.reduce((sum: number, activity: any) => {
        return sum + (activity.activity_data?.calculationResult?.totalStorageTB || 0);
      }, 0);

      setAnalytics({
        totalUsers,
        totalSessions,
        totalCalculations,
        usersByCountry,
        usersByCompany,
        recentUsers,
        calculatorUsage: {
          mostCommonSettings: sortedSettings,
          averageStorage,
          totalStorageCalculated
        },
        geminiAnalytics: {
          totalRequests: geminiAnalytics.analytics.total_requests || 0,
          totalTokensInput: geminiAnalytics.analytics.total_tokens_input || 0,
          totalTokensOutput: geminiAnalytics.analytics.total_tokens_output || 0,
          totalTokens: geminiAnalytics.analytics.total_tokens || 0,
          avgLatency: geminiAnalytics.analytics.avg_latency || 0,
          errorRate: geminiAnalytics.analytics.error_rate || 0,
          totalCost: geminiAnalytics.analytics.total_cost || 0,
          lastUpdated: geminiAnalytics.lastUpdated || new Date().toISOString()
        }
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
          <p className="mt-4 text-gray-600">Loading analytics...</p>
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
            onClick={fetchAnalytics}
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
            href="/admin/monitoring"
            className="inline-flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Monitoring
          </a>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">User Analytics</h1>
          <p className="text-gray-600">Detailed insights into user behavior and calculator usage patterns</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{analytics?.totalUsers || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{analytics?.totalSessions || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Calculations</p>
                <p className="text-2xl font-bold text-gray-900">{analytics?.totalCalculations || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Storage (TB)</p>
                <p className="text-2xl font-bold text-gray-900">{analytics?.calculatorUsage.averageStorage.toFixed(1) || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Gemini AI Analytics */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Gemini AI Analytics (Last 24h)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Requests</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics?.geminiAnalytics.totalRequests || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Tokens</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics?.geminiAnalytics.totalTokens.toLocaleString() || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Latency (ms)</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics?.geminiAnalytics.avgLatency.toFixed(0) || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.467 2.502-3V7.5c0-1.533-.962-3-2.502-3H5.062C3.522 4.5 2.56 5.967 2.56 7.5v9c0 1.533.962 3 2.502 3z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Error Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics?.geminiAnalytics.errorRate.toFixed(1) || 0}%</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-gray-500">
            Last updated: {analytics?.geminiAnalytics.lastUpdated ? new Date(analytics.geminiAnalytics.lastUpdated).toLocaleString() : 'Never'}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Geographic Distribution */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Geographic Distribution</h3>
            </div>
            <div className="p-6">
              {analytics?.usersByCountry.length ? (
                <div className="space-y-4">
                  {analytics.usersByCountry.slice(0, 10).map((item, index) => (
                    <div key={item.country} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900 w-8">
                          {index + 1}.
                        </span>
                        <span className="ml-2 text-sm text-gray-600">{item.country}</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ 
                              width: `${(item.count / (analytics.usersByCountry[0]?.count || 1)) * 100}%` 
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{item.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No geographic data available</p>
              )}
            </div>
          </div>

          {/* Company Analysis */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Company Analysis</h3>
            </div>
            <div className="p-6">
              {analytics?.usersByCompany.length ? (
                <div className="space-y-4">
                  {analytics.usersByCompany.slice(0, 10).map((item, index) => (
                    <div key={item.company} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900 w-8">
                          {index + 1}.
                        </span>
                        <span className="ml-2 text-sm text-gray-600">{item.company}</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ 
                              width: `${(item.count / (analytics.usersByCompany[0]?.count || 1)) * 100}%` 
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{item.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No company data available</p>
              )}
            </div>
          </div>
        </div>

        {/* Calculator Usage Patterns */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Calculator Usage Patterns</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Most Common Settings</h4>
                {analytics?.calculatorUsage.mostCommonSettings.length ? (
                  <div className="space-y-3">
                    {analytics.calculatorUsage.mostCommonSettings.map((setting, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm">
                          <span className="font-medium">{setting.resolution}</span> • 
                          <span className="ml-1">{setting.fps} FPS</span> • 
                          <span className="ml-1">{setting.codec}</span> • 
                          <span className="ml-1">{setting.retentionDays} days</span>
                        </div>
                        <span className="text-sm font-medium text-blue-600">{setting.count} uses</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No calculator usage data available</p>
                )}
              </div>
              
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Storage Statistics</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Total Storage Calculated</span>
                    <span className="text-lg font-bold text-blue-600">
                      {analytics?.calculatorUsage.totalStorageCalculated.toFixed(1) || 0} TB
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Average per Calculation</span>
                    <span className="text-lg font-bold text-green-600">
                      {analytics?.calculatorUsage.averageStorage.toFixed(1) || 0} TB
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Users */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Users</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Country
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analytics?.recentUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {user.first_name} {user.last_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{user.country_code}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{user.company || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{user.phone_number || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {new Date(user.created_at).toLocaleDateString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
