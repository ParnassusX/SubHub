// Budget Service - Utility functions for budget calculations and operations
import {
  BudgetCalculationInput,
  BudgetSummary,
  BudgetProgress,
  CategoryBudgetProgress,
  BudgetInsight,
  BudgetAlert,
  CategoryBudget
} from '../types/budget';
import { Subscription } from '../contexts/SubscriptionContext';
import { BUDGET_THRESHOLDS, BUDGET_STATUS, BUDGET_INSIGHT_TYPES, ALERT_SEVERITY } from '../constants/budget';

export class BudgetService {
  // Utility function to normalize subscription costs to monthly
  static normalizeToMonthly(cost: number, frequency: string): number {
    return frequency === 'Yearly' ? cost / 12 : cost;
  }

  // Calculate total spending from subscriptions
  static calculateSpending(subscriptions: Subscription[]): { monthly: number; yearly: number } {
    const monthlySpending = subscriptions.reduce((total, sub) => 
      total + this.normalizeToMonthly(sub.cost, sub.frequency), 0
    );
    
    return {
      monthly: monthlySpending,
      yearly: monthlySpending * 12
    };
  }

  // Calculate category spending breakdown
  static calculateCategorySpending(subscriptions: Subscription[]): Record<string, number> {
    return subscriptions.reduce((acc, sub) => {
      const monthlyAmount = this.normalizeToMonthly(sub.cost, sub.frequency);
      acc[sub.category] = (acc[sub.category] || 0) + monthlyAmount;
      return acc;
    }, {} as Record<string, number>);
  }

  // Calculate budget progress for a specific budget
  static calculateBudgetProgress(spent: number, budget: number): BudgetProgress {
    const remaining = Math.max(0, budget - spent);
    const percentage = budget > 0 ? (spent / budget) * 100 : 0;
    
    let status: 'under_budget' | 'approaching_limit' | 'over_budget';
    if (percentage >= 100) {
      status = 'over_budget';
    } else if (percentage >= BUDGET_THRESHOLDS.WARNING) {
      status = 'approaching_limit';
    } else {
      status = 'under_budget';
    }

    return {
      budgetAmount: budget,
      spentAmount: spent,
      remainingAmount: remaining,
      percentageUsed: percentage,
      status
    };
  }

  // Calculate category budget progress
  static calculateCategoryBudgetProgress(
    categorySpending: Record<string, number>,
    categoryBudgets: CategoryBudget
  ): CategoryBudgetProgress[] {
    return Object.entries(categoryBudgets).map(([categoryName, budget]) => {
      const spent = categorySpending[categoryName] || 0;
      const progress = this.calculateBudgetProgress(spent, budget);
      
      return {
        ...progress,
        categoryName,
        categoryColor: undefined // Will be set by component using category colors
      };
    });
  }

  // Generate budget insights
  static generateBudgetInsights(
    monthlyProgress: BudgetProgress | null,
    yearlyProgress: BudgetProgress | null,
    categoryProgress: CategoryBudgetProgress[],
    monthlySpending: number
  ): BudgetInsight[] {
    const insights: BudgetInsight[] = [];

    // Monthly budget insights
    if (monthlyProgress) {
      if (monthlyProgress.status === 'over_budget') {
        insights.push({
          type: 'budget_exceeded',
          message: `You've exceeded your monthly budget by ${(monthlyProgress.percentageUsed - 100).toFixed(1)}%`,
          recommendation: 'Consider reviewing your subscriptions or increasing your budget',
          severity: 'high',
          affectedCategories: []
        });
      } else if (monthlyProgress.status === 'approaching_limit') {
        insights.push({
          type: 'budget_warning',
          message: `You've used ${monthlyProgress.percentageUsed.toFixed(1)}% of your monthly budget`,
          recommendation: 'Monitor your spending to stay within budget',
          severity: 'medium',
          affectedCategories: []
        });
      } else {
        insights.push({
          type: 'budget_healthy',
          message: `You're on track with ${monthlyProgress.percentageUsed.toFixed(1)}% of monthly budget used`,
          severity: 'low',
          affectedCategories: []
        });
      }
    } else if (monthlySpending > 0) {
      insights.push({
        type: 'no_budget_set',
        message: 'Set a monthly budget to track your spending',
        recommendation: 'Setting budgets helps control subscription costs',
        severity: 'low',
        affectedCategories: []
      });
    }

    // Yearly budget insights
    if (yearlyProgress) {
      if (yearlyProgress.status === 'over_budget') {
        insights.push({
          type: 'budget_exceeded',
          message: `You've exceeded your yearly budget by ${(yearlyProgress.percentageUsed - 100).toFixed(1)}%`,
          recommendation: 'Consider reviewing your annual subscriptions',
          severity: 'high',
          affectedCategories: []
        });
      } else if (yearlyProgress.status === 'approaching_limit') {
        insights.push({
          type: 'budget_warning',
          message: `You've used ${yearlyProgress.percentageUsed.toFixed(1)}% of your yearly budget`,
          recommendation: 'Monitor your annual spending',
          severity: 'medium',
          affectedCategories: []
        });
      }
    }

    // Category budget insights
    categoryProgress.forEach(progress => {
      if (progress.status === 'over_budget') {
        insights.push({
          type: 'budget_exceeded',
          message: `${progress.categoryName} category is over budget`,
          recommendation: `Review ${progress.categoryName} subscriptions`,
          severity: 'high',
          affectedCategories: [progress.categoryName]
        });
      } else if (progress.status === 'approaching_limit') {
        insights.push({
          type: 'budget_warning',
          message: `${progress.categoryName} category is approaching budget limit`,
          recommendation: `Monitor ${progress.categoryName} spending`,
          severity: 'medium',
          affectedCategories: [progress.categoryName]
        });
      }
    });

    return insights;
  }

