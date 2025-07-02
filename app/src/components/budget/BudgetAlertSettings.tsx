// Budget Alert Settings Component
import React, { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { BUDGET_THRESHOLDS } from '../../constants/budget';

interface BudgetAlertSettingsProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
}

const BudgetAlertSettings: React.FC<BudgetAlertSettingsProps> = ({
  enabled,
  onChange,
  disabled = false
}) => {
  const { t } = useTranslation();
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Alert threshold options
  const thresholdOptions = [
    { value: 50, label: '50%', description: t('alertAt50', 'Alert when 50% of budget is used') },
    { value: 75, label: '75%', description: t('alertAt75', 'Alert when 75% of budget is used') },
    { value: 90, label: '90%', description: t('alertAt90', 'Alert when 90% of budget is used') },
    { value: 100, label: '100%', description: t('alertAt100', 'Alert when budget is exceeded') }
  ];

  // Alert type options
  const alertTypes = [
    {
      id: 'monthly',
      label: t('monthlyBudgetAlerts', 'Monthly budget alerts'),
      description: t('monthlyBudgetAlertsDesc', 'Get notified about monthly budget status'),
      icon: '📅'
    },
    {
      id: 'yearly',
      label: t('yearlyBudgetAlerts', 'Yearly budget alerts'),
      description: t('yearlyBudgetAlertsDesc', 'Get notified about yearly budget status'),
      icon: '📊'
    },
    {
      id: 'category',
      label: t('categoryBudgetAlerts', 'Category budget alerts'),
      description: t('categoryBudgetAlertsDesc', 'Get notified about category-specific budget limits'),
      icon: '🏷️'
    }
  ];

  return (
    <div className="space-y-4">
      {/* Main Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium text-gray-300">{t('budgetAlerts')}</h4>
          <p className="text-xs text-gray-400 mt-1">
            {t('budgetAlertDescription')}
          </p>
        </div>
        
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => onChange(e.target.checked)}
            disabled={disabled}
            className="sr-only peer"
          />
          <div className={`
            relative w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 
            peer-focus:ring-blue-800 rounded-full peer 
            peer-checked:after:translate-x-full peer-checked:after:border-white 
            after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
            after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all
            peer-checked:bg-blue-600
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `} />
        </label>
      </div>

      {/* Alert Configuration (shown when enabled) */}
      {enabled && (
        <div className="space-y-4 pl-4 border-l-2 border-blue-500/30">
          {/* Alert Types */}
          <div className="space-y-3">
            <h5 className="text-sm font-medium text-gray-300">{t('alertTypes', 'Alert Types')}</h5>
            
            {alertTypes.map(alertType => (
              <div key={alertType.id} className="flex items-start space-x-3 p-3 bg-gray-800/30 rounded-lg">
                <div className="flex-shrink-0 text-lg">{alertType.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h6 className="text-sm font-medium text-white">{alertType.label}</h6>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked={true}
                        disabled={disabled}
                        className="sr-only peer"
                      />
                      <div className={`
                        relative w-9 h-5 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 
                        peer-focus:ring-blue-800 rounded-full peer 
                        peer-checked:after:translate-x-full peer-checked:after:border-white 
                        after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                        after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all
                        peer-checked:bg-blue-600
                        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                      `} />
                    </label>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{alertType.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Alert Thresholds */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="text-sm font-medium text-gray-300">{t('alertThresholds', 'Alert Thresholds')}</h5>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                disabled={disabled}
                className="text-xs text-blue-400 hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {showAdvanced ? t('hideAdvanced', 'Hide Advanced') : t('showAdvanced', 'Show Advanced')}
              </button>
            </div>

            {/* Default Threshold Display */}
            {!showAdvanced && (
              <div className="p-3 bg-gray-800/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white">{t('defaultThreshold', 'Default threshold')}</p>
                    <p className="text-xs text-gray-400">{t('alertAt75')}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-semibold text-yellow-400">75%</span>
                    <p className="text-xs text-gray-400">{t('recommended', 'Recommended')}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Advanced Threshold Configuration */}
            {showAdvanced && (
              <div className="space-y-2">
                {thresholdOptions.map(option => (
                  <label
                    key={option.value}
                    className={`
                      flex items-center justify-between p-3 bg-gray-800/30 rounded-lg cursor-pointer
                      hover:bg-gray-800/50 transition-colors
                      ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="alertThreshold"
                        value={option.value}
                        defaultChecked={option.value === BUDGET_THRESHOLDS.WARNING}
                        disabled={disabled}
                        className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-500"
                      />
                      <div>
                        <p className="text-sm text-white">{option.label}</p>
                        <p className="text-xs text-gray-400">{option.description}</p>
                      </div>
                    </div>
                    <div className={`
                      text-lg font-semibold
                      ${option.value === 50 ? 'text-green-400' :
                        option.value === 75 ? 'text-yellow-400' :
                        option.value === 90 ? 'text-orange-400' :
                        'text-red-400'}
                    `}>
                      {option.label}
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Notification Methods */}
          <div className="space-y-3">
            <h5 className="text-sm font-medium text-gray-300">{t('notificationMethods', 'Notification Methods')}</h5>
            
            <div className="space-y-2">
              {/* In-App Notifications */}
              <label className={`
                flex items-center justify-between p-3 bg-gray-800/30 rounded-lg cursor-pointer
                hover:bg-gray-800/50 transition-colors
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}>
                <div className="flex items-center space-x-3">
                  <div className="text-lg">🔔</div>
                  <div>
                    <p className="text-sm text-white">{t('inAppNotifications', 'In-app notifications')}</p>
                    <p className="text-xs text-gray-400">{t('inAppNotificationsDesc', 'Show alerts within the application')}</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  defaultChecked={true}
                  disabled={disabled}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
              </label>

              {/* Email Notifications */}
              <label className={`
                flex items-center justify-between p-3 bg-gray-800/30 rounded-lg cursor-pointer
                hover:bg-gray-800/50 transition-colors
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}>
                <div className="flex items-center space-x-3">
                  <div className="text-lg">📧</div>
                  <div>
                    <p className="text-sm text-white">{t('emailNotifications', 'Email notifications')}</p>
                    <p className="text-xs text-gray-400">{t('emailNotificationsDesc', 'Send alerts to your email address')}</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  defaultChecked={false}
                  disabled={disabled}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
              </label>
            </div>
          </div>

          {/* Alert Preview */}
          <div className="p-3 bg-blue-900/20 border border-blue-700/50 rounded-lg">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 text-blue-400">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h6 className="text-sm font-medium text-blue-400">{t('alertPreview', 'Alert Preview')}</h6>
                <p className="text-xs text-blue-300 mt-1">
                  {t('alertPreviewText', 'You\'ve used 75% of your monthly Entertainment budget ($75 of $100)')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Disabled State Message */}
      {!enabled && (
        <div className="p-3 bg-gray-800/30 rounded-lg border border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-400">{t('budgetAlertsDisabled', 'Budget alerts are disabled')}</p>
              <p className="text-xs text-gray-500 mt-1">
                {t('enableAlertsToReceive', 'Enable alerts to receive notifications about your budget status')}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetAlertSettings;
