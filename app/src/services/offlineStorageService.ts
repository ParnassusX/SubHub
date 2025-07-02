// Offline Storage Service - Handles caching of subscription data for offline access
import { Subscription } from '../contexts/SubscriptionContext';

export interface CachedData {
  subscriptions: Subscription[];
  lastUpdated: string;
  userProfile?: any;
}

export class OfflineStorageService {
  private static readonly CACHE_KEY = 'subhub_offline_data';
  private static readonly CACHE_EXPIRY_HOURS = 24;

  /**
   * Cache subscription data for offline access
   */
  static cacheSubscriptionData(subscriptions: Subscription[], userProfile?: any): void {
    try {
      const cacheData: CachedData = {
        subscriptions,
        userProfile,
        lastUpdated: new Date().toISOString()
      };

      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheData));
      console.log('Subscription data cached for offline access');
    } catch (error) {
      console.error('Failed to cache subscription data:', error);
    }
  }

  /**
   * Get cached subscription data
   */
  static getCachedData(): CachedData | null {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (!cached) return null;

      const data: CachedData = JSON.parse(cached);
      
      // Check if cache is expired
      if (this.isCacheExpired(data.lastUpdated)) {
        this.clearCache();
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to retrieve cached data:', error);
      return null;
    }
  }

  /**
   * Get cached subscriptions only
   */
  static getCachedSubscriptions(): Subscription[] {
    const cachedData = this.getCachedData();
    return cachedData?.subscriptions || [];
  }

  /**
   * Check if cached data exists and is valid
   */
  static hasCachedData(): boolean {
    const cachedData = this.getCachedData();
    return cachedData !== null && cachedData.subscriptions.length > 0;
  }

  /**
   * Clear cached data
   */
  static clearCache(): void {
    try {
      localStorage.removeItem(this.CACHE_KEY);
      console.log('Offline cache cleared');
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }

  /**
   * Check if cache is expired
   */
  private static isCacheExpired(lastUpdated: string): boolean {
    const cacheTime = new Date(lastUpdated);
    const now = new Date();
    const diffHours = (now.getTime() - cacheTime.getTime()) / (1000 * 60 * 60);
    
    return diffHours > this.CACHE_EXPIRY_HOURS;
  }

  /**
   * Get cache age in human readable format
   */
  static getCacheAge(): string | null {
    const cachedData = this.getCachedData();
    if (!cachedData) return null;

    const cacheTime = new Date(cachedData.lastUpdated);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - cacheTime.getTime()) / (1000 * 60));

    if (diffMinutes < 60) {
      return `${diffMinutes} minutes ago`;
    } else if (diffMinutes < 1440) {
      const hours = Math.floor(diffMinutes / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffMinutes / 1440);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): {
    hasCache: boolean;
    subscriptionCount: number;
    lastUpdated: string | null;
    cacheAge: string | null;
    isExpired: boolean;
  } {
    const cachedData = this.getCachedData();
    
    return {
      hasCache: cachedData !== null,
      subscriptionCount: cachedData?.subscriptions.length || 0,
      lastUpdated: cachedData?.lastUpdated || null,
      cacheAge: this.getCacheAge(),
      isExpired: cachedData ? this.isCacheExpired(cachedData.lastUpdated) : false
    };
  }

  /**
   * Update cache with new data if online
   */
  static updateCacheIfOnline(subscriptions: Subscription[], userProfile?: any): void {
    if (navigator.onLine) {
      this.cacheSubscriptionData(subscriptions, userProfile);
    }
  }
}
