// Budget Optimization Service - Intelligent budget recommendations
import { Subscription } from '../contexts/SubscriptionContext';
import { BudgetService } from './budgetService';

export interface OptimizationRecommendation {
  id: string;
  type: 'reduce_spending' | 'increase_budget' | 'reallocate' | 'cancel_subscription' | 'optimize_frequency' | 'consolidate';
  priority: 'high' | 'medium' | 'low';
  category?: string;
  subscriptionId?: string;
  title: string;
  description: string;
  potentialSavings?: number;
  impact: 'high' | 'medium' | 'low';
  effort: 'easy' | 'moderate' | 'difficult';
  actionable: boolean;
  tags: string[];
}

export interface BudgetOptimizationAnalysis {
  overallScore: number; // 0-100
  recommendations: OptimizationRecommendation[];
  insights: {
    totalPotentialSavings: number;
    highPriorityActions: number;
    categoryIssues: string[];
    spendingEfficiency: number;
  };
  quickWins: OptimizationRecommendation[];
  longTermOptimizations: OptimizationRecommendation[];
}

export class BudgetOptimizationService {
  /**
   * Analyze budget and generate optimization recommendations
   */
  static analyzeBudgetOptimization(
    subscriptions: Subscription[],
    monthlyBudget?: number,
    _yearlyBudget?: number,
    categoryBudgets?: Record<string, number>
  ): BudgetOptimizationAnalysis {
    const recommendations: OptimizationRecommendation[] = [];
    
    // Calculate current spending
    const { monthly: monthlySpending } = BudgetService.calculateSpending(subscriptions);
    const categorySpending = BudgetService.calculateCategorySpending(subscriptions);
    
    // Analyze subscription patterns
    recommendations.push(...this.analyzeSubscriptionPatterns(subscriptions));
    
    // Analyze budget vs spending
    if (monthlyBudget) {
      recommendations.push(...this.analyzeBudgetVsSpending(
        subscriptions, monthlySpending, monthlyBudget, 'monthly'
      ));
    }
    
    // Analyze category budgets
    if (categoryBudgets) {
      recommendations.push(...this.analyzeCategoryBudgets(
        subscriptions, categorySpending, categoryBudgets
      ));
    }
    
    // Analyze subscription efficiency
    recommendations.push(...this.analyzeSubscriptionEfficiency(subscriptions));
    
    // Calculate insights
    const insights = this.calculateInsights(recommendations, subscriptions, monthlySpending);
    
    // Categorize recommendations
    const quickWins = recommendations.filter(r => 
      r.effort === 'easy' && (r.priority === 'high' || r.impact === 'high')
    );
    
    const longTermOptimizations = recommendations.filter(r => 
      r.effort === 'difficult' || r.type === 'reallocate'
    );
    
    return {
      overallScore: this.calculateOverallScore(subscriptions, monthlyBudget, categoryBudgets),
      recommendations: recommendations.sort((a, b) => {
        const priorityWeight = { high: 3, medium: 2, low: 1 };
        return priorityWeight[b.priority] - priorityWeight[a.priority];
      }),
      insights,
      quickWins,
      longTermOptimizations
    };
  }

