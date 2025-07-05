import React from 'react';
import { useSubscriptions, Subscription } from '../contexts/SubscriptionContext';
import SubscriptionListItem from './SubscriptionListItem';
import { useCurrency } from '../hooks/useCurrency';
import { ChevronDown, Loader2 } from 'lucide-react';

interface SubscriptionListProps {
  filteredSubscriptions?: Subscription[];
}

const SubscriptionList: React.FC<SubscriptionListProps> = ({ filteredSubscriptions }) => {
  const {
    subscriptions,
    isLoading,
    loadMoreSubscriptions,
    hasMoreSubscriptions,
    totalCount
  } = useSubscriptions();
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

      {/* Load More Button - Only show if not using filtered results and there are more items */}
      {!filteredSubscriptions && hasMoreSubscriptions && (
        <div className="mt-6 pt-4 border-t border-gray-700">
          <button
            onClick={loadMoreSubscriptions}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3
                       bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800
                       text-white rounded-lg transition-colors duration-200
                       disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading more...</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                <span>Load More Subscriptions</span>
                <span className="text-sm text-blue-200">
                  ({displaySubscriptions.length} of {totalCount})
                </span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Pagination Info */}
      {!filteredSubscriptions && totalCount > 0 && (
        <div className="mt-4 text-center text-sm text-gray-400">
          Showing {displaySubscriptions.length} of {totalCount} subscriptions
          {!hasMoreSubscriptions && displaySubscriptions.length > 23 && (
            <span className="text-green-400 ml-2">• All loaded</span>
          )}
        </div>
      )}
    </div>
  );
};

export default SubscriptionList;
