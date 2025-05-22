import React, { createContext, useState, useContext } from 'react';

export const SubscriptionContext = createContext();

export const useSubscriptions = () => useContext(SubscriptionContext);

export const SubscriptionProvider = ({ children }) => {
  const [subscriptions, setSubscriptions] = useState([]);

  const addSubscription = (subscription) => {
    setSubscriptions(prevSubscriptions => [...prevSubscriptions, { ...subscription, id: Date.now() }]);
  };

  // Placeholder for future edit and delete functions
  // const editSubscription = (updatedSubscription) => {
  //   setSubscriptions(prevSubscriptions => 
  //     prevSubscriptions.map(sub => sub.id === updatedSubscription.id ? updatedSubscription : sub)
  //   );
  // };

  // const deleteSubscription = (id) => {
  //   setSubscriptions(prevSubscriptions => prevSubscriptions.filter(sub => sub.id !== id));
  // };

  return (
    <SubscriptionContext.Provider value={{ subscriptions, addSubscription }}>
      {children}
    </SubscriptionContext.Provider>
  );
};
