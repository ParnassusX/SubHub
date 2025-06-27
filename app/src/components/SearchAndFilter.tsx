import React, { useState, useMemo } from 'react';
import { useSubscriptions } from '../contexts/SubscriptionContext';

interface SearchAndFilterProps {
  onFilteredResults: (filteredSubscriptions: any[]) => void;
}

const SearchAndFilter: React.FC<SearchAndFilterProps> = ({ onFilteredResults }) => {
  const { subscriptions } = useSubscriptions();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedFrequency, setSelectedFrequency] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [costRange, setCostRange] = useState({ min: '', max: '' });

  // Get unique categories
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(subscriptions.map(sub => sub.category))];
    return uniqueCategories.sort();
  }, [subscriptions]);

  // Filter and sort subscriptions
  const filteredSubscriptions = useMemo(() => {
    let filtered = subscriptions.filter(subscription => {
      // Search term filter
      const matchesSearch = searchTerm === '' || 
        subscription.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subscription.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subscription.category.toLowerCase().includes(searchTerm.toLowerCase());

      // Category filter
      const matchesCategory = selectedCategory === '' || subscription.category === selectedCategory;

      // Frequency filter
      const matchesFrequency = selectedFrequency === '' || subscription.frequency === selectedFrequency;

      // Cost range filter
      const monthlyCost = subscription.frequency === 'Monthly' ? subscription.cost : subscription.cost / 12;
      const matchesCostMin = costRange.min === '' || monthlyCost >= parseFloat(costRange.min);
      const matchesCostMax = costRange.max === '' || monthlyCost <= parseFloat(costRange.max);

      return matchesSearch && matchesCategory && matchesFrequency && matchesCostMin && matchesCostMax;
    });

    // Sort results
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'cost':
          aValue = a.frequency === 'Monthly' ? a.cost : a.cost / 12;
          bValue = b.frequency === 'Monthly' ? b.cost : b.cost / 12;
          break;
        case 'category':
          aValue = a.category.toLowerCase();
          bValue = b.category.toLowerCase();
          break;
        case 'startDate':
          aValue = new Date(a.startDate);
          bValue = new Date(b.startDate);
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [subscriptions, searchTerm, selectedCategory, selectedFrequency, sortBy, sortOrder, costRange]);

  // Update parent component with filtered results
  React.useEffect(() => {
    onFilteredResults(filteredSubscriptions);
  }, [filteredSubscriptions, onFilteredResults]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedFrequency('');
    setSortBy('name');
    setSortOrder('asc');
    setCostRange({ min: '', max: '' });
  };

  const hasActiveFilters = searchTerm || selectedCategory || selectedFrequency || costRange.min || costRange.max;

  return (
    <div className="bg-[#20364b] rounded-xl border border-[#2e4e6b] p-4 mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-300 mb-2">Search</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, description, or category..."
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>

        {/* Category Filter */}
        <div className="w-full lg:w-48">
          <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        {/* Frequency Filter */}
        <div className="w-full lg:w-32">
          <label className="block text-sm font-medium text-gray-300 mb-2">Frequency</label>
          <select
            value={selectedFrequency}
            onChange={(e) => setSelectedFrequency(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="">All</option>
            <option value="Monthly">Monthly</option>
            <option value="Yearly">Yearly</option>
          </select>
        </div>
      </div>

      {/* Second Row */}
      <div className="flex flex-col lg:flex-row gap-4 mt-4">
        {/* Cost Range */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-300 mb-2">Monthly Cost Range</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={costRange.min}
              onChange={(e) => setCostRange(prev => ({ ...prev, min: e.target.value }))}
              placeholder="Min"
              min="0"
              step="0.01"
              className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
            <span className="text-gray-400 self-center">to</span>
            <input
              type="number"
              value={costRange.max}
              onChange={(e) => setCostRange(prev => ({ ...prev, max: e.target.value }))}
              placeholder="Max"
              min="0"
              step="0.01"
              className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
        </div>

        {/* Sort By */}
        <div className="w-full lg:w-40">
          <label className="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="name">Name</option>
            <option value="cost">Cost</option>
            <option value="category">Category</option>
            <option value="startDate">Start Date</option>
          </select>
        </div>

        {/* Sort Order */}
        <div className="w-full lg:w-32">
          <label className="block text-sm font-medium text-gray-300 mb-2">Order</label>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="asc">A-Z / Low-High</option>
            <option value="desc">Z-A / High-Low</option>
          </select>
        </div>

        {/* Clear Filters */}
        <div className="w-full lg:w-auto">
          <label className="block text-sm font-medium text-gray-300 mb-2">&nbsp;</label>
          <button
            onClick={clearFilters}
            disabled={!hasActiveFilters}
            className="w-full lg:w-auto px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Results Summary */}
      <div className="mt-4 pt-4 border-t border-gray-600">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <p className="text-gray-400 text-sm">
            Showing {filteredSubscriptions.length} of {subscriptions.length} subscriptions
          </p>
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2">
              {searchTerm && (
                <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                  Search: "{searchTerm}"
                </span>
              )}
              {selectedCategory && (
                <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full">
                  Category: {selectedCategory}
                </span>
              )}
              {selectedFrequency && (
                <span className="px-2 py-1 bg-purple-600 text-white text-xs rounded-full">
                  {selectedFrequency}
                </span>
              )}
              {(costRange.min || costRange.max) && (
                <span className="px-2 py-1 bg-orange-600 text-white text-xs rounded-full">
                  Cost: ${costRange.min || '0'} - ${costRange.max || '∞'}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchAndFilter;
