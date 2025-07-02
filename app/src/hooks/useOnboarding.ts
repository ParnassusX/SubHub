// Onboarding Hook for SubHub User Experience
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { OnboardingService } from '../services/onboardingService';
import type {
  OnboardingState,
  ConversionOpportunity
} from '../types/onboarding';

export function useOnboarding() {
  const { user } = useAuth();
  const [state, setState] = useState<OnboardingState>({
    isActive: false,
    isLoading: true,
    currentStep: null,
    allSteps: [],
    progress: null,
    error: null
  });

  const [conversionOpportunities, setConversionOpportunities] = useState<ConversionOpportunity[]>([]);

  /**
   * Initialize onboarding when user is available
   */
  useEffect(() => {
    if (!user?.id) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    initializeOnboarding();
  }, [user?.id]);

  /**
   * Initialize onboarding for the current user
   */
  const initializeOnboarding = useCallback(async () => {
    if (!user?.id) return;

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Check if onboarding is already completed
      const isCompleted = await OnboardingService.isOnboardingCompleted(user.id);
      
      if (isCompleted) {
        setState(prev => ({ 
          ...prev, 
          isActive: false, 
          isLoading: false 
        }));
        return;
      }

      // Get or create onboarding progress
      let progress = await OnboardingService.getOnboardingProgress(user.id);
      if (!progress) {
        progress = await OnboardingService.initializeOnboarding(user.id);
      }

      // Get all steps with completion status
      const allSteps = OnboardingService.getOnboardingSteps(progress.completedSteps);
      const currentStep = allSteps.find(step => step.id === progress.currentStep) || allSteps[0];

      // Get conversion opportunities
      const opportunities = await OnboardingService.getConversionOpportunities(user.id);
      setConversionOpportunities(opportunities);

      setState({
        isActive: true,
        isLoading: false,
        currentStep,
        allSteps,
        progress,
        error: null
      });

    } catch (error) {
      console.error('Error initializing onboarding:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to initialize onboarding'
      }));
    }
  }, [user?.id]);

  /**
   * Complete the current step and move to next
   */
  const completeStep = useCallback(async (stepId?: string) => {
    if (!user?.id || !state.currentStep) return;

    try {
      setState(prev => ({ ...prev, isLoading: true }));

      const targetStepId = stepId || state.currentStep.id;
      const updatedProgress = await OnboardingService.completeStep(user.id, targetStepId);

      // Update state with new progress
      const allSteps = OnboardingService.getOnboardingSteps(updatedProgress.completedSteps);
      const currentStep = allSteps.find(step => step.id === updatedProgress.currentStep);

      setState(prev => ({
        ...prev,
        currentStep: currentStep || null,
        allSteps,
        progress: updatedProgress,
        isActive: !updatedProgress.completedAt,
        isLoading: false
      }));

      // If onboarding is completed, refresh conversion opportunities
      if (updatedProgress.completedAt) {
        const opportunities = await OnboardingService.getConversionOpportunities(user.id);
        setConversionOpportunities(opportunities);
      }

    } catch (error) {
      console.error('Error completing step:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to complete step'
      }));
    }
  }, [user?.id, state.currentStep]);

  /**
   * Skip the current step and move to next
   */
  const skipStep = useCallback(async (stepId?: string) => {
    if (!user?.id || !state.currentStep) return;

    try {
      setState(prev => ({ ...prev, isLoading: true }));

      const targetStepId = stepId || state.currentStep.id;
      const updatedProgress = await OnboardingService.skipStep(user.id, targetStepId);

      // Update state with new progress
      const allSteps = OnboardingService.getOnboardingSteps(updatedProgress.completedSteps);
      const currentStep = allSteps.find(step => step.id === updatedProgress.currentStep);

      setState(prev => ({
        ...prev,
        currentStep: currentStep || null,
        allSteps,
        progress: updatedProgress,
        isActive: !updatedProgress.completedAt,
        isLoading: false
      }));

    } catch (error) {
      console.error('Error skipping step:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to skip step'
      }));
    }
  }, [user?.id, state.currentStep]);

  /**
   * Go back to previous step
   */
  const goToPreviousStep = useCallback(async () => {
    if (!user?.id || !state.currentStep) return;

    try {
      const previousStep = OnboardingService.getPreviousStep(state.currentStep.id);
      if (!previousStep) return;

      setState(prev => ({
        ...prev,
        currentStep: previousStep
      }));

      // Update progress in database
      if (state.progress) {
        const updatedProgress = { ...state.progress, currentStep: previousStep.id };
        await OnboardingService.saveOnboardingProgress(updatedProgress);
        setState(prev => ({ ...prev, progress: updatedProgress }));
      }

    } catch (error) {
      console.error('Error going to previous step:', error);
    }
  }, [user?.id, state.currentStep, state.progress]);

  /**
   * Jump to a specific step
   */
  const goToStep = useCallback(async (stepId: string) => {
    if (!user?.id) return;

    try {
      const targetStep = state.allSteps.find(step => step.id === stepId);
      if (!targetStep) return;

      setState(prev => ({
        ...prev,
        currentStep: targetStep
      }));

      // Update progress in database
      if (state.progress) {
        const updatedProgress = { ...state.progress, currentStep: stepId };
        await OnboardingService.saveOnboardingProgress(updatedProgress);
        setState(prev => ({ ...prev, progress: updatedProgress }));
      }

    } catch (error) {
      console.error('Error jumping to step:', error);
    }
  }, [user?.id, state.allSteps, state.progress]);

  /**
   * Exit onboarding (mark as completed)
   */
  const exitOnboarding = useCallback(async () => {
    if (!user?.id || !state.progress) return;

    try {
      setState(prev => ({ ...prev, isLoading: true }));

      const updatedProgress = {
        ...state.progress,
        completedAt: new Date().toISOString()
      };

      await OnboardingService.saveOnboardingProgress(updatedProgress);

      setState(prev => ({
        ...prev,
        isActive: false,
        isLoading: false,
        progress: updatedProgress
      }));

    } catch (error) {
      console.error('Error exiting onboarding:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to exit onboarding'
      }));
    }
  }, [user?.id, state.progress]);

  /**
   * Restart onboarding (for testing or user request)
   */
  const restartOnboarding = useCallback(async () => {
    if (!user?.id) return;

    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      await OnboardingService.resetOnboarding(user.id);
      await initializeOnboarding();

    } catch (error) {
      console.error('Error restarting onboarding:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to restart onboarding'
      }));
    }
  }, [user?.id, initializeOnboarding]);

  /**
   * Mark conversion opportunity as shown
   */
  const markConversionOpportunityShown = useCallback(async (opportunityId: string) => {
    if (!user?.id) return;

    try {
      await OnboardingService.markConversionOpportunityShown(user.id, opportunityId);
      
      // Remove from local state
      setConversionOpportunities(prev => 
        prev.filter(opp => opp.id !== opportunityId)
      );

    } catch (error) {
      console.error('Error marking conversion opportunity as shown:', error);
    }
  }, [user?.id]);

  return {
    // State
    isOnboardingActive: state.isActive,
    isLoading: state.isLoading,
    currentStep: state.currentStep,
    allSteps: state.allSteps,
    progress: state.progress,
    error: state.error,
    conversionOpportunities,

    // Actions
    completeStep,
    skipStep,
    goToPreviousStep,
    goToStep,
    exitOnboarding,
    restartOnboarding,
    markConversionOpportunityShown,

    // Computed values
    isFirstStep: state.currentStep?.order === 1,
    isLastStep: state.currentStep?.order === state.allSteps.length,
    progressPercentage: state.progress?.progressPercentage || 0,
    canGoBack: (state.currentStep?.order || 0) > 1,
    estimatedTimeRemaining: state.allSteps
      .filter(step => !state.progress?.completedSteps.includes(step.id))
      .reduce((total, step) => total + step.estimatedTime, 0)
  };
}
