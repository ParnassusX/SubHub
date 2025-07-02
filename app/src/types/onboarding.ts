// Onboarding Types for SubHub User Experience
export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: string;
  isCompleted: boolean;
  isOptional: boolean;
  order: number;
  estimatedTime: number; // in minutes
  premiumFeature?: boolean;
}

export interface OnboardingProgress {
  userId: string;
  currentStep: string;
  completedSteps: string[];
  startedAt: string;
  completedAt?: string;
  skippedSteps: string[];
  totalSteps: number;
  completedCount: number;
  progressPercentage: number;
  hasSeenPremiumFeatures: boolean;
  conversionOpportunities: string[];
}

export interface OnboardingState {
  isActive: boolean;
  isLoading: boolean;
  currentStep: OnboardingStep | null;
  allSteps: OnboardingStep[];
  progress: OnboardingProgress | null;
  error: string | null;
}

export interface UserOnboardingPreferences {
  id?: string;
  user_id: string;
  onboarding_completed: boolean;
  onboarding_started_at?: string;
  onboarding_completed_at?: string;
  current_step?: string;
  completed_steps: string[];
  skipped_steps: string[];
  has_seen_premium_features: boolean;
  conversion_opportunities_shown: string[];
  preferred_currency?: string;
  preferred_language?: string;
  notification_preferences_set: boolean;
  first_subscription_added: boolean;
  dashboard_tour_completed: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface OnboardingStepProps {
  step: OnboardingStep;
  onNext: () => void;
  onSkip: () => void;
  onBack: () => void;
  isFirst: boolean;
  isLast: boolean;
  progress: OnboardingProgress;
}

export interface ConversionOpportunity {
  id: string;
  title: string;
  description: string;
  feature: string;
  benefit: string;
  ctaText: string;
  ctaAction: () => void;
  priority: 'high' | 'medium' | 'low';
  timing: 'immediate' | 'delayed' | 'contextual';
}

// Predefined onboarding steps
export const ONBOARDING_STEPS: Omit<OnboardingStep, 'isCompleted'>[] = [
  {
    id: 'welcome',
    title: 'Welcome to SubHub',
    description: 'Let\'s get you started with managing your subscriptions',
    component: 'WelcomeStep',
    isOptional: false,
    order: 1,
    estimatedTime: 1
  },
  {
    id: 'profile_setup',
    title: 'Set Up Your Profile',
    description: 'Configure your currency, timezone, and basic preferences',
    component: 'ProfileSetupStep',
    isOptional: false,
    order: 2,
    estimatedTime: 2
  },
  {
    id: 'first_subscription',
    title: 'Add Your First Subscription',
    description: 'Start tracking your subscriptions by adding your first one',
    component: 'FirstSubscriptionStep',
    isOptional: false,
    order: 3,
    estimatedTime: 3
  },
  {
    id: 'notification_setup',
    title: 'Set Up Notifications',
    description: 'Configure how you want to be reminded about renewals',
    component: 'NotificationSetupStep',
    isOptional: true,
    order: 4,
    estimatedTime: 2
  },
  {
    id: 'budget_setup',
    title: 'Set Your Budget',
    description: 'Define spending limits to track your subscription costs',
    component: 'BudgetSetupStep',
    isOptional: true,
    order: 5,
    estimatedTime: 2,
    premiumFeature: true
  },
  {
    id: 'dashboard_tour',
    title: 'Dashboard Tour',
    description: 'Learn about all the features available to you',
    component: 'DashboardTourStep',
    isOptional: true,
    order: 6,
    estimatedTime: 3
  },
  {
    id: 'premium_features',
    title: 'Discover Premium Features',
    description: 'See how SubHub Premium can save you money',
    component: 'PremiumFeaturesStep',
    isOptional: true,
    order: 7,
    estimatedTime: 2,
    premiumFeature: true
  }
];

export const CONVERSION_OPPORTUNITIES: ConversionOpportunity[] = [
  {
    id: 'unlimited_subscriptions',
    title: 'Track Unlimited Subscriptions',
    description: 'Free users can track up to 5 subscriptions. Upgrade for unlimited tracking.',
    feature: 'unlimited_subscriptions',
    benefit: 'Never miss a subscription again',
    ctaText: 'Upgrade to Premium',
    ctaAction: () => { window.location.href = '/pricing'; },
    priority: 'high' as const,
    timing: 'contextual' as const
  },
  {
    id: 'smart_notifications',
    title: 'Smart Notification Scheduling',
    description: 'Get notifications at the perfect time based on your usage patterns.',
    feature: 'smart_scheduling',
    benefit: 'Reduce notification fatigue by 60%',
    ctaText: 'Try Premium Free',
    ctaAction: () => { window.location.href = '/pricing'; },
    priority: 'medium' as const,
    timing: 'delayed' as const
  },
  {
    id: 'unused_detection',
    title: 'Unused Subscription Detection',
    description: 'Automatically detect subscriptions you\'re not using and save money.',
    feature: 'unused_detection',
    benefit: 'Save an average of $127/year',
    ctaText: 'Start Saving',
    ctaAction: () => { window.location.href = '/pricing'; },
    priority: 'high' as const,
    timing: 'contextual' as const
  }
];
