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
  private static readonly DISABLED_KEY = 'subhub_onboarding_disabled';

  // Check if onboarding is globally disabled
  static isOnboardingDisabled(): boolean {
    return localStorage.getItem(this.DISABLED_KEY) === 'true';
  }

  // Disable onboarding globally
  static disableOnboarding(): void {
    localStorage.setItem(this.DISABLED_KEY, 'true');
  }

  // Enable onboarding globally
  static enableOnboarding(): void {
    localStorage.removeItem(this.DISABLED_KEY);
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
          localStorage.removeItem(this.STORAGE_KEY);
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
        // If database error, try localStorage fallback
        console.warn('Database error, using localStorage fallback');
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed.userId === userId) {
              return parsed;
            }
          } catch (parseError) {
            console.warn('Failed to parse stored onboarding data');
          }
        }
        return null;
      }

      if (!data) {
        // Try localStorage fallback
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.userId === userId) {
            return parsed;
          }
        }
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
      // Prepare update data, only including fields that exist in the table
      const updateData: any = {
        user_id: progress.userId,
        updated_at: new Date().toISOString()
      };

      // Only add onboarding fields if they might exist in the table
      // This prevents errors if the table hasn't been migrated yet
      try {
        // Try to add onboarding-specific fields
        updateData.onboarding_completed = !!progress.completedAt;
        updateData.onboarding_started_at = progress.startedAt;
        updateData.onboarding_completed_at = progress.completedAt;
        updateData.current_step = progress.currentStep;
        updateData.completed_steps = progress.completedSteps;
        updateData.skipped_steps = progress.skippedSteps;
        updateData.has_seen_premium_features = progress.hasSeenPremiumFeatures;
        updateData.conversion_opportunities_shown = progress.conversionOpportunities;
      } catch (fieldError) {
        console.warn('Some onboarding fields may not exist in database yet:', fieldError);
      }

      const { error } = await supabase
        .from('user_preferences')
        .upsert(updateData, { onConflict: 'user_id' });

      if (error) {
        console.warn('Database save failed, using localStorage fallback:', error);
        // Fallback to localStorage if database fields don't exist
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(progress));
        return;
      }

      // Also save to localStorage for quick access
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(progress));
    } catch (error) {
      console.error('Error saving onboarding progress:', error);
      // Fallback to localStorage
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(progress));
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
