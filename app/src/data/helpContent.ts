// Help Content Database for SubHub Contextual Help System
// Centralized help content for tooltips and contextual assistance

export interface HelpContent {
  id: string;
  title: string;
  content: string;
  category: 'dashboard' | 'subscriptions' | 'analytics' | 'settings' | 'general';
  variant?: 'default' | 'info' | 'warning' | 'success';
  learnMoreUrl?: string;
  keywords: string[];
}

export const HELP_CONTENT: Record<string, HelpContent> = {
  // Dashboard Help Content
  dashboard_overview: {
    id: 'dashboard_overview',
    title: 'Dashboard Overview',
    content: 'Your dashboard provides a comprehensive view of all your subscriptions, spending patterns, and upcoming renewals. Use this central hub to monitor your subscription health and make informed decisions.',
    category: 'dashboard',
    variant: 'info',
    learnMoreUrl: '/help/dashboard',
    keywords: ['dashboard', 'overview', 'subscriptions', 'spending']
  },

  subscription_count: {
    id: 'subscription_count',
    title: 'Active Subscriptions',
    content: 'This shows the total number of active subscriptions you\'re currently tracking. Click to view detailed information about each subscription.',
    category: 'dashboard',
    variant: 'default',
    keywords: ['subscriptions', 'count', 'active', 'total']
  },

  monthly_spending: {
    id: 'monthly_spending',
    title: 'Monthly Spending',
    content: 'Your total monthly subscription costs. This includes all recurring charges that occur monthly, calculated from your active subscriptions.',
    category: 'dashboard',
    variant: 'info',
    keywords: ['spending', 'monthly', 'cost', 'budget']
  },

  yearly_spending: {
    id: 'yearly_spending',
    title: 'Yearly Spending',
    content: 'Your projected annual subscription costs based on current subscriptions. This helps you understand your long-term financial commitment.',
    category: 'dashboard',
    variant: 'info',
    keywords: ['spending', 'yearly', 'annual', 'projection']
  },

  upcoming_renewals: {
    id: 'upcoming_renewals',
    title: 'Upcoming Renewals',
    content: 'Subscriptions that will renew in the next 30 days. Stay on top of upcoming charges and cancel unwanted subscriptions before they renew.',
    category: 'dashboard',
    variant: 'warning',
    learnMoreUrl: '/help/renewals',
    keywords: ['renewals', 'upcoming', 'charges', 'cancel']
  },

  budget_status: {
    id: 'budget_status',
    title: 'Budget Status',
    content: 'Track your spending against your monthly budget. Green indicates you\'re within budget, yellow means you\'re approaching your limit, and red indicates you\'ve exceeded your budget.',
    category: 'dashboard',
    variant: 'info',
    keywords: ['budget', 'status', 'spending', 'limit']
  },

  spending_analytics: {
    id: 'spending_analytics',
    title: 'Spending Analytics',
    content: 'Detailed analysis of your subscription spending patterns, trends, and category breakdowns. Use these insights to optimize your subscription portfolio.',
    category: 'analytics',
    variant: 'info',
    learnMoreUrl: '/help/analytics',
    keywords: ['analytics', 'spending', 'trends', 'insights']
  },

  // Subscription Management Help Content
  add_subscription: {
    id: 'add_subscription',
    title: 'Add New Subscription',
    content: 'Quickly add a new subscription to track. You can enter details manually or use our smart detection to automatically fill in common subscription information.',
    category: 'subscriptions',
    variant: 'success',
    learnMoreUrl: '/help/add-subscription',
    keywords: ['add', 'subscription', 'new', 'track']
  },

  subscription_categories: {
    id: 'subscription_categories',
    title: 'Subscription Categories',
    content: 'Organize your subscriptions by category (Entertainment, Productivity, etc.) to better understand your spending patterns and identify optimization opportunities.',
    category: 'subscriptions',
    variant: 'info',
    keywords: ['categories', 'organize', 'entertainment', 'productivity']
  },

  renewal_notifications: {
    id: 'renewal_notifications',
    title: 'Renewal Notifications',
    content: 'Set up custom notifications to remind you before subscriptions renew. Choose how many days in advance you want to be notified.',
    category: 'subscriptions',
    variant: 'info',
    learnMoreUrl: '/help/notifications',
    keywords: ['notifications', 'renewal', 'reminders', 'alerts']
  },

  // Analytics Help Content
  spending_trends: {
    id: 'spending_trends',
    title: 'Spending Trends',
    content: 'Visualize how your subscription spending has changed over time. Identify patterns and seasonal variations in your subscription costs.',
    category: 'analytics',
    variant: 'info',
    keywords: ['trends', 'spending', 'patterns', 'time']
  },

  category_analysis: {
    id: 'category_analysis',
    title: 'Category Analysis',
    content: 'See how much you spend in each subscription category. This helps identify which types of services consume most of your budget.',
    category: 'analytics',
    variant: 'info',
    keywords: ['category', 'analysis', 'breakdown', 'budget']
  },

  cost_optimization: {
    id: 'cost_optimization',
    title: 'Cost Optimization',
    content: 'Get personalized recommendations to reduce your subscription costs. We analyze your usage patterns and suggest potential savings.',
    category: 'analytics',
    variant: 'success',
    learnMoreUrl: '/help/optimization',
    keywords: ['optimization', 'savings', 'recommendations', 'cost']
  },

  // Settings Help Content
  currency_settings: {
    id: 'currency_settings',
    title: 'Currency Settings',
    content: 'Set your preferred currency for displaying subscription costs. All amounts will be converted and displayed in your chosen currency.',
    category: 'settings',
    variant: 'info',
    keywords: ['currency', 'settings', 'display', 'conversion']
  },

  notification_preferences: {
    id: 'notification_preferences',
    title: 'Notification Preferences',
    content: 'Customize how and when you receive notifications about renewals, price changes, and other subscription events.',
    category: 'settings',
    variant: 'info',
    keywords: ['notifications', 'preferences', 'renewals', 'alerts']
  },

  data_export: {
    id: 'data_export',
    title: 'Data Export',
    content: 'Export your subscription data in various formats (CSV, PDF) for external analysis or record keeping.',
    category: 'settings',
    variant: 'info',
    learnMoreUrl: '/help/export',
    keywords: ['export', 'data', 'csv', 'pdf']
  },

  // General Help Content
  getting_started: {
    id: 'getting_started',
    title: 'Getting Started',
    content: 'New to SubHub? Start by adding your first subscription, then explore the dashboard to see your spending insights and upcoming renewals.',
    category: 'general',
    variant: 'success',
    learnMoreUrl: '/help/getting-started',
    keywords: ['getting started', 'new', 'first', 'tutorial']
  },

  privacy_security: {
    id: 'privacy_security',
    title: 'Privacy & Security',
    content: 'Your subscription data is encrypted and stored securely. We never store payment information or access your actual subscription accounts.',
    category: 'general',
    variant: 'info',
    learnMoreUrl: '/help/privacy',
    keywords: ['privacy', 'security', 'encryption', 'data']
  },

  mobile_app: {
    id: 'mobile_app',
    title: 'Mobile Experience',
    content: 'SubHub works great on mobile devices. Add it to your home screen for quick access to your subscription information on the go.',
    category: 'general',
    variant: 'info',
    keywords: ['mobile', 'app', 'home screen', 'pwa']
  }
};

// Helper functions for help content management
export class HelpContentManager {
  /**
   * Get help content by ID
   */
  static getContent(id: string): HelpContent | null {
    return HELP_CONTENT[id] || null;
  }

  /**
   * Search help content by keywords
   */
  static searchContent(query: string): HelpContent[] {
    const searchTerm = query.toLowerCase();
    return Object.values(HELP_CONTENT).filter(content =>
      content.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm)) ||
      content.title.toLowerCase().includes(searchTerm) ||
      content.content.toLowerCase().includes(searchTerm)
    );
  }

  /**
   * Get content by category
   */
  static getContentByCategory(category: HelpContent['category']): HelpContent[] {
    return Object.values(HELP_CONTENT).filter(content => content.category === category);
  }

  /**
   * Get random tip
   */
  static getRandomTip(): HelpContent {
    const allContent = Object.values(HELP_CONTENT);
    const randomIndex = Math.floor(Math.random() * allContent.length);
    return allContent[randomIndex];
  }
}
