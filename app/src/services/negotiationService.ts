/**
 * Negotiation Service
 * AI-powered subscription price negotiation and optimization
 * Helps users save money by negotiating better rates
 */

import { supabase } from '../lib/supabase';
import { realAIService } from './realAIService';

export interface NegotiationOpportunity {
  id: string;
  user_id: string;
  subscription_id: string;
  service_name: string;
  current_price: number;
  market_average_price: number;
  potential_savings: number;
  savings_percentage: number;
  negotiation_difficulty: 'easy' | 'medium' | 'hard';
  success_probability: number; // 0-100
  recommended_approach: 'call' | 'email' | 'chat';
  script_template: string;
  tips: string[];
  status: 'identified' | 'in_progress' | 'successful' | 'unsuccessful';
  created_at: Date;
  attempted_at?: Date;
  result_amount?: number;
}

interface PriceMarketData {
  service: string;
  average_price: number;
  price_range: { min: number; max: number };
  sample_size: number;
}

class NegotiationService {
  // Market price data for common services (would be real data in production)
  private marketPrices: Record<string, PriceMarketData> = {
    'spotify': { service: 'Spotify', average_price: 9.99, price_range: { min: 9.99, max: 9.99 }, sample_size: 1000 },
    'netflix': { service: 'Netflix', average_price: 13.99, price_range: { min: 8.99, max: 17.99 }, sample_size: 1000 },
    'hbo max': { service: 'HBO Max', average_price: 14.99, price_range: { min: 9.99, max: 15.99 }, sample_size: 500 },
    'hulu': { service: 'Hulu', average_price: 7.99, price_range: { min: 7.99, max: 14.99 }, sample_size: 800 },
    'disney+': { service: 'Disney+', average_price: 7.99, price_range: { min: 7.99, max: 10.99 }, sample_size: 600 },
    'youtube premium': { service: 'YouTube Premium', average_price: 11.99, price_range: { min: 11.99, max: 11.99 }, sample_size: 400 },
    'amazon prime': { service: 'Amazon Prime', average_price: 139, price_range: { min: 119, max: 139 }, sample_size: 2000 },
    'adobe creative cloud': { service: 'Adobe Creative Cloud', average_price: 52.99, price_range: { min: 20.99, max: 82.99 }, sample_size: 300 },
    'microsoft 365': { service: 'Microsoft 365', average_price: 6.99, price_range: { min: 6.99, max: 9.99 }, sample_size: 800 },
    'dropbox': { service: 'Dropbox', average_price: 11.99, price_range: { min: 9.99, max: 19.99 }, sample_size: 400 },
    'apple music': { service: 'Apple Music', average_price: 9.99, price_range: { min: 9.99, max: 14.99 }, sample_size: 900 },
  };

