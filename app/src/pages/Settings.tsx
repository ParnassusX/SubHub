import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ImportExport from '../components/ImportExport';

interface UserSettings {
  currency: string;
  dateFormat: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  reminderFrequency: string;
  darkMode: boolean;
}

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings>({
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    emailNotifications: true,
    pushNotifications: false,
    reminderFrequency: '3 days before',
    darkMode: true,
  });
  const [isSaving, setIsSaving] = useState(false);

  // Load settings from localStorage (with Supabase backup)
  useEffect(() => {
    const savedSettings = localStorage.getItem('subhub_settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
    // TODO: Load from Supabase user preferences table when implemented
  }, []);

  // Save settings to localStorage and Supabase
  const saveSettings = async () => {
    setIsSaving(true);
    try {
      // Save to localStorage for immediate access
      localStorage.setItem('subhub_settings', JSON.stringify(settings));

      // TODO: Save to Supabase user preferences table
      // await db.userPreferences.update(user.id, settings);

      setTimeout(() => {
        setIsSaving(false);
        alert('Settings saved successfully! (Currently stored locally, Supabase sync coming soon)');
      }, 500);
    } catch (error) {
      setIsSaving(false);
      alert('Failed to save settings');
    }
  };

  const updateSetting = (key: keyof UserSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex-1 bg-[#0f1a24] h-full overflow-y-auto">
      <div className="flex flex-wrap justify-between gap-3 p-4 sm:p-6">
        <h1 className="text-white tracking-light text-2xl sm:text-[32px] font-bold leading-tight">Settings</h1>
        <button
          onClick={saveSettings}
          disabled={isSaving}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors"
        >
          {isSaving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {/* Account Settings */}
      <h3 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Account</h3>
      <div className="p-4">
        <div className="bg-[#20364b] rounded-xl border border-[#2e4e6b] p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xl font-bold">
                {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1">
              <h4 className="text-white text-lg font-medium">{user?.name || 'User'}</h4>
              <p className="text-gray-400">{user?.email || 'user@example.com'}</p>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors">
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <h3 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Notifications</h3>
      <div className="p-4">
        <div className="bg-[#20364b] rounded-xl border border-[#2e4e6b] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-medium">Email notifications</h4>
              <p className="text-gray-400 text-sm">Receive email alerts for upcoming payments</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.emailNotifications}
                onChange={(e) => updateSetting('emailNotifications', e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-medium">Push notifications</h4>
              <p className="text-gray-400 text-sm">Get notified on your device</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.pushNotifications}
                onChange={(e) => updateSetting('pushNotifications', e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-medium">Reminder frequency</h4>
              <p className="text-gray-400 text-sm">How often to remind you before payments</p>
            </div>
            <select
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm"
              value={settings.reminderFrequency}
              onChange={(e) => updateSetting('reminderFrequency', e.target.value)}
            >
              <option value="1 day before">1 day before</option>
              <option value="3 days before">3 days before</option>
              <option value="1 week before">1 week before</option>
              <option value="2 weeks before">2 weeks before</option>
              <option value="1 month before">1 month before</option>
            </select>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <h3 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Preferences</h3>
      <div className="p-4">
        <div className="bg-[#20364b] rounded-xl border border-[#2e4e6b] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-medium">Currency</h4>
              <p className="text-gray-400 text-sm">Default currency for new subscriptions</p>
            </div>
            <select className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm">
              <option>USD ($)</option>
              <option>EUR (€)</option>
              <option>GBP (£)</option>
              <option>CAD ($)</option>
            </select>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-medium">Date format</h4>
              <p className="text-gray-400 text-sm">How dates are displayed</p>
            </div>
            <select className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm">
              <option>MM/DD/YYYY</option>
              <option>DD/MM/YYYY</option>
              <option>YYYY-MM-DD</option>
            </select>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-medium">Dark mode</h4>
              <p className="text-gray-400 text-sm">Use dark theme</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Import & Export */}
      <h3 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] px-4 sm:px-6 pb-2 pt-4">Import & Export</h3>
      <div className="p-4 sm:p-6">
        <ImportExport />
      </div>

      {/* Data & Privacy */}
      <h3 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] px-4 sm:px-6 pb-2 pt-4">Data & Privacy</h3>
      <div className="p-4 sm:p-6">
        <div className="bg-[#20364b] rounded-xl border border-[#2e4e6b] p-6 space-y-4">
          <button className="w-full text-left p-4 bg-red-900/20 hover:bg-red-900/30 border border-red-800 rounded-lg transition-colors">
            <h4 className="text-red-400 font-medium">Delete account</h4>
            <p className="text-red-300 text-sm">Permanently delete your account and all data</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
