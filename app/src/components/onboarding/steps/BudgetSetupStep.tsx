// Budget Setup Step - Configure budget limits (Premium feature showcase)
import React, { useState } from 'react';
import { DollarSign, TrendingUp, Crown } from 'lucide-react';

import type { OnboardingStepProps } from '../../../types/onboarding';

const BudgetSetupStep: React.FC<OnboardingStepProps> = ({
  onNext
}) => {
  
  const [budgetData, setBudgetData] = useState({
    monthlyBudget: '',
    yearlyBudget: '',
    enableAlerts: true
  });

  const handleInputChange = (field: string, value: string) => {
    setBudgetData(prev => ({ ...prev, [field]: value }));
  };

  const handleContinue = () => {
    // This is a premium feature showcase, so we'll just continue
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
          Set Your Budget
        </h2>
        <p className="text-gray-400">
          Track spending and get smart alerts
        </p>
        <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-full px-3 py-1">
          <Crown className="w-4 h-4 text-yellow-400" />
          <span className="text-yellow-400 text-sm font-medium">Premium Feature</span>
        </div>
      </div>

      {/* Budget Form */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <DollarSign className="w-4 h-4 inline mr-2" />
            Monthly Budget
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={budgetData.monthlyBudget}
            onChange={(e) => handleInputChange('monthlyBudget', e.target.value)}
            placeholder="e.g., 100.00"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <TrendingUp className="w-4 h-4 inline mr-2" />
            Yearly Budget
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={budgetData.yearlyBudget}
            onChange={(e) => handleInputChange('yearlyBudget', e.target.value)}
            placeholder="e.g., 1200.00"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
          />
        </div>
      </div>

      {/* Premium Features Preview */}
      <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg p-4">
        <h3 className="text-yellow-400 font-medium mb-3">Premium Budget Features:</h3>
        <ul className="space-y-2 text-sm text-gray-300">
          <li className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            <span>Smart spending alerts when approaching limits</span>
          </li>
          <li className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            <span>Category-specific budget tracking</span>
          </li>
          <li className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            <span>Predictive spending insights</span>
          </li>
          <li className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            <span>Unused subscription detection</span>
          </li>
        </ul>
      </div>

      {/* CTA */}
      <div className="text-center space-y-3">
        <p className="text-gray-400 text-sm">
          Upgrade to Premium to unlock advanced budget management
        </p>
        <div className="space-y-2">
          <button
            onClick={() => window.location.href = '/pricing'}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            Upgrade to Premium
          </button>
          <button
            onClick={handleContinue}
            className="w-full text-gray-400 hover:text-white py-2 transition-colors"
          >
            Continue with Free Plan
          </button>
        </div>
      </div>
    </div>
  );
};

export default BudgetSetupStep;
