// Notification System Types for Phase 2.1: Intelligent Notification System

export interface NotificationPreferences {
  id: string;
  user_id: string;
  renewal_reminder_enabled: boolean;
  renewal_reminder_days: number[];
  spending_threshold_enabled: boolean;
  spending_threshold_amount?: number;
  spending_threshold_percentage: number;
  unused_subscription_enabled: boolean;
  unused_subscription_days: number;
  price_change_enabled: boolean;
  email_notifications_enabled: boolean;
  push_notifications_enabled: boolean;
  in_app_notifications_enabled: boolean;
  quiet_hours_enabled: boolean;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  max_daily_notifications: number;
  created_at?: string;
  updated_at?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  subscription_id?: string;
  is_read: boolean;
  created_at?: string;
  updated_at?: string;
}

export type NotificationType = 
  | 'renewal_reminder'
  | 'spending_threshold'
  | 'unused_subscription'
  | 'price_change'
  | 'budget_exceeded'
  | 'budget_warning'
  | 'system';

export interface NotificationRule {
  id: string;
  type: NotificationType;
  enabled: boolean;
  conditions: Record<string, any>;
  actions: NotificationAction[];
}

export interface NotificationAction {
  type: 'email' | 'push' | 'in_app';
  template: string;
  delay?: number; // in minutes
}

export interface RenewalReminder {
  subscription_id: string;
  subscription_name: string;
  renewal_date: string;
  cost: number;
  days_until_renewal: number;
  reminder_type: 'early' | 'medium' | 'urgent';
}

export interface SpendingAlert {
  type: 'monthly' | 'yearly' | 'category';
  current_amount: number;
  budget_amount: number;
  percentage_used: number;
  category?: string;
  severity: 'warning' | 'critical';
}

export interface UnusedSubscription {
  subscription_id: string;
  subscription_name: string;
  subscription_cost: number;
  subscription_frequency: string;
  days_since_last_activity: number;
  threshold_days: number;
  severity: 'warning' | 'critical';
  potential_savings: number;
}

export interface UnusedSubscriptionAlert {
  subscription_id: string;
  subscription_name: string;
  last_activity_date?: string;
  days_inactive: number;
  monthly_cost: number;
  potential_savings: number;
}

export interface PriceChangeAlert {
  subscription_id: string;
  subscription_name: string;
  old_price: number;
  new_price: number;
  change_percentage: number;
  effective_date: string;
}

export interface NotificationContext {
  notifications: Notification[];
  unreadCount: number;
  preferences: NotificationPreferences | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  updatePreferences: (preferences: Partial<NotificationPreferences>) => Promise<void>;
  refreshNotifications: () => Promise<void>;
  
  // Notification creation
  createRenewalReminder: (reminder: RenewalReminder) => Promise<void>;
  createSpendingAlert: (alert: SpendingAlert) => Promise<void>;
  createUnusedSubscriptionAlert: (alert: UnusedSubscriptionAlert) => Promise<void>;
  createPriceChangeAlert: (alert: PriceChangeAlert) => Promise<void>;
}

export interface NotificationSettings {
  renewalReminders: {
    enabled: boolean;
    days: number[];
  };
  spendingThresholds: {
    enabled: boolean;
    amount?: number;
    percentage: number;
  };
  unusedSubscriptions: {
    enabled: boolean;
    days: number;
  };
  priceChanges: {
    enabled: boolean;
  };
  delivery: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
  quietHours: {
    enabled: boolean;
    start?: string;
    end?: string;
  };
  limits: {
    maxDaily: number;
  };
}

// Utility types for notification templates
export interface NotificationTemplate {
  type: NotificationType;
  title: string;
  message: string;
  variables: string[];
}

export interface NotificationSchedule {
  id: string;
  user_id: string;
  notification_type: NotificationType;
  scheduled_for: string;
  data: Record<string, any>;
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  created_at: string;
}
