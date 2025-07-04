// Advanced Analytics Service for SubHub
// Provides real-time data aggregation, caching, and advanced analytics processing

import { Subscription } from '../contexts/SubscriptionContext';
import { generateAnalytics, AnalyticsData } from '../utils/analyticsEngine';

export interface AnalyticsFilters {
  dateRange?: {
    start: Date;
    end: Date;
  };
  categories?: string[];
  minAmount?: number;
  maxAmount?: number;
  frequency?: ('Monthly' | 'Yearly')[];
}

export interface AnalyticsCache {
  data: AnalyticsData;
  timestamp: number;
  filters: AnalyticsFilters;
  ttl: number; // Time to live in milliseconds
}

export interface AnalyticsExportData {
  summary: {
    totalMonthlySpending: number;
    totalYearlySpending: number;
    subscriptionCount: number;
    generatedAt: string;
  };
  trends: Array<{
    month: string;
    amount: number;
    subscriptionCount: number;
  }>;
  categories: Array<{
    category: string;
    amount: number;
    percentage: number;
    subscriptionCount: number;
  }>;
  predictions: {
    nextMonth: number;
    nextQuarter: number;
    nextYear: number;
    confidence: string;
  };
}

export class AdvancedAnalyticsService {
  private static cache = new Map<string, AnalyticsCache>();
  private static readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  private static readonly MAX_CACHE_SIZE = 50;

  /**
   * Generate cache key from filters
   */
  private static generateCacheKey(filters: AnalyticsFilters): string {
    return JSON.stringify({
      dateRange: filters.dateRange ? {
        start: filters.dateRange.start.toISOString(),
        end: filters.dateRange.end.toISOString()
      } : null,
      categories: filters.categories?.sort(),
      minAmount: filters.minAmount,
      maxAmount: filters.maxAmount,
      frequency: filters.frequency?.sort()
    });
  }

  /**
   * Check if cached data is still valid
   */
  private static isCacheValid(cacheEntry: AnalyticsCache): boolean {
    return Date.now() - cacheEntry.timestamp < cacheEntry.ttl;
  }

