/**
 * Referral Program Service
 * Viral growth mechanics through user referrals
 */

import { supabase } from '../lib/supabase';

export interface ReferralCode {
  id: string;
  user_id: string;
  code: string;
  created_at: Date;
  total_referrals: number;
  successful_conversions: number;
  pending_rewards: number;
  claimed_rewards: number;
}

export interface Referral {
  id: string;
  referrer_id: string;
  referee_id?: string;
  referee_email?: string;
  code_used: string;
  status: 'pending' | 'signed_up' | 'converted' | 'expired';
  signed_up_at?: Date;
  converted_at?: Date;
  reward_amount: number;
  reward_claimed: boolean;
  created_at: Date;
}

export interface ReferralReward {
  id: string;
  user_id: string;
  referral_id: string;
  reward_type: 'free_month' | 'premium_trial' | 'discount' | 'credit';
  reward_value: number;
  claimed: boolean;
  claimed_at?: Date;
  expires_at: Date;
}

class ReferralService {
  private readonly REWARD_TIERS = [
    { referrals: 1, reward: { type: 'free_month', value: 1, description: '1 month free Premium' } },
    { referrals: 3, reward: { type: 'free_month', value: 2, description: '2 months free Premium' } },
    { referrals: 5, reward: { type: 'free_month', value: 3, description: '3 months free Premium' } },
    { referrals: 10, reward: { type: 'free_month', value: 6, description: '6 months free Premium' } },
    { referrals: 25, reward: { type: 'free_month', value: 12, description: '1 year free Premium' } },
  ];

  /**
   * Generate unique referral code for user
   */
  async generateReferralCode(userId: string): Promise<ReferralCode> {
    try {
      // Check if user already has a code
      const { data: existing, error: fetchError } = await supabase
        .from('referral_codes')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (existing) return existing;

      // Generate unique code
      const code = this.createUniqueCode(userId);

      const newCode: ReferralCode = {
        id: crypto.randomUUID(),
        user_id: userId,
        code,
        created_at: new Date(),
        total_referrals: 0,
        successful_conversions: 0,
        pending_rewards: 0,
        claimed_rewards: 0
      };

      const { data, error } = await supabase
        .from('referral_codes')
        .insert(newCode)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error generating referral code:', error);
      throw error;
    }
  }

