import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

// Performance optimization hook for session persistence and caching
export const usePerformanceOptimization = () => {
  const sessionCheckRef = useRef<NodeJS.Timeout | null>(null);
  const cacheRef = useRef<Map<string, { data: any; timestamp: number }>>(new Map());

  // Session persistence optimization
  const optimizeSessionPersistence = useCallback(async () => {
    try {
      // Check if session exists in localStorage
      const localSession = localStorage.getItem('supabase.auth.token');
      
      if (localSession) {
        // Validate session with Supabase
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !session) {
          // Clear invalid session
          localStorage.removeItem('supabase.auth.token');
          await supabase.auth.signOut();
        } else {
          // Refresh session if it's close to expiring (within 5 minutes)
          const expiresAt = session.expires_at;
          if (expiresAt) {
            const now = Math.floor(Date.now() / 1000);
            const timeUntilExpiry = expiresAt - now;

            if (timeUntilExpiry < 300) { // 5 minutes
              await supabase.auth.refreshSession();
            }
          }
        }
      }
    } catch (error) {
      console.error('Session optimization error:', error);
    }
  }, []);

  // Data caching with TTL (Time To Live)
  const cacheData = useCallback((key: string, data: any, ttlMinutes: number = 5) => {
    const timestamp = Date.now();
    cacheRef.current.set(key, { data, timestamp });
    
    // Clean up expired cache entries
    setTimeout(() => {
      const cached = cacheRef.current.get(key);
      if (cached && Date.now() - cached.timestamp > ttlMinutes * 60 * 1000) {
        cacheRef.current.delete(key);
      }
    }, ttlMinutes * 60 * 1000);
  }, []);

  // Get cached data if still valid
  const getCachedData = useCallback((key: string, ttlMinutes: number = 5) => {
    const cached = cacheRef.current.get(key);
    if (!cached) return null;
    
    const isExpired = Date.now() - cached.timestamp > ttlMinutes * 60 * 1000;
    if (isExpired) {
      cacheRef.current.delete(key);
      return null;
    }
    
    return cached.data;
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
    // Run session optimization immediately
    optimizeSessionPersistence();
    
    // Set up periodic session checks (every 5 minutes)
    sessionCheckRef.current = setInterval(optimizeSessionPersistence, 5 * 60 * 1000);
    
    // Preload critical resources
    preloadCriticalResources();
    
    // Optimize bundle size
    optimizeBundleSize();
    
    // Cleanup on unmount
    return () => {
      if (sessionCheckRef.current) {
        clearInterval(sessionCheckRef.current);
      }
    };
  }, [optimizeSessionPersistence, preloadCriticalResources, optimizeBundleSize]);

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
    cacheData,
    getCachedData,
    measurePerformance,
    optimizeSessionPersistence,
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
  const { cacheData, getCachedData, measurePerformance } = usePerformanceOptimization();
  
  const fetchWithCache = useCallback(async (
    key: string,
    fetchFn: () => Promise<any>,
    ttlMinutes: number = 5
  ) => {
    // Check cache first
    const cached = getCachedData(key, ttlMinutes);
    if (cached) {
      return cached;
    }
    
    // Fetch and cache data
    const measuredFetch = measurePerformance(`fetch-${key}`, fetchFn);
    const data = await measuredFetch();
    cacheData(key, data, ttlMinutes);
    
    return data;
  }, [cacheData, getCachedData, measurePerformance]);
  
  return { fetchWithCache };
};
