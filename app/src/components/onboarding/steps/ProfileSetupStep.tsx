// Profile Setup Step - Configure user preferences
import React, { useState, useEffect } from 'react';
import { Globe, DollarSign, Clock, User } from 'lucide-react';

import { useCurrency } from '../../../hooks/useCurrency';
import { SettingsService } from '../../../services/settingsService';
import { useAuth } from '../../../contexts/AuthContext';
import type { OnboardingStepProps } from '../../../types/onboarding';

const ProfileSetupStep: React.FC<OnboardingStepProps> = ({
  onNext
}) => {
  const { currency } = useCurrency();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    currency: currency || 'USD',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    language: 'en'
  });

  const [isLoading, setIsLoading] = useState(false); // Used in handleSaveAndContinue
  const [error, setError] = useState('');

  // Pre-populate form with existing user data
  useEffect(() => {
    const loadExistingData = async () => {
      if (!user?.id) return;

      try {
        console.log('🔄 Loading existing user data for profile setup');

        // Get existing preferences to pre-populate language
        const preferences = await SettingsService.getPreferences();

        if (preferences?.language) {
          console.log('📝 Pre-populating language from preferences:', preferences.language);
          setFormData(prev => ({
            ...prev,
            language: preferences.language
          }));
        }

        // Update name if user data is available
        if (user.name) {
          console.log('📝 Pre-populating name from user data:', user.name);
          setFormData(prev => ({
            ...prev,
            name: user.name || ''
          }));
        }

        console.log('✅ Existing user data loaded successfully');
      } catch (error) {
        console.warn('⚠️ Could not load existing user data:', error);
        // Continue with defaults - this is not a critical error
      }
    };

    loadExistingData();
  }, [user?.id, user?.name]); // Re-run if user data changes

  // Currency options
  const currencyOptions = [
    { value: 'USD', label: 'US Dollar ($)', symbol: '$' },
    { value: 'EUR', label: 'Euro (€)', symbol: '€' },
    { value: 'GBP', label: 'British Pound (£)', symbol: '£' },
    { value: 'CAD', label: 'Canadian Dollar (C$)', symbol: 'C$' },
    { value: 'AUD', label: 'Australian Dollar (A$)', symbol: 'A$' },
    { value: 'JPY', label: 'Japanese Yen (¥)', symbol: '¥' }
  ];

  // Language options
  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'it', label: 'Italiano' }
  ];

  // Common timezones
  const timezoneOptions = [
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
    { value: 'America/New_York', label: 'Eastern Time (US)' },
    { value: 'America/Chicago', label: 'Central Time (US)' },
    { value: 'America/Denver', label: 'Mountain Time (US)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (US)' },
    { value: 'Europe/London', label: 'London (GMT)' },
    { value: 'Europe/Paris', label: 'Paris (CET)' },
    { value: 'Europe/Rome', label: 'Rome (CET)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
    { value: 'Australia/Sydney', label: 'Sydney (AEST)' }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSaveAndContinue = async () => {
    console.log('🔄 Starting profile save and continue process');

    if (!user?.id) {
      console.error('❌ No user ID available for profile save');
      setError('User not authenticated. Please refresh and try again.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('📝 Saving profile data:', formData);
      console.log('👤 User authenticated:', user.id);

      // Validate required fields
      if (!formData.name.trim()) {
        throw new Error('Name is required');
      }

      // Update profile settings with timeout
      console.log('💾 Updating profile...');
      const profilePromise = SettingsService.updateProfile({
        name: formData.name.trim(),
        currency: formData.currency,
        timezone: formData.timezone
      });

      const profileTimeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Profile update timeout')), 8000)
      );

      const profileResult = await Promise.race([profilePromise, profileTimeoutPromise]);
      console.log('✅ Profile updated successfully:', profileResult);

      // Update user preferences with timeout
      console.log('⚙️ Updating preferences...');
      const preferencesPromise = SettingsService.updatePreferences({
        language: formData.language
      });

      const preferencesTimeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Preferences update timeout')), 8000)
      );

      const preferencesResult = await Promise.race([preferencesPromise, preferencesTimeoutPromise]);
      console.log('✅ Preferences updated successfully:', preferencesResult);

      console.log('🎉 Profile setup completed, proceeding to next step');

      // Continue to next step
      onNext();

    } catch (err) {
      console.error('❌ Error saving profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to save profile settings. Please try again.');
    } finally {
      setIsLoading(false);
      console.log('🔄 Profile save process completed');
    }
  };

  // Expose the handler and validation state to the overlay
  React.useEffect(() => {
    (window as any).__profileSetupStepHandler = handleSaveAndContinue;
    (window as any).__profileSetupValid = formData.name.trim().length > 0;

    return () => {
      delete (window as any).__profileSetupStepHandler;
      delete (window as any).__profileSetupValid;
    };
  }, [handleSaveAndContinue, formData.name]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto">
          <User className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-xl font-semibold text-white">
          Set Up Your Profile
        </h2>
        <p className="text-gray-400">
          Let's personalize your SubHub experience
        </p>
      </div>

      {/* Form */}
      <div className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <User className="w-4 h-4 inline mr-2" />
            Display Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter your name"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Currency */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <DollarSign className="w-4 h-4 inline mr-2" />
            Preferred Currency
          </label>
          <select
            value={formData.currency}
            onChange={(e) => handleInputChange('currency', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {currencyOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-400 mt-1">
            This will be used to display subscription costs
          </p>
        </div>

        {/* Language */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <Globe className="w-4 h-4 inline mr-2" />
            Language
          </label>
          <select
            value={formData.language}
            onChange={(e) => handleInputChange('language', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {languageOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Timezone */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <Clock className="w-4 h-4 inline mr-2" />
            Timezone
          </label>
          <select
            value={formData.timezone}
            onChange={(e) => handleInputChange('timezone', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {timezoneOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-400 mt-1">
            Used for renewal reminders and notifications
          </p>
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
          💡 <strong>Tip:</strong> You can change these settings anytime in your profile settings.
        </p>
      </div>

      {/* Status Message */}
      {!formData.name.trim() && (
        <div className="bg-yellow-600/10 border border-yellow-600/20 rounded-lg p-3">
          <p className="text-yellow-400 text-sm">
            ⚠️ Please enter your name to continue
          </p>
        </div>
      )}

      {formData.name.trim() && (
        <div className="bg-green-600/10 border border-green-600/20 rounded-lg p-3">
          <p className="text-green-400 text-sm">
            ✅ Profile ready - Click Continue to save and proceed
            {isLoading && ' (Saving...)'}
          </p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-900/50 border border-red-500 rounded-lg text-red-200 text-sm">
          {error}
        </div>
      )}

      {/* Debug Info (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-3 bg-gray-800 border border-gray-600 rounded-lg text-xs text-gray-400">
          <div className="font-semibold mb-2">Debug Info:</div>
          <div>User ID: {user?.id || 'Not available'}</div>
          <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
          <div>Form Valid: {formData.name.trim().length > 0 ? 'Yes' : 'No'}</div>
          <div>Handler Exposed: {typeof (window as any).__profileSetupStepHandler === 'function' ? 'Yes' : 'No'}</div>
          <div>Valid Flag: {(window as any).__profileSetupValid ? 'Yes' : 'No'}</div>
        </div>
      )}
    </div>
  );
};

export default ProfileSetupStep;
