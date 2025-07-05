// Feature Flags Configuration for SubHub
// Simple boolean flags to enable/disable UX features during development

/**
 * Feature flags for controlling UX elements
 * Set to false to disable overwhelming user experience elements
 * Set to true to re-enable when properly coordinated
 */
export const FEATURE_FLAGS = {
  // Onboarding System
  ONBOARDING_ENABLED: false, // Temporarily disabled - causing conflicts and inconsistent behavior
  
  // Dashboard Tour System
  DASHBOARD_TOUR_ENABLED: false, // Temporarily disabled - yellow popup conflicts with onboarding
  TOUR_TRIGGER_ENABLED: false, // Temporarily disabled - tour button in dashboard header
  
  // Feature Discovery System
  FEATURE_HIGHLIGHT_ENABLED: false, // Temporarily disabled - progressive discovery conflicts
  
  // Notification Systems
  PWA_INSTALL_PROMPT_ENABLED: true, // Keep enabled but make less aggressive
  PWA_UPDATE_PROMPT_ENABLED: true, // Keep enabled for important updates
  
  // Core Functionality (Always Enabled)
  NOTIFICATION_CENTER_ENABLED: true, // Keep essential notifications
  ERROR_NOTIFICATIONS_ENABLED: true, // Keep critical error messages
  SUCCESS_NOTIFICATIONS_ENABLED: true, // Keep success feedback
} as const;

/**
 * Development-only feature flags
 * These are automatically disabled in production
 */
export const DEV_FEATURE_FLAGS = {
  // Debug panels and development tools
  PERFORMANCE_DASHBOARD_ENABLED: true,
  ONBOARDING_DEBUG_PANEL_ENABLED: false, // Disabled to prevent conflicts
  CONSOLE_DEBUG_LOGGING_ENABLED: true,
} as const;

/**
 * Get feature flag value with environment check
 */
export const isFeatureEnabled = (flag: keyof typeof FEATURE_FLAGS): boolean => {
  return FEATURE_FLAGS[flag];
};

/**
 * Get development feature flag value
 */
export const isDevFeatureEnabled = (flag: keyof typeof DEV_FEATURE_FLAGS): boolean => {
  if (process.env.NODE_ENV !== 'development') {
    return false;
  }
  return DEV_FEATURE_FLAGS[flag];
};

/**
 * Utility to check if UX elements should be minimal
 */
export const isMinimalUXMode = (): boolean => {
  return !FEATURE_FLAGS.ONBOARDING_ENABLED && 
         !FEATURE_FLAGS.DASHBOARD_TOUR_ENABLED && 
         !FEATURE_FLAGS.FEATURE_HIGHLIGHT_ENABLED;
};

/**
 * Log feature flag status (development only)
 */
export const logFeatureFlagStatus = (): void => {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }
  
  console.log('🚩 SubHub Feature Flags Status:');
  console.log('  Onboarding:', FEATURE_FLAGS.ONBOARDING_ENABLED ? '✅ Enabled' : '❌ Disabled');
  console.log('  Dashboard Tour:', FEATURE_FLAGS.DASHBOARD_TOUR_ENABLED ? '✅ Enabled' : '❌ Disabled');
  console.log('  Feature Highlights:', FEATURE_FLAGS.FEATURE_HIGHLIGHT_ENABLED ? '✅ Enabled' : '❌ Disabled');
  console.log('  Minimal UX Mode:', isMinimalUXMode() ? '✅ Active' : '❌ Inactive');
};
