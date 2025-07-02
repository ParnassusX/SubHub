// Budget Overview Card Component
import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useCurrency } from '../../hooks/useCurrency';
import { BudgetService } from '../../services/budgetService';

interface BudgetOverviewCardProps {
  monthlyBudget: number | null;
  yearlyBudget: number | null;
  monthlySpending: number;
  yearlySpending: number;
  currency: string;
}

const BudgetOverviewCard: React.FC<BudgetOverviewCardProps> = ({
  monthlyBudget,
  yearlyBudget,
  monthlySpending,
  yearlySpending,
  currency: _currency
}) => {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();

  // Calculate progress for monthly and yearly budgets
  const monthlyProgress = monthlyBudget ? 
    BudgetService.calculateBudgetProgress(monthlySpending, monthlyBudget) : null;
  const yearlyProgress = yearlyBudget ? 
    BudgetService.calculateBudgetProgress(yearlySpending, yearlyBudget) : null;

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'under_budget': return 'text-green-400';
      case 'approaching_limit': return 'text-yellow-400';
      case 'over_budget': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'under_budget': return '✅';
      case 'approaching_limit': return '⚠️';
      case 'over_budget': return '🚨';
      default: return '📊';
    }
  };

  return (
    <div className="bg-[#1a2332] rounded-xl border border-[#2e4e6b] p-6">
      <h3 className="text-lg font-semibold text-white mb-4">{t('budgetOverview')}</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Monthly Budget Overview */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-300">{t('monthlyBudget')}</h4>
            {monthlyProgress && (
              <span className="text-xs text-gray-400">
                {getStatusIcon(monthlyProgress.status)}
              </span>
            )}
          </div>
          
          {monthlyBudget ? (
            <div className="space-y-2">
              {/* Budget vs Spending */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">{t('currentSpending')}</span>
                <span className="text-sm font-medium text-white">
                  {formatPrice(monthlySpending)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">{t('budgetLimit', 'Budget limit')}</span>
                <span className="text-sm font-medium text-white">
                  {formatPrice(monthlyBudget)}
                </span>
              </div>
              
              {monthlyProgress && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">{t('remainingBudget')}</span>
                    <span className={`text-sm font-medium ${getStatusColor(monthlyProgress.status)}`}>
                      {formatPrice(monthlyProgress.remainingAmount)}
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">{t('budgetProgress')}</span>
                      <span className={`font-medium ${getStatusColor(monthlyProgress.status)}`}>
                        {BudgetService.formatBudgetPercentage(monthlyProgress.percentageUsed)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          monthlyProgress.status === 'over_budget' ? 'bg-red-500' :
                          monthlyProgress.status === 'approaching_limit' ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(monthlyProgress.percentageUsed, 100)}%` }}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="text-gray-400 mb-2">
                <svg className="w-8 h-8 mx-auto opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <p className="text-sm text-gray-400">{t('noMonthlyBudget', 'No monthly budget set')}</p>
              <p className="text-xs text-gray-500 mt-1">
                {t('currentMonthlySpending', 'Current spending')}: {formatPrice(monthlySpending)}
              </p>
            </div>
          )}
        </div>

        {/* Yearly Budget Overview */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-300">{t('yearlyBudget')}</h4>
            {yearlyProgress && (
              <span className="text-xs text-gray-400">
                {getStatusIcon(yearlyProgress.status)}
              </span>
            )}
          </div>
          
          {yearlyBudget ? (
            <div className="space-y-2">
              {/* Budget vs Spending */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">{t('currentSpending')}</span>
                <span className="text-sm font-medium text-white">
                  {formatPrice(yearlySpending)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">{t('budgetLimit')}</span>
                <span className="text-sm font-medium text-white">
                  {formatPrice(yearlyBudget)}
                </span>
              </div>
              
              {yearlyProgress && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">{t('remainingBudget')}</span>
                    <span className={`text-sm font-medium ${getStatusColor(yearlyProgress.status)}`}>
                      {formatPrice(yearlyProgress.remainingAmount)}
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">{t('budgetProgress')}</span>
                      <span className={`font-medium ${getStatusColor(yearlyProgress.status)}`}>
                        {BudgetService.formatBudgetPercentage(yearlyProgress.percentageUsed)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          yearlyProgress.status === 'over_budget' ? 'bg-red-500' :
                          yearlyProgress.status === 'approaching_limit' ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(yearlyProgress.percentageUsed, 100)}%` }}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="text-gray-400 mb-2">
                <svg className="w-8 h-8 mx-auto opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-sm text-gray-400">{t('noYearlyBudget', 'No yearly budget set')}</p>
              <p className="text-xs text-gray-500 mt-1">
                {t('currentYearlySpending', 'Current spending')}: {formatPrice(yearlySpending)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Overall Status */}
      {(monthlyProgress || yearlyProgress) && (
        <div className="mt-6 pt-4 border-t border-gray-700">
          <div className="flex items-center justify-center space-x-4">
            {monthlyProgress && (
              <div className="text-center">
                <p className="text-xs text-gray-400">{t('monthlyStatus', 'Monthly')}</p>
                <p className={`text-sm font-medium ${getStatusColor(monthlyProgress.status)}`}>
                  {t(monthlyProgress.status === 'under_budget' ? 'onTrack' : 
                     monthlyProgress.status === 'approaching_limit' ? 'warning' : 'exceeded',
                     monthlyProgress.status === 'under_budget' ? 'On Track' :
                     monthlyProgress.status === 'approaching_limit' ? 'Warning' : 'Exceeded')}
                </p>
              </div>
            )}
            
            {yearlyProgress && (
              <div className="text-center">
                <p className="text-xs text-gray-400">{t('yearlyStatus', 'Yearly')}</p>
                <p className={`text-sm font-medium ${getStatusColor(yearlyProgress.status)}`}>
                  {t(yearlyProgress.status === 'under_budget' ? 'onTrack' : 
                     yearlyProgress.status === 'approaching_limit' ? 'warning' : 'exceeded',
                     yearlyProgress.status === 'under_budget' ? 'On Track' :
                     yearlyProgress.status === 'approaching_limit' ? 'Warning' : 'Exceeded')}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetOverviewCard;
