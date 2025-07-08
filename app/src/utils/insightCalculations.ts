import { Subscription } from '../contexts/SubscriptionContext';

// Types for insights
export interface SpendingInsight {
  type: 'spending_increase' | 'spending_decrease' | 'spending_stable';
  percentage: number;
  amount: number;
  primaryCategory?: string;
  message: string;
  recommendation?: string;
  severity: 'low' | 'medium' | 'high';
}

export interface RenewalInsight {
  urgentCount: number;
  weekCount: number;
  monthCount: number;
  nextRenewal: {
    name: string;
    daysUntil: number;
    cost: number;
  } | null;
  message: string;
  actionable: boolean;
}

export interface CategoryInsight {
  topCategory: string;
  topCategoryAmount: number;
  topCategoryPercentage: number;
  message: string;
  breakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
}

export interface BudgetInsight {
  type: 'budget_exceeded' | 'budget_warning' | 'budget_healthy' | 'no_budget_set' | 'budget_optimization';
  budgetType: 'monthly' | 'yearly' | 'category';
  categoryName?: string;
  currentSpending: number;
  budgetAmount: number;
  percentageUsed: number;
  variance: number;
  message: string;
  recommendation?: string;
  severity: 'low' | 'medium' | 'high';
  actionable: boolean;
}

export interface BudgetComparison {
  monthlyBudgetStatus: 'over' | 'warning' | 'healthy' | 'not_set';
  yearlyBudgetStatus: 'over' | 'warning' | 'healthy' | 'not_set';
  categoryBudgetIssues: Array<{
    category: string;
    status: 'over' | 'warning';
    percentageUsed: number;
    overage: number;
  }>;
  overallHealthScore: number; // 0-100
  totalVariance: number;
  recommendations: string[];
}

// Utility functions
export const normalizeToMonthly = (cost: number, frequency: 'Monthly' | 'Yearly'): number => {
  return frequency === 'Monthly' ? cost : cost / 12;
};

export const isActiveInMonth = (subscription: Subscription, month: number, year: number): boolean => {
  const startDate = new Date(subscription.startDate);
  const startMonth = startDate.getMonth();
  const startYear = startDate.getFullYear();
  
  // Check if subscription was active in the given month
  if (startYear > year || (startYear === year && startMonth > month)) {
    return false; // Subscription hadn't started yet
  }
  
  return true; // Subscription was active (we don't handle end dates for now)
};

export const calculateNextRenewal = (subscription: Subscription): Date => {
  // Use next_billing field if available and valid
  if (subscription.nextBilling) {
    const nextBillingDate = new Date(subscription.nextBilling);
    const today = new Date();

    // If next_billing is in the future, use it
    if (nextBillingDate > today) {
      return nextBillingDate;
    }
  }

  // Fallback to calculation from start date
  const startDate = new Date(subscription.startDate);
  const today = new Date();
  const nextRenewal = new Date(startDate);

  if (subscription.frequency === 'Monthly') {
    // Find next monthly renewal
    while (nextRenewal <= today) {
      nextRenewal.setMonth(nextRenewal.getMonth() + 1);
    }
  } else {
    // Find next yearly renewal
    while (nextRenewal <= today) {
      nextRenewal.setFullYear(nextRenewal.getFullYear() + 1);
    }
  }

  return nextRenewal;
};

