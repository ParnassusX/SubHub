// Unused Subscription Detection Service for Phase 2.1: Intelligent Notification System
import { db } from '../lib/supabase';
import { Subscription } from '../contexts/SubscriptionContext';
import { NotificationPreferences, UnusedSubscription } from '../types/notifications';

export class UnusedSubscriptionService {
  /**
   * Calculate days since last activity for a subscription
   * Note: In a real implementation, this would track actual usage data
   * For now, we'll use subscription creation date and simulate usage patterns
   */
  static calculateDaysSinceLastActivity(subscription: Subscription): number {
    const now = new Date();
    const startDate = new Date(subscription.startDate);
    const daysSinceStart = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Simulate usage patterns based on subscription characteristics
    // In a real app, this would come from actual usage tracking data
    const simulatedLastActivity = this.simulateLastActivity(subscription, daysSinceStart);
    return Math.floor((now.getTime() - simulatedLastActivity.getTime()) / (1000 * 60 * 60 * 24));
  }

  /**
   * Simulate last activity date based on subscription patterns
   * This is a placeholder for real usage tracking
   */
  private static simulateLastActivity(subscription: Subscription, daysSinceStart: number): Date {
    const now = new Date();
    
    // Simulate different usage patterns based on category
    let inactivityDays = 0;
    
    switch (subscription.category.toLowerCase()) {
      case 'entertainment':
        // Entertainment services might be used more regularly
        inactivityDays = Math.random() > 0.7 ? Math.floor(Math.random() * 45) + 15 : Math.floor(Math.random() * 7);
        break;
      case 'productivity':
        // Productivity tools might have sporadic usage
        inactivityDays = Math.random() > 0.6 ? Math.floor(Math.random() * 60) + 20 : Math.floor(Math.random() * 14);
        break;
      case 'health & fitness':
        // Fitness apps often have seasonal usage patterns
        inactivityDays = Math.random() > 0.5 ? Math.floor(Math.random() * 90) + 30 : Math.floor(Math.random() * 21);
        break;
      case 'education':
        // Educational services might have project-based usage
        inactivityDays = Math.random() > 0.4 ? Math.floor(Math.random() * 120) + 45 : Math.floor(Math.random() * 30);
        break;
      default:
        // Default pattern for other categories
        inactivityDays = Math.random() > 0.6 ? Math.floor(Math.random() * 50) + 20 : Math.floor(Math.random() * 10);
    }
    
    // Ensure we don't go before the subscription start date
    const maxInactivity = Math.min(inactivityDays, daysSinceStart);
    return new Date(now.getTime() - (maxInactivity * 24 * 60 * 60 * 1000));
  }

  /**
   * Get subscriptions that appear to be unused
   */
  static async getUnusedSubscriptions(
    subscriptions: Subscription[],
    preferences: NotificationPreferences
  ): Promise<UnusedSubscription[]> {
    if (!preferences.unused_subscription_enabled) {
      return [];
    }

    const thresholdDays = preferences.unused_subscription_days || 30;
    const unusedSubscriptions: UnusedSubscription[] = [];

    for (const subscription of subscriptions) {
      const daysSinceLastActivity = this.calculateDaysSinceLastActivity(subscription);
      
      if (daysSinceLastActivity >= thresholdDays) {
        // Check if we haven't already sent this notification recently
        const hasRecentNotification = await this.hasRecentUnusedNotification(
          subscription.id,
          daysSinceLastActivity
        );

        if (!hasRecentNotification) {
          const severity = this.getUnusedSeverity(daysSinceLastActivity, thresholdDays);
          
          unusedSubscriptions.push({
            subscription_id: subscription.id,
            subscription_name: subscription.name,
            subscription_cost: subscription.cost,
            subscription_frequency: subscription.frequency,
            days_since_last_activity: daysSinceLastActivity,
            threshold_days: thresholdDays,
            severity,
            potential_savings: this.calculatePotentialSavings(subscription, daysSinceLastActivity)
          });
        }
      }
    }

    return unusedSubscriptions.sort((a, b) => b.days_since_last_activity - a.days_since_last_activity);
  }

