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
import { getCategoryHex } from '../utils/categoryColors';

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
    <div className="flex-1 bg-[#0f1a24] h-full overflow-y-auto overflow-x-hidden">
      {/* Page Container with proper constraints */}
      <div className="w-full max-w-full min-w-0">
        {/* Header */}
        <div className="flex flex-wrap justify-between gap-3 p-4 sm:p-6 w-full max-w-full">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h1 className="text-white tracking-light text-2xl sm:text-[32px] font-bold leading-tight">
              Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}!
            </h1>
          </div>
          <button
            onClick={() => navigate('/subscriptions?action=add')}
            className="bg-blue-600 hover:bg-blue-700 px-3 py-2 sm:px-4 sm:py-2 rounded-lg text-white text-sm font-medium transition-colors hidden sm:flex items-center gap-2"
          >
            ➕ Add Subscription
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="w-full max-w-full min-w-0 p-4 sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:gap-6 w-full max-w-full">

            {/* Interactive Quick Stats - Full Width */}
            <div>
              <h2 className="text-white text-lg font-bold mb-4">Quick Overview</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <button
                  onClick={() => navigate('/reports')}
                  className="bg-[#1a2332] rounded-xl border border-[#2e4e6b] p-4 hover:bg-[#243447] hover:border-[#3e5e7b] transition-all duration-200 cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center group-hover:bg-blue-600/30 transition-colors">
                      <span className="text-blue-400 text-lg">💰</span>
                    </div>
                    <div className="text-left">
                      <p className="text-white text-lg font-bold">${stats.monthlySpending.toFixed(2)}</p>
                      <p className="text-gray-400 text-xs">Monthly</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => navigate('/reports')}
                  className="bg-[#1a2332] rounded-xl border border-[#2e4e6b] p-4 hover:bg-[#243447] hover:border-[#3e5e7b] transition-all duration-200 cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center group-hover:bg-green-600/30 transition-colors">
                      <span className="text-green-400 text-lg">📅</span>
                    </div>
                    <div className="text-left">
                      <p className="text-white text-lg font-bold">${stats.yearlySpending.toFixed(0)}</p>
                      <p className="text-gray-400 text-xs">Yearly</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => navigate('/subscriptions')}
                  className="bg-[#1a2332] rounded-xl border border-[#2e4e6b] p-4 hover:bg-[#243447] hover:border-[#3e5e7b] transition-all duration-200 cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center group-hover:bg-purple-600/30 transition-colors">
                      <span className="text-purple-400 text-lg">📱</span>
                    </div>
                    <div className="text-left">
                      <p className="text-white text-lg font-bold">{stats.totalSubscriptions}</p>
                      <p className="text-gray-400 text-xs">Active</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => navigate('/renewals')}
                  className="bg-[#1a2332] rounded-xl border border-[#2e4e6b] p-4 hover:bg-[#243447] hover:border-[#3e5e7b] transition-all duration-200 cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-600/20 rounded-lg flex items-center justify-center group-hover:bg-orange-600/30 transition-colors">
                      <span className="text-orange-400 text-lg">🔔</span>
                    </div>
                    <div className="text-left">
                      <p className="text-white text-lg font-bold">{stats.upcomingRenewals}</p>
                      <p className="text-gray-400 text-xs">Due Soon</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Insights and Renewals Row */}
            <div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

                {/* Spending Insight */}
                {spendingInsight && (
                  <div className="bg-[#1a2332] rounded-xl border border-[#2e4e6b] p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white text-lg font-bold">Spending Trend</h3>
                      <button
                        onClick={() => navigate('/reports')}
                        className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                      >
                        View Details →
                      </button>
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
                        <span className="text-blue-400 text-xl">📈</span>
                      </div>
                      <div>
                        <p className="text-white text-sm">
                          {spendingInsight.message}
                        </p>
                        <p className="text-gray-400 text-xs">
                          ${spendingInsight.amount.toFixed(2)} {spendingInsight.type.includes('increase') ? 'increase' : 'change'} {spendingInsight.primaryCategory ? `- mostly on ${spendingInsight.primaryCategory}` : ''}
                        </p>
                      </div>
                    </div>
                    {spendingInsight.recommendation && (
                      <div className="bg-blue-600/10 rounded-lg p-3">
                        <p className="text-blue-300 text-sm flex items-center gap-2">
                          💡 <span className="font-medium">RECOMMENDATION</span>
                        </p>
                        <p className="text-blue-200 text-sm mt-1">
                          {spendingInsight.recommendation}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Category Insight */}
                {categoryInsight && (
                  <div className="bg-[#1a2332] rounded-xl border border-[#2e4e6b] p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white text-lg font-bold">Category Breakdown</h3>
                      <button
                        onClick={() => navigate('/reports')}
                        className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                      >
                        View All →
                      </button>
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center">
                        <span className="text-purple-400 text-xl">📊</span>
                      </div>
                      <div>
                        <p className="text-white text-sm">
                          {categoryInsight.topCategory} is your biggest expense
                        </p>
                        <p className="text-gray-400 text-xs">
                          {categoryInsight.topCategoryPercentage.toFixed(1)}% of your subscriptions
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {categoryInsight.breakdown.slice(0, 3).map((cat, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                            <span className="text-gray-300 text-sm">{cat.category}</span>
                          </div>
                          <span className="text-white text-sm font-medium">{cat.percentage.toFixed(0)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Upcoming Renewals */}
            {renewalInsight && (
              <div>
                <div className="bg-[#1a2332] rounded-xl border border-[#2e4e6b] p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white text-lg font-bold">Upcoming Renewals</h3>
                    <button
                      onClick={() => navigate('/subscriptions')}
                      className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                    >
                      View All →
                    </button>
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-orange-600/20 rounded-lg flex items-center justify-center">
                      <span className="text-orange-400 text-xl">🔔</span>
                    </div>
                    <div>
                      <p className="text-white text-sm">
                        {renewalInsight.weekCount} renewals coming up this week
                      </p>
                      <p className="text-gray-400 text-xs">
                        {renewalInsight.nextRenewal ? `Next is ${renewalInsight.nextRenewal.name} in ${renewalInsight.nextRenewal.daysUntil} days` : 'No upcoming renewals'}
                      </p>
                    </div>
                  </div>
                  {renewalInsight.nextRenewal && (
                    <div className="bg-orange-600/10 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-orange-300 text-sm font-medium">Next: {renewalInsight.nextRenewal.name}</p>
                          <p className="text-orange-200 text-xs">In {renewalInsight.nextRenewal.daysUntil} days</p>
                        </div>
                        <p className="text-orange-300 text-lg font-bold">${renewalInsight.nextRenewal.cost.toFixed(2)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Recent Subscriptions */}
            <div>
              <h2 className="text-white text-lg font-bold mb-4">Recent Subscriptions</h2>
              <div className="bg-[#1a2332] rounded-xl border border-[#2e4e6b] p-6">
                {subscriptions.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-gray-400 text-2xl">📱</span>
                    </div>
                    <p className="text-gray-400 text-lg mb-2">No subscriptions yet</p>
                    <p className="text-gray-500 mb-6">Add your first subscription to get started!</p>
                    <button
                      onClick={() => navigate('/subscriptions?action=add')}
                      className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors"
                    >
                      ➕ Add Your First Subscription
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {subscriptions.slice(0, 4).map((subscription) => (
                      <div key={subscription.id} className="flex items-center justify-between p-3 bg-[#0f1a24] rounded-lg border border-[#2e4e6b] hover:border-[#3e5e7b] transition-colors">
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
                          <p className="text-white font-bold text-sm">${subscription.cost.toFixed(2)}</p>
                          <p className="text-gray-400 text-xs">{subscription.frequency}</p>
                        </div>
                      </div>
                    ))}
                    <div className="text-center pt-3 border-t border-[#2e4e6b]">
                      <button
                        onClick={() => navigate('/subscriptions')}
                        className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                      >
                        View All Subscriptions →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Quick Action */}
            <div className="lg:hidden fixed bottom-6 right-6 z-50">
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
    </div>
  );
};

export default Dashboard;
