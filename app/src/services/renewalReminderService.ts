// Renewal Reminder Service for Phase 2.1: Intelligent Notification System
import { db } from '../lib/supabase';
import { Subscription } from '../contexts/SubscriptionContext';
import { NotificationPreferences, RenewalReminder } from '../types/notifications';

export class RenewalReminderService {
  /**
   * Calculate the next billing date for a subscription
   */
  static calculateNextBillingDate(subscription: Subscription): Date {
    const startDate = new Date(subscription.startDate);
    const now = new Date();
    
    if (subscription.frequency === 'Monthly') {
      // Find the next monthly billing date
      let nextBilling = new Date(startDate);
      while (nextBilling <= now) {
        nextBilling.setMonth(nextBilling.getMonth() + 1);
      }
      return nextBilling;
    } else if (subscription.frequency === 'Yearly') {
      // Find the next yearly billing date
      let nextBilling = new Date(startDate);
      while (nextBilling <= now) {
        nextBilling.setFullYear(nextBilling.getFullYear() + 1);
      }
      return nextBilling;
    }
    
    return startDate;
  }

  /**
   * Get subscriptions that need renewal reminders
   */
  static async getSubscriptionsNeedingReminders(
    subscriptions: Subscription[],
    preferences: NotificationPreferences
  ): Promise<RenewalReminder[]> {
    if (!preferences.renewal_reminder_enabled || !preferences.renewal_reminder_days) {
      return [];
    }

    const now = new Date();
    const reminders: RenewalReminder[] = [];

    for (const subscription of subscriptions) {
      const nextBillingDate = this.calculateNextBillingDate(subscription);
      const daysUntilRenewal = Math.ceil(
        (nextBillingDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Check if we should send a reminder for this subscription
      for (const reminderDays of preferences.renewal_reminder_days) {
        if (daysUntilRenewal === reminderDays) {
          // Check if we haven't already sent this reminder
          const existingNotification = await this.hasExistingReminderNotification(
            subscription.id,
            reminderDays
          );

          if (!existingNotification) {
            const reminderType = this.getReminderType(daysUntilRenewal);
            
            reminders.push({
              subscription_id: subscription.id,
              subscription_name: subscription.name,
              renewal_date: nextBillingDate.toISOString(),
              cost: subscription.cost,
              days_until_renewal: daysUntilRenewal,
              reminder_type: reminderType
            });
          }
        }
      }
    }

    return reminders;
  }

  /**
   * Check if a reminder notification already exists
   */
  private static async hasExistingReminderNotification(
    subscriptionId: string,
    reminderDays: number
  ): Promise<boolean> {
    try {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

      const { data, error } = await db.notifications.getAll();
      if (error) throw error;

      // Check if there's already a renewal reminder for this subscription today
      const existingReminder = data?.find(notification => 
        notification.type === 'renewal_reminder' &&
        notification.subscription_id === subscriptionId &&
        notification.message.includes(`${reminderDays} day`) &&
        new Date(notification.created_at || '') >= startOfDay &&
        new Date(notification.created_at || '') < endOfDay
      );

      return !!existingReminder;
    } catch (error) {
      console.error('Error checking existing reminder notification:', error);
      return false;
    }
  }

  /**
   * Determine the reminder type based on days until renewal
   */
  private static getReminderType(daysUntilRenewal: number): 'early' | 'medium' | 'urgent' {
    if (daysUntilRenewal >= 7) return 'early';
    if (daysUntilRenewal >= 3) return 'medium';
    return 'urgent';
  }

  /**
   * Create renewal reminder notifications
   */
  static async createRenewalReminders(
    reminders: RenewalReminder[],
    preferences: NotificationPreferences
  ): Promise<void> {
    for (const reminder of reminders) {
      try {
        // Create in-app notification if enabled
        if (preferences.in_app_notifications_enabled) {
          await this.createInAppReminderNotification(reminder);
        }

        // TODO: Send email notification if enabled
        if (preferences.email_notifications_enabled) {
          // This would integrate with an email service
          console.log('Email reminder would be sent for:', reminder.subscription_name);
        }

        // TODO: Send push notification if enabled
        if (preferences.push_notifications_enabled) {
          // This would integrate with a push notification service
          console.log('Push reminder would be sent for:', reminder.subscription_name);
        }
      } catch (error) {
        console.error('Error creating renewal reminder:', error);
      }
    }
  }

  /**
   * Create in-app notification for renewal reminder
   */
  private static async createInAppReminderNotification(reminder: RenewalReminder): Promise<void> {
    const title = this.getReminderTitle(reminder);
    const message = this.getReminderMessage(reminder);

    await db.notifications.create({
      user_id: '', // Will be set by the database helper
      title,
      message,
      type: 'renewal_reminder',
      subscription_id: reminder.subscription_id,
      is_read: false
    });
  }

  /**
   * Generate reminder notification title
   */
  private static getReminderTitle(reminder: RenewalReminder): string {
    const { days_until_renewal, subscription_name } = reminder;
    
    if (days_until_renewal === 1) {
      return `${subscription_name} renews tomorrow`;
    } else if (days_until_renewal <= 3) {
      return `${subscription_name} renews in ${days_until_renewal} days`;
    } else if (days_until_renewal === 7) {
      return `${subscription_name} renews next week`;
    } else {
      return `${subscription_name} renewal reminder`;
    }
  }

  /**
   * Generate reminder notification message
   */
  private static getReminderMessage(reminder: RenewalReminder): string {
    const { subscription_name, cost, days_until_renewal, renewal_date } = reminder;
    const renewalDateFormatted = new Date(renewal_date).toLocaleDateString();
    
    let message = `Your ${subscription_name} subscription will renew `;
    
    if (days_until_renewal === 1) {
      message += 'tomorrow';
    } else {
      message += `in ${days_until_renewal} days`;
    }
    
    message += ` on ${renewalDateFormatted} for $${cost.toFixed(2)}.`;
    
    if (days_until_renewal <= 3) {
      message += ' You can cancel or modify your subscription if needed.';
    }
    
    return message;
  }

  /**
   * Process renewal reminders for a user
   */
  static async processRenewalReminders(
    subscriptions: Subscription[],
    preferences: NotificationPreferences
  ): Promise<number> {
    try {
      // Check if renewal reminders are enabled
      if (!preferences.renewal_reminder_enabled) {
        return 0;
      }

      // Check quiet hours
      if (this.isQuietHours(preferences)) {
        console.log('Skipping renewal reminders due to quiet hours');
        return 0;
      }

      // Get subscriptions that need reminders
      const reminders = await this.getSubscriptionsNeedingReminders(subscriptions, preferences);
      
      if (reminders.length === 0) {
        return 0;
      }

      // Check daily notification limit
      const dailyCount = await this.getDailyNotificationCount();
      if (preferences.max_daily_notifications > 0 && 
          dailyCount + reminders.length > preferences.max_daily_notifications) {
        console.log('Skipping some reminders due to daily limit');
        const allowedReminders = reminders.slice(0, preferences.max_daily_notifications - dailyCount);
        await this.createRenewalReminders(allowedReminders, preferences);
        return allowedReminders.length;
      }

      // Create all reminders
      await this.createRenewalReminders(reminders, preferences);
      return reminders.length;
    } catch (error) {
      console.error('Error processing renewal reminders:', error);
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
   * Get upcoming renewals for display purposes
   */
  static getUpcomingRenewals(subscriptions: Subscription[], days: number = 30): RenewalReminder[] {
    const now = new Date();
    const cutoffDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));
    
    return subscriptions
      .map(subscription => {
        const nextBillingDate = this.calculateNextBillingDate(subscription);
        const daysUntilRenewal = Math.ceil(
          (nextBillingDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (nextBillingDate <= cutoffDate && daysUntilRenewal > 0) {
          return {
            subscription_id: subscription.id,
            subscription_name: subscription.name,
            renewal_date: nextBillingDate.toISOString(),
            cost: subscription.cost,
            days_until_renewal: daysUntilRenewal,
            reminder_type: this.getReminderType(daysUntilRenewal)
          };
        }
        return null;
      })
      .filter((reminder): reminder is RenewalReminder => reminder !== null)
      .sort((a, b) => a.days_until_renewal - b.days_until_renewal);
  }
}