  /**
   * Analyze subscription patterns for optimization opportunities
   */
  private static analyzeSubscriptionPatterns(subscriptions: Subscription[]): OptimizationRecommendation[] {
    const recommendations: OptimizationRecommendation[] = [];
    
    // Find duplicate or similar services
    const serviceCategories = this.groupSubscriptionsByCategory(subscriptions);
    
    Object.entries(serviceCategories).forEach(([category, subs]) => {
      if (subs.length > 3) {
        const totalCost = subs.reduce((sum, sub) => 
          sum + BudgetService.normalizeToMonthly(sub.cost, sub.frequency), 0
        );
        
        recommendations.push({
          id: `consolidate-${category}`,
          type: 'consolidate',
          priority: 'medium',
          category,
          title: `Consolidate ${category} subscriptions`,
          description: `You have ${subs.length} ${category} subscriptions. Consider consolidating to reduce costs.`,
          potentialSavings: totalCost * 0.2, // Estimate 20% savings
          impact: 'medium',
          effort: 'moderate',
          actionable: true,
          tags: ['consolidation', 'cost-reduction']
        });
      }
    });
    
    // Find expensive subscriptions
    const expensiveThreshold = 50; // Monthly
    const expensiveSubscriptions = subscriptions.filter(sub => 
      BudgetService.normalizeToMonthly(sub.cost, sub.frequency) > expensiveThreshold
    );
    
    expensiveSubscriptions.forEach(sub => {
      const monthlyCost = BudgetService.normalizeToMonthly(sub.cost, sub.frequency);
      recommendations.push({
        id: `review-expensive-${sub.id}`,
        type: 'reduce_spending',
        priority: 'high',
        subscriptionId: sub.id,
        title: `Review expensive subscription: ${sub.name}`,
        description: `${sub.name} costs $${monthlyCost.toFixed(2)}/month. Consider if this provides sufficient value.`,
        potentialSavings: monthlyCost,
        impact: 'high',
        effort: 'easy',
        actionable: true,
        tags: ['expensive', 'review']
      });
    });
    
    // Find old subscriptions that might be unused
    const oldSubscriptions = subscriptions.filter(sub => {
      const startDate = new Date(sub.startDate);
      const monthsOld = (Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
      return monthsOld > 12;
    });
    
    if (oldSubscriptions.length > 0) {
      const totalSavings = oldSubscriptions.reduce((sum, sub) => 
        sum + BudgetService.normalizeToMonthly(sub.cost, sub.frequency), 0
      );
      
      recommendations.push({
        id: 'review-old-subscriptions',
        type: 'cancel_subscription',
        priority: 'medium',
        title: 'Review long-running subscriptions',
        description: `You have ${oldSubscriptions.length} subscriptions older than 1 year. Review their usage.`,
        potentialSavings: totalSavings * 0.3, // Estimate 30% might be cancelled
        impact: 'medium',
        effort: 'easy',
        actionable: true,
        tags: ['old', 'review', 'usage']
      });
    }
    
    return recommendations;
  }

  /**
   * Analyze budget vs spending for optimization
   */
  private static analyzeBudgetVsSpending(
    _subscriptions: Subscription[],
    spending: number,
    budget: number,
    type: 'monthly' | 'yearly'
  ): OptimizationRecommendation[] {
    const recommendations: OptimizationRecommendation[] = [];
    const variance = spending - budget;
    const percentageUsed = (spending / budget) * 100;
    
    if (variance > 0) {
      // Over budget
      recommendations.push({
        id: `reduce-${type}-spending`,
        type: 'reduce_spending',
        priority: 'high',
        title: `Reduce ${type} spending`,
        description: `You're $${variance.toFixed(2)} over your ${type} budget. Consider canceling or downgrading subscriptions.`,
        potentialSavings: variance,
        impact: 'high',
        effort: 'moderate',
        actionable: true,
        tags: ['over-budget', 'urgent']
      });
    } else if (percentageUsed < 70) {
      // Under budget - optimization opportunity
      const unusedBudget = budget - spending;
      recommendations.push({
        id: `optimize-${type}-budget`,
        type: 'reallocate',
        priority: 'low',
        title: `Optimize ${type} budget allocation`,
        description: `You're using only ${percentageUsed.toFixed(1)}% of your ${type} budget. Consider reallocating $${unusedBudget.toFixed(2)}.`,
        impact: 'low',
        effort: 'easy',
        actionable: true,
        tags: ['under-budget', 'reallocation']
      });
    }
    
    return recommendations;
  }

  /**
   * Analyze category budgets for optimization
   */
  private static analyzeCategoryBudgets(
    _subscriptions: Subscription[],
    categorySpending: Record<string, number>,
    categoryBudgets: Record<string, number>
  ): OptimizationRecommendation[] {
    const recommendations: OptimizationRecommendation[] = [];
    
    Object.entries(categoryBudgets).forEach(([category, budget]) => {
      const spending = categorySpending[category] || 0;
      const variance = spending - budget;
      
      if (variance > 0) {
        recommendations.push({
          id: `reduce-category-${category}`,
          type: 'reduce_spending',
          priority: 'medium',
          category,
          title: `Reduce ${category} spending`,
          description: `${category} is $${variance.toFixed(2)} over budget. Review subscriptions in this category.`,
          potentialSavings: variance,
          impact: 'medium',
          effort: 'moderate',
          actionable: true,
          tags: ['category-over-budget']
        });
      }
    });
    
    return recommendations;
  }

  /**
   * Analyze subscription efficiency
   */
  private static analyzeSubscriptionEfficiency(subscriptions: Subscription[]): OptimizationRecommendation[] {
    const recommendations: OptimizationRecommendation[] = [];
    
    // Find subscriptions that could benefit from annual billing
    const monthlySubscriptions = subscriptions.filter(sub => sub.frequency === 'Monthly');
    
    monthlySubscriptions.forEach(sub => {
      const annualSavings = sub.cost * 12 * 0.15; // Assume 15% savings for annual
      if (annualSavings > 10) { // Only recommend if savings > $10
        recommendations.push({
          id: `annual-billing-${sub.id}`,
          type: 'optimize_frequency',
          priority: 'low',
          subscriptionId: sub.id,
          title: `Switch ${sub.name} to annual billing`,
          description: `Switching to annual billing could save approximately $${annualSavings.toFixed(2)} per year.`,
          potentialSavings: annualSavings / 12, // Monthly savings
          impact: 'low',
          effort: 'easy',
          actionable: true,
          tags: ['annual-billing', 'savings']
        });
      }
    });
    
    return recommendations;
  }

  /**
   * Group subscriptions by category
   */
  private static groupSubscriptionsByCategory(subscriptions: Subscription[]): Record<string, Subscription[]> {
    return subscriptions.reduce((groups, sub) => {
      const category = sub.category || 'Other';
      if (!groups[category]) groups[category] = [];
      groups[category].push(sub);
      return groups;
    }, {} as Record<string, Subscription[]>);
  }

  /**
   * Calculate optimization insights
   */
  private static calculateInsights(
    recommendations: OptimizationRecommendation[],
    subscriptions: Subscription[],
    monthlySpending: number
  ) {
    const totalPotentialSavings = recommendations.reduce((sum, rec) => 
      sum + (rec.potentialSavings || 0), 0
    );
    
    const highPriorityActions = recommendations.filter(r => r.priority === 'high').length;
    
    const categoryIssues = Array.from(new Set(
      recommendations
        .filter(r => r.category)
        .map(r => r.category!)
    ));
    
    const spendingEfficiency = this.calculateSpendingEfficiency(subscriptions, monthlySpending);
    
    return {
      totalPotentialSavings,
      highPriorityActions,
      categoryIssues,
      spendingEfficiency
    };
  }

  /**
   * Calculate overall optimization score
   */
  private static calculateOverallScore(
    subscriptions: Subscription[],
    monthlyBudget?: number,
    categoryBudgets?: Record<string, number>
  ): number {
    let score = 100;
    
    const { monthly: monthlySpending } = BudgetService.calculateSpending(subscriptions);
    
    // Deduct for budget overruns
    if (monthlyBudget && monthlySpending > monthlyBudget) {
      const overrun = ((monthlySpending - monthlyBudget) / monthlyBudget) * 100;
      score -= Math.min(overrun, 30);
    }
    
    // Deduct for too many subscriptions
    if (subscriptions.length > 15) {
      score -= (subscriptions.length - 15) * 2;
    }
    
    // Deduct for expensive subscriptions without category budgets
    const expensiveCount = subscriptions.filter(sub => 
      BudgetService.normalizeToMonthly(sub.cost, sub.frequency) > 50
    ).length;
    
    if (expensiveCount > 3 && !categoryBudgets) {
      score -= expensiveCount * 5;
    }
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate spending efficiency score
   */
  private static calculateSpendingEfficiency(
    subscriptions: Subscription[],
    _monthlySpending: number
  ): number {
    // Simple efficiency calculation based on subscription diversity and cost distribution
    const categories = new Set(subscriptions.map(sub => sub.category || 'Other'));
    const categoryDiversity = categories.size / Math.max(subscriptions.length, 1);
    
    const costs = subscriptions.map(sub => BudgetService.normalizeToMonthly(sub.cost, sub.frequency));
    const avgCost = costs.reduce((sum, cost) => sum + cost, 0) / costs.length;
    const costVariance = costs.reduce((sum, cost) => sum + Math.pow(cost - avgCost, 2), 0) / costs.length;
    const costStability = 1 / (1 + costVariance / 100);
    
    return Math.round((categoryDiversity * 0.4 + costStability * 0.6) * 100);
  }

  /**
   * Get recommendations by priority
   */
  static getRecommendationsByPriority(
    recommendations: OptimizationRecommendation[],
    priority: 'high' | 'medium' | 'low'
  ): OptimizationRecommendation[] {
    return recommendations.filter(r => r.priority === priority);
  }

  /**
   * Get recommendations by type
   */
  static getRecommendationsByType(
    recommendations: OptimizationRecommendation[],
    type: OptimizationRecommendation['type']
  ): OptimizationRecommendation[] {
    return recommendations.filter(r => r.type === type);
  }

  /**
   * Calculate total potential savings
   */
  static calculateTotalSavings(recommendations: OptimizationRecommendation[]): number {
    return recommendations.reduce((sum, rec) => sum + (rec.potentialSavings || 0), 0);
  }
}
