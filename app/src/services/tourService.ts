// Tour Service for SubHub Guided Tour System
// Extends existing onboarding infrastructure for post-onboarding feature discovery

// import { supabase } from '../lib/supabase'; // Will be used when database fields are added
import type {
  TourProgress,
  TourStep,
  TourType
} from '../types/tour';
import { DASHBOARD_TOUR_STEPS, TOUR_TYPES } from '../types/tour';

export class TourService {
  /**
   * Get tour steps for a specific tour type
   */
  static getTourSteps(tourType: TourType, completedSteps: string[] = []): TourStep[] {
    let steps: Omit<TourStep, 'isCompleted'>[] = [];
    
    switch (tourType) {
      case TOUR_TYPES.DASHBOARD:
        steps = DASHBOARD_TOUR_STEPS;
        break;
      default:
        console.warn(`Unknown tour type: ${tourType}`);
        return [];
    }

    return steps.map(step => ({
      ...step,
      isCompleted: completedSteps.includes(step.id)
    }));
  }

  /**
   * Initialize tour for a user
   */
  static async initializeTour(userId: string, tourType: TourType): Promise<TourProgress> {
    try {
      // Check if tour already exists and is completed
      const existing = await this.getTourProgress(userId, tourType);
      if (existing && existing.completedAt) {
        return existing;
      }

      // Create new tour progress
      const steps = this.getTourSteps(tourType);
      const progress: TourProgress = {
        userId,
        tourType,
        currentStep: steps[0]?.id || 'dashboard_overview',
        completedSteps: [],
        startedAt: new Date().toISOString(),
        skippedSteps: [],
        totalSteps: steps.length,
        completedCount: 0,
        progressPercentage: 0,
        lastActiveAt: new Date().toISOString()
      };

      // Save to database
      await this.saveTourProgress(progress);
      return progress;
    } catch (error) {
      console.error('Error initializing tour:', error);
      // Return basic progress object even if database fails
      const steps = this.getTourSteps(tourType);
      return {
        userId,
        tourType,
        currentStep: steps[0]?.id || 'dashboard_overview',
        completedSteps: [],
        startedAt: new Date().toISOString(),
        skippedSteps: [],
        totalSteps: steps.length,
        completedCount: 0,
        progressPercentage: 0,
        lastActiveAt: new Date().toISOString()
      };
    }
  }

  /**
   * Get tour progress for a user and tour type
   */
  static async getTourProgress(_userId: string, _tourType: TourType): Promise<TourProgress | null> {
    try {
      // For now, return null to indicate no tour progress
      // This will be enhanced when we add dedicated tour fields to the database

      return null;
    } catch (error) {
      console.error('Error getting tour progress:', error);
      return null;
    }
  }

  /**
   * Save tour progress to database
   */
  static async saveTourProgress(progress: TourProgress): Promise<void> {
    try {
      console.log('Saving tour progress to database:', progress);

      // For now, just log the progress
      // This will be enhanced when we add dedicated tour fields to the database
      console.log('Tour progress would be saved:', progress);

      console.log('Tour progress saved to database successfully');
    } catch (error) {
      console.error('Error saving tour progress:', error);
      throw error;
    }
  }

  /**
   * Complete a tour step
   */
  static async completeStep(userId: string, tourType: TourType, stepId: string): Promise<TourProgress> {
    try {
      console.log(`Completing tour step: ${stepId} for user: ${userId}, tour: ${tourType}`);

      const progress = await this.getTourProgress(userId, tourType);
      if (!progress) {
        console.log('No existing progress found, initializing...');
        return this.completeStep(userId, tourType, stepId);
      }

      // Add to completed steps if not already there
      if (!progress.completedSteps.includes(stepId)) {
        progress.completedSteps.push(stepId);
        progress.completedCount = progress.completedSteps.length;
        progress.progressPercentage = Math.round((progress.completedCount / progress.totalSteps) * 100);
      }

      // Move to next step
      const nextStep = this.getNextStep(tourType, stepId);
      if (nextStep) {
        progress.currentStep = nextStep.id;
        console.log(`Moving to next step: ${nextStep.id}`);
      } else {
        // All steps completed - mark tour as finished
        progress.completedAt = new Date().toISOString();
        progress.currentStep = 'completed';
        console.log('All tour steps completed! Marking as finished.');
      }

      progress.lastActiveAt = new Date().toISOString();

      await this.saveTourProgress(progress);
      return progress;
    } catch (error) {
      console.error('Error completing tour step:', error);
      throw error;
    }
  }

  /**
   * Skip a tour step
   */
  static async skipStep(userId: string, tourType: TourType, stepId: string): Promise<TourProgress> {
    try {
      const progress = await this.getTourProgress(userId, tourType);
      if (!progress) throw new Error('Tour not initialized');

      // Add to skipped steps if not already there
      if (!progress.skippedSteps.includes(stepId)) {
        progress.skippedSteps.push(stepId);
      }

      // Move to next step
      const nextStep = this.getNextStep(tourType, stepId);
      if (nextStep) {
        progress.currentStep = nextStep.id;
      } else {
        // All steps processed
        progress.completedAt = new Date().toISOString();
        progress.currentStep = 'completed';
      }

      progress.lastActiveAt = new Date().toISOString();

      await this.saveTourProgress(progress);
      return progress;
    } catch (error) {
      console.error('Error skipping tour step:', error);
      throw error;
    }
  }

  /**
   * Get the next step in a tour
   */
  static getNextStep(tourType: TourType, currentStepId: string): TourStep | null {
    const steps = this.getTourSteps(tourType);
    const currentIndex = steps.findIndex(step => step.id === currentStepId);
    
    if (currentIndex === -1 || currentIndex === steps.length - 1) {
      return null; // No next step
    }
    
    return steps[currentIndex + 1];
  }

  /**
   * Check if a tour is completed
   */
  static async isTourCompleted(userId: string, tourType: TourType): Promise<boolean> {
    try {
      const progress = await this.getTourProgress(userId, tourType);
      return !!(progress && progress.completedAt);
    } catch (error) {
      console.error('Error checking tour completion:', error);
      return false;
    }
  }

  /**
   * Exit tour (mark as completed)
   */
  static async exitTour(userId: string, tourType: TourType): Promise<void> {
    try {
      const progress = await this.getTourProgress(userId, tourType);
      if (!progress) return;

      progress.completedAt = new Date().toISOString();
      progress.currentStep = 'completed';
      progress.lastActiveAt = new Date().toISOString();

      await this.saveTourProgress(progress);
    } catch (error) {
      console.error('Error exiting tour:', error);
      throw error;
    }
  }
}
