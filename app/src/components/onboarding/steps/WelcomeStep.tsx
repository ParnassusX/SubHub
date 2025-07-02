// Welcome Step - First step in onboarding
import React from 'react';
import { Zap, Shield, TrendingUp, Users } from 'lucide-react';

import type { OnboardingStepProps } from '../../../types/onboarding';

const WelcomeStep: React.FC<OnboardingStepProps> = ({
  onNext
}) => {

  const features = [
    {
      icon: TrendingUp,
      title: 'Track All Subscriptions',
      description: 'Never lose track of your recurring payments again'
    },
    {
      icon: Shield,
      title: 'Smart Notifications',
      description: 'Get reminded before renewals and price changes'
    },
    {
      icon: Zap,
      title: 'Save Money',
      description: 'Identify unused subscriptions and optimize spending'
    },
    {
      icon: Users,
      title: 'Family Sharing',
      description: 'Manage subscriptions for your entire household'
    }
  ];

  return (
    <div className="text-center space-y-6">
      {/* Welcome Header */}
      <div className="space-y-4">
        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto">
          <Zap className="w-8 h-8 text-white" />
        </div>
        
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Welcome to SubHub! 🎉
          </h1>
          <p className="text-gray-400 text-lg">
            Your journey to smarter subscription management starts here
          </p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-8">
        {features.map((feature, index) => {
          const IconComponent = feature.icon;
          return (
            <div
              key={index}
              className="bg-[#1a2f3f] rounded-lg p-4 border border-[#2e4e6b] hover:border-blue-500/50 transition-colors"
            >
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <IconComponent className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-left">
                  <h3 className="font-medium text-white mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Getting Started Info */}
      <div className="bg-blue-600/10 border border-blue-600/20 rounded-lg p-4">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
          <span className="text-blue-400 font-medium">Quick Setup</span>
        </div>
        <p className="text-gray-300 text-sm">
          We'll help you set up your profile, add your first subscription, and configure 
          notifications. This should take about 5-10 minutes.
        </p>
      </div>

      {/* Stats Preview */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-400">5 min</div>
          <div className="text-xs text-gray-400">Setup Time</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400">$127</div>
          <div className="text-xs text-gray-400">Avg. Yearly Savings</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-400">50k+</div>
          <div className="text-xs text-gray-400">Happy Users</div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="pt-4">
        <p className="text-gray-400 text-sm mb-4">
          Ready to take control of your subscriptions?
        </p>
        <button
          onClick={onNext}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
        >
          Let's Get Started! 🚀
        </button>
      </div>
    </div>
  );
};

export default WelcomeStep;
