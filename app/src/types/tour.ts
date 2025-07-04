// Tour Types for SubHub Guided Tour System
// Extends existing onboarding infrastructure for post-onboarding feature discovery

export interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector or element ID to highlight
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  isCompleted: boolean;
  isOptional: boolean;
  order: number;
  estimatedTime: number; // in seconds
  category: 'dashboard' | 'subscriptions' | 'analytics' | 'settings' | 'navigation';
  mobilePosition?: 'top' | 'bottom' | 'center'; // Override position for mobile
  content?: {
    highlights?: string[]; // Key points to highlight
    tips?: string[]; // Additional tips
    nextAction?: string; // What user should do next
  };
}

export interface TourProgress {
  userId: string;
  tourType: string;
  currentStep: string;
  completedSteps: string[];
  startedAt: string;
  completedAt?: string;
  skippedSteps: string[];
  totalSteps: number;
  completedCount: number;
  progressPercentage: number;
  lastActiveAt: string;
}

export interface TourState {
  isActive: boolean;
  isLoading: boolean;
  currentStep: TourStep | null;
  allSteps: TourStep[];
  progress: TourProgress | null;
  error: string | null;
  tourType: TourType | null;
}

export interface UserTourPreferences {
  id?: string;
  user_id: string;
  dashboard_tour_completed: boolean;
  dashboard_tour_started_at?: string;
  dashboard_tour_completed_at?: string;
  subscriptions_tour_completed: boolean;
  analytics_tour_completed: boolean;
  settings_tour_completed: boolean;
  feature_discovery_enabled: boolean;
  contextual_help_enabled: boolean;
  tour_preferences: {
    autoStart: boolean;
    showHints: boolean;
    animationSpeed: 'slow' | 'normal' | 'fast';
  };
  created_at?: string;
  updated_at?: string;
}

export interface TourStepProps {
  step: TourStep;
  onNext: () => void;
  onSkip: () => void;
  onBack: () => void;
  onExit: () => void;
  isFirst: boolean;
  isLast: boolean;
  progress: TourProgress;
}

// Predefined tour definitions
export const DASHBOARD_TOUR_STEPS: Omit<TourStep, 'isCompleted'>[] = [
  {
    id: 'dashboard_overview',
    title: 'Welcome to Your Dashboard',
    description: 'Get an overview of your subscription management hub',
    target: '.dashboard-overview',
    position: 'center',
    isOptional: false,
    order: 1,
    estimatedTime: 30,
    category: 'dashboard',
    content: {
      highlights: [
        'View all your subscriptions at a glance',
        'Track spending and upcoming renewals',
        'Access quick actions and insights'
      ],
      nextAction: 'Let\'s explore your subscription overview'
    }
  },
  {
    id: 'subscription_overview',
    title: 'Subscription Overview',
    description: 'See all your active subscriptions and their status',
    target: '.subscription-overview',
    position: 'top',
    mobilePosition: 'bottom',
    isOptional: false,
    order: 2,
    estimatedTime: 45,
    category: 'subscriptions',
    content: {
      highlights: [
        'Active subscription count and total cost',
        'Upcoming renewals and payment dates',
        'Quick add subscription button'
      ],
      tips: [
        'Click on any subscription to view details',
        'Use the + button to add new subscriptions'
      ],
      nextAction: 'Check out your spending analytics'
    }
  },
  {
    id: 'spending_analytics',
    title: 'Spending Analytics',
    description: 'Track your subscription spending patterns and trends',
    target: '.spending-analytics',
    position: 'top',
    mobilePosition: 'bottom',
    isOptional: false,
    order: 3,
    estimatedTime: 60,
    category: 'analytics',
    content: {
      highlights: [
        'Monthly and yearly spending trends',
        'Category-based spending breakdown',
        'Cost optimization insights'
      ],
      tips: [
        'Use filters to analyze specific time periods',
        'Export data for external analysis'
      ],
      nextAction: 'Explore upcoming renewals'
    }
  },
  {
    id: 'upcoming_renewals',
    title: 'Upcoming Renewals',
    description: 'Stay on top of subscription renewals and payments',
    target: '.upcoming-renewals',
    position: 'right',
    mobilePosition: 'top',
    isOptional: false,
    order: 4,
    estimatedTime: 45,
    category: 'subscriptions',
    content: {
      highlights: [
        'Next 30 days renewal schedule',
        'Payment amount and method',
        'Renewal management options'
      ],
      tips: [
        'Set up notifications for upcoming renewals',
        'Cancel or modify subscriptions before renewal'
      ],
      nextAction: 'Learn about quick actions'
    }
  },
  {
    id: 'quick_actions',
    title: 'Quick Actions',
    description: 'Access frequently used features with one click',
    target: '.quick-actions',
    position: 'left',
    mobilePosition: 'center',
    isOptional: false,
    order: 5,
    estimatedTime: 30,
    category: 'navigation',
    content: {
      highlights: [
        'Add new subscription',
        'View all subscriptions',
        'Access settings and reports'
      ],
      tips: [
        'Customize quick actions in settings',
        'Use keyboard shortcuts for faster access'
      ],
      nextAction: 'Complete your dashboard tour'
    }
  }
];

export const TOUR_TYPES = {
  DASHBOARD: 'dashboard',
  SUBSCRIPTIONS: 'subscriptions',
  ANALYTICS: 'analytics',
  SETTINGS: 'settings'
} as const;

export type TourType = typeof TOUR_TYPES[keyof typeof TOUR_TYPES];
