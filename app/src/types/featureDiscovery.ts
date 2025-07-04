// Feature Discovery Types for SubHub Progressive Feature Introduction
// Enables contextual feature highlighting and progressive disclosure

export interface FeatureHighlight {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector for the feature to highlight
  category: 'new' | 'advanced' | 'tip' | 'update';
  priority: 'low' | 'medium' | 'high';
  trigger: 'page_load' | 'user_action' | 'time_based' | 'manual';
  conditions?: {
    minSubscriptions?: number;
    userLevel?: 'beginner' | 'intermediate' | 'advanced';
    featureUsage?: string[]; // Features user has already used
    timeOnPlatform?: number; // Days since registration
  };
  content: {
    headline: string;
    benefits: string[];
    callToAction: string;
    learnMoreUrl?: string;
  };
  display: {
    position: 'top' | 'bottom' | 'left' | 'right' | 'center';
    mobilePosition?: 'top' | 'bottom' | 'center';
    showDuration?: number; // Auto-hide after X seconds
    dismissible: boolean;
    showOnce: boolean; // Only show once per user
  };
  analytics?: {
    shown: number;
    clicked: number;
    dismissed: number;
  };
}

export interface FeatureDiscoveryState {
  isActive: boolean;
  currentHighlight: FeatureHighlight | null;
  queuedHighlights: FeatureHighlight[];
  shownHighlights: string[];
  dismissedHighlights: string[];
  userPreferences: {
    enableDiscovery: boolean;
    frequency: 'minimal' | 'normal' | 'frequent';
    categories: string[];
  };
}

export interface UserFeatureProgress {
  id?: string;
  user_id: string;
  features_discovered: string[];
  features_dismissed: string[];
  discovery_enabled: boolean;
  discovery_frequency: 'minimal' | 'normal' | 'frequent';
  last_discovery_shown?: string;
  discovery_preferences: {
    showNewFeatures: boolean;
    showAdvancedTips: boolean;
    showUpdates: boolean;
    autoHide: boolean;
  };
  created_at?: string;
  updated_at?: string;
}

// Predefined feature highlights
export const FEATURE_HIGHLIGHTS: FeatureHighlight[] = [
  {
    id: 'advanced_analytics',
    title: 'Advanced Analytics',
    description: 'Discover detailed spending insights and trends',
    target: '.spending-analytics',
    category: 'advanced',
    priority: 'medium',
    trigger: 'user_action',
    conditions: {
      minSubscriptions: 3,
      userLevel: 'intermediate',
      timeOnPlatform: 7
    },
    content: {
      headline: 'Unlock Advanced Analytics',
      benefits: [
        'Track spending trends over time',
        'Identify cost optimization opportunities',
        'Compare spending across categories',
        'Export data for external analysis'
      ],
      callToAction: 'Explore Analytics',
      learnMoreUrl: '/reports'
    },
    display: {
      position: 'right',
      mobilePosition: 'bottom',
      showDuration: 10000,
      dismissible: true,
      showOnce: true
    }
  },
  {
    id: 'bulk_subscription_management',
    title: 'Bulk Management',
    description: 'Manage multiple subscriptions at once',
    target: '.subscription-overview',
    category: 'tip',
    priority: 'low',
    trigger: 'user_action',
    conditions: {
      minSubscriptions: 5,
      userLevel: 'intermediate'
    },
    content: {
      headline: 'Pro Tip: Bulk Management',
      benefits: [
        'Select multiple subscriptions',
        'Update categories in bulk',
        'Export subscription data',
        'Set bulk notifications'
      ],
      callToAction: 'Try Bulk Actions',
      learnMoreUrl: '/subscriptions'
    },
    display: {
      position: 'top',
      mobilePosition: 'bottom',
      showDuration: 8000,
      dismissible: true,
      showOnce: false
    }
  },
  {
    id: 'smart_notifications',
    title: 'Smart Notifications',
    description: 'Set up intelligent renewal reminders',
    target: '.upcoming-renewals',
    category: 'new',
    priority: 'high',
    trigger: 'page_load',
    conditions: {
      minSubscriptions: 2,
      userLevel: 'beginner'
    },
    content: {
      headline: 'Never Miss a Renewal',
      benefits: [
        'Customizable reminder timing',
        'Email and in-app notifications',
        'Price change alerts',
        'Cancellation reminders'
      ],
      callToAction: 'Set Up Notifications',
      learnMoreUrl: '/settings'
    },
    display: {
      position: 'left',
      mobilePosition: 'top',
      showDuration: 12000,
      dismissible: true,
      showOnce: true
    }
  },
  {
    id: 'quick_add_subscription',
    title: 'Quick Add',
    description: 'Add subscriptions faster with smart suggestions',
    target: '.quick-actions',
    category: 'tip',
    priority: 'medium',
    trigger: 'user_action',
    conditions: {
      userLevel: 'beginner',
      timeOnPlatform: 1
    },
    content: {
      headline: 'Quick Add Subscriptions',
      benefits: [
        'Auto-detect subscription details',
        'Smart category suggestions',
        'Popular service templates',
        'Bulk import from email'
      ],
      callToAction: 'Add Subscription',
      learnMoreUrl: '/subscriptions?action=add'
    },
    display: {
      position: 'bottom',
      mobilePosition: 'center',
      showDuration: 6000,
      dismissible: true,
      showOnce: false
    }
  },
  {
    id: 'budget_tracking',
    title: 'Budget Tracking',
    description: 'Set spending limits and track your budget',
    target: '.subscription-overview',
    category: 'advanced',
    priority: 'high',
    trigger: 'user_action',
    conditions: {
      minSubscriptions: 3,
      userLevel: 'intermediate'
    },
    content: {
      headline: 'Take Control of Your Budget',
      benefits: [
        'Set monthly spending limits',
        'Track budget utilization',
        'Get overspending alerts',
        'Optimize subscription costs'
      ],
      callToAction: 'Set Budget',
      learnMoreUrl: '/settings'
    },
    display: {
      position: 'center',
      mobilePosition: 'center',
      showDuration: 10000,
      dismissible: true,
      showOnce: true
    }
  }
];

export const DISCOVERY_CATEGORIES = {
  NEW: 'new',
  ADVANCED: 'advanced',
  TIP: 'tip',
  UPDATE: 'update'
} as const;

export type DiscoveryCategory = typeof DISCOVERY_CATEGORIES[keyof typeof DISCOVERY_CATEGORIES];
