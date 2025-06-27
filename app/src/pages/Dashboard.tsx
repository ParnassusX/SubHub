import React, { useState, useEffect } from 'react';
import { useSubscriptions } from '../contexts/SubscriptionContext';
import { db } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

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
  const [stats, setStats] = useState<DashboardStats>({
    totalSubscriptions: 0,
    monthlySpending: 0,
    yearlySpending: 0,
    upcomingRenewals: 0,
    notificationsCount: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load dashboard stats from Supabase
  useEffect(() => {
    const loadDashboardStats = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        // Get stats from Supabase function
        const { data, error } = await db.dashboard.getUserStats();
        
        if (error) {
          console.error('Error loading dashboard stats:', error);
          // Fallback to calculating from subscriptions
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
        }
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
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
      loadDashboardStats();
    }
  }, [user, subscriptions, subscriptionsLoading]);

  // Get upcoming payments for display
  const getUpcomingPayments = () => {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return subscriptions.filter(sub => {
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
    });
  };

  const upcomingPayments = getUpcomingPayments();

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
    <div className="flex-1 bg-[#0f1a24] h-full overflow-y-auto">
      <div className="flex flex-wrap justify-between gap-3 p-4">
        <p className="text-white tracking-light text-[32px] font-bold leading-tight min-w-72">Dashboard</p>
      </div>
      
      {/* Summary Cards */}
      <h3 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Summary</h3>
      <div className="flex flex-wrap gap-4 p-4">
        <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl p-6 border border-[#2e4e6b]">
          <p className="text-white text-base font-medium leading-normal">Total Monthly</p>
          <p className="text-white tracking-light text-2xl font-bold leading-tight">
            ${stats.monthlySpending.toFixed(2)}
          </p>
          <p className="text-xs text-green-400">Real data from Supabase</p>
        </div>
        <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl p-6 border border-[#2e4e6b]">
          <p className="text-white text-base font-medium leading-normal">Total Yearly</p>
          <p className="text-white tracking-light text-2xl font-bold leading-tight">
            ${stats.yearlySpending.toFixed(2)}
          </p>
          <p className="text-xs text-green-400">Real data from Supabase</p>
        </div>
        <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl p-6 border border-[#2e4e6b]">
          <p className="text-white text-base font-medium leading-normal">Active Subscriptions</p>
          <p className="text-white tracking-light text-2xl font-bold leading-tight">
            {stats.totalSubscriptions}
          </p>
          <p className="text-xs text-green-400">Real data from Supabase</p>
        </div>
        <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl p-6 border border-[#2e4e6b]">
          <p className="text-white text-base font-medium leading-normal">Upcoming Renewals</p>
          <p className="text-white tracking-light text-2xl font-bold leading-tight">
            {stats.upcomingRenewals}
          </p>
          <p className="text-xs text-green-400">Next 7 days</p>
        </div>
      </div>

      {/* Recent Subscriptions */}
      <h3 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Recent Subscriptions</h3>
      <div className="p-4">
        <div className="rounded-xl border border-[#2e4e6b] bg-[#1a2332] p-6">
          {subscriptions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 text-lg mb-4">No subscriptions yet</p>
              <p className="text-gray-500">Add your first subscription to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {subscriptions.slice(0, 5).map((subscription) => (
                <div key={subscription.id} className="flex items-center justify-between p-4 bg-[#0f1a24] rounded-lg">
                  <div>
                    <h4 className="text-white font-medium">{subscription.name}</h4>
                    <p className="text-gray-400 text-sm">{subscription.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold">${subscription.cost}</p>
                    <p className="text-gray-400 text-sm">{subscription.frequency}</p>
                  </div>
                </div>
              ))}
              {subscriptions.length > 5 && (
                <div className="text-center pt-4">
                  <p className="text-gray-400">And {subscriptions.length - 5} more...</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Payments */}
      {upcomingPayments.length > 0 && (
        <>
          <h3 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Upcoming Payments</h3>
          <div className="p-4">
            <div className="rounded-xl border border-[#2e4e6b] bg-[#1a2332] p-6">
              <div className="space-y-4">
                {upcomingPayments.map((subscription) => (
                  <div key={subscription.id} className="flex items-center justify-between p-4 bg-[#0f1a24] rounded-lg border-l-4 border-orange-500">
                    <div>
                      <h4 className="text-white font-medium">{subscription.name}</h4>
                      <p className="text-gray-400 text-sm">Due within 7 days</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold">${subscription.cost}</p>
                      <p className="text-gray-400 text-sm">{subscription.frequency}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
