// Feature Gate Service for SubHub Freemium Model
import { supabase } from '../lib/supabase';
import { paymentService } from './paymentService';
import type { UserTier, FeatureAccessResult } from '../types/payment';

export type FeatureName = 
  | 'unlimited_subscriptions'
  | 'smart_scheduling'
  | 'advanced_analytics'
  | 'unused_detection'
  | 'export_functionality'
  | 'budget_alerts'
  | 'custom_categories'
  | 'family_sharing'
  | 'priority_support';

export interface FeatureDefinition {
  name: FeatureName;
  displayName: string;
  description: string;
  requiredTier: UserTier;
  freeLimit?: number;
  premiumLimit?: number;
  familyLimit?: number;
}

export class FeatureGateService {
  private static instance: FeatureGateService;

  public static getInstance(): FeatureGateService {
    if (!FeatureGateService.instance) {
      FeatureGateService.instance = new FeatureGateService();
    }
    return FeatureGateService.instance;
  }

  // Feature definitions
  private features: Record<FeatureName, FeatureDefinition> = {
    unlimited_subscriptions: {
      name: 'unlimited_subscriptions',
      displayName: 'Unlimited Subscriptions',
      description: 'Track unlimited subscriptions',
      requiredTier: 'premium',
      freeLimit: 5,
      premiumLimit: -1, // Unlimited
      familyLimit: -1,
    },
    smart_scheduling: {
      name: 'smart_scheduling',
      displayName: 'Smart Notification Scheduling',
      description: 'Intelligent notification timing and batching',
      requiredTier: 'premium',
    },
    advanced_analytics: {
      name: 'advanced_analytics',
      displayName: 'Advanced Analytics',
      description: 'Detailed spending insights and trends',
      requiredTier: 'premium',
    },
    unused_detection: {
      name: 'unused_detection',
      displayName: 'Unused Subscription Detection',
      description: 'Automatically identify unused subscriptions',
      requiredTier: 'premium',
    },
    export_functionality: {
      name: 'export_functionality',
      displayName: 'Export Data',
      description: 'Export your subscription data',
      requiredTier: 'premium',
    },
    budget_alerts: {
      name: 'budget_alerts',
      displayName: 'Budget Threshold Alerts',
      description: 'Get notified when approaching budget limits',
      requiredTier: 'premium',
    },
    custom_categories: {
      name: 'custom_categories',
      displayName: 'Custom Categories',
      description: 'Create and manage custom subscription categories',
      requiredTier: 'premium',
    },
    family_sharing: {
      name: 'family_sharing',
      displayName: 'Family Sharing',
      description: 'Share subscriptions with family members',
      requiredTier: 'family',
      familyLimit: 5,
    },
    priority_support: {
      name: 'priority_support',
      displayName: 'Priority Support',
      description: '24/7 priority customer support',
      requiredTier: 'family',
    },
  };

  // Check if user has access to a feature
  async hasFeatureAccess(userId: string, featureName: FeatureName): Promise<FeatureAccessResult> {
    try {
      const userTier = await paymentService.getUserTier(userId);
      const feature = this.features[featureName];

      if (!feature) {
        return { hasAccess: false, reason: 'feature_disabled' };
      }

      // Check tier requirement
      if (!this.tierMeetsRequirement(userTier, feature.requiredTier)) {
        return {
          hasAccess: false,
          reason: 'tier_required',
          required_tier: feature.requiredTier,
          upgrade_url: '/pricing',
        };
      }

      // Check usage limits for subscription tracking
      if (featureName === 'unlimited_subscriptions') {
        const currentUsage = await this.getCurrentSubscriptionCount(userId);
        const limit = this.getFeatureLimit(userTier, feature);

        if (limit > 0 && currentUsage >= limit) {
          return {
            hasAccess: false,
            reason: 'limit_exceeded',
            current_usage: currentUsage,
            limit,
            upgrade_url: '/pricing',
          };
        }

        return {
          hasAccess: true,
          current_usage: currentUsage,
          limit: limit > 0 ? limit : undefined,
        };
      }

      return { hasAccess: true };
    } catch (error) {
      console.error('Error checking feature access:', error);
      return { hasAccess: false, reason: 'feature_disabled' };
    }
  }

  // Get current subscription count for user
  async getCurrentSubscriptionCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting subscription count:', error);
      return 0;
    }
  }

  // Check if user can add more subscriptions
  async canAddSubscription(userId: string): Promise<FeatureAccessResult> {
    return this.hasFeatureAccess(userId, 'unlimited_subscriptions');
  }

  // Get feature usage summary for user
  async getFeatureUsageSummary(userId: string): Promise<{
    subscriptions: { current: number; limit: number; percentage: number };
    tier: UserTier;
    trialDaysRemaining?: number;
  }> {
    try {
      const userTier = await paymentService.getUserTier(userId);
      const subscriptionAccess = await this.hasFeatureAccess(userId, 'unlimited_subscriptions');
      const trialDaysRemaining = await paymentService.getTrialDaysRemaining(userId);

      const current = subscriptionAccess.current_usage || 0;
      const limit = subscriptionAccess.limit || -1;
      const percentage = limit > 0 ? (current / limit) * 100 : 0;

      return {
        subscriptions: { current, limit, percentage },
        tier: userTier,
        trialDaysRemaining: trialDaysRemaining > 0 ? trialDaysRemaining : undefined,
      };
    } catch (error) {
      console.error('Error getting feature usage summary:', error);
      return {
        subscriptions: { current: 0, limit: 5, percentage: 0 },
        tier: 'free',
      };
    }
  }

  // Helper methods
  private tierMeetsRequirement(userTier: UserTier, requiredTier: UserTier): boolean {
    const tierHierarchy: Record<UserTier, number> = {
      free: 0,
      premium: 1,
      family: 2,
    };

    return tierHierarchy[userTier] >= tierHierarchy[requiredTier];
  }

  private getFeatureLimit(userTier: UserTier, feature: FeatureDefinition): number {
    switch (userTier) {
      case 'free':
        return feature.freeLimit || 0;
      case 'premium':
        return feature.premiumLimit || -1;
      case 'family':
        return feature.familyLimit || -1;
      default:
        return 0;
    }
  }

  // Get upgrade recommendations based on usage
  async getUpgradeRecommendations(userId: string): Promise<{
    shouldUpgrade: boolean;
    reasons: string[];
    recommendedTier: UserTier;
    potentialSavings?: number;
  }> {
    try {
      const userTier = await paymentService.getUserTier(userId);
      const usageSummary = await this.getFeatureUsageSummary(userId);
      
      const reasons: string[] = [];
      let shouldUpgrade = false;
      let recommendedTier: UserTier = userTier;

      // Check subscription limit
      if (usageSummary.subscriptions.percentage >= 80) {
        reasons.push('You\'re approaching your subscription limit');
        shouldUpgrade = true;
        recommendedTier = 'premium';
      }

      // Check if user would benefit from unused detection
      if (userTier === 'free' && usageSummary.subscriptions.current >= 3) {
        reasons.push('Unused subscription detection could save you money');
        shouldUpgrade = true;
        recommendedTier = 'premium';
      }

      // Estimate potential savings
      let potentialSavings: number | undefined;
      if (shouldUpgrade && usageSummary.subscriptions.current >= 3) {
        // Estimate 15-25% savings on average
        const estimatedMonthlyCost = usageSummary.subscriptions.current * 12; // Rough estimate
        potentialSavings = estimatedMonthlyCost * 0.2; // 20% average savings
      }

      return {
        shouldUpgrade,
        reasons,
        recommendedTier,
        potentialSavings,
      };
    } catch (error) {
      console.error('Error getting upgrade recommendations:', error);
      return {
        shouldUpgrade: false,
        reasons: [],
        recommendedTier: userTier,
      };
    }
  }
}

export const featureGateService = FeatureGateService.getInstance();
