// First Subscription Step - Add user's first subscription
import React, { useState } from 'react';
import { Plus, CreditCard, Calendar, Tag } from 'lucide-react';

import { useCurrency } from '../../../hooks/useCurrency';
import { useSubscriptions } from '../../../contexts/SubscriptionContext';
import { useCategories } from '../../../hooks/useCategories';
import type { OnboardingStepProps } from '../../../types/onboarding';

const FirstSubscriptionStep: React.FC<OnboardingStepProps> = ({
  onNext
}) => {
  const { formatPrice } = useCurrency();
  const { addSubscription } = useSubscriptions();
  const { categories } = useCategories();
  
  const [formData, setFormData] = useState({
    name: '',
    cost: '',
    frequency: 'Monthly' as 'Monthly' | 'Yearly',
    category: 'Entertainment',
    startDate: new Date().toISOString().split('T')[0],
    description: '',
    website: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Popular subscription suggestions
  const popularSubscriptions = [
    { name: 'Netflix', cost: 15.49, category: 'Entertainment', website: 'netflix.com' },
    { name: 'Spotify', cost: 9.99, category: 'Entertainment', website: 'spotify.com' },
    { name: 'Adobe Creative Cloud', cost: 52.99, category: 'Productivity', website: 'adobe.com' },
    { name: 'Microsoft 365', cost: 6.99, category: 'Productivity', website: 'microsoft.com' },
    { name: 'Amazon Prime', cost: 14.98, category: 'Other', website: 'amazon.com' },
    { name: 'Disney+', cost: 7.99, category: 'Entertainment', website: 'disneyplus.com' }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSuggestionClick = (suggestion: typeof popularSubscriptions[0]) => {
    setFormData(prev => ({
      ...prev,
      name: suggestion.name,
      cost: suggestion.cost.toString(),
      category: suggestion.category,
      website: suggestion.website
    }));
  };

  const handleAddSubscription = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Validate form
      if (!formData.name.trim()) {
        throw new Error('Subscription name is required');
      }
      
      const cost = parseFloat(formData.cost);
      if (isNaN(cost) || cost <= 0) {
        throw new Error('Please enter a valid cost');
      }

      // Add subscription
      await addSubscription({
        name: formData.name.trim(),
        cost,
        frequency: formData.frequency,
        category: formData.category,
        startDate: formData.startDate,
        description: formData.description.trim() || undefined,
        website: formData.website.trim() || undefined
      });

      // Continue to next step
      onNext();

    } catch (err) {
      console.error('Error adding subscription:', err);
      setError(err instanceof Error ? err.message : 'Failed to add subscription');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipForNow = () => {
    onNext();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto">
          <Plus className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-xl font-semibold text-white">
          Add Your First Subscription
        </h2>
        <p className="text-gray-400">
          Start tracking your recurring payments
        </p>
      </div>

      {/* Popular Suggestions */}
      <div>
        <h3 className="text-sm font-medium text-gray-300 mb-3">
          Popular Subscriptions
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {popularSubscriptions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="text-left p-3 bg-[#1a2f3f] border border-[#2e4e6b] rounded-lg hover:border-blue-500/50 transition-colors"
            >
              <div className="font-medium text-white text-sm">
                {suggestion.name}
              </div>
              <div className="text-xs text-gray-400">
                {formatPrice(suggestion.cost)}/{suggestion.category}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Manual Entry Form */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-300">
          Or enter manually:
        </h3>

        {/* Subscription Name */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <Tag className="w-4 h-4 inline mr-2" />
            Subscription Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="e.g., Netflix, Spotify, Adobe"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Cost and Frequency */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <CreditCard className="w-4 h-4 inline mr-2" />
              Cost *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.cost}
              onChange={(e) => handleInputChange('cost', e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              Frequency
            </label>
            <select
              value={formData.frequency}
              onChange={(e) => handleInputChange('frequency', e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Monthly">Monthly</option>
              <option value="Yearly">Yearly</option>
            </select>
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Category
          </label>
          <select
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {categories.map(category => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Start Date */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Start Date
          </label>
          <input
            type="date"
            value={formData.startDate}
            onChange={(e) => handleInputChange('startDate', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-3">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-600/10 border border-blue-600/20 rounded-lg p-4">
        <p className="text-blue-400 text-sm">
          💡 <strong>Tip:</strong> Don't worry about getting everything perfect. You can edit or add more subscriptions later!
        </p>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={handleAddSubscription}
          disabled={isLoading || !formData.name.trim() || !formData.cost}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors"
        >
          {isLoading ? 'Adding...' : 'Add Subscription'}
        </button>
        
        <button
          onClick={handleSkipForNow}
          className="w-full text-gray-400 hover:text-white py-2 transition-colors"
        >
          I'll add subscriptions later
        </button>
      </div>
    </div>
  );
};

export default FirstSubscriptionStep;
