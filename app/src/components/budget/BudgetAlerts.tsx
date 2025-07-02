// Budget Alerts Component - Display and manage budget alerts
import React, { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useCurrency } from '../../hooks/useCurrency';
import { useBudgetAlerts } from '../../hooks/useBudgetAlerts';
import { BudgetAlert } from '../../services/budgetAlertService';

interface BudgetAlertsProps {
  className?: string;
  maxAlerts?: number;
  showSettings?: boolean;
  compact?: boolean;
}

const BudgetAlerts: React.FC<BudgetAlertsProps> = ({
  className = '',
  maxAlerts = 5,
  showSettings = false,
  compact = false
}) => {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const {
    activeAlerts,
    criticalAlerts,
    alertCounts,
    acknowledgeAlert,
    clearAllAlerts,
    hasActiveAlerts
  } = useBudgetAlerts();
  
  const [showAllAlerts, setShowAllAlerts] = useState(false);

  // Get alerts to display
  const alertsToShow = showAllAlerts 
    ? activeAlerts 
    : activeAlerts.slice(0, maxAlerts);

  // Get alert icon
  const getAlertIcon = (alert: BudgetAlert) => {
    if (alert.severity === 'critical' || alert.actionRequired) {
      return '🚨';
    }
    return '⚠️';
  };

  // Get alert color classes
  const getAlertClasses = (alert: BudgetAlert) => {
    if (alert.severity === 'critical' || alert.actionRequired) {
      return {
        bg: 'bg-red-900/20',
        border: 'border-red-700/50',
        text: 'text-red-400',
        button: 'text-red-400 hover:text-red-300'
      };
    }
    return {
      bg: 'bg-yellow-900/20',
      border: 'border-yellow-700/50',
      text: 'text-yellow-400',
      button: 'text-yellow-400 hover:text-yellow-300'
    };
  };

  // Format alert timestamp
  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return `${diffDays}d ago`;
    }
  };

  if (!hasActiveAlerts) {
    return compact ? null : (
      <div className={`bg-[#1a2332] rounded-xl border border-[#2e4e6b] p-6 ${className}`}>
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">
            <svg className="w-12 h-12 mx-auto opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h4 className="text-white font-medium mb-2">{t('noActiveAlerts', 'No active alerts')}</h4>
          <p className="text-gray-400 text-sm">
            {t('budgetAlertsAllClear', 'Your budget is on track')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-[#1a2332] rounded-xl border border-[#2e4e6b] p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold text-white">{t('budgetAlerts')}</h3>
          {alertCounts.critical > 0 && (
            <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
              {alertCounts.critical}
            </span>
          )}
        </div>
        
        {!compact && (
          <div className="flex items-center space-x-2">
            {activeAlerts.length > maxAlerts && !showAllAlerts && (
              <button
                onClick={() => setShowAllAlerts(true)}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                {t('viewAll')} ({activeAlerts.length})
              </button>
            )}
            
            {activeAlerts.length > 0 && (
              <button
                onClick={clearAllAlerts}
                className="text-sm text-gray-400 hover:text-gray-300 transition-colors"
              >
                {t('clearAll', 'Clear All')}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Alert Summary */}
      {!compact && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-red-900/10 rounded-lg">
            <p className="text-red-400 text-lg font-bold">{alertCounts.critical}</p>
            <p className="text-red-300 text-xs">{t('critical', 'Critical')}</p>
          </div>
          <div className="text-center p-3 bg-yellow-900/10 rounded-lg">
            <p className="text-yellow-400 text-lg font-bold">{alertCounts.warning}</p>
            <p className="text-yellow-300 text-xs">{t('warning')}</p>
          </div>
        </div>
      )}

      {/* Alerts List */}
      <div className="space-y-3">
        {alertsToShow.map(alert => {
          const alertClasses = getAlertClasses(alert);
          
          return (
            <div
              key={alert.id}
              className={`p-4 rounded-lg border ${alertClasses.bg} ${alertClasses.border}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="text-lg flex-shrink-0">{getAlertIcon(alert)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className={`font-medium ${alertClasses.text}`}>
                        {alert.type === 'category' && alert.category 
                          ? `${alert.category} ${t('budget')}`
                          : alert.type === 'monthly' 
                          ? t('monthlyBudget')
                          : t('yearlyBudget')
                        }
                      </h4>
                      {!compact && (
                        <span className="text-xs text-gray-400">
                          {formatTimestamp(alert.timestamp)}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-300 mb-2">
                      {alert.message}
                    </p>
                    
                    {!compact && (
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>
                          {formatPrice(alert.currentAmount)} / {formatPrice(alert.budgetAmount)}
                        </span>
                        <span className={alertClasses.text}>
                          {alert.percentageUsed.toFixed(1)}%
                        </span>
                      </div>
                    )}
                    
                    {alert.actionRequired && (
                      <div className="mt-2 text-xs text-gray-300">
                        <span className="font-medium">{t('actionRequired', 'Action Required')}: </span>
                        {t('reviewBudgetOrSpending', 'Review your budget or spending')}
                      </div>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={() => acknowledgeAlert(alert.id)}
                  className={`ml-2 ${alertClasses.button} transition-colors`}
                  aria-label={t('acknowledgeAlert', 'Acknowledge alert')}
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

      {/* Show More/Less */}
      {!compact && activeAlerts.length > maxAlerts && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setShowAllAlerts(!showAllAlerts)}
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            {showAllAlerts 
              ? t('showLess', 'Show Less')
              : `${t('showMore', 'Show More')} (${activeAlerts.length - maxAlerts})`
            }
          </button>
        </div>
      )}

      {/* Critical Alert Banner */}
      {criticalAlerts.length > 0 && compact && (
        <div className="mt-4 p-3 bg-red-900/30 border border-red-700/50 rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="text-red-400 text-lg">🚨</span>
            <div>
              <p className="text-red-400 font-medium text-sm">
                {criticalAlerts.length} {t('criticalAlerts', 'critical alerts')}
              </p>
              <p className="text-red-300 text-xs">
                {t('immediateAttentionRequired', 'Immediate attention required')}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetAlerts;
