// Smart Notification Scheduling Service for Phase 2.1: Intelligent Notification System
import { db } from '../lib/supabase';
import { NotificationPreferences } from '../types/notifications';
import { RenewalReminderService } from './renewalReminderService';
import { SpendingAlertService } from './spendingAlertService';
import { UnusedSubscriptionService } from './unusedSubscriptionService';
import { Subscription } from '../contexts/SubscriptionContext';

export interface ScheduledNotification {
  id: string;
  type: 'renewal_reminder' | 'spending_alert' | 'unused_subscription' | 'batch_summary';
  priority: 'low' | 'medium' | 'high' | 'critical';
  scheduledTime: Date;
  content: {
    title: string;
    message: string;
    actionLabel?: string;
    actionPath?: string;
  };
  metadata?: Record<string, any>;
}

export interface NotificationBatch {
  id: string;
  scheduledTime: Date;
  notifications: ScheduledNotification[];
  batchType: 'morning_summary' | 'evening_digest' | 'urgent_alerts';
  estimatedReadTime: number; // in minutes
}

export class SmartNotificationScheduler {
  private static readonly OPTIMAL_TIMES = {
    morning: { hour: 9, minute: 0 }, // 9:00 AM
    afternoon: { hour: 14, minute: 0 }, // 2:00 PM
    evening: { hour: 18, minute: 0 }, // 6:00 PM
  };

  private static readonly BATCH_LIMITS = {
    morning_summary: 5,
    evening_digest: 8,
    urgent_alerts: 3,
  };

  /**
   * Main scheduling function that processes all notification types
   */
  static async scheduleIntelligentNotifications(
    subscriptions: Subscription[],
    preferences: NotificationPreferences
  ): Promise<{
    scheduled: number;
    batched: number;
    deferred: number;
  }> {
    try {
      // Check if scheduling is enabled
      if (!preferences.smart_scheduling_enabled) {
        return { scheduled: 0, batched: 0, deferred: 0 };
      }

      // Get current notification load
      const currentLoad = await this.getCurrentNotificationLoad();
      
      // Collect pending notifications from all services
      const pendingNotifications = await this.collectPendingNotifications(subscriptions, preferences);
      
      // Apply intelligent scheduling logic
      const schedulingPlan = await this.createSchedulingPlan(pendingNotifications, preferences, currentLoad);
      
      // Execute the scheduling plan
      const results = await this.executeSchedulingPlan(schedulingPlan, preferences);
      
      return results;
    } catch (error) {
      console.error('Error in smart notification scheduling:', error);
      return { scheduled: 0, batched: 0, deferred: 0 };
    }
  }

  /**
   * Collect pending notifications from all notification services
   */
  private static async collectPendingNotifications(
    subscriptions: Subscription[],
    preferences: NotificationPreferences
  ): Promise<ScheduledNotification[]> {
    const notifications: ScheduledNotification[] = [];

    // Collect renewal reminders
    const renewals = await RenewalReminderService.getUpcomingRenewals(subscriptions, preferences);
    for (const renewal of renewals) {
      notifications.push({
        id: `renewal-${renewal.subscription_id}`,
        type: 'renewal_reminder',
        priority: this.getRenewalPriority(renewal.days_until_renewal),
        scheduledTime: this.calculateOptimalTime(renewal.days_until_renewal, preferences),
        content: {
          title: `${renewal.subscription_name} renews soon`,
          message: `Your ${renewal.subscription_name} subscription renews in ${renewal.days_until_renewal} days for ${renewal.renewal_cost}`,
          actionLabel: 'Manage Subscription',
          actionPath: '/subscriptions'
        },
        metadata: { subscriptionId: renewal.subscription_id, renewalDate: renewal.next_renewal_date }
      });
    }

    // Collect spending alerts
    const spendingAlerts = await SpendingAlertService.getSpendingAlerts(subscriptions, preferences);
    for (const alert of spendingAlerts) {
      notifications.push({
        id: `spending-${alert.type}-${Date.now()}`,
        type: 'spending_alert',
        priority: alert.severity === 'critical' ? 'critical' : 'high',
        scheduledTime: this.calculateUrgentTime(preferences),
        content: {
          title: 'Budget Alert',
          message: `You've used ${alert.percentage_used.toFixed(0)}% of your ${alert.type} budget`,
          actionLabel: 'View Budget',
          actionPath: '/settings'
        },
        metadata: { alertType: alert.type, severity: alert.severity }
      });
    }

    // Collect unused subscription alerts
    const unusedSubscriptions = await UnusedSubscriptionService.getUnusedSubscriptions(subscriptions, preferences);
    for (const unused of unusedSubscriptions) {
      notifications.push({
        id: `unused-${unused.subscription_id}`,
        type: 'unused_subscription',
        priority: unused.severity === 'critical' ? 'high' : 'medium',
        scheduledTime: this.calculateOptimalTime(7, preferences), // Schedule for next week
        content: {
          title: `${unused.subscription_name} appears unused`,
          message: `Haven't used ${unused.subscription_name} in ${unused.days_since_last_activity} days. Save ${unused.potential_savings.toFixed(2)} by canceling.`,
          actionLabel: 'Review Subscription',
          actionPath: '/subscriptions'
        },
        metadata: { subscriptionId: unused.subscription_id, daysSinceActivity: unused.days_since_last_activity }
      });
    }

    return notifications;
  }

