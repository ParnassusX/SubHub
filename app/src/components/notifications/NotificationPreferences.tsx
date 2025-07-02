// Notification Preferences Component for Phase 2.1: Intelligent Notification System
import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { db } from '../../lib/supabase';
import { NotificationPreferences as NotificationPrefsType } from '../../types/notifications';
import { useAuth } from '../../contexts/AuthContext';

interface NotificationPreferencesProps {
  className?: string;
}

const NotificationPreferences: React.FC<NotificationPreferencesProps> = ({ className = '' }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPrefsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load notification preferences
  useEffect(() => {
    const loadPreferences = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await db.notificationPreferences.get();
        
        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
          throw error;
        }
        
        if (data) {
          setPreferences(data);
        } else {
          // Create default preferences for new user
          const defaultPrefs = {
            user_id: user.id,
            renewal_reminder_enabled: true,
            renewal_reminder_days: [1, 3, 7],
            spending_threshold_enabled: true,
            spending_threshold_percentage: 80,
            unused_subscription_enabled: true,
            unused_subscription_days: 30,
            price_change_enabled: true,
            email_notifications_enabled: true,
            push_notifications_enabled: true,
            in_app_notifications_enabled: true,
            quiet_hours_enabled: false,
            max_daily_notifications: 5
          };
          
          const { data: newPrefs, error: createError } = await db.notificationPreferences.create(defaultPrefs);
          if (createError) throw createError;
          setPreferences(newPrefs);
        }
      } catch (err) {
        console.error('Error loading notification preferences:', err);
        setError(err instanceof Error ? err.message : 'Failed to load preferences');
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, [user]);

  // Update preferences
  const updatePreference = async (updates: Partial<NotificationPrefsType>) => {
    if (!preferences) return;
    
    try {
      setIsSaving(true);
      setError(null);
      
      const { data, error } = await db.notificationPreferences.update(updates);
      if (error) throw error;
      
      setPreferences(data);
      setSuccessMessage('Preferences updated successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error updating preferences:', err);
      setError(err instanceof Error ? err.message : 'Failed to update preferences');
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle switch component
  const ToggleSwitch: React.FC<{
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
  }> = ({ checked, onChange, disabled = false }) => (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled || isSaving}
      />
      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-disabled:opacity-50"></div>
    </label>
  );

  if (isLoading) {
    return (
      <div className={`bg-[#1a2332] rounded-xl border border-[#2e4e6b] p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-700 rounded w-32"></div>
                  <div className="h-3 bg-gray-700 rounded w-48"></div>
                </div>
                <div className="w-11 h-6 bg-gray-700 rounded-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className={`bg-[#1a2332] rounded-xl border border-[#2e4e6b] p-6 ${className}`}>
        <div className="text-center py-8">
          <p className="text-gray-400">Failed to load notification preferences</p>
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-[#1a2332] rounded-xl border border-[#2e4e6b] p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">{t('notificationPreferences')}</h3>
        {isSaving && (
          <div className="flex items-center text-blue-400 text-sm">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {t('saving')}
          </div>
        )}
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-900/20 border border-green-700/50 rounded-lg">
          <p className="text-green-400 text-sm">{successMessage}</p>
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-3 bg-red-900/20 border border-red-700/50 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Renewal Reminders Section */}
        <div className="space-y-4">
          <h4 className="text-white font-medium text-base border-b border-gray-700 pb-2">
            {t('renewalReminders')}
          </h4>
          
          <div className="flex items-center justify-between">
            <div>
              <h5 className="text-white font-medium">{t('enableRenewalReminders')}</h5>
              <p className="text-gray-400 text-sm">{t('renewalRemindersDescription')}</p>
            </div>
            <ToggleSwitch
              checked={preferences.renewal_reminder_enabled}
              onChange={(checked) => updatePreference({ renewal_reminder_enabled: checked })}
            />
          </div>

          {preferences.renewal_reminder_enabled && (
            <div className="ml-4 pl-4 border-l border-gray-700">
              <h6 className="text-gray-300 text-sm font-medium mb-2">{t('reminderDays')}</h6>
              <div className="flex flex-wrap gap-2">
                {[1, 3, 7, 14, 30].map((days) => (
                  <label key={days} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.renewal_reminder_days?.includes(days) || false}
                      onChange={(e) => {
                        const currentDays = preferences.renewal_reminder_days || [];
                        const newDays = e.target.checked
                          ? [...currentDays, days].sort((a, b) => a - b)
                          : currentDays.filter(d => d !== days);
                        updatePreference({ renewal_reminder_days: newDays });
                      }}
                      className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-gray-300 text-sm">
                      {days === 1 ? t('1Day') : t('nDays', { n: days })}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Spending Threshold Section */}
        <div className="space-y-4">
          <h4 className="text-white font-medium text-base border-b border-gray-700 pb-2">
            {t('spendingAlerts')}
          </h4>
          
          <div className="flex items-center justify-between">
            <div>
              <h5 className="text-white font-medium">{t('enableSpendingAlerts')}</h5>
              <p className="text-gray-400 text-sm">{t('spendingAlertsDescription')}</p>
            </div>
            <ToggleSwitch
              checked={preferences.spending_threshold_enabled}
              onChange={(checked) => updatePreference({ spending_threshold_enabled: checked })}
            />
          </div>

          {preferences.spending_threshold_enabled && (
            <div className="ml-4 pl-4 border-l border-gray-700 space-y-3">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1">
                  {t('alertThreshold')}
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="50"
                    max="100"
                    step="5"
                    value={preferences.spending_threshold_percentage}
                    onChange={(e) => updatePreference({ spending_threshold_percentage: parseInt(e.target.value) })}
                    className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-white text-sm font-medium w-12">
                    {preferences.spending_threshold_percentage}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Unused Subscriptions Section */}
        <div className="space-y-4">
          <h4 className="text-white font-medium text-base border-b border-gray-700 pb-2">
            {t('unusedSubscriptions')}
          </h4>
          
          <div className="flex items-center justify-between">
            <div>
              <h5 className="text-white font-medium">{t('enableUnusedDetection')}</h5>
              <p className="text-gray-400 text-sm">{t('unusedDetectionDescription')}</p>
            </div>
            <ToggleSwitch
              checked={preferences.unused_subscription_enabled}
              onChange={(checked) => updatePreference({ unused_subscription_enabled: checked })}
            />
          </div>

          {preferences.unused_subscription_enabled && (
            <div className="ml-4 pl-4 border-l border-gray-700">
              <label className="block text-gray-300 text-sm font-medium mb-1">
                {t('inactiveDays')}
              </label>
              <select
                value={preferences.unused_subscription_days}
                onChange={(e) => updatePreference({ unused_subscription_days: parseInt(e.target.value) })}
                className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-32 p-2"
              >
                <option value={7}>7 {t('days')}</option>
                <option value={14}>14 {t('days')}</option>
                <option value={30}>30 {t('days')}</option>
                <option value={60}>60 {t('days')}</option>
                <option value={90}>90 {t('days')}</option>
              </select>
            </div>
          )}
        </div>

        {/* Delivery Preferences Section */}
        <div className="space-y-4">
          <h4 className="text-white font-medium text-base border-b border-gray-700 pb-2">
            {t('deliveryPreferences')}
          </h4>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="text-white font-medium">{t('emailNotificationsPref')}</h5>
                <p className="text-gray-400 text-sm">{t('emailNotificationsPrefDescription')}</p>
              </div>
              <ToggleSwitch
                checked={preferences.email_notifications_enabled}
                onChange={(checked) => updatePreference({ email_notifications_enabled: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h5 className="text-white font-medium">{t('pushNotificationsPref')}</h5>
                <p className="text-gray-400 text-sm">{t('pushNotificationsPrefDescription')}</p>
              </div>
              <ToggleSwitch
                checked={preferences.push_notifications_enabled}
                onChange={(checked) => updatePreference({ push_notifications_enabled: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h5 className="text-white font-medium">{t('inAppNotificationsPref')}</h5>
                <p className="text-gray-400 text-sm">{t('inAppNotificationsPrefDescription')}</p>
              </div>
              <ToggleSwitch
                checked={preferences.in_app_notifications_enabled}
                onChange={(checked) => updatePreference({ in_app_notifications_enabled: checked })}
              />
            </div>
          </div>
        </div>

        {/* Quiet Hours Section */}
        <div className="space-y-4">
          <h4 className="text-white font-medium text-base border-b border-gray-700 pb-2">
            {t('quietHours')}
          </h4>
          
          <div className="flex items-center justify-between">
            <div>
              <h5 className="text-white font-medium">{t('enableQuietHours')}</h5>
              <p className="text-gray-400 text-sm">{t('quietHoursDescription')}</p>
            </div>
            <ToggleSwitch
              checked={preferences.quiet_hours_enabled}
              onChange={(checked) => updatePreference({ quiet_hours_enabled: checked })}
            />
          </div>

          {preferences.quiet_hours_enabled && (
            <div className="ml-4 pl-4 border-l border-gray-700 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-1">
                    {t('startTime')}
                  </label>
                  <input
                    type="time"
                    value={preferences.quiet_hours_start || '22:00'}
                    onChange={(e) => updatePreference({ quiet_hours_start: e.target.value })}
                    className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-1">
                    {t('endTime')}
                  </label>
                  <input
                    type="time"
                    value={preferences.quiet_hours_end || '08:00'}
                    onChange={(e) => updatePreference({ quiet_hours_end: e.target.value })}
                    className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Advanced Settings */}
        <div className="space-y-4">
          <h4 className="text-white font-medium text-base border-b border-gray-700 pb-2">
            {t('advancedSettings')}
          </h4>
          
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-1">
              {t('maxDailyNotifications')}
            </label>
            <p className="text-gray-400 text-xs mb-2">{t('maxDailyNotificationsDescription')}</p>
            <select
              value={preferences.max_daily_notifications}
              onChange={(e) => updatePreference({ max_daily_notifications: parseInt(e.target.value) })}
              className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-32 p-2"
            >
              <option value={3}>3</option>
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={-1}>{t('unlimited')}</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPreferences;
