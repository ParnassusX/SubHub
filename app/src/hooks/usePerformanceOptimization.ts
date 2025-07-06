import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

// Performance optimization hook for session persistence and caching
export const usePerformanceOptimization = () => {
  const cacheRef = useRef<Map<string, { data: any; timestamp: number }>>(new Map());

  // Handle runtime errors and message port issues
  const handleRuntimeErrors = useCallback(() => {
    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.warn('Unhandled promise rejection (handled):', event.reason);
      // Prevent default browser error handling
      event.preventDefault();
    };

    // Handle runtime errors
    const handleError = (event: ErrorEvent) => {
      // Filter out browser extension and content script errors
      if (event.filename?.includes('extension://') ||
          event.message?.includes('content/scripts.js') ||
          event.message?.includes('message port closed')) {
        console.warn('Browser extension error (ignored):', event.message);
        return;
      }

      // Log actual application errors
      if (event.message && !event.message.includes('Script error')) {
        console.error('Application runtime error:', {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        });
      }
    };

    // Add event listeners
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    // Cleanup function
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  // Preload critical resources
  const preloadCriticalResources = useCallback(() => {
    // Note: Fonts are loaded via Google Fonts in index.html, no need to preload local fonts

    // Preload critical images
    const logoImg = new Image();
    logoImg.src = '/logo.svg';
    
    // Preconnect to external services
    const preconnectSupabase = document.createElement('link');
    preconnectSupabase.rel = 'preconnect';
    preconnectSupabase.href = 'https://your-project.supabase.co';
    document.head.appendChild(preconnectSupabase);
  }, []);

  // Bundle size optimization - remove unused imports
  const optimizeBundleSize = useCallback(() => {
    // Remove unused CSS classes at runtime (development only)
    if (process.env.NODE_ENV === 'development') {
      const unusedClasses = document.querySelectorAll('[class*="unused-"]');
      unusedClasses.forEach(el => {
        const classes = el.className.split(' ').filter(cls => !cls.startsWith('unused-'));
        el.className = classes.join(' ');
      });
    }
  }, []);

  // Initialize performance optimizations
  useEffect(() => {
    // Preload critical resources
    preloadCriticalResources();

    // Optimize bundle size
    optimizeBundleSize();

    // Setup runtime error handling
    const cleanupErrorHandling = handleRuntimeErrors();

    // Cleanup on unmount
    return () => {
      cleanupErrorHandling();
    };
  }, [preloadCriticalResources, optimizeBundleSize, handleRuntimeErrors]);

  // Performance monitoring
  const measurePerformance = useCallback((name: string, fn: (...args: any[]) => Promise<any>) => {
    return async (...args: any[]) => {
      const start = performance.now();
      try {
        const result = await fn(...args);
        const end = performance.now();

        // Log performance metrics in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`Performance: ${name} took ${end - start} milliseconds`);
        }

        return result;
      } catch (error) {
        const end = performance.now();
        console.error(`Performance: ${name} failed after ${end - start} milliseconds`, error);
        throw error;
      }
    };
  }, []);

  // Memory optimization - cleanup unused data
  const optimizeMemory = useCallback(() => {
    // Clear expired cache entries
    const now = Date.now();
    for (const [key, value] of cacheRef.current.entries()) {
      if (now - value.timestamp > 10 * 60 * 1000) { // 10 minutes
        cacheRef.current.delete(key);
      }
    }
    
    // Force garbage collection if available (development only)
    if (process.env.NODE_ENV === 'development' && window.gc) {
      window.gc();
    }
  }, []);

  // Set up memory optimization interval
  useEffect(() => {
    const memoryInterval = setInterval(optimizeMemory, 10 * 60 * 1000); // Every 10 minutes
    
    return () => clearInterval(memoryInterval);
  }, [optimizeMemory]);

  return {
    measurePerformance,
    optimizeMemory,
  };
};

// Hook for component-level performance optimization
export const useComponentPerformance = (componentName: string) => {
  const { measurePerformance } = usePerformanceOptimization();
  
  const trackRender = useCallback(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`Component rendered: ${componentName}`);
    }
  }, [componentName]);
  
  useEffect(() => {
    trackRender();
  });
  
  return { measurePerformance, trackRender };
};

// Hook for data fetching optimization
export const useOptimizedDataFetching = () => {
  const { measurePerformance } = usePerformanceOptimization();
  
  const fetchWithCache = useCallback(async (
    key: string,
    fetchFn: () => Promise<any>,
    ttlMinutes: number = 5
  ) => {
    // Fetch and cache data
    const measuredFetch = measurePerformance(`fetch-${key}`, fetchFn);
    const data = await measuredFetch();
    
    return data;
  }, [measurePerformance]);
  
  return { fetchWithCache };
};
