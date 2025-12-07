// Premium Features Service
// Manages feature gates, subscription tiers, and monetization

export type SubscriptionTier = 'free' | 'premium' | 'enterprise';

export interface PremiumFeature {
  id: string;
  name: string;
  description: string;
  requiredTier: SubscriptionTier;
  icon: string;
  category: 'analytics' | 'integrations' | 'notifications' | 'insights' | 'storage';
}

export interface SubscriptionPlan {
  id: SubscriptionTier;
  name: string;
  price: number; // Monthly price in USD
  yearlyPrice: number; // Yearly price (with discount)
  currency: string;
  features: string[];
  limits: {
    subscriptions: number;
    categories: number;
    exports: number;
    emailNotifications: number;
  };
  popular?: boolean;
}

/**
 * Premium Features Service
 * Handles feature gating and tier management
 */
export class PremiumFeaturesService {
  // Define all premium features
  private static readonly PREMIUM_FEATURES: PremiumFeature[] = [
    // Analytics Features
    {
      id: 'advanced_analytics',
      name: 'Advanced Analytics',
      description: 'Detailed spending trends, forecasts, and custom reports',
      requiredTier: 'premium',
      icon: '📊',
      category: 'analytics'
    },
    {
      id: 'ai_insights',
      name: 'AI-Powered Insights',
      description: 'Smart suggestions to optimize and save on subscriptions',
      requiredTier: 'free', // Available to all for now
      icon: '🤖',
      category: 'insights'
    },
    {
      id: 'custom_reports',
      name: 'Custom Reports',
      description: 'Create and export custom subscription reports',
      requiredTier: 'premium',
      icon: '📋',
      category: 'analytics'
    },
    
    // Integration Features
    {
      id: 'bank_sync',
      name: 'Bank Account Sync',
      description: 'Automatically detect subscriptions from your bank',
      requiredTier: 'premium',
      icon: '🏦',
      category: 'integrations'
    },
    {
      id: 'calendar_sync',
      name: 'Calendar Integration',
      description: 'Sync renewal dates to Google/Apple Calendar',
      requiredTier: 'premium',
      icon: '📅',
      category: 'integrations'
    },
    {
      id: 'email_scanning',
      name: 'Email Scanning',
      description: 'Auto-import subscriptions from confirmation emails',
      requiredTier: 'premium',
      icon: '📧',
      category: 'integrations'
    },
    
    // Notification Features
    {
      id: 'unlimited_email_notifications',
      name: 'Unlimited Email Notifications',
      description: 'No limits on email alerts and reminders',
      requiredTier: 'premium',
      icon: '📬',
      category: 'notifications'
    },
    {
      id: 'push_notifications',
      name: 'Push Notifications',
      description: 'Real-time mobile and desktop push alerts',
      requiredTier: 'premium',
      icon: '🔔',
      category: 'notifications'
    },
    {
      id: 'sms_notifications',
      name: 'SMS Notifications',
      description: 'Text message alerts for important renewals',
      requiredTier: 'enterprise',
      icon: '💬',
      category: 'notifications'
    },
    
    // Storage & Data Features
    {
      id: 'unlimited_subscriptions',
      name: 'Unlimited Subscriptions',
      description: 'Track unlimited subscription services',
      requiredTier: 'premium',
      icon: '∞',
      category: 'storage'
    },
    {
      id: 'unlimited_exports',
      name: 'Unlimited Exports',
      description: 'Export data anytime in CSV, JSON, or PDF',
      requiredTier: 'premium',
      icon: '📤',
      category: 'storage'
    },
    {
      id: 'data_backup',
      name: 'Automatic Backups',
      description: 'Daily automatic backups of your data',
      requiredTier: 'premium',
      icon: '💾',
      category: 'storage'
    },
    
    // Collaboration Features
    {
      id: 'family_sharing',
      name: 'Family Sharing',
      description: 'Share subscriptions with up to 5 family members',
      requiredTier: 'premium',
      icon: '👨‍👩‍👧‍👦',
      category: 'integrations'
    },
    {
      id: 'team_accounts',
      name: 'Team Accounts',
      description: 'Manage subscriptions for your business or team',
      requiredTier: 'enterprise',
      icon: '👔',
      category: 'integrations'
    }
  ];

