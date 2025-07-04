// Advanced Analytics Charts for SubHub
// Provides comprehensive data visualization with accessibility and responsive design

import React from 'react';
import {
  Line,
  Area,
  BarChart,
  Bar,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { ChartErrorBoundary } from '../ChartErrorBoundary';
import { useCurrency } from '../../hooks/useCurrency';
import type { 
  MonthlyTrend, 
  CategoryBreakdown, 
  GrowthMetrics,
  SpendingPrediction 
} from '../../utils/analyticsEngine';

// Custom Tooltip Component with Accessibility
interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  formatter?: (value: number) => string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ 
  active, 
  payload, 
  label, 
  formatter 
}) => {
  if (active && payload && payload.length) {
    return (
      <div 
        className="bg-[#1f2937] border border-[#374151] rounded-lg p-3 shadow-lg"
        role="status"
        aria-live="assertive"
      >
        <p className="text-white font-medium mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {`${entry.name}: ${formatter ? formatter(entry.value) : entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Growth Metrics Chart Component
interface GrowthMetricsChartProps {
  data: GrowthMetrics;
  title?: string;
  height?: number;
}

export const GrowthMetricsChart: React.FC<GrowthMetricsChartProps> = ({
  data,
  title = "Growth Metrics Comparison",
  height = 300
}) => {
  const { formatPrice } = useCurrency();

  const chartData = [
    {
      period: 'Month over Month',
      current: data.monthOverMonth.current,
      previous: data.monthOverMonth.previous,
      change: data.monthOverMonth.changePercentage
    },
    {
      period: 'Quarter over Quarter',
      current: data.quarterOverQuarter.current,
      previous: data.quarterOverQuarter.previous,
      change: data.quarterOverQuarter.changePercentage
    },
    {
      period: 'Year over Year',
      current: data.yearOverYear.current,
      previous: data.yearOverYear.previous,
      change: data.yearOverYear.changePercentage
    }
  ];

  return (
    <div className="bg-[#1a2332] rounded-xl border border-[#2e4e6b] p-6">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <ChartErrorBoundary>
        <ResponsiveContainer width="100%" height={height}>
          <ComposedChart 
            data={chartData}
            accessibilityLayer
            title="Growth metrics showing current vs previous period spending"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="period" 
              stroke="#9ca3af" 
              fontSize={12}
              tick={{ fill: '#9ca3af' }}
            />
            <YAxis 
              yAxisId="amount"
              stroke="#9ca3af" 
              fontSize={12}
              tickFormatter={(value) => formatPrice(value).replace(/\.\d+$/, '')}
              tick={{ fill: '#9ca3af' }}
            />
            <YAxis 
              yAxisId="percentage"
              orientation="right"
              stroke="#9ca3af" 
              fontSize={12}
              tickFormatter={(value) => `${value.toFixed(1)}%`}
              tick={{ fill: '#9ca3af' }}
            />
            <Tooltip 
              content={<CustomTooltip formatter={formatPrice} />}
            />
            <Legend />
            <Bar 
              yAxisId="amount"
              dataKey="current" 
              fill="#3b82f6" 
              name="Current Period"
              radius={[2, 2, 0, 0]}
            />
            <Bar 
              yAxisId="amount"
              dataKey="previous" 
              fill="#6b7280" 
              name="Previous Period"
              radius={[2, 2, 0, 0]}
            />
            <Line 
              yAxisId="percentage"
              type="monotone" 
              dataKey="change" 
              stroke="#10b981" 
              strokeWidth={3}
              name="Change %"
              dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartErrorBoundary>
    </div>
  );
};

// Spending Prediction Chart Component
interface SpendingPredictionChartProps {
  data: SpendingPrediction;
  currentSpending: number;
  title?: string;
  height?: number;
}

export const SpendingPredictionChart: React.FC<SpendingPredictionChartProps> = ({
  data,
  currentSpending,
  title = "Spending Predictions",
  height = 300
}) => {
  const { formatPrice } = useCurrency();

  const chartData = [
    {
      period: 'Current',
      amount: currentSpending,
      type: 'actual',
      confidence: 100
    },
    {
      period: 'Next Month',
      amount: data.nextMonth,
      type: 'prediction',
      confidence: data.confidence === 'high' ? 90 : data.confidence === 'medium' ? 70 : 50
    },
    {
      period: 'Next Quarter',
      amount: data.nextQuarter / 3, // Monthly average
      type: 'prediction',
      confidence: data.confidence === 'high' ? 80 : data.confidence === 'medium' ? 60 : 40
    },
    {
      period: 'Next Year',
      amount: data.nextYear / 12, // Monthly average
      type: 'prediction',
      confidence: data.confidence === 'high' ? 70 : data.confidence === 'medium' ? 50 : 30
    }
  ];

  return (
    <div className="bg-[#1a2332] rounded-xl border border-[#2e4e6b] p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <div className="flex items-center gap-2">
          <div className="text-xs text-gray-400">
            Confidence: {data.confidence}
          </div>
          <div className={`w-2 h-2 rounded-full ${
            data.confidence === 'high' ? 'bg-green-400' :
            data.confidence === 'medium' ? 'bg-yellow-400' : 'bg-red-400'
          }`} />
        </div>
      </div>
      <ChartErrorBoundary>
        <ResponsiveContainer width="100%" height={height}>
          <ComposedChart 
            data={chartData}
            accessibilityLayer
            title="Spending predictions based on historical trends and patterns"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="period" 
              stroke="#9ca3af" 
              fontSize={12}
              tick={{ fill: '#9ca3af' }}
            />
            <YAxis 
              yAxisId="amount"
              stroke="#9ca3af" 
              fontSize={12}
              tickFormatter={(value) => formatPrice(value).replace(/\.\d+$/, '')}
              tick={{ fill: '#9ca3af' }}
            />
            <YAxis 
              yAxisId="confidence"
              orientation="right"
              stroke="#9ca3af" 
              fontSize={12}
              tickFormatter={(value) => `${value}%`}
              tick={{ fill: '#9ca3af' }}
            />
            <Tooltip 
              content={<CustomTooltip formatter={formatPrice} />}
            />
            <Legend />
            <Area
              yAxisId="amount"
              type="monotone"
              dataKey="amount"
              stroke="#8b5cf6"
              fill="#8b5cf6"
              fillOpacity={0.3}
              name="Predicted Spending"
            />
            <Line 
              yAxisId="confidence"
              type="monotone" 
              dataKey="confidence" 
              stroke="#f59e0b" 
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Confidence %"
              dot={{ fill: '#f59e0b', strokeWidth: 2, r: 3 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartErrorBoundary>
    </div>
  );
};

// Enhanced Category Breakdown Chart
interface EnhancedCategoryChartProps {
  data: CategoryBreakdown[];
  title?: string;
  height?: number;
  showPercentages?: boolean;
}

export const EnhancedCategoryChart: React.FC<EnhancedCategoryChartProps> = ({
  data,
  title = "Category Spending Breakdown",
  height = 300,
  showPercentages = true
}) => {
  const { formatPrice } = useCurrency();

  const chartData = data.map(item => ({
    ...item,
    fill: item.color
  }));

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null; // Don't show labels for slices < 5%
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="medium"
      >
        {showPercentages ? `${(percent * 100).toFixed(1)}%` : ''}
      </text>
    );
  };

  return (
    <div className="bg-[#1a2332] rounded-xl border border-[#2e4e6b] p-6">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <ChartErrorBoundary>
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <ResponsiveContainer width="100%" height={height}>
              <PieChart accessibilityLayer title="Category spending distribution">
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={Math.min(height * 0.35, 120)}
                  fill="#8884d8"
                  dataKey="amount"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  content={<CustomTooltip formatter={formatPrice} />}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Legend */}
          <div className="lg:w-64 space-y-2">
            <h4 className="text-sm font-medium text-white mb-3">Categories</h4>
            {chartData.map((entry, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-gray-300">{entry.category}</span>
                </div>
                <div className="text-right">
                  <div className="text-white font-medium">
                    {formatPrice(entry.amount)}
                  </div>
                  <div className="text-gray-400 text-xs">
                    {entry.subscriptionCount} subs
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ChartErrorBoundary>
    </div>
  );
};

// Advanced Spending Trends Chart with Multiple Metrics
interface AdvancedTrendsChartProps {
  data: MonthlyTrend[];
  title?: string;
  height?: number;
  showSubscriptionCount?: boolean;
}

export const AdvancedTrendsChart: React.FC<AdvancedTrendsChartProps> = ({
  data,
  title = "Advanced Spending Trends",
  height = 350,
  showSubscriptionCount = true
}) => {
  const { formatPrice } = useCurrency();

  // Calculate moving average for trend smoothing
  const dataWithMovingAverage = data.map((item, index) => {
    const windowSize = 3;
    const start = Math.max(0, index - Math.floor(windowSize / 2));
    const end = Math.min(data.length, start + windowSize);
    const window = data.slice(start, end);
    const movingAverage = window.reduce((sum, d) => sum + d.amount, 0) / window.length;

    return {
      ...item,
      movingAverage,
      growth: index > 0 ? ((item.amount - data[index - 1].amount) / data[index - 1].amount) * 100 : 0
    };
  });

  return (
    <div className="bg-[#1a2332] rounded-xl border border-[#2e4e6b] p-6">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <ChartErrorBoundary>
        <ResponsiveContainer width="100%" height={height}>
          <ComposedChart
            data={dataWithMovingAverage}
            accessibilityLayer
            title="Advanced spending trends with moving averages and growth rates"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="month"
              stroke="#9ca3af"
              fontSize={12}
              tick={{ fill: '#9ca3af' }}
            />
            <YAxis
              yAxisId="amount"
              stroke="#9ca3af"
              fontSize={12}
              tickFormatter={(value) => formatPrice(value).replace(/\.\d+$/, '')}
              tick={{ fill: '#9ca3af' }}
            />
            {showSubscriptionCount && (
              <YAxis
                yAxisId="count"
                orientation="right"
                stroke="#9ca3af"
                fontSize={12}
                tick={{ fill: '#9ca3af' }}
              />
            )}
            <Tooltip
              content={<CustomTooltip formatter={formatPrice} />}
            />
            <Legend />

            {/* Area chart for spending amount */}
            <Area
              yAxisId="amount"
              type="monotone"
              dataKey="amount"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.3}
              name="Monthly Spending"
            />

            {/* Line for moving average */}
            <Line
              yAxisId="amount"
              type="monotone"
              dataKey="movingAverage"
              stroke="#10b981"
              strokeWidth={2}
              strokeDasharray="5 5"
              name="3-Month Average"
              dot={false}
            />

            {/* Subscription count bars */}
            {showSubscriptionCount && (
              <Bar
                yAxisId="count"
                dataKey="subscriptionCount"
                fill="#8b5cf6"
                fillOpacity={0.7}
                name="Subscription Count"
                radius={[2, 2, 0, 0]}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </ChartErrorBoundary>
    </div>
  );
};

// Subscription Lifecycle Chart
interface SubscriptionLifecycleChartProps {
  data: {
    newSubscriptions: number;
    cancelledSubscriptions: number;
    netGrowth: number;
    churnRate: number;
  };
  title?: string;
  height?: number;
}

export const SubscriptionLifecycleChart: React.FC<SubscriptionLifecycleChartProps> = ({
  data,
  title = "Subscription Lifecycle Metrics",
  height = 300
}) => {
  const chartData = [
    {
      metric: 'New Subs',
      value: data.newSubscriptions,
      color: '#10b981',
      type: 'positive'
    },
    {
      metric: 'Cancelled',
      value: data.cancelledSubscriptions,
      color: '#ef4444',
      type: 'negative'
    },
    {
      metric: 'Net Growth',
      value: data.netGrowth,
      color: data.netGrowth >= 0 ? '#10b981' : '#ef4444',
      type: data.netGrowth >= 0 ? 'positive' : 'negative'
    }
  ];

  return (
    <div className="bg-[#1a2332] rounded-xl border border-[#2e4e6b] p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <div className="text-right">
          <div className="text-sm text-gray-400">Churn Rate</div>
          <div className={`text-lg font-bold ${
            data.churnRate <= 5 ? 'text-green-400' :
            data.churnRate <= 10 ? 'text-yellow-400' : 'text-red-400'
          }`}>
            {data.churnRate.toFixed(1)}%
          </div>
        </div>
      </div>

      <ChartErrorBoundary>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart
            data={chartData}
            accessibilityLayer
            title="Subscription lifecycle showing new, cancelled, and net growth"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="metric"
              stroke="#9ca3af"
              fontSize={12}
              tick={{ fill: '#9ca3af' }}
            />
            <YAxis
              stroke="#9ca3af"
              fontSize={12}
              tick={{ fill: '#9ca3af' }}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div
                      className="bg-[#1f2937] border border-[#374151] rounded-lg p-3 shadow-lg"
                      role="status"
                      aria-live="assertive"
                    >
                      <p className="text-white font-medium mb-1">{label}</p>
                      <p className="text-sm" style={{ color: data.color }}>
                        {`Count: ${data.value}`}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey="value"
              radius={[4, 4, 0, 0]}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartErrorBoundary>
    </div>
  );
};
