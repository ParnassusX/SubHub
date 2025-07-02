// Spending Alerts Hook for Phase 2.1: Intelligent Notification System
import { useState, useEffect, useCallback } from 'react';
import { useSubscriptions } from '../contexts/SubscriptionContext';
import { useBudget } from '../hooks/useBudget';
import { SpendingAlertService } from '../services/spendingAlertService';
import { SpendingAlert, NotificationPreferences } from '../types/notifications';
import { db } from '../lib/supabase';

export const useSpendingAlerts = () => {
  const { subscriptions } = useSubscriptions();
  const { monthlyBudget, yearlyBudget, categoryBudgets } = useBudget();
  const [spendingStatus, setSpendingStatus] = useState<{
    monthly: { spent: number; budget: number; percentage: number; status: 'safe' | 'warning' | 'critical' };
    yearly: { spent: number; budget: number; percentage: number; status: 'safe' | 'warning' | 'critical' };
    categories: Array<{ category: string; spent: number; budget: number; percentage: number; status: 'safe' | 'warning' | 'critical' }>;
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

  // Calculate spending status
  const calculateSpendingStatus = useCallback(() => {
    if (subscriptions.length === 0) {
      setSpendingStatus(null);
      return;
    }

    try {
      const budgetData = {
        monthlyBudget: monthlyBudget || undefined,
        yearlyBudget: yearlyBudget || undefined,
        categoryBudgets: categoryBudgets || undefined
      };

      const status = SpendingAlertService.getSpendingStatus(subscriptions, budgetData);
      setSpendingStatus(status);
    } catch (err) {
      console.error('Error calculating spending status:', err);
      setError(err instanceof Error ? err.message : 'Failed to calculate spending status');
    }
  }, [subscriptions, monthlyBudget, yearlyBudget, categoryBudgets]);

  // Process spending alerts (create notifications)
  const processAlerts = useCallback(async () => {
    if (!preferences || subscriptions.length === 0) {
      return 0;
    }

    try {
      const budgetData = {
        monthlyBudget: monthlyBudget || undefined,
        yearlyBudget: yearlyBudget || undefined,
        categoryBudgets: categoryBudgets || undefined
      };

      const alertCount = await SpendingAlertService.processSpendingAlerts(
        subscriptions,
        preferences,
        budgetData
      );
      return alertCount;
    } catch (err) {
      console.error('Error processing spending alerts:', err);
      setError(err instanceof Error ? err.message : 'Failed to process alerts');
      return 0;
    }
  }, [subscriptions, preferences, monthlyBudget, yearlyBudget, categoryBudgets]);

  // Get alerts that would be triggered (for preview/testing)
  const getTriggeredAlerts = useCallback(async (): Promise<SpendingAlert[]> => {
    if (!preferences || subscriptions.length === 0) {
      return [];
    }

    try {
      const budgetData = {
        monthlyBudget: monthlyBudget || undefined,
        yearlyBudget: yearlyBudget || undefined,
        categoryBudgets: categoryBudgets || undefined
      };

      return await SpendingAlertService.getSpendingAlertsNeeded(
        subscriptions,
        preferences,
        budgetData
      );
    } catch (err) {
      console.error('Error getting triggered alerts:', err);
      return [];
    }
  }, [subscriptions, preferences, monthlyBudget, yearlyBudget, categoryBudgets]);

  // Get spending alerts by severity
  const getAlertsBySeverity = useCallback(() => {
    if (!spendingStatus) {
      return { critical: [], warning: [], safe: [] };
    }

    const critical = [];
    const warning = [];
    const safe = [];

    // Check monthly budget
    if (spendingStatus.monthly.budget > 0) {
      const item = { type: 'monthly' as const, ...spendingStatus.monthly };
      if (item.status === 'critical') critical.push(item);
      else if (item.status === 'warning') warning.push(item);
      else safe.push(item);
    }

    // Check yearly budget
    if (spendingStatus.yearly.budget > 0) {
      const item = { type: 'yearly' as const, ...spendingStatus.yearly };
      if (item.status === 'critical') critical.push(item);
      else if (item.status === 'warning') warning.push(item);
      else safe.push(item);
    }

    // Check category budgets
    spendingStatus.categories.forEach(cat => {
      const item = { type: 'category' as const, ...cat };
      if (item.status === 'critical') critical.push(item);
      else if (item.status === 'warning') warning.push(item);
      else safe.push(item);
    });

    return { critical, warning, safe };
  }, [spendingStatus]);

  // Get total budget utilization
  const getBudgetUtilization = useCallback(() => {
    if (!spendingStatus) {
      return { totalSpent: 0, totalBudget: 0, overallPercentage: 0, overallStatus: 'safe' as const };
    }

    let totalSpent = 0;
    let totalBudget = 0;

    // Use monthly budget as primary
    if (spendingStatus.monthly.budget > 0) {
      totalSpent = spendingStatus.monthly.spent;
      totalBudget = spendingStatus.monthly.budget;
    }

    const overallPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    const overallStatus = overallPercentage >= 100 ? 'critical' : 
                         overallPercentage >= 80 ? 'warning' : 'safe';

    return { totalSpent, totalBudget, overallPercentage, overallStatus };
  }, [spendingStatus]);

  // Initialize and load data
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        await loadPreferences();
        calculateSpendingStatus();
      } catch (err) {
        console.error('Error initializing spending alerts:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize');
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, [loadPreferences, calculateSpendingStatus]);

  // Recalculate when subscriptions or budgets change
  useEffect(() => {
    if (!isLoading) {
      calculateSpendingStatus();
    }
  }, [subscriptions, monthlyBudget, yearlyBudget, categoryBudgets, calculateSpendingStatus, isLoading]);

  // Auto-process alerts (could be triggered by a timer or user action)
  const autoProcessAlerts = useCallback(async () => {
    if (preferences?.spending_threshold_enabled) {
      return await processAlerts();
    }
    return 0;
  }, [preferences, processAlerts]);

  return {
    // Data
    spendingStatus,
    preferences,
    isLoading,
    error,

    // Actions
    processAlerts,
    loadPreferences,
    autoProcessAlerts,
    getTriggeredAlerts,

    // Computed values
    getAlertsBySeverity,
    getBudgetUtilization,

    // Statistics
    hasActiveAlerts: spendingStatus ? 
      (spendingStatus.monthly.status !== 'safe' || 
       spendingStatus.yearly.status !== 'safe' || 
       spendingStatus.categories.some(cat => cat.status !== 'safe')) : false,
    criticalAlerts: getAlertsBySeverity().critical.length,
    warningAlerts: getAlertsBySeverity().warning.length,
  };
};
