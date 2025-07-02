// Renewal Reminders Hook for Phase 2.1: Intelligent Notification System
import { useState, useEffect, useCallback } from 'react';
import { useSubscription } from '../contexts/SubscriptionContext';
import { RenewalReminderService } from '../services/renewalReminderService';
import { RenewalReminder, NotificationPreferences } from '../types/notifications';
import { db } from '../lib/supabase';

export const useRenewalReminders = () => {
  const { subscriptions } = useSubscription();
  const [upcomingRenewals, setUpcomingRenewals] = useState<RenewalReminder[]>([]);
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

  // Calculate upcoming renewals
  const calculateUpcomingRenewals = useCallback(() => {
    if (subscriptions.length === 0) {
      setUpcomingRenewals([]);
      return;
    }

    try {
      const renewals = RenewalReminderService.getUpcomingRenewals(subscriptions, 30);
      setUpcomingRenewals(renewals);
    } catch (err) {
      console.error('Error calculating upcoming renewals:', err);
      setError(err instanceof Error ? err.message : 'Failed to calculate renewals');
    }
  }, [subscriptions]);

  // Process renewal reminders (create notifications)
  const processReminders = useCallback(async () => {
    if (!preferences || subscriptions.length === 0) {
      return 0;
    }

    try {
      const reminderCount = await RenewalReminderService.processRenewalReminders(
        subscriptions,
        preferences
      );
      return reminderCount;
    } catch (err) {
      console.error('Error processing renewal reminders:', err);
      setError(err instanceof Error ? err.message : 'Failed to process reminders');
      return 0;
    }
  }, [subscriptions, preferences]);

  // Get renewals for a specific time period
  const getRenewalsForPeriod = useCallback((days: number): RenewalReminder[] => {
    return RenewalReminderService.getUpcomingRenewals(subscriptions, days);
  }, [subscriptions]);

  // Get renewals by urgency
  const getRenewalsByUrgency = useCallback(() => {
    const urgent = upcomingRenewals.filter(r => r.reminder_type === 'urgent');
    const medium = upcomingRenewals.filter(r => r.reminder_type === 'medium');
    const early = upcomingRenewals.filter(r => r.reminder_type === 'early');

    return { urgent, medium, early };
  }, [upcomingRenewals]);

  // Get total cost of upcoming renewals
  const getUpcomingRenewalsCost = useCallback((days: number = 30): number => {
    const renewals = getRenewalsForPeriod(days);
    return renewals.reduce((total, renewal) => total + renewal.cost, 0);
  }, [getRenewalsForPeriod]);

  // Initialize and load data
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        await loadPreferences();
        calculateUpcomingRenewals();
      } catch (err) {
        console.error('Error initializing renewal reminders:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize');
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, [loadPreferences, calculateUpcomingRenewals]);

  // Recalculate when subscriptions change
  useEffect(() => {
    if (!isLoading) {
      calculateUpcomingRenewals();
    }
  }, [subscriptions, calculateUpcomingRenewals, isLoading]);

  // Auto-process reminders (could be triggered by a timer or user action)
  const autoProcessReminders = useCallback(async () => {
    if (preferences?.renewal_reminder_enabled) {
      return await processReminders();
    }
    return 0;
  }, [preferences, processReminders]);

  return {
    // Data
    upcomingRenewals,
    preferences,
    isLoading,
    error,

    // Actions
    processReminders,
    loadPreferences,
    autoProcessReminders,

    // Computed values
    getRenewalsForPeriod,
    getRenewalsByUrgency,
    getUpcomingRenewalsCost,

    // Statistics
    totalUpcomingRenewals: upcomingRenewals.length,
    urgentRenewals: upcomingRenewals.filter(r => r.reminder_type === 'urgent').length,
    upcomingCost: getUpcomingRenewalsCost(),
  };
};
