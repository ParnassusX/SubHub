// Dashboard Tour Step - Introduce key features
import React from 'react';
import { BarChart3, Bell, Settings, CreditCard } from 'lucide-react';

import type { OnboardingStepProps } from '../../../types/onboarding';

const DashboardTourStep: React.FC<OnboardingStepProps> = ({
  onNext
}) => {

  const features = [
    {
      icon: BarChart3,
      title: 'Dashboard Overview',
      description: 'See all your subscriptions and spending at a glance',
      location: 'Main dashboard page'
    },
    {
      icon: CreditCard,
      title: 'Subscription Management',
      description: 'Add, edit, and organize your subscriptions',
      location: 'Subscriptions page'
    },
    {
      icon: BarChart3,
      title: 'Reports & Analytics',
      description: 'Track spending trends and get insights',
      location: 'Reports page'
    },
    {
      icon: Bell,
      title: 'Notifications',
      description: 'Stay updated on renewals and alerts',
      location: 'Notifications page'
    },
    {
      icon: Settings,
      title: 'Settings',
      description: 'Customize your preferences and profile',
      location: 'Settings page'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto">
          <BarChart3 className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-xl font-semibold text-white">
          Dashboard Tour
        </h2>
        <p className="text-gray-400">
          Let's explore what SubHub can do for you
        </p>
      </div>

      {/* Features List */}
      <div className="space-y-3">
        {features.map((feature, index) => {
          const IconComponent = feature.icon;
          return (
            <div
              key={index}
              className="flex items-start space-x-4 p-4 bg-[#1a2f3f] rounded-lg border border-[#2e4e6b]"
            >
              <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <IconComponent className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-white mb-1">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-400 mb-2">
                  {feature.description}
                </p>
                <span className="text-xs text-blue-400">
                  📍 {feature.location}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Tips */}
      <div className="bg-blue-600/10 border border-blue-600/20 rounded-lg p-4">
        <h3 className="text-blue-400 font-medium mb-2">Navigation Tips:</h3>
        <ul className="space-y-1 text-sm text-gray-300">
          <li>• Use the sidebar (desktop) or bottom nav (mobile) to navigate</li>
          <li>• Click on any subscription to view details</li>
          <li>• Use the search bar to quickly find subscriptions</li>
          <li>• Check notifications regularly for important updates</li>
        </ul>
      </div>

      {/* Action Button */}
      <button
        onClick={onNext}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
      >
        Got it! Let's continue
      </button>
    </div>
  );
};

export default DashboardTourStep;
