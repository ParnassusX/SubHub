// Spending Alert Service for Phase 2.1: Intelligent Notification System
import { db } from '../lib/supabase';
import { Subscription } from '../contexts/SubscriptionContext';
import { NotificationPreferences, SpendingAlert } from '../types/notifications';
import { BudgetService } from './budgetService';

export class SpendingAlertService {
  /**
   * Calculate current spending for different periods
   */
  static calculateCurrentSpending(subscriptions: Subscription[]): {
    monthly: number;
    yearly: number;
    categorySpending: Record<string, number>;
  } {
    const spending = BudgetService.calculateSpending(subscriptions);
    const categorySpending = BudgetService.calculateCategorySpending(subscriptions);
    
    return {
      monthly: spending.monthly,
      yearly: spending.yearly,
      categorySpending
    };
  }

  /**
   * Get spending alerts that need to be sent
   */
  static async getSpendingAlertsNeeded(
    subscriptions: Subscription[],
    preferences: NotificationPreferences,
    budgetData: {
      monthlyBudget?: number;
      yearlyBudget?: number;
      categoryBudgets?: Record<string, number>;
    }
  ): Promise<SpendingAlert[]> {
    if (!preferences.spending_threshold_enabled) {
      return [];
    }

    const alerts: SpendingAlert[] = [];
    const spending = this.calculateCurrentSpending(subscriptions);
    const thresholdPercentage = preferences.spending_threshold_percentage || 80;

    // Check monthly budget alerts
    if (budgetData.monthlyBudget && budgetData.monthlyBudget > 0) {
      const percentageUsed = (spending.monthly / budgetData.monthlyBudget) * 100;
      
      if (percentageUsed >= thresholdPercentage) {
        // Check if we haven't already sent this alert recently
        const hasRecentAlert = await this.hasRecentSpendingAlert('monthly', spending.monthly);
        
        if (!hasRecentAlert) {
          alerts.push({
            type: 'monthly',
            current_amount: spending.monthly,
            budget_amount: budgetData.monthlyBudget,
            percentage_used: percentageUsed,
            severity: percentageUsed >= 100 ? 'critical' : 'warning'
          });
        }
      }
    }

    // Check yearly budget alerts
    if (budgetData.yearlyBudget && budgetData.yearlyBudget > 0) {
      const percentageUsed = (spending.yearly / budgetData.yearlyBudget) * 100;
      
      if (percentageUsed >= thresholdPercentage) {
        const hasRecentAlert = await this.hasRecentSpendingAlert('yearly', spending.yearly);
        
        if (!hasRecentAlert) {
          alerts.push({
            type: 'yearly',
            current_amount: spending.yearly,
            budget_amount: budgetData.yearlyBudget,
            percentage_used: percentageUsed,
            severity: percentageUsed >= 100 ? 'critical' : 'warning'
          });
        }
      }
    }

    // Check category budget alerts
    if (budgetData.categoryBudgets) {
      for (const [category, budget] of Object.entries(budgetData.categoryBudgets)) {
        if (budget > 0) {
          const categorySpent = spending.categorySpending[category] || 0;
          const percentageUsed = (categorySpent / budget) * 100;
          
          if (percentageUsed >= thresholdPercentage) {
            const hasRecentAlert = await this.hasRecentSpendingAlert('category', categorySpent, category);
            
            if (!hasRecentAlert) {
              alerts.push({
                type: 'category',
                current_amount: categorySpent,
                budget_amount: budget,
                percentage_used: percentageUsed,
                category,
                severity: percentageUsed >= 100 ? 'critical' : 'warning'
              });
            }
          }
        }
      }
    }

    return alerts;
  }

  /**
   * Check if a spending alert was recently sent
   */
  private static async hasRecentSpendingAlert(
    type: 'monthly' | 'yearly' | 'category',
    _currentAmount: number,
    category?: string
  ): Promise<boolean> {
    try {
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));

      const { data, error } = await db.notifications.getAll();
      if (error) throw error;

      // Check for recent spending alerts of the same type
      const recentAlert = data?.find(notification => {
        if (notification.type !== 'spending_threshold' && notification.type !== 'budget_exceeded') {
          return false;
        }

        const createdAt = new Date(notification.created_at || '');
        if (createdAt < oneDayAgo) {
          return false;
        }

        // Check if it's the same type of alert
        if (type === 'category') {
          return notification.message.includes(category || '');
        } else {
          return notification.message.includes(type);
        }
      });

