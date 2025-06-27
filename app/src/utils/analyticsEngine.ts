import { Subscription } from '../contexts/SubscriptionContext';
import { normalizeToMonthly } from './insightCalculations';
import { getCategoryColor } from './categoryColors';

// Analytics data types
export interface MonthlyTrend {
  month: string;
  amount: number;
  subscriptionCount: number;
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
  color: string;
  subscriptionCount: number;
}

export interface SavingsOpportunity {
  type: 'annual_billing' | 'duplicate_services' | 'unused_features' | 'price_increase';
  title: string;
  description: string;
  potentialSavings: number;
  subscriptions: string[];
  priority: 'high' | 'medium' | 'low';
}

export interface RenewalForecast {
  month: string;
  renewals: number;
  amount: number;
}

export interface TopSubscription {
  name: string;
  category: string;
  monthlyAmount: number;
  yearlyAmount: number;
  percentageOfTotal: number;
}

export interface AnalyticsData {
  totalMonthlySpending: number;
  totalYearlySpending: number;
  averageMonthlySpending: number;
  subscriptionCount: number;
  spendingTrends: MonthlyTrend[];
  categoryBreakdown: CategoryBreakdown[];
  savingsOpportunities: SavingsOpportunity[];
  renewalForecast: RenewalForecast[];
  topSubscriptions: TopSubscription[];
  yearOverYear: {
    currentYear: number;
    previousYear: number;
    change: number;
    changePercentage: number;
  };
}

// Generate monthly spending trends (last 12 months)
export const generateSpendingTrends = (subscriptions: Subscription[]): MonthlyTrend[] => {
  const trends: MonthlyTrend[] = [];
  const currentDate = new Date();
  
  for (let i = 11; i >= 0; i--) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const monthName = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    
    // Calculate spending for this month
    const monthlySpending = subscriptions
      .filter(sub => {
        const startDate = new Date(sub.startDate);
        return startDate <= date;
      })
      .reduce((total, sub) => total + normalizeToMonthly(sub.cost, sub.frequency), 0);
    
    const activeSubscriptions = subscriptions.filter(sub => {
      const startDate = new Date(sub.startDate);
      return startDate <= date;
    }).length;
    
    trends.push({
      month: monthName,
      amount: monthlySpending,
      subscriptionCount: activeSubscriptions
    });
  }
  
  return trends;
};

// Generate category breakdown with colors
export const generateCategoryBreakdown = (subscriptions: Subscription[]): CategoryBreakdown[] => {
  const categoryTotals: Record<string, { amount: number; count: number }> = {};
  
  subscriptions.forEach(sub => {
    const monthlyAmount = normalizeToMonthly(sub.cost, sub.frequency);
    if (!categoryTotals[sub.category]) {
      categoryTotals[sub.category] = { amount: 0, count: 0 };
    }
    categoryTotals[sub.category].amount += monthlyAmount;
    categoryTotals[sub.category].count += 1;
  });
  
  const totalSpending = Object.values(categoryTotals).reduce((sum, cat) => sum + cat.amount, 0);
  
  return Object.entries(categoryTotals)
    .map(([category, data]) => ({
      category,
      amount: data.amount,
      percentage: totalSpending > 0 ? (data.amount / totalSpending) * 100 : 0,
      color: getCategoryColor(category),
      subscriptionCount: data.count
    }))
    .sort((a, b) => b.amount - a.amount);
};