  /**
   * Clean expired cache entries
   */
  private static cleanExpiredCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp >= entry.ttl) {
        this.cache.delete(key);
      }
    }

    // Limit cache size
    if (this.cache.size > this.MAX_CACHE_SIZE) {
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      // Remove oldest entries
      const toRemove = entries.slice(0, this.cache.size - this.MAX_CACHE_SIZE);
      toRemove.forEach(([key]) => this.cache.delete(key));
    }
  }

  /**
   * Filter subscriptions based on criteria
   */
  private static filterSubscriptions(
    subscriptions: Subscription[], 
    filters: AnalyticsFilters
  ): Subscription[] {
    let filtered = [...subscriptions];

    // Date range filter
    if (filters.dateRange) {
      filtered = filtered.filter(sub => {
        const startDate = new Date(sub.startDate);
        return startDate >= filters.dateRange!.start && startDate <= filters.dateRange!.end;
      });
    }

    // Category filter
    if (filters.categories && filters.categories.length > 0) {
      filtered = filtered.filter(sub => filters.categories!.includes(sub.category));
    }

    // Amount range filter
    if (filters.minAmount !== undefined) {
      filtered = filtered.filter(sub => sub.cost >= filters.minAmount!);
    }

    if (filters.maxAmount !== undefined) {
      filtered = filtered.filter(sub => sub.cost <= filters.maxAmount!);
    }

    // Frequency filter
    if (filters.frequency && filters.frequency.length > 0) {
      filtered = filtered.filter(sub => filters.frequency!.includes(sub.frequency));
    }

    return filtered;
  }

  /**
   * Get analytics data with caching and filtering
   */
  static getAnalytics(
    subscriptions: Subscription[], 
    filters: AnalyticsFilters = {},
    useCache: boolean = true
  ): AnalyticsData {
    const cacheKey = this.generateCacheKey(filters);

    // Check cache first
    if (useCache && this.cache.has(cacheKey)) {
      const cacheEntry = this.cache.get(cacheKey)!;
      if (this.isCacheValid(cacheEntry)) {
        return cacheEntry.data;
      } else {
        this.cache.delete(cacheKey);
      }
    }

    // Filter subscriptions
    const filteredSubscriptions = this.filterSubscriptions(subscriptions, filters);

    // Generate analytics
    const analyticsData = generateAnalytics(filteredSubscriptions);

    // Cache the result
    if (useCache) {
      this.cleanExpiredCache();
      this.cache.set(cacheKey, {
        data: analyticsData,
        timestamp: Date.now(),
        filters,
        ttl: this.DEFAULT_TTL
      });
    }

    return analyticsData;
  }

  /**
   * Get real-time analytics updates
   */
  static getRealtimeAnalytics(
    subscriptions: Subscription[],
    filters: AnalyticsFilters = {}
  ): AnalyticsData {
    // Always bypass cache for real-time data
    return this.getAnalytics(subscriptions, filters, false);
  }

  /**
   * Compare analytics between two time periods
   */
  static compareAnalytics(
    subscriptions: Subscription[],
    currentFilters: AnalyticsFilters,
    previousFilters: AnalyticsFilters
  ): {
    current: AnalyticsData;
    previous: AnalyticsData;
    comparison: {
      spendingChange: number;
      spendingChangePercentage: number;
      subscriptionCountChange: number;
      categoryChanges: Array<{
        category: string;
        change: number;
        changePercentage: number;
      }>;
    };
  } {
    const currentAnalytics = this.getAnalytics(subscriptions, currentFilters);
    const previousAnalytics = this.getAnalytics(subscriptions, previousFilters);

    const spendingChange = currentAnalytics.totalMonthlySpending - previousAnalytics.totalMonthlySpending;
    const spendingChangePercentage = previousAnalytics.totalMonthlySpending > 0 
      ? (spendingChange / previousAnalytics.totalMonthlySpending) * 100 
      : 0;

    const subscriptionCountChange = currentAnalytics.subscriptionCount - previousAnalytics.subscriptionCount;

    // Calculate category changes
    const categoryChanges = currentAnalytics.categoryBreakdown.map(currentCat => {
      const previousCat = previousAnalytics.categoryBreakdown.find(cat => cat.category === currentCat.category);
      const previousAmount = previousCat?.amount || 0;
      const change = currentCat.amount - previousAmount;
      const changePercentage = previousAmount > 0 ? (change / previousAmount) * 100 : 0;

      return {
        category: currentCat.category,
        change,
        changePercentage
      };
    });

    return {
      current: currentAnalytics,
      previous: previousAnalytics,
      comparison: {
        spendingChange,
        spendingChangePercentage,
        subscriptionCountChange,
        categoryChanges
      }
    };
  }

  /**
   * Export analytics data for external use
   */
  static exportAnalytics(
    subscriptions: Subscription[],
    filters: AnalyticsFilters = {},
    format: 'json' | 'csv' = 'json'
  ): AnalyticsExportData | string {
    const analytics = this.getAnalytics(subscriptions, filters);

    const exportData: AnalyticsExportData = {
      summary: {
        totalMonthlySpending: analytics.totalMonthlySpending,
        totalYearlySpending: analytics.totalYearlySpending,
        subscriptionCount: analytics.subscriptionCount,
        generatedAt: new Date().toISOString()
      },
      trends: analytics.spendingTrends,
      categories: analytics.categoryBreakdown,
      predictions: {
        nextMonth: analytics.spendingPrediction.nextMonth,
        nextQuarter: analytics.spendingPrediction.nextQuarter,
        nextYear: analytics.spendingPrediction.nextYear,
        confidence: analytics.spendingPrediction.confidence
      }
    };

    if (format === 'csv') {
      return this.convertToCSV(exportData);
    }

    return exportData;
  }

  /**
   * Convert analytics data to CSV format
   */
  private static convertToCSV(data: AnalyticsExportData): string {
    const lines: string[] = [];
    
    // Summary section
    lines.push('Summary');
    lines.push('Total Monthly Spending,Total Yearly Spending,Subscription Count,Generated At');
    lines.push(`${data.summary.totalMonthlySpending},${data.summary.totalYearlySpending},${data.summary.subscriptionCount},${data.summary.generatedAt}`);
    lines.push('');

    // Trends section
    lines.push('Monthly Trends');
    lines.push('Month,Amount,Subscription Count');
    data.trends.forEach(trend => {
      lines.push(`${trend.month},${trend.amount},${trend.subscriptionCount}`);
    });
    lines.push('');

    // Categories section
    lines.push('Category Breakdown');
    lines.push('Category,Amount,Percentage,Subscription Count');
    data.categories.forEach(category => {
      lines.push(`${category.category},${category.amount},${category.percentage},${category.subscriptionCount}`);
    });

    return lines.join('\n');
  }

  /**
   * Clear analytics cache
   */
  static clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
  } {
    return {
      size: this.cache.size,
      maxSize: this.MAX_CACHE_SIZE,
      hitRate: 0 // Would need to track hits/misses for accurate calculation
    };
  }
}
