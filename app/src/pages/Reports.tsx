import React, { useMemo } from 'react';
import { useSubscriptions } from '../contexts/SubscriptionContext';
import { useNavigate } from 'react-router-dom';
import { generateAnalytics } from '../utils/analyticsEngine';
import { 
  SpendingTrendsChart, 
  CategoryBreakdownChart, 
  RenewalForecastChart,
  SubscriptionCountChart 
} from '../components/EnhancedCharts';
import { 
  SavingsOpportunities, 
  TopSubscriptionsTable, 
  YearOverYearComparison 
} from '../components/AdvancedInsights';
import { SummaryCard } from '../components/InsightCards';

const Reports: React.FC = () => {
  const { subscriptions } = useSubscriptions();
  const navigate = useNavigate();

  // Generate comprehensive analytics
  const analytics = useMemo(() => generateAnalytics(subscriptions), [subscriptions]);

  // Handle empty state
  if (subscriptions.length === 0) {
    return (
      <div className="flex-1 bg-[#0f1a24] h-full overflow-y-auto overflow-x-hidden">
        <div className="w-full max-w-full min-w-0">
          <div className="flex flex-wrap justify-between gap-3 p-4 sm:p-6 w-full max-w-full">
            <h1 className="text-white tracking-light text-2xl sm:text-[32px] font-bold leading-tight min-w-0">Reports & Analytics</h1>
          </div>
          
          <div className="p-4 sm:p-6">
            <div className="bg-[#1a2332] rounded-xl border border-[#2e4e6b] p-8 text-center">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-white mb-4">No Data to Analyze</h3>
              <p className="text-gray-400 mb-6">
                Add some subscriptions to see detailed analytics, spending trends, and savings opportunities.
              </p>
              <button
                onClick={() => navigate('/subscriptions')}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Add Your First Subscription
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main analytics dashboard
  return (
    <div className="flex-1 bg-[#0f1a24] h-full overflow-y-auto overflow-x-hidden">
      <div className="w-full max-w-full min-w-0">
        {/* Header */}
        <div className="flex flex-wrap justify-between gap-3 p-4 sm:p-6 w-full max-w-full">
          <h1 className="text-white tracking-light text-2xl sm:text-[32px] font-bold leading-tight min-w-0">Reports & Analytics</h1>
        </div>

        {/* Summary Cards */}
        <div className="px-4 sm:px-6 mb-6">
          <h2 className="text-white text-xl font-bold mb-4">Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard
              title="Total Monthly"
              value={analytics.totalMonthlySpending}
              subtitle="Current spending"
              icon="💰"
            />
            <SummaryCard
              title="Total Yearly"
              value={analytics.totalYearlySpending}
              subtitle="Projected annual"
              icon="📅"
            />
            <SummaryCard
              title="Active Subscriptions"
              value={analytics.subscriptionCount}
              subtitle="Currently tracked"
              icon="📱"
            />
            <SummaryCard
              title="Average Monthly"
              value={analytics.averageMonthlySpending}
              subtitle="Per subscription"
              icon="📊"
            />
          </div>
        </div>

        {/* Charts Section */}
        <div className="px-4 sm:px-6 mb-6">
          <h2 className="text-white text-xl font-bold mb-4">Spending Analysis</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SpendingTrendsChart data={analytics.spendingTrends} />
            <CategoryBreakdownChart data={analytics.categoryBreakdown} />
          </div>
        </div>

        {/* Additional Charts */}
        <div className="px-4 sm:px-6 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RenewalForecastChart data={analytics.renewalForecast} />
            <SubscriptionCountChart data={analytics.spendingTrends} />
          </div>
        </div>

        {/* Insights Section */}
        <div className="px-4 sm:px-6 mb-6">
          <h2 className="text-white text-xl font-bold mb-4">Insights & Opportunities</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SavingsOpportunities opportunities={analytics.savingsOpportunities} />
            <YearOverYearComparison data={analytics.yearOverYear} />
          </div>
        </div>

        {/* Detailed Analysis */}
        <div className="px-4 sm:px-6 mb-6">
          <h2 className="text-white text-xl font-bold mb-4">Detailed Analysis</h2>
          <div className="space-y-6">
            <TopSubscriptionsTable data={analytics.topSubscriptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
