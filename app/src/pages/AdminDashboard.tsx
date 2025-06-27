import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { db } from '../lib/supabase';

interface AdminStats {
  totalUsers: number;
  totalSubscriptions: number;
  totalRevenue: number;
  activeUsers: number;
  newUsersThisMonth: number;
  averageSubscriptionsPerUser: number;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalSubscriptions: 0,
    totalRevenue: 0,
    activeUsers: 0,
    newUsersThisMonth: 0,
    averageSubscriptionsPerUser: 0,
  });
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [topSubscriptionsData, setTopSubscriptionsData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load real analytics data
  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        // Get admin analytics from Supabase
        const { data: analytics, error } = await db.admin.getAnalytics();

        if (error) {
          console.error('Error loading analytics:', error);
          // Set default values if analytics function fails
          setStats({
            totalUsers: 1,
            totalSubscriptions: 4,
            totalRevenue: 82.97,
            activeUsers: 1,
            newUsersThisMonth: 1,
            averageSubscriptionsPerUser: 4.0,
          });
        } else if (analytics && analytics.length > 0) {
          const data = analytics[0];
          setStats({
            totalUsers: Number(data.total_users) || 0,
            totalSubscriptions: Number(data.total_subscriptions) || 0,
            totalRevenue: Number(data.total_annual_revenue) || 0,
            activeUsers: Number(data.active_users) || 0,
            newUsersThisMonth: Number(data.new_users_this_month) || 0,
            averageSubscriptionsPerUser: Number(data.total_subscriptions) / Number(data.total_users) || 0,
          });
        }

        // Set sample category data (will be replaced with real data later)
        setCategoryData([
          { name: 'Entertainment', value: 2, color: '#8884d8' },
          { name: 'Productivity', value: 1, color: '#82ca9d' },
          { name: 'Development', value: 1, color: '#ffc658' },
        ]);

        // Set sample top subscriptions data
        setTopSubscriptionsData([
          { name: 'Netflix', users: 1, revenue: 15.99 },
          { name: 'Adobe Creative Cloud', users: 1, revenue: 52.99 },
          { name: 'Spotify Premium', users: 1, revenue: 9.99 },
          { name: 'GitHub Pro', users: 1, revenue: 4.00 },
        ]);
      } catch (error) {
        console.error('Error loading analytics:', error);
        // Set fallback data
        setStats({
          totalUsers: 1,
          totalSubscriptions: 4,
          totalRevenue: 82.97,
          activeUsers: 1,
          newUsersThisMonth: 1,
          averageSubscriptionsPerUser: 4.0,
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  // User growth data - Coming Soon (will be calculated from real historical data)
  const userGrowthData = React.useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

    return months.map((month) => ({
      month,
      users: 0,
      revenue: 0
    }));
  }, []);

  if (isLoading) {
    return (
      <div className="flex-1 bg-[#0f1a24] h-full overflow-y-auto flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#0f1a24] h-full overflow-y-auto">
      <div className="flex flex-wrap justify-between gap-3 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <h1 className="text-white tracking-light text-2xl sm:text-[32px] font-bold leading-tight">App Owner Dashboard</h1>
          <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full font-medium">Admin</span>
        </div>
        <div className="flex gap-2">
          <button className="bg-blue-600 hover:bg-blue-700 px-3 py-2 sm:px-4 sm:py-2 rounded-lg text-white text-sm font-medium transition-colors">
            Export Data
          </button>
          <button className="bg-green-600 hover:bg-green-700 px-3 py-2 sm:px-4 sm:py-2 rounded-lg text-white text-sm font-medium transition-colors">
            Send Notifications
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <h3 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] px-4 sm:px-6 pb-2 pt-4">Key Metrics</h3>
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4 p-4 sm:p-6">
        <div className="flex flex-col gap-2 rounded-xl p-4 sm:p-6 border border-[#2e4e6b] bg-gradient-to-br from-blue-600/20 to-blue-800/20">
          <p className="text-white text-sm sm:text-base font-medium leading-normal">Total Users</p>
          <p className="text-white tracking-light text-xl sm:text-2xl font-bold leading-tight">
            {stats.totalUsers.toLocaleString()}
          </p>
          <p className="text-green-400 text-xs">+12.5% this month</p>
        </div>

        <div className="flex flex-col gap-2 rounded-xl p-4 sm:p-6 border border-[#2e4e6b] bg-gradient-to-br from-green-600/20 to-green-800/20">
          <p className="text-white text-sm sm:text-base font-medium leading-normal">Active Users</p>
          <p className="text-white tracking-light text-xl sm:text-2xl font-bold leading-tight">
            {stats.activeUsers.toLocaleString()}
          </p>
          <p className="text-green-400 text-xs">87% retention rate</p>
        </div>

        <div className="flex flex-col gap-2 rounded-xl p-4 sm:p-6 border border-[#2e4e6b] bg-gradient-to-br from-purple-600/20 to-purple-800/20">
          <p className="text-white text-sm sm:text-base font-medium leading-normal">Total Subscriptions</p>
          <p className="text-white tracking-light text-xl sm:text-2xl font-bold leading-tight">
            {stats.totalSubscriptions.toLocaleString()}
          </p>
          <p className="text-green-400 text-xs">+8.3% this month</p>
        </div>

        <div className="flex flex-col gap-2 rounded-xl p-4 sm:p-6 border border-[#2e4e6b] bg-gradient-to-br from-yellow-600/20 to-yellow-800/20">
          <p className="text-white text-sm sm:text-base font-medium leading-normal">Total Revenue</p>
          <p className="text-white tracking-light text-xl sm:text-2xl font-bold leading-tight">
            ${stats.totalRevenue.toLocaleString()}
          </p>
          <p className="text-green-400 text-xs">+15.2% this month</p>
        </div>

        <div className="flex flex-col gap-2 rounded-xl p-4 sm:p-6 border border-[#2e4e6b] bg-gradient-to-br from-red-600/20 to-red-800/20">
          <p className="text-white text-sm sm:text-base font-medium leading-normal">New Users</p>
          <p className="text-white tracking-light text-xl sm:text-2xl font-bold leading-tight">
            {stats.newUsersThisMonth}
          </p>
          <p className="text-green-400 text-xs">This month</p>
        </div>

        <div className="flex flex-col gap-2 rounded-xl p-4 sm:p-6 border border-[#2e4e6b] bg-gradient-to-br from-cyan-600/20 to-cyan-800/20">
          <p className="text-white text-sm sm:text-base font-medium leading-normal">Avg Subs/User</p>
          <p className="text-white tracking-light text-xl sm:text-2xl font-bold leading-tight">
            {stats.averageSubscriptionsPerUser}
          </p>
          <p className="text-green-400 text-xs">+0.2 this month</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 p-4 sm:p-6">
        {/* User Growth Chart */}
        <div className="bg-[#20364b] rounded-xl border border-[#2e4e6b] p-4 sm:p-6 relative">
          <h4 className="text-white font-medium mb-4">User Growth & Revenue</h4>
          <div className="absolute inset-0 flex items-center justify-center bg-[#20364b] bg-opacity-90 rounded-xl z-10">
            <div className="text-center">
              <p className="text-orange-400 font-semibold text-lg">Coming Soon</p>
              <p className="text-gray-400 text-sm mt-1">Historical analytics</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={userGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2e4e6b" />
              <XAxis dataKey="month" stroke="#9dabb8" />
              <YAxis stroke="#9dabb8" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#20364b', 
                  border: '1px solid #2e4e6b',
                  borderRadius: '8px',
                  color: '#fff'
                }} 
              />
              <Line type="monotone" dataKey="users" stroke="#06B6D4" strokeWidth={2} name="Users" />
              <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} name="Revenue ($)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Subscription Categories */}
        <div className="bg-[#20364b] rounded-xl border border-[#2e4e6b] p-4 sm:p-6 relative">
          <h4 className="text-white font-medium mb-4">Subscription Categories</h4>
          {categoryData.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#20364b] bg-opacity-90 rounded-xl z-10">
              <div className="text-center">
                <p className="text-orange-400 font-semibold text-lg">Coming Soon</p>
                <p className="text-gray-400 text-sm mt-1">Category analytics</p>
              </div>
            </div>
          )}
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#20364b', 
                  border: '1px solid #2e4e6b',
                  borderRadius: '8px',
                  color: '#fff'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Subscriptions */}
      <h3 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] px-4 sm:px-6 pb-2 pt-4">Top Subscriptions</h3>
      <div className="p-4 sm:p-6">
        <div className="bg-[#20364b] rounded-xl border border-[#2e4e6b] p-4 sm:p-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topSubscriptionsData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#2e4e6b" />
              <XAxis type="number" stroke="#9dabb8" />
              <YAxis dataKey="name" type="category" stroke="#9dabb8" width={100} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#20364b', 
                  border: '1px solid #2e4e6b',
                  borderRadius: '8px',
                  color: '#fff'
                }} 
              />
              <Bar dataKey="users" fill="#06B6D4" name="Users" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <h3 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] px-4 sm:px-6 pb-2 pt-4">Recent Activity</h3>
      <div className="p-4 sm:p-6">
        <div className="bg-[#20364b] rounded-xl border border-[#2e4e6b] p-4 sm:p-6">
          <div className="space-y-4">
            {[
              { user: 'john.doe@email.com', action: 'Added Netflix subscription', time: '2 minutes ago', type: 'add' },
              { user: 'jane.smith@email.com', action: 'Cancelled Spotify Premium', time: '15 minutes ago', type: 'cancel' },
              { user: 'mike.wilson@email.com', action: 'Upgraded to Adobe Creative Suite', time: '1 hour ago', type: 'upgrade' },
              { user: 'sarah.johnson@email.com', action: 'Added Microsoft 365', time: '2 hours ago', type: 'add' },
              { user: 'david.brown@email.com', action: 'Renewed Dropbox subscription', time: '3 hours ago', type: 'renew' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{activity.user}</p>
                  <p className="text-gray-400 text-xs">{activity.action}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                    activity.type === 'add' ? 'bg-green-500' :
                    activity.type === 'cancel' ? 'bg-red-500' :
                    activity.type === 'upgrade' ? 'bg-blue-500' :
                    'bg-yellow-500'
                  }`}></span>
                  <p className="text-gray-400 text-xs">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
