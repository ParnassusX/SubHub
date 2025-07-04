// Feature Discovery Hook for SubHub Progressive Feature Introduction
// Manages contextual feature highlighting and progressive disclosure

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FeatureDiscoveryService } from '../services/featureDiscoveryService';
import type {
  FeatureDiscoveryState
} from '../types/featureDiscovery';

interface UseFeatureDiscoveryOptions {
  enabled?: boolean;
  currentPage?: string;
  subscriptionCount?: number;
  userLevel?: 'beginner' | 'intermediate' | 'advanced';
  autoShow?: boolean;
}

export function useFeatureDiscovery(options: UseFeatureDiscoveryOptions = {}) {
  const { user } = useAuth();
  const {
    enabled = true,
    currentPage = 'dashboard',
    subscriptionCount = 0,
    userLevel = 'beginner',
    autoShow = true
  } = options;

  const [state, setState] = useState<FeatureDiscoveryState>({
    isActive: false,
    currentHighlight: null,
    queuedHighlights: [],
    shownHighlights: [],
    dismissedHighlights: [],
    userPreferences: {
      enableDiscovery: true,
      frequency: 'normal',
      categories: ['new', 'advanced', 'tip', 'update']
    }
  });

  /**
   * Initialize feature discovery when user is available
   */
  useEffect(() => {
    if (!user?.id || !enabled) {
      setState(prev => ({ ...prev, isActive: false }));
      return;
    }

    initializeDiscovery();
  }, [user?.id, enabled, currentPage, subscriptionCount, userLevel]);

  /**
   * Initialize feature discovery for the user
   */
  const initializeDiscovery = useCallback(async () => {
    if (!user?.id || !enabled) return;

    try {
      // Check if discovery is enabled for user
      const shouldShow = await FeatureDiscoveryService.shouldShowDiscovery(user.id);
      if (!shouldShow) {
        setState(prev => ({ ...prev, isActive: false }));
        return;
      }

      // Get user progress
      const userProgress = await FeatureDiscoveryService.getUserProgress(user.id);
      if (!userProgress) return;

      // Calculate time on platform (mock for now)
      const timeOnPlatform = 7; // Days since registration

      // Get next feature to highlight if autoShow is enabled
      if (autoShow) {
        const nextFeature = await FeatureDiscoveryService.getNextFeatureToHighlight(
          user.id,
          {
            currentPage,
            subscriptionCount,
            userLevel,
            timeOnPlatform
          }
        );

        if (nextFeature) {
          setState(prev => ({
            ...prev,
            isActive: true,
            currentHighlight: nextFeature,
            shownHighlights: [...prev.shownHighlights, nextFeature.id],
            userPreferences: {
              enableDiscovery: userProgress.discovery_enabled,
              frequency: userProgress.discovery_frequency,
              categories: ['new', 'advanced', 'tip', 'update']
            }
          }));

          // Mark as discovered
          await FeatureDiscoveryService.markFeatureDiscovered(user.id, nextFeature.id);
        }
      }

    } catch (error) {
      console.error('Error initializing feature discovery:', error);
    }
  }, [user?.id, enabled, currentPage, subscriptionCount, userLevel, autoShow]);

  /**
   * Show a specific feature highlight
   */
  const showFeature = useCallback(async (featureId: string) => {
    if (!user?.id) return;

    try {
      const feature = FeatureDiscoveryService.getFeatureHighlight(featureId);
      if (!feature) return;

      setState(prev => ({
        ...prev,
        isActive: true,
        currentHighlight: feature,
        shownHighlights: [...prev.shownHighlights, featureId]
      }));

      // Mark as discovered
      await FeatureDiscoveryService.markFeatureDiscovered(user.id, featureId);

    } catch (error) {
      console.error('Error showing feature:', error);
    }
  }, [user?.id]);

  /**
   * Dismiss the current feature highlight
   */
  const dismissFeature = useCallback(async (featureId?: string) => {
    if (!user?.id) return;

    const targetId = featureId || state.currentHighlight?.id;
    if (!targetId) return;

    try {
      // Mark as dismissed
      await FeatureDiscoveryService.markFeatureDismissed(user.id, targetId);

      setState(prev => ({
        ...prev,
        isActive: false,
        currentHighlight: null,
        dismissedHighlights: [...prev.dismissedHighlights, targetId]
      }));

    } catch (error) {
      console.error('Error dismissing feature:', error);
    }
  }, [user?.id, state.currentHighlight]);

  /**
   * Take action on a feature (e.g., click call-to-action)
   */
  const takeAction = useCallback(async (featureId?: string) => {
    if (!user?.id) return;

    const targetId = featureId || state.currentHighlight?.id;
    if (!targetId) return;

    try {
      // Mark as discovered (action taken)
      await FeatureDiscoveryService.markFeatureDiscovered(user.id, targetId);

      setState(prev => ({
        ...prev,
        isActive: false,
        currentHighlight: null
      }));

    } catch (error) {
      console.error('Error taking action on feature:', error);
    }
  }, [user?.id, state.currentHighlight]);

  /**
   * Update discovery preferences
   */
  const updatePreferences = useCallback(async (preferences: {
    enabled?: boolean;
    frequency?: 'minimal' | 'normal' | 'frequent';
    categories?: string[];
  }) => {
    if (!user?.id) return;

    try {
      await FeatureDiscoveryService.updateDiscoveryPreferences(user.id, preferences);

      setState(prev => ({
        ...prev,
        userPreferences: {
          ...prev.userPreferences,
          enableDiscovery: preferences.enabled ?? prev.userPreferences.enableDiscovery,
          frequency: preferences.frequency ?? prev.userPreferences.frequency,
          categories: preferences.categories ?? prev.userPreferences.categories
        }
      }));

    } catch (error) {
      console.error('Error updating discovery preferences:', error);
    }
  }, [user?.id]);

  /**
   * Get eligible features for manual triggering
   */
  const getEligibleFeatures = useCallback(async (trigger: 'page_load' | 'user_action' | 'manual' = 'manual') => {
    if (!user?.id) return [];

    try {
      const timeOnPlatform = 7; // Mock value
      return await FeatureDiscoveryService.getEligibleHighlights(
        user.id,
        trigger,
        {
          subscriptionCount,
          userLevel,
          timeOnPlatform
        }
      );
    } catch (error) {
      console.error('Error getting eligible features:', error);
      return [];
    }
  }, [user?.id, subscriptionCount, userLevel]);

  /**
   * Reset discovery progress (for testing)
   */
  const resetProgress = useCallback(async () => {
    if (!user?.id) return;

    try {
      await FeatureDiscoveryService.resetUserProgress(user.id);
      setState(prev => ({
        ...prev,
        shownHighlights: [],
        dismissedHighlights: [],
        isActive: false,
        currentHighlight: null
      }));
    } catch (error) {
      console.error('Error resetting discovery progress:', error);
    }
  }, [user?.id]);

  return {
    // State
    isActive: state.isActive,
    currentHighlight: state.currentHighlight,
    queuedHighlights: state.queuedHighlights,
    shownHighlights: state.shownHighlights,
    dismissedHighlights: state.dismissedHighlights,
    userPreferences: state.userPreferences,

    // Actions
    showFeature,
    dismissFeature,
    takeAction,
    updatePreferences,
    getEligibleFeatures,
    resetProgress,

    // Computed values
    hasActiveHighlight: !!state.currentHighlight,
    discoveryEnabled: state.userPreferences.enableDiscovery
  };
}
