'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface ParameterSelections {
  cameras: number | '';
  resolution: string;
  fps: number;
  codec: string;
  quality: string;
  activityPercent: number;
  recordingHoursPerDay: number;
  retentionDays: number;
  recordingMode: string;
}

interface AnalyticsData {
  userSessionId: string;
  parameterSelections: ParameterSelections;
  startTime: string;
  endTime?: string;
  timeSpent: number;
  actionSequence: string[];
  pageUrl: string;
  userAgent: string;
}

interface UseAnalyticsTrackerProps {
  sessionId: string;
  onDataChange?: (data: Partial<AnalyticsData>) => void;
}

export function useAnalyticsTracker({ sessionId, onDataChange }: UseAnalyticsTrackerProps) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    userSessionId: sessionId,
    parameterSelections: {
      cameras: '',
      resolution: '4K',
      fps: 30,
      codec: 'H.265',
      quality: 'Medium',
      activityPercent: 70,
      recordingHoursPerDay: 24,
      retentionDays: 30,
      recordingMode: 'continuous'
    },
    startTime: new Date().toISOString(),
    timeSpent: 0,
    actionSequence: [],
    pageUrl: typeof window !== 'undefined' ? window.location.href : '',
    userAgent: typeof window !== 'undefined' ? navigator.userAgent : ''
  });

  const startTimeRef = useRef<number>(Date.now());
  const lastActivityRef = useRef<number>(Date.now());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Track parameter changes
  const trackParameterChange = useCallback((parameter: keyof ParameterSelections, value: any) => {
    setAnalyticsData(prev => {
      const updated = {
        ...prev,
        parameterSelections: {
          ...prev.parameterSelections,
          [parameter]: value
        }
      };
      onDataChange?.(updated);
      return updated;
    });
  }, [onDataChange]);

  // Track user actions
  const trackAction = useCallback((action: string) => {
    setAnalyticsData(prev => {
      const updated = {
        ...prev,
        actionSequence: [...prev.actionSequence, `${action}_${Date.now()}`]
      };
      onDataChange?.(updated);
      return updated;
    });
  }, [onDataChange]);

  // Track time spent
  const updateTimeSpent = useCallback(() => {
    const now = Date.now();
    const timeSpent = Math.floor((now - startTimeRef.current) / 1000);
    
    setAnalyticsData(prev => {
      const updated = {
        ...prev,
        timeSpent
      };
      onDataChange?.(updated);
      return updated;
    });
  }, [onDataChange]);

  // Start tracking
  const startTracking = useCallback(() => {
    startTimeRef.current = Date.now();
    lastActivityRef.current = Date.now();
    
    // Update time spent every 5 seconds
    intervalRef.current = setInterval(updateTimeSpent, 5000);
    
    trackAction('session_start');
  }, [updateTimeSpent, trackAction]);

  // Stop tracking
  const stopTracking = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    const endTime = new Date().toISOString();
    const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
    
    setAnalyticsData(prev => {
      const updated = {
        ...prev,
        endTime,
        timeSpent
      };
      onDataChange?.(updated);
      return updated;
    });
    
    trackAction('session_end');
  }, [trackAction]);

  // Track page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        lastActivityRef.current = Date.now();
      } else {
        // User returned to page, update activity
        lastActivityRef.current = Date.now();
        updateTimeSpent();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [updateTimeSpent]);

  // Track beforeunload
  useEffect(() => {
    const handleBeforeUnload = () => {
      stopTracking();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [stopTracking]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    analyticsData,
    trackParameterChange,
    trackAction,
    startTracking,
    stopTracking,
    updateTimeSpent
  };
}
