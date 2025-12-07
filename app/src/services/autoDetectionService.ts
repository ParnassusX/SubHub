/**
 * Auto-Detection Service
 * Automatically detects subscriptions from bank transactions and email
 */

import { supabase } from '../lib/supabase';
import { BankTransaction } from './bankConnectionService';

export interface DetectedSubscription {
  id: string;
  user_id: string;
  detected_from: 'bank' | 'email' | 'manual';
  service_name: string;
  amount: number;
  currency: string;
  billing_cycle: 'monthly' | 'yearly' | 'weekly' | 'quarterly';
  merchant_name?: string;
  confidence_score: number; // 0-100
  first_detected_at: Date;
  last_seen_at: Date;
  transaction_count: number;
  status: 'pending' | 'confirmed' | 'rejected' | 'added';
  category?: string;
  logo_url?: string;
  transaction_ids: string[];
}

interface SubscriptionPattern {
  name: string;
  patterns: string[];
  category: string;
  typical_amounts?: number[];
  logo?: string;
}

class AutoDetectionService {
  // Known subscription patterns (expandable database)
  private subscriptionPatterns: SubscriptionPattern[] = [
    { name: 'Netflix', patterns: ['netflix', 'nflx'], category: 'Entertainment', typical_amounts: [8.99, 13.99, 17.99] },
    { name: 'Spotify', patterns: ['spotify'], category: 'Entertainment', typical_amounts: [9.99, 14.99] },
    { name: 'Apple Music', patterns: ['apple.com/bill', 'apple music'], category: 'Entertainment', typical_amounts: [9.99, 14.99] },
    { name: 'Amazon Prime', patterns: ['amazon prime', 'amzn prime'], category: 'Shopping', typical_amounts: [14.99, 139.00] },
    { name: 'Disney+', patterns: ['disney+', 'disneyplus'], category: 'Entertainment', typical_amounts: [7.99, 10.99] },
    { name: 'Hulu', patterns: ['hulu'], category: 'Entertainment', typical_amounts: [7.99, 14.99] },
    { name: 'HBO Max', patterns: ['hbo max', 'hbomax'], category: 'Entertainment', typical_amounts: [9.99, 15.99] },
    { name: 'YouTube Premium', patterns: ['youtube premium', 'youtube music'], category: 'Entertainment', typical_amounts: [11.99] },
    { name: 'iCloud', patterns: ['icloud'], category: 'Cloud Storage', typical_amounts: [0.99, 2.99, 9.99] },
    { name: 'Dropbox', patterns: ['dropbox'], category: 'Cloud Storage', typical_amounts: [9.99, 16.99] },
    { name: 'Google One', patterns: ['google storage', 'google one'], category: 'Cloud Storage', typical_amounts: [1.99, 2.99, 9.99] },
    { name: 'Microsoft 365', patterns: ['microsoft 365', 'office 365'], category: 'Productivity', typical_amounts: [6.99, 9.99] },
    { name: 'Adobe Creative Cloud', patterns: ['adobe'], category: 'Productivity', typical_amounts: [20.99, 52.99] },
    { name: 'Audible', patterns: ['audible'], category: 'Entertainment', typical_amounts: [14.95] },
    { name: 'LinkedIn Premium', patterns: ['linkedin'], category: 'Professional', typical_amounts: [29.99, 59.99] },
    { name: 'Planet Fitness', patterns: ['planet fitness', 'pf black card'], category: 'Health & Fitness', typical_amounts: [10, 22.99] },
    { name: 'LA Fitness', patterns: ['la fitness'], category: 'Health & Fitness', typical_amounts: [29.99, 34.99] },
    { name: 'Crunchyroll', patterns: ['crunchyroll'], category: 'Entertainment', typical_amounts: [7.99, 9.99] },
    { name: 'Paramount+', patterns: ['paramount+', 'paramount plus'], category: 'Entertainment', typical_amounts: [4.99, 9.99] },
    { name: 'Peacock', patterns: ['peacock'], category: 'Entertainment', typical_amounts: [4.99, 9.99] },
  ];

  /**
   * Analyze bank transactions to detect potential subscriptions
   */
  async analyzeTransactions(transactions: BankTransaction[], userId: string): Promise<DetectedSubscription[]> {
    const detectedSubscriptions: DetectedSubscription[] = [];
    const transactionsByMerchant = this.groupTransactionsByMerchant(transactions);

    for (const [merchant, merchantTransactions] of Object.entries(transactionsByMerchant)) {
      const detection = this.analyzeRecurringPattern(merchant, merchantTransactions, userId);
      if (detection && detection.confidence_score >= 60) {
        detectedSubscriptions.push(detection);
      }
    }

    return detectedSubscriptions;
  }

  /**
   * Group transactions by merchant for pattern analysis
   */
  private groupTransactionsByMerchant(transactions: BankTransaction[]): Record<string, BankTransaction[]> {
    return transactions.reduce((acc, transaction) => {
      const merchant = (transaction.merchant_name || transaction.name).toLowerCase();
      if (!acc[merchant]) {
        acc[merchant] = [];
      }
      acc[merchant].push(transaction);
      return acc;
    }, {} as Record<string, BankTransaction[]>);
  }

