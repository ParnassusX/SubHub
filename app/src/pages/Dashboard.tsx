import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscriptions } from '../contexts/SubscriptionContext';
import { useAuth } from '../contexts/AuthContext';
import { useDashboardStats } from '../hooks/useDashboardStats';

import { getCategoryHex } from '../utils/categoryColors';
import { useCurrency } from '../hooks/useCurrency';

import OfflineIndicator from '../components/OfflineIndicator';
import UpcomingRenewals from '../components/notifications/UpcomingRenewals';
import SpendingAlerts from '../components/notifications/SpendingAlerts';
import UnusedSubscriptions from '../components/notifications/UnusedSubscriptions';
import SmartScheduling from '../components/notifications/SmartScheduling';
import HeroMetrics from '../components/dashboard/HeroMetrics';
import CriticalAlerts from '../components/dashboard/CriticalAlerts';
import ExpandableSection from '../components/dashboard/ExpandableSection';
import ResponsiveCard from '../components/dashboard/ResponsiveCard';
import TourOverlay from '../components/tour/TourOverlay';
import TourTrigger from '../components/tour/TourTrigger';
import { useBudget } from '../hooks/useBudget';
import FeatureHighlight from '../components/tour/FeatureHighlight';
import HelpTooltip from '../components/help/HelpTooltip';
import { HelpContentManager } from '../data/helpContent';

// Feature flags for UX elements
import { isFeatureEnabled } from '../config/featureFlags';

import { useNavigate } from 'react-router-dom';

// interface DashboardStats {
//   totalSubscriptions: number;
//   monthlySpending: number;
//   yearlySpending: number;
//   upcomingRenewals: number;
//   notificationsCount: number;
// }

