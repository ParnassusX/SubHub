import React from 'react';
import { useSubscriptions, Subscription } from '../contexts/SubscriptionContext';
import SubscriptionListItem from './SubscriptionListItem';
import { useCurrency } from '../hooks/useCurrency';

interface SubscriptionListProps {
  filteredSubscriptions?: Subscription[];
}

const SubscriptionList: React.FC<SubscriptionListProps> = ({ filteredSubscriptions }) => {
  const { subscriptions } = useSubscriptions();
  const { formatPrice } = useCurrency();

  // Use filtered subscriptions if provided, otherwise use all subscriptions
  const displaySubscriptions = filteredSubscriptions || subscriptions;

  if (subscriptions.length === 0) {
    return (
      <div className="p-6 bg-gray-800 rounded-lg border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">Your Subscriptions</h2>
        <p className="text-gray-400 text-center py-8">
          No subscriptions yet. Add your first subscription to get started!
        </p>
      </div>
    );
  }

  if (displaySubscriptions.length === 0 && filteredSubscriptions) {
    return (
      <div className="p-6 bg-gray-800 rounded-lg border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">Your Subscriptions</h2>
        <p className="text-gray-400 text-center py-8">
          No subscriptions match your current filters. Try adjusting your search criteria.
        </p>
      </div>
    );
  }

  const totalMonthlyCost = displaySubscriptions.reduce((total, sub) => {
    const monthlyCost = sub.frequency === 'Monthly' ? sub.cost : sub.cost / 12;
    return total + monthlyCost;
  }, 0);

  const totalYearlyCost = totalMonthlyCost * 12;

  return (
    <div className="p-6 bg-gray-800 rounded-lg border border-gray-700">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white">Your Subscriptions</h2>
        <div className="text-right">
          <p className="text-sm text-gray-400">Monthly Total</p>
          <p className="text-lg font-semibold text-green-400">{formatPrice(totalMonthlyCost)}</p>
          <p className="text-xs text-gray-500">{formatPrice(totalYearlyCost)}/year</p>
        </div>
      </div>
      
      <div className="space-y-3">
        {displaySubscriptions.map((subscription) => (
          <SubscriptionListItem
            key={subscription.id}
            subscription={subscription}
          />
        ))}
      </div>
    </div>
  );
};

export default SubscriptionList;
