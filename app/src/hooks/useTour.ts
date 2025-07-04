// Tour Hook for SubHub Guided Tour System
// Follows established useOnboarding pattern for consistency

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { TourService } from '../services/tourService';
import type {
  TourState,
  TourType
} from '../types/tour';
import { TOUR_TYPES } from '../types/tour';

export function useTour(tourType: TourType = TOUR_TYPES.DASHBOARD) {
  const { user } = useAuth();
  const [state, setState] = useState<TourState>({
    isActive: false,
    isLoading: true,
    currentStep: null,
    allSteps: [],
    progress: null,
    error: null,
    tourType: null
  });

  /**
   * Initialize tour when user is available
   */
  useEffect(() => {
    if (!user?.id) {
      setState(prev => ({ ...prev, isLoading: false, isActive: false }));
      return;
    }

    initializeTour();
  }, [user?.id, tourType]);

  /**
   * Initialize tour for the user
   */
  const initializeTour = useCallback(async () => {
    if (!user?.id) {
      console.warn('Cannot initialize tour: user not authenticated');
      return;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Check if tour is already completed
      const isCompleted = await TourService.isTourCompleted(user.id, tourType);
      console.log('Tour completed check result:', isCompleted);

      if (isCompleted) {
        console.log('User has already completed tour, skipping');
        setState(prev => ({
          ...prev,
          isActive: false,
          isLoading: false,
          tourType
        }));
        return;
      }

      // Get or create tour progress
      let progress = await TourService.getTourProgress(user.id, tourType);

      if (!progress) {
        console.log('No existing progress found, initializing new tour');
        progress = await TourService.initializeTour(user.id, tourType);
      }

      console.log('Tour progress loaded:', progress);

      // Get all steps with completion status
      const allSteps = TourService.getTourSteps(tourType, progress.completedSteps);
      const currentStep = allSteps.find(step => step.id === progress.currentStep) || allSteps[0];

      console.log('Current tour step:', currentStep?.id);

      setState({
        isActive: true,
        isLoading: false,
        currentStep,
        allSteps,
        progress,
        error: null,
        tourType
      });

      console.log('Tour initialization completed successfully');

    } catch (error) {
      console.error('Error initializing tour:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        isActive: false,
        error: error instanceof Error ? error.message : 'Failed to initialize tour'
      }));
    }
  }, [user?.id, tourType]);

  /**
   * Complete the current step and move to next
   */
  const completeStep = useCallback(async (stepId?: string) => {
    if (!user?.id || !state.currentStep || !state.tourType) {
      console.warn('Cannot complete step: missing user ID, current step, or tour type');
      return;
    }

    const targetStepId = stepId || state.currentStep.id;
    console.log(`Completing tour step: ${targetStepId} for user: ${user.id}`);

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Complete step
      const updatedProgress = await TourService.completeStep(user.id, state.tourType, targetStepId);
      console.log('Step completion result:', updatedProgress);

      // Update state with new progress
      const allSteps = TourService.getTourSteps(state.tourType, updatedProgress.completedSteps);
      const currentStep = allSteps.find(step => step.id === updatedProgress.currentStep);

      console.log('Moving to next step:', currentStep?.id || 'completed');

      setState(prev => ({
        ...prev,
        currentStep: currentStep || null,
        allSteps,
        progress: updatedProgress,
        isActive: !updatedProgress.completedAt,
        isLoading: false
      }));

    } catch (error) {
      console.error('Error completing step:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to complete step'
      }));
    }
  }, [user?.id, state.currentStep, state.tourType]);

  /**
   * Skip the current step and move to next
   */
  const skipStep = useCallback(async (stepId?: string) => {
    if (!user?.id || !state.currentStep || !state.tourType) return;

    try {
      setState(prev => ({ ...prev, isLoading: true }));

      const targetStepId = stepId || state.currentStep.id;
      const updatedProgress = await TourService.skipStep(user.id, state.tourType, targetStepId);

      // Update state with new progress
      const allSteps = TourService.getTourSteps(state.tourType, updatedProgress.completedSteps);
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
  }, [user?.id, state.currentStep, state.tourType]);

  /**
   * Exit tour (mark as completed)
   */
  const exitTour = useCallback(async () => {
    if (!user?.id || !state.tourType) return;

    try {
      setState(prev => ({ ...prev, isLoading: true }));

      await TourService.exitTour(user.id, state.tourType);

      setState(prev => ({
        ...prev,
        isActive: false,
        isLoading: false
      }));

    } catch (error) {
      console.error('Error exiting tour:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to exit tour'
      }));
    }
  }, [user?.id, state.tourType]);

  /**
   * Start tour manually
   */
  const startTour = useCallback(async (newTourType?: TourType) => {
    if (!user?.id) return;

    const targetTourType = newTourType || tourType;
    
    try {
      setState(prev => ({ ...prev, isLoading: true, tourType: targetTourType }));

      const progress = await TourService.initializeTour(user.id, targetTourType);
      const allSteps = TourService.getTourSteps(targetTourType, progress.completedSteps);
      const currentStep = allSteps.find(step => step.id === progress.currentStep) || allSteps[0];

      setState({
        isActive: true,
        isLoading: false,
        currentStep,
        allSteps,
        progress,
        error: null,
        tourType: targetTourType
      });

    } catch (error) {
      console.error('Error starting tour:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to start tour'
      }));
    }
  }, [user?.id, tourType]);

  return {
    // State
    isTourActive: state.isActive,
    isLoading: state.isLoading,
    currentStep: state.currentStep,
    allSteps: state.allSteps,
    progress: state.progress,
    error: state.error,
    tourType: state.tourType,

    // Actions
    completeStep,
    skipStep,
    exitTour,
    startTour,

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
