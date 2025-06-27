import React, { useEffect, useCallback } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  domContentLoaded: number;
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
  firstInputDelay?: number;
  cumulativeLayoutShift?: number;
}

interface PerformanceMonitorProps {
  onMetrics?: (metrics: PerformanceMetrics) => void;
  enableReporting?: boolean;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  onMetrics,
  enableReporting = process.env.NODE_ENV === 'production'
}) => {
  const reportMetrics = useCallback((metrics: PerformanceMetrics) => {
    if (onMetrics) {
      onMetrics(metrics);
    }

    // Log metrics in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Performance Metrics:', metrics);
    }

    // Send to analytics service in production
    if (enableReporting && process.env.NODE_ENV === 'production') {
      // Example: Send to analytics service
      // fetch('/api/analytics/performance', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(metrics)
      // });
    }
  }, [onMetrics, enableReporting]);

  const measureWebVitals = useCallback(() => {
    // Basic performance metrics
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    const metrics: PerformanceMetrics = {
      loadTime: navigation.loadEventEnd - navigation.loadEventStart,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
    };

    // Web Vitals (if supported)
    if ('PerformanceObserver' in window) {
      // First Contentful Paint (FCP)
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            metrics.firstContentfulPaint = entry.startTime;
          }
        }
      }).observe({ entryTypes: ['paint'] });

      // Largest Contentful Paint (LCP)
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        metrics.largestContentfulPaint = lastEntry.startTime;
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay (FID)
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          metrics.firstInputDelay = (entry as any).processingStart - entry.startTime;
        }
      }).observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift (CLS)
      let clsValue = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        metrics.cumulativeLayoutShift = clsValue;
      }).observe({ entryTypes: ['layout-shift'] });
    }

    // Report metrics after a delay to ensure all measurements are captured
    setTimeout(() => {
      reportMetrics(metrics);
    }, 3000);
  }, [reportMetrics]);

  const measureResourceTiming = useCallback(() => {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const resourceMetrics = {
      totalResources: resources.length,
      totalSize: resources.reduce((total, resource) => {
        return total + (resource.transferSize || 0);
      }, 0),
      slowestResource: resources.reduce((slowest, resource) => {
        const duration = resource.responseEnd - resource.startTime;
        return duration > (slowest?.duration || 0) ? { ...resource, duration } : slowest;
      }, null as any),
    };

    if (process.env.NODE_ENV === 'development') {
      console.log('Resource Metrics:', resourceMetrics);
    }
  }, []);

  const measureMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const memoryMetrics = {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        memoryUsagePercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
      };

      if (process.env.NODE_ENV === 'development') {
        console.log('Memory Metrics:', memoryMetrics);
      }

      // Warn if memory usage is high
      if (memoryMetrics.memoryUsagePercentage > 80) {
        console.warn('High memory usage detected:', memoryMetrics.memoryUsagePercentage.toFixed(2) + '%');
      }
    }
  }, []);

  useEffect(() => {
    // Wait for page load to complete
    if (document.readyState === 'complete') {
      measureWebVitals();
      measureResourceTiming();
      measureMemoryUsage();
    } else {
      window.addEventListener('load', () => {
        measureWebVitals();
        measureResourceTiming();
        measureMemoryUsage();
      });
    }

    // Monitor memory usage periodically in development
    if (process.env.NODE_ENV === 'development') {
      const memoryInterval = setInterval(measureMemoryUsage, 30000); // Every 30 seconds
      return () => clearInterval(memoryInterval);
    }
  }, [measureWebVitals, measureResourceTiming, measureMemoryUsage]);

  // This component doesn't render anything
  return null;
};

// Hook for component-level performance monitoring
export const usePerformanceMonitoring = (componentName: string) => {
  const measureComponentRender = useCallback(() => {
    const start = performance.now();
    
    return () => {
      const end = performance.now();
      const renderTime = end - start;
      
      if (process.env.NODE_ENV === 'development' && renderTime > 16) { // Warn if render takes longer than 16ms
        console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
      }
    };
  }, [componentName]);

  useEffect(() => {
    const endMeasurement = measureComponentRender();
    return endMeasurement;
  });

  return { measureComponentRender };
};

// Performance budget checker
export const checkPerformanceBudget = () => {
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
  
  const budgets = {
    loadTime: 3000, // 3 seconds
    domContentLoaded: 1500, // 1.5 seconds
    firstContentfulPaint: 1800, // 1.8 seconds
    largestContentfulPaint: 2500, // 2.5 seconds
  };

  const results = {
    loadTime: {
      value: loadTime,
      budget: budgets.loadTime,
      passed: loadTime <= budgets.loadTime,
    },
    domContentLoaded: {
      value: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      budget: budgets.domContentLoaded,
      passed: (navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart) <= budgets.domContentLoaded,
    },
  };

  if (process.env.NODE_ENV === 'development') {
    console.log('Performance Budget Check:', results);
    
    Object.entries(results).forEach(([metric, result]) => {
      if (!result.passed) {
        console.warn(`Performance budget exceeded for ${metric}: ${result.value}ms > ${result.budget}ms`);
      }
    });
  }

  return results;
};

export default PerformanceMonitor;
