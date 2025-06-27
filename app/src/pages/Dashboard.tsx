import React, { useState, useEffect } from 'react';
import { useSubscriptions } from '../contexts/SubscriptionContext';
import { db } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  calculateSpendingInsights,
  generateRenewalInsights,
  generateCategoryInsights,
  SpendingInsight,
  RenewalInsight,
  CategoryInsight
} from '../utils/insightCalculations';
import {
  SpendingInsightCard,
  RenewalInsightCard,
  CategoryInsightCard,
  QuickActionButton,
  SummaryCard
} from '../components/InsightCards';
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
  const navigate = useNavigate();

  const [stats, setStats] = useState<DashboardStats>({
    totalSubscriptions: 0,
    monthlySpending: 0,
    yearlySpending: 0,
    upcomingRenewals: 0,
    notificationsCount: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  // New insight states
  const [spendingInsight, setSpendingInsight] = useState<SpendingInsight | null>(null);
  const [renewalInsight, setRenewalInsight] = useState<RenewalInsight | null>(null);
  const [categoryInsight, setCategoryInsight] = useState<CategoryInsight | null>(null);

  // Load dashboard stats and insights
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user || subscriptionsLoading) return;

      setIsLoading(true);
      try {
        // Calculate insights from subscriptions
        const spendingInsightData = calculateSpendingInsights(subscriptions);
        const renewalInsightData = generateRenewalInsights(subscriptions);
        const categoryInsightData = generateCategoryInsights(subscriptions);

        setSpendingInsight(spendingInsightData);
        setRenewalInsight(renewalInsightData);
        setCategoryInsight(categoryInsightData);

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
      <div className="flex-1 bg-[#0f1a24] h-full overflow-y-auto">
        <div className="flex items-center justify-center h-full">
          <div className="text-white text-lg">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#0f1a24] min-h-0 overflow-y-auto">
      <div className="max-w-full space-y-8 p-6">
        {/* Header with Quick Actions */}
        <div className="flex flex-wrap justify-between items-center gap-4">
          <h1 className="text-white tracking-light text-[32px] font-bold leading-tight min-w-0">Dashboard</h1>
          <QuickActionButton
            onClick={() => navigate('/subscriptions?action=add')}
            icon="➕"
            label="Add Subscription"
            className="hidden lg:flex"
          />
        </div>

        {/* Key Insights Section */}
        <section>
          <h2 className="text-white text-xl font-bold mb-4">Your Insights</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {spendingInsight && (
              <SpendingInsightCard
                insight={spendingInsight}
                onViewDetails={() => navigate('/reports')}
              />
            )}
            {categoryInsight && (
              <CategoryInsightCard
                insight={categoryInsight}
                onViewBreakdown={() => navigate('/reports')}
              />
            )}
          </div>
        </section>

        {/* Upcoming Renewals Section */}
        {renewalInsight && (
          <section>
            <h2 className="text-white text-xl font-bold mb-4">Upcoming Renewals</h2>
            <RenewalInsightCard
              insight={renewalInsight}
              onViewUpcoming={() => navigate('/subscriptions')}
            />
          </section>
        )}

        {/* Summary Statistics */}
        <section>
          <h2 className="text-white text-xl font-bold mb-4">Summary</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard
              title="Monthly Total"
              value={stats.monthlySpending}
              subtitle="Current month spending"
              icon="💰"
            />
            <SummaryCard
              title="Yearly Total"
              value={stats.yearlySpending}
              subtitle="Projected annual cost"
              icon="📅"
            />
            <SummaryCard
              title="Active Subscriptions"
              value={stats.totalSubscriptions}
              subtitle="Currently tracked"
              icon="📱"
            />
            <SummaryCard
              title="This Month's Renewals"
              value={stats.upcomingRenewals}
              subtitle="Next 30 days"
              icon="🔔"
            />
          </div>
        </section>

        {/* Recent Subscriptions */}
        <section>
          <h2 className="text-white text-xl font-bold mb-4">Recent Subscriptions</h2>
          <div className="rounded-xl border border-[#2e4e6b] bg-[#1a2332] p-6">
            {subscriptions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400 text-lg mb-4">No subscriptions yet</p>
                <p className="text-gray-500 mb-6">Add your first subscription to get started!</p>
                <QuickActionButton
                  onClick={() => navigate('/subscriptions?action=add')}
                  icon="➕"
                  label="Add Your First Subscription"
                />
              </div>
            ) : (
              <div className="space-y-4">
                {subscriptions.slice(0, 5).map((subscription) => (
                  <div key={subscription.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-[#0f1a24] rounded-lg gap-2 hover:bg-[#1a2332] transition-colors">
                    <div className="min-w-0 flex-1">
                      <h4 className="text-white font-medium truncate">{subscription.name}</h4>
                      <p className="text-gray-400 text-sm truncate">{subscription.category}</p>
                    </div>
                    <div className="text-left sm:text-right flex-shrink-0">
                      <p className="text-white font-bold">${subscription.cost}</p>
                      <p className="text-gray-400 text-sm">{subscription.frequency}</p>
                    </div>
                  </div>
                ))}
                {subscriptions.length > 5 && (
                  <div className="text-center pt-4">
                    <button
                      onClick={() => navigate('/subscriptions')}
                      className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                    >
                      View all {subscriptions.length} subscriptions →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Floating Action Button for Mobile */}
        <QuickActionButton
          onClick={() => navigate('/subscriptions?action=add')}
          icon="➕"
          label=""
          className="fixed bottom-6 right-6 lg:hidden !rounded-full !p-4 shadow-lg z-50"
        />
      </div>
    </div>
  );
};

export default Dashboard;
