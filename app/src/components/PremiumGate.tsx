import React from 'react';
import { Lock, Sparkles, Crown } from 'lucide-react';
import { PremiumFeaturesService, SubscriptionTier } from '../services/premiumFeaturesService';

interface PremiumGateProps {
  featureId: string;
  userTier?: SubscriptionTier;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgradePrompt?: boolean;
}

/**
 * Premium Gate Component
 * Wraps premium features and shows upgrade prompts for free users
 */
const PremiumGate: React.FC<PremiumGateProps> = ({
  featureId,
  userTier = 'free',
  children,
  fallback,
  showUpgradePrompt = true
}) => {
  const hasAccess = PremiumFeaturesService.hasFeatureAccess(featureId, userTier);
  const feature = PremiumFeaturesService.getFeature(featureId);
  const upgradeMessage = PremiumFeaturesService.getUpgradeMessage(featureId, userTier);

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showUpgradePrompt) {
    return null;
  }

  // Default upgrade prompt
  return (
    <div className="glass-card p-6 border-2 border-dashed border-blue-600/50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5"></div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
            {feature?.icon ? (
              <span className="text-2xl">{feature.icon}</span>
            ) : (
              <Crown className="w-6 h-6 text-white" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-white">{feature?.name || 'Premium Feature'}</h3>
              <span className="px-2 py-0.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold rounded-full">
                PRO
              </span>
            </div>
            <p className="text-sm text-gray-400">{feature?.description}</p>
          </div>
        </div>

        {/* Locked Content Preview */}
        <div className="relative mb-4">
          <div className="absolute inset-0 backdrop-blur-sm bg-gray-900/50 rounded-lg flex items-center justify-center z-10">
            <Lock className="w-12 h-12 text-blue-400 animate-pulse" />
          </div>
          <div className="opacity-30 pointer-events-none">
            {children}
          </div>
        </div>

        {/* Upgrade Message */}
        {upgradeMessage && (
          <div className="flex items-start gap-3 p-4 bg-blue-900/20 border border-blue-600/50 rounded-lg mb-4">
            <Sparkles className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-300">{upgradeMessage}</p>
          </div>
        )}

        {/* CTA Button */}
        <button 
          onClick={() => {
            // Navigate to pricing page
            window.location.href = '/settings?tab=subscription';
          }}
          className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all hover-lift flex items-center justify-center gap-2"
        >
          <Crown className="w-5 h-5" />
          <span>Upgrade to Premium</span>
        </button>
      </div>
    </div>
  );
};

export default PremiumGate;
