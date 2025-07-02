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
  private static readonly STORAGE_KEY = 'subhub_onboarding_progress';

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

      // Save to database
      await this.saveOnboardingProgress(progress);
      
      // Initialize default settings
      await SettingsService.initializeDefaultSettings();

      return progress;
    } catch (error) {
      console.error('Error initializing onboarding:', error);
      throw error;
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

      if (error && error.code !== 'PGRST116') throw error;
      if (!data) return null;

      // Convert database format to OnboardingProgress
      return {
        userId,
        currentStep: data.current_step || 'welcome',
        completedSteps: data.completed_steps || [],
        startedAt: data.onboarding_started_at || new Date().toISOString(),
        completedAt: data.onboarding_completed_at || undefined,
        skippedSteps: data.skipped_steps || [],
        totalSteps: this.getOnboardingSteps().length,
        completedCount: (data.completed_steps || []).length,
        progressPercentage: this.calculateProgressPercentage(data.completed_steps || []),
        hasSeenPremiumFeatures: data.has_seen_premium_features || false,
        conversionOpportunities: data.conversion_opportunities_shown || []
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

      const { error } = await supabase
        .from('user_preferences')
        .upsert(updateData, { onConflict: 'user_id' });

      if (error) throw error;

      // Also save to localStorage for quick access
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(progress));
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
      const progress = await this.getOnboardingProgress(userId);
      if (!progress) throw new Error('Onboarding not initialized');

      // Add to completed steps if not already there
      if (!progress.completedSteps.includes(stepId)) {
        progress.completedSteps.push(stepId);
        progress.completedCount = progress.completedSteps.length;
        progress.progressPercentage = this.calculateProgressPercentage(progress.completedSteps);
      }

      // Move to next step
      const nextStep = this.getNextStep(stepId);
      if (nextStep) {
        progress.currentStep = nextStep.id;
      } else {
        // All steps completed
        progress.completedAt = new Date().toISOString();
      }

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
      const progress = await this.getOnboardingProgress(userId);
      return !!progress?.completedAt;
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

      // Clear localStorage
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Error resetting onboarding:', error);
      throw error;
    }
  }
}
