// Notification Setup Step - Configure notification preferences
import React, { useState } from 'react';
import { Bell, Mail, Smartphone, Clock } from 'lucide-react';

import { SettingsService } from '../../../services/settingsService';
import type { OnboardingStepProps } from '../../../types/onboarding';

const NotificationSetupStep: React.FC<OnboardingStepProps> = ({
  onNext
}) => {
  
  const [preferences, setPreferences] = useState({
    email_notifications: true,
    push_notifications: false,
    renewal_alerts: true,
    spending_alerts: true,
    reminder_frequency: '3_days'
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleToggle = (key: string) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };

  const handleSaveAndContinue = async () => {
    setIsLoading(true);
    setError('');

    try {
      await SettingsService.updateNotificationSettings(preferences);
      onNext();
    } catch (err) {
      console.error('Error saving notification settings:', err);
      setError('Failed to save notification settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto">
          <Bell className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-xl font-semibold text-white">
          Set Up Notifications
        </h2>
        <p className="text-gray-400">
          Stay informed about your subscriptions
        </p>
      </div>

      {/* Notification Options */}
      <div className="space-y-4">
        {/* Email Notifications */}
        <div className="flex items-center justify-between p-4 bg-[#1a2f3f] rounded-lg border border-[#2e4e6b]">
          <div className="flex items-center space-x-3">
            <Mail className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="font-medium text-white">Email Notifications</h3>
              <p className="text-sm text-gray-400">Get notified via email</p>
            </div>
          </div>
          <button
            onClick={() => handleToggle('email_notifications')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              preferences.email_notifications ? 'bg-blue-600' : 'bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                preferences.email_notifications ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Push Notifications */}
        <div className="flex items-center justify-between p-4 bg-[#1a2f3f] rounded-lg border border-[#2e4e6b]">
          <div className="flex items-center space-x-3">
            <Smartphone className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="font-medium text-white">Push Notifications</h3>
              <p className="text-sm text-gray-400">Browser notifications</p>
            </div>
          </div>
          <button
            onClick={() => handleToggle('push_notifications')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              preferences.push_notifications ? 'bg-blue-600' : 'bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                preferences.push_notifications ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Renewal Alerts */}
        <div className="flex items-center justify-between p-4 bg-[#1a2f3f] rounded-lg border border-[#2e4e6b]">
          <div className="flex items-center space-x-3">
            <Clock className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="font-medium text-white">Renewal Alerts</h3>
              <p className="text-sm text-gray-400">Remind me before renewals</p>
            </div>
          </div>
          <button
            onClick={() => handleToggle('renewal_alerts')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              preferences.renewal_alerts ? 'bg-blue-600' : 'bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                preferences.renewal_alerts ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Spending Alerts */}
        <div className="flex items-center justify-between p-4 bg-[#1a2f3f] rounded-lg border border-[#2e4e6b]">
          <div className="flex items-center space-x-3">
            <Bell className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="font-medium text-white">Spending Alerts</h3>
              <p className="text-sm text-gray-400">Budget threshold notifications</p>
            </div>
          </div>
          <button
            onClick={() => handleToggle('spending_alerts')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              preferences.spending_alerts ? 'bg-blue-600' : 'bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                preferences.spending_alerts ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Reminder Frequency */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Reminder Frequency
          </label>
          <select
            value={preferences.reminder_frequency}
            onChange={(e) => setPreferences(prev => ({ ...prev, reminder_frequency: e.target.value }))}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="1_day">1 day before</option>
            <option value="3_days">3 days before</option>
            <option value="7_days">1 week before</option>
            <option value="14_days">2 weeks before</option>
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-3">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-600/10 border border-blue-600/20 rounded-lg p-4">
        <p className="text-blue-400 text-sm">
          💡 <strong>Tip:</strong> You can always adjust these settings later in your preferences.
        </p>
      </div>

      {/* Action Button */}
      <button
        onClick={handleSaveAndContinue}
        disabled={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors"
      >
        {isLoading ? 'Saving...' : 'Save & Continue'}
      </button>
    </div>
  );
};

export default NotificationSetupStep;