  // Generate budget alerts
  static generateBudgetAlerts(
    monthlyProgress: BudgetProgress | null,
    yearlyProgress: BudgetProgress | null,
    categoryProgress: CategoryBudgetProgress[],
    budgetAlertsEnabled: boolean
  ): BudgetAlert[] {
    if (!budgetAlertsEnabled) return [];

    const alerts: BudgetAlert[] = [];
    const now = new Date().toISOString();

    // Monthly budget alerts
    if (monthlyProgress && monthlyProgress.percentageUsed >= BUDGET_THRESHOLDS.WARNING) {
      alerts.push({
        id: `monthly-${Date.now()}`,
        type: 'monthly_threshold',
        threshold: BUDGET_THRESHOLDS.WARNING,
        currentAmount: monthlyProgress.spentAmount,
        budgetAmount: monthlyProgress.budgetAmount,
        message: `Monthly budget ${monthlyProgress.percentageUsed.toFixed(1)}% used`,
        createdAt: now
      });
    }

    // Yearly budget alerts
    if (yearlyProgress && yearlyProgress.percentageUsed >= BUDGET_THRESHOLDS.WARNING) {
      alerts.push({
        id: `yearly-${Date.now()}`,
        type: 'yearly_threshold',
        threshold: BUDGET_THRESHOLDS.WARNING,
        currentAmount: yearlyProgress.spentAmount,
        budgetAmount: yearlyProgress.budgetAmount,
        message: `Yearly budget ${yearlyProgress.percentageUsed.toFixed(1)}% used`,
        createdAt: now
      });
    }

    // Category budget alerts
    categoryProgress.forEach(progress => {
      if (progress.percentageUsed >= BUDGET_THRESHOLDS.WARNING) {
        alerts.push({
          id: `category-${progress.categoryName}-${Date.now()}`,
          type: 'category_threshold',
          threshold: BUDGET_THRESHOLDS.WARNING,
          currentAmount: progress.spentAmount,
          budgetAmount: progress.budgetAmount,
          category: progress.categoryName,
          message: `${progress.categoryName} budget ${progress.percentageUsed.toFixed(1)}% used`,
          createdAt: now
        });
      }
    });

    return alerts;
  }

  // Calculate complete budget summary
  static calculateBudgetSummary(input: BudgetCalculationInput): BudgetSummary {
    const { subscriptions, monthlyBudget, yearlyBudget, categoryBudgets } = input;
    
    // Calculate spending
    const spending = this.calculateSpending(subscriptions);
    const categorySpending = this.calculateCategorySpending(subscriptions);
    
    // Calculate progress
    const monthlyProgress = monthlyBudget ? 
      this.calculateBudgetProgress(spending.monthly, monthlyBudget) : null;
    const yearlyProgress = yearlyBudget ? 
      this.calculateBudgetProgress(spending.yearly, yearlyBudget) : null;
    const categoryProgress = categoryBudgets ? 
      this.calculateCategoryBudgetProgress(categorySpending, categoryBudgets) : [];
    
    // Generate insights and alerts
    const insights = this.generateBudgetInsights(
      monthlyProgress, 
      yearlyProgress, 
      categoryProgress, 
      spending.monthly
    );
    const alerts = this.generateBudgetAlerts(
      monthlyProgress, 
      yearlyProgress, 
      categoryProgress, 
      true // Alerts enabled by default in calculation
    );
    
    // Determine overall status
    let overallStatus: 'healthy' | 'warning' | 'exceeded' = 'healthy';
    
    if (monthlyProgress?.status === 'over_budget' || 
        yearlyProgress?.status === 'over_budget' ||
        categoryProgress.some(p => p.status === 'over_budget')) {
      overallStatus = 'exceeded';
    } else if (monthlyProgress?.status === 'approaching_limit' || 
               yearlyProgress?.status === 'approaching_limit' ||
               categoryProgress.some(p => p.status === 'approaching_limit')) {
      overallStatus = 'warning';
    }

    return {
      totalMonthlySpending: spending.monthly,
      totalYearlySpending: spending.yearly,
      monthlyBudgetProgress: monthlyProgress,
      yearlyBudgetProgress: yearlyProgress,
      categoryBudgetProgress: categoryProgress,
      overallStatus,
      insights,
      alerts
    };
  }

  // Helper function to get budget status color
  static getBudgetStatusColor(status: 'under_budget' | 'approaching_limit' | 'over_budget'): string {
    switch (status) {
      case 'under_budget':
        return 'green';
      case 'approaching_limit':
        return 'yellow';
      case 'over_budget':
        return 'red';
      default:
        return 'blue';
    }
  }

  // Helper function to format budget percentage
  static formatBudgetPercentage(percentage: number): string {
    return `${Math.min(percentage, 999).toFixed(1)}%`;
  }

  // Helper function to check if budget is set
  static hasBudgetSet(monthlyBudget: number | null, yearlyBudget: number | null, categoryBudgets: CategoryBudget): boolean {
    return !!(monthlyBudget || yearlyBudget || Object.keys(categoryBudgets).length > 0);
  }
}
