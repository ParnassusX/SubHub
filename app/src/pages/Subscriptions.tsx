import React, { useState } from 'react';
import AddSubscriptionForm from '../components/AddSubscriptionForm';
import SubscriptionList from '../components/SubscriptionList';
import CollapsibleSearchAndFilter from '../components/CollapsibleSearchAndFilter';
import OfflineIndicator from '../components/OfflineIndicator';
import { Subscription } from '../contexts/SubscriptionContext';

const Subscriptions: React.FC = () => {
  const [filteredSubscriptions, setFilteredSubscriptions] = useState<Subscription[]>([]);

  return (
    <div className="flex-1 bg-[#0f1a24] h-full overflow-y-auto overflow-x-hidden">
      {/* Page Container with proper constraints */}
      <div className="w-full max-w-full min-w-0">
        {/* Header */}
        <div className="flex flex-wrap justify-between gap-3 p-4 sm:p-6 w-full max-w-full">
          <h1 className="text-white tracking-light text-2xl sm:text-[32px] font-bold leading-tight min-w-0">Subscriptions</h1>
        </div>

        {/* Offline Indicator */}
        <div className="w-full max-w-full min-w-0 px-4 sm:px-6">
          <OfflineIndicator className="mb-4" />
        </div>

        {/* Collapsible Search and Filter Section - Full Width at Top */}
        <div className="w-full max-w-full min-w-0 px-4 sm:px-6">
          <CollapsibleSearchAndFilter onFilteredResults={setFilteredSubscriptions} />
        </div>

        {/* Main Content - Two Column Layout Below Filters */}
        <div className="w-full max-w-full min-w-0 p-4 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 w-full max-w-full">
            {/* Left Column - Add Subscription Form */}
            <div className="w-full max-w-full min-w-0">
              <AddSubscriptionForm />
            </div>

            {/* Right Column - Subscription List */}
            <div className="w-full max-w-full min-w-0">
              <SubscriptionList filteredSubscriptions={filteredSubscriptions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscriptions;
