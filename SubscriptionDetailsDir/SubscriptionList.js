import React, { useContext } from 'react';
import { SubscriptionContext } from '../contexts/SubscriptionContext';
import SubscriptionListItem from './SubscriptionListItem';

const SubscriptionList = () => {
  const { subscriptions } = useContext(SubscriptionContext);

  if (subscriptions.length === 0) {
    return <p className="text-center text-gray-500">No subscriptions added yet.</p>;
  }

  return (
    <div className="space-y-4">
      {subscriptions.map(sub => (
        <SubscriptionListItem key={sub.id} subscription={sub} />
      ))}
    </div>
  );
};

export default SubscriptionList;
