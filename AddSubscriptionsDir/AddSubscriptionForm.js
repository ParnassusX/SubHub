import React, { useState, useContext } from 'react';
import { SubscriptionContext } from '../contexts/SubscriptionContext';

const AddSubscriptionForm = () => {
  const { addSubscription } = useContext(SubscriptionContext);
  const [name, setName] = useState('');
  const [cost, setCost] = useState('');
  const [frequency, setFrequency] = useState('Monthly'); // Default frequency
  const [startDate, setStartDate] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !cost || !startDate) {
      alert('Please fill in all fields.'); // Basic validation
      return;
    }
    addSubscription({
      name,
      cost: parseFloat(cost),
      frequency,
      startDate,
    });
    // Reset form fields
    setName('');
    setCost('');
    setFrequency('Monthly');
    setStartDate('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white shadow-md rounded-lg">
      <div>
        <label htmlFor="subscriptionName" className="block text-sm font-medium text-gray-700">Subscription Name</label>
        <input
          type="text"
          id="subscriptionName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="subscriptionCost" className="block text-sm font-medium text-gray-700">Cost</label>
        <input
          type="number"
          id="subscriptionCost"
          value={cost}
          onChange={(e) => setCost(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="paymentFrequency" className="block text-sm font-medium text-gray-700">Payment Frequency</label>
        <select
          id="paymentFrequency"
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option>Monthly</option>
          <option>Yearly</option>
        </select>
      </div>

      <div>
        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
        <input
          type="date"
          id="startDate"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Add Subscription
      </button>
    </form>
  );
};

export default AddSubscriptionForm;
