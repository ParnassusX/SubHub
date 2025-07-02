// Smart Scheduling Component for Phase 2.1: Intelligent Notification System
import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useSmartScheduling } from '../../hooks/useSmartScheduling';

interface SmartSchedulingProps {
  className?: string;
  variant?: 'full' | 'compact';
  showProcessButton?: boolean;
}

const SmartScheduling: React.FC<SmartSchedulingProps> = ({
  className = '',
  variant = 'full',
  showProcessButton = false
}) => {
  const { t } = useTranslation();
  const {
    schedulingInsights,
    processingResults,
    lastProcessed,
    isLoading,
    isProcessing,
    error,
    processSmartScheduling,
    getSchedulingStatus,
    getEfficiencyMetrics,
    getNextProcessingTime,
    isEnabled,
    quietHoursActive,
    nextOptimalTime,
    efficiencyScore
  } = useSmartScheduling();

  const handleProcessScheduling = async () => {
    try {
      await processSmartScheduling();
    } catch (err) {
      console.error('Error processing smart scheduling:', err);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) {
      const diffMinutes = Math.round(diffMs / (1000 * 60));
      return diffMinutes <= 0 ? t('now') : t('inNMinutesShort', { n: diffMinutes });
    } else if (diffHours < 24) {
      return t('inNHoursShort', { n: diffHours });
    } else {
      const diffDays = Math.round(diffHours / 24);
      return t('inNDaysShort', { n: diffDays });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing':
        return (
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
        );
      case 'quiet_hours':
        return (
          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
        );
      case 'active':
        return (
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        );
      case 'disabled':
        return (
          <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
        );
      default:
        return (
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
        );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing':
        return 'text-blue-400 border-blue-500/30 bg-blue-900/20';
      case 'quiet_hours':
        return 'text-purple-400 border-purple-500/30 bg-purple-900/20';
      case 'active':
        return 'text-green-400 border-green-500/30 bg-green-900/20';
      case 'disabled':
        return 'text-gray-400 border-gray-500/30 bg-gray-900/20';
      default:
        return 'text-yellow-400 border-yellow-500/30 bg-yellow-900/20';
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
        <h3 className="text-lg font-semibold text-white mb-4">{t('smartSchedulingTitle')}</h3>
        <div className="text-center py-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const schedulingStatus = getSchedulingStatus();
  const efficiencyMetrics = getEfficiencyMetrics();

  return (
    <div className={`bg-[#1a2332] rounded-xl border border-[#2e4e6b] p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">{t('smartSchedulingTitle')}</h3>
        {showProcessButton && isEnabled && (
          <button
            onClick={handleProcessScheduling}
            disabled={isProcessing}
            className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors disabled:opacity-50"
          >
            {isProcessing ? t('processing') : t('processNow')}
          </button>
        )}
      </div>

      {/* Status Overview */}
      <div className={`flex items-center space-x-3 p-3 rounded-lg border mb-4 ${getStatusColor(schedulingStatus.status)}`}>
        {getStatusIcon(schedulingStatus.status)}
        <div className="flex-1">
          <h4 className="text-white font-medium text-sm">
            {schedulingStatus.enabled ? t('smartSchedulingEnabled') : t('smartSchedulingDisabled')}
          </h4>
          <p className="text-gray-400 text-xs">{schedulingStatus.message}</p>
        </div>
      </div>

      {/* Scheduling Insights */}
      {variant === 'full' && isEnabled && schedulingInsights && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-800/50 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-1">{t('nextOptimalTime')}</p>
            <p className="text-sm font-semibold text-white">
              {formatTime(nextOptimalTime || new Date())}
            </p>
            <p className="text-xs text-gray-400">
              {nextOptimalTime ? formatRelativeTime(nextOptimalTime) : t('unknown')}
            </p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-1">{t('efficiencyScore')}</p>
            <p className="text-sm font-semibold text-white">{efficiencyScore}%</p>
            <p className="text-xs text-gray-400">
              {efficiencyScore >= 80 ? t('excellent') : efficiencyScore >= 60 ? t('good') : t('needsImprovement')}
            </p>
          </div>
        </div>
      )}

      {/* Processing Results */}
      {processingResults && (
        <div className="space-y-3 mb-4">
          <h4 className="text-white font-medium text-sm">{t('lastProcessingResults')}</h4>
          
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-green-900/20 rounded-lg p-2">
              <p className="text-green-400 text-lg font-bold">{processingResults.scheduled}</p>
              <p className="text-green-300 text-xs">{t('immediate')}</p>
            </div>
            <div className="bg-blue-900/20 rounded-lg p-2">
              <p className="text-blue-400 text-lg font-bold">{processingResults.batched}</p>
              <p className="text-blue-300 text-xs">{t('batched')}</p>
            </div>
            <div className="bg-yellow-900/20 rounded-lg p-2">
              <p className="text-yellow-400 text-lg font-bold">{processingResults.deferred}</p>
              <p className="text-yellow-300 text-xs">{t('deferred')}</p>
            </div>
          </div>

          {lastProcessed && (
            <p className="text-gray-400 text-xs text-center">
              {t('lastProcessed')}: {formatTime(lastProcessed)}
            </p>
          )}
        </div>
      )}

      {/* Efficiency Metrics */}
      {variant === 'full' && efficiencyMetrics && efficiencyMetrics.totalProcessed > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="bg-blue-900/20 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-blue-400 text-sm">📊</span>
              <span className="text-blue-300 text-sm font-medium">{t('deliveryEfficiency')}</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-blue-200">{t('immediateDelivery')}</span>
                <span className="text-blue-200">{efficiencyMetrics.immediateDelivery.toFixed(0)}%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-blue-200">{t('batchedDelivery')}</span>
                <span className="text-blue-200">{efficiencyMetrics.batchedDelivery.toFixed(0)}%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-blue-200">{t('deferredDelivery')}</span>
                <span className="text-blue-200">{efficiencyMetrics.deferredDelivery.toFixed(0)}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quiet Hours Indicator */}
      {quietHoursActive && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="bg-purple-900/20 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <span className="text-purple-400 text-sm">🌙</span>
              <span className="text-purple-300 text-sm font-medium">{t('quietHoursActive')}</span>
            </div>
            <p className="text-purple-200 text-xs mt-1">
              {t('notificationsPaused')}
            </p>
          </div>
        </div>
      )}

      {/* Disabled State */}
      {!isEnabled && (
        <div className="text-center py-4">
          <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h4 className="text-white font-medium mb-1">{t('smartSchedulingDisabled')}</h4>
          <p className="text-gray-400 text-sm mb-4">{t('enableInSettings')}</p>
          <button 
            onClick={() => window.location.href = '/settings'}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {t('goToSettings')}
          </button>
        </div>
      )}
    </div>
  );
};

export default SmartScheduling;
