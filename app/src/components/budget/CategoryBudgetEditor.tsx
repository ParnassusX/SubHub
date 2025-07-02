// Category Budget Editor Component
import React, { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useCurrency } from '../../hooks/useCurrency';
import { useSubscriptions } from '../../contexts/SubscriptionContext';
import { BudgetService } from '../../services/budgetService';

interface CategoryBudgetEditorProps {
  categories: string[];
  categoryBudgets: { [category: string]: string };
  onBudgetChange: (category: string, amount: string) => void;
  onCategoryAdd: (category: string) => void;
  onCategoryRemove: (category: string) => void;
  currency: string;
  errors: Record<string, string>;
  disabled?: boolean;
}

const CategoryBudgetEditor: React.FC<CategoryBudgetEditorProps> = ({
  categories,
  categoryBudgets,
  onBudgetChange,
  onCategoryAdd,
  onCategoryRemove,
  currency,
  errors,
  disabled = false
}) => {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const { subscriptions } = useSubscriptions();
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);

  // Calculate category spending
  const categorySpending = BudgetService.calculateCategorySpending(subscriptions);

  // Get progress for a category
  const getCategoryProgress = (category: string) => {
    const budgetAmount = parseFloat(categoryBudgets[category] || '0');
    const spentAmount = categorySpending[category] || 0;
    
    if (budgetAmount <= 0) return null;
    
    return BudgetService.calculateBudgetProgress(spentAmount, budgetAmount);
  };

  // Get progress bar color
  const getProgressColor = (category: string) => {
    const progress = getCategoryProgress(category);
    if (!progress) return 'bg-gray-600';
    
    return BudgetService.getBudgetStatusColor(progress.status) === 'green' 
      ? 'bg-green-500'
      : BudgetService.getBudgetStatusColor(progress.status) === 'yellow'
      ? 'bg-yellow-500'
      : 'bg-red-500';
  };

  // Handle adding new category
  const handleAddCategory = () => {
    if (newCategoryName.trim() && !categoryBudgets[newCategoryName.trim()]) {
      onCategoryAdd(newCategoryName.trim());
      setNewCategoryName('');
      setShowAddCategory(false);
    }
  };

  // Handle input change for category budget
  const handleBudgetInputChange = (category: string, value: string) => {
    // Allow only numbers and decimal point
    const sanitizedValue = value.replace(/[^0-9.]/g, '');
    
    // Prevent multiple decimal points
    const parts = sanitizedValue.split('.');
    const cleanValue = parts.length > 2 
      ? parts[0] + '.' + parts.slice(1).join('')
      : sanitizedValue;
    
    onBudgetChange(category, cleanValue);
  };

  // Format budget input on blur
  const handleBudgetInputBlur = (category: string, value: string) => {
    if (value && !isNaN(parseFloat(value))) {
      const formattedValue = parseFloat(value).toFixed(2);
      onBudgetChange(category, formattedValue);
    }
  };

  // Get available categories (predefined + custom)
  const availableCategories = [...new Set([...categories, ...Object.keys(categoryBudgets)])];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium text-gray-300">{t('categoryBudgets')}</h4>
          <p className="text-xs text-gray-400 mt-1">
            {t('categoryBudgetDescription', 'Set spending limits for specific categories')}
          </p>
        </div>
        
        {!showAddCategory && (
          <button
            type="button"
            onClick={() => setShowAddCategory(true)}
            disabled={disabled}
            className="px-3 py-1 text-xs bg-blue-900/30 hover:bg-blue-900/50 text-blue-400 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('addCategory')}
          </button>
        )}
      </div>

      {/* Add New Category */}
      {showAddCategory && (
        <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder={t('categoryName', 'Category name')}
              className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
              disabled={disabled}
            />
            <button
              type="button"
              onClick={handleAddCategory}
              disabled={disabled || !newCategoryName.trim()}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('add')}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAddCategory(false);
                setNewCategoryName('');
              }}
              disabled={disabled}
              className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('cancel')}
            </button>
          </div>
        </div>
      )}

      {/* Category Budget List */}
      <div className="space-y-3">
        {availableCategories.map(category => {
          const progress = getCategoryProgress(category);
          const spent = categorySpending[category] || 0;
          const budget = parseFloat(categoryBudgets[category] || '0');
          const hasError = errors[category];

          return (
            <div
              key={category}
              className={`p-4 bg-gray-800/30 rounded-lg border transition-colors ${
                hasError ? 'border-red-500' : 'border-gray-700'
              }`}
            >
              {/* Category Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <h5 className="font-medium text-white">{category}</h5>
                  {spent > 0 && (
                    <span className="text-xs text-gray-400">
                      {t('currentSpending')}: {formatPrice(spent)}
                    </span>
                  )}
                </div>
                
                <button
                  type="button"
                  onClick={() => onCategoryRemove(category)}
                  disabled={disabled}
                  className="text-gray-400 hover:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={t('removeCategory')}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Budget Input */}
              <div className="flex items-center space-x-3 mb-3">
                <div className="flex-1">
                  <div className={`
                    flex items-center
                    px-3 py-2
                    bg-gray-700 border rounded-md
                    transition-colors duration-200
                    ${hasError 
                      ? 'border-red-500' 
                      : 'border-gray-600 focus-within:border-blue-500'
                    }
                    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                  `}>
                    <span className="text-gray-400 mr-2 select-none">
                      {currency === 'EUR' ? '€' : '$'}
                    </span>
                    <input
                      type="text"
                      value={categoryBudgets[category] || ''}
                      onChange={(e) => handleBudgetInputChange(category, e.target.value)}
                      onBlur={(e) => handleBudgetInputBlur(category, e.target.value)}
                      placeholder="0.00"
                      disabled={disabled}
                      className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Quick Amount Buttons */}
                <div className="flex space-x-1">
                  {[25, 50, 100].map(amount => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => onBudgetChange(category, amount.toFixed(2))}
                      disabled={disabled}
                      className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {amount}
                    </button>
                  ))}
                </div>
              </div>

              {/* Progress Bar */}
              {progress && budget > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">
                      {formatPrice(spent)} / {formatPrice(budget)}
                    </span>
                    <span className={`font-medium ${
                      progress.status === 'over_budget' ? 'text-red-400' :
                      progress.status === 'approaching_limit' ? 'text-yellow-400' :
                      'text-green-400'
                    }`}>
                      {BudgetService.formatBudgetPercentage(progress.percentageUsed)}
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(category)}`}
                      style={{ width: `${Math.min(progress.percentageUsed, 100)}%` }}
                    />
                  </div>
                  
                  {progress.status !== 'under_budget' && (
                    <p className="text-xs text-gray-400">
                      {progress.status === 'over_budget' 
                        ? t('budgetExceeded', 'Budget exceeded')
                        : t('approachingLimit', 'Approaching budget limit')
                      }
                    </p>
                  )}
                </div>
              )}

              {/* Error Message */}
              {hasError && (
                <p className="text-sm text-red-400 mt-2 flex items-center">
                  <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {hasError}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {availableCategories.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p className="text-sm">{t('noCategoryBudgets', 'No category budgets set')}</p>
          <p className="text-xs mt-1">{t('addCategoryToStart', 'Add a category to get started')}</p>
        </div>
      )}
    </div>
  );
};

export default CategoryBudgetEditor;
