// Budget Insights Component - Intelligent budget recommendations and insights
import React, { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useCurrency } from '../../hooks/useCurrency';
import { useBudget } from '../../hooks/useBudget';
import { useSubscriptions } from '../../contexts/SubscriptionContext';
import { BudgetService } from '../../services/budgetService';

interface BudgetInsightsProps {
  className?: string;
  maxInsights?: number;
  showRecommendations?: boolean;
}

const BudgetInsights: React.FC<BudgetInsightsProps> = ({
  className = '',
  maxInsights = 3,
  showRecommendations = true
}) => {
  const { t } = useTranslation();
  const { formatPrice, currency } = useCurrency();
  const { 
    monthlyBudget, 
    yearlyBudget, 
    monthlySpending, 
    yearlySpending,
    insights, 
    alerts,
    budgetSummary,
    isLoading 
  } = useBudget();
  const { subscriptions } = useSubscriptions();
  const [dismissedInsights, setDismissedInsights] = useState<Set<string>>(new Set());

  // Generate additional insights based on spending patterns
  const generateAdvancedInsights = () => {
    const advancedInsights = [];

    // Analyze subscription frequency patterns
    const monthlyCount = subscriptions.filter(sub => sub.frequency === 'Monthly').length;
    const yearlyCount = subscriptions.filter(sub => sub.frequency === 'Yearly').length;
    
    if (yearlyCount > monthlyCount && monthlyBudget && !yearlyBudget) {
      advancedInsights.push({
        id: 'yearly-budget-suggestion',
        type: 'suggestion',
        title: t('considerYearlyBudget', 'Consider setting a yearly budget'),
        message: t('yearlyBudgetInsight', 'You have more yearly subscriptions than monthly ones. A yearly budget could help track annual spending.'),
        severity: 'low' as const,
        icon: '📊',
        action: t('setBudget')
      });
    }

    // Analyze spending concentration
    const categorySpending = BudgetService.calculateCategorySpending(subscriptions);
    const totalSpending = Object.values(categorySpending).reduce((sum, amount) => sum + amount, 0);
    const topCategory = Object.entries(categorySpending).sort(([,a], [,b]) => b - a)[0];
    
    if (topCategory && topCategory[1] > totalSpending * 0.5) {
      advancedInsights.push({
        id: 'spending-concentration',
        type: 'warning',
        title: t('spendingConcentrated', 'Spending concentrated in one category'),
        message: t('spendingConcentrationInsight', `${topCategory[0]} accounts for ${Math.round((topCategory[1] / totalSpending) * 100)}% of your spending. Consider diversifying or setting category limits.`),
        severity: 'medium' as const,
        icon: '⚠️',
        action: t('setCategoryBudgets', 'Set Category Budgets')
      });
    }

    // Analyze unused subscriptions (placeholder for future enhancement)
    const oldSubscriptions = subscriptions.filter(sub => {
      const startDate = new Date(sub.startDate);
      const monthsOld = (Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
      return monthsOld > 6;
    });

    if (oldSubscriptions.length > 3) {
      advancedInsights.push({
        id: 'review-old-subscriptions',
        type: 'suggestion',
        title: t('reviewOldSubscriptions', 'Review long-running subscriptions'),
        message: t('oldSubscriptionsInsight', `You have ${oldSubscriptions.length} subscriptions older than 6 months. Consider reviewing their usage.`),
        severity: 'low' as const,
        icon: '🔍',
        action: t('reviewSubscriptions', 'Review Subscriptions')
      });
    }

    // Budget optimization suggestions
    if (monthlyBudget && monthlySpending < monthlyBudget * 0.7) {
      const savings = monthlyBudget - monthlySpending;
      advancedInsights.push({
        id: 'budget-optimization',
        type: 'success',
        title: t('budgetOptimization', 'Budget optimization opportunity'),
        message: t('budgetOptimizationInsight', `You're spending ${formatPrice(savings)} less than your budget. Consider reallocating or saving this amount.`),
        severity: 'low' as const,
        icon: '💡',
        action: t('adjustBudget')
      });
    }

    return advancedInsights;
  };

  // Combine insights from useBudget hook and advanced insights
  const allInsights = [
    ...insights.map(insight => ({
      id: `budget-${insight.type}`,
      type: insight.type,
      title: getInsightTitle(insight),
      message: insight.message,
      severity: insight.severity,
      icon: getInsightIcon(insight),
      action: insight.recommendation
    })),
    ...generateAdvancedInsights()
  ].filter(insight => !dismissedInsights.has(insight.id));

  // Get insight title based on type
  function getInsightTitle(insight: any) {
    switch (insight.type) {
      case 'budget_exceeded':
        return t('budgetExceeded');
      case 'budget_warning':
        return t('budgetWarning', 'Budget Warning');
      case 'budget_healthy':
        return t('budgetHealthy', 'Budget Healthy');
      case 'no_budget_set':
        return t('noBudgetSet');
      default:
        return t('budgetInsight', 'Budget Insight');
    }
  }

  // Get insight icon based on type and severity
  function getInsightIcon(insight: any) {
    if (insight.severity === 'high') return '🚨';
    if (insight.severity === 'medium') return '⚠️';
    if (insight.type === 'budget_healthy') return '✅';
    if (insight.type === 'no_budget_set') return '📊';
    return '💡';
  }

  // Dismiss an insight
  const dismissInsight = (insightId: string) => {
    setDismissedInsights(prev => new Set([...prev, insightId]));
  };

  // Get severity color classes
  const getSeverityClasses = (severity: string) => {
    switch (severity) {
      case 'high':
        return { bg: 'bg-red-900/20', border: 'border-red-700/50', text: 'text-red-400' };
      case 'medium':
        return { bg: 'bg-yellow-900/20', border: 'border-yellow-700/50', text: 'text-yellow-400' };
      default:
        return { bg: 'bg-blue-900/20', border: 'border-blue-700/50', text: 'text-blue-400' };
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className={`bg-[#1a2332] rounded-xl border border-[#2e4e6b] p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="p-3 bg-gray-800/30 rounded-lg">
                <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-700 rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-[#1a2332] rounded-xl border border-[#2e4e6b] p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">{t('budgetInsights', 'Budget Insights')}</h3>
        {allInsights.length > 0 && (
          <span className="text-xs text-gray-400">
            {allInsights.length} {t('insights', 'insights')}
          </span>
        )}
      </div>

      {allInsights.length === 0 ? (
        /* No Insights */
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">
            <svg className="w-12 h-12 mx-auto opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h4 className="text-white font-medium mb-2">{t('noInsightsAvailable', 'No insights available')}</h4>
          <p className="text-gray-400 text-sm">
            {t('insightsWillAppear', 'Insights will appear as you use budget features and add subscriptions')}
          </p>
        </div>
      ) : (
        /* Insights List */
        <div className="space-y-3">
          {allInsights.slice(0, maxInsights).map(insight => {
            const severityClasses = getSeverityClasses(insight.severity);
            
            return (
              <div
                key={insight.id}
                className={`p-4 rounded-lg border ${severityClasses.bg} ${severityClasses.border}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="text-lg flex-shrink-0">{insight.icon}</div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-medium ${severityClasses.text} mb-1`}>
                        {insight.title}
                      </h4>
                      <p className="text-sm text-gray-300 mb-2">
                        {insight.message}
                      </p>
                      {insight.action && showRecommendations && (
                        <button className={`text-xs ${severityClasses.text} hover:opacity-80 transition-opacity`}>
                          {insight.action} →
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => dismissInsight(insight.id)}
                    className="text-gray-400 hover:text-gray-300 transition-colors ml-2"
                    aria-label={t('dismissInsight', 'Dismiss insight')}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View More */}
      {allInsights.length > maxInsights && (
        <div className="mt-4 text-center">
          <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
            {t('viewMoreInsights', 'View more insights')} ({allInsights.length - maxInsights})
          </button>
        </div>
      )}

      {/* Quick Stats */}
      {budgetSummary && (
        <div className="mt-6 pt-4 border-t border-gray-700">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-400">{t('totalSpending', 'Total spending')}</p>
              <p className="text-sm font-semibold text-white">
                {formatPrice(budgetSummary.totalMonthlySpending)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">{t('activeAlerts', 'Active alerts')}</p>
              <p className="text-sm font-semibold text-yellow-400">
                {alerts.length}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">{t('overallStatus', 'Overall status')}</p>
              <p className={`text-sm font-semibold ${
                budgetSummary.overallStatus === 'exceeded' ? 'text-red-400' :
                budgetSummary.overallStatus === 'warning' ? 'text-yellow-400' :
                'text-green-400'
              }`}>
                {t(budgetSummary.overallStatus === 'exceeded' ? 'exceeded' : 
                   budgetSummary.overallStatus === 'warning' ? 'warning' : 'healthy',
                   budgetSummary.overallStatus)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetInsights;
