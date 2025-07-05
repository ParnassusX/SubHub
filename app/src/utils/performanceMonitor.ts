// Performance Monitoring Utility for SubHub
// Tracks database query performance and loading times

interface PerformanceMetric {
  operation: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  success: boolean;
  error?: string;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private activeOperations: Map<string, PerformanceMetric> = new Map();

  startOperation(operation: string, metadata?: Record<string, any>): string {
    const operationId = `${operation}_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    
    const metric: PerformanceMetric = {
      operation,
      startTime: performance.now(),
      success: false,
      metadata
    };

    this.activeOperations.set(operationId, metric);
    
    // Log start for debugging (development only)
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 Performance: Starting ${operation}`, metadata);
    }

    return operationId;
  }

  endOperation(operationId: string, success: boolean = true, error?: string): void {
    const metric = this.activeOperations.get(operationId);
    if (!metric) {
      console.warn(`Performance: Operation ${operationId} not found`);
      return;
    }

    metric.endTime = performance.now();
    metric.duration = metric.endTime - metric.startTime;
    metric.success = success;
    metric.error = error;

    this.metrics.push(metric);
    this.activeOperations.delete(operationId);

    // Log completion for debugging
    if (process.env.NODE_ENV === 'development') {
      const status = success ? '✅' : '❌';
      const durationMs = metric.duration.toFixed(2);
      console.log(`${status} Performance: ${metric.operation} completed in ${durationMs}ms`, {
        success,
        error,
        metadata: metric.metadata
      });

      // Warn about slow operations
      if (metric.duration > 2000) {
        console.warn(`⚠️ Performance: Slow operation detected - ${metric.operation} took ${durationMs}ms`);
      }
    }
  }

  getMetrics(operation?: string): PerformanceMetric[] {
    if (operation) {
      return this.metrics.filter(m => m.operation === operation);
    }
    return [...this.metrics];
  }

  getAverageTime(operation: string): number {
    const operationMetrics = this.getMetrics(operation);
    if (operationMetrics.length === 0) return 0;

    const totalTime = operationMetrics.reduce((sum, metric) => sum + (metric.duration || 0), 0);
    return totalTime / operationMetrics.length;
  }

  getSlowOperations(threshold: number = 2000): PerformanceMetric[] {
    return this.metrics.filter(m => (m.duration || 0) > threshold);
  }

  clearMetrics(): void {
    this.metrics = [];
  }

  generateReport(): string {
    const report = {
      totalOperations: this.metrics.length,
      successfulOperations: this.metrics.filter(m => m.success).length,
      failedOperations: this.metrics.filter(m => !m.success).length,
      averageTimes: {} as Record<string, number>,
      slowOperations: this.getSlowOperations()
    };

    // Calculate average times for each operation type
    const operationTypes = [...new Set(this.metrics.map(m => m.operation))];
    operationTypes.forEach(op => {
      report.averageTimes[op] = this.getAverageTime(op);
    });

    return JSON.stringify(report, null, 2);
  }
}

// Global instance
export const performanceMonitor = new PerformanceMonitor();

// Helper function for timing async operations
export async function timeOperation<T>(
  operation: string,
  fn: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> {
  const operationId = performanceMonitor.startOperation(operation, metadata);
  
  try {
    const result = await fn();
    performanceMonitor.endOperation(operationId, true);
    return result;
  } catch (error) {
    performanceMonitor.endOperation(operationId, false, error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}

// Helper function for timing sync operations
export function timeSync<T>(
  operation: string,
  fn: () => T,
  metadata?: Record<string, any>
): T {
  const operationId = performanceMonitor.startOperation(operation, metadata);
  
  try {
    const result = fn();
    performanceMonitor.endOperation(operationId, true);
    return result;
  } catch (error) {
    performanceMonitor.endOperation(operationId, false, error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}

// React hook for performance monitoring
export function usePerformanceMonitor() {
  return {
    startOperation: performanceMonitor.startOperation.bind(performanceMonitor),
    endOperation: performanceMonitor.endOperation.bind(performanceMonitor),
    getMetrics: performanceMonitor.getMetrics.bind(performanceMonitor),
    getAverageTime: performanceMonitor.getAverageTime.bind(performanceMonitor),
    getSlowOperations: performanceMonitor.getSlowOperations.bind(performanceMonitor),
    generateReport: performanceMonitor.generateReport.bind(performanceMonitor),
    timeOperation,
    timeSync
  };
}
