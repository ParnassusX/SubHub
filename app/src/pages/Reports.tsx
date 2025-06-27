import React from 'react';
import { useSubscriptions } from '../contexts/SubscriptionContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Reports: React.FC = () => {
  const { subscriptions } = useSubscriptions();

  // Calculate spending by frequency
  const monthlySpending = subscriptions
    .filter(sub => sub.frequency === 'Monthly')
    .reduce((total, sub) => total + sub.cost, 0);

  const yearlySpending = subscriptions
    .filter(sub => sub.frequency === 'Yearly')
    .reduce((total, sub) => total + sub.cost, 0);

  // Calculate average cost
  const averageCost = subscriptions.length > 0
    ? subscriptions.reduce((total, sub) => {
        const monthlyCost = sub.frequency === 'Monthly' ? sub.cost : sub.cost / 12;
        return total + monthlyCost;
      }, 0) / subscriptions.length
    : 0;

  // Most expensive subscription
  const mostExpensive = subscriptions.reduce((max, sub) => {
    const monthlyCost = sub.frequency === 'Monthly' ? sub.cost : sub.cost / 12;
    const maxMonthlyCost = max.frequency === 'Monthly' ? max.cost : max.cost / 12;
    return monthlyCost > maxMonthlyCost ? sub : max;
  }, subscriptions[0]);

  // Generate chart data
  const generateMonthlyData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map((month, _index) => ({
      month,
      spending: Math.floor(Math.random() * 200) + 100 + (monthlySpending * 12 / 12), // Mock data with real base
    }));
  };

  const pieData = subscriptions.map((sub, index) => ({
    name: sub.name,
    value: sub.frequency === 'Monthly' ? sub.cost : sub.cost / 12,
    color: `hsl(${index * 45}, 70%, 60%)`
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  const monthlyData = generateMonthlyData();

  return (
    <div className="flex-1 bg-[#0f1a24] h-full overflow-y-auto">
      <div className="flex flex-wrap justify-between gap-3 p-4 sm:p-6">
        <h1 className="text-white tracking-light text-2xl sm:text-[32px] font-bold leading-tight">Reports</h1>
      </div>

      {/* Overview Cards */}
      <h3 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Spending Overview</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
        <div className="flex flex-col gap-2 rounded-xl p-6 border border-[#2e4e6b]">
          <p className="text-white text-base font-medium leading-normal">Monthly Subscriptions</p>
          <p className="text-white tracking-light text-2xl font-bold leading-tight">
            ${monthlySpending.toFixed(2)}
          </p>
          <p className="text-gray-400 text-sm">
            {subscriptions.filter(sub => sub.frequency === 'Monthly').length} subscriptions
          </p>
        </div>

        <div className="flex flex-col gap-2 rounded-xl p-6 border border-[#2e4e6b]">
          <p className="text-white text-base font-medium leading-normal">Yearly Subscriptions</p>
          <p className="text-white tracking-light text-2xl font-bold leading-tight">
            ${yearlySpending.toFixed(2)}
          </p>
          <p className="text-gray-400 text-sm">
            {subscriptions.filter(sub => sub.frequency === 'Yearly').length} subscriptions
          </p>
        </div>

        <div className="flex flex-col gap-2 rounded-xl p-6 border border-[#2e4e6b]">
          <p className="text-white text-base font-medium leading-normal">Average Monthly Cost</p>
          <p className="text-white tracking-light text-2xl font-bold leading-tight">
            ${averageCost.toFixed(2)}
          </p>
          <p className="text-gray-400 text-sm">Per subscription</p>
        </div>

        <div className="flex flex-col gap-2 rounded-xl p-6 border border-[#2e4e6b]">
          <p className="text-white text-base font-medium leading-normal">Most Expensive</p>
          <p className="text-white tracking-light text-2xl font-bold leading-tight">
            {mostExpensive ? `$${mostExpensive.cost.toFixed(2)}` : '$0.00'}
          </p>
          <p className="text-gray-400 text-sm">
            {mostExpensive ? mostExpensive.name : 'No subscriptions'}
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <h3 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Spending Trends</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
        {/* Line Chart */}
        <div className="bg-[#20364b] rounded-xl border border-[#2e4e6b] p-6">
          <h4 className="text-white font-medium mb-4">Monthly Spending Trend</h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={monthlyData}>
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
              <Line type="monotone" dataKey="spending" stroke="#0088FE" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-[#20364b] rounded-xl border border-[#2e4e6b] p-6">
          <h4 className="text-white font-medium mb-4">Subscription Distribution</h4>
          {subscriptions.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
          ) : (
            <div className="h-[200px] flex items-center justify-center">
              <p className="text-gray-400">No data to display</p>
            </div>
          )}
        </div>
      </div>

      {/* Subscription Breakdown */}
      <h3 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Subscription Breakdown</h3>
      <div className="p-4">
        {subscriptions.length > 0 ? (
          <div className="bg-[#20364b] rounded-xl border border-[#2e4e6b] p-6">
            <div className="space-y-4">
              {subscriptions.map((subscription) => {
                const monthlyCost = subscription.frequency === 'Monthly' ? subscription.cost : subscription.cost / 12;
                const totalMonthlyCost = subscriptions.reduce((total, sub) => {
                  const subMonthlyCost = sub.frequency === 'Monthly' ? sub.cost : sub.cost / 12;
                  return total + subMonthlyCost;
                }, 0);
                const percentage = totalMonthlyCost > 0 ? (monthlyCost / totalMonthlyCost) * 100 : 0;

                return (
                  <div key={subscription.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-medium">{subscription.name}</span>
                      <span className="text-white">${monthlyCost.toFixed(2)}/month</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>{subscription.frequency}</span>
                      <span>{percentage.toFixed(1)}% of total</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-6 bg-[#20364b] rounded-xl border border-[#2e4e6b] text-center">
            <p className="text-gray-400">No subscriptions to analyze</p>
            <p className="text-gray-500 text-sm mt-2">Add some subscriptions to see detailed reports!</p>
          </div>
        )}
      </div>

      {/* Savings Insights */}
      <h3 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Savings Insights</h3>
      <div className="p-4">
        <div className="bg-[#20364b] rounded-xl border border-[#2e4e6b] p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <p className="text-white">
                You could save <span className="font-bold text-green-400">${(yearlySpending * 0.1).toFixed(2)}</span> per year by switching to annual billing
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <p className="text-white">
                Your total annual spending is <span className="font-bold text-blue-400">${(monthlySpending * 12 + yearlySpending).toFixed(2)}</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <p className="text-white">
                Consider reviewing subscriptions you haven't used recently
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
