// Upcoming Renewals Component for Phase 2.1: Intelligent Notification System
import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useCurrency } from '../../hooks/useCurrency';
import { useRenewalReminders } from '../../hooks/useRenewalReminders';
import { RenewalReminder } from '../../types/notifications';

interface UpcomingRenewalsProps {
  className?: string;
  maxItems?: number;
  showProcessButton?: boolean;
}

const UpcomingRenewals: React.FC<UpcomingRenewalsProps> = ({
  className = '',
  maxItems = 5,
  showProcessButton = false
}) => {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const {
    upcomingRenewals,
    isLoading,
    error,
    processReminders,
    getRenewalsByUrgency,
    upcomingCost
  } = useRenewalReminders();

  const handleProcessReminders = async () => {
    try {
      const count = await processReminders();
      if (count > 0) {
        // Could show a success message or trigger a notification refresh
        console.log(`Created ${count} renewal reminder notifications`);
      }
    } catch (err) {
      console.error('Error processing reminders:', err);
    }
  };

  const getReminderIcon = (reminder: RenewalReminder) => {
    switch (reminder.reminder_type) {
      case 'urgent':
        return (
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
        );
      case 'medium':
        return (
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
        );
      case 'early':
        return (
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
        );
      default:
        return (
          <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
        );
    }
  };

  const getReminderColor = (reminder: RenewalReminder) => {
    switch (reminder.reminder_type) {
      case 'urgent':
        return 'text-red-400 border-red-500/30';
      case 'medium':
        return 'text-yellow-400 border-yellow-500/30';
      case 'early':
        return 'text-blue-400 border-blue-500/30';
      default:
        return 'text-gray-400 border-gray-500/30';
    }
  };

  const formatDaysUntilRenewal = (days: number) => {
    if (days === 1) {
      return t('tomorrow');
    } else if (days <= 7) {
      return t('inNDays', { n: days });
    } else if (days <= 14) {
      return t('inNWeeks', { n: Math.ceil(days / 7) });
    } else {
      return t('inNDays', { n: days });
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
        <h3 className="text-lg font-semibold text-white mb-4">{t('upcomingRenewals')}</h3>
        <div className="text-center py-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const displayRenewals = upcomingRenewals.slice(0, maxItems);
  const { urgent, medium } = getRenewalsByUrgency();

  return (
    <div className={`bg-[#1a2332] rounded-xl border border-[#2e4e6b] p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">{t('upcomingRenewals')}</h3>
        {showProcessButton && (
          <button
            onClick={handleProcessReminders}
            className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
          >
            {t('checkReminders')}
          </button>
        )}
      </div>

      {/* Summary Stats */}
      {upcomingRenewals.length > 0 && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-800/50 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-1">{t('totalUpcoming')}</p>
            <p className="text-lg font-semibold text-white">{formatPrice(upcomingCost)}</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-1">{t('urgentRenewals')}</p>
            <p className="text-lg font-semibold text-red-400">{urgent.length + medium.length}</p>
          </div>
        </div>
      )}

      {/* Renewals List */}
      {displayRenewals.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h4 className="text-white font-medium mb-1">{t('noUpcomingRenewals')}</h4>
          <p className="text-gray-400 text-sm">{t('noUpcomingRenewalsDescription')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayRenewals.map((renewal) => (
            <div
              key={renewal.subscription_id}
              className={`flex items-center space-x-3 p-3 rounded-lg border ${getReminderColor(renewal)} bg-gray-800/30`}
            >
              {getReminderIcon(renewal)}
              
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-medium truncate">
                  {renewal.subscription_name}
                </h4>
                <p className="text-gray-400 text-sm">
                  {formatDaysUntilRenewal(renewal.days_until_renewal)} • {formatPrice(renewal.cost)}
                </p>
              </div>

              <div className="text-right">
                <p className={`text-sm font-medium ${getReminderColor(renewal).split(' ')[0]}`}>
                  {renewal.days_until_renewal === 1 ? t('tomorrow') : `${renewal.days_until_renewal}d`}
                </p>
              </div>
            </div>
          ))}

          {upcomingRenewals.length > maxItems && (
            <div className="text-center pt-2">
              <p className="text-gray-400 text-sm">
                {t('andNMore', { n: upcomingRenewals.length - maxItems })}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      {upcomingRenewals.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="flex space-x-2">
            <button className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
              {t('viewAllRenewals')}
            </button>
            <button className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors">
              {t('manageSubscriptions')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpcomingRenewals;