export const calculateDaysUntil = (date: Date): number => {
  const today = new Date();
  const diffTime = date.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Main insight calculation functions
export const calculateSpendingInsights = (subscriptions: Subscription[]): SpendingInsight => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  // Calculate current month spending
  const currentMonthSpending = subscriptions
    .filter(sub => isActiveInMonth(sub, currentMonth, currentYear))
    .reduce((total, sub) => total + normalizeToMonthly(sub.cost, sub.frequency), 0);
  
  // Calculate previous month spending
  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const prevMonthSpending = subscriptions
    .filter(sub => isActiveInMonth(sub, prevMonth, prevYear))
    .reduce((total, sub) => total + normalizeToMonthly(sub.cost, sub.frequency), 0);
  
  const difference = currentMonthSpending - prevMonthSpending;
  const percentage = prevMonthSpending > 0 ? (difference / prevMonthSpending) * 100 : 0;
  
  // Find primary category contributing to change
  const categoryChanges = calculateCategoryChanges(subscriptions, currentMonth, prevMonth, currentYear);
  const primaryCategory = categoryChanges.length > 0 ? 
    categoryChanges.sort((a, b) => Math.abs(b.change) - Math.abs(a.change))[0] : null;
  
  // Generate insight message
  let message: string;
  let recommendation: string | undefined;
  let severity: 'low' | 'medium' | 'high';
  
  if (Math.abs(percentage) < 5) {
    message = `Your spending is stable at ${currentMonthSpending.toFixed(2)} this month`;
    severity = 'low';
  } else if (percentage > 0) {
    message = `You're spending ${percentage.toFixed(1)}% more this month (${difference.toFixed(2)} increase)`;
    if (primaryCategory) {
      message += ` - mostly on ${primaryCategory.name} subscriptions`;
    }
    severity = percentage > 20 ? 'high' : 'medium';
    recommendation = percentage > 15 ? 'Consider reviewing your recent subscriptions' : undefined;
  } else {
    message = `You're spending ${Math.abs(percentage).toFixed(1)}% less this month (${Math.abs(difference).toFixed(2)} savings)`;
    if (primaryCategory) {
      message += ` - mainly from ${primaryCategory.name} changes`;
    }
    severity = 'low';
  }
  
  return {
    type: percentage > 5 ? 'spending_increase' : percentage < -5 ? 'spending_decrease' : 'spending_stable',
    percentage: Math.abs(percentage),
    amount: Math.abs(difference),
    primaryCategory: primaryCategory?.name,
    message,
    recommendation,
    severity
  };
};

const calculateCategoryChanges = (
  subscriptions: Subscription[], 
  currentMonth: number, 
  prevMonth: number, 
  currentYear: number
): Array<{ name: string; change: number }> => {
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  
  // Group by category for current month
  const currentCategories = subscriptions
    .filter(sub => isActiveInMonth(sub, currentMonth, currentYear))
    .reduce((acc, sub) => {
      const monthly = normalizeToMonthly(sub.cost, sub.frequency);
      acc[sub.category] = (acc[sub.category] || 0) + monthly;
      return acc;
    }, {} as Record<string, number>);
  
  // Group by category for previous month
  const prevCategories = subscriptions
    .filter(sub => isActiveInMonth(sub, prevMonth, prevYear))
    .reduce((acc, sub) => {
      const monthly = normalizeToMonthly(sub.cost, sub.frequency);
      acc[sub.category] = (acc[sub.category] || 0) + monthly;
      return acc;
    }, {} as Record<string, number>);
  
  // Calculate changes
  const allCategories = new Set([...Object.keys(currentCategories), ...Object.keys(prevCategories)]);
  
  return Array.from(allCategories).map(category => ({
    name: category,
    change: (currentCategories[category] || 0) - (prevCategories[category] || 0)
  }));
};

