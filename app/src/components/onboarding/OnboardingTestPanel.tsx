// Development-only test panel for onboarding system
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useOnboarding } from '../../hooks/useOnboarding';
import { OnboardingService } from '../../services/onboardingService';
import { SettingsService } from '../../services/settingsService';

const OnboardingTestPanel: React.FC = () => {
  const { user } = useAuth();
  const { 
    isOnboardingActive, 
    isLoading, 
    currentStep, 
    progress, 
    error,
    restartOnboarding,
    exitOnboarding
  } = useOnboarding();

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const handleResetOnboarding = async () => {
    if (user?.id) {
      console.log('Resetting onboarding for user:', user.id);
      try {
        await OnboardingService.resetOnboarding(user.id);
        await restartOnboarding();
        console.log('Onboarding reset successfully');
      } catch (error) {
        console.error('Error resetting onboarding:', error);
      }
    }
  };

  const handleDisableOnboarding = () => {
    OnboardingService.disableOnboarding();
    window.location.reload();
  };

  const handleEnableOnboarding = () => {
    OnboardingService.enableOnboarding();
    window.location.reload();
  };

  const handleTestFlow = async () => {
    console.log('🧪 Testing Onboarding Flow:');
    console.log('1. User authenticated:', !!user?.id);
    console.log('2. Onboarding active:', isOnboardingActive);
    console.log('3. Current step:', currentStep?.id);
    console.log('4. Progress:', progress?.progressPercentage + '%');
    console.log('5. Loading state:', isLoading);
    console.log('6. Error state:', error);
    console.log('7. Onboarding disabled:', OnboardingService.isOnboardingDisabled());

    // Test button handlers
    const handlers = [
      '__profileSetupStepHandler',
      '__firstSubscriptionStepHandler',
      '__notificationSetupStepHandler'
    ];

    handlers.forEach(handler => {
      console.log(`8. Handler ${handler}:`, typeof (window as any)[handler]);
    });

    // Test data persistence
    if (user?.id) {
      try {
        console.log('🔍 Testing Data Persistence:');

        // Check profile data
        const profile = await SettingsService.getProfile();
        console.log('Profile data:', profile);

        // Check preferences
        const preferences = await SettingsService.getPreferences();
        console.log('Preferences data:', preferences);

        // Check onboarding progress
        const onboardingProgress = await OnboardingService.getOnboardingProgress(user.id);
        console.log('Onboarding progress:', onboardingProgress);

      } catch (error) {
        console.error('Error testing data persistence:', error);
      }
    }
  };

  const isDisabled = OnboardingService.isOnboardingDisabled();

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 border border-gray-600 rounded-lg p-4 text-white text-sm max-w-sm z-50">
      <h3 className="font-bold mb-2">🧪 Onboarding Test Panel</h3>
      
      <div className="space-y-2 mb-3">
        <div>Status: {isOnboardingActive ? '✅ Active' : '❌ Inactive'}</div>
        <div>Loading: {isLoading ? '⏳ Yes' : '✅ No'}</div>
        <div>User: {user?.id ? '✅ Authenticated' : '❌ Not authenticated'}</div>
        <div>Current Step: {currentStep?.id || 'None'}</div>
        <div>Progress: {progress?.progressPercentage || 0}%</div>
        <div>Disabled: {isDisabled ? '🚫 Yes' : '✅ No'}</div>
        {error && <div className="text-red-400">Error: {error}</div>}
      </div>

      <div className="space-y-2">
        <button
          onClick={handleResetOnboarding}
          disabled={!user?.id}
          className="w-full px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded text-xs"
        >
          Reset Onboarding
        </button>
        
        <button
          onClick={handleDisableOnboarding}
          className="w-full px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs"
        >
          Disable Onboarding
        </button>
        
        <button
          onClick={handleEnableOnboarding}
          className="w-full px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-xs"
        >
          Enable Onboarding
        </button>

        {isOnboardingActive && (
          <button
            onClick={exitOnboarding}
            className="w-full px-3 py-1 bg-yellow-600 hover:bg-yellow-700 rounded text-xs"
          >
            Exit Current Onboarding
          </button>
        )}

        <button
          onClick={handleTestFlow}
          className="w-full px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-xs"
        >
          🧪 Test Flow (Check Console)
        </button>
      </div>

      <div className="mt-3 text-xs text-gray-400">
        Press ESC to exit onboarding overlay
      </div>
    </div>
  );
};

export default OnboardingTestPanel;
