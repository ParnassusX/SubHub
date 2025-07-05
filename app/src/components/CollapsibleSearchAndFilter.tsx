// Collapsible SearchAndFilter Component for SubHub
// Provides advanced filtering in a non-intrusive, collapsible interface

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Filter } from 'lucide-react';
import SearchAndFilter from './SearchAndFilter';
import { Subscription } from '../contexts/SubscriptionContext';

interface CollapsibleSearchAndFilterProps {
  onFilteredResults: (results: Subscription[]) => void;
  className?: string;
}

const CollapsibleSearchAndFilter: React.FC<CollapsibleSearchAndFilterProps> = ({
  onFilteredResults,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Collapsible Header */}
      <button
        onClick={toggleExpanded}
        className="w-full flex items-center justify-between p-4 bg-[#20364b] hover:bg-[#2e4e6b] 
                   rounded-lg transition-colors duration-200 text-white"
        aria-expanded={isExpanded}
        aria-controls="search-filter-content"
      >
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-blue-400" />
          <span className="font-medium">Advanced Filters</span>
          <span className="text-sm text-gray-400">
            {isExpanded ? 'Hide filters' : 'Show search and filtering options'}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>

      {/* Collapsible Content */}
      <div
        id="search-filter-content"
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded 
            ? 'max-h-[800px] opacity-100 mt-4' 
            : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-[#1a2332] rounded-lg border border-[#2e4e6b] p-4">
          <SearchAndFilter onFilteredResults={onFilteredResults} />
        </div>
      </div>

      {/* Quick Filter Indicators (when collapsed) */}
      {!isExpanded && (
        <div className="mt-2 flex flex-wrap gap-2">
          <div className="text-xs text-gray-500 px-2 py-1 bg-[#1a2332] rounded">
            💡 Click above to access search, category filters, date ranges, and more
          </div>
        </div>
      )}
    </div>
  );
};

export default CollapsibleSearchAndFilter;
