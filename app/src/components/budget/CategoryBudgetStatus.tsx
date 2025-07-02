// Category Budget Status Component - Shows per-category budget utilization
import React, { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useCurrency } from '../../hooks/useCurrency';
import { useBudget } from '../../hooks/useBudget';
import { useSubscriptions } from '../../contexts/SubscriptionContext';
import { BudgetService } from '../../services/budgetService';
import BudgetProgressBar from './BudgetProgressBar';

interface CategoryBudgetStatusProps {
  className?: string;
  maxCategories?: number;
  showAllCategories?: boolean;
  onEditCategory?: (category: string) => void;
}

const CategoryBudgetStatus: React.FC<CategoryBudgetStatusProps> = ({
  className = '',
  maxCategories = 5,
  showAllCategories = false,
  onEditCategory
}) => {
  const { t } = useTranslation();
  const { formatPrice, currency } = useCurrency();
  const { categoryBudgets, isLoading } = useBudget();
  const { subscriptions } = useSubscriptions();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Calculate category spending for all categories (including those without budgets)
  const allCategorySpending = BudgetService.calculateCategorySpending(subscriptions);

  // Get all categories (with and without budgets)
  const allCategories = Array.from(new Set([
    ...Object.keys(categoryBudgets),
    ...Object.keys(allCategorySpending)
  ]));

  // Create category status for all categories
  const categoryStatuses = allCategories.map(categoryName => {
    const budget = categoryBudgets[categoryName] || 0;
    const spent = allCategorySpending[categoryName] || 0;
    const hasBudget = budget > 0;
    
    let progress = null;
    if (hasBudget) {
      progress = BudgetService.calculateBudgetProgress(spent, budget);
    }

    return {
      categoryName,
      budget,
      spent,
      hasBudget,
      progress,
      subscriptionCount: subscriptions.filter(sub => sub.category === categoryName).length
    };
  });

  // Sort categories by priority: over budget > approaching limit > with budget > by spending
  const sortedCategories = categoryStatuses.sort((a, b) => {
    // Prioritize categories with budgets
    if (a.hasBudget && !b.hasBudget) return -1;
    if (!a.hasBudget && b.hasBudget) return 1;
    
    if (a.hasBudget && b.hasBudget) {
      // Sort by status severity
      const getStatusPriority = (status: string) => {
        switch (status) {
          case 'over_budget': return 3;
          case 'approaching_limit': return 2;
          case 'under_budget': return 1;
          default: return 0;
        }
      };
      
      const aPriority = getStatusPriority(a.progress?.status || '');
      const bPriority = getStatusPriority(b.progress?.status || '');
      
      if (aPriority !== bPriority) return bPriority - aPriority;
      
      // Then by percentage used
      const aPercentage = a.progress?.percentageUsed || 0;
      const bPercentage = b.progress?.percentageUsed || 0;
      return bPercentage - aPercentage;
    }
    
    // For categories without budgets, sort by spending amount
    return b.spent - a.spent;
  });

  // Get categories to display
  const categoriesToShow = showAllCategories 
    ? sortedCategories 
    : sortedCategories.slice(0, maxCategories);

  // Toggle category expansion
  const toggleCategory = (categoryName: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryName)) {
      newExpanded.delete(categoryName);
    } else {
      newExpanded.add(categoryName);
    }
    setExpandedCategories(newExpanded);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className={`bg-[#1a2332] rounded-xl border border-[#2e4e6b] p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                <div className="h-2 bg-gray-700 rounded w-full"></div>
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
        <h3 className="text-lg font-semibold text-white">{t('categoryBudgets')}</h3>
        {!showAllCategories && sortedCategories.length > maxCategories && (
          <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
            {t('viewAll')} ({sortedCategories.length})
          </button>
        )}
      </div>

      {categoriesToShow.length === 0 ? (
        /* Empty State */
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">
            <svg className="w-12 h-12 mx-auto opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h4 className="text-white font-medium mb-2">{t('noCategoryBudgets')}</h4>
          <p className="text-gray-400 text-sm">
            {t('setCategoryBudgetsToTrack')}
          </p>
        </div>
      ) : (
        /* Category List */
        <div className="space-y-4">
          {categoriesToShow.map(category => {
            const isExpanded = expandedCategories.has(category.categoryName);
            const categorySubscriptions = subscriptions.filter(sub => sub.category === category.categoryName);
            
            return (
              <div key={category.categoryName} className="space-y-2">
                {/* Category Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-white">{category.categoryName}</h4>
                    <span className="text-xs text-gray-400">
                      ({category.subscriptionCount} {t('subscriptionsCount')})
                    </span>
                    {!category.hasBudget && (
                      <span className="text-xs text-gray-500 bg-gray-700 px-2 py-0.5 rounded">
                        {t('noBudget')}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {category.hasBudget && category.progress && (
                      <span className={`text-xs font-medium ${
                        category.progress.status === 'over_budget' ? 'text-red-400' :
                        category.progress.status === 'approaching_limit' ? 'text-yellow-400' :
                        'text-green-400'
                      }`}>
                        {BudgetService.formatBudgetPercentage(category.progress.percentageUsed)}
                      </span>
                    )}
                    
                    <span className="text-sm text-gray-300">
                      {formatPrice(category.spent)}
                    </span>
                    
                    {onEditCategory && (
                      <button
                        onClick={() => onEditCategory(category.categoryName)}
                        className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        {t('edit')}
                      </button>
                    )}
                    
                    {categorySubscriptions.length > 0 && (
                      <button
                        onClick={() => toggleCategory(category.categoryName)}
                        className="text-gray-400 hover:text-gray-300 transition-colors"
                      >
                        <svg 
                          className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                {category.hasBudget && category.progress ? (
                  <BudgetProgressBar
                    current={category.progress.spentAmount}
                    budget={category.progress.budgetAmount}
                    label={category.categoryName}
                    currency={currency}
                    size="sm"
                    showPercentage={false}
                    showLabels={false}
                  />
                ) : (
                  /* No Budget Progress Indicator */
                  <div className="w-full bg-gray-700 rounded-full h-1.5">
                    <div className="bg-gray-500 h-1.5 rounded-full" style={{ width: '100%' }} />
                  </div>
                )}

                {/* Budget Details */}
                {category.hasBudget && (
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{t('budget')}: {formatPrice(category.budget)}</span>
                    {category.progress && (
                      <span>
                        {category.progress.remainingAmount >= 0 
                          ? `${t('remaining')}: ${formatPrice(category.progress.remainingAmount)}`
                          : `${t('over')}: ${formatPrice(Math.abs(category.progress.remainingAmount))}`
                        }
                      </span>
                    )}
                  </div>
                )}

                {/* Expanded Subscriptions */}
                {isExpanded && categorySubscriptions.length > 0 && (
                  <div className="ml-4 pl-4 border-l border-gray-700 space-y-2">
                    {categorySubscriptions.map(subscription => (
                      <div key={subscription.id} className="flex items-center justify-between text-sm">
                        <span className="text-gray-300">{subscription.name}</span>
                        <span className="text-gray-400">
                          {formatPrice(BudgetService.normalizeToMonthly(subscription.cost, subscription.frequency))}
                          <span className="text-xs text-gray-500 ml-1">
                            /{subscription.frequency === 'Monthly' ? t('month') : t('year')}
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Summary */}
      {categoriesToShow.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-700">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-400">{t('categoriesWithBudgets')}</p>
              <p className="text-lg font-semibold text-white">
                {sortedCategories.filter(c => c.hasBudget).length}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">{t('overBudget')}</p>
              <p className="text-lg font-semibold text-red-400">
                {sortedCategories.filter(c => c.progress?.status === 'over_budget').length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryBudgetStatus;
