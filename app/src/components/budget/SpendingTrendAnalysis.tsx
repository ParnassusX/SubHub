// Spending Trend Analysis Component - Enhanced with budget context
import React, { useMemo } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useCurrency } from '../../hooks/useCurrency';
import { useBudget } from '../../hooks/useBudget';
import { useSubscriptions } from '../../contexts/SubscriptionContext';
import { BudgetService } from '../../services/budgetService';

interface SpendingTrendAnalysisProps {
  className?: string;
  showBudgetComparison?: boolean;
  timeframe?: 'monthly' | 'yearly';
}

interface TrendData {
  period: string;
  spending: number;
  budget: number;
  variance: number;
  percentageUsed: number;
  status: 'under' | 'warning' | 'over';
}

const SpendingTrendAnalysis: React.FC<SpendingTrendAnalysisProps> = ({
  className = '',
  showBudgetComparison = true,
  timeframe = 'monthly'
}) => {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const { monthlyBudget, yearlyBudget, monthlySpending, yearlySpending } = useBudget();
  const { subscriptions } = useSubscriptions();

  // Calculate trend data for the last 6 periods
  const trendData = useMemo(() => {
    const data: TrendData[] = [];
    const currentDate = new Date();
    const budget = timeframe === 'monthly' ? monthlyBudget : yearlyBudget;
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate);
      
      if (timeframe === 'monthly') {
        date.setMonth(date.getMonth() - i);
      } else {
        date.setFullYear(date.getFullYear() - i);
      }
      
      // Calculate spending for this period
      const periodSpending = calculatePeriodSpending(subscriptions, date, timeframe);
      const variance = budget ? periodSpending - budget : 0;
      const percentageUsed = budget ? (periodSpending / budget) * 100 : 0;
      
      let status: 'under' | 'warning' | 'over' = 'under';
      if (percentageUsed > 100) status = 'over';
      else if (percentageUsed > 75) status = 'warning';
      
      data.push({
        period: formatPeriod(date, timeframe),
        spending: periodSpending,
        budget: budget || 0,
        variance,
        percentageUsed,
        status
      });
    }
    
    return data;
  }, [subscriptions, timeframe, monthlyBudget, yearlyBudget]);

  // Calculate period spending
  const calculatePeriodSpending = (
    subs: typeof subscriptions,
    date: Date,
    period: 'monthly' | 'yearly'
  ): number => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    return subs.reduce((total, sub) => {
      const subStart = new Date(sub.startDate);
      
      // Check if subscription was active during this period
      if (period === 'monthly') {
        if (subStart.getFullYear() <= year && 
            (subStart.getFullYear() < year || subStart.getMonth() <= month)) {
          return total + BudgetService.normalizeToMonthly(sub.cost, sub.frequency);
        }
      } else {
        if (subStart.getFullYear() <= year) {
          return total + (sub.frequency === 'Yearly' ? sub.cost : sub.cost * 12);
        }
      }
      
      return total;
    }, 0);
  };

  // Format period label
  const formatPeriod = (date: Date, period: 'monthly' | 'yearly'): string => {
    if (period === 'monthly') {
      return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    } else {
      return date.getFullYear().toString();
    }
  };

  // Calculate trend statistics
  const trendStats = useMemo(() => {
    if (trendData.length < 2) return null;
    
    const current = trendData[trendData.length - 1];
    const previous = trendData[trendData.length - 2];
    const oldest = trendData[0];
    
    const periodChange = current.spending - previous.spending;
    const periodChangePercent = previous.spending > 0 
      ? ((periodChange / previous.spending) * 100) 
      : 0;
    
    const overallChange = current.spending - oldest.spending;
    const overallChangePercent = oldest.spending > 0 
      ? ((overallChange / oldest.spending) * 100) 
      : 0;
    
    const averageSpending = trendData.reduce((sum, data) => sum + data.spending, 0) / trendData.length;
    const averageVariance = trendData.reduce((sum, data) => sum + Math.abs(data.variance), 0) / trendData.length;
    
    return {
      periodChange,
      periodChangePercent,
      overallChange,
      overallChangePercent,
      averageSpending,
      averageVariance,
      trend: overallChange > 0 ? 'increasing' : overallChange < 0 ? 'decreasing' : 'stable'
    };
  }, [trendData]);

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'over': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      default: return 'text-green-400';
    }
  };

  // Get trend icon
  const getTrendIcon = () => {
    if (!trendStats) return '📊';
    switch (trendStats.trend) {
      case 'increasing': return '📈';
      case 'decreasing': return '📉';
      default: return '➡️';
    }
  };

  return (
    <div className={`bg-[#1a2332] rounded-xl border border-[#2e4e6b] p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold text-white">
            {t('spendingTrend', 'Spending Trend')}
          </h3>
          <span className="text-lg">{getTrendIcon()}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {/* Toggle timeframe */}}
            className={`px-3 py-1 text-xs rounded-md transition-colors ${
              timeframe === 'monthly' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {t('monthly', 'Monthly')}
          </button>
          <button
            onClick={() => {/* Toggle timeframe */}}
            className={`px-3 py-1 text-xs rounded-md transition-colors ${
              timeframe === 'yearly' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {t('yearly', 'Yearly')}
          </button>
        </div>
      </div>

      {/* Trend Statistics */}
      {trendStats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-gray-800/30 rounded-lg">
            <p className={`text-lg font-bold ${
              trendStats.periodChangePercent > 0 ? 'text-red-400' : 
              trendStats.periodChangePercent < 0 ? 'text-green-400' : 'text-gray-400'
            }`}>
              {trendStats.periodChangePercent > 0 ? '+' : ''}{trendStats.periodChangePercent.toFixed(1)}%
            </p>
            <p className="text-gray-400 text-xs">{t('lastPeriod', 'Last period')}</p>
          </div>
          
          <div className="text-center p-3 bg-gray-800/30 rounded-lg">
            <p className={`text-lg font-bold ${
              trendStats.overallChangePercent > 0 ? 'text-red-400' : 
              trendStats.overallChangePercent < 0 ? 'text-green-400' : 'text-gray-400'
            }`}>
              {trendStats.overallChangePercent > 0 ? '+' : ''}{trendStats.overallChangePercent.toFixed(1)}%
            </p>
            <p className="text-gray-400 text-xs">{t('overall', 'Overall')}</p>
          </div>
          
          <div className="text-center p-3 bg-gray-800/30 rounded-lg">
            <p className="text-white text-lg font-bold">
              {formatPrice(trendStats.averageSpending)}
            </p>
            <p className="text-gray-400 text-xs">{t('average', 'Average')}</p>
          </div>
          
          {showBudgetComparison && (
            <div className="text-center p-3 bg-gray-800/30 rounded-lg">
              <p className="text-yellow-400 text-lg font-bold">
                {formatPrice(trendStats.averageVariance)}
              </p>
              <p className="text-gray-400 text-xs">{t('avgVariance', 'Avg variance')}</p>
            </div>
          )}
        </div>
      )}

      {/* Trend Chart */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-300">
          {t('last6Periods', `Last 6 ${timeframe === 'monthly' ? 'months' : 'years'}`)}
        </h4>
        
        <div className="space-y-2">
          {trendData.map((data, index) => {
            const maxValue = Math.max(...trendData.map(d => Math.max(d.spending, d.budget)));
            const spendingWidth = maxValue > 0 ? (data.spending / maxValue) * 100 : 0;
            const budgetWidth = maxValue > 0 ? (data.budget / maxValue) * 100 : 0;
            
            return (
              <div key={data.period} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400 w-16">{data.period}</span>
                  <div className="flex items-center space-x-4 flex-1 justify-end">
                    <span className="text-white">{formatPrice(data.spending)}</span>
                    {showBudgetComparison && data.budget > 0 && (
                      <>
                        <span className="text-gray-400">vs {formatPrice(data.budget)}</span>
                        <span className={`font-medium ${getStatusColor(data.status)}`}>
                          {data.percentageUsed.toFixed(0)}%
                        </span>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="relative h-4 bg-gray-700 rounded-full overflow-hidden">
                  {/* Budget line */}
                  {showBudgetComparison && data.budget > 0 && (
                    <div
                      className="absolute top-0 h-full bg-gray-500/30 rounded-full"
                      style={{ width: `${budgetWidth}%` }}
                    />
                  )}
                  
                  {/* Spending bar */}
                  <div
                    className={`absolute top-0 h-full rounded-full transition-all duration-300 ${
                      data.status === 'over' ? 'bg-red-500' :
                      data.status === 'warning' ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${spendingWidth}%` }}
                  />
                  
                  {/* Current period indicator */}
                  {index === trendData.length - 1 && (
                    <div className="absolute top-0 right-0 w-1 h-full bg-blue-400" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Insights */}
      {trendStats && (
        <div className="mt-6 pt-4 border-t border-gray-700">
          <h4 className="text-sm font-medium text-gray-300 mb-3">{t('insights')}</h4>
          
          <div className="space-y-2 text-sm">
            {trendStats.trend === 'increasing' && (
              <div className="flex items-center space-x-2 text-yellow-400">
                <span>⚠️</span>
                <span>
                  {t('spendingIncreasing', 'Your spending is increasing')} 
                  ({trendStats.overallChangePercent.toFixed(1)}% {t('overPeriod', 'over period')})
                </span>
              </div>
            )}
            
            {trendStats.trend === 'decreasing' && (
              <div className="flex items-center space-x-2 text-green-400">
                <span>✅</span>
                <span>
                  {t('spendingDecreasing', 'Your spending is decreasing')} 
                  ({Math.abs(trendStats.overallChangePercent).toFixed(1)}% {t('reduction', 'reduction')})
                </span>
              </div>
            )}
            
            {showBudgetComparison && trendStats.averageVariance > 0 && (
              <div className="flex items-center space-x-2 text-blue-400">
                <span>💡</span>
                <span>
                  {t('averageBudgetVariance', 'Average budget variance')}: {formatPrice(trendStats.averageVariance)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SpendingTrendAnalysis;
