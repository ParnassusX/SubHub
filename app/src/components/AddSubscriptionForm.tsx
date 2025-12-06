import React, { useState, useEffect } from 'react';
import { useSubscriptions } from '../contexts/SubscriptionContext';
import { useCategories } from '../hooks/useCategories';
import { AlertCircle, X, Image as ImageIcon } from 'lucide-react';
import { ComponentLoader } from './UnifiedLoading';
import { LogoService } from '../services/logoService';

const AddSubscriptionForm: React.FC = () => {
  const { addSubscription, isLoading } = useSubscriptions();
  const { categories, loading: categoriesLoading } = useCategories();
  const [name, setName] = useState('');
  const [cost, setCost] = useState('');
  const [frequency, setFrequency] = useState<'Monthly' | 'Yearly'>('Monthly');
  const [category, setCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [isFetchingLogo, setIsFetchingLogo] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set default category when categories load
  useEffect(() => {
    if (categories.length > 0 && !category) {
      setCategory(categories[0].name);
    }
  }, [categories, category]);

  // Auto-fetch logo when name or website changes
  useEffect(() => {
    const fetchLogo = async () => {
      if (name.length >= 3 || website) {
        setIsFetchingLogo(true);
        try {
          const logo = await LogoService.fetchLogo(name, website);
          setLogoUrl(logo);
        } catch (err) {
          console.error('Failed to fetch logo:', err);
        } finally {
          setIsFetchingLogo(false);
        }
      }
    };

    // Debounce logo fetching
    const timer = setTimeout(fetchLogo, 500);
    return () => clearTimeout(timer);
  }, [name, website]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !cost || !startDate || !category) {
      setError('Please fill in all required fields.');
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
        logo_url: logoUrl || undefined,
      });

      // Reset form fields
      setName('');
      setCost('');
      setFrequency('Monthly');
      setCategory('Entertainment');
      setStartDate('');
      setDescription('');
      setWebsite('');
      setLogoUrl('');
    } catch (error) {
      setError('Failed to add subscription. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-gray-800 shadow-lg rounded-lg border border-gray-700 animate-fade-in-up">
      <h2 className="text-xl font-semibold text-white mb-4">Add New Subscription</h2>

      {/* Error Display */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-900/20 border border-red-600 rounded-lg animate-shake">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 animate-pulse" />
          <p className="text-red-300 text-sm">{error}</p>
          <button
            type="button"
            onClick={() => setError(null)}
            className="ml-auto text-red-400 hover:text-red-300 transition-smooth"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div>
        <label htmlFor="subscriptionName" className="block text-sm font-medium text-gray-300">
          Subscription Name
        </label>
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            {isFetchingLogo ? (
              <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center animate-pulse">
                <ImageIcon className="w-6 h-6 text-gray-400" />
              </div>
            ) : logoUrl ? (
              <img 
                src={logoUrl} 
                alt={name || 'Service logo'} 
                className="w-12 h-12 rounded-lg object-cover border border-gray-600"
                onError={(e) => {
                  e.currentTarget.src = LogoService.generateLetterAvatar(name || 'S');
                }}
              />
            ) : (
              <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-gray-400" />
              </div>
            )}
          </div>
          <input
            type="text"
            id="subscriptionName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 block px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="e.g., Netflix, Spotify"
          />
        </div>
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
        {categoriesLoading ? (
          <ComponentLoader message="Loading categories..." />
        ) : (
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            {categories.length === 0 ? (
              <option disabled>No categories available</option>
            ) : (
              categories.map(cat => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))
            )}
          </select>
        )}
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
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-smooth hover-lift"
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <span className="animate-spin">⟳</span> Adding...
          </span>
        ) : (
          'Add Subscription'
        )}
      </button>
    </form>
  );
};

export default AddSubscriptionForm;
