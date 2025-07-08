// Offline Detection Hook
import { useState, useEffect, useRef } from 'react';

export const useOffline = () => {
  const [isOffline, setIsOffline] = useState(false); // Start as online by default
  const [wasOffline, setWasOffline] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Enhanced network detection with timeout protection
    const checkNetworkStatus = async () => {
      try {
        // Primary check: navigator.onLine
        if (!navigator.onLine) {
          setIsOffline(true);
          return;
        }

        // Secondary check: Try to fetch a small resource with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        try {
          await fetch('/favicon.ico', {
            method: 'HEAD',
            cache: 'no-cache',
            signal: controller.signal
          });
          clearTimeout(timeoutId);
          setIsOffline(false);
        } catch (fetchError) {
          clearTimeout(timeoutId);
          // Only set offline if navigator.onLine also says we're offline
          // This prevents false positives from network timeouts
          setIsOffline(!navigator.onLine);
        }
      } catch (error) {
        // Fallback to navigator.onLine if other checks fail
        setIsOffline(!navigator.onLine);
      } finally {
        setIsInitialized(true);
      }
    };

    const handleOnline = () => {
      setWasOffline(isOffline);
      setIsOffline(false);
      // Clear any pending timeout checks
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    // Initial check with delay to prevent false positives during page load
    timeoutRef.current = setTimeout(checkNetworkStatus, 1000);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isOffline]);

  return {
    isOffline: isInitialized ? isOffline : false, // Don't show offline until initialized
    isOnline: !isOffline,
    wasOffline,
    connectionStatus: isOffline ? 'offline' : 'online'
  };
};