  /**
   * Create unique referral code
   */
  private createUniqueCode(userId: string): string {
    // Use user ID hash + random string for uniqueness
    const hash = userId.split('-')[0];
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${hash}${random}`.substring(0, 10).toUpperCase();
  }

  /**
   * Get user's referral code
   */
  async getReferralCode(userId: string): Promise<ReferralCode | null> {
    try {
      const { data, error } = await supabase
        .from('referral_codes')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
      return data || null;
    } catch (error) {
      console.error('Error fetching referral code:', error);
      return null;
    }
  }

  /**
   * Create referral when someone signs up with code
   */
  async createReferral(code: string, refereeEmail: string): Promise<Referral> {
    try {
      // Find referrer by code
      const { data: referralCode, error: codeError } = await supabase
        .from('referral_codes')
        .select('*')
        .eq('code', code.toUpperCase())
        .single();

      if (codeError || !referralCode) {
        throw new Error('Invalid referral code');
      }

      const referral: Referral = {
        id: crypto.randomUUID(),
        referrer_id: referralCode.user_id,
        referee_email: refereeEmail,
        code_used: code.toUpperCase(),
        status: 'pending',
        reward_amount: 1, // 1 month free
        reward_claimed: false,
        created_at: new Date()
      };

      const { data, error } = await supabase
        .from('referrals')
        .insert(referral)
        .select()
        .single();

      if (error) throw error;

      // Increment total referrals
      await supabase
        .from('referral_codes')
        .update({ 
          total_referrals: referralCode.total_referrals + 1 
        })
        .eq('id', referralCode.id);

      return data;
    } catch (error) {
      console.error('Error creating referral:', error);
      throw error;
    }
  }

  /**
   * Mark referral as signed up
   */
  async markReferralSignedUp(referralId: string, refereeId: string): Promise<void> {
    try {
      await supabase
        .from('referrals')
        .update({ 
          status: 'signed_up',
          referee_id: refereeId,
          signed_up_at: new Date()
        })
        .eq('id', referralId);

      // Give referee their welcome bonus (2 weeks free trial)
      await this.createReward(refereeId, referralId, 'premium_trial', 0.5); // 2 weeks = 0.5 month
    } catch (error) {
      console.error('Error marking referral signed up:', error);
      throw error;
    }
  }

  /**
   * Mark referral as converted (referee upgraded to premium)
   */
  async markReferralConverted(referralId: string): Promise<void> {
    try {
      // Get referral info
      const { data: referral, error: fetchError } = await supabase
        .from('referrals')
        .select('*')
        .eq('id', referralId)
        .single();

      if (fetchError || !referral) throw new Error('Referral not found');

      // Update referral status
      await supabase
        .from('referrals')
        .update({ 
          status: 'converted',
          converted_at: new Date()
        })
        .eq('id', referralId);

      // Update referrer's code stats
      const { data: code } = await supabase
        .from('referral_codes')
        .select('*')
        .eq('user_id', referral.referrer_id)
        .single();

      if (code) {
        await supabase
          .from('referral_codes')
          .update({ 
            successful_conversions: code.successful_conversions + 1,
            pending_rewards: code.pending_rewards + referral.reward_amount
          })
          .eq('id', code.id);

        // Create reward for referrer
        await this.createReward(referral.referrer_id, referralId, 'free_month', referral.reward_amount);

        // Check for milestone rewards
        await this.checkMilestoneRewards(referral.referrer_id, code.successful_conversions + 1);
      }
    } catch (error) {
      console.error('Error marking referral converted:', error);
      throw error;
    }
  }

  /**
   * Create reward for user
   */
  private async createReward(
    userId: string,
    referralId: string,
    type: 'free_month' | 'premium_trial' | 'discount' | 'credit',
    value: number
  ): Promise<void> {
    try {
      const reward: ReferralReward = {
        id: crypto.randomUUID(),
        user_id: userId,
        referral_id: referralId,
        reward_type: type,
        reward_value: value,
        claimed: false,
        expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days
      };

      await supabase
        .from('referral_rewards')
        .insert(reward);
    } catch (error) {
      console.error('Error creating reward:', error);
    }
  }

  /**
   * Check and award milestone rewards
   */
  private async checkMilestoneRewards(userId: string, totalConversions: number): Promise<void> {
    try {
      for (const tier of this.REWARD_TIERS) {
        if (totalConversions === tier.referrals) {
          // Award milestone bonus
          await this.createReward(
            userId,
            `milestone-${tier.referrals}`,
            'free_month',
            tier.reward.value
          );

          // Notify user (would integrate with notification system)
          console.log(`🎉 Milestone reward: ${tier.reward.description} for reaching ${tier.referrals} referrals!`);
        }
      }
    } catch (error) {
      console.error('Error checking milestone rewards:', error);
    }
  }

  /**
   * Get user's referral statistics
   */
  async getReferralStats(userId: string): Promise<{
    code: string;
    total_referrals: number;
    successful_conversions: number;
    pending_signups: number;
    total_rewards_earned: number;
    unclaimed_rewards: number;
    next_milestone?: { referrals: number; reward: string };
  }> {
    try {
      const code = await this.getReferralCode(userId);
      if (!code) {
        return {
          code: '',
          total_referrals: 0,
          successful_conversions: 0,
          pending_signups: 0,
          total_rewards_earned: 0,
          unclaimed_rewards: 0
        };
      }

      // Get pending signups
      const { data: referrals } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', userId);

      const pendingSignups = (referrals || []).filter(r => r.status === 'signed_up').length;

      // Get rewards
      const { data: rewards } = await supabase
        .from('referral_rewards')
        .select('*')
        .eq('user_id', userId);

      const totalRewards = (rewards || []).reduce((sum, r) => sum + r.reward_value, 0);
      const unclaimedRewards = (rewards || []).filter(r => !r.claimed).reduce((sum, r) => sum + r.reward_value, 0);

      // Find next milestone
      const nextMilestone = this.REWARD_TIERS.find(t => t.referrals > code.successful_conversions);

      return {
        code: code.code,
        total_referrals: code.total_referrals,
        successful_conversions: code.successful_conversions,
        pending_signups: pendingSignups,
        total_rewards_earned: totalRewards,
        unclaimed_rewards: unclaimedRewards,
        next_milestone: nextMilestone ? {
          referrals: nextMilestone.referrals,
          reward: nextMilestone.reward.description
        } : undefined
      };
    } catch (error) {
      console.error('Error getting referral stats:', error);
      return {
        code: '',
        total_referrals: 0,
        successful_conversions: 0,
        pending_signups: 0,
        total_rewards_earned: 0,
        unclaimed_rewards: 0
      };
    }
  }

  /**
   * Get shareable referral link
   */
  getReferralLink(code: string): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}/register?ref=${code}`;
  }

  /**
   * Get social sharing templates
   */
  getSocialSharingTemplates(code: string): {
    twitter: string;
    facebook: string;
    email: { subject: string; body: string };
    whatsapp: string;
  } {
    const link = this.getReferralLink(code);
    const message = "I'm using SubHub to manage all my subscriptions and save money with AI insights! Join me and get 2 weeks of Premium free 🎁";

    return {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(link)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}&quote=${encodeURIComponent(message)}`,
      email: {
        subject: "Check out SubHub - Manage your subscriptions with AI",
        body: `Hi!\n\n${message}\n\nUse my referral code: ${code}\nor click here to sign up: ${link}\n\nSee you there!`
      },
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${message}\n\n${link}`)}`
    };
  }

  /**
   * Claim reward
   */
  async claimReward(rewardId: string): Promise<void> {
    try {
      await supabase
        .from('referral_rewards')
        .update({ 
          claimed: true,
          claimed_at: new Date()
        })
        .eq('id', rewardId);
    } catch (error) {
      console.error('Error claiming reward:', error);
      throw error;
    }
  }

  /**
   * Get unclaimed rewards
   */
  async getUnclaimedRewards(userId: string): Promise<ReferralReward[]> {
    try {
      const { data, error } = await supabase
        .from('referral_rewards')
        .select('*')
        .eq('user_id', userId)
        .eq('claimed', false)
        .lt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting unclaimed rewards:', error);
      return [];
    }
  }
}

export const referralService = new ReferralService();
