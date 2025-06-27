import React, { useState } from 'react';
import AddSubscriptionForm from '../components/AddSubscriptionForm';
import SubscriptionList from '../components/SubscriptionList';
import SearchAndFilter from '../components/SearchAndFilter';
import { Subscription } from '../contexts/SubscriptionContext';

const Subscriptions: React.FC = () => {
  const [filteredSubscriptions, setFilteredSubscriptions] = useState<Subscription[]>([]);

  return (
    <div className="flex-1 bg-[#0f1a24] h-full overflow-y-auto">
      <div className="flex flex-wrap justify-between gap-3 p-4 sm:p-6">
        <h1 className="text-white tracking-light text-2xl sm:text-[32px] font-bold leading-tight">Subscriptions</h1>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 p-4 sm:p-6">
        <div className="w-full space-y-6">
          <AddSubscriptionForm />
          <SearchAndFilter onFilteredResults={setFilteredSubscriptions} />
        </div>
        <div className="w-full">
          <SubscriptionList filteredSubscriptions={filteredSubscriptions} />
        </div>
      </div>
    </div>
  );
};

export default Subscriptions;
