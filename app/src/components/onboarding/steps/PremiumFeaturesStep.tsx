// Premium Features Step - Showcase premium benefits and conversion
import React from 'react';
import { Crown, Zap, Shield, TrendingUp, Users } from 'lucide-react';

import { useCurrency } from '../../../hooks/useCurrency';
import type { OnboardingStepProps } from '../../../types/onboarding';

const PremiumFeaturesStep: React.FC<OnboardingStepProps> = ({
  onNext
}) => {
  const { formatPrice } = useCurrency();

  const premiumFeatures = [
    {
      icon: Zap,
      title: 'Unlimited Subscriptions',
      description: 'Track as many subscriptions as you want',
      freeLimit: '5 subscriptions',
      premiumLimit: 'Unlimited'
    },
    {
      icon: TrendingUp,
      title: 'Advanced Analytics',
      description: 'Deep insights into your spending patterns',
      freeLimit: 'Basic reports',
      premiumLimit: 'Advanced analytics'
    },
    {
      icon: Shield,
      title: 'Smart Alerts',
      description: 'Intelligent notifications and unused detection',
      freeLimit: 'Basic alerts',
      premiumLimit: 'Smart scheduling'
    },
    {
      icon: Users,
      title: 'Family Sharing',
      description: 'Manage subscriptions for your whole family',
      freeLimit: 'Personal only',
      premiumLimit: 'Up to 6 members'
    }
  ];

  const handleUpgrade = () => {
    window.location.href = '/pricing';
  };

  const handleContinueWithFree = () => {
    onNext();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto">
          <Crown className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-xl font-semibold text-white">
          Unlock Premium Features
        </h2>
        <p className="text-gray-400">
          Get the most out of SubHub with Premium
        </p>
      </div>

      {/* Value Proposition */}
      <div className="text-center bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg p-4">
        <div className="text-2xl font-bold text-yellow-400 mb-1">
          Save $127/year on average
        </div>
        <p className="text-sm text-gray-300">
          Premium users save money by detecting unused subscriptions
        </p>
      </div>

      {/* Feature Comparison */}
      <div className="space-y-3">
        {premiumFeatures.map((feature, index) => {
          const IconComponent = feature.icon;
          return (
            <div
              key={index}
              className="bg-[#1a2f3f] rounded-lg border border-[#2e4e6b] p-4"
            >
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <IconComponent className="w-5 h-5 text-yellow-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-white mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-400 mb-3">
                    {feature.description}
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-gray-800 rounded p-2">
                      <div className="text-gray-400 mb-1">Free Plan</div>
                      <div className="text-white">{feature.freeLimit}</div>
                    </div>
                    <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded p-2">
                      <div className="text-yellow-400 mb-1">Premium</div>
                      <div className="text-white">{feature.premiumLimit}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pricing */}
      <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg p-4">
        <div className="text-center">
          <div className="text-lg font-semibold text-white mb-1">
            Special Onboarding Offer
          </div>
          <div className="text-2xl font-bold text-yellow-400 mb-2">
            {formatPrice(4.99)}/month
          </div>
          <div className="text-sm text-gray-400 line-through mb-1">
            Regular price: {formatPrice(9.99)}/month
          </div>
          <div className="text-xs text-yellow-400">
            50% off for your first 3 months
          </div>
        </div>
      </div>

      {/* Social Proof */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-4 h-4 text-yellow-400">⭐</div>
          ))}
        </div>
        <p className="text-sm text-gray-400">
          "SubHub Premium helped me save $200 last year!" - Sarah K.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={handleUpgrade}
          className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
        >
          Start Premium Trial - 50% Off
        </button>
        
        <button
          onClick={handleContinueWithFree}
          className="w-full text-gray-400 hover:text-white py-2 transition-colors"
        >
          Continue with Free Plan
        </button>
      </div>

      {/* Trust Indicators */}
      <div className="text-center text-xs text-gray-400">
        <p>✓ Cancel anytime ✓ 30-day money-back guarantee ✓ No hidden fees</p>
      </div>
    </div>
  );
};

export default PremiumFeaturesStep;
