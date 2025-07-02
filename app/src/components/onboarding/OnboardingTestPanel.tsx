// Development-only test panel for onboarding system
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useOnboarding } from '../../hooks/useOnboarding';
import { OnboardingService } from '../../services/onboardingService';

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
      await restartOnboarding();
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
      </div>

      <div className="mt-3 text-xs text-gray-400">
        Press ESC to exit onboarding overlay
      </div>
    </div>
  );
};

export default OnboardingTestPanel;
