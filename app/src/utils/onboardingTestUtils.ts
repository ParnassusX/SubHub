// Onboarding Test Utilities for SubHub Development
// Simple utilities to test onboarding flows without complex debug panels

import { OnboardingService } from '../services/onboardingService';

/**
 * Reset onboarding for a specific user (development only)
 */
export const resetOnboardingForUser = async (userId: string): Promise<boolean> => {
  if (process.env.NODE_ENV !== 'development') {
    console.warn('Onboarding reset is only available in development mode');
    return false;
  }

  try {
    await OnboardingService.resetOnboarding(userId);
    console.log('✅ Onboarding reset successfully for user:', userId);
    
    // Clear any cached completion status
    localStorage.removeItem(`onboarding_completed_${userId}`);
    
    // Reload the page to trigger fresh onboarding
    window.location.reload();
    
    return true;
  } catch (error) {
    console.error('❌ Failed to reset onboarding:', error);
    return false;
  }
};

/**
 * Check onboarding status for debugging
 */
export const checkOnboardingStatus = async (userId: string): Promise<void> => {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  try {
    const isCompleted = await OnboardingService.isOnboardingCompleted(userId);
    const progress = await OnboardingService.getOnboardingProgress(userId);
    
    console.log('🔍 Onboarding Status Debug:', {
      userId,
      isCompleted,
      progress: progress ? {
        currentStep: progress.currentStep,
        completedSteps: progress.completedSteps,
        completedAt: progress.completedAt,
        progressPercentage: progress.progressPercentage
      } : 'No progress found'
    });
  } catch (error) {
    console.error('❌ Failed to check onboarding status:', error);
  }
};

/**
 * Add global debug functions to window (development only)
 */
export const addOnboardingDebugFunctions = (userId: string): void => {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  // Add debug functions to global window object
  (window as any).resetOnboarding = () => resetOnboardingForUser(userId);
  (window as any).checkOnboardingStatus = () => checkOnboardingStatus(userId);
  
  console.log('🛠️ Onboarding debug functions added to window:');
  console.log('  - resetOnboarding() - Reset onboarding for current user');
  console.log('  - checkOnboardingStatus() - Check current onboarding status');
};

/**
 * Remove debug functions from window
 */
export const removeOnboardingDebugFunctions = (): void => {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  delete (window as any).resetOnboarding;
  delete (window as any).checkOnboardingStatus;
  
  console.log('🧹 Onboarding debug functions removed from window');
};