  /**
   * Check if an unused subscription notification was recently sent
   */
  private static async hasRecentUnusedNotification(
    subscriptionId: string,
    _currentInactiveDays: number
  ): Promise<boolean> {
    try {
      const sevenDaysAgo = new Date(Date.now() - (7 * 24 * 60 * 60 * 1000));

      const { data, error } = await db.notifications.getAll();
      if (error) throw error;

      // Check for recent unused subscription notifications
      const recentNotification = data?.find(notification => 
        notification.type === 'unused_subscription' &&
        notification.subscription_id === subscriptionId &&
        new Date(notification.created_at || '') >= sevenDaysAgo
      );

      return !!recentNotification;
    } catch (error) {
      console.error('Error checking recent unused notification:', error);
      return false;
    }
  }

  /**
   * Determine severity based on inactivity duration
   */
  private static getUnusedSeverity(daysSinceLastActivity: number, thresholdDays: number): 'warning' | 'critical' {
    const ratio = daysSinceLastActivity / thresholdDays;
    return ratio >= 2 ? 'critical' : 'warning';
  }

  /**
   * Calculate potential savings from canceling unused subscription
   */
  private static calculatePotentialSavings(subscription: Subscription, daysSinceLastActivity: number): number {
    const monthsUnused = Math.floor(daysSinceLastActivity / 30);
    
    if (subscription.frequency === 'Monthly') {
      return subscription.cost * Math.max(1, monthsUnused);
    } else if (subscription.frequency === 'Yearly') {
      const yearsUnused = Math.floor(daysSinceLastActivity / 365);
      return subscription.cost * Math.max(1, yearsUnused);
    }
    
    return subscription.cost;
  }

  /**
   * Create unused subscription notifications
   */
  static async createUnusedSubscriptionAlerts(
    unusedSubscriptions: UnusedSubscription[],
    preferences: NotificationPreferences
  ): Promise<void> {
    for (const unused of unusedSubscriptions) {
      try {
        // Create in-app notification if enabled
        if (preferences.in_app_notifications_enabled) {
          await this.createInAppUnusedAlert(unused);
        }

        // TODO: Send email notification if enabled
        if (preferences.email_notifications_enabled) {
          console.log('Email unused subscription alert would be sent for:', unused.subscription_name);
        }

        // TODO: Send push notification if enabled
        if (preferences.push_notifications_enabled) {
          console.log('Push unused subscription alert would be sent for:', unused.subscription_name);
        }
      } catch (error) {
        console.error('Error creating unused subscription alert:', error);
      }
    }
  }

  /**
   * Create in-app notification for unused subscription
   */
  private static async createInAppUnusedAlert(unused: UnusedSubscription): Promise<void> {
    const title = this.getUnusedAlertTitle(unused);
    const message = this.getUnusedAlertMessage(unused);

    await db.notifications.create({
      user_id: '', // Will be set by the database helper
      title,
      message,
      type: 'unused_subscription',
      subscription_id: unused.subscription_id,
      is_read: false
    });
  }

  /**
   * Generate unused subscription alert title
   */
  private static getUnusedAlertTitle(unused: UnusedSubscription): string {
    const { subscription_name, days_since_last_activity, severity } = unused;
    
    if (severity === 'critical') {
      return `${subscription_name} hasn't been used in ${days_since_last_activity} days`;
    } else {
      return `${subscription_name} might be unused`;
    }
  }

  /**
   * Generate unused subscription alert message
   */
  private static getUnusedAlertMessage(unused: UnusedSubscription): string {
    const { 
      subscription_name, 
      subscription_cost, 
      subscription_frequency,
      days_since_last_activity, 
      potential_savings 
    } = unused;
    
    let message = `Your ${subscription_name} subscription hasn't been used in ${days_since_last_activity} days. `;
    message += `You're paying $${subscription_cost.toFixed(2)} ${subscription_frequency.toLowerCase()} for this service. `;
    
    if (potential_savings > subscription_cost) {
      message += `You could save $${potential_savings.toFixed(2)} by canceling this subscription.`;
    } else {
      message += `Consider reviewing if you still need this subscription.`;
    }
    
    return message;
  }

