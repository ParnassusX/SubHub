import React from 'react';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import AddSubscriptionForm from './AddSubscriptionsDir/AddSubscriptionForm';
import SubscriptionList from './SubscriptionDetailsDir/SubscriptionList';

// It appears that a full React project setup (like Create React App) is not present.
// This App.js component is created with the assumption that it will be integrated into such a setup.
// Without a build system and HTML entry point, this code will not run directly in a browser.

function App() {
  return (
    <SubscriptionProvider>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold text-center text-indigo-600 my-6">SubHub - Subscription Manager</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Add New Subscription</h2>
            <AddSubscriptionForm />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Your Subscriptions</h2>
            <SubscriptionList />
          </div>
        </div>
      </div>
    </SubscriptionProvider>
  );
}

export default App;
