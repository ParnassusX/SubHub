import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSubscriptions } from '../contexts/SubscriptionContext';
import { SettingsService } from '../services/settingsService';
import { BudgetService } from '../services/budgetService';
import {
  BudgetData,
  BudgetProgress,
  CategoryBudgetProgress,
  BudgetInsight,
  BudgetAlert,
  BudgetSummary,
  CategoryBudget,
  UseBudgetReturn
} from '../types/budget';
import { BUDGET_THRESHOLDS } from '../constants/budget';

// Utility function to calculate budget progress
const calculateProgress = (spent: number, budget: number): BudgetProgress => {
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
};

export const useBudget = (): UseBudgetReturn => {
  const { user, profile, refreshProfile, isLoading: authLoading } = useAuth();
  const { subscriptions } = useSubscriptions();
  
  // Budget state
  const [monthlyBudget, setMonthlyBudget] = useState<number | null>(null);
  const [yearlyBudget, setYearlyBudget] = useState<number | null>(null);
  const [categoryBudgets, setCategoryBudgets] = useState<CategoryBudget>({});
  const [budgetAlertsEnabled, setBudgetAlertsEnabled] = useState<boolean>(true);
  
  // Loading and error state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load budget data from profile
  useEffect(() => {
    if (user && profile) {
      // Profile data is available - load budget values
      setMonthlyBudget(profile.monthly_budget);
      setYearlyBudget(profile.yearly_budget);
      setCategoryBudgets((profile.category_budgets as CategoryBudget) || {});
      setBudgetAlertsEnabled(profile.budget_alerts_enabled ?? true);
      setIsLoading(false);
    } else if (user && !authLoading && !profile) {
      // User exists, auth is not loading, but profile is null - this means profile fetch failed or no profile exists
      // Only reset to defaults in this case, not during loading
      setMonthlyBudget(null);
      setYearlyBudget(null);
      setCategoryBudgets({});
      setBudgetAlertsEnabled(true);
      setIsLoading(false);
    } else if (!authLoading && !user) {
      // Not loading and no user - clear everything
      setMonthlyBudget(null);
      setYearlyBudget(null);
      setCategoryBudgets({});
      setBudgetAlertsEnabled(true);
      setIsLoading(false);
    }
    // If authLoading is true, we're still loading - don't reset data
  }, [user, profile, authLoading]);

  // Calculate spending totals
  const { monthly: monthlySpending, yearly: yearlySpending } = useMemo(() => {
    return BudgetService.calculateSpending(subscriptions);
  }, [subscriptions]);

  // Calculate category spending
  const categorySpending = useMemo(() => {
    return BudgetService.calculateCategorySpending(subscriptions);
  }, [subscriptions]);

  // Calculate budget progress
  const monthlyProgress = useMemo(() => {
    return monthlyBudget ? calculateProgress(monthlySpending, monthlyBudget) : null;
  }, [monthlySpending, monthlyBudget]);

  const yearlyProgress = useMemo(() => {
    return yearlyBudget ? calculateProgress(yearlySpending, yearlyBudget) : null;
  }, [yearlySpending, yearlyBudget]);

  const categoryProgress = useMemo((): CategoryBudgetProgress[] => {
    return Object.entries(categoryBudgets).map(([categoryName, budget]) => {
      const spent = categorySpending[categoryName] || 0;
      const progress = calculateProgress(spent, budget);
      
      return {
        ...progress,
        categoryName,
        categoryColor: undefined // Will be set by component using category colors
      };
    });
  }, [categoryBudgets, categorySpending]);

  // Generate budget insights
  const insights = useMemo((): BudgetInsight[] => {
    const insights: BudgetInsight[] = [];

    // Monthly budget insights
    if (monthlyProgress) {
      if (monthlyProgress.status === 'over_budget') {
        insights.push({
          type: 'budget_exceeded',
          message: `You've exceeded your monthly budget by ${((monthlyProgress.percentageUsed - 100)).toFixed(1)}%`,
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
      }
    });

    return insights;
  }, [monthlyProgress, yearlyProgress, categoryProgress, monthlySpending]);

  // Generate budget alerts
  const alerts = useMemo((): BudgetAlert[] => {
    const alerts: BudgetAlert[] = [];
    
    if (!budgetAlertsEnabled) return alerts;

    // Monthly budget alerts
    if (monthlyProgress && monthlyProgress.percentageUsed >= BUDGET_THRESHOLDS.WARNING) {
      alerts.push({
        id: `monthly-${Date.now()}`,
        type: 'monthly_threshold',
        threshold: BUDGET_THRESHOLDS.WARNING,
        currentAmount: monthlyProgress.spentAmount,
        budgetAmount: monthlyProgress.budgetAmount,
        message: `Monthly budget ${monthlyProgress.percentageUsed.toFixed(1)}% used`,
        createdAt: new Date().toISOString()
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
          createdAt: new Date().toISOString()
        });
      }
    });

    return alerts;
  }, [monthlyProgress, categoryProgress, budgetAlertsEnabled]);

  // Create budget summary
  const budgetSummary = useMemo((): BudgetSummary | null => {
    if (!monthlyProgress && !yearlyProgress && categoryProgress.length === 0) {
      return null;
    }

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
      totalMonthlySpending: monthlySpending,
      totalYearlySpending: yearlySpending,
      monthlyBudgetProgress: monthlyProgress,
      yearlyBudgetProgress: yearlyProgress,
      categoryBudgetProgress: categoryProgress,
      overallStatus,
      insights,
      alerts
    };
  }, [monthlySpending, yearlySpending, monthlyProgress, yearlyProgress, categoryProgress, insights, alerts]);

  // Update budget data
  const updateBudget = useCallback(async (budgetData: Partial<BudgetData>): Promise<boolean> => {
    if (!user) return false;

    setIsLoading(true);
    setError(null);

    try {
      await SettingsService.updateBudgetData(budgetData);

      // Update local state
      if (budgetData.monthlyBudget !== undefined) {
        setMonthlyBudget(budgetData.monthlyBudget);
      }
      if (budgetData.yearlyBudget !== undefined) {
        setYearlyBudget(budgetData.yearlyBudget);
      }
      if (budgetData.categoryBudgets !== undefined) {
        setCategoryBudgets(budgetData.categoryBudgets);
      }
      if (budgetData.budgetAlertsEnabled !== undefined) {
        setBudgetAlertsEnabled(budgetData.budgetAlertsEnabled);
      }

      // Refresh profile data in AuthContext to sync across components
      if (refreshProfile) {
        await refreshProfile();
      }

      return true;
    } catch (err) {
      console.error('Error updating budget:', err);
      setError(err instanceof Error ? err.message : 'Failed to update budget');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, refreshProfile]);

  // Reset budget data
  const resetBudget = useCallback(async (): Promise<boolean> => {
    if (!user) return false;

    setIsLoading(true);
    setError(null);

    try {
      await SettingsService.resetBudgetData();

      // Update local state
      setMonthlyBudget(null);
      setYearlyBudget(null);
      setCategoryBudgets({});
      setBudgetAlertsEnabled(true);

      // Refresh profile data in AuthContext to sync across components
      if (refreshProfile) {
        await refreshProfile();
      }

      return true;
    } catch (err) {
      console.error('Error resetting budget:', err);
      setError(err instanceof Error ? err.message : 'Failed to reset budget');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, refreshProfile]);

  return {
    // Budget data
    monthlyBudget,
    yearlyBudget,
    categoryBudgets,
    budgetAlertsEnabled,
    
    // Calculated values
    monthlySpending,
    yearlySpending,
    budgetSummary,
    
    // Progress tracking
    monthlyProgress,
    yearlyProgress,
    categoryProgress,
    
    // Insights and alerts
    insights,
    alerts,
    
    // Actions
    updateBudget,
    resetBudget,
    
    // State
    isLoading,
    error
  };
};
