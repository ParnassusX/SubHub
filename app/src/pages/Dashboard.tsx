import React, { useState, useEffect } from 'react';
import { useSubscriptions } from '../contexts/SubscriptionContext';
import { db } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

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
import FeatureHighlight from '../components/tour/FeatureHighlight';
import HelpTooltip from '../components/help/HelpTooltip';
import { HelpContentManager } from '../data/helpContent';

// Feature flags for UX elements
import { isFeatureEnabled } from '../config/featureFlags';

import { useNavigate } from 'react-router-dom';

interface DashboardStats {
  totalSubscriptions: number;
  monthlySpending: number;
  yearlySpending: number;
  upcomingRenewals: number;
  notificationsCount: number;
}

const Dashboard: React.FC = () => {
  const { subscriptions, isLoading: subscriptionsLoading } = useSubscriptions();
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  // Budget hook is used by budget components
  const navigate = useNavigate();

  const [stats, setStats] = useState<DashboardStats>({
    totalSubscriptions: 0,
    monthlySpending: 0,
    yearlySpending: 0,
    upcomingRenewals: 0,
    notificationsCount: 0
  });
  const [isLoading, setIsLoading] = useState(true);



  // Load dashboard stats and insights
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user || subscriptionsLoading) return;

      setIsLoading(true);
      try {
        // Calculate insights from subscriptions (placeholder for future use)

        // Try to get stats from Supabase function, fallback to calculation
        try {
          const { data, error } = await db.dashboard.getUserStats();

          if (error) {
            console.error('Error loading dashboard stats:', error);
            calculateStatsFromSubscriptions();
          } else if (data && data.length > 0) {
            const statsData = data[0];
            setStats({
              totalSubscriptions: Number(statsData.total_subscriptions),
              monthlySpending: Number(statsData.monthly_spending),
              yearlySpending: Number(statsData.yearly_spending),
              upcomingRenewals: Number(statsData.upcoming_renewals),
              notificationsCount: Number(statsData.notifications_count)
            });
          } else {
            calculateStatsFromSubscriptions();
          }
        } catch (dbError) {
          console.error('Database error:', dbError);
          calculateStatsFromSubscriptions();
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        calculateStatsFromSubscriptions();
      } finally {
        setIsLoading(false);
      }
    };

    const calculateStatsFromSubscriptions = () => {
      const totalMonthlyCost = subscriptions.reduce((total, sub) => {
        const monthlyCost = sub.frequency === 'Monthly' ? sub.cost : sub.cost / 12;
        return total + monthlyCost;
      }, 0);

      const totalYearlyCost = totalMonthlyCost * 12;
      const totalSubscriptions = subscriptions.length;

      // Calculate upcoming renewals (next 7 days)
      const today = new Date();
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      const upcomingRenewals = subscriptions.filter(sub => {
        const startDate = new Date(sub.startDate);
        const nextBilling = new Date(startDate);
        
        // Calculate next billing date
        if (sub.frequency === 'Monthly') {
          while (nextBilling < today) {
            nextBilling.setMonth(nextBilling.getMonth() + 1);
          }
        } else {
          while (nextBilling < today) {
            nextBilling.setFullYear(nextBilling.getFullYear() + 1);
          }
        }
        
        return nextBilling >= today && nextBilling <= nextWeek;
      }).length;

      setStats({
        totalSubscriptions,
        monthlySpending: totalMonthlyCost,
        yearlySpending: totalYearlyCost,
        upcomingRenewals,
        notificationsCount: 0 // Would need to fetch from notifications
      });
    };

    if (user && !subscriptionsLoading) {
      loadDashboardData();
    }
  }, [user, subscriptions, subscriptionsLoading]);



  if (isLoading || subscriptionsLoading) {
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
                  totalSubscriptions: stats.totalSubscriptions,
                  monthlySpending: stats.monthlySpending,
                  yearlySpending: stats.yearlySpending,
                  upcomingRenewals: stats.upcomingRenewals
                }}
                budgetStatus={{
                  monthlyBudget: 500,
                  monthlySpent: stats.monthlySpending,
                  budgetUtilization: (stats.monthlySpending / 500) * 100,
                  status: (stats.monthlySpending / 500) >= 1 ? 'critical' :
                         (stats.monthlySpending / 500) >= 0.8 ? 'warning' : 'safe'
                }}
              />
            </div>

            {/* Critical Alerts Section */}
            <CriticalAlerts
              alerts={[
                // Mock alerts for now - will be replaced with real data
                ...(stats.monthlySpending > 400 ? [{
                  id: 'budget-warning',
                  type: 'budget_warning' as const,
                  title: 'Budget Warning',
                  message: `You've used ${((stats.monthlySpending / 500) * 100).toFixed(0)}% of your monthly budget`,
                  severity: (stats.monthlySpending / 500) >= 1 ? 'critical' as const : 'warning' as const,
                  actionLabel: 'Adjust Budget',
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
                  showItemCount={stats.upcomingRenewals}
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
          subscriptionCount={stats.totalSubscriptions}
          userLevel="beginner"
          currentPage="dashboard"
        />
      )}
    </div>
  );
};

export default Dashboard;
