import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { ChartErrorBoundary, ChartNoData } from './ChartErrorBoundary';
import { MonthlyTrend, CategoryBreakdown, RenewalForecast } from '../utils/analyticsEngine';

// Enhanced Spending Trends Chart
interface SpendingTrendsChartProps {
  data: MonthlyTrend[];
  title?: string;
}

export const SpendingTrendsChart: React.FC<SpendingTrendsChartProps> = ({ 
  data, 
  title = "Monthly Spending Trends" 
}) => {
  if (!data || data.length === 0) {
    return <ChartNoData title="No Spending Data" message="Add subscriptions to see spending trends over time." />;
  }

  return (
    <div className="bg-[#1a2332] rounded-xl border border-[#2e4e6b] p-6">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <ChartErrorBoundary>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="month" 
              stroke="#9ca3af" 
              fontSize={12}
            />
            <YAxis 
              stroke="#9ca3af" 
              fontSize={12}
              tickFormatter={(value) => `$${value.toFixed(0)}`}
            />
            <Tooltip 
              formatter={(value: number) => [`$${value.toFixed(2)}`, 'Spending']}
              labelFormatter={(label) => `Month: ${label}`}
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#fff'
              }} 
            />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#spendingGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartErrorBoundary>
    </div>
  );
};

// Enhanced Category Breakdown Chart
interface CategoryBreakdownChartProps {
  data: CategoryBreakdown[];
  title?: string;
}

export const CategoryBreakdownChart: React.FC<CategoryBreakdownChartProps> = ({ 
  data, 
  title = "Spending by Category" 
}) => {
  if (!data || data.length === 0) {
    return <ChartNoData title="No Category Data" message="Add subscriptions to see category breakdown." />;
  }

  const chartData = data.map(item => ({
    name: item.category,
    value: item.amount,
    fill: item.color,
    percentage: item.percentage
  }));

  return (
    <div className="bg-[#1a2332] rounded-xl border border-[#2e4e6b] p-6">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <ChartErrorBoundary>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percentage }) => `${name} ${percentage.toFixed(1)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => [`$${value.toFixed(2)}`, 'Monthly Amount']}
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#fff'
              }} 
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </ChartErrorBoundary>
    </div>
  );
};

// Renewal Forecast Chart
interface RenewalForecastChartProps {
  data: RenewalForecast[];
  title?: string;
}

export const RenewalForecastChart: React.FC<RenewalForecastChartProps> = ({ 
  data, 
  title = "Upcoming Renewals" 
}) => {
  if (!data || data.length === 0) {
    return <ChartNoData title="No Renewal Data" message="Add subscriptions to see renewal forecasts." />;
  }

  return (
    <div className="bg-[#1a2332] rounded-xl border border-[#2e4e6b] p-6">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <ChartErrorBoundary>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="month" 
              stroke="#9ca3af" 
              fontSize={12}
            />
            <YAxis 
              stroke="#9ca3af" 
              fontSize={12}
              tickFormatter={(value) => `$${value.toFixed(0)}`}
            />
            <Tooltip 
              formatter={(value: number, name: string) => [
                name === 'amount' ? `$${value.toFixed(2)}` : value,
                name === 'amount' ? 'Renewal Amount' : 'Renewals Count'
              ]}
              labelFormatter={(label) => `Month: ${label}`}
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#fff'
              }} 
            />
            <Bar dataKey="amount" fill="#10b981" name="amount" />
          </BarChart>
        </ResponsiveContainer>
      </ChartErrorBoundary>
    </div>
  );
};

// Subscription Count Trend Chart
interface SubscriptionCountChartProps {
  data: MonthlyTrend[];
  title?: string;
}

export const SubscriptionCountChart: React.FC<SubscriptionCountChartProps> = ({ 
  data, 
  title = "Subscription Growth" 
}) => {
  if (!data || data.length === 0) {
    return <ChartNoData title="No Growth Data" message="Add subscriptions to see growth trends." />;
  }

  return (
    <div className="bg-[#1a2332] rounded-xl border border-[#2e4e6b] p-6">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <ChartErrorBoundary>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="month" 
              stroke="#9ca3af" 
              fontSize={12}
            />
            <YAxis 
              stroke="#9ca3af" 
              fontSize={12}
            />
            <Tooltip 
              formatter={(value: number) => [value, 'Active Subscriptions']}
              labelFormatter={(label) => `Month: ${label}`}
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#fff'
              }} 
            />
            <Line 
              type="monotone" 
              dataKey="subscriptionCount" 
              stroke="#f59e0b" 
              strokeWidth={2}
              dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartErrorBoundary>
    </div>
  );
};