// Detect savings opportunities
export const detectSavingsOpportunities = (subscriptions: Subscription[]): SavingsOpportunity[] => {
  const opportunities: SavingsOpportunity[] = [];
  
  // Annual billing savings
  const monthlySubscriptions = subscriptions.filter(sub => sub.frequency === 'Monthly');
  if (monthlySubscriptions.length > 0) {
    const potentialSavings = monthlySubscriptions.reduce((total, sub) => {
      // Assume 10% savings for annual billing
      return total + (sub.cost * 12 * 0.1);
    }, 0);
    
    if (potentialSavings > 50) {
      opportunities.push({
        type: 'annual_billing',
        title: 'Switch to Annual Billing',
        description: `Save money by switching ${monthlySubscriptions.length} monthly subscriptions to annual billing`,
        potentialSavings,
        subscriptions: monthlySubscriptions.map(sub => sub.name),
        priority: potentialSavings > 200 ? 'high' : 'medium'
      });
    }
  }
  
  // Duplicate services detection
  const categoryGroups = subscriptions.reduce((groups, sub) => {
    if (!groups[sub.category]) groups[sub.category] = [];
    groups[sub.category].push(sub);
    return groups;
  }, {} as Record<string, Subscription[]>);
  
  Object.entries(categoryGroups).forEach(([category, subs]) => {
    if (subs.length > 2 && category === 'Entertainment') {
      const totalCost = subs.reduce((sum, sub) => sum + normalizeToMonthly(sub.cost, sub.frequency), 0);
      opportunities.push({
        type: 'duplicate_services',
        title: 'Multiple Entertainment Services',
        description: `You have ${subs.length} entertainment subscriptions. Consider consolidating.`,
        potentialSavings: totalCost * 0.3, // Assume 30% savings from consolidation
        subscriptions: subs.map(sub => sub.name),
        priority: subs.length > 3 ? 'high' : 'medium'
      });
    }
  });
  
  return opportunities.sort((a, b) => b.potentialSavings - a.potentialSavings);
};

// Generate renewal forecast for next 12 months
export const generateRenewalForecast = (subscriptions: Subscription[]): RenewalForecast[] => {
  const forecast: RenewalForecast[] = [];
  const currentDate = new Date();
  
  for (let i = 0; i < 12; i++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
    const monthName = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    
    let renewals = 0;
    let amount = 0;
    
    subscriptions.forEach(sub => {
      const startDate = new Date(sub.startDate);
      
      if (sub.frequency === 'Monthly') {
        // Monthly subscriptions renew every month
        renewals += 1;
        amount += sub.cost;
      } else if (sub.frequency === 'Yearly') {
        // Check if yearly renewal falls in this month
        const renewalMonth = startDate.getMonth();
        if (renewalMonth === date.getMonth()) {
          renewals += 1;
          amount += sub.cost;
        }
      }
    });
    
    forecast.push({
      month: monthName,
      renewals,
      amount
    });
  }
  
  return forecast;
};

// Get top subscriptions by cost
export const getTopSubscriptions = (subscriptions: Subscription[]): TopSubscription[] => {
  const totalMonthlySpending = subscriptions.reduce((total, sub) => 
    total + normalizeToMonthly(sub.cost, sub.frequency), 0
  );
  
  return subscriptions
    .map(sub => {
      const monthlyAmount = normalizeToMonthly(sub.cost, sub.frequency);
      return {
        name: sub.name,
        category: sub.category,
        monthlyAmount,
        yearlyAmount: monthlyAmount * 12,
        percentageOfTotal: totalMonthlySpending > 0 ? (monthlyAmount / totalMonthlySpending) * 100 : 0
      };
    })
    .sort((a, b) => b.monthlyAmount - a.monthlyAmount)
    .slice(0, 10);
};

// Main analytics engine
export const generateAnalytics = (subscriptions: Subscription[]): AnalyticsData => {
  const totalMonthlySpending = subscriptions.reduce((total, sub) => 
    total + normalizeToMonthly(sub.cost, sub.frequency), 0
  );
  
  const totalYearlySpending = totalMonthlySpending * 12;
  const averageMonthlySpending = subscriptions.length > 0 ? totalMonthlySpending / subscriptions.length : 0;
  
  // Calculate year-over-year comparison (simplified)
  const currentYearSpending = totalYearlySpending;
  const previousYearSpending = currentYearSpending * 0.85; // Simulated 15% growth
  const yearOverYearChange = currentYearSpending - previousYearSpending;
  const yearOverYearPercentage = previousYearSpending > 0 ? (yearOverYearChange / previousYearSpending) * 100 : 0;
  
  return {
    totalMonthlySpending,
    totalYearlySpending,
    averageMonthlySpending,
    subscriptionCount: subscriptions.length,
    spendingTrends: generateSpendingTrends(subscriptions),
    categoryBreakdown: generateCategoryBreakdown(subscriptions),
    savingsOpportunities: detectSavingsOpportunities(subscriptions),
    renewalForecast: generateRenewalForecast(subscriptions),
    topSubscriptions: getTopSubscriptions(subscriptions),
    yearOverYear: {
      currentYear: currentYearSpending,
      previousYear: previousYearSpending,
      change: yearOverYearChange,
      changePercentage: yearOverYearPercentage
    }
  };
};
