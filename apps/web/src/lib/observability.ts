// Basic observability and monitoring

interface MetricEvent {
  name: string;
  value?: number;
  tags?: Record<string, string>;
  timestamp: number;
}

interface ErrorEvent {
  message: string;
  stack?: string;
  context?: Record<string, any>;
  timestamp: number;
}

class ObservabilityService {
  private metrics: MetricEvent[] = [];
  private errors: ErrorEvent[] = [];
  private sessionId: string;
  private userId?: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    if (typeof window !== 'undefined') {
      this.setupErrorHandlers();
      this.setupPerformanceObserver();
    }
  }

  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  setUserId(userId: string) {
    this.userId = userId;
  }

  // Error tracking
  private setupErrorHandlers() {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.trackError({
        message: event.error?.message || event.message,
        stack: event.error?.stack,
        context: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      });
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        context: {
          promise: event.promise,
        },
      });
    });
  }

  trackError(error: Omit<ErrorEvent, 'timestamp'>) {
    const errorEvent: ErrorEvent = {
      ...error,
      timestamp: Date.now(),
    };

    this.errors.push(errorEvent);
    console.error('[Observability] Error tracked:', errorEvent);

    // Send to backend if online
    if (navigator.onLine) {
      this.sendErrors([errorEvent]);
    }
  }

  // Performance monitoring
  private setupPerformanceObserver() {
    if ('PerformanceObserver' in window) {
      // Track long tasks
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.trackMetric({
              name: 'long_task',
              value: entry.duration,
              tags: {
                taskType: (entry as any).attribution?.[0]?.taskType || 'unknown',
              },
            });
          }
        });
        longTaskObserver.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        console.warn('Long task observer not supported');
      }

      // Track page load performance
      window.addEventListener('load', () => {
        setTimeout(() => {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          if (navigation) {
            this.trackMetric({
              name: 'page_load_time',
              value: navigation.loadEventEnd - navigation.fetchStart,
              tags: {
                page: window.location.pathname,
              },
            });

            this.trackMetric({
              name: 'dom_content_loaded',
              value: navigation.domContentLoadedEventEnd - navigation.fetchStart,
            });
          }
        }, 0);
      });
    }
  }

  // Metric tracking
  trackMetric(metric: Omit<MetricEvent, 'timestamp'>) {
    const metricEvent: MetricEvent = {
      ...metric,
      timestamp: Date.now(),
    };

    this.metrics.push(metricEvent);

    // Keep only last 100 metrics in memory
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }

    // Batch send metrics
    if (this.metrics.length >= 10 && navigator.onLine) {
      this.sendMetrics(this.metrics.splice(0, 10));
    }
  }

  // User action tracking
  trackUserAction(action: string, properties?: Record<string, any>) {
    this.trackMetric({
      name: 'user_action',
      tags: {
        action,
        ...properties,
      },
    });
  }

  // Feature usage tracking
  trackFeatureUsage(feature: string) {
    this.trackMetric({
      name: 'feature_usage',
      tags: { feature },
    });
  }

  // API call tracking
  async trackApiCall<T>(
    operation: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const startTime = performance.now();
    
    try {
      const result = await fn();
      const duration = performance.now() - startTime;
      
      this.trackMetric({
        name: 'api_call',
        value: duration,
        tags: {
          operation,
          status: 'success',
        },
      });
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      
      this.trackMetric({
        name: 'api_call',
        value: duration,
        tags: {
          operation,
          status: 'error',
        },
      });
      
      this.trackError({
        message: `API call failed: ${operation}`,
        stack: error instanceof Error ? error.stack : undefined,
        context: { operation, error },
      });
      
      throw error;
    }
  }

  // Send data to backend (placeholder - would integrate with real monitoring service)
  private async sendMetrics(metrics: MetricEvent[]) {
    try {
      // Sending metrics to monitoring service
      // In production, send to monitoring service like DataDog, New Relic, etc.
      // await fetch('/api/metrics', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ metrics, sessionId: this.sessionId, userId: this.userId }),
      // });
    } catch (error) {
      console.error('[Observability] Failed to send metrics:', error);
    }
  }

  private async sendErrors(errors: ErrorEvent[]) {
    try {
      console.error('[Observability] Sending errors:', errors);
      // In production, send to error tracking service like Sentry
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ errors, sessionId: this.sessionId, userId: this.userId }),
      // });
    } catch (error) {
      console.error('[Observability] Failed to send errors:', error);
    }
  }

  // Get current session metrics
  getSessionMetrics() {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      metrics: this.metrics,
      errors: this.errors,
      timestamp: Date.now(),
    };
  }
}

export const observability = new ObservabilityService();