  /**
   * Analyze user's subscriptions for negotiation opportunities
   */
  async analyzeSubscriptions(userId: string): Promise<NegotiationOpportunity[]> {
    try {
      // Get user's subscriptions
      const { data: subscriptions, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active');

      if (error) throw error;
      if (!subscriptions || subscriptions.length === 0) return [];

      const opportunities: NegotiationOpportunity[] = [];

      for (const subscription of subscriptions) {
        const opportunity = await this.evaluateSubscription(subscription, userId);
        if (opportunity && opportunity.potential_savings > 0) {
          opportunities.push(opportunity);
        }
      }

      // Sort by potential savings (highest first)
      return opportunities.sort((a, b) => b.potential_savings - a.potential_savings);
    } catch (error) {
      console.error('Error analyzing subscriptions:', error);
      return [];
    }
  }

  /**
   * Evaluate single subscription for negotiation potential
   */
  private async evaluateSubscription(subscription: any, userId: string): Promise<NegotiationOpportunity | null> {
    const serviceName = subscription.name.toLowerCase();
    const currentPrice = subscription.cost;

    // Check if we have market data
    const marketData = Object.entries(this.marketPrices).find(([key]) => 
      serviceName.includes(key) || key.includes(serviceName)
    )?.[1];

    if (!marketData) return null;

    // Calculate if user is paying more than average
    const potentialSavings = currentPrice - marketData.average_price;
    if (potentialSavings <= 0) return null; // No savings opportunity

    const savingsPercentage = (potentialSavings / currentPrice) * 100;

    // Determine negotiation difficulty based on service and savings
    const difficulty = this.determineDifficulty(serviceName, savingsPercentage);
    const successProbability = this.estimateSuccessProbability(difficulty, savingsPercentage);

    // Generate negotiation script using AI if available
    const script = await this.generateNegotiationScript(
      subscription.name,
      currentPrice,
      marketData.average_price,
      difficulty
    );

    const opportunity: NegotiationOpportunity = {
      id: crypto.randomUUID(),
      user_id: userId,
      subscription_id: subscription.id,
      service_name: subscription.name,
      current_price: currentPrice,
      market_average_price: marketData.average_price,
      potential_savings: potentialSavings,
      savings_percentage: Math.round(savingsPercentage),
      negotiation_difficulty: difficulty,
      success_probability: successProbability,
      recommended_approach: this.recommendApproach(serviceName),
      script_template: script,
      tips: this.getNegotiationTips(difficulty, serviceName),
      status: 'identified',
      created_at: new Date()
    };

    return opportunity;
  }

  /**
   * Determine negotiation difficulty
   */
  private determineDifficulty(service: string, savingsPercent: number): 'easy' | 'medium' | 'hard' {
    // Services known to negotiate easily
    const easyServices = ['cable', 'internet', 'phone', 'insurance'];
    // Services that rarely negotiate
    const hardServices = ['netflix', 'spotify', 'apple', 'google'];

    if (hardServices.some(s => service.includes(s))) {
      return 'hard';
    }

    if (easyServices.some(s => service.includes(s))) {
      return 'easy';
    }

    // Based on savings percentage
    if (savingsPercent > 30) return 'hard';
    if (savingsPercent > 15) return 'medium';
    return 'easy';
  }

  /**
   * Estimate success probability
   */
  private estimateSuccessProbability(difficulty: string, savingsPercent: number): number {
    let baseProb = 50;

    // Adjust based on difficulty
    if (difficulty === 'easy') baseProb = 75;
    else if (difficulty === 'hard') baseProb = 25;

    // Adjust based on savings (lower savings = higher success)
    if (savingsPercent < 10) baseProb += 15;
    else if (savingsPercent > 30) baseProb -= 15;

    return Math.max(10, Math.min(90, baseProb));
  }

  /**
   * Recommend communication approach
   */
  private recommendApproach(service: string): 'call' | 'email' | 'chat' {
    // Services best negotiated by phone
    const callServices = ['cable', 'internet', 'insurance', 'phone'];
    if (callServices.some(s => service.includes(s))) return 'call';

    // Services with good chat support
    const chatServices = ['amazon', 'hulu', 'adobe'];
    if (chatServices.some(s => service.includes(s))) return 'chat';

    return 'email';
  }

  /**
   * Generate negotiation script using AI
   */
  private async generateNegotiationScript(
    serviceName: string,
    currentPrice: number,
    marketPrice: number,
    difficulty: string
  ): Promise<string> {
    // Try to use AI for personalized script
    try {
      const config = realAIService.getConfiguration();
      if (config.provider !== 'local') {
        const prompt = `Generate a professional negotiation script for lowering a ${serviceName} subscription from $${currentPrice} to $${marketPrice}. The negotiation difficulty is ${difficulty}. Include specific talking points and be persuasive but polite.`;
        
        const aiResponse = await realAIService.generateInsights([{
          name: serviceName,
          cost: currentPrice,
          billing_cycle: 'monthly',
          category: 'Subscription',
          status: 'active'
        }], prompt);

        if (aiResponse.insights.length > 0) {
          return aiResponse.insights[0].suggestion;
        }
      }
    } catch (error) {
      console.warn('AI script generation failed, using template');
    }

    // Fallback to template
    return this.getTemplateScript(serviceName, currentPrice, marketPrice, difficulty);
  }

  /**
   * Get template negotiation script
   */
  private getTemplateScript(service: string, current: number, target: number, difficulty: string): string {
    const savings = current - target;
    
    return `
Subject: Request for Rate Review - Long-term Customer

Dear ${service} Customer Service,

I hope this message finds you well. I've been a loyal ${service} customer for [X months/years] and have been very satisfied with your service.

I'm currently paying $${current.toFixed(2)} per month, and I've noticed that the current market rate for similar services is around $${target.toFixed(2)}. I would like to continue using ${service}, but I need to ensure I'm getting the best value for my budget.

Would it be possible to review my account and see if there are any promotions, discounts, or plan adjustments that could help me reduce my monthly cost by approximately $${savings.toFixed(2)}? I value our relationship and would prefer to stay with ${service} if we can find a mutually beneficial solution.

I'm happy to discuss this further at your convenience. Thank you for considering my request.

Best regards,
[Your Name]
Account #: [Your Account Number]

---

💡 Tips for success:
- Be polite but firm
- Mention being a "long-term customer" (even if recent)
- Reference competitive pricing
- Express willingness to stay if price is adjusted
- Ask about promotional rates or loyalty discounts
${difficulty === 'hard' ? '- Consider bundling services for better leverage' : ''}
${difficulty === 'easy' ? '- Mention you\'re considering switching to save money' : ''}
    `.trim();
  }

  /**
   * Get negotiation tips based on difficulty
   */
  private getNegotiationTips(difficulty: string, service: string): string[] {
    const baseTips = [
      'Be polite and professional throughout',
      'Have your account information ready',
      'Know your usage history and loyalty duration',
      'Be prepared to mention competitors\' pricing'
    ];

    if (difficulty === 'easy') {
      return [
        ...baseTips,
        'Mention you\'re considering switching providers',
        'Ask about loyalty discounts or promotions',
        'Be willing to commit to a longer contract for better rates'
      ];
    }

    if (difficulty === 'hard') {
      return [
        ...baseTips,
        'Consider bundling with other services',
        'Highlight your long-term customer value',
        'Be persistent - may need multiple attempts',
        'Ask to speak with retention department'
      ];
    }

    return [
      ...baseTips,
      'Reference specific competitor pricing',
      'Ask about current promotional offers',
      'Be open to different plan tiers'
    ];
  }

  /**
   * Mark negotiation as attempted
   */
  async markAsAttempted(opportunityId: string, success: boolean, newAmount?: number): Promise<void> {
    try {
      await supabase
        .from('negotiation_opportunities')
        .update({
          status: success ? 'successful' : 'unsuccessful',
          attempted_at: new Date(),
          result_amount: newAmount
        })
        .eq('id', opportunityId);
    } catch (error) {
      console.error('Error updating negotiation status:', error);
      throw error;
    }
  }

  /**
   * Get negotiation statistics
   */
  async getNegotiationStats(userId: string): Promise<{
    total_opportunities: number;
    total_potential_savings: number;
    attempted: number;
    successful: number;
    actual_savings: number;
    success_rate: number;
  }> {
    try {
      const { data: opportunities, error } = await supabase
        .from('negotiation_opportunities')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      if (!opportunities || opportunities.length === 0) {
        return {
          total_opportunities: 0,
          total_potential_savings: 0,
          attempted: 0,
          successful: 0,
          actual_savings: 0,
          success_rate: 0
        };
      }

      const stats = opportunities.reduce((acc, opp) => {
        acc.total_potential_savings += opp.potential_savings;
        if (opp.status !== 'identified') acc.attempted += 1;
        if (opp.status === 'successful') {
          acc.successful += 1;
          if (opp.result_amount) {
            acc.actual_savings += (opp.current_price - opp.result_amount);
          }
        }
        return acc;
      }, {
        total_potential_savings: 0,
        attempted: 0,
        successful: 0,
        actual_savings: 0
      });

      return {
        total_opportunities: opportunities.length,
        total_potential_savings: Math.round(stats.total_potential_savings * 100) / 100,
        attempted: stats.attempted,
        successful: stats.successful,
        actual_savings: Math.round(stats.actual_savings * 100) / 100,
        success_rate: stats.attempted > 0 ? Math.round((stats.successful / stats.attempted) * 100) : 0
      };
    } catch (error) {
      console.error('Error getting negotiation stats:', error);
      return {
        total_opportunities: 0,
        total_potential_savings: 0,
        attempted: 0,
        successful: 0,
        actual_savings: 0,
        success_rate: 0
      };
    }
  }

  /**
   * Get all opportunities for user
   */
  async getOpportunities(userId: string): Promise<NegotiationOpportunity[]> {
    try {
      const { data, error } = await supabase
        .from('negotiation_opportunities')
        .select('*')
        .eq('user_id', userId)
        .order('potential_savings', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      return [];
    }
  }
}

export const negotiationService = new NegotiationService();
