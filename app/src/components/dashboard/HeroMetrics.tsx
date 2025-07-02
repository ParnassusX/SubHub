// Hero Metrics Section for Dashboard UX Optimization
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrency } from '../../hooks/useCurrency';
import { useTranslation } from '../../hooks/useTranslation';
import ResponsiveCard from './ResponsiveCard';

interface HeroMetricsProps {
  stats: {
    totalSubscriptions: number;
    monthlySpending: number;
    yearlySpending: number;
    upcomingRenewals: number;
  };
  budgetStatus?: {
    monthlyBudget: number;
    monthlySpent: number;
    budgetUtilization: number;
    status: 'safe' | 'warning' | 'critical';
  };
}

const HeroMetrics: React.FC<HeroMetricsProps> = ({ stats, budgetStatus }) => {
  const { formatPrice } = useCurrency();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const getStatusColor = (status: 'safe' | 'warning' | 'critical') => {
    switch (status) {
      case 'critical': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      case 'safe': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: 'safe' | 'warning' | 'critical') => {
    switch (status) {
      case 'critical': return '🚨';
      case 'warning': return '⚠️';
      case 'safe': return '✅';
      default: return '📊';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Primary Hero Card - Budget Overview */}
      {budgetStatus && (
        <ResponsiveCard variant="hero" padding="lg" hover onClick={() => navigate('/settings')}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getStatusIcon(budgetStatus.status)}</span>
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  {t('monthlyBudgetStatus')}
                </h2>
              </div>
              <p className="text-gray-300 text-sm sm:text-base">
                {formatPrice(budgetStatus.monthlySpent)} of {formatPrice(budgetStatus.monthlyBudget)} used
              </p>
            </div>
            <div className="text-right">
              <div className={`text-2xl sm:text-3xl font-bold ${getStatusColor(budgetStatus.status)}`}>
                {budgetStatus.budgetUtilization.toFixed(0)}%
              </div>
              <div className="w-full sm:w-32 bg-gray-700 rounded-full h-2 mt-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    budgetStatus.status === 'critical' ? 'bg-red-500' :
                    budgetStatus.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(budgetStatus.budgetUtilization, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </ResponsiveCard>
      )}

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Monthly Spending */}
        <ResponsiveCard variant="compact" padding="md" hover onClick={() => navigate('/reports')}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
              <span className="text-blue-400 text-lg">💰</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white text-lg font-bold truncate">{formatPrice(stats.monthlySpending)}</p>
              <p className="text-gray-400 text-xs">{t('monthlyLabel')}</p>
            </div>
          </div>
        </ResponsiveCard>

        {/* Total Subscriptions */}
        <ResponsiveCard variant="compact" padding="md" hover onClick={() => navigate('/subscriptions')}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
              <span className="text-purple-400 text-lg">📱</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white text-lg font-bold">{stats.totalSubscriptions}</p>
              <p className="text-gray-400 text-xs">{t('subscriptionsLabel')}</p>
            </div>
          </div>
        </ResponsiveCard>

        {/* Yearly Spending */}
        <ResponsiveCard variant="compact" padding="md" hover onClick={() => navigate('/reports')}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
              <span className="text-green-400 text-lg">📈</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white text-lg font-bold truncate">{formatPrice(stats.yearlySpending)}</p>
              <p className="text-gray-400 text-xs">{t('yearlyLabel')}</p>
            </div>
          </div>
        </ResponsiveCard>

        {/* Upcoming Renewals */}
        <ResponsiveCard variant="compact" padding="md" hover onClick={() => navigate('/renewals')}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-600/20 rounded-lg flex items-center justify-center">
              <span className="text-orange-400 text-lg">🔔</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white text-lg font-bold">{stats.upcomingRenewals}</p>
              <p className="text-gray-400 text-xs">{t('renewalsDueSoon')}</p>
            </div>
          </div>
        </ResponsiveCard>
      </div>
    </div>
  );
};

export default HeroMetrics;
