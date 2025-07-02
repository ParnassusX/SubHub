// Offline Indicator Component
import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useOffline } from '../hooks/useOffline';
import { OfflineStorageService } from '../services/offlineStorageService';

interface OfflineIndicatorProps {
  className?: string;
  showWhenOnline?: boolean;
}

const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  className = '',
  showWhenOnline = false
}) => {
  const { t } = useTranslation();
  const { isOffline, isOnline, wasOffline } = useOffline();
  const cacheStats = OfflineStorageService.getCacheStats();

  // Don't show if online and showWhenOnline is false
  if (isOnline && !showWhenOnline && !wasOffline) {
    return null;
  }

  // Show different states based on connection
  if (isOffline) {
    return (
      <div className={`bg-orange-900/20 border border-orange-700/50 rounded-lg p-3 ${className}`}>
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-12.728 12.728m0 0L5.636 5.636m0 12.728L18.364 5.636" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-orange-400">
              {t('offlineMode', 'Offline Mode')}
            </h4>
            <p className="text-xs text-orange-300 mt-1">
              {cacheStats.hasCache 
                ? t('viewingCachedData', `Viewing cached data from ${cacheStats.cacheAge}`)
                : t('noCachedData', 'No cached data available')
              }
            </p>
            {cacheStats.hasCache && (
              <p className="text-xs text-orange-200 mt-1">
                {t('cachedSubscriptions', `${cacheStats.subscriptionCount} subscriptions cached`)}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Show back online message briefly
  if (isOnline && wasOffline) {
    return (
      <div className={`bg-green-900/20 border border-green-700/50 rounded-lg p-3 ${className}`}>
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-green-400">
              {t('backOnline', 'Back Online')}
            </h4>
            <p className="text-xs text-green-300 mt-1">
              {t('dataWillUpdate', 'Your data will update automatically')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show cache info when online (if requested)
  if (showWhenOnline && cacheStats.hasCache) {
    return (
      <div className={`bg-blue-900/20 border border-blue-700/50 rounded-lg p-3 ${className}`}>
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-blue-400">
              {t('offlineReady')}
            </h4>
            <p className="text-xs text-blue-300 mt-1">
              {t('dataAvailableOffline', `${cacheStats.subscriptionCount} subscriptions available offline`)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default OfflineIndicator;
