// Performance monitoring utilities
import { observability } from './observability';

export interface PerformanceMetrics {
  ttfb: number; // Time to First Byte
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  tti: number; // Time to Interactive
}

class PerformanceMonitor {
  private metrics: Partial<PerformanceMetrics> = {};
  private observer: PerformanceObserver | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      this.initializeObserver();
      this.measureNavigationTiming();
    }
  }

  private initializeObserver() {
    try {
      // Observe paint timings
      const paintObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            this.metrics.fcp = Math.round(entry.startTime);
          }
        }
      });
      paintObserver.observe({ entryTypes: ['paint'] });

      // Observe LCP
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.lcp = Math.round(lastEntry.startTime);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // Observe FID
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.metrics.fid = Math.round(entry.processingStart - entry.startTime);
        }
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // Observe CLS
      let clsValue = 0;
      let clsEntries: PerformanceEntry[] = [];
      
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsEntries.push(entry);
            clsValue += (entry as any).value;
          }
        }
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });

      // Store CLS when page is hidden
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          this.metrics.cls = Math.round(clsValue * 1000) / 1000;
        }
      });

    } catch (error) {
      console.error('Failed to initialize performance observer:', error);
    }
  }

  private measureNavigationTiming() {
    if ('performance' in window && 'getEntriesByType' in performance) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        // Time to First Byte
        this.metrics.ttfb = Math.round(navigation.responseStart - navigation.requestStart);
        
        // Time to Interactive (approximation)
        this.metrics.tti = Math.round(navigation.loadEventEnd - navigation.fetchStart);
      }
    }
  }

  public recordMetric(name: string, value: number) {
    observability.trackPerformance(name, value);
  }

  public recordPageLoad(pageName: string) {
    // Wait for all metrics to be collected
    setTimeout(() => {
      const metrics = this.getMetrics();
      
      // Track Core Web Vitals
      if (metrics.lcp) {
        this.recordMetric(`${pageName}_lcp`, metrics.lcp);
      }
      if (metrics.fid) {
        this.recordMetric(`${pageName}_fid`, metrics.fid);
      }
      if (metrics.cls !== undefined) {
        this.recordMetric(`${pageName}_cls`, metrics.cls);
      }
      
      // Track other metrics
      if (metrics.ttfb) {
        this.recordMetric(`${pageName}_ttfb`, metrics.ttfb);
      }
      if (metrics.fcp) {
        this.recordMetric(`${pageName}_fcp`, metrics.fcp);
      }
      
      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`Performance metrics for ${pageName}:`, metrics);
      }
    }, 3000); // Wait 3 seconds to ensure LCP is captured
  }

  public getMetrics(): Partial<PerformanceMetrics> {
    return { ...this.metrics };
  }

  public measureComponentRender(componentName: string) {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = Math.round(endTime - startTime);
      this.recordMetric(`component_${componentName}_render`, renderTime);
    };
  }

  public measureApiCall(endpoint: string) {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);
      this.recordMetric(`api_${endpoint}_duration`, duration);
    };
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for measuring component performance
export function usePerformance(componentName: string) {
  if (typeof window === 'undefined') return;
  
  // Measure initial render
  const endMeasure = performanceMonitor.measureComponentRender(componentName);
  
  // Clean up measurement after render
  requestAnimationFrame(() => {
    endMeasure();
  });
}

// Utility to measure async operations
export async function measureAsync<T>(
  name: string,
  operation: () => Promise<T>
): Promise<T> {
  const startTime = performance.now();
  
  try {
    const result = await operation();
    const duration = Math.round(performance.now() - startTime);
    performanceMonitor.recordMetric(`async_${name}`, duration);
    return result;
  } catch (error) {
    const duration = Math.round(performance.now() - startTime);
    performanceMonitor.recordMetric(`async_${name}_error`, duration);
    throw error;
  }
}

// Web Vitals thresholds for reference
export const WEB_VITALS_THRESHOLDS = {
  lcp: { good: 2500, needsImprovement: 4000 }, // milliseconds
  fid: { good: 100, needsImprovement: 300 }, // milliseconds
  cls: { good: 0.1, needsImprovement: 0.25 }, // score
  ttfb: { good: 800, needsImprovement: 1800 }, // milliseconds
  fcp: { good: 1800, needsImprovement: 3000 }, // milliseconds
};

// Check if metrics are within acceptable thresholds
export function checkPerformanceHealth(metrics: Partial<PerformanceMetrics>) {
  const issues: string[] = [];
  
  if (metrics.lcp && metrics.lcp > WEB_VITALS_THRESHOLDS.lcp.needsImprovement) {
    issues.push(`LCP is ${metrics.lcp}ms (should be < ${WEB_VITALS_THRESHOLDS.lcp.needsImprovement}ms)`);
  }
  
  if (metrics.fid && metrics.fid > WEB_VITALS_THRESHOLDS.fid.needsImprovement) {
    issues.push(`FID is ${metrics.fid}ms (should be < ${WEB_VITALS_THRESHOLDS.fid.needsImprovement}ms)`);
  }
  
  if (metrics.cls && metrics.cls > WEB_VITALS_THRESHOLDS.cls.needsImprovement) {
    issues.push(`CLS is ${metrics.cls} (should be < ${WEB_VITALS_THRESHOLDS.cls.needsImprovement})`);
  }
  
  return {
    healthy: issues.length === 0,
    issues,
  };
}