export const generateRenewalInsights = (subscriptions: Subscription[]): RenewalInsight => {
  const renewals = subscriptions
    .map(sub => ({
      ...sub,
      nextRenewalDate: calculateNextRenewal(sub),
      daysUntil: calculateDaysUntil(calculateNextRenewal(sub))
    }))
    .filter(sub => sub.daysUntil >= 0)
    .sort((a, b) => a.daysUntil - b.daysUntil);
  
  const urgentCount = renewals.filter(r => r.daysUntil <= 3).length;
  const weekCount = renewals.filter(r => r.daysUntil <= 7).length;
  const monthCount = renewals.filter(r => r.daysUntil <= 30).length;
  
  const nextRenewal = renewals[0];
  
  let message: string;
  if (urgentCount > 0) {
    message = `${urgentCount} renewal${urgentCount > 1 ? 's' : ''} in the next 3 days`;
    if (nextRenewal) {
      message += ` - ${nextRenewal.name} renews ${nextRenewal.daysUntil === 0 ? 'today' : 
        nextRenewal.daysUntil === 1 ? 'tomorrow' : `in ${nextRenewal.daysUntil} days`}`;
    }
  } else if (weekCount > 0) {
    message = `${weekCount} renewal${weekCount > 1 ? 's' : ''} coming up this week`;
    if (nextRenewal) {
      message += ` - next is ${nextRenewal.name} in ${nextRenewal.daysUntil} days`;
    }
  } else if (monthCount > 0) {
    message = `${monthCount} renewal${monthCount > 1 ? 's' : ''} this month`;
    if (nextRenewal) {
      message += ` - next is ${nextRenewal.name} in ${nextRenewal.daysUntil} days`;
    }
  } else {
    message = "No renewals in the next 30 days";
  }
  
  return {
    urgentCount,
    weekCount,
    monthCount,
    nextRenewal: nextRenewal ? {
      name: nextRenewal.name,
      daysUntil: nextRenewal.daysUntil,
      cost: nextRenewal.cost
    } : null,
    message,
    actionable: urgentCount > 0 || weekCount > 0
  };
};

export const generateCategoryInsights = (subscriptions: Subscription[]): CategoryInsight => {
  const categorySpending = subscriptions.reduce((acc, sub) => {
    const monthly = normalizeToMonthly(sub.cost, sub.frequency);
    acc[sub.category] = (acc[sub.category] || 0) + monthly;
    return acc;
  }, {} as Record<string, number>);
  
  const totalSpending = Object.values(categorySpending).reduce((sum, amount) => sum + amount, 0);
  const topCategory = Object.entries(categorySpending)
    .sort(([,a], [,b]) => b - a)[0];
  
  if (!topCategory || totalSpending === 0) {
    return {
      topCategory: 'None',
      topCategoryAmount: 0,
      topCategoryPercentage: 0,
      message: 'No subscription data available',
      breakdown: []
    };
  }
  
  const topCategoryPercentage = (topCategory[1] / totalSpending) * 100;
  
  return {
    topCategory: topCategory[0],
    topCategoryAmount: topCategory[1],
    topCategoryPercentage,
    message: `${topCategory[0]} is your biggest expense at ${topCategoryPercentage.toFixed(1)}% of your subscriptions`,
    breakdown: Object.entries(categorySpending)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: (amount / totalSpending) * 100
      }))
      .sort((a, b) => b.amount - a.amount)
  };
};

