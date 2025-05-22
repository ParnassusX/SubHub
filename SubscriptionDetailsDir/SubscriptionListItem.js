import React from 'react';

const SubscriptionListItem = ({ subscription }) => {
  return (
    <div className="p-4 bg-gray-100 rounded-lg shadow mb-2">
      <h3 className="text-lg font-semibold text-gray-800">{subscription.name}</h3>
      <p className="text-sm text-gray-600">Cost: ${subscription.cost} / {subscription.frequency}</p>
      <p className="text-sm text-gray-600">Start Date: {subscription.startDate}</p>
    </div>
  );
};

export default SubscriptionListItem;
