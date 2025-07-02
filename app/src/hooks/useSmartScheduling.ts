// Smart Scheduling Hook for Phase 2.1: Intelligent Notification System
import { useState, useEffect, useCallback } from 'react';
import { useSubscriptions } from '../contexts/SubscriptionContext';
import { SmartNotificationScheduler } from '../services/smartNotificationScheduler';
import { NotificationPreferences } from '../types/notifications';
import { db } from '../lib/supabase';

export const useSmartScheduling = () => {
  const { subscriptions } = useSubscriptions();
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [schedulingInsights, setSchedulingInsights] = useState<{
    nextOptimalTime: Date;
    quietHoursActive: boolean;
    dailyQuotaUsed: number;
    batchingEnabled: boolean;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastProcessed, setLastProcessed] = useState<Date | null>(null);
  const [processingResults, setProcessingResults] = useState<{
    scheduled: number;
    batched: number;
    deferred: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load notification preferences
  const loadPreferences = useCallback(async () => {
    try {
      const { data, error } = await db.notificationPreferences.get();
      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }
      // Normalize the data to handle null values
      const normalizedData = data ? {
        ...data,
        renewal_reminder_enabled: data.renewal_reminder_enabled ?? true,
        renewal_reminder_days: data.renewal_reminder_days ?? [1, 3, 7],
        spending_threshold_enabled: data.spending_threshold_enabled ?? true,
        spending_threshold_amount: data.spending_threshold_amount ?? undefined,
        spending_threshold_percentage: data.spending_threshold_percentage ?? 80,
        unused_subscription_enabled: data.unused_subscription_enabled ?? true,
        unused_subscription_days: data.unused_subscription_days ?? 30,
        price_change_enabled: data.price_change_enabled ?? true,
        email_notifications_enabled: data.email_notifications_enabled ?? true,
        push_notifications_enabled: data.push_notifications_enabled ?? true,
        in_app_notifications_enabled: data.in_app_notifications_enabled ?? true,
        quiet_hours_enabled: data.quiet_hours_enabled ?? false,
        quiet_hours_start: data.quiet_hours_start ?? undefined,
        quiet_hours_end: data.quiet_hours_end ?? undefined,
        max_daily_notifications: data.max_daily_notifications ?? 5,
        created_at: data.created_at ?? undefined,
        updated_at: data.updated_at ?? undefined
      } : null;
      setPreferences(normalizedData);
    } catch (err) {
      console.error('Error loading notification preferences:', err);
      setError(err instanceof Error ? err.message : 'Failed to load preferences');
    }
  }, []);

  // Calculate scheduling insights
  const calculateInsights = useCallback(() => {
    if (!preferences) {
      setSchedulingInsights(null);
      return;
    }

    try {
      const insights = SmartNotificationScheduler.getSchedulingInsights(preferences);
      setSchedulingInsights(insights);
    } catch (err) {
      console.error('Error calculating scheduling insights:', err);
      setError(err instanceof Error ? err.message : 'Failed to calculate insights');
    }
  }, [preferences]);

  // Process smart scheduling
  const processSmartScheduling = useCallback(async () => {
    if (!preferences || subscriptions.length === 0 || isProcessing) {
      return null;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const results = await SmartNotificationScheduler.scheduleIntelligentNotifications(
        subscriptions,
        preferences
      );
      
      setProcessingResults(results);
      setLastProcessed(new Date());
      
      return results;
    } catch (err) {
      console.error('Error processing smart scheduling:', err);
      setError(err instanceof Error ? err.message : 'Failed to process scheduling');
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [subscriptions, preferences, isProcessing]);

  // Auto-process scheduling (can be triggered by timer or user action)
  const autoProcessScheduling = useCallback(async () => {
    if (preferences?.quiet_hours_enabled) { // Using quiet_hours_enabled as proxy for smart scheduling
      return await processSmartScheduling();
    }
    return null;
  }, [preferences, processSmartScheduling]);

  // Check if scheduling should run automatically
  const shouldAutoProcess = useCallback(() => {
    if (!preferences?.quiet_hours_enabled || !lastProcessed) { // Using quiet_hours_enabled as proxy
      return true;
    }

    // Auto-process every 4 hours
    const fourHoursAgo = new Date(Date.now() - (4 * 60 * 60 * 1000));
    return lastProcessed < fourHoursAgo;
  }, [preferences, lastProcessed]);

  // Get next scheduled processing time
  const getNextProcessingTime = useCallback(() => {
    if (!lastProcessed) {
      return new Date(); // Process immediately if never processed
    }

    // Next processing in 4 hours
    const nextTime = new Date(lastProcessed.getTime() + (4 * 60 * 60 * 1000));
    return nextTime;
  }, [lastProcessed]);

  // Get scheduling status summary
  const getSchedulingStatus = useCallback(() => {
    if (!preferences) {
      return {
        enabled: false,
        status: 'disabled',
        message: 'Smart scheduling is disabled'
      };
    }

    if (!preferences.quiet_hours_enabled) { // Using quiet_hours_enabled as proxy
      return {
        enabled: false,
        status: 'disabled',
        message: 'Smart scheduling is disabled in preferences'
      };
    }

    if (isProcessing) {
      return {
        enabled: true,
        status: 'processing',
        message: 'Processing smart scheduling...'
      };
    }

    if (schedulingInsights?.quietHoursActive) {
      return {
        enabled: true,
        status: 'quiet_hours',
        message: 'Quiet hours active - notifications paused'
      };
    }

    if (lastProcessed) {
      const timeSinceLastProcess = Date.now() - lastProcessed.getTime();
      const hoursAgo = Math.floor(timeSinceLastProcess / (60 * 60 * 1000));
      
      return {
        enabled: true,
        status: 'active',
        message: `Last processed ${hoursAgo} hour${hoursAgo !== 1 ? 's' : ''} ago`
      };
    }

    return {
      enabled: true,
      status: 'ready',
      message: 'Ready to process notifications'
    };
  }, [preferences, isProcessing, schedulingInsights, lastProcessed]);

  // Get processing efficiency metrics
  const getEfficiencyMetrics = useCallback(() => {
    if (!processingResults) {
      return null;
    }

    const total = processingResults.scheduled + processingResults.batched + processingResults.deferred;
    
    if (total === 0) {
      return {
        totalProcessed: 0,
        immediateDelivery: 0,
        batchedDelivery: 0,
        deferredDelivery: 0,
        efficiencyScore: 100
      };
    }

    const immediatePercentage = (processingResults.scheduled / total) * 100;
    const batchedPercentage = (processingResults.batched / total) * 100;
    const deferredPercentage = (processingResults.deferred / total) * 100;
    
    // Efficiency score: batched delivery is most efficient, immediate is less efficient, deferred is least efficient
    const efficiencyScore = (batchedPercentage * 1.0) + (immediatePercentage * 0.7) + (deferredPercentage * 0.3);

    return {
      totalProcessed: total,
      immediateDelivery: immediatePercentage,
      batchedDelivery: batchedPercentage,
      deferredDelivery: deferredPercentage,
      efficiencyScore: Math.round(efficiencyScore)
    };
  }, [processingResults]);

  // Initialize and load data
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        await loadPreferences();
      } catch (err) {
        console.error('Error initializing smart scheduling:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize');
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, [loadPreferences]);

  // Calculate insights when preferences change
  useEffect(() => {
    if (!isLoading && preferences) {
      calculateInsights();
    }
  }, [preferences, calculateInsights, isLoading]);

  // Auto-process scheduling when conditions are met
  useEffect(() => {
    if (!isLoading && preferences?.quiet_hours_enabled && shouldAutoProcess()) { // Using quiet_hours_enabled as proxy
      // Delay auto-processing to avoid immediate execution on load
      const timer = setTimeout(() => {
        autoProcessScheduling();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isLoading, preferences, shouldAutoProcess, autoProcessScheduling]);

  return {
    // Data
    preferences,
    schedulingInsights,
    processingResults,
    lastProcessed,
    isLoading,
    isProcessing,
    error,

    // Actions
    processSmartScheduling,
    autoProcessScheduling,
    loadPreferences,

    // Computed values
    getSchedulingStatus,
    getEfficiencyMetrics,
    getNextProcessingTime,
    shouldAutoProcess,

    // Statistics
    isEnabled: preferences?.quiet_hours_enabled || false, // Using quiet_hours_enabled as proxy
    quietHoursActive: schedulingInsights?.quietHoursActive || false,
    nextOptimalTime: schedulingInsights?.nextOptimalTime,
    dailyQuotaUsed: schedulingInsights?.dailyQuotaUsed || 0,
    totalScheduled: processingResults?.scheduled || 0,
    totalBatched: processingResults?.batched || 0,
    totalDeferred: processingResults?.deferred || 0,
    efficiencyScore: getEfficiencyMetrics()?.efficiencyScore || 0,
  };
};