  /**
   * Create an intelligent scheduling plan
   */
  private static async createSchedulingPlan(
    notifications: ScheduledNotification[],
    preferences: NotificationPreferences,
    currentLoad: number
  ): Promise<{
    immediate: ScheduledNotification[];
    batched: NotificationBatch[];
    deferred: ScheduledNotification[];
  }> {
    const plan = {
      immediate: [] as ScheduledNotification[],
      batched: [] as NotificationBatch[],
      deferred: [] as ScheduledNotification[]
    };

    // Sort notifications by priority and urgency
    const sortedNotifications = notifications.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    // Check daily limits
    const dailyLimit = preferences.max_daily_notifications || 10;
    const remainingQuota = Math.max(0, dailyLimit - currentLoad);

    // Separate critical/urgent notifications for immediate sending
    const criticalNotifications = sortedNotifications.filter(n => 
      n.priority === 'critical' || 
      (n.type === 'spending_alert' && n.priority === 'high')
    );

    // Add critical notifications to immediate (up to remaining quota)
    plan.immediate = criticalNotifications.slice(0, Math.min(criticalNotifications.length, remainingQuota));

    // Remaining notifications for batching
    const remainingNotifications = sortedNotifications.filter(n => 
      !plan.immediate.includes(n)
    );

    // Create batches for non-critical notifications
    if (remainingNotifications.length > 0) {
      const batches = this.createNotificationBatches(remainingNotifications, preferences);
      plan.batched = batches;
    }

    // Defer notifications that exceed all limits
    const totalScheduled = plan.immediate.length + plan.batched.reduce((sum, batch) => sum + batch.notifications.length, 0);
    if (totalScheduled < sortedNotifications.length) {
      plan.deferred = sortedNotifications.slice(totalScheduled);
    }

    return plan;
  }

  /**
   * Create notification batches for optimal delivery
   */
  private static createNotificationBatches(
    notifications: ScheduledNotification[],
    preferences: NotificationPreferences
  ): NotificationBatch[] {
    const batches: NotificationBatch[] = [];
    const now = new Date();

    // Group notifications by optimal delivery time
    const morningNotifications = notifications.filter(n => 
      n.type === 'unused_subscription' || n.priority === 'low'
    );
    
    const eveningNotifications = notifications.filter(n => 
      n.type === 'renewal_reminder' && n.priority === 'medium'
    );

    // Create morning summary batch
    if (morningNotifications.length > 0) {
      const morningTime = this.getNextOptimalTime('morning', preferences);
      batches.push({
        id: `morning-${Date.now()}`,
        scheduledTime: morningTime,
        notifications: morningNotifications.slice(0, this.BATCH_LIMITS.morning_summary),
        batchType: 'morning_summary',
        estimatedReadTime: Math.ceil(morningNotifications.length * 0.5) // 30 seconds per notification
      });
    }

    // Create evening digest batch
    if (eveningNotifications.length > 0) {
      const eveningTime = this.getNextOptimalTime('evening', preferences);
      batches.push({
        id: `evening-${Date.now()}`,
        scheduledTime: eveningTime,
        notifications: eveningNotifications.slice(0, this.BATCH_LIMITS.evening_digest),
        batchType: 'evening_digest',
        estimatedReadTime: Math.ceil(eveningNotifications.length * 0.75) // 45 seconds per notification
      });
    }

    return batches;
  }

