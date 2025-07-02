// Payment System Types for SubHub Monetization
export type UserTier = 'free' | 'premium' | 'family';

export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing';

export interface UserSubscription {
  id: string;
  user_id: string;
  stripe_subscription_id?: string;
  stripe_customer_id?: string;
  plan_id: string;
  status: SubscriptionStatus;
  current_period_start: string;
  current_period_end: string;
  trial_start?: string;
  trial_end?: string;
  canceled_at?: string;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  tier: UserTier;
  price_monthly: number;
  price_yearly: number;
  stripe_price_id_monthly?: string;
  stripe_price_id_yearly?: string;
  features: PlanFeature[];
  limits: PlanLimits;
  is_popular?: boolean;
  trial_days?: number;
  created_at: string;
  updated_at: string;
}

export interface PlanFeature {
  id: string;
  name: string;
  description: string;
  included: boolean;
  limit?: number;
}

export interface PlanLimits {
  max_subscriptions: number;
  max_family_members?: number;
  advanced_analytics: boolean;
  smart_scheduling: boolean;
  export_functionality: boolean;
  priority_support: boolean;
  custom_categories: boolean;
  budget_alerts: boolean;
  unused_detection: boolean;
}

export interface FeatureAccessResult {
  hasAccess: boolean;
  reason?: 'tier_required' | 'limit_exceeded' | 'feature_disabled';
  required_tier?: UserTier;
  current_usage?: number;
  limit?: number;
  upgrade_url?: string;
}

export interface CreateSubscriptionRequest {
  plan_id: string;
  payment_method_id: string;
  billing_interval: 'monthly' | 'yearly';
  trial_days?: number;
}

export interface CreateSubscriptionResponse {
  subscription: UserSubscription;
  client_secret?: string;
  requires_action?: boolean;
}

export interface UpgradeFlowData {
  current_tier: UserTier;
  target_tier: UserTier;
  current_plan?: SubscriptionPlan;
  target_plan: SubscriptionPlan;
  billing_interval: 'monthly' | 'yearly';
  proration_amount?: number;
  trial_eligible?: boolean;
}

export interface PricingCalculation {
  plan: SubscriptionPlan;
  billing_interval: 'monthly' | 'yearly';
  base_price: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  savings_vs_monthly?: number;
  trial_days?: number;
}

// Default plan configurations
export const DEFAULT_PLANS: Omit<SubscriptionPlan, 'id' | 'created_at' | 'updated_at'>[] = [
  {
    name: 'Free',
    tier: 'free',
    price_monthly: 0,
    price_yearly: 0,
    features: [
      { id: 'basic_tracking', name: 'Basic Subscription Tracking', description: 'Track up to 5 subscriptions', included: true, limit: 5 },
      { id: 'renewal_reminders', name: 'Renewal Reminders', description: 'Get notified before renewals', included: true },
      { id: 'spending_overview', name: 'Spending Overview', description: 'Basic spending insights', included: true },
    ],
    limits: {
      max_subscriptions: 5,
      advanced_analytics: false,
      smart_scheduling: false,
      export_functionality: false,
      priority_support: false,
      custom_categories: false,
      budget_alerts: false,
      unused_detection: false,
    },
  },
  {
    name: 'Premium',
    tier: 'premium',
    price_monthly: 4.99,
    price_yearly: 49.99,
    is_popular: true,
    trial_days: 14,
    features: [
      { id: 'unlimited_tracking', name: 'Unlimited Subscriptions', description: 'Track unlimited subscriptions', included: true },
      { id: 'smart_scheduling', name: 'Smart Notification Scheduling', description: 'Intelligent notification timing', included: true },
      { id: 'advanced_analytics', name: 'Advanced Analytics', description: 'Detailed spending insights and trends', included: true },
      { id: 'unused_detection', name: 'Unused Subscription Detection', description: 'Automatically find unused subscriptions', included: true },
      { id: 'budget_alerts', name: 'Budget Threshold Alerts', description: 'Get alerted when approaching budget limits', included: true },
      { id: 'export_data', name: 'Export Functionality', description: 'Export your data in multiple formats', included: true },
    ],
    limits: {
      max_subscriptions: -1, // Unlimited
      advanced_analytics: true,
      smart_scheduling: true,
      export_functionality: true,
      priority_support: false,
      custom_categories: true,
      budget_alerts: true,
      unused_detection: true,
    },
  },
  {
    name: 'Family',
    tier: 'family',
    price_monthly: 9.99,
    price_yearly: 99.99,
    trial_days: 14,
    features: [
      { id: 'family_sharing', name: 'Family Sharing', description: 'Share with up to 5 family members', included: true, limit: 5 },
      { id: 'admin_controls', name: 'Admin Controls', description: 'Manage family member permissions', included: true },
      { id: 'consolidated_reporting', name: 'Consolidated Reporting', description: 'View family-wide spending reports', included: true },
      { id: 'priority_support', name: 'Priority Support', description: '24/7 priority customer support', included: true },
    ],
    limits: {
      max_subscriptions: -1, // Unlimited
      max_family_members: 5,
      advanced_analytics: true,
      smart_scheduling: true,
      export_functionality: true,
      priority_support: true,
      custom_categories: true,
      budget_alerts: true,
      unused_detection: true,
    },
  },
];