  /**
   * Analyze if transactions show recurring subscription pattern
   */
  private analyzeRecurringPattern(
    merchant: string,
    transactions: BankTransaction[],
    userId: string
  ): DetectedSubscription | null {
    // Need at least 2 transactions to detect pattern
    if (transactions.length < 2) return null;

    // Sort by date
    transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Check if amounts are similar (within 5%)
    const amounts = transactions.map(t => Math.abs(t.amount));
    const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const amountVariance = amounts.every(amt => Math.abs(amt - avgAmount) / avgAmount < 0.05);

    if (!amountVariance) return null;

    // Check for recurring time intervals
    const intervals: number[] = [];
    for (let i = 1; i < transactions.length; i++) {
      const daysDiff = (new Date(transactions[i].date).getTime() - new Date(transactions[i-1].date).getTime()) / (1000 * 60 * 60 * 24);
      intervals.push(Math.round(daysDiff));
    }

    const billingCycle = this.determineBillingCycle(intervals);
    if (!billingCycle) return null;

    // Try to match against known patterns
    const matchedPattern = this.matchKnownPattern(merchant, avgAmount);
    const confidence = this.calculateConfidence(transactions.length, amountVariance, !!matchedPattern);

    const detected: DetectedSubscription = {
      id: crypto.randomUUID(),
      user_id: userId,
      detected_from: 'bank',
      service_name: matchedPattern?.name || this.cleanMerchantName(merchant),
      amount: avgAmount,
      currency: 'USD',
      billing_cycle: billingCycle,
      merchant_name: merchant,
      confidence_score: confidence,
      first_detected_at: transactions[0].date,
      last_seen_at: transactions[transactions.length - 1].date,
      transaction_count: transactions.length,
      status: 'pending',
      category: matchedPattern?.category || 'Other',
      logo_url: matchedPattern?.logo,
      transaction_ids: transactions.map(t => t.id)
    };

    return detected;
  }

  /**
   * Determine billing cycle from transaction intervals
   */
  private determineBillingCycle(intervals: number[]): 'monthly' | 'yearly' | 'weekly' | 'quarterly' | null {
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;

    // Weekly: 7 days ±2
    if (avgInterval >= 5 && avgInterval <= 9) return 'weekly';
    
    // Monthly: 28-32 days
    if (avgInterval >= 28 && avgInterval <= 32) return 'monthly';
    
    // Quarterly: 90-92 days
    if (avgInterval >= 88 && avgInterval <= 94) return 'quarterly';
    
    // Yearly: 365 days ±5
    if (avgInterval >= 360 && avgInterval <= 370) return 'yearly';

    return null;
  }

  /**
   * Match transaction against known subscription patterns
   */
  private matchKnownPattern(merchant: string, amount: number): SubscriptionPattern | null {
    for (const pattern of this.subscriptionPatterns) {
      const matches = pattern.patterns.some(p => merchant.includes(p.toLowerCase()));
      if (matches) {
        // Check if amount is close to typical amounts (if defined)
        if (pattern.typical_amounts) {
          const closeAmount = pattern.typical_amounts.some(ta => Math.abs(ta - amount) < 1);
          if (closeAmount) return pattern;
        } else {
          return pattern;
        }
      }
    }
    return null;
  }

  /**
   * Calculate confidence score (0-100)
   */
  private calculateConfidence(transactionCount: number, amountConsistent: boolean, hasMatch: boolean): number {
    let score = 50; // Base score

    // More transactions = higher confidence
    score += Math.min(transactionCount * 5, 25);

    // Consistent amounts
    if (amountConsistent) score += 15;

    // Matches known pattern
    if (hasMatch) score += 10;

    return Math.min(score, 100);
  }

  /**
   * Clean merchant name for display
   */
  private cleanMerchantName(merchant: string): string {
    return merchant
      .replace(/[^a-z0-9\s]/gi, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .filter(word => word.length > 2)
      .slice(0, 3)
      .join(' ')
      .trim();
  }

  /**
   * Get all pending detected subscriptions for user
   */
  async getPendingDetections(userId: string): Promise<DetectedSubscription[]> {
    try {
      const { data, error } = await supabase
        .from('detected_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'pending')
        .order('confidence_score', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching pending detections:', error);
      return [];
    }
  }

  /**
   * User confirms detected subscription (adds to subscriptions)
   */
  async confirmDetection(detectionId: string): Promise<void> {
    try {
      await supabase
        .from('detected_subscriptions')
        .update({ status: 'confirmed' })
        .eq('id', detectionId);
    } catch (error) {
      console.error('Error confirming detection:', error);
      throw error;
    }
  }

  /**
   * User rejects detected subscription
   */
  async rejectDetection(detectionId: string): Promise<void> {
    try {
      await supabase
        .from('detected_subscriptions')
        .update({ status: 'rejected' })
        .eq('id', detectionId);
    } catch (error) {
      console.error('Error rejecting detection:', error);
      throw error;
    }
  }

  /**
   * Get detection statistics
   */
  async getDetectionStats(userId: string): Promise<{
    total_detected: number;
    confirmed: number;
    rejected: number;
    pending: number;
    accuracy: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('detected_subscriptions')
        .select('status')
        .eq('user_id', userId);

      if (error) throw error;

      const stats = (data || []).reduce((acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const confirmed = stats.confirmed || 0;
      const rejected = stats.rejected || 0;
      const total = confirmed + rejected;
      const accuracy = total > 0 ? (confirmed / total) * 100 : 0;

      return {
        total_detected: data?.length || 0,
        confirmed,
        rejected,
        pending: stats.pending || 0,
        accuracy: Math.round(accuracy)
      };
    } catch (error) {
      console.error('Error getting detection stats:', error);
      return {
        total_detected: 0,
        confirmed: 0,
        rejected: 0,
        pending: 0,
        accuracy: 0
      };
    }
  }

  /**
   * Add custom subscription pattern
   */
  addCustomPattern(pattern: SubscriptionPattern): void {
    this.subscriptionPatterns.push(pattern);
  }

  /**
   * Get known patterns count
   */
  getKnownPatternsCount(): number {
    return this.subscriptionPatterns.length;
  }
}

export const autoDetectionService = new AutoDetectionService();