  /**
   * Execute the scheduling plan
   */
  private static async executeSchedulingPlan(
    plan: {
      immediate: ScheduledNotification[];
      batched: NotificationBatch[];
      deferred: ScheduledNotification[];
    },
    preferences: NotificationPreferences
  ): Promise<{ scheduled: number; batched: number; deferred: number }> {
    let scheduled = 0;
    let batched = 0;
    let deferred = 0;

    // Send immediate notifications
    for (const notification of plan.immediate) {
      try {
        await this.sendImmediateNotification(notification, preferences);
        scheduled++;
      } catch (error) {
        console.error('Error sending immediate notification:', error);
      }
    }

    // Schedule batched notifications
    for (const batch of plan.batched) {
      try {
        await this.scheduleBatchNotification(batch, preferences);
        batched += batch.notifications.length;
      } catch (error) {
        console.error('Error scheduling batch notification:', error);
      }
    }

    // Store deferred notifications for later processing
    for (const notification of plan.deferred) {
      try {
        await this.storeDeferredNotification(notification);
        deferred++;
      } catch (error) {
        console.error('Error storing deferred notification:', error);
      }
    }

    return { scheduled, batched, deferred };
  }

  /**
   * Send immediate notification
   */
  private static async sendImmediateNotification(
    notification: ScheduledNotification,
    preferences: NotificationPreferences
  ): Promise<void> {
    if (preferences.in_app_notifications_enabled) {
      await db.notifications.create({
        user_id: '', // Will be set by the database helper
        title: notification.content.title,
        message: notification.content.message,
        type: notification.type,
        subscription_id: notification.metadata?.subscriptionId,
        is_read: false
      });
    }

    // TODO: Add email and push notification sending
    if (preferences.email_notifications_enabled) {
      console.log('Email notification would be sent:', notification.content.title);
    }

    if (preferences.push_notifications_enabled) {
      console.log('Push notification would be sent:', notification.content.title);
    }
  }

  /**
   * Schedule batch notification for later delivery
   */
  private static async scheduleBatchNotification(
    batch: NotificationBatch,
    preferences: NotificationPreferences
  ): Promise<void> {
    // Create a summary notification for the batch
    const summaryTitle = this.getBatchSummaryTitle(batch);
    const summaryMessage = this.getBatchSummaryMessage(batch);

    if (preferences.in_app_notifications_enabled) {
      await db.notifications.create({
        user_id: '', // Will be set by the database helper
        title: summaryTitle,
        message: summaryMessage,
        type: 'batch_summary',
        is_read: false
      });
    }

    // TODO: Implement actual scheduling mechanism (could use a job queue)
    console.log(`Batch notification scheduled for ${batch.scheduledTime.toISOString()}`);
  }

  /**
   * Store deferred notification for future processing
   */
  private static async storeDeferredNotification(notification: ScheduledNotification): Promise<void> {
    // TODO: Implement deferred notification storage
    console.log('Deferred notification stored:', notification.content.title);
  }

  /**
   * Helper methods for time calculations
   */
  private static calculateOptimalTime(daysFromNow: number, preferences: NotificationPreferences): Date {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + Math.max(0, daysFromNow - 1));
    
    // Set to optimal morning time
    targetDate.setHours(this.OPTIMAL_TIMES.morning.hour, this.OPTIMAL_TIMES.morning.minute, 0, 0);
    
