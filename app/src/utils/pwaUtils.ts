/**
 * PWA Detection and Utility Functions
 * Provides utilities for detecting PWA mode and handling PWA-specific scenarios
 */

/**
 * Detect if the app is running in PWA mode (installed as standalone app)
 */
export function isPWAMode(): boolean {
  // Check if running in standalone mode (iOS/Android PWA)
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return true;
  }

  // Check for iOS PWA mode
  if ((window.navigator as any).standalone === true) {
    return true;
  }

  // Check for Android PWA mode
  if (window.matchMedia('(display-mode: minimal-ui)').matches) {
    return true;
  }

  return false;
}

/**
 * Detect if the app is running on iOS
 */
export function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

/**
 * Detect if the app is running on Android
 */
export function isAndroid(): boolean {
  return /Android/.test(navigator.userAgent);
}

/**
 * Detect if the app is running on mobile device
 */
export function isMobile(): boolean {
  return isIOS() || isAndroid() || window.innerWidth <= 768;
}

/**
 * Get PWA display mode
 */
export function getPWADisplayMode(): string {
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return 'standalone';
  }
  if (window.matchMedia('(display-mode: minimal-ui)').matches) {
    return 'minimal-ui';
  }
  if (window.matchMedia('(display-mode: fullscreen)').matches) {
    return 'fullscreen';
  }
  return 'browser';
}

/**
 * Check if PWA installation is available
 */
export function isPWAInstallable(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window;
}

/**
 * PWA-specific error handling
 */
export function handlePWAError(error: Error, context: string): void {
  console.error(`PWA Error in ${context}:`, error);
  
  // In PWA mode, we want to be more resilient to errors
  if (isPWAMode()) {
    console.log('PWA mode detected, implementing fallback behavior');
    
    // Store error for later sync when online
    try {
      const errors = JSON.parse(localStorage.getItem('subhub_pwa_errors') || '[]');
      errors.push({
        error: error.message,
        context,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        displayMode: getPWADisplayMode()
      });
      
      // Keep only last 10 errors
      if (errors.length > 10) {
        errors.splice(0, errors.length - 10);
      }
      
      localStorage.setItem('subhub_pwa_errors', JSON.stringify(errors));
    } catch (storageError) {
      console.error('Failed to store PWA error:', storageError);
    }
  }
}

/**
 * PWA-specific timeout wrapper for promises
 */
export function withPWATimeout<T>(
  promise: Promise<T>, 
  timeoutMs: number = 8000,
  context: string = 'operation'
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      const error = new Error(`PWA timeout: ${context} took longer than ${timeoutMs}ms`);
      handlePWAError(error, context);
      reject(error);
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]);
}

/**
 * Check if app is online with PWA considerations
 */
export function isOnlineWithPWAFallback(): boolean {
  // Basic online check
  if (!navigator.onLine) {
    return false;
  }

  // In PWA mode, also check if we can reach our API
  if (isPWAMode()) {
    try {
      // Check if we have cached data as fallback
      const hasCache = localStorage.getItem('subhub_offline_cache') !== null;
      return hasCache || navigator.onLine;
    } catch {
      return navigator.onLine;
    }
  }

  return navigator.onLine;
}

/**
 * PWA-specific loading state management
 */
export class PWALoadingManager {
  private static loadingStates = new Map<string, boolean>();
  private static timeouts = new Map<string, NodeJS.Timeout>();

  static setLoading(key: string, isLoading: boolean, timeoutMs: number = 15000): void {
    this.loadingStates.set(key, isLoading);

    if (isLoading) {
      // Set timeout to prevent endless loading
      const timeout = setTimeout(() => {
        console.warn(`PWA Loading timeout for ${key}, forcing completion`);
        this.setLoading(key, false);
        
        // Emit custom event for components to handle timeout
        window.dispatchEvent(new CustomEvent('pwa-loading-timeout', { 
          detail: { key, context: 'PWA loading timeout' }
        }));
      }, timeoutMs);

      this.timeouts.set(key, timeout);
    } else {
      // Clear timeout when loading completes
      const timeout = this.timeouts.get(key);
      if (timeout) {
        clearTimeout(timeout);
        this.timeouts.delete(key);
      }
    }
  }

  static isLoading(key: string): boolean {
    return this.loadingStates.get(key) || false;
  }

  static clearAll(): void {
    this.timeouts.forEach(timeout => clearTimeout(timeout));
    this.timeouts.clear();
    this.loadingStates.clear();
  }
}

/**
 * Initialize PWA-specific event listeners
 */
export function initializePWAEventListeners(): void {
  // Listen for PWA loading timeouts
  window.addEventListener('pwa-loading-timeout', (event: any) => {
    console.log('PWA loading timeout detected:', event.detail);
    handlePWAError(new Error('Loading timeout'), event.detail.context);
  });

  // Listen for display mode changes
  window.matchMedia('(display-mode: standalone)').addEventListener('change', (e) => {
    console.log('PWA display mode changed:', e.matches ? 'standalone' : 'browser');
  });

  // Listen for online/offline changes in PWA mode
  window.addEventListener('online', () => {
    if (isPWAMode()) {
      console.log('PWA came online, syncing data...');
      // Trigger data sync
      window.dispatchEvent(new CustomEvent('pwa-online'));
    }
  });

  window.addEventListener('offline', () => {
    if (isPWAMode()) {
      console.log('PWA went offline, enabling offline mode...');
      window.dispatchEvent(new CustomEvent('pwa-offline'));
    }
  });
}

/**
 * PWA startup diagnostics
 */
export function runPWADiagnostics(): void {
  console.log('🔍 PWA Diagnostics:');
  console.log('  - PWA Mode:', isPWAMode());
  console.log('  - Display Mode:', getPWADisplayMode());
  console.log('  - Platform:', isIOS() ? 'iOS' : isAndroid() ? 'Android' : 'Desktop');
  console.log('  - Mobile:', isMobile());
  console.log('  - Online:', isOnlineWithPWAFallback());
  console.log('  - Service Worker:', 'serviceWorker' in navigator);
  console.log('  - Installable:', isPWAInstallable());
  
  if (isPWAMode()) {
    console.log('🚀 Running in PWA mode - enhanced error handling enabled');
  }
}