// Budget comparison functions
export const calculateBudgetInsights = (
  subscriptions: Subscription[],
  monthlyBudget?: number,
  yearlyBudget?: number,
  categoryBudgets?: Record<string, number>
): BudgetInsight[] => {
  const insights: BudgetInsight[] = [];

  // Calculate current spending
  const monthlySpending = subscriptions.reduce((total, sub) => {
    return total + normalizeToMonthly(sub.cost, sub.frequency);
  }, 0);

  const yearlySpending = monthlySpending * 12;

  // Monthly budget insights
  if (monthlyBudget && monthlyBudget > 0) {
    const percentageUsed = (monthlySpending / monthlyBudget) * 100;
    const variance = monthlySpending - monthlyBudget;

    if (percentageUsed > 100) {
      insights.push({
        type: 'budget_exceeded',
        budgetType: 'monthly',
        currentSpending: monthlySpending,
        budgetAmount: monthlyBudget,
        percentageUsed,
        variance,
        message: `You've exceeded your monthly budget by ${Math.abs(variance).toFixed(2)}`,
        recommendation: 'Consider reviewing your subscriptions or adjusting your budget',
        severity: 'high',
        actionable: true
      });
    } else if (percentageUsed > 75) {
      insights.push({
        type: 'budget_warning',
        budgetType: 'monthly',
        currentSpending: monthlySpending,
        budgetAmount: monthlyBudget,
        percentageUsed,
        variance,
        message: `You've used ${percentageUsed.toFixed(1)}% of your monthly budget`,
        recommendation: 'Monitor your spending to stay within budget',
        severity: 'medium',
        actionable: true
      });
    } else if (percentageUsed < 50) {
      insights.push({
        type: 'budget_optimization',
        budgetType: 'monthly',
        currentSpending: monthlySpending,
        budgetAmount: monthlyBudget,
        percentageUsed,
        variance,
        message: `You're only using ${percentageUsed.toFixed(1)}% of your monthly budget`,
        recommendation: 'Consider reallocating unused budget or saving the difference',
        severity: 'low',
        actionable: true
      });
    } else {
      insights.push({
        type: 'budget_healthy',
        budgetType: 'monthly',
        currentSpending: monthlySpending,
        budgetAmount: monthlyBudget,
        percentageUsed,
        variance,
        message: `Your monthly spending is well within budget`,
        severity: 'low',
        actionable: false
      });
    }
  } else {
    insights.push({
      type: 'no_budget_set',
      budgetType: 'monthly',
      currentSpending: monthlySpending,
      budgetAmount: 0,
      percentageUsed: 0,
      variance: 0,
      message: 'No monthly budget set',
      recommendation: 'Set a monthly budget to track your spending',
      severity: 'medium',
      actionable: true
    });
  }

  // Yearly budget insights
  if (yearlyBudget && yearlyBudget > 0) {
    const percentageUsed = (yearlySpending / yearlyBudget) * 100;
    const variance = yearlySpending - yearlyBudget;

    if (percentageUsed > 100) {
      insights.push({
        type: 'budget_exceeded',
        budgetType: 'yearly',
        currentSpending: yearlySpending,
        budgetAmount: yearlyBudget,
        percentageUsed,
        variance,
        message: `Your yearly spending exceeds budget by ${Math.abs(variance).toFixed(2)}`,
        recommendation: 'Review your annual subscriptions and consider canceling unused services',
        severity: 'high',
        actionable: true
      });
    } else if (percentageUsed > 75) {
      insights.push({
        type: 'budget_warning',
        budgetType: 'yearly',
        currentSpending: yearlySpending,
        budgetAmount: yearlyBudget,
        percentageUsed,
        variance,
        message: `You're using ${percentageUsed.toFixed(1)}% of your yearly budget`,
        recommendation: 'Monitor your annual spending to stay on track',
        severity: 'medium',
        actionable: true
      });
    }
  }

  // Category budget insights
  if (categoryBudgets) {
    const categorySpending = calculateCategorySpending(subscriptions);

    Object.entries(categoryBudgets).forEach(([category, budget]) => {
      const spending = categorySpending[category] || 0;
      const percentageUsed = budget > 0 ? (spending / budget) * 100 : 0;
      const variance = spending - budget;

      if (percentageUsed > 100) {
        insights.push({
          type: 'budget_exceeded',
          budgetType: 'category',
          categoryName: category,
          currentSpending: spending,
          budgetAmount: budget,
          percentageUsed,
          variance,
          message: `${category} spending exceeds budget by ${Math.abs(variance).toFixed(2)}`,
          recommendation: `Review your ${category} subscriptions`,
          severity: 'high',
          actionable: true
        });
      } else if (percentageUsed > 75) {
        insights.push({
          type: 'budget_warning',
          budgetType: 'category',
          categoryName: category,
          currentSpending: spending,
          budgetAmount: budget,
          percentageUsed,
          variance,
          message: `${category} is at ${percentageUsed.toFixed(1)}% of budget`,
          recommendation: `Monitor ${category} spending`,
          severity: 'medium',
          actionable: true
        });
      }
    });
  }

  return insights;
};

export const calculateCategorySpending = (subscriptions: Subscription[]): Record<string, number> => {
  return subscriptions.reduce((acc, subscription) => {
    const category = subscription.category || 'Other';
    const monthlyAmount = normalizeToMonthly(subscription.cost, subscription.frequency);
    acc[category] = (acc[category] || 0) + monthlyAmount;
    return acc;
  }, {} as Record<string, number>);
};

