// Onboarding Overlay Component - Main onboarding interface
import React, { useEffect } from 'react';
import { X, ArrowLeft, ArrowRight, SkipForward } from 'lucide-react';
import { useOnboarding } from '../../hooks/useOnboarding';
import { useAuth } from '../../contexts/AuthContext';


// Import step components
import WelcomeStep from './steps/WelcomeStep';
import ProfileSetupStep from './steps/ProfileSetupStep';
import FirstSubscriptionStep from './steps/FirstSubscriptionStep';
import NotificationSetupStep from './steps/NotificationSetupStep';
import BudgetSetupStep from './steps/BudgetSetupStep';
import DashboardTourStep from './steps/DashboardTourStep';
import PremiumFeaturesStep from './steps/PremiumFeaturesStep';

interface OnboardingOverlayProps {
  className?: string;
}

const OnboardingOverlay: React.FC<OnboardingOverlayProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const {
    isOnboardingActive,
    isLoading,
    currentStep,
    progress,
    completeStep,
    skipStep,
    goToPreviousStep,
    exitOnboarding,
    isFirstStep,
    isLastStep,
    canGoBack,
    progressPercentage,
    estimatedTimeRemaining,
    error
  } = useOnboarding();

  // Handle escape key to exit onboarding
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOnboardingActive) {
        exitOnboarding();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOnboardingActive, exitOnboarding]);

  // Safety checks - don't render if:
  // 1. User is not authenticated
  // 2. Onboarding is not active
  // 3. Still loading
  // 4. No current step
  // 5. There's an error
  if (!user || !isOnboardingActive || !currentStep || isLoading || error) {
    return null;
  }

  // Additional safety check to prevent duplicate renders
  if (!user.id || !currentStep.id) {
    console.warn('OnboardingOverlay: Missing required IDs, not rendering');
    return null;
  }

  // Render the appropriate step component with error handling
  const renderStepComponent = () => {
    const stepProps = {
      step: currentStep,
      onNext: completeStep,
      onSkip: skipStep,
      onBack: goToPreviousStep,
      isFirst: isFirstStep,
      isLast: isLastStep,
      progress: progress!
    };

    try {
      switch (currentStep.component) {
        case 'WelcomeStep':
          return <WelcomeStep {...stepProps} />;
        case 'ProfileSetupStep':
          return <ProfileSetupStep {...stepProps} />;
        case 'FirstSubscriptionStep':
          return <FirstSubscriptionStep {...stepProps} />;
        case 'NotificationSetupStep':
          return <NotificationSetupStep {...stepProps} />;
        case 'BudgetSetupStep':
          return <BudgetSetupStep {...stepProps} />;
        case 'DashboardTourStep':
          return <DashboardTourStep {...stepProps} />;
        case 'PremiumFeaturesStep':
          return <PremiumFeaturesStep {...stepProps} />;
        default:
          return (
            <div className="text-center py-8">
              <p className="text-gray-400">Unknown step: {currentStep.component}</p>
              <button
                onClick={exitOnboarding}
                className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Skip Onboarding
              </button>
            </div>
          );
      }
    } catch (error) {
      console.error('Error rendering onboarding step:', error);
      return (
        <div className="text-center py-8">
          <p className="text-red-400 mb-4">Something went wrong with this step.</p>
          <button
            onClick={exitOnboarding}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Exit Onboarding
          </button>
        </div>
      );
    }
  };

  return (
    <div
      key={`onboarding-${user.id}-${currentStep.id}`}
      className={`fixed inset-0 z-50 bg-black/80 backdrop-blur-sm ${className}`}
    >
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-[#20364b] rounded-xl border border-[#2e4e6b] shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[#2e4e6b]">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {currentStep.order}
                  </span>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    {currentStep.title}
                  </h2>
                  <p className="text-sm text-gray-400">
                    Step {currentStep.order} of {progress?.totalSteps}
                  </p>
                </div>
              </div>
              
              {estimatedTimeRemaining > 0 && (
                <div className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
                  ~{estimatedTimeRemaining} min remaining
                </div>
              )}
            </div>

            <button
              onClick={exitOnboarding}
              className="text-gray-400 hover:text-white transition-colors p-1"
              title="Exit onboarding"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="px-6 py-3 bg-[#1a2f3f]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">Progress</span>
              <span className="text-xs text-gray-400">{progressPercentage}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Step Content */}
          <div className="p-6 overflow-y-auto flex-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              renderStepComponent()
            )}
          </div>

          {/* Footer - Always visible at bottom */}
          <div className="flex items-center justify-between p-6 border-t border-[#2e4e6b] bg-[#1a2f3f] flex-shrink-0">
            <div className="flex items-center space-x-2">
              {canGoBack && (
                <button
                  onClick={goToPreviousStep}
                  disabled={isLoading}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
              )}
            </div>

            <div className="flex items-center space-x-3">
              {currentStep.isOptional && (
                <button
                  onClick={() => skipStep()}
                  disabled={isLoading}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                >
                  <SkipForward className="w-4 h-4" />
                  <span>Skip</span>
                </button>
              )}

              <button
                onClick={() => {
                  // Check if current step has custom handler
                  const stepHandlers: Record<string, string> = {
                    'profile_setup': '__profileSetupStepHandler',
                    'first_subscription': '__firstSubscriptionStepHandler',
                    'notification_setup': '__notificationSetupStepHandler'
                  };

                  const handlerKey = stepHandlers[currentStep.id];
                  if (handlerKey && (window as any)[handlerKey]) {
                    (window as any)[handlerKey]();
                  } else {
                    completeStep();
                  }
                }}
                disabled={isLoading || (currentStep.id === 'profile_setup' && !(window as any).__profileSetupValid)}
                className="flex items-center space-x-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-base shadow-lg"
              >
                <span>
                  {currentStep.id === 'first_subscription' ? 'Add Subscription' : (isLastStep ? 'Finish' : 'Continue')}
                </span>
                {!isLastStep && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingOverlay;
