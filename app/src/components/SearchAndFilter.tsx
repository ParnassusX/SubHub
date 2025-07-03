import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useSubscriptions } from '../contexts/SubscriptionContext';

interface DateRange {
  start: string;
  end: string;
}

interface SearchAndFilterProps {
  onFilteredResults: (filteredSubscriptions: any[]) => void;
}

const SearchAndFilter: React.FC<SearchAndFilterProps> = ({ onFilteredResults }) => {
  const { subscriptions } = useSubscriptions();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedFrequency, setSelectedFrequency] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [costRange, setCostRange] = useState({ min: '', max: '' });
  const [dateRange, setDateRange] = useState<DateRange>({ start: '', end: '' });
  const [dateFilterType, setDateFilterType] = useState<'startDate' | 'createdAt'>('startDate');

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Get unique categories
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(subscriptions.map(sub => sub.category))];
    return uniqueCategories.sort();
  }, [subscriptions]);

  // Filter and sort subscriptions
  const filteredSubscriptions = useMemo(() => {
    let filtered = subscriptions.filter(subscription => {
      // Search term filter (debounced)
      const matchesSearch = debouncedSearchTerm === '' ||
        subscription.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        subscription.description?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        subscription.category.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

      // Multi-category filter
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(subscription.category);

      // Frequency filter
      const matchesFrequency = selectedFrequency === '' || subscription.frequency === selectedFrequency;

      // Cost range filter
      const monthlyCost = subscription.frequency === 'Monthly' ? subscription.cost : subscription.cost / 12;
      const matchesCostMin = costRange.min === '' || monthlyCost >= parseFloat(costRange.min);
      const matchesCostMax = costRange.max === '' || monthlyCost <= parseFloat(costRange.max);

      // Date range filter
      let matchesDateRange = true;
      if (dateRange.start || dateRange.end) {
        const dateToCheck = dateFilterType === 'startDate' ? subscription.startDate : subscription.created_at;
        if (dateToCheck) {
          const subscriptionDate = new Date(dateToCheck);
          if (dateRange.start) {
            const startDate = new Date(dateRange.start);
            matchesDateRange = matchesDateRange && subscriptionDate >= startDate;
          }
          if (dateRange.end) {
            const endDate = new Date(dateRange.end);
            matchesDateRange = matchesDateRange && subscriptionDate <= endDate;
          }
        } else {
          matchesDateRange = false;
        }
      }

      return matchesSearch && matchesCategory && matchesFrequency && matchesCostMin && matchesCostMax && matchesDateRange;
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
  }, [subscriptions, debouncedSearchTerm, selectedCategories, selectedFrequency, sortBy, sortOrder, costRange, dateRange, dateFilterType]);

  // Update parent component with filtered results
  React.useEffect(() => {
    onFilteredResults(filteredSubscriptions);
  }, [filteredSubscriptions, onFilteredResults]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategories([]);
    setSelectedFrequency('');
    setSortBy('name');
    setSortOrder('asc');
    setCostRange({ min: '', max: '' });
    setDateRange({ start: '', end: '' });
  };

  const hasActiveFilters = searchTerm || selectedCategories.length > 0 || selectedFrequency || costRange.min || costRange.max || dateRange.start || dateRange.end;

  // Multi-category management functions
  const toggleCategory = useCallback((category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  }, []);

  const removeCategory = useCallback((category: string) => {
    setSelectedCategories(prev => prev.filter(c => c !== category));
  }, []);

  // Date range presets
  const setDatePreset = useCallback((preset: string) => {
    const today = new Date();
    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    switch (preset) {
      case 'last30':
        const last30 = new Date(today);
        last30.setDate(today.getDate() - 30);
        setDateRange({ start: formatDate(last30), end: formatDate(today) });
        break;
      case 'thisMonth':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        setDateRange({ start: formatDate(monthStart), end: formatDate(today) });
        break;
      case 'lastMonth':
        const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
        setDateRange({ start: formatDate(lastMonthStart), end: formatDate(lastMonthEnd) });
        break;
      case 'thisYear':
        const yearStart = new Date(today.getFullYear(), 0, 1);
        setDateRange({ start: formatDate(yearStart), end: formatDate(today) });
        break;
      default:
        setDateRange({ start: '', end: '' });
    }
  }, []);

  return (
    <div className="bg-[#20364b] rounded-xl border border-[#2e4e6b] mb-6 w-full max-w-full overflow-hidden">
      {/* Search Header */}
      <div className="p-4 border-b border-[#2e4e6b]">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
          <div className="flex-1 min-w-0">
            <label className="block text-sm font-medium text-gray-300 mb-2">Search Subscriptions</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, description, or category..."
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm whitespace-nowrap"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Filters Section */}
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

          {/* Multi-Category Filter */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">Categories</label>
            <select
              onChange={(e) => {
                if (e.target.value && !selectedCategories.includes(e.target.value)) {
                  toggleCategory(e.target.value);
                }
                e.target.value = '';
              }}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              value=""
            >
              <option value="">Add Category...</option>
              {categories.filter(cat => !selectedCategories.includes(cat)).map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            {/* Selected Categories Chips */}
            {selectedCategories.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {selectedCategories.map(category => (
                  <span
                    key={category}
                    className="inline-flex items-center px-2 py-1 bg-blue-600 text-white text-xs rounded-full"
                  >
                    {category}
                    <button
                      onClick={() => removeCategory(category)}
                      className="ml-1 text-blue-200 hover:text-white focus:outline-none"
                      aria-label={`Remove ${category} filter`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Frequency Filter */}
          <div className="w-full sm:w-auto sm:min-w-[100px] lg:min-w-[120px]">
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
          {/* Cost Range Filter */}
          <div className="space-y-2">
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

          {/* Sort Controls */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">Sort</label>
            <div className="flex gap-1">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 px-2 py-2 bg-gray-700 border border-gray-600 rounded-l-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="name">Name</option>
                <option value="cost">Cost</option>
                <option value="category">Category</option>
                <option value="startDate">Start Date</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-2 py-2 bg-gray-600 border border-gray-600 rounded-r-md text-white hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>

        {/* Advanced Filters Section */}
        <div className="border-t border-[#2e4e6b] pt-4">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Advanced Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date Range Filter */}
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                <label className="block text-sm font-medium text-gray-300">Date Range</label>
                <select
                  value={dateFilterType}
                  onChange={(e) => setDateFilterType(e.target.value as 'startDate' | 'createdAt')}
                  className="text-xs px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="startDate">Start Date</option>
                  <option value="createdAt">Created Date</option>
                </select>
              </div>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
                <span className="text-gray-400 self-center">to</span>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
              {/* Date Presets */}
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => setDatePreset('last30')}
                  className="px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  Last 30 Days
                </button>
                <button
                  onClick={() => setDatePreset('thisMonth')}
                  className="px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  This Month
                </button>
                <button
                  onClick={() => setDatePreset('thisYear')}
                  className="px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  This Year
                </button>
                <button
                  onClick={() => setDatePreset('')}
                  className="px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
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
              {selectedCategories.length > 0 && (
                <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full">
                  Categories: {selectedCategories.length}
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
              {(dateRange.start || dateRange.end) && (
                <span className="px-2 py-1 bg-indigo-600 text-white text-xs rounded-full">
                  {dateFilterType === 'startDate' ? 'Start' : 'Created'}: {dateRange.start || '...'} - {dateRange.end || '...'}
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