  /**
   * Process unused subscription detection for a user
   */
  static async processUnusedSubscriptionDetection(
    subscriptions: Subscription[],
    preferences: NotificationPreferences
  ): Promise<number> {
    try {
      // Check if unused subscription detection is enabled
      if (!preferences.unused_subscription_enabled) {
        return 0;
      }

      // Check quiet hours
      if (this.isQuietHours(preferences)) {
        console.log('Skipping unused subscription detection due to quiet hours');
        return 0;
      }

      // Get unused subscriptions
      const unusedSubscriptions = await this.getUnusedSubscriptions(subscriptions, preferences);
      
      if (unusedSubscriptions.length === 0) {
        return 0;
      }

      // Check daily notification limit
      const dailyCount = await this.getDailyNotificationCount();
      if (preferences.max_daily_notifications > 0 && 
          dailyCount + unusedSubscriptions.length > preferences.max_daily_notifications) {
        console.log('Skipping some unused subscription alerts due to daily limit');
        const allowedAlerts = unusedSubscriptions.slice(0, preferences.max_daily_notifications - dailyCount);
        await this.createUnusedSubscriptionAlerts(allowedAlerts, preferences);
        return allowedAlerts.length;
      }

      // Create all alerts
      await this.createUnusedSubscriptionAlerts(unusedSubscriptions, preferences);
      return unusedSubscriptions.length;
    } catch (error) {
      console.error('Error processing unused subscription detection:', error);
      return 0;
    }
  }

  /**
   * Check if current time is within quiet hours
   */
  private static isQuietHours(preferences: NotificationPreferences): boolean {
    if (!preferences.quiet_hours_enabled || !preferences.quiet_hours_start || !preferences.quiet_hours_end) {
      return false;
    }

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [startHour, startMin] = preferences.quiet_hours_start.split(':').map(Number);
    const [endHour, endMin] = preferences.quiet_hours_end.split(':').map(Number);
    
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    // Handle overnight quiet hours (e.g., 22:00 to 08:00)
    if (startTime > endTime) {
      return currentTime >= startTime || currentTime <= endTime;
    } else {
      return currentTime >= startTime && currentTime <= endTime;
    }
  }

  /**
   * Get the count of notifications sent today
   */
  private static async getDailyNotificationCount(): Promise<number> {
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
      console.error('Error getting daily notification count:', error);
      return 0;
    }
  }

  /**
   * Get usage insights for display purposes
   */
  static getUsageInsights(subscriptions: Subscription[]): {
    totalSubscriptions: number;
    activeSubscriptions: number;
    potentiallyUnused: number;
    totalPotentialSavings: number;
    usageByCategory: Record<string, { active: number; unused: number }>;
  } {
    const insights = {
      totalSubscriptions: subscriptions.length,
      activeSubscriptions: 0,
      potentiallyUnused: 0,
      totalPotentialSavings: 0,
      usageByCategory: {} as Record<string, { active: number; unused: number }>
    };

    subscriptions.forEach(subscription => {
      const daysSinceLastActivity = this.calculateDaysSinceLastActivity(subscription);
      const isUnused = daysSinceLastActivity >= 30; // Default threshold
      
      if (isUnused) {
        insights.potentiallyUnused++;
        insights.totalPotentialSavings += this.calculatePotentialSavings(subscription, daysSinceLastActivity);
      } else {
        insights.activeSubscriptions++;
      }

      // Track by category
      const category = subscription.category;
      if (!insights.usageByCategory[category]) {
        insights.usageByCategory[category] = { active: 0, unused: 0 };
      }
      
      if (isUnused) {
        insights.usageByCategory[category].unused++;
      } else {
        insights.usageByCategory[category].active++;
      }
    });

    return insights;
  }
}
