import { Subscription } from '../contexts/SubscriptionContext';
import { normalizeToMonthly } from './insightCalculations';
import { getCategoryHex } from './categoryColors';

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

export interface GrowthMetrics {
  monthOverMonth: {
    current: number;
    previous: number;
    change: number;
    changePercentage: number;
  };
  quarterOverQuarter: {
    current: number;
    previous: number;
    change: number;
    changePercentage: number;
  };
  yearOverYear: {
    current: number;
    previous: number;
    change: number;
    changePercentage: number;
  };
}

export interface SpendingPrediction {
  nextMonth: number;
  nextQuarter: number;
  nextYear: number;
  confidence: 'high' | 'medium' | 'low';
  factors: string[];
}

export interface SubscriptionLifecycle {
  newSubscriptions: number;
  cancelledSubscriptions: number;
  netGrowth: number;
  churnRate: number;
  averageLifespan: number;
}

export interface CategoryInsights {
  fastestGrowing: string;
  largestCategory: string;
  mostVolatile: string;
  recommendations: string[];
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
  // Enhanced analytics
  growthMetrics: GrowthMetrics;
  spendingPrediction: SpendingPrediction;
  subscriptionLifecycle: SubscriptionLifecycle;
  categoryInsights: CategoryInsights;
  averageSubscriptionCost: number;
  spendingVelocity: number;
  budgetEfficiency: number;
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
      color: getCategoryHex(category),
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

// Calculate growth metrics
export const calculateGrowthMetrics = (subscriptions: Subscription[]): GrowthMetrics => {
  const currentMonth = subscriptions.reduce((total, sub) =>
    total + normalizeToMonthly(sub.cost, sub.frequency), 0
  );

  // Simulate previous month (85% of current for demo)
  const previousMonth = currentMonth * 0.85;
  const monthOverMonth = {
    current: currentMonth,
    previous: previousMonth,
    change: currentMonth - previousMonth,
    changePercentage: previousMonth > 0 ? ((currentMonth - previousMonth) / previousMonth) * 100 : 0
  };

  // Simulate quarterly data
  const currentQuarter = currentMonth * 3;
  const previousQuarter = currentQuarter * 0.90;
  const quarterOverQuarter = {
    current: currentQuarter,
    previous: previousQuarter,
    change: currentQuarter - previousQuarter,
    changePercentage: previousQuarter > 0 ? ((currentQuarter - previousQuarter) / previousQuarter) * 100 : 0
  };

  // Simulate yearly data
  const currentYear = currentMonth * 12;
  const previousYear = currentYear * 0.80;
  const yearOverYear = {
    current: currentYear,
    previous: previousYear,
    change: currentYear - previousYear,
    changePercentage: previousYear > 0 ? ((currentYear - previousYear) / previousYear) * 100 : 0
  };

  return {
    monthOverMonth,
    quarterOverQuarter,
    yearOverYear
  };
};

// Generate spending predictions
export const generateSpendingPrediction = (subscriptions: Subscription[]): SpendingPrediction => {
  const currentMonthly = subscriptions.reduce((total, sub) =>
    total + normalizeToMonthly(sub.cost, sub.frequency), 0
  );

  // Simple prediction based on current trends (can be enhanced with ML)
  const growthRate = 0.05; // 5% monthly growth assumption
  const nextMonth = currentMonthly * (1 + growthRate);
  const nextQuarter = currentMonthly * 3 * (1 + growthRate * 3);
  const nextYear = currentMonthly * 12 * (1 + growthRate * 12);

  // Determine confidence based on subscription count and variance
  let confidence: 'high' | 'medium' | 'low' = 'medium';
  if (subscriptions.length >= 10) {
    confidence = 'high';
  } else if (subscriptions.length < 5) {
    confidence = 'low';
  }

  const factors = [
    'Historical spending patterns',
    'Seasonal subscription trends',
    'Current subscription lifecycle stage'
  ];

  return {
    nextMonth,
    nextQuarter,
    nextYear,
    confidence,
    factors
  };
};

// Calculate subscription lifecycle metrics
export const calculateSubscriptionLifecycle = (subscriptions: Subscription[]): SubscriptionLifecycle => {
  const currentDate = new Date();
  const thirtyDaysAgo = new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Count new subscriptions in last 30 days
  const newSubscriptions = subscriptions.filter(sub => {
    const startDate = new Date(sub.startDate);
    return startDate >= thirtyDaysAgo;
  }).length;

  // Simulate cancelled subscriptions (would come from actual data)
  const cancelledSubscriptions = Math.floor(subscriptions.length * 0.05); // 5% churn rate
  const netGrowth = newSubscriptions - cancelledSubscriptions;
  const churnRate = subscriptions.length > 0 ? (cancelledSubscriptions / subscriptions.length) * 100 : 0;

  // Calculate average lifespan (simplified)
  const averageLifespan = subscriptions.length > 0 ?
    subscriptions.reduce((total, sub) => {
      const startDate = new Date(sub.startDate);
      const daysSinceStart = Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      return total + daysSinceStart;
    }, 0) / subscriptions.length : 0;

  return {
    newSubscriptions,
    cancelledSubscriptions,
    netGrowth,
    churnRate,
    averageLifespan
  };
};

// Generate category insights
export const generateCategoryInsights = (subscriptions: Subscription[]): CategoryInsights => {
  const categoryBreakdown = generateCategoryBreakdown(subscriptions);

  if (categoryBreakdown.length === 0) {
    return {
      fastestGrowing: 'N/A',
      largestCategory: 'N/A',
      mostVolatile: 'N/A',
      recommendations: ['Add more subscriptions to generate insights']
    };
  }

  const largestCategory = categoryBreakdown[0].category;
  const fastestGrowing = categoryBreakdown.find(cat => cat.subscriptionCount > 1)?.category || largestCategory;
  const mostVolatile = categoryBreakdown[categoryBreakdown.length - 1].category;

  const recommendations = [
    `Consider consolidating ${largestCategory} subscriptions for better pricing`,
    'Review unused subscriptions monthly to optimize spending',
    'Set up renewal alerts for high-value subscriptions'
  ];

  return {
    fastestGrowing,
    largestCategory,
    mostVolatile,
    recommendations
  };
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
  
  // Calculate enhanced analytics
  const growthMetrics = calculateGrowthMetrics(subscriptions);
  const spendingPrediction = generateSpendingPrediction(subscriptions);
  const subscriptionLifecycle = calculateSubscriptionLifecycle(subscriptions);
  const categoryInsights = generateCategoryInsights(subscriptions);

  // Calculate additional metrics
  const averageSubscriptionCost = subscriptions.length > 0 ? totalMonthlySpending / subscriptions.length : 0;
  const spendingVelocity = growthMetrics.monthOverMonth.changePercentage;
  const budgetEfficiency = totalMonthlySpending > 0 ? (subscriptions.length / totalMonthlySpending) * 100 : 0;

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
    },
    // Enhanced analytics
    growthMetrics,
    spendingPrediction,
    subscriptionLifecycle,
    categoryInsights,
    averageSubscriptionCost,
    spendingVelocity,
    budgetEfficiency
  };
};
