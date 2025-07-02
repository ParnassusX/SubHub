// Unused Subscriptions Hook for Phase 2.1: Intelligent Notification System
import { useState, useEffect, useCallback } from 'react';
import { useSubscriptions } from '../contexts/SubscriptionContext';
import { UnusedSubscriptionService } from '../services/unusedSubscriptionService';
import { UnusedSubscription, NotificationPreferences } from '../types/notifications';
import { db } from '../lib/supabase';

export const useUnusedSubscriptions = () => {
  const { subscriptions } = useSubscriptions();
  const [unusedSubscriptions, setUnusedSubscriptions] = useState<UnusedSubscription[]>([]);
  const [usageInsights, setUsageInsights] = useState<{
    totalSubscriptions: number;
    activeSubscriptions: number;
    potentiallyUnused: number;
    totalPotentialSavings: number;
    usageByCategory: Record<string, { active: number; unused: number }>;
  } | null>(null);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load notification preferences
  const loadPreferences = useCallback(async () => {
    try {
      const { data, error } = await db.notificationPreferences.get();
      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }
      setPreferences(data);
    } catch (err) {
      console.error('Error loading notification preferences:', err);
      setError(err instanceof Error ? err.message : 'Failed to load preferences');
    }
  }, []);

  // Calculate unused subscriptions
  const calculateUnusedSubscriptions = useCallback(async () => {
    if (subscriptions.length === 0 || !preferences) {
      setUnusedSubscriptions([]);
      setUsageInsights(null);
      return;
    }

    try {
      const unused = await UnusedSubscriptionService.getUnusedSubscriptions(subscriptions, preferences);
      const insights = UnusedSubscriptionService.getUsageInsights(subscriptions);
      
      setUnusedSubscriptions(unused);
      setUsageInsights(insights);
    } catch (err) {
      console.error('Error calculating unused subscriptions:', err);
      setError(err instanceof Error ? err.message : 'Failed to calculate unused subscriptions');
    }
  }, [subscriptions, preferences]);

  // Process unused subscription alerts (create notifications)
  const processAlerts = useCallback(async () => {
    if (!preferences || subscriptions.length === 0) {
      return 0;
    }

    try {
      const alertCount = await UnusedSubscriptionService.processUnusedSubscriptionDetection(
        subscriptions,
        preferences
      );
      return alertCount;
    } catch (err) {
      console.error('Error processing unused subscription alerts:', err);
      setError(err instanceof Error ? err.message : 'Failed to process alerts');
      return 0;
    }
  }, [subscriptions, preferences]);

  // Get unused subscriptions by severity
  const getUnusedBySeverity = useCallback(() => {
    const critical = unusedSubscriptions.filter(u => u.severity === 'critical');
    const warning = unusedSubscriptions.filter(u => u.severity === 'warning');

    return { critical, warning };
  }, [unusedSubscriptions]);

  // Get unused subscriptions by category
  const getUnusedByCategory = useCallback(() => {
    const byCategory: Record<string, UnusedSubscription[]> = {};
    
    unusedSubscriptions.forEach(unused => {
      // Find the subscription to get its category
      const subscription = subscriptions.find(s => s.id === unused.subscription_id);
      if (subscription) {
        const category = subscription.category;
        if (!byCategory[category]) {
          byCategory[category] = [];
        }
        byCategory[category].push(unused);
      }
    });

    return byCategory;
  }, [unusedSubscriptions, subscriptions]);

  // Get potential savings by time period
  const getPotentialSavings = useCallback((timeframe: 'monthly' | 'yearly' = 'monthly') => {
    return unusedSubscriptions.reduce((total, unused) => {
      const subscription = subscriptions.find(s => s.id === unused.subscription_id);
      if (!subscription) return total;

      if (timeframe === 'monthly') {
        return total + (subscription.frequency === 'Monthly' ? subscription.cost : subscription.cost / 12);
      } else {
        return total + (subscription.frequency === 'Yearly' ? subscription.cost : subscription.cost * 12);
      }
    }, 0);
  }, [unusedSubscriptions, subscriptions]);

  // Get top unused subscriptions by cost
  const getTopUnusedByCost = useCallback((limit: number = 5) => {
    return [...unusedSubscriptions]
      .sort((a, b) => b.subscription_cost - a.subscription_cost)
      .slice(0, limit);
  }, [unusedSubscriptions]);

  // Get usage efficiency score (percentage of active subscriptions)
  const getUsageEfficiency = useCallback(() => {
    if (!usageInsights || usageInsights.totalSubscriptions === 0) {
      return 100;
    }
    
    return (usageInsights.activeSubscriptions / usageInsights.totalSubscriptions) * 100;
  }, [usageInsights]);

  // Initialize and load data
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        await loadPreferences();
      } catch (err) {
        console.error('Error initializing unused subscriptions:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize');
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, [loadPreferences]);

  // Recalculate when subscriptions or preferences change
  useEffect(() => {
    if (!isLoading && preferences) {
      calculateUnusedSubscriptions();
    }
  }, [subscriptions, preferences, calculateUnusedSubscriptions, isLoading]);

  // Auto-process alerts (could be triggered by a timer or user action)
  const autoProcessAlerts = useCallback(async () => {
    if (preferences?.unused_subscription_enabled) {
      return await processAlerts();
    }
    return 0;
  }, [preferences, processAlerts]);

  return {
    // Data
    unusedSubscriptions,
    usageInsights,
    preferences,
    isLoading,
    error,

    // Actions
    processAlerts,
    loadPreferences,
    autoProcessAlerts,

    // Computed values
    getUnusedBySeverity,
    getUnusedByCategory,
    getPotentialSavings,
    getTopUnusedByCost,
    getUsageEfficiency,

    // Statistics
    totalUnused: unusedSubscriptions.length,
    criticalUnused: unusedSubscriptions.filter(u => u.severity === 'critical').length,
    warningUnused: unusedSubscriptions.filter(u => u.severity === 'warning').length,
    potentialMonthlySavings: getPotentialSavings('monthly'),
    potentialYearlySavings: getPotentialSavings('yearly'),
    usageEfficiencyScore: getUsageEfficiency(),
  };
};
