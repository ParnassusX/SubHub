// Budget Progress Bar Component - Reusable progress indicator
import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useCurrency } from '../../hooks/useCurrency';
import { BudgetService } from '../../services/budgetService';

interface BudgetProgressBarProps {
  current: number;
  budget: number;
  label: string;
  currency: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'green' | 'yellow' | 'red' | 'blue' | 'auto';
  showLabels?: boolean;
  showTooltip?: boolean;
  className?: string;
}

const BudgetProgressBar: React.FC<BudgetProgressBarProps> = ({
  current,
  budget,
  label,
  currency: _currency,
  showPercentage = true,
  size = 'md',
  color = 'auto',
  showLabels = true,
  showTooltip = false,
  className = ''
}) => {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();

  // Calculate progress
  const progress = BudgetService.calculateBudgetProgress(current, budget);
  
  // Get size classes
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'space-y-1',
          bar: 'h-1.5',
          text: 'text-xs',
          label: 'text-xs'
        };
      case 'lg':
        return {
          container: 'space-y-3',
          bar: 'h-4',
          text: 'text-sm',
          label: 'text-base'
        };
      default: // md
        return {
          container: 'space-y-2',
          bar: 'h-2',
          text: 'text-xs',
          label: 'text-sm'
        };
    }
  };

  // Get color classes
  const getColorClasses = () => {
    if (color !== 'auto') {
      switch (color) {
        case 'green':
          return { bg: 'bg-green-500', text: 'text-green-400' };
        case 'yellow':
          return { bg: 'bg-yellow-500', text: 'text-yellow-400' };
        case 'red':
          return { bg: 'bg-red-500', text: 'text-red-400' };
        case 'blue':
          return { bg: 'bg-blue-500', text: 'text-blue-400' };
      }
    }

    // Auto color based on progress status
    switch (progress.status) {
      case 'over_budget':
        return { bg: 'bg-red-500', text: 'text-red-400' };
      case 'approaching_limit':
        return { bg: 'bg-yellow-500', text: 'text-yellow-400' };
      default:
        return { bg: 'bg-green-500', text: 'text-green-400' };
    }
  };

  const sizeClasses = getSizeClasses();
  const colorClasses = getColorClasses();

  // Calculate width percentage (cap at 100% for visual purposes)
  const widthPercentage = Math.min(progress.percentageUsed, 100);

  // Get status icon
  const getStatusIcon = () => {
    switch (progress.status) {
      case 'over_budget':
        return '🚨';
      case 'approaching_limit':
        return '⚠️';
      default:
        return '✅';
    }
  };

  // Format percentage display
  const formatPercentage = () => {
    return BudgetService.formatBudgetPercentage(progress.percentageUsed);
  };

  // Get tooltip content
  const getTooltipContent = () => {
    return `${label}: ${formatPrice(current)} / ${formatPrice(budget)} (${formatPercentage()})`;
  };

  return (
    <div className={`${sizeClasses.container} ${className}`} title={showTooltip ? getTooltipContent() : undefined}>
      {/* Labels */}
      {showLabels && (
        <div className="flex items-center justify-between">
          <span className={`font-medium text-gray-300 ${sizeClasses.label}`}>
            {label}
          </span>
          <div className="flex items-center space-x-2">
            {showPercentage && (
              <span className={`font-medium ${colorClasses.text} ${sizeClasses.text}`}>
                {formatPercentage()}
              </span>
            )}
            {size !== 'sm' && (
              <span className="text-xs">{getStatusIcon()}</span>
            )}
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="relative">
        {/* Background */}
        <div className={`w-full bg-gray-700 rounded-full ${sizeClasses.bar}`}>
          {/* Progress Fill */}
          <div
            className={`${colorClasses.bg} ${sizeClasses.bar} rounded-full transition-all duration-500 ease-out relative overflow-hidden`}
            style={{ width: `${widthPercentage}%` }}
          >
            {/* Animated shine effect for larger bars */}
            {size === 'lg' && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
            )}
          </div>

          {/* Over-budget indicator */}
          {progress.percentageUsed > 100 && (
            <div className="absolute inset-0 bg-red-500/20 rounded-full animate-pulse" />
          )}
        </div>

        {/* Threshold markers for larger bars */}
        {size !== 'sm' && budget > 0 && (
          <>
            {/* 75% threshold marker */}
            <div 
              className="absolute top-0 w-0.5 bg-yellow-400/50 rounded-full"
              style={{ 
                left: '75%', 
                height: '100%',
                transform: 'translateX(-50%)'
              }}
            />
            {/* 90% threshold marker */}
            <div 
              className="absolute top-0 w-0.5 bg-red-400/50 rounded-full"
              style={{ 
                left: '90%', 
                height: '100%',
                transform: 'translateX(-50%)'
              }}
            />
          </>
        )}
      </div>

      {/* Amount Details */}
      {showLabels && size !== 'sm' && (
        <div className="flex items-center justify-between">
          <span className={`text-gray-400 ${sizeClasses.text}`}>
            {t('spent', 'Spent')}: {formatPrice(current)}
          </span>
          <span className={`text-gray-400 ${sizeClasses.text}`}>
            {progress.remainingAmount >= 0 
              ? `${t('remaining', 'Remaining')}: ${formatPrice(progress.remainingAmount)}`
              : `${t('over', 'Over')}: ${formatPrice(Math.abs(progress.remainingAmount))}`
            }
          </span>
        </div>
      )}

      {/* Status Message for over-budget */}
      {progress.status === 'over_budget' && size === 'lg' && (
        <div className="flex items-center space-x-2 text-red-400">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="text-xs">
            {t('budgetExceededBy', 'Budget exceeded by')} {formatPrice(current - budget)}
          </span>
        </div>
      )}

      {/* Warning Message for approaching limit */}
      {progress.status === 'approaching_limit' && size === 'lg' && (
        <div className="flex items-center space-x-2 text-yellow-400">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="text-xs">
            {t('approachingBudgetLimit', 'Approaching budget limit')}
          </span>
        </div>
      )}
    </div>
  );
};

export default BudgetProgressBar;
