'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function PageTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const trackPageView = async () => {
      try {
        // Get session ID from localStorage or create a new one
        let sessionId = localStorage.getItem('session_id');
        if (!sessionId) {
          // Try to get from existing session or create new one
          const response = await fetch('/api/sessions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              session_type: 'guest',
              ip_address: '127.0.0.1',
              user_agent: navigator.userAgent
            })
          });
          
          if (response.ok) {
            const session = await response.json();
            sessionId = session.id;
            if (sessionId) {
              localStorage.setItem('session_id', sessionId);
            }
          }
        }

        // Track page view
        await fetch('/api/page-analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: sessionId,
            page_url: pathname,
            page_title: document.title,
            referrer: document.referrer,
            time_spent_seconds: 0, // Will be updated on page unload
            scroll_depth: 0,
            clicks_count: 0
          })
        });
      } catch (error) {
        console.error('Failed to track page view:', error);
      }
    };

    trackPageView();

    // Track time spent on page
    const startTime = Date.now();
    
    const handleBeforeUnload = () => {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      
      // Send final time spent data
      fetch('/api/page-analytics/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: localStorage.getItem('session_id'),
          page_url: pathname,
          time_spent_seconds: timeSpent,
          scroll_depth: Math.floor((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100)
        })
      }).catch(console.error);
    };

    // Track scroll depth
    let maxScrollDepth = 0;
    const handleScroll = () => {
      const scrollDepth = Math.floor((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
      maxScrollDepth = Math.max(maxScrollDepth, scrollDepth);
    };

    // Track clicks
    let clickCount = 0;
    const handleClick = (event: MouseEvent) => {
      clickCount++;
      
      // Track click stream
      const target = event.target as HTMLElement;
      fetch('/api/click-streams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: localStorage.getItem('session_id'),
          element_id: target.id || null,
          element_class: target.className || null,
          element_text: target.textContent?.slice(0, 100) || null,
          page_url: pathname,
          click_x: event.clientX,
          click_y: event.clientY
        })
      }).catch(console.error);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('scroll', handleScroll);
    document.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('click', handleClick);
    };
  }, [pathname]);

  return null; // This component doesn't render anything
}
