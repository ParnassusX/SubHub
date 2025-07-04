// Onboarding Service for SubHub User Experience
import { supabase } from '../lib/supabase';
import { SettingsService } from './settingsService';
import type {
  OnboardingProgress,
  OnboardingStep,
  ConversionOpportunity
} from '../types/onboarding';
import { ONBOARDING_STEPS, CONVERSION_OPPORTUNITIES } from '../types/onboarding';

export class OnboardingService {
  // Removed localStorage constants - using Supabase as single source of truth

  // Check if onboarding is globally disabled (simplified - use database only)
  static isOnboardingDisabled(): boolean {
    // For now, onboarding is always enabled - can be controlled via user preferences
    return false;
  }

  // Disable onboarding globally (simplified - use database only)
  static disableOnboarding(): void {
    console.log('Onboarding disabled - use user preferences for per-user control');
  }

  // Enable onboarding globally (simplified - use database only)
  static enableOnboarding(): void {
    console.log('Onboarding enabled - use user preferences for per-user control');
  }

  // Debug method for testing - expose to window in development
  static setupDebugMethods() {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      (window as any).SubHubDebug = {
        resetOnboarding: async (userId: string) => {
          console.log('Resetting onboarding for user:', userId);
          await this.resetOnboarding(userId);
          window.location.reload();
        },
        showOnboarding: () => {
          this.enableOnboarding();
          console.log('Onboarding enabled - refresh page to see changes');
          window.location.reload();
        },
        disableOnboarding: () => {
          this.disableOnboarding();
          window.location.reload();
        },
        enableOnboarding: () => {
          this.enableOnboarding();
          window.location.reload();
        }
      };
      console.log('SubHub Debug methods available:', Object.keys((window as any).SubHubDebug));
    }
  }

  /**
   * Initialize onboarding for a new user
   */
  static async initializeOnboarding(userId: string): Promise<OnboardingProgress> {
    try {
      // Check if onboarding already exists
      const existing = await this.getOnboardingProgress(userId);
      if (existing && existing.completedAt) {
        return existing;
      }

      // Create new onboarding progress
      const steps = this.getOnboardingSteps();
      const progress: OnboardingProgress = {
        userId,
        currentStep: steps[0]?.id || 'welcome',
        completedSteps: [],
        startedAt: new Date().toISOString(),
        skippedSteps: [],
        totalSteps: steps.length,
        completedCount: 0,
        progressPercentage: 0,
        hasSeenPremiumFeatures: false,
        conversionOpportunities: []
      };

      // Save to database (with fallback)
      await this.saveOnboardingProgress(progress);

      // Initialize default settings (non-blocking)
      try {
        await SettingsService.initializeDefaultSettings();
      } catch (settingsError) {
        console.warn('Failed to initialize default settings, continuing with onboarding:', settingsError);
      }

      return progress;
    } catch (error) {
      console.error('Error initializing onboarding:', error);
      // Return a basic progress object even if database fails
      const steps = this.getOnboardingSteps();
      return {
        userId,
        currentStep: steps[0]?.id || 'welcome',
        completedSteps: [],
        startedAt: new Date().toISOString(),
        skippedSteps: [],
        totalSteps: steps.length,
        completedCount: 0,
        progressPercentage: 0,
        hasSeenPremiumFeatures: false,
        conversionOpportunities: []
      };
    }
  }

  /**
   * Get current onboarding progress for user
   */
  static async getOnboardingProgress(userId: string): Promise<OnboardingProgress | null> {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.warn('Database error getting onboarding progress:', error);
        return null;
      }

      if (!data) {
        // No onboarding data found in database
        return null;
      }

      // Convert database format to OnboardingProgress
      // Handle missing onboarding fields gracefully
      const completedSteps = data.completed_steps || [];
      const hasSeenPremiumFeatures = data.has_seen_premium_features || false;
      const conversionOpportunities = data.conversion_opportunities_shown || [];

      return {
        userId,
        currentStep: data.current_step || 'welcome',
        completedSteps,
        startedAt: data.onboarding_started_at || new Date().toISOString(),
        completedAt: data.onboarding_completed_at || undefined,
        skippedSteps: data.skipped_steps || [],
        totalSteps: this.getOnboardingSteps().length,
        completedCount: completedSteps.length,
        progressPercentage: this.calculateProgressPercentage(completedSteps),
        hasSeenPremiumFeatures,
        conversionOpportunities
      };
    } catch (error) {
      console.error('Error getting onboarding progress:', error);
      return null;
    }
  }

  /**
   * Save onboarding progress to database
   */
  static async saveOnboardingProgress(progress: OnboardingProgress): Promise<void> {
    try {
      console.log('Saving onboarding progress to database:', progress);

      // Prepare update data with all onboarding fields
      const updateData = {
        user_id: progress.userId,
        onboarding_completed: !!progress.completedAt,
        onboarding_started_at: progress.startedAt,
        onboarding_completed_at: progress.completedAt,
        current_step: progress.currentStep,
        completed_steps: progress.completedSteps,
        skipped_steps: progress.skippedSteps,
        has_seen_premium_features: progress.hasSeenPremiumFeatures,
        conversion_opportunities_shown: progress.conversionOpportunities,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('user_preferences')
        .upsert(updateData, { onConflict: 'user_id' })
        .select();

      if (error) {
        console.error('Database save failed:', error);
        throw error;
      }

      console.log('Onboarding progress saved to database successfully:', data);
    } catch (error) {
      console.error('Error saving onboarding progress:', error);
      throw error;
    }
  }

  /**
   * Complete a specific onboarding step
   */
  static async completeStep(userId: string, stepId: string): Promise<OnboardingProgress> {
    try {
      console.log(`Completing onboarding step: ${stepId} for user: ${userId}`);

      const progress = await this.getOnboardingProgress(userId);
      if (!progress) {
        console.log('No existing progress found, initializing...');
        await this.initializeOnboarding(userId);
        return this.completeStep(userId, stepId); // Retry with initialized progress
      }

      console.log('Current progress before completion:', progress);

      // Add to completed steps if not already there
      if (!progress.completedSteps.includes(stepId)) {
        progress.completedSteps.push(stepId);
        progress.completedCount = progress.completedSteps.length;
        progress.progressPercentage = this.calculateProgressPercentage(progress.completedSteps);
        console.log(`Added step ${stepId} to completed steps:`, progress.completedSteps);
      }

      // Move to next step
      const nextStep = this.getNextStep(stepId);
      if (nextStep) {
        progress.currentStep = nextStep.id;
        console.log(`Moving to next step: ${nextStep.id}`);
      } else {
        // All steps completed - mark onboarding as finished
        progress.completedAt = new Date().toISOString();
        progress.currentStep = 'completed';
        console.log('All onboarding steps completed! Marking as finished.');
      }

      console.log('Final progress before saving:', progress);
      await this.saveOnboardingProgress(progress);
      return progress;
    } catch (error) {
      console.error('Error completing step:', error);
      throw error;
    }
  }

  /**
   * Skip a specific onboarding step
   */
  static async skipStep(userId: string, stepId: string): Promise<OnboardingProgress> {
    try {
      const progress = await this.getOnboardingProgress(userId);
      if (!progress) throw new Error('Onboarding not initialized');

      // Add to skipped steps
      if (!progress.skippedSteps.includes(stepId)) {
        progress.skippedSteps.push(stepId);
      }

      // Move to next step
      const nextStep = this.getNextStep(stepId);
      if (nextStep) {
        progress.currentStep = nextStep.id;
      } else {
        // All steps processed
        progress.completedAt = new Date().toISOString();
      }

      await this.saveOnboardingProgress(progress);
      return progress;
    } catch (error) {
      console.error('Error skipping step:', error);
      throw error;
    }
  }

  /**
   * Get all onboarding steps with completion status
   */
  static getOnboardingSteps(completedSteps: string[] = []): OnboardingStep[] {
    return ONBOARDING_STEPS.map(step => ({
      ...step,
      isCompleted: completedSteps.includes(step.id)
    }));
  }

  /**
   * Get next step in the onboarding flow
   */
  static getNextStep(currentStepId: string): OnboardingStep | null {
    const steps = this.getOnboardingSteps();
    const currentIndex = steps.findIndex(step => step.id === currentStepId);
    
    if (currentIndex === -1 || currentIndex === steps.length - 1) {
      return null;
    }
    
    return steps[currentIndex + 1];
  }

  /**
   * Get previous step in the onboarding flow
   */
  static getPreviousStep(currentStepId: string): OnboardingStep | null {
    const steps = this.getOnboardingSteps();
    const currentIndex = steps.findIndex(step => step.id === currentStepId);
    
    if (currentIndex <= 0) {
      return null;
    }
    
    return steps[currentIndex - 1];
  }

  /**
   * Calculate progress percentage
   */
  private static calculateProgressPercentage(completedSteps: string[]): number {
    const totalSteps = this.getOnboardingSteps().length;
    return Math.round((completedSteps.length / totalSteps) * 100);
  }

  /**
   * Check if user should see conversion opportunities
   */
  static async getConversionOpportunities(userId: string): Promise<ConversionOpportunity[]> {
    try {
      const progress = await this.getOnboardingProgress(userId);
      if (!progress) return [];

      const opportunities: ConversionOpportunity[] = [];
      
      // Check feature access and usage patterns
      for (const opportunity of CONVERSION_OPPORTUNITIES) {
        // For now, show all conversion opportunities that haven't been shown
        if (!progress.conversionOpportunities.includes(opportunity.id)) {
          opportunities.push(opportunity);
        }
      }

      return opportunities;
    } catch (error) {
      console.error('Error getting conversion opportunities:', error);
      return [];
    }
  }

  /**
   * Mark conversion opportunity as shown
   */
  static async markConversionOpportunityShown(userId: string, opportunityId: string): Promise<void> {
    try {
      const progress = await this.getOnboardingProgress(userId);
      if (!progress) return;

      if (!progress.conversionOpportunities.includes(opportunityId)) {
        progress.conversionOpportunities.push(opportunityId);
        await this.saveOnboardingProgress(progress);
      }
    } catch (error) {
      console.error('Error marking conversion opportunity as shown:', error);
    }
  }

  /**
   * Check if onboarding is completed
   */
  static async isOnboardingCompleted(userId: string): Promise<boolean> {
    try {
      console.log('Checking onboarding completion for user:', userId);

      // First check database directly for faster response
      const { data, error } = await supabase
        .from('user_preferences')
        .select('onboarding_completed, onboarding_completed_at')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.warn('Database error checking onboarding completion:', error);
      }

      const isCompleted = !!(data?.onboarding_completed && data?.onboarding_completed_at);
      console.log('Onboarding completion status:', {
        userId,
        isCompleted,
        completedAt: data?.onboarding_completed_at
      });

      return isCompleted;
    } catch (error) {
      console.error('Error checking onboarding completion:', error);
      return false;
    }
  }

  /**
   * Reset onboarding (for testing or user request)
   */
  static async resetOnboarding(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_preferences')
        .update({
          onboarding_completed: false,
          onboarding_completed_at: null,
          current_step: 'welcome',
          completed_steps: [],
          skipped_steps: [],
          has_seen_premium_features: false,
          conversion_opportunities_shown: [],
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error resetting onboarding:', error);
      throw error;
    }
  }
}
