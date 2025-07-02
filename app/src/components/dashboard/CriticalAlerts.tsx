// Critical Alerts Section for Dashboard UX Optimization
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrency } from '../../hooks/useCurrency';
import { useTranslation } from '../../hooks/useTranslation';
import ResponsiveCard from './ResponsiveCard';

interface Alert {
  id: string;
  type: 'budget_exceeded' | 'budget_warning' | 'urgent_renewal' | 'unused_subscription';
  title: string;
  message: string;
  severity: 'critical' | 'warning' | 'info';
  actionLabel?: string;
  actionPath?: string;
  data?: any;
}

interface CriticalAlertsProps {
  alerts: Alert[];
  maxVisible?: number;
}

const CriticalAlerts: React.FC<CriticalAlertsProps> = ({ alerts, maxVisible = 3 }) => {
  const { formatPrice: _formatPrice } = useCurrency();
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Filter and sort alerts by severity
  const criticalAlerts = alerts
    .filter(alert => alert.severity === 'critical' || alert.severity === 'warning')
    .sort((a, b) => {
      const severityOrder = { critical: 0, warning: 1, info: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    })
    .slice(0, maxVisible);

  if (criticalAlerts.length === 0) {
    return (
      <ResponsiveCard variant="default" padding="md">
        <div className="text-center py-4">
          <div className="w-12 h-12 bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-green-400 text-2xl">✅</span>
          </div>
          <h3 className="text-white font-medium mb-1">{t('allGoodStatus')}</h3>
          <p className="text-gray-400 text-sm">{t('noActiveAlertsMessage')}</p>
        </div>
      </ResponsiveCard>
    );
  }

  const getSeverityStyles = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical':
        return {
          border: 'border-red-500/30',
          bg: 'bg-red-900/20',
          icon: '🚨',
          iconBg: 'bg-red-500/20',
          iconColor: 'text-red-400',
          titleColor: 'text-red-300'
        };
      case 'warning':
        return {
          border: 'border-yellow-500/30',
          bg: 'bg-yellow-900/20',
          icon: '⚠️',
          iconBg: 'bg-yellow-500/20',
          iconColor: 'text-yellow-400',
          titleColor: 'text-yellow-300'
        };
      default:
        return {
          border: 'border-blue-500/30',
          bg: 'bg-blue-900/20',
          icon: 'ℹ️',
          iconBg: 'bg-blue-500/20',
          iconColor: 'text-blue-400',
          titleColor: 'text-blue-300'
        };
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-white text-lg font-bold">{t('criticalAlertsTitle')}</h2>
        {alerts.length > maxVisible && (
          <button
            onClick={() => navigate('/notifications')}
            className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
          >
            {t('viewAllButton')} ({alerts.length})
          </button>
        )}
      </div>

      <div className="space-y-3">
        {criticalAlerts.map((alert) => {
          const styles = getSeverityStyles(alert.severity);
          
          return (
            <ResponsiveCard
              key={alert.id}
              className={`${styles.border} ${styles.bg}`}
              padding="md"
              hover={!!alert.actionPath}
              onClick={alert.actionPath ? () => navigate(alert.actionPath!) : undefined}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 ${styles.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <span className="text-lg">{styles.icon}</span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className={`font-medium ${styles.titleColor} mb-1`}>
                    {alert.title}
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {alert.message}
                  </p>
                  
                  {alert.actionLabel && alert.actionPath && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(alert.actionPath!);
                      }}
                      className={`mt-2 text-sm font-medium ${styles.iconColor} hover:underline`}
                    >
                      {alert.actionLabel} →
                    </button>
                  )}
                </div>

                {alert.severity === 'critical' && (
                  <div className="flex-shrink-0">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>
            </ResponsiveCard>
          );
        })}
      </div>

      {alerts.length > maxVisible && (
        <ResponsiveCard variant="compact" padding="sm" hover onClick={() => navigate('/notifications')}>
          <div className="text-center">
            <p className="text-gray-400 text-sm">
              {t('andNMoreAlertsText', { n: alerts.length - maxVisible })}
            </p>
          </div>
        </ResponsiveCard>
      )}
    </div>
  );
};

export default CriticalAlerts;
