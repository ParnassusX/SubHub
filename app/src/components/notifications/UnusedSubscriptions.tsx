// Unused Subscriptions Component for Phase 2.1: Intelligent Notification System
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { useCurrency } from '../../hooks/useCurrency';
import { useUnusedSubscriptions } from '../../hooks/useUnusedSubscriptions';

interface UnusedSubscriptionsProps {
  className?: string;
  maxItems?: number;
  showProcessButton?: boolean;
  variant?: 'full' | 'compact';
}

const UnusedSubscriptions: React.FC<UnusedSubscriptionsProps> = ({
  className = '',
  maxItems = 5,
  showProcessButton = false,
  variant = 'full'
}) => {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  const {
    unusedSubscriptions,
    usageInsights,
    isLoading,
    error,
    processAlerts,
    getUnusedBySeverity,
    potentialMonthlySavings,
    usageEfficiencyScore
  } = useUnusedSubscriptions();

  const handleProcessAlerts = async () => {
    try {
      const count = await processAlerts();
      if (count > 0) {
        console.log(`Created ${count} unused subscription notifications`);
      }
    } catch (err) {
      console.error('Error processing unused subscription alerts:', err);
    }
  };

  const getSeverityIcon = (severity: 'warning' | 'critical') => {
    switch (severity) {
      case 'critical':
        return (
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
        );
      case 'warning':
        return (
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
        );
      default:
        return (
          <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
        );
    }
  };

  const getSeverityColor = (severity: 'warning' | 'critical') => {
    switch (severity) {
      case 'critical':
        return 'text-red-400 border-red-500/30 bg-red-900/20';
      case 'warning':
        return 'text-yellow-400 border-yellow-500/30 bg-yellow-900/20';
      default:
        return 'text-gray-400 border-gray-500/30 bg-gray-900/20';
    }
  };

  const formatDaysInactive = (days: number) => {
    if (days < 7) {
      return t('nDaysLabel', { n: days });
    } else if (days < 30) {
      const weeks = Math.floor(days / 7);
      return t('nWeeksLabel', { n: weeks });
    } else if (days < 365) {
      const months = Math.floor(days / 30);
      return t('nMonthsLabel', { n: months });
    } else {
      const years = Math.floor(days / 365);
      return t('nYearsLabel', { n: years });
    }
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
        <h3 className="text-lg font-semibold text-white mb-4">{t('unusedSubscriptionsTitle')}</h3>
        <div className="text-center py-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const { critical, warning } = getUnusedBySeverity();
  const displayUnused = unusedSubscriptions.slice(0, maxItems);

  return (
    <div className={`bg-[#1a2332] rounded-xl border border-[#2e4e6b] p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">{t('unusedSubscriptionsTitle')}</h3>
        {showProcessButton && (
          <button
            onClick={handleProcessAlerts}
            className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
          >
            {t('checkUnused')}
          </button>
        )}
      </div>

      {/* Summary Stats */}
      {variant === 'full' && usageInsights && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-800/50 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-1">{t('usageEfficiencyLabel')}</p>
            <p className="text-lg font-semibold text-white">{usageEfficiencyScore.toFixed(0)}%</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-1">{t('potentialSavingsLabel')}</p>
            <p className="text-lg font-semibold text-green-400">{formatPrice(potentialMonthlySavings)}</p>
          </div>
        </div>
      )}

      {/* Unused Subscriptions List */}
      {unusedSubscriptions.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h4 className="text-white font-medium mb-1">{t('allSubscriptionsActive')}</h4>
          <p className="text-gray-400 text-sm">{t('noUnusedSubscriptionsFound')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayUnused.map((unused) => (
            <div
              key={unused.subscription_id}
              className={`flex items-center space-x-3 p-3 rounded-lg border ${getSeverityColor(unused.severity)}`}
            >
              {getSeverityIcon(unused.severity)}
              
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-medium truncate">
                  {unused.subscription_name}
                </h4>
                <p className="text-gray-400 text-sm">
                  {t('inactiveFor')} {formatDaysInactive(unused.days_since_last_activity)} • {formatPrice(unused.subscription_cost)} {unused.subscription_frequency.toLowerCase()}
                </p>
                {variant === 'full' && unused.potential_savings > unused.subscription_cost && (
                  <p className="text-green-400 text-xs mt-1">
                    {t('couldSave')} {formatPrice(unused.potential_savings)}
                  </p>
                )}
              </div>

              <div className="text-right">
                <p className={`text-sm font-medium ${getSeverityColor(unused.severity).split(' ')[0]}`}>
                  {unused.severity === 'critical' ? t('criticalStatusLabel') : t('warningStatusLabel')}
                </p>
                {variant === 'compact' && (
                  <p className="text-gray-400 text-xs">{unused.days_since_last_activity}d</p>
                )}
              </div>
            </div>
          ))}

          {unusedSubscriptions.length > maxItems && (
            <div className="text-center pt-2">
              <p className="text-gray-400 text-sm">
                {t('andNMoreUnused', { n: unusedSubscriptions.length - maxItems })}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      {unusedSubscriptions.length > 0 && variant === 'full' && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="flex space-x-2">
            <button
              onClick={() => navigate('/subscriptions')}
              className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {t('reviewSubscriptionsButton')}
            </button>
            <button
              onClick={() => navigate('/settings')}
              className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {t('adjustSettingsButton')}
            </button>
          </div>
        </div>
      )}

      {/* Usage Insights */}
      {variant === 'full' && usageInsights && critical.length + warning.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="bg-blue-900/20 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-blue-400 text-sm">💡</span>
              <span className="text-blue-300 text-sm font-medium">{t('usageInsightLabel')}</span>
            </div>
            <p className="text-blue-200 text-sm">
              {critical.length > 0 
                ? t('criticalUnusedInsight', { count: critical.length, savings: formatPrice(potentialMonthlySavings) })
                : t('warningUnusedInsight', { count: warning.length, savings: formatPrice(potentialMonthlySavings) })
              }
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnusedSubscriptions;
