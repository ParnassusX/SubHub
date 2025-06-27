import React from 'react';
import { Subscription, useSubscriptions } from '../contexts/SubscriptionContext';

interface SubscriptionListItemProps {
  subscription: Subscription;
}

const SubscriptionListItem: React.FC<SubscriptionListItemProps> = ({ subscription }) => {
  const { deleteSubscription } = useSubscriptions();

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${subscription.name}?`)) {
      try {
        await deleteSubscription(subscription.id);
      } catch (error) {
        alert('Failed to delete subscription. Please try again.');
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getNextBillingDate = (startDate: string, frequency: 'Monthly' | 'Yearly') => {
    const start = new Date(startDate);
    const now = new Date();
    
    if (frequency === 'Monthly') {
      const nextBilling = new Date(start);
      while (nextBilling < now) {
        nextBilling.setMonth(nextBilling.getMonth() + 1);
      }
      return nextBilling.toLocaleDateString();
    } else {
      const nextBilling = new Date(start);
      while (nextBilling < now) {
        nextBilling.setFullYear(nextBilling.getFullYear() + 1);
      }
      return nextBilling.toLocaleDateString();
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Entertainment': 'bg-purple-600',
      'Productivity': 'bg-blue-600',
      'Health & Fitness': 'bg-green-600',
      'News & Media': 'bg-yellow-600',
      'Cloud Storage': 'bg-red-600',
      'Software': 'bg-indigo-600',
      'Music': 'bg-pink-600',
      'Gaming': 'bg-orange-600',
      'Other': 'bg-gray-600',
    };
    return colors[category] || 'bg-gray-600';
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg border border-gray-600 hover:bg-gray-650 transition-colors">
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-medium text-white">{subscription.name}</h3>
            <span className={`px-2 py-1 text-xs text-white rounded-full ${getCategoryColor(subscription.category)}`}>
              {subscription.category}
            </span>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-green-400">
              ${subscription.cost.toFixed(2)}
            </p>
            <p className="text-xs text-gray-400">{subscription.frequency}</p>
          </div>
        </div>

        {subscription.description && (
          <p className="mt-1 text-sm text-gray-400">{subscription.description}</p>
        )}

        <div className="mt-2 flex justify-between text-sm text-gray-400">
          <span>Started: {formatDate(subscription.startDate)}</span>
          <span>Next billing: {getNextBillingDate(subscription.startDate, subscription.frequency)}</span>
        </div>

        {subscription.website && (
          <div className="mt-2">
            <a
              href={subscription.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              Visit Website →
            </a>
          </div>
        )}
      </div>

      <div className="ml-4">
        <button
          onClick={handleDelete}
          className="px-3 py-1 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default SubscriptionListItem;
