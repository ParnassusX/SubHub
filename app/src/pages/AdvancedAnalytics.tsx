// Advanced Analytics Dashboard for SubHub
// Comprehensive analytics with interactive filters, responsive design, and accessibility

import React, { useState, useMemo, useCallback } from 'react';
import { useSubscriptions } from '../contexts/SubscriptionContext';
import { AdvancedAnalyticsService, AnalyticsFilters } from '../services/advancedAnalyticsService';
import {
  GrowthMetricsChart,
  SpendingPredictionChart,
  EnhancedCategoryChart,
  AdvancedTrendsChart,
  SubscriptionLifecycleChart
} from '../components/analytics/AdvancedCharts';
import ResponsiveCard from '../components/dashboard/ResponsiveCard';
import { Download, Filter, TrendingUp, BarChart3, PieChart, Activity } from 'lucide-react';
import { useCurrency } from '../hooks/useCurrency';

interface DateRange {
  start: Date;
  end: Date;
  label: string;
}

const AdvancedAnalytics: React.FC = () => {
  const { subscriptions } = useSubscriptions();
  const { formatPrice } = useCurrency();

  // State for filters and controls
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>({
    start: new Date(new Date().getFullYear(), 0, 1), // Start of year
    end: new Date(),
    label: 'This Year'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [activeView, setActiveView] = useState<'overview' | 'trends' | 'categories' | 'lifecycle'>('overview');

  // Predefined date ranges
  const dateRanges: DateRange[] = [
    {
      start: new Date(new Date().setDate(new Date().getDate() - 30)),
      end: new Date(),
      label: 'Last 30 Days'
    },
    {
      start: new Date(new Date().setDate(new Date().getDate() - 90)),
      end: new Date(),
      label: 'Last 3 Months'
    },
    {
      start: new Date(new Date().getFullYear(), 0, 1),
      end: new Date(),
      label: 'This Year'
    },
    {
      start: new Date(new Date().getFullYear() - 1, 0, 1),
      end: new Date(new Date().getFullYear() - 1, 11, 31),
      label: 'Last Year'
    }
  ];

  // Get unique categories for filtering
  const availableCategories = useMemo(() => {
    const categories = [...new Set(subscriptions.map(sub => sub.category))];
    return categories.sort();
  }, [subscriptions]);

  // Create analytics filters
  const analyticsFilters: AnalyticsFilters = useMemo(() => ({
    dateRange: {
      start: dateRange.start,
      end: dateRange.end
    },
    categories: selectedCategories.length > 0 ? selectedCategories : undefined
  }), [dateRange, selectedCategories]);

  // Generate analytics data
  const analyticsData = useMemo(() => {
    return AdvancedAnalyticsService.getAnalytics(subscriptions, analyticsFilters);
  }, [subscriptions, analyticsFilters]);

  // Handle category filter toggle
  const toggleCategory = useCallback((category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  }, []);

  // Handle export functionality
  const handleExport = useCallback(async (format: 'json' | 'csv') => {
    try {
      const exportData = AdvancedAnalyticsService.exportAnalytics(subscriptions, analyticsFilters, format);
      
      const blob = new Blob(
        [typeof exportData === 'string' ? exportData : JSON.stringify(exportData, null, 2)],
        { type: format === 'csv' ? 'text/csv' : 'application/json' }
      );
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `subhub-analytics-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  }, [subscriptions, analyticsFilters]);

  // Summary metrics for quick overview
  const summaryMetrics = [
    {
      label: 'Total Monthly Spending',
      value: formatPrice(analyticsData.totalMonthlySpending),
      change: analyticsData.growthMetrics.monthOverMonth.changePercentage,
      icon: <TrendingUp className="w-5 h-5" />
    },
    {
      label: 'Active Subscriptions',
      value: analyticsData.subscriptionCount.toString(),
      change: analyticsData.subscriptionLifecycle.netGrowth,
      icon: <BarChart3 className="w-5 h-5" />
    },
    {
      label: 'Average Cost',
      value: formatPrice(analyticsData.averageSubscriptionCost),
      change: analyticsData.spendingVelocity,
      icon: <PieChart className="w-5 h-5" />
    },
    {
      label: 'Churn Rate',
      value: `${analyticsData.subscriptionLifecycle.churnRate.toFixed(1)}%`,
      change: -analyticsData.subscriptionLifecycle.churnRate, // Negative is good
      icon: <Activity className="w-5 h-5" />
    }
  ];

  return (
    <div className="min-h-screen bg-[#0f1a24] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Advanced Analytics
            </h1>
            <p className="text-gray-400 mt-1">
              Comprehensive insights into your subscription spending patterns
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-[#20364b] text-white rounded-lg hover:bg-[#2e4e6b] transition-colors"
              aria-label="Toggle filters"
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
            </button>
            
            <div className="relative">
              <button
                onClick={() => handleExport('json')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                aria-label="Export analytics data"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <ResponsiveCard className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Filters</h3>
            
            {/* Date Range Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Date Range</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {dateRanges.map((range) => (
                  <button
                    key={range.label}
                    onClick={() => setDateRange(range)}
                    className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                      dateRange.label === range.label
                        ? 'bg-blue-600 text-white'
                        : 'bg-[#2e4e6b] text-gray-300 hover:bg-[#3e5e7b]'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Categories</label>
              <div className="flex flex-wrap gap-2">
                {availableCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => toggleCategory(category)}
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                      selectedCategories.includes(category)
                        ? 'bg-blue-600 text-white'
                        : 'bg-[#2e4e6b] text-gray-300 hover:bg-[#3e5e7b]'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </ResponsiveCard>
        )}

        {/* Summary Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryMetrics.map((metric, index) => (
            <ResponsiveCard key={index} className="p-4">
              <div className="flex items-center justify-between">
                <div className="text-gray-400">
                  {metric.icon}
                </div>
                <div className={`text-sm font-medium ${
                  metric.change > 0 ? 'text-green-400' : 
                  metric.change < 0 ? 'text-red-400' : 'text-gray-400'
                }`}>
                  {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
                </div>
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold text-white">{metric.value}</div>
                <div className="text-sm text-gray-400">{metric.label}</div>
              </div>
            </ResponsiveCard>
          ))}
        </div>

        {/* View Selector */}
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'trends', label: 'Trends' },
            { key: 'categories', label: 'Categories' },
            { key: 'lifecycle', label: 'Lifecycle' }
          ].map((view) => (
            <button
              key={view.key}
              onClick={() => setActiveView(view.key as any)}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                activeView === view.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#2e4e6b] text-gray-300 hover:bg-[#3e5e7b]'
              }`}
            >
              {view.label}
            </button>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="space-y-6">
          {activeView === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <GrowthMetricsChart data={analyticsData.growthMetrics} />
              <SpendingPredictionChart 
                data={analyticsData.spendingPrediction}
                currentSpending={analyticsData.totalMonthlySpending}
              />
            </div>
          )}

          {activeView === 'trends' && (
            <AdvancedTrendsChart data={analyticsData.spendingTrends} />
          )}

          {activeView === 'categories' && (
            <EnhancedCategoryChart data={analyticsData.categoryBreakdown} />
          )}

          {activeView === 'lifecycle' && (
            <SubscriptionLifecycleChart data={analyticsData.subscriptionLifecycle} />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvancedAnalytics;
