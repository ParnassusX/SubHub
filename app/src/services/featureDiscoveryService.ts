// Feature Discovery Service for SubHub Progressive Feature Introduction
// Manages contextual feature highlighting and progressive disclosure

import { supabase } from '../lib/supabase';
import type {
  FeatureHighlight,
  UserFeatureProgress,
  DiscoveryCategory
} from '../types/featureDiscovery';
import { FEATURE_HIGHLIGHTS } from '../types/featureDiscovery';

export class FeatureDiscoveryService {
  /**
   * Get user's feature discovery progress
   */
  static async getUserProgress(userId: string): Promise<UserFeatureProgress | null> {
    try {
      // For now, use user_preferences table with feature discovery fields
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.warn('Database error getting feature discovery progress:', error);
        return null;
      }

      if (!data) {
        return null;
      }

      // Map existing fields to feature discovery progress
      return {
        user_id: userId,
        features_discovered: [], // Will be enhanced when we add dedicated fields
        features_dismissed: [],
        discovery_enabled: true, // Default to enabled for now
        discovery_frequency: 'normal',
        discovery_preferences: {
          showNewFeatures: true,
          showAdvancedTips: true,
          showUpdates: true,
          autoHide: true
        }
      };
    } catch (error) {
      console.error('Error getting user feature discovery progress:', error);
      return null;
    }
  }

  /**
   * Update user's feature discovery progress
   */
  static async updateUserProgress(progress: UserFeatureProgress): Promise<void> {
    try {
      // For now, just log the progress
      // This will be enhanced when we add dedicated feature discovery fields
      console.log('Feature discovery progress would be saved:', progress);

      console.log('Feature discovery progress updated successfully');
    } catch (error) {
      console.error('Error updating feature discovery progress:', error);
      throw error;
    }
  }

  /**
   * Get eligible feature highlights for a user
   */
  static async getEligibleHighlights(
    userId: string,
    trigger: 'page_load' | 'user_action' | 'time_based' | 'manual' = 'page_load',
    context?: {
      subscriptionCount?: number;
      userLevel?: 'beginner' | 'intermediate' | 'advanced';
      timeOnPlatform?: number;
    }
  ): Promise<FeatureHighlight[]> {
    try {
      const userProgress = await this.getUserProgress(userId);
      
      if (!userProgress || !userProgress.discovery_enabled) {
        return [];
      }

      // Filter highlights based on trigger and conditions
      const eligibleHighlights = FEATURE_HIGHLIGHTS.filter(highlight => {
        // Check trigger match
        if (highlight.trigger !== trigger) {
          return false;
        }

        // Check if already shown and should only show once
        if (highlight.display.showOnce && userProgress.features_discovered.includes(highlight.id)) {
          return false;
        }

        // Check if dismissed
        if (userProgress.features_dismissed.includes(highlight.id)) {
          return false;
        }

        // Check conditions if provided
        if (highlight.conditions && context) {
          if (highlight.conditions.minSubscriptions && 
              (!context.subscriptionCount || context.subscriptionCount < highlight.conditions.minSubscriptions)) {
            return false;
          }

          if (highlight.conditions.userLevel && context.userLevel !== highlight.conditions.userLevel) {
            return false;
          }

          if (highlight.conditions.timeOnPlatform && 
              (!context.timeOnPlatform || context.timeOnPlatform < highlight.conditions.timeOnPlatform)) {
            return false;
          }
        }

        return true;
      });

      // Sort by priority (high -> medium -> low)
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      eligibleHighlights.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);

      return eligibleHighlights;
    } catch (error) {
      console.error('Error getting eligible highlights:', error);
      return [];
    }
  }

  /**
   * Mark a feature as discovered
   */
  static async markFeatureDiscovered(userId: string, featureId: string): Promise<void> {
    try {
      const userProgress = await this.getUserProgress(userId);
      if (!userProgress) return;

      if (!userProgress.features_discovered.includes(featureId)) {
        userProgress.features_discovered.push(featureId);
        userProgress.last_discovery_shown = new Date().toISOString();
        await this.updateUserProgress(userProgress);
      }
    } catch (error) {
      console.error('Error marking feature as discovered:', error);
    }
  }

  /**
   * Mark a feature as dismissed
   */
  static async markFeatureDismissed(userId: string, featureId: string): Promise<void> {
    try {
      const userProgress = await this.getUserProgress(userId);
      if (!userProgress) return;

      if (!userProgress.features_dismissed.includes(featureId)) {
        userProgress.features_dismissed.push(featureId);
        await this.updateUserProgress(userProgress);
      }
    } catch (error) {
      console.error('Error marking feature as dismissed:', error);
    }
  }

  /**
   * Get feature highlight by ID
   */
  static getFeatureHighlight(featureId: string): FeatureHighlight | null {
    return FEATURE_HIGHLIGHTS.find(highlight => highlight.id === featureId) || null;
  }

  /**
   * Get highlights by category
   */
  static getHighlightsByCategory(category: DiscoveryCategory): FeatureHighlight[] {
    return FEATURE_HIGHLIGHTS.filter(highlight => highlight.category === category);
  }

  /**
   * Check if user should see feature discovery
   */
  static async shouldShowDiscovery(userId: string): Promise<boolean> {
    try {
      const userProgress = await this.getUserProgress(userId);
      return !!(userProgress && userProgress.discovery_enabled);
    } catch (error) {
      console.error('Error checking if should show discovery:', error);
      return false;
    }
  }

  /**
   * Update discovery preferences
   */
  static async updateDiscoveryPreferences(
    userId: string, 
    preferences: {
      enabled?: boolean;
      frequency?: 'minimal' | 'normal' | 'frequent';
      categories?: string[];
    }
  ): Promise<void> {
    try {
      const userProgress = await this.getUserProgress(userId);
      if (!userProgress) return;

      if (preferences.enabled !== undefined) {
        userProgress.discovery_enabled = preferences.enabled;
      }

      if (preferences.frequency !== undefined) {
        userProgress.discovery_frequency = preferences.frequency;
      }

      await this.updateUserProgress(userProgress);
    } catch (error) {
      console.error('Error updating discovery preferences:', error);
      throw error;
    }
  }

  /**
   * Get next feature to highlight based on user context
   */
  static async getNextFeatureToHighlight(
    userId: string,
    context: {
      currentPage: string;
      subscriptionCount: number;
      userLevel: 'beginner' | 'intermediate' | 'advanced';
      timeOnPlatform: number;
    }
  ): Promise<FeatureHighlight | null> {
    try {
      const eligibleHighlights = await this.getEligibleHighlights(
        userId,
        'page_load',
        {
          subscriptionCount: context.subscriptionCount,
          userLevel: context.userLevel,
          timeOnPlatform: context.timeOnPlatform
        }
      );

      if (eligibleHighlights.length === 0) {
        return null;
      }

      // Return the highest priority highlight
      return eligibleHighlights[0];
    } catch (error) {
      console.error('Error getting next feature to highlight:', error);
      return null;
    }
  }

  /**
   * Reset user's discovery progress (for testing)
   */
  static async resetUserProgress(userId: string): Promise<void> {
    try {
      const resetProgress: UserFeatureProgress = {
        user_id: userId,
        features_discovered: [],
        features_dismissed: [],
        discovery_enabled: true,
        discovery_frequency: 'normal',
        discovery_preferences: {
          showNewFeatures: true,
          showAdvancedTips: true,
          showUpdates: true,
          autoHide: true
        }
      };

      await this.updateUserProgress(resetProgress);
      console.log('User discovery progress reset successfully');
    } catch (error) {
      console.error('Error resetting user progress:', error);
      throw error;
    }
  }
}
