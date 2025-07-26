'use client';

import React, { useEffect } from 'react';
import { useUser } from '@/hooks/useUser';
import { observability } from '@/lib/observability';

export function ObservabilityProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      observability.setUserId(user.id);
    }
  }, [user]);

  // Track page views
  useEffect(() => {
    observability.trackMetric({
      name: 'page_view',
      tags: {
        path: window.location.pathname,
        referrer: document.referrer,
      },
    });
  }, []);

  // Development mode: log metrics to console
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const interval = setInterval(() => {
        const metrics = observability.getSessionMetrics();
        if (metrics.metrics.length > 0 || metrics.errors.length > 0) {
          console.log('[Observability] Session metrics:', metrics);
        }
      }, 30000); // Every 30 seconds

      return () => clearInterval(interval);
    }
  }, []);

  return <>{children}</>;
}