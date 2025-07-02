// Payment Service for SubHub Monetization System
import { supabase } from '../lib/supabase';
import type { 
  UserSubscription, 
  SubscriptionPlan, 
  CreateSubscriptionRequest, 
  CreateSubscriptionResponse,
  SubscriptionStatus,
  UserTier,
  PricingCalculation
} from '../types/payment';

export class PaymentService {
  private static instance: PaymentService;

  public static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  // Get user's current subscription
  async getCurrentSubscription(userId: string): Promise<UserSubscription | null> {
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching current subscription:', error);
      return null;
    }
  }

  // Get user's tier based on subscription
  async getUserTier(userId: string): Promise<UserTier> {
    try {
      const subscription = await this.getCurrentSubscription(userId);
      
      if (!subscription) {
        return 'free';
      }

      const { data: plan } = await supabase
        .from('subscription_plans')
        .select('tier')
        .eq('id', subscription.plan_id)
        .single();

      return plan?.tier || 'free';
    } catch (error) {
      console.error('Error determining user tier:', error);
      return 'free';
    }
  }

  // Get all available plans
  async getAvailablePlans(): Promise<SubscriptionPlan[]> {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('price_monthly', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      return [];
    }
  }

  // Create new subscription
  async createSubscription(request: CreateSubscriptionRequest): Promise<CreateSubscriptionResponse> {
    try {
      // This would integrate with Stripe in production
      // For now, we'll create a local subscription record
      
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const subscription: Omit<UserSubscription, 'id' | 'created_at' | 'updated_at'> = {
        user_id: user.user.id,
        plan_id: request.plan_id,
        status: request.trial_days ? 'trialing' : 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: this.calculatePeriodEnd(request.billing_interval),
        trial_start: request.trial_days ? new Date().toISOString() : undefined,
        trial_end: request.trial_days ? this.calculateTrialEnd(request.trial_days) : undefined,
      };

      const { data, error } = await supabase
        .from('user_subscriptions')
        .insert(subscription)
        .select()
        .single();

      if (error) throw error;

      return {
        subscription: data,
        requires_action: false,
      };
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  // Cancel subscription
  async cancelSubscription(subscriptionId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_subscriptions')
        .update({ 
          status: 'canceled',
          canceled_at: new Date().toISOString()
        })
        .eq('id', subscriptionId);

      if (error) throw error;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  }

  // Update subscription
  async updateSubscription(subscriptionId: string, updates: Partial<UserSubscription>): Promise<UserSubscription> {
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .update(updates)
        .eq('id', subscriptionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  }

  // Calculate pricing with discounts
  calculatePricing(plan: SubscriptionPlan, billingInterval: 'monthly' | 'yearly'): PricingCalculation {
    const basePrice = billingInterval === 'yearly' ? plan.price_yearly : plan.price_monthly;
    const monthlyPrice = plan.price_monthly;
    
    // Calculate yearly savings (17% discount)
    const yearlyDiscount = billingInterval === 'yearly' ? (monthlyPrice * 12) - plan.price_yearly : 0;
    const savingsVsMonthly = billingInterval === 'yearly' ? yearlyDiscount : undefined;

    return {
      plan,
      billing_interval: billingInterval,
      base_price: basePrice,
      discount_amount: yearlyDiscount,
      tax_amount: 0, // Would be calculated based on user location
      total_amount: basePrice,
      savings_vs_monthly: savingsVsMonthly,
      trial_days: plan.trial_days,
    };
  }

  // Helper methods
  private calculatePeriodEnd(interval: 'monthly' | 'yearly'): string {
    const now = new Date();
    if (interval === 'yearly') {
      now.setFullYear(now.getFullYear() + 1);
    } else {
      now.setMonth(now.getMonth() + 1);
    }
    return now.toISOString();
  }

  private calculateTrialEnd(trialDays: number): string {
    const now = new Date();
    now.setDate(now.getDate() + trialDays);
    return now.toISOString();
  }

  // Check if user is in trial period
  async isInTrialPeriod(userId: string): Promise<boolean> {
    try {
      const subscription = await this.getCurrentSubscription(userId);
      
      if (!subscription || subscription.status !== 'trialing') {
        return false;
      }

      if (!subscription.trial_end) {
        return false;
      }

      return new Date(subscription.trial_end) > new Date();
    } catch (error) {
      console.error('Error checking trial period:', error);
      return false;
    }
  }

  // Get trial days remaining
  async getTrialDaysRemaining(userId: string): Promise<number> {
    try {
      const subscription = await this.getCurrentSubscription(userId);
      
      if (!subscription || !subscription.trial_end) {
        return 0;
      }

      const trialEnd = new Date(subscription.trial_end);
      const now = new Date();
      const diffTime = trialEnd.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return Math.max(0, diffDays);
    } catch (error) {
      console.error('Error calculating trial days remaining:', error);
      return 0;
    }
  }
}

export const paymentService = PaymentService.getInstance();
