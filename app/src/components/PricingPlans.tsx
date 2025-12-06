import React, { useState } from 'react';
import { Check, Crown, Sparkles, Users, Zap } from 'lucide-react';
import { PremiumFeaturesService, SubscriptionTier } from '../services/premiumFeaturesService';

interface PricingPlansProps {
  currentTier?: SubscriptionTier;
  onSelectPlan?: (tier: SubscriptionTier) => void;
}

const PricingPlans: React.FC<PricingPlansProps> = ({
  currentTier = 'free',
  onSelectPlan
}) => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const plans = PremiumFeaturesService.getPlans();

  const getPlanIcon = (tier: SubscriptionTier) => {
    switch (tier) {
      case 'free':
        return <Sparkles className="w-6 h-6" />;
      case 'premium':
        return <Crown className="w-6 h-6" />;
      case 'enterprise':
        return <Users className="w-6 h-6" />;
    }
  };

  const getPlanColor = (tier: SubscriptionTier) => {
    switch (tier) {
      case 'free':
        return 'from-gray-600 to-gray-700';
      case 'premium':
        return 'from-blue-600 to-purple-600';
      case 'enterprise':
        return 'from-purple-600 to-pink-600';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-3">
          Choose Your Plan
        </h2>
        <p className="text-gray-400 text-lg mb-6">
          Unlock powerful features to optimize your subscriptions
        </p>

        {/* Billing Toggle */}
        <div className="inline-flex items-center gap-3 p-1 bg-gray-800 rounded-lg border border-gray-700">
          <button
            onClick={() => setBillingPeriod('monthly')}
            className={`px-6 py-2 rounded-md font-medium transition-all ${
              billingPeriod === 'monthly'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingPeriod('yearly')}
            className={`px-6 py-2 rounded-md font-medium transition-all relative ${
              billingPeriod === 'yearly'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Yearly
            <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded-full">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrentPlan = plan.id === currentTier;
          const price = billingPeriod === 'monthly' ? plan.price : plan.yearlyPrice;
          const displayPrice = billingPeriod === 'yearly' ? (plan.yearlyPrice / 12).toFixed(2) : price.toFixed(2);
          const savings = billingPeriod === 'yearly' ? PremiumFeaturesService.calculateYearlySavings(plan.id) : 0;

          return (
            <div
              key={plan.id}
              className={`glass-card p-6 rounded-xl transition-all hover-lift ${
                plan.popular
                  ? 'border-2 border-blue-600 shadow-xl shadow-blue-600/20'
                  : 'border border-gray-700'
              } ${isCurrentPlan ? 'ring-2 ring-green-500' : ''}`}
            >
              {/* Plan Badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold rounded-full shadow-lg">
                    MOST POPULAR
                  </span>
                </div>
              )}

              {isCurrentPlan && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 bg-green-600 text-white text-xs font-bold rounded-full shadow-lg">
                    CURRENT PLAN
                  </span>
                </div>
              )}

              {/* Icon & Title */}
              <div className="mb-6">
                <div className={`w-12 h-12 bg-gradient-to-br ${getPlanColor(plan.id)} rounded-xl flex items-center justify-center mb-3`}>
                  {getPlanIcon(plan.id)}
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">{plan.name}</h3>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">${displayPrice}</span>
                  <span className="text-gray-400">/month</span>
                </div>
                {billingPeriod === 'yearly' && plan.price > 0 && (
                  <p className="text-sm text-green-400 mt-1">
                    Save ${savings.toFixed(2)}/year
                  </p>
                )}
                {billingPeriod === 'yearly' && plan.price > 0 && (
                  <p className="text-xs text-gray-500">
                    Billed ${plan.yearlyPrice}/year
                  </p>
                )}
              </div>

              {/* CTA Button */}
              <button
                onClick={() => onSelectPlan?.(plan.id)}
                disabled={isCurrentPlan}
                className={`w-full py-3 px-6 rounded-lg font-semibold mb-6 transition-all ${
                  isCurrentPlan
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : plan.popular
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white hover-lift'
                    : 'bg-gray-700 hover:bg-gray-600 text-white hover-lift'
                }`}
              >
                {isCurrentPlan ? 'Current Plan' : plan.price === 0 ? 'Get Started Free' : 'Upgrade Now'}
              </button>

              {/* Features List */}
              <div className="space-y-3">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                      plan.popular ? 'text-blue-400' : 'text-gray-400'
                    }`} />
                    <span className="text-sm text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Limits Info */}
              <div className="mt-6 pt-6 border-t border-gray-700">
                <p className="text-xs text-gray-500 font-medium mb-2">LIMITS</p>
                <div className="space-y-1 text-xs text-gray-400">
                  <p>
                    Subscriptions:{' '}
                    <span className="text-white">
                      {plan.limits.subscriptions === -1 ? 'Unlimited' : plan.limits.subscriptions}
                    </span>
                  </p>
                  <p>
                    Monthly Exports:{' '}
                    <span className="text-white">
                      {plan.limits.exports === -1 ? 'Unlimited' : plan.limits.exports}
                    </span>
                  </p>
                  <p>
                    Email Alerts:{' '}
                    <span className="text-white">
                      {plan.limits.emailNotifications === -1 ? 'Unlimited' : plan.limits.emailNotifications}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* FAQ / Additional Info */}
      <div className="text-center text-sm text-gray-400 mt-8">
        <p className="mb-2">
          <Zap className="w-4 h-4 inline mr-1 text-yellow-400" />
          All plans include 14-day money-back guarantee
        </p>
        <p>
          Need a custom plan?{' '}
          <a href="mailto:sales@subhub.app" className="text-blue-400 hover:text-blue-300">
            Contact us
          </a>
        </p>
      </div>
    </div>
  );
};

export default PricingPlans;
