import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../hooks/useSettings';

import { Database } from '../types/supabase';
import ImportExport from '../components/ImportExport';
import { getUserLanguage, SupportedLanguage } from '../utils/localization';
import { useTranslation } from '../hooks/useTranslation';
import BudgetSettings from '../components/budget/BudgetSettings';
import NotificationPreferences from '../components/notifications/NotificationPreferences';

type Profile = Database['public']['Tables']['profiles']['Row'];
type UserPreferences = Database['public']['Tables']['user_preferences']['Row'];

interface SettingsState {
  profile: Profile | null;
  preferences: UserPreferences | null;
}

const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'US Dollar ($)' },
  { value: 'EUR', label: 'Euro (€)' },
  { value: 'GBP', label: 'British Pound (£)' },
  { value: 'CAD', label: 'Canadian Dollar (C$)' },
];



const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'it', label: 'Italiano' },
];

const Settings: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'appearance' | 'budget' | 'privacy'>('profile');

  const { settings, isLoading, isSaving, error, successMessage, updateProfileSetting, updatePreferenceSetting, saveSettings } = useSettings();
  const [currentLanguage] = useState<SupportedLanguage>(getUserLanguage());


  if (!user) {
    return (
      <div className="flex-1 bg-[#0f1a24] h-full overflow-y-auto">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-white text-lg">Please log in to access settings</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex-1 bg-[#0f1a24] h-full overflow-y-auto">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-white text-lg">Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!settings?.profile || !settings?.preferences) {
    return (
      <div className="flex-1 bg-[#0f1a24] h-full overflow-y-auto">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-white text-lg">Failed to load settings</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#0f1a24] h-full overflow-y-auto overflow-x-hidden">
      <div className="w-full max-w-full min-w-0">
        {/* Header */}
        <div className="flex flex-wrap justify-between gap-3 p-4 sm:p-6 w-full max-w-full">
          <h1 className="text-white tracking-light text-2xl sm:text-[32px] font-bold leading-tight min-w-0">Settings</h1>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mx-4 sm:mx-6 mb-4 p-4 bg-green-900/20 border border-green-700 rounded-lg">
            <p className="text-green-400">{successMessage}</p>
          </div>
        )}
        
        {error && (
          <div className="mx-4 sm:mx-6 mb-4 p-4 bg-red-900/20 border border-red-700 rounded-lg">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="px-4 sm:px-6 mb-6">
          <div className="border-b border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'profile', label: t('profile'), icon: '👤' },
                { id: 'notifications', label: t('notifications'), icon: '🔔' },
                { id: 'appearance', label: t('appearance'), icon: '🎨' },
                { id: 'budget', label: t('budget'), icon: '💰' },
                { id: 'privacy', label: t('privacy'), icon: '🔒' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="px-4 sm:px-6">
          {activeTab === 'profile' && (
            <div className="bg-[#1a2332] rounded-xl border border-[#2e4e6b] p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Profile Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-600 rounded-md text-gray-300 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Currency</label>
                  <select
                    value={settings.profile.currency || 'USD'}
                    onChange={(e) => updateProfileSetting('currency', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {CURRENCY_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Date Format</label>
                  <select
                    value={settings.profile.date_format || 'MM/DD/YYYY'}
                    onChange={(e) => updateProfileSetting('date_format', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Timezone</label>
                  <select
                    value={settings.profile.timezone || 'UTC'}
                    onChange={(e) => updateProfileSetting('timezone', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="Europe/London">London</option>
                    <option value="Europe/Paris">Paris</option>
                    <option value="Asia/Tokyo">Tokyo</option>
                  </select>
                </div>

                <button
                  onClick={saveSettings}
                  disabled={isSaving}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 px-4 py-2 rounded-lg text-white font-medium transition-colors"
                >
                  {isSaving ? t('loading') : t('save')}
                </button>
              </div>
            </div>
          )}
          
          {activeTab === 'notifications' && (
            <NotificationPreferences />
          )}
          
          {activeTab === 'appearance' && (
            <div className="bg-[#1a2332] rounded-xl border border-[#2e4e6b] p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Appearance Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Theme</label>
                  <select
                    value={settings.preferences.theme || 'dark'}
                    onChange={(e) => updatePreferenceSetting('theme', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                    <option value="system">System</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Language</label>
                  <select
                    value={settings.preferences.language || currentLanguage}
                    onChange={(e) => updatePreferenceSetting('language', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {LANGUAGE_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={saveSettings}
                  disabled={isSaving}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 px-4 py-2 rounded-lg text-white font-medium transition-colors"
                >
                  {isSaving ? t('loading') : t('save')}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'budget' && (
            <BudgetSettings />
          )}

          {activeTab === 'privacy' && (
            <div className="bg-[#1a2332] rounded-xl border border-[#2e4e6b] p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Privacy Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">Auto-categorize</h4>
                    <p className="text-gray-400 text-sm">Automatically assign categories to new subscriptions</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={settings.preferences.auto_categorize || false}
                      onChange={(e) => updatePreferenceSetting('auto_categorize', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Data Export Format</label>
                  <select
                    value={settings.preferences.data_export_format || 'csv'}
                    onChange={(e) => updatePreferenceSetting('data_export_format', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="csv">CSV</option>
                    <option value="json">JSON</option>
                    <option value="pdf">PDF</option>
                  </select>
                </div>

                <button
                  onClick={saveSettings}
                  disabled={isSaving}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 px-4 py-2 rounded-lg text-white font-medium transition-colors"
                >
                  {isSaving ? 'Saving...' : 'Save Privacy'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Import/Export Section */}
        <div className="px-4 sm:px-6 mt-8">
          <h2 className="text-white text-xl font-bold mb-4">Data Management</h2>
          <ImportExport />
        </div>
      </div>
    </div>
  );
};

export default Settings;