const Dashboard: React.FC = () => {
  const { subscriptions, isLoading: subscriptionsLoading } = useSubscriptions();
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const {
    monthlyBudget,
    monthlySpending,
    budgetSummary,
    isLoading: budgetLoading,
    error: budgetError
  } = useBudget();
  const navigate = useNavigate();

  // Add timeout protection for budget loading
  const [budgetTimeout, setBudgetTimeout] = useState(false);
  useEffect(() => {
    if (budgetLoading) {
      const timer = setTimeout(() => {
        setBudgetTimeout(true);
      }, 8000); // 8 second timeout
      return () => clearTimeout(timer);
    } else {
      setBudgetTimeout(false);
    }
  }, [budgetLoading]);




  // Load dashboard stats and insights
  const { data: stats, isLoading } = useDashboardStats();



  if (isLoading || subscriptionsLoading || !stats) {
    return (
      <div className="flex-1 bg-background-primary h-full overflow-y-auto overflow-x-hidden">
        <div className="w-full max-w-full min-w-0">
          <div className="w-full max-w-full min-w-0 p-4 sm:p-6">
            <div className="space-y-6 sm:space-y-8 lg:space-y-10 w-full max-w-full">
          {/* Loading Header */}
          <div className="glass-card p-8 gradient-primary animate-pulse">
            <div className="skeleton h-10 w-64 mb-3"></div>
            <div className="skeleton h-6 w-48"></div>
          </div>

          {/* Loading Insights */}
          <section>
            <div className="skeleton h-8 w-32 mb-6"></div>
            <div className="dashboard-grid lg:grid-cols-2">
              <div className="glass-card p-6 animate-pulse">
                <div className="flex items-start space-x-4 mb-6">
                  <div className="skeleton h-12 w-12 rounded-xl"></div>
                  <div className="flex-1">
                    <div className="skeleton h-6 w-32 mb-2"></div>
                    <div className="skeleton h-4 w-48"></div>
                  </div>
                </div>
                <div className="skeleton h-16 w-full rounded-lg"></div>
              </div>
              <div className="glass-card p-6 animate-pulse">
                <div className="flex items-start space-x-4 mb-6">
                  <div className="skeleton h-12 w-12 rounded-xl"></div>
                  <div className="flex-1">
                    <div className="skeleton h-6 w-32 mb-2"></div>
                    <div className="skeleton h-4 w-48"></div>
                  </div>
                </div>
                <div className="skeleton h-16 w-full rounded-lg"></div>
              </div>
            </div>
          </section>

          {/* Loading Summary Cards */}
          <section>
            <div className="skeleton h-8 w-24 mb-6"></div>
            <div className="dashboard-grid sm:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="elevated-card p-6 animate-pulse">
                  <div className="flex items-center justify-between mb-4">
                    <div className="skeleton h-5 w-24"></div>
                    <div className="skeleton h-8 w-8 rounded-lg"></div>
                  </div>
                  <div className="skeleton h-8 w-20 mb-3"></div>
                  <div className="skeleton h-4 w-32"></div>
                </div>
              ))}
            </div>
          </section>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#0f1a24] h-full overflow-y-auto overflow-x-hidden dashboard-overview">
      {/* Page Container with proper constraints */}
      <div className="w-full max-w-full min-w-0">
        {/* Header */}
        <div className="flex flex-wrap justify-between gap-3 p-4 sm:p-6 w-full max-w-full">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="flex items-center gap-2">
              <h1 className="text-white tracking-light text-2xl sm:text-[32px] font-bold leading-tight">
                Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}!
              </h1>
              <HelpTooltip
                content={HelpContentManager.getContent('dashboard_overview')?.content || ''}
                title="Dashboard Overview"
                position="bottom"
                variant="info"
                className="hidden sm:block"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Tour Trigger - Temporarily disabled to prevent UX conflicts */}
            {isFeatureEnabled('TOUR_TRIGGER_ENABLED') && (
              <TourTrigger variant="icon" size="md" className="hidden sm:flex" />
            )}
            <button
              onClick={() => navigate('/subscriptions?action=add')}
              className="bg-blue-600 hover:bg-blue-700 px-3 py-2 sm:px-4 sm:py-2 rounded-lg text-white text-sm font-medium transition-colors hidden sm:flex items-center gap-2 quick-actions"
            >
              ➕ Add Subscription
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="w-full max-w-full min-w-0 p-4 sm:p-6">
          {/* Offline Indicator */}
          <OfflineIndicator className="mb-4" />

          <div className="space-y-6 sm:space-y-8 w-full max-w-full">

            {/* Hero Section - Above the Fold */}
            <div className="subscription-overview">
              <HeroMetrics
                stats={{
                  totalSubscriptions: stats.total_subscriptions,
                  monthlySpending: stats.monthly_spending,
                  yearlySpending: stats.yearly_spending,
                  upcomingRenewals: stats.upcoming_renewals
                }}
                budgetStatus={{
                  monthlyBudget: (budgetTimeout || budgetError) ? 0 : (monthlyBudget || 0),
                  monthlySpent: monthlySpending,
                  budgetUtilization: (budgetTimeout || budgetError || !monthlyBudget) ? 0 : (monthlySpending / monthlyBudget) * 100,
                  status: (budgetTimeout || budgetError) ? 'no_budget' :
                         !monthlyBudget ? 'no_budget' :
                         (monthlySpending / monthlyBudget) >= 1 ? 'critical' :
                         (monthlySpending / monthlyBudget) >= 0.8 ? 'warning' : 'safe'
                }}
              />
            </div>

            {/* Critical Alerts Section */}
            <CriticalAlerts
              alerts={[
                // Real budget alerts from useBudget hook (only if not timed out or errored)
                ...(!budgetTimeout && !budgetError && budgetSummary?.alerts?.filter(alert =>
                  alert.threshold >= 90 // Only show critical alerts (90%+)
                ).map(alert => ({
                  id: `budget-alert-${alert.id}`,
                  type: 'budget_warning' as const,
                  title: alert.type === 'monthly_threshold' ? 'Monthly Budget Alert' :
                         alert.type === 'yearly_threshold' ? 'Yearly Budget Alert' : 'Category Budget Alert',
                  message: alert.message,
                  severity: alert.threshold >= 100 ? 'critical' as const : 'warning' as const,
                  actionLabel: 'Adjust Budget',
                  actionPath: '/settings'
                })) || []),
                // Add budget loading error alert
                ...(budgetTimeout ? [{
                  id: 'budget-timeout',
                  type: 'budget_warning' as const,
                  title: 'Budget Loading Issue',
                  message: 'Budget data is taking longer than expected to load. Please refresh the page.',
                  severity: 'warning' as const,
                  actionLabel: 'Refresh Page',
                  actionPath: window.location.pathname
                }] : []),
                // Add budget error alert
                ...(budgetError ? [{
                  id: 'budget-error',
                  type: 'budget_warning' as const,
                  title: 'Budget Connection Issue',
                  message: 'Unable to load budget data. Please check your connection and try again.',
                  severity: 'warning' as const,
                  actionLabel: 'Retry',
                  actionPath: '/settings'
                }] : []),
                // Add no budget set alert if no budget is configured and not loading/errored
                ...(!monthlyBudget && !budgetLoading && !budgetTimeout && !budgetError ? [{
                  id: 'no-budget-set',
                  type: 'budget_warning' as const,
                  title: 'No Budget Set',
                  message: 'Set up your monthly budget to track spending and get alerts',
                  severity: 'warning' as const,
                  actionLabel: 'Set Budget',
                  actionPath: '/settings'
                }] : [])
              ]}
              maxVisible={3}
            />

            {/* Progressive Disclosure - Below the Fold */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

              {/* Detailed Renewals Section */}
              <div className="upcoming-renewals">
                <ExpandableSection
                  title="Upcoming Renewals"
                  subtitle="Subscription renewals and expirations"
                  showItemCount={stats.upcoming_renewals}
                  previewContent={
                    <UpcomingRenewals maxItems={2} showProcessButton={false} />
                  }
                >
                  <UpcomingRenewals maxItems={10} showProcessButton={true} />
                </ExpandableSection>
              </div>

              {/* Detailed Spending Analysis */}
              <div className="spending-analytics">
                <ExpandableSection
                  title="Spending Analysis"
                  subtitle="Budget tracking and spending insights"
                  previewContent={
                    <SpendingAlerts maxItems={2} showProcessButton={false} />
                  }
                >
                  <SpendingAlerts maxItems={10} showProcessButton={true} />
                </ExpandableSection>
              </div>

              {/* Unused Subscriptions Analysis */}
              <ExpandableSection
                title="Usage Analysis"
                subtitle="Unused and underutilized subscriptions"
                previewContent={
                  <UnusedSubscriptions maxItems={2} showProcessButton={false} variant="compact" />
                }
              >
                <UnusedSubscriptions maxItems={10} showProcessButton={true} variant="full" />
              </ExpandableSection>

              {/* Smart Scheduling System */}
              <ExpandableSection
                title="Smart Scheduling"
                subtitle="Intelligent notification timing and batching"
                previewContent={
                  <SmartScheduling variant="compact" showProcessButton={false} />
                }
              >
                <SmartScheduling variant="full" showProcessButton={true} />
              </ExpandableSection>
            </div>

            {/* Recent Activity Section */}
            <ExpandableSection
              title="Recent Activity"
              subtitle="Latest subscription changes and updates"
              showItemCount={subscriptions.slice(0, 5).length}
              previewContent={
                <div className="space-y-3">
                  {subscriptions.slice(0, 3).map((subscription) => (
                    <ResponsiveCard key={subscription.id} variant="compact" padding="sm" hover>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: getCategoryHex(subscription.category) }}
                          >
                            <span className="text-white text-xs font-bold">
                              {subscription.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-white font-medium text-sm">{subscription.name}</p>
                            <p className="text-gray-400 text-xs">{subscription.category}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-bold text-sm">{formatPrice(subscription.cost)}</p>
                          <p className="text-gray-400 text-xs">{subscription.frequency}</p>
                        </div>
                      </div>
                    </ResponsiveCard>
                  ))}
                </div>
              }
            >
              <div className="space-y-3">
                {subscriptions.slice(0, 10).map((subscription) => (
                  <ResponsiveCard key={subscription.id} variant="compact" padding="sm" hover onClick={() => navigate('/subscriptions')}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: getCategoryHex(subscription.category) }}
                        >
                          <span className="text-white text-xs font-bold">
                            {subscription.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">{subscription.name}</p>
                          <p className="text-gray-400 text-xs">{subscription.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold text-sm">{formatPrice(subscription.cost)}</p>
                        <p className="text-gray-400 text-xs">{subscription.frequency}</p>
                      </div>
                    </div>
                  </ResponsiveCard>
                ))}
                <ResponsiveCard variant="compact" padding="sm" hover onClick={() => navigate('/subscriptions')}>
                  <div className="text-center">
                    <p className="text-blue-400 text-sm font-medium">View All Subscriptions →</p>
                  </div>
                </ResponsiveCard>
              </div>
            </ExpandableSection>

            {/* Mobile Quick Action */}
            <div className="lg:hidden fixed bottom-6 right-6 z-50 quick-actions">
              <button
                onClick={() => navigate('/subscriptions?action=add')}
                className="bg-blue-600 hover:bg-blue-700 w-14 h-14 rounded-full text-white text-xl font-bold shadow-lg transition-colors"
              >
                ➕
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tour Overlay - Temporarily disabled to prevent UX conflicts */}
      {isFeatureEnabled('DASHBOARD_TOUR_ENABLED') && <TourOverlay />}

      {/* Feature Discovery - Temporarily disabled to prevent UX conflicts */}
      {isFeatureEnabled('FEATURE_HIGHLIGHT_ENABLED') && (
        <FeatureHighlight
          subscriptionCount={stats.total_subscriptions}
          userLevel="beginner"
          currentPage="dashboard"
        />
      )}
    </div>
  );
};

export default Dashboard;
