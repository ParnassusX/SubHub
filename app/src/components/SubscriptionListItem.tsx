import React, { useState } from 'react';
import { Subscription, useSubscriptions } from '../contexts/SubscriptionContext';
import { getCategoryBadgeProps } from '../utils/categoryColors';
import { useCurrency } from '../hooks/useCurrency';
import { AlertCircle } from 'lucide-react';
import { renderIcon } from './IconPicker';
import { useCategories } from '../hooks/useCategories';
import { LogoService } from '../services/logoService';

interface SubscriptionListItemProps {
  subscription: Subscription;
}

const SubscriptionListItem: React.FC<SubscriptionListItemProps> = ({ subscription }) => {
  const { deleteSubscription } = useSubscriptions();
  const { formatPrice } = useCurrency();
  const { categories } = useCategories();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    try {
      await deleteSubscription(subscription.id);
      setShowDeleteConfirm(false);
    } catch (error) {
      setError('Failed to delete subscription. Please try again.');
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

  return (
    <div className="flex items-center gap-4 p-4 bg-gray-700 rounded-lg border border-gray-600 hover:bg-gray-650 transition-colors">
      {/* Service Logo */}
      <div className="flex-shrink-0">
        <img 
          src={subscription.logo_url || LogoService.generateLetterAvatar(subscription.name)}
          alt={subscription.name}
          className="w-12 h-12 rounded-lg object-cover border border-gray-600"
          onError={(e) => {
            e.currentTarget.src = LogoService.generateLetterAvatar(subscription.name);
          }}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-medium text-white truncate">{subscription.name}</h3>
            <span {...getCategoryBadgeProps(subscription.category)} className="flex items-center gap-1 flex-shrink-0">
              {(() => {
                const category = categories.find(cat => cat.name === subscription.category);
                return category?.icon ? renderIcon(category.icon, 'w-3 h-3') : null;
              })()}
              {subscription.category}
            </span>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-green-400">
              {formatPrice(subscription.cost)}
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
          onClick={() => setShowDeleteConfirm(true)}
          className="px-3 py-1 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors"
        >
          Delete
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#1a2332] border border-[#2e4e6b] rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-white text-lg font-semibold mb-4">Delete Subscription</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete <strong>{subscription.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {error && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#1a2332] border border-[#2e4e6b] rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-red-400" />
              <h3 className="text-white text-lg font-semibold">Error</h3>
            </div>
            <p className="text-gray-300 mb-6">{error}</p>
            <div className="flex justify-end">
              <button
                onClick={() => setError(null)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionListItem;
