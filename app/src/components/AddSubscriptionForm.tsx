import React, { useState } from 'react';
import { useSubscriptions } from '../contexts/SubscriptionContext';

const AddSubscriptionForm: React.FC = () => {
  const { addSubscription, isLoading } = useSubscriptions();
  const [name, setName] = useState('');
  const [cost, setCost] = useState('');
  const [frequency, setFrequency] = useState<'Monthly' | 'Yearly'>('Monthly');
  const [category, setCategory] = useState('Entertainment');
  const [startDate, setStartDate] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !cost || !startDate || !category) {
      alert('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      await addSubscription({
        name,
        cost: parseFloat(cost),
        frequency,
        category,
        startDate,
        description: description || undefined,
        website: website || undefined,
      });

      // Reset form fields
      setName('');
      setCost('');
      setFrequency('Monthly');
      setCategory('Entertainment');
      setStartDate('');
      setDescription('');
      setWebsite('');
    } catch (error) {
      alert('Failed to add subscription. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-gray-800 shadow-lg rounded-lg border border-gray-700">
      <h2 className="text-xl font-semibold text-white mb-4">Add New Subscription</h2>
      
      <div>
        <label htmlFor="subscriptionName" className="block text-sm font-medium text-gray-300">
          Subscription Name
        </label>
        <input
          type="text"
          id="subscriptionName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="e.g., Netflix, Spotify"
        />
      </div>

      <div>
        <label htmlFor="subscriptionCost" className="block text-sm font-medium text-gray-300">
          Cost ($)
        </label>
        <input
          type="number"
          id="subscriptionCost"
          value={cost}
          onChange={(e) => setCost(e.target.value)}
          step="0.01"
          min="0"
          className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="9.99"
        />
      </div>

      <div>
        <label htmlFor="paymentFrequency" className="block text-sm font-medium text-gray-300">
          Payment Frequency
        </label>
        <select
          id="paymentFrequency"
          value={frequency}
          onChange={(e) => setFrequency(e.target.value as 'Monthly' | 'Yearly')}
          className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        >
          <option value="Monthly">Monthly</option>
          <option value="Yearly">Yearly</option>
        </select>
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-300">
          Category
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        >
          <option value="Entertainment">Entertainment</option>
          <option value="Productivity">Productivity</option>
          <option value="Health & Fitness">Health & Fitness</option>
          <option value="News & Media">News & Media</option>
          <option value="Cloud Storage">Cloud Storage</option>
          <option value="Software">Software</option>
          <option value="Music">Music</option>
          <option value="Gaming">Gaming</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-300">
          Description (Optional)
        </label>
        <input
          type="text"
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="Brief description"
        />
      </div>

      <div>
        <label htmlFor="website" className="block text-sm font-medium text-gray-300">
          Website (Optional)
        </label>
        <input
          type="url"
          id="website"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="https://example.com"
        />
      </div>

      <div>
        <label htmlFor="startDate" className="block text-sm font-medium text-gray-300">
          Start Date
        </label>
        <input
          type="date"
          id="startDate"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting || isLoading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
      >
        {isSubmitting ? 'Adding...' : 'Add Subscription'}
      </button>
    </form>
  );
};

export default AddSubscriptionForm;
