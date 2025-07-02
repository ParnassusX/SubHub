// Budget Overview Component - Dashboard widget for budget status
import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useCurrency } from '../../hooks/useCurrency';
import { useBudget } from '../../hooks/useBudget';
import { BudgetService } from '../../services/budgetService';
import BudgetProgressBar from './BudgetProgressBar';

interface BudgetOverviewProps {
  className?: string;
  showDetails?: boolean;
  onEditBudget?: () => void;
}

const BudgetOverview: React.FC<BudgetOverviewProps> = ({
  className = '',
  showDetails = true,
  onEditBudget
}) => {
  const { t } = useTranslation();
  const { formatPrice, currency } = useCurrency();
  const {
    monthlyBudget,
    yearlyBudget,
    monthlySpending,
    yearlySpending: _yearlySpending,
    monthlyProgress,
    yearlyProgress,
    categoryProgress,
    budgetSummary,
    isLoading
  } = useBudget();

  // Show loading state
  if (isLoading) {
    return (
      <div className={`bg-[#1a2332] rounded-xl border border-[#2e4e6b] p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
            <div className="h-2 bg-gray-700 rounded w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  // Check if any budget is set
  const hasBudget = BudgetService.hasBudgetSet(monthlyBudget, yearlyBudget, {});

  // Get overall status
  const overallStatus = budgetSummary?.overallStatus || 'healthy';

  // Get status color and icon
  const getStatusDisplay = () => {
    switch (overallStatus) {
      case 'exceeded':
        return { color: 'text-red-400', bgColor: 'bg-red-900/20', icon: '🚨', label: t('budgetExceeded') };
      case 'warning':
        return { color: 'text-yellow-400', bgColor: 'bg-yellow-900/20', icon: '⚠️', label: t('approachingLimit') };
      default:
        return { color: 'text-green-400', bgColor: 'bg-green-900/20', icon: '✅', label: t('onTrack') };
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <div className={`bg-[#1a2332] rounded-xl border border-[#2e4e6b] p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold text-white">{t('budgetOverview')}</h3>
          <span className="text-lg">{statusDisplay.icon}</span>
        </div>
        
        {onEditBudget && (
          <button
            onClick={onEditBudget}
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            {t('editBudget', 'Edit Budget')}
          </button>
        )}
      </div>

      {!hasBudget ? (
        /* No Budget Set */
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">
            <svg className="w-12 h-12 mx-auto opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <h4 className="text-white font-medium mb-2">{t('noBudgetSet', 'No budget set')}</h4>
          <p className="text-gray-400 text-sm mb-4">
            {t('setBudgetToTrack', 'Set a budget to track your subscription spending')}
          </p>
          <p className="text-xs text-gray-500">
            {t('currentTotalSpending', 'Current monthly spending')}: {formatPrice(monthlySpending)}
          </p>
          {onEditBudget && (
            <button
              onClick={onEditBudget}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm transition-colors"
            >
              {t('setBudget')}
            </button>
          )}
        </div>
      ) : (
        /* Budget Status Display */
        <div className="space-y-4">
          {/* Overall Status */}
          <div className={`p-3 rounded-lg ${statusDisplay.bgColor}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-medium ${statusDisplay.color}`}>{statusDisplay.label}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {t('overallBudgetStatus', 'Overall budget status')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-white">
                  {formatPrice(monthlySpending)} / {formatPrice((monthlyBudget || 0) + (yearlyBudget || 0) / 12)}
                </p>
                <p className="text-xs text-gray-400">{t('thisMonth', 'This month')}</p>
              </div>
            </div>
          </div>

          {/* Monthly Budget Progress */}
          {monthlyProgress && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-300">{t('monthlyBudget')}</h4>
                <span className="text-xs text-gray-400">
                  {BudgetService.formatBudgetPercentage(monthlyProgress.percentageUsed)}
                </span>
              </div>
              
              <BudgetProgressBar
                current={monthlyProgress.spentAmount}
                budget={monthlyProgress.budgetAmount}
                label={t('monthlySpending', 'Monthly spending')}
                currency={currency}
                size="md"
                showPercentage={false}
              />
              
              {showDetails && (
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{t('spent', 'Spent')}: {formatPrice(monthlyProgress.spentAmount)}</span>
                  <span>{t('remaining', 'Remaining')}: {formatPrice(monthlyProgress.remainingAmount)}</span>
                </div>
              )}
            </div>
          )}

          {/* Yearly Budget Progress */}
          {yearlyProgress && showDetails && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-300">{t('yearlyBudget')}</h4>
                <span className="text-xs text-gray-400">
                  {BudgetService.formatBudgetPercentage(yearlyProgress.percentageUsed)}
                </span>
              </div>
              
              <BudgetProgressBar
                current={yearlyProgress.spentAmount}
                budget={yearlyProgress.budgetAmount}
                label={t('yearlySpending', 'Yearly spending')}
                currency={currency}
                size="sm"
                showPercentage={false}
              />
            </div>
          )}

          {/* Top Category Budgets */}
          {categoryProgress.length > 0 && showDetails && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-300">{t('topCategories', 'Top categories')}</h4>
              <div className="space-y-2">
                {categoryProgress
                  .sort((a, b) => b.percentageUsed - a.percentageUsed)
                  .slice(0, 3)
                  .map(progress => (
                    <div key={progress.categoryName} className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-400 truncate">{progress.categoryName}</span>
                          <span className="text-xs text-gray-400 ml-2">
                            {BudgetService.formatBudgetPercentage(progress.percentageUsed)}
                          </span>
                        </div>
                        <BudgetProgressBar
                          current={progress.spentAmount}
                          budget={progress.budgetAmount}
                          label={progress.categoryName}
                          currency={currency}
                          size="sm"
                          showPercentage={false}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          {showDetails && onEditBudget && (
            <div className="pt-2 border-t border-gray-700">
              <div className="flex space-x-2">
                <button
                  onClick={onEditBudget}
                  className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md text-xs transition-colors"
                >
                  {t('adjustBudget', 'Adjust Budget')}
                </button>
                <button
                  onClick={() => {/* Navigate to insights */}}
                  className="flex-1 px-3 py-2 bg-blue-900/30 hover:bg-blue-900/50 text-blue-400 rounded-md text-xs transition-colors"
                >
                  {t('viewInsights', 'View Insights')}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BudgetOverview;