  // Define subscription plans
  private static readonly SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      yearlyPrice: 0,
      currency: 'USD',
      features: [
        'Track up to 25 subscriptions',
        'Basic analytics and insights',
        'AI-powered optimization suggestions',
        'Service logo auto-fetching',
        'Manual data entry',
        '3 exports per month',
        'Email notifications (5/month)'
      ],
      limits: {
        subscriptions: 25,
        categories: 10,
        exports: 3,
        emailNotifications: 5
      }
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 4.99,
      yearlyPrice: 49.99, // ~2 months free
      currency: 'USD',
      features: [
        'Everything in Free',
        'Unlimited subscriptions',
        'Advanced analytics & reports',
        'Bank account integration',
        'Calendar sync (Google/Apple)',
        'Email scanning',
        'Unlimited exports (CSV/JSON/PDF)',
        'Unlimited email notifications',
        'Push notifications',
        'Family sharing (up to 5 members)',
        'Priority support',
        'No ads'
      ],
      limits: {
        subscriptions: -1, // Unlimited
        categories: -1,
        exports: -1,
        emailNotifications: -1
      },
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 9.99,
      yearlyPrice: 99.99,
      currency: 'USD',
      features: [
        'Everything in Premium',
        'Team accounts (up to 20 users)',
        'SMS notifications',
        'Advanced security features',
        'Custom branding',
        'API access',
        'Dedicated account manager',
        'SLA guarantee',
        'Custom integrations',
        'Advanced permissions'
      ],
      limits: {
        subscriptions: -1,
        categories: -1,
        exports: -1,
        emailNotifications: -1
      }
    }
  ];

  /**
   * Check if user has access to a feature
   */
  static hasFeatureAccess(featureId: string, userTier: SubscriptionTier): boolean {
    const feature = this.PREMIUM_FEATURES.find(f => f.id === featureId);
    if (!feature) return false;

    return this.tierHasAccess(userTier, feature.requiredTier);
  }

  /**
   * Check if a tier has access to a required tier level
   */
  private static tierHasAccess(userTier: SubscriptionTier, requiredTier: SubscriptionTier): boolean {
    const tierHierarchy: Record<SubscriptionTier, number> = {
      free: 0,
      premium: 1,
      enterprise: 2
    };

    return tierHierarchy[userTier] >= tierHierarchy[requiredTier];
  }

  /**
   * Get all features for a tier
   */
  static getFeaturesForTier(tier: SubscriptionTier): PremiumFeature[] {
    return this.PREMIUM_FEATURES.filter(feature => 
      this.tierHasAccess(tier, feature.requiredTier)
    );
  }

  /**
   * Get subscription plans
   */
  static getPlans(): SubscriptionPlan[] {
    return this.SUBSCRIPTION_PLANS;
  }

  /**
   * Get a specific plan
   */
  static getPlan(tier: SubscriptionTier): SubscriptionPlan | undefined {
    return this.SUBSCRIPTION_PLANS.find(plan => plan.id === tier);
  }

  /**
   * Calculate savings for yearly plan
   */
  static calculateYearlySavings(tier: SubscriptionTier): number {
    const plan = this.getPlan(tier);
    if (!plan) return 0;

    const monthlyTotal = plan.price * 12;
    const yearlySavings = monthlyTotal - plan.yearlyPrice;
    return yearlySavings;
  }

  /**
   * Get feature by ID
   */
  static getFeature(featureId: string): PremiumFeature | undefined {
    return this.PREMIUM_FEATURES.find(f => f.id === featureId);
  }

  /**
   * Check if user is within limits
   */
  static isWithinLimits(
    userTier: SubscriptionTier,
    limitType: keyof SubscriptionPlan['limits'],
    currentValue: number
  ): boolean {
    const plan = this.getPlan(userTier);
    if (!plan) return false;

    const limit = plan.limits[limitType];
    if (limit === -1) return true; // Unlimited
    
    return currentValue < limit;
  }

  /**
   * Get remaining quota for a limit
   */
  static getRemainingQuota(
    userTier: SubscriptionTier,
    limitType: keyof SubscriptionPlan['limits'],
    currentValue: number
  ): number {
    const plan = this.getPlan(userTier);
    if (!plan) return 0;

    const limit = plan.limits[limitType];
    if (limit === -1) return Infinity; // Unlimited
    
    return Math.max(0, limit - currentValue);
  }

  /**
   * Get upgrade message for a feature
   */
  static getUpgradeMessage(featureId: string, userTier: SubscriptionTier): string | null {
    const feature = this.getFeature(featureId);
    if (!feature) return null;

    if (this.hasFeatureAccess(featureId, userTier)) {
      return null; // Already has access
    }

    const requiredPlan = this.getPlan(feature.requiredTier);
    if (!requiredPlan) return null;

    return `Upgrade to ${requiredPlan.name} ($${requiredPlan.price}/month) to unlock ${feature.name}`;
  }

  /**
   * Get comparison between tiers
   */
  static getUpgradeComparison(fromTier: SubscriptionTier, toTier: SubscriptionTier): {
    additionalFeatures: PremiumFeature[];
    priceDifference: number;
  } {
    const fromFeatures = new Set(this.getFeaturesForTier(fromTier).map(f => f.id));
    const toFeatures = this.getFeaturesForTier(toTier);
    
    const additionalFeatures = toFeatures.filter(f => !fromFeatures.has(f.id));
    
    const fromPlan = this.getPlan(fromTier);
    const toPlan = this.getPlan(toTier);
    const priceDifference = (toPlan?.price || 0) - (fromPlan?.price || 0);

    return {
      additionalFeatures,
      priceDifference
    };
  }
}