      return !!recentAlert;
    } catch (error) {
      console.error('Error checking recent spending alert:', error);
      return false;
    }
  }

  /**
   * Create spending alert notifications
   */
  static async createSpendingAlerts(
    alerts: SpendingAlert[],
    preferences: NotificationPreferences
  ): Promise<void> {
    for (const alert of alerts) {
      try {
        // Create in-app notification if enabled
        if (preferences.in_app_notifications_enabled) {
          await this.createInAppSpendingAlert(alert);
        }

        // TODO: Send email notification if enabled
        if (preferences.email_notifications_enabled) {
          console.log('Email spending alert would be sent for:', alert.type);
        }

        // TODO: Send push notification if enabled
        if (preferences.push_notifications_enabled) {
          console.log('Push spending alert would be sent for:', alert.type);
        }
      } catch (error) {
        console.error('Error creating spending alert:', error);
      }
    }
  }

  /**
   * Create in-app notification for spending alert
   */
  private static async createInAppSpendingAlert(alert: SpendingAlert): Promise<void> {
    const title = this.getSpendingAlertTitle(alert);
    const message = this.getSpendingAlertMessage(alert);
    const notificationType = alert.severity === 'critical' ? 'budget_exceeded' : 'spending_threshold';

    await db.notifications.create({
      user_id: '', // Will be set by the database helper
      title,
      message,
      type: notificationType,
      is_read: false
    });
  }

  /**
   * Generate spending alert title
   */
  private static getSpendingAlertTitle(alert: SpendingAlert): string {
    const { type, severity, percentage_used: _percentage_used, category } = alert;
    
    if (severity === 'critical') {
      if (type === 'category') {
        return `${category} budget exceeded`;
      } else {
        return `${type.charAt(0).toUpperCase() + type.slice(1)} budget exceeded`;
      }
    } else {
      if (type === 'category') {
        return `${category} budget warning`;
      } else {
        return `${type.charAt(0).toUpperCase() + type.slice(1)} budget warning`;
      }
    }
  }

  /**
   * Generate spending alert message
   */
  private static getSpendingAlertMessage(alert: SpendingAlert): string {
    const { type, current_amount, budget_amount, percentage_used, category, severity } = alert;
    
    let message = '';
    
    if (type === 'category') {
      message = `Your ${category} spending has reached ${percentage_used.toFixed(1)}% of your budget. `;
      message += `You've spent $${current_amount.toFixed(2)} out of $${budget_amount.toFixed(2)}.`;
    } else {
      message = `Your ${type} spending has reached ${percentage_used.toFixed(1)}% of your budget. `;
      message += `You've spent $${current_amount.toFixed(2)} out of $${budget_amount.toFixed(2)}.`;
    }
    
    if (severity === 'critical') {
      message += ' Consider reviewing your subscriptions or adjusting your budget.';
    } else {
      message += ' You may want to monitor your spending more closely.';
    }
    
    return message;
  }

  /**
   * Process spending alerts for a user
   */
  static async processSpendingAlerts(
    subscriptions: Subscription[],
    preferences: NotificationPreferences,
    budgetData: {
      monthlyBudget?: number;
      yearlyBudget?: number;
      categoryBudgets?: Record<string, number>;
    }
  ): Promise<number> {
    try {
      // Check if spending alerts are enabled
      if (!preferences.spending_threshold_enabled) {
        return 0;
      }

      // Check quiet hours
      if (this.isQuietHours(preferences)) {
        console.log('Skipping spending alerts due to quiet hours');
        return 0;
      }

      // Get spending alerts that need to be sent
      const alerts = await this.getSpendingAlertsNeeded(subscriptions, preferences, budgetData);
      
      if (alerts.length === 0) {
        return 0;
      }

      // Check daily notification limit
      const dailyCount = await this.getDailyNotificationCount();
      if (preferences.max_daily_notifications > 0 && 
          dailyCount + alerts.length > preferences.max_daily_notifications) {
        console.log('Skipping some spending alerts due to daily limit');
        const allowedAlerts = alerts.slice(0, preferences.max_daily_notifications - dailyCount);
        await this.createSpendingAlerts(allowedAlerts, preferences);
        return allowedAlerts.length;
      }

      // Create all alerts
      await this.createSpendingAlerts(alerts, preferences);
      return alerts.length;
    } catch (error) {
      console.error('Error processing spending alerts:', error);
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
   * Get current spending status for display purposes
   */
  static getSpendingStatus(
    subscriptions: Subscription[],
    budgetData: {
      monthlyBudget?: number;
      yearlyBudget?: number;
      categoryBudgets?: Record<string, number>;
    }
  ): {
    monthly: { spent: number; budget: number; percentage: number; status: 'safe' | 'warning' | 'critical' };
    yearly: { spent: number; budget: number; percentage: number; status: 'safe' | 'warning' | 'critical' };
    categories: Array<{ category: string; spent: number; budget: number; percentage: number; status: 'safe' | 'warning' | 'critical' }>;
  } {
    const spending = this.calculateCurrentSpending(subscriptions);
    
    const getStatus = (percentage: number): 'safe' | 'warning' | 'critical' => {
      if (percentage >= 100) return 'critical';
      if (percentage >= 80) return 'warning';
      return 'safe';
    };

    const monthlyPercentage = budgetData.monthlyBudget ? (spending.monthly / budgetData.monthlyBudget) * 100 : 0;
    const yearlyPercentage = budgetData.yearlyBudget ? (spending.yearly / budgetData.yearlyBudget) * 100 : 0;

    const categories = budgetData.categoryBudgets ? 
      Object.entries(budgetData.categoryBudgets).map(([category, budget]) => {
        const spent = spending.categorySpending[category] || 0;
        const percentage = budget > 0 ? (spent / budget) * 100 : 0;
        return {
          category,
          spent,
          budget,
          percentage,
          status: getStatus(percentage)
        };
      }) : [];

    return {
      monthly: {
        spent: spending.monthly,
        budget: budgetData.monthlyBudget || 0,
        percentage: monthlyPercentage,
        status: getStatus(monthlyPercentage)
      },
      yearly: {
        spent: spending.yearly,
        budget: budgetData.yearlyBudget || 0,
        percentage: yearlyPercentage,
        status: getStatus(yearlyPercentage)
      },
      categories
    };
  }
}
