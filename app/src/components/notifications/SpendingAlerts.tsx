// Spending Alerts Component for Phase 2.1: Intelligent Notification System
import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useCurrency } from '../../hooks/useCurrency';
import { useSpendingAlerts } from '../../hooks/useSpendingAlerts';

interface SpendingAlertsProps {
  className?: string;
  maxItems?: number;
  showProcessButton?: boolean;
}

const SpendingAlerts: React.FC<SpendingAlertsProps> = ({
  className = '',
  maxItems = 5,
  showProcessButton = false
}) => {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const {
    spendingStatus,
    isLoading,
    error,
    processAlerts,
    getAlertsBySeverity,
    getBudgetUtilization,
    hasActiveAlerts,
    criticalAlerts,
    warningAlerts
  } = useSpendingAlerts();

  const handleProcessAlerts = async () => {
    try {
      const count = await processAlerts();
      if (count > 0) {
        console.log(`Created ${count} spending alert notifications`);
      }
    } catch (err) {
      console.error('Error processing spending alerts:', err);
    }
  };

  const getStatusIcon = (status: 'safe' | 'warning' | 'critical') => {
    switch (status) {
      case 'critical':
        return (
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
        );
      case 'warning':
        return (
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
        );
      case 'safe':
        return (
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        );
      default:
        return (
          <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
        );
    }
  };

  const getStatusColor = (status: 'safe' | 'warning' | 'critical') => {
    switch (status) {
      case 'critical':
        return 'text-red-400 border-red-500/30 bg-red-900/20';
      case 'warning':
        return 'text-yellow-400 border-yellow-500/30 bg-yellow-900/20';
      case 'safe':
        return 'text-green-400 border-green-500/30 bg-green-900/20';
      default:
        return 'text-gray-400 border-gray-500/30 bg-gray-900/20';
    }
  };

  const formatBudgetType = (type: string, category?: string) => {
    if (type === 'category' && category) {
      return category;
    }
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  if (isLoading) {
    return (
      <div className={`bg-[#1a2332] rounded-xl border border-[#2e4e6b] p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-gray-700 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-700 rounded w-3/4 mb-1"></div>
                  <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                </div>
                <div className="h-4 bg-gray-700 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-[#1a2332] rounded-xl border border-[#2e4e6b] p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-white mb-4">{t('spendingAlerts')}</h3>
        <div className="text-center py-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const { critical, warning } = getAlertsBySeverity();
  const budgetUtilization = getBudgetUtilization();
  const displayAlerts = [...critical, ...warning].slice(0, maxItems);

  return (
    <div className={`bg-[#1a2332] rounded-xl border border-[#2e4e6b] p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">{t('spendingAlertsTitle')}</h3>
        {showProcessButton && (
          <button
            onClick={handleProcessAlerts}
            className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
          >
            {t('checkAlerts')}
          </button>
        )}
      </div>

      {/* Summary Stats */}
      {spendingStatus && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-800/50 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-1">{t('budgetUsed')}</p>
            <p className="text-lg font-semibold text-white">
              {budgetUtilization.overallPercentage.toFixed(1)}%
            </p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-1">{t('activeAlertsCount')}</p>
            <p className="text-lg font-semibold text-red-400">
              {criticalAlerts + warningAlerts}
            </p>
          </div>
        </div>
      )}

      {/* Budget Status Overview */}
      {budgetUtilization.totalBudget > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">{t('overallBudget')}</span>
            <span className={`text-sm font-medium ${getStatusColor(budgetUtilization.overallStatus).split(' ')[0]}`}>
              {formatPrice(budgetUtilization.totalSpent)} / {formatPrice(budgetUtilization.totalBudget)}
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                budgetUtilization.overallStatus === 'critical' ? 'bg-red-500' :
                budgetUtilization.overallStatus === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(budgetUtilization.overallPercentage, 100)}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Alerts List */}
      {!hasActiveAlerts ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h4 className="text-white font-medium mb-1">{t('noSpendingAlerts')}</h4>
          <p className="text-gray-400 text-sm">{t('budgetOnTrack')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayAlerts.map((alert, index) => (
            <div
              key={index}
              className={`flex items-center space-x-3 p-3 rounded-lg border ${getStatusColor(alert.status)}`}
            >
              {getStatusIcon(alert.status)}
              
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-medium truncate">
                  {formatBudgetType(alert.type, 'category' in alert ? alert.category : undefined)} {t('budgetLabel')}
                </h4>
                <p className="text-gray-400 text-sm">
                  {alert.percentage.toFixed(1)}% {t('usedLabel')} • {formatPrice(alert.spent)} / {formatPrice(alert.budget)}
                </p>
              </div>

              <div className="text-right">
                <p className={`text-sm font-medium ${getStatusColor(alert.status).split(' ')[0]}`}>
                  {alert.status === 'critical' ? t('exceededStatus') : t('warningStatus')}
                </p>
              </div>
            </div>
          ))}

          {critical.length + warning.length > maxItems && (
            <div className="text-center pt-2">
              <p className="text-gray-400 text-sm">
                {t('andNMore', { n: critical.length + warning.length - maxItems })}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      {hasActiveAlerts && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="flex space-x-2">
            <button className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
              {t('adjustBudgets')}
            </button>
            <button className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors">
              {t('viewDetailsButton')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpendingAlerts;