    // Respect quiet hours
    return this.adjustForQuietHours(targetDate, preferences);
  }

  private static calculateUrgentTime(preferences: NotificationPreferences): Date {
    const now = new Date();
    
    // If in quiet hours, schedule for next available time
    if (this.isInQuietHours(now, preferences)) {
      return this.getNextAvailableTime(preferences);
    }
    
    return now;
  }

  private static getNextOptimalTime(timeSlot: 'morning' | 'afternoon' | 'evening', preferences: NotificationPreferences): Date {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const optimalTime = this.OPTIMAL_TIMES[timeSlot];
    tomorrow.setHours(optimalTime.hour, optimalTime.minute, 0, 0);
    
    return this.adjustForQuietHours(tomorrow, preferences);
  }

  private static adjustForQuietHours(date: Date, preferences: NotificationPreferences): Date {
    if (!preferences.quiet_hours_enabled) {
      return date;
    }

    if (this.isInQuietHours(date, preferences)) {
      return this.getNextAvailableTime(preferences);
    }

    return date;
  }

  private static isInQuietHours(date: Date, preferences: NotificationPreferences): boolean {
    if (!preferences.quiet_hours_enabled || !preferences.quiet_hours_start || !preferences.quiet_hours_end) {
      return false;
    }

    const currentTime = date.getHours() * 60 + date.getMinutes();
    const [startHour, startMin] = preferences.quiet_hours_start.split(':').map(Number);
    const [endHour, endMin] = preferences.quiet_hours_end.split(':').map(Number);
    
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    // Handle overnight quiet hours
    if (startTime > endTime) {
      return currentTime >= startTime || currentTime <= endTime;
    } else {
      return currentTime >= startTime && currentTime <= endTime;
    }
  }

  private static getNextAvailableTime(preferences: NotificationPreferences): Date {
    const now = new Date();
    
    if (!preferences.quiet_hours_enabled || !preferences.quiet_hours_end) {
      return now;
    }

    const [endHour, endMin] = preferences.quiet_hours_end.split(':').map(Number);
    const nextAvailable = new Date(now);
    nextAvailable.setHours(endHour, endMin, 0, 0);

    // If quiet hours end time has passed today, schedule for tomorrow
    if (nextAvailable <= now) {
      nextAvailable.setDate(nextAvailable.getDate() + 1);
    }

    return nextAvailable;
  }

  private static getRenewalPriority(daysUntilRenewal: number): 'low' | 'medium' | 'high' | 'critical' {
    if (daysUntilRenewal <= 1) return 'critical';
    if (daysUntilRenewal <= 3) return 'high';
    if (daysUntilRenewal <= 7) return 'medium';
    return 'low';
  }

  private static getBatchSummaryTitle(batch: NotificationBatch): string {
    const count = batch.notifications.length;
    switch (batch.batchType) {
      case 'morning_summary':
        return `Good morning! ${count} subscription updates`;
      case 'evening_digest':
        return `Evening digest: ${count} items to review`;
      case 'urgent_alerts':
        return `Urgent: ${count} subscription alerts`;
      default:
        return `${count} subscription notifications`;
    }
  }

  private static getBatchSummaryMessage(batch: NotificationBatch): string {
    const count = batch.notifications.length;
    const readTime = batch.estimatedReadTime;
    
    return `You have ${count} subscription notifications. Estimated reading time: ${readTime} minute${readTime !== 1 ? 's' : ''}.`;
  }

  private static async getCurrentNotificationLoad(): Promise<number> {
    try {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      const { data, error } = await db.notifications.getAll();
      if (error) throw error;

      const todayNotifications = data?.filter(notification => 
        new Date(notification.created_at || '') >= startOfDay
      ) || [];

      return todayNotifications.length;
    } catch (error) {
      console.error('Error getting current notification load:', error);
      return 0;
    }
  }

  /**
   * Get scheduling insights for display purposes
   */
  static getSchedulingInsights(preferences: NotificationPreferences): {
    nextOptimalTime: Date;
    quietHoursActive: boolean;
    dailyQuotaUsed: number;
    batchingEnabled: boolean;
  } {
    const now = new Date();
    
    return {
      nextOptimalTime: this.getNextOptimalTime('morning', preferences),
      quietHoursActive: this.isInQuietHours(now, preferences),
      dailyQuotaUsed: 0, // Would be calculated from actual usage
      batchingEnabled: preferences.smart_scheduling_enabled || false
    };
  }
}
