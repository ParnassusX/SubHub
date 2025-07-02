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
      setPreferences(data);
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
    if (preferences?.smart_scheduling_enabled) {
      return await processSmartScheduling();
    }
    return null;
  }, [preferences, processSmartScheduling]);

  // Check if scheduling should run automatically
  const shouldAutoProcess = useCallback(() => {
    if (!preferences?.smart_scheduling_enabled || !lastProcessed) {
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

    if (!preferences.smart_scheduling_enabled) {
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
    if (!isLoading && preferences?.smart_scheduling_enabled && shouldAutoProcess()) {
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
    isEnabled: preferences?.smart_scheduling_enabled || false,
    quietHoursActive: schedulingInsights?.quietHoursActive || false,
    nextOptimalTime: schedulingInsights?.nextOptimalTime,
    dailyQuotaUsed: schedulingInsights?.dailyQuotaUsed || 0,
    totalScheduled: processingResults?.scheduled || 0,
    totalBatched: processingResults?.batched || 0,
    totalDeferred: processingResults?.deferred || 0,
    efficiencyScore: getEfficiencyMetrics()?.efficiencyScore || 0,
  };
};