export const generateBudgetComparison = (
  subscriptions: Subscription[],
  monthlyBudget?: number,
  yearlyBudget?: number,
  categoryBudgets?: Record<string, number>
): BudgetComparison => {
  const monthlySpending = subscriptions.reduce((total, sub) => {
    return total + normalizeToMonthly(sub.cost, sub.frequency);
  }, 0);

  const yearlySpending = monthlySpending * 12;
  const categorySpending = calculateCategorySpending(subscriptions);

  // Monthly budget status
  let monthlyBudgetStatus: 'over' | 'warning' | 'healthy' | 'not_set' = 'not_set';
  if (monthlyBudget && monthlyBudget > 0) {
    const monthlyPercentage = (monthlySpending / monthlyBudget) * 100;
    if (monthlyPercentage > 100) monthlyBudgetStatus = 'over';
    else if (monthlyPercentage > 75) monthlyBudgetStatus = 'warning';
    else monthlyBudgetStatus = 'healthy';
  }

  // Yearly budget status
  let yearlyBudgetStatus: 'over' | 'warning' | 'healthy' | 'not_set' = 'not_set';
  if (yearlyBudget && yearlyBudget > 0) {
    const yearlyPercentage = (yearlySpending / yearlyBudget) * 100;
    if (yearlyPercentage > 100) yearlyBudgetStatus = 'over';
    else if (yearlyPercentage > 75) yearlyBudgetStatus = 'warning';
    else yearlyBudgetStatus = 'healthy';
  }

  // Category budget issues
  const categoryBudgetIssues: Array<{
    category: string;
    status: 'over' | 'warning';
    percentageUsed: number;
    overage: number;
  }> = [];

  if (categoryBudgets) {
    Object.entries(categoryBudgets).forEach(([category, budget]) => {
      const spending = categorySpending[category] || 0;
      const percentageUsed = budget > 0 ? (spending / budget) * 100 : 0;

      if (percentageUsed > 100) {
        categoryBudgetIssues.push({
          category,
          status: 'over',
          percentageUsed,
          overage: spending - budget
        });
      } else if (percentageUsed > 75) {
        categoryBudgetIssues.push({
          category,
          status: 'warning',
          percentageUsed,
          overage: 0
        });
      }
    });
  }

  // Calculate overall health score (0-100)
  let healthScore = 100;
  if (monthlyBudgetStatus === 'over') healthScore -= 30;
  else if (monthlyBudgetStatus === 'warning') healthScore -= 15;

  if (yearlyBudgetStatus === 'over') healthScore -= 20;
  else if (yearlyBudgetStatus === 'warning') healthScore -= 10;

  categoryBudgetIssues.forEach(issue => {
    if (issue.status === 'over') healthScore -= 10;
    else if (issue.status === 'warning') healthScore -= 5;
  });

  healthScore = Math.max(0, healthScore);

  // Calculate total variance
  let totalVariance = 0;
  if (monthlyBudget) totalVariance += monthlySpending - monthlyBudget;
  if (yearlyBudget) totalVariance += (yearlySpending - yearlyBudget) / 12; // Normalize to monthly

  // Generate recommendations
  const recommendations: string[] = [];
  if (monthlyBudgetStatus === 'over') {
    recommendations.push('Reduce monthly subscription spending or increase budget');
  }
  if (yearlyBudgetStatus === 'over') {
    recommendations.push('Review annual subscriptions for potential savings');
  }
  if (categoryBudgetIssues.length > 0) {
    recommendations.push(`Review spending in ${categoryBudgetIssues.length} over-budget categories`);
  }
  if (healthScore < 70) {
    recommendations.push('Consider a comprehensive budget review');
  }

  return {
    monthlyBudgetStatus,
    yearlyBudgetStatus,
    categoryBudgetIssues,
    overallHealthScore: healthScore,
    totalVariance,
    recommendations
  };
};
