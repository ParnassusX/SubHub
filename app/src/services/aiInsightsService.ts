// AI-Powered Subscription Insights Service
// Provides intelligent suggestions to help users optimize their subscriptions
// Uses rule-based logic (no external AI API needed for now)

import { Subscription } from '../contexts/SubscriptionContext';

export interface AIInsight {
  id: string;
  type: 'cost_saving' | 'duplicate' | 'unused' | 'optimization' | 'bundle';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  potentialSavings?: number;
  subscriptionIds: string[];
  action?: string;
  icon: string;
}

export class AIInsightsService {
  /**
   * Generate AI insights for a user's subscriptions
   */
  static generateInsights(subscriptions: Subscription[]): AIInsight[] {
    const insights: AIInsight[] = [];

    // 1. Detect duplicate services
    insights.push(...this.detectDuplicates(subscriptions));

    // 2. Find potential bundle opportunities
    insights.push(...this.findBundleOpportunities(subscriptions));

    // 3. Identify expensive subscriptions
    insights.push(...this.identifyExpensiveSubscriptions(subscriptions));

    // 4. Suggest annual billing savings
    insights.push(...this.suggestAnnualBilling(subscriptions));

    // 5. Detect similar services
    insights.push(...this.detectSimilarServices(subscriptions));

    // Sort by priority and potential savings
    return insights.sort((a, b) => {
      const priorityScore = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityScore[b.priority] - priorityScore[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      return (b.potentialSavings || 0) - (a.potentialSavings || 0);
    });
  }

  /**
   * Detect duplicate or similar services
   */
  private static detectDuplicates(subscriptions: Subscription[]): AIInsight[] {
    const insights: AIInsight[] = [];
    const services = new Map<string, Subscription[]>();

    // Group by service name (case insensitive, fuzzy match)
    subscriptions.forEach(sub => {
      const normalizedName = sub.name.toLowerCase().trim();
      const existing = Array.from(services.keys()).find(key => 
        this.areSimilar(key, normalizedName)
      );
      
      if (existing) {
        services.get(existing)!.push(sub);
      } else {
        services.set(normalizedName, [sub]);
      }
    });

    // Find duplicates
    services.forEach((subs, name) => {
      if (subs.length > 1) {
        const totalCost = subs.reduce((sum, s) => sum + s.cost, 0);
        const cheapest = subs.reduce((min, s) => s.cost < min.cost ? s : min);
        const savings = totalCost - cheapest.cost;

        insights.push({
          id: `duplicate-${name}`,
          type: 'duplicate',
          priority: 'high',
          title: `Duplicate ${subs[0].name} Subscriptions Detected`,
          description: `You have ${subs.length} subscriptions to ${subs[0].name}. Consider keeping only one to save ${savings.toFixed(2)}/month.`,
          potentialSavings: savings,
          subscriptionIds: subs.map(s => s.id),
          action: 'Review and cancel duplicates',
          icon: '🔄'
        });
      }
    });

    return insights;
  }

  /**
   * Find bundle opportunities (e.g., Apple One, Microsoft 365 Family)
   */
  private static findBundleOpportunities(subscriptions: Subscription[]): AIInsight[] {
    const insights: AIInsight[] = [];

    // Apple bundle detection
    const appleServices = ['apple music', 'apple tv', 'icloud', 'apple arcade', 'apple tv+'];
    const userAppleServices = subscriptions.filter(sub =>
      appleServices.some(service => sub.name.toLowerCase().includes(service))
    );

    if (userAppleServices.length >= 2) {
      const totalCost = userAppleServices.reduce((sum, s) => sum + s.cost, 0);
      const bundleCost = 16.95; // Apple One Individual
      const savings = totalCost - bundleCost;

      if (savings > 0) {
        insights.push({
          id: 'bundle-apple-one',
          type: 'bundle',
          priority: 'high',
          title: 'Apple One Bundle Could Save You Money',
          description: `You're subscribed to ${userAppleServices.length} Apple services. Apple One bundles them for less.`,
          potentialSavings: savings,
          subscriptionIds: userAppleServices.map(s => s.id),
          action: 'Consider Apple One',
          icon: '🍎'
        });
      }
    }

    // Microsoft bundle detection
    const microsoftServices = ['microsoft 365', 'office 365', 'xbox game pass', 'xbox live'];
    const userMicrosoftServices = subscriptions.filter(sub =>
      microsoftServices.some(service => sub.name.toLowerCase().includes(service))
    );

    if (userMicrosoftServices.length >= 2) {
      insights.push({
        id: 'bundle-microsoft',
        type: 'bundle',
        priority: 'medium',
        title: 'Microsoft 365 Family Could Include More',
        description: `Consider Microsoft 365 Family to get Office apps, OneDrive, and more for your household.`,
        potentialSavings: 5,
        subscriptionIds: userMicrosoftServices.map(s => s.id),
        action: 'Review Microsoft bundles',
        icon: '💼'
      });
    }

    return insights;
  }

  /**
   * Identify expensive subscriptions that might have alternatives
   */
  private static identifyExpensiveSubscriptions(subscriptions: Subscription[]): AIInsight[] {
    const insights: AIInsight[] = [];
    const threshold = 20; // $20/month or more

    const expensiveSubs = subscriptions.filter(sub => sub.cost >= threshold);

    expensiveSubs.forEach(sub => {
      insights.push({
        id: `expensive-${sub.id}`,
        type: 'cost_saving',
        priority: 'medium',
        title: `${sub.name} is One of Your Costliest Subscriptions`,
        description: `At ${sub.cost}/month, consider if there are cheaper alternatives or if you're using all features.`,
        potentialSavings: undefined,
        subscriptionIds: [sub.id],
        action: 'Review usage and alternatives',
        icon: '💰'
      });
    });

    return insights;
  }

  /**
   * Suggest switching to annual billing for savings
   */
  private static suggestAnnualBilling(subscriptions: Subscription[]): AIInsight[] {
    const insights: AIInsight[] = [];

    const monthlyHighUsage = subscriptions.filter(sub => 
      sub.frequency === 'Monthly' && sub.cost >= 5
    );

    monthlyHighUsage.forEach(sub => {
      // Most services offer ~16% discount for annual billing (2 months free)
      const annualSavings = sub.cost * 2; // Approximate 2 months free
      
      if (annualSavings >= 10) {
        insights.push({
          id: `annual-${sub.id}`,
          type: 'optimization',
          priority: 'low',
          title: `Switch ${sub.name} to Annual Billing`,
          description: `Save approximately ${annualSavings.toFixed(2)}/year by paying annually instead of monthly.`,
          potentialSavings: annualSavings / 12, // Monthly equivalent
          subscriptionIds: [sub.id],
          action: 'Contact provider to switch',
          icon: '📅'
        });
      }
    });

    return insights;
  }

  /**
   * Detect similar services (streaming, cloud storage, etc.)
   */
  private static detectSimilarServices(subscriptions: Subscription[]): AIInsight[] {
    const insights: AIInsight[] = [];

    // Streaming service detection
    const streamingServices = ['netflix', 'disney', 'hulu', 'hbo', 'paramount', 'peacock', 'apple tv', 'amazon prime'];
    const userStreaming = subscriptions.filter(sub =>
      streamingServices.some(service => sub.name.toLowerCase().includes(service))
    );

    if (userStreaming.length >= 3) {
      const totalCost = userStreaming.reduce((sum, s) => sum + s.cost, 0);
      
      insights.push({
        id: 'similar-streaming',
        type: 'optimization',
        priority: 'medium',
        title: `You Have ${userStreaming.length} Streaming Services`,
        description: `Total cost: ${totalCost.toFixed(2)}/month. Consider rotating subscriptions or sharing accounts with family.`,
        potentialSavings: totalCost * 0.3, // Could save ~30% by optimizing
        subscriptionIds: userStreaming.map(s => s.id),
        action: 'Optimize streaming subscriptions',
        icon: '🎬'
      });
    }

    // Cloud storage detection
    const cloudStorage = ['dropbox', 'google one', 'icloud', 'onedrive'];
    const userCloudStorage = subscriptions.filter(sub =>
      cloudStorage.some(service => sub.name.toLowerCase().includes(service))
    );

    if (userCloudStorage.length >= 2) {
      insights.push({
        id: 'similar-cloud',
        type: 'optimization',
        priority: 'low',
        title: `Multiple Cloud Storage Subscriptions`,
        description: `You have ${userCloudStorage.length} cloud storage services. Consider consolidating to one provider.`,
        potentialSavings: undefined,
        subscriptionIds: userCloudStorage.map(s => s.id),
        action: 'Consolidate storage',
        icon: '☁️'
      });
    }

    return insights;
  }

  /**
   * Check if two service names are similar
   */
  private static areSimilar(str1: string, str2: string): boolean {
    // Exact match
    if (str1 === str2) return true;

    // One contains the other
    if (str1.includes(str2) || str2.includes(str1)) return true;

    // Check for common variations
    const normalize = (s: string) => s.replace(/[+\s\-_]/g, '').toLowerCase();
    return normalize(str1) === normalize(str2);
  }

  /**
   * Get total potential savings from insights
   */
  static getTotalPotentialSavings(insights: AIInsight[]): number {
    return insights.reduce((total, insight) => {
      return total + (insight.potentialSavings || 0);
    }, 0);
  }

  /**
   * Get insights by priority
   */
  static getInsightsByPriority(insights: AIInsight[], priority: 'high' | 'medium' | 'low'): AIInsight[] {
    return insights.filter(insight => insight.priority === priority);
  }

  /**
   * Get quick summary for dashboard
   */
  static getQuickSummary(subscriptions: Subscription[]): string {
    const insights = this.generateInsights(subscriptions);
    const savings = this.getTotalPotentialSavings(insights);
    const highPriority = this.getInsightsByPriority(insights, 'high').length;

    if (highPriority > 0) {
      return `💡 ${highPriority} optimization${highPriority > 1 ? 's' : ''} found! Potential savings: $${savings.toFixed(2)}/month`;
    } else if (insights.length > 0) {
      return `✨ ${insights.length} suggestion${insights.length > 1 ? 's' : ''} to optimize your subscriptions`;
    } else {
      return `✅ Your subscriptions look well optimized!`;
    }
  }
}
