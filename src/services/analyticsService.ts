interface AnalyticsPayload {
  userSessionId: string;
  parameterSelections: {
    cameras: number | '';
    resolution: string;
    fps: number;
    codec: string;
    quality: string;
    activityPercent: number;
    recordingHoursPerDay: number;
    retentionDays: number;
    recordingMode: string;
  };
  startTime: string;
  endTime?: string;
  timeSpent: number;
  actionSequence: string[];
  pageUrl: string;
  userAgent: string;
}

class AnalyticsService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
  }

  async trackUserBehavior(data: AnalyticsPayload): Promise<void> {
    try {
      const response = await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Analytics tracking failed: ${response.statusText}`);
      }

      console.log('Analytics data tracked successfully');
    } catch (error) {
      console.error('Failed to track analytics:', error);
      // Don't throw error to avoid breaking user experience
    }
  }

  async trackCalculatorInteraction(
    sessionId: string,
    action: string,
    parameters?: Partial<AnalyticsPayload['parameterSelections']>
  ): Promise<void> {
    try {
      const payload = {
        sessionId,
        action,
        parameters,
        timestamp: new Date().toISOString(),
        pageUrl: typeof window !== 'undefined' ? window.location.href : '',
      };

      const response = await fetch('/api/analytics/calculator-interaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Calculator interaction tracking failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to track calculator interaction:', error);
    }
  }

  async trackRecommendationGenerated(
    sessionId: string,
    parameters: AnalyticsPayload['parameterSelections'],
    recommendationData: {
      productName: string;
      storageTB: number;
      bitrate: number;
    }
  ): Promise<void> {
    try {
      const payload = {
        sessionId,
        parameters,
        recommendationData,
        timestamp: new Date().toISOString(),
        pageUrl: typeof window !== 'undefined' ? window.location.href : '',
      };

      const response = await fetch('/api/analytics/recommendation-generated', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Recommendation tracking failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to track recommendation generation:', error);
    }
  }
}

export const analyticsService = new AnalyticsService();
