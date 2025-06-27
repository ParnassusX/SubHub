import React from 'react';
import { SpendingInsight, RenewalInsight, CategoryInsight } from '../utils/insightCalculations';
import { getSeverityColors, CategoryBadge } from '../utils/categoryColors';

// Spending Insight Card
interface SpendingInsightCardProps {
  insight: SpendingInsight;
  onViewDetails?: () => void;
}

export const SpendingInsightCard: React.FC<SpendingInsightCardProps> = ({ 
  insight, 
  onViewDetails 
}) => {
  const severityColors = getSeverityColors(insight.severity);
  
  const getIcon = () => {
    switch (insight.type) {
      case 'spending_increase':
        return '📈';
      case 'spending_decrease':
        return '📉';
      default:
        return '📊';
    }
  };

  return (
    <div className={`rounded-xl border-2 p-6 transition-all hover:shadow-md ${severityColors.bg} ${severityColors.border}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{getIcon()}</span>
          <div>
            <h3 className={`font-semibold ${severityColors.text}`}>Spending Trend</h3>
            <p className={`text-sm opacity-80 ${severityColors.text}`}>{insight.message}</p>
          </div>
        </div>
        
        {insight.severity !== 'low' && onViewDetails && (
          <button 
            onClick={onViewDetails}
            className="rounded-lg bg-white px-3 py-1 text-sm font-medium shadow-sm hover:shadow-md transition-shadow"
          >
            View Details
          </button>
        )}
      </div>
      
      {insight.recommendation && (
        <div className="mt-4 rounded-lg bg-white bg-opacity-50 p-3">
          <p className={`text-sm font-medium ${severityColors.text}`}>💡 Recommendation</p>
          <p className={`text-sm opacity-80 ${severityColors.text}`}>{insight.recommendation}</p>
        </div>
      )}
    </div>
  );
};

// Renewal Insight Card
interface RenewalInsightCardProps {
  insight: RenewalInsight;
  onViewUpcoming?: () => void;
}

export const RenewalInsightCard: React.FC<RenewalInsightCardProps> = ({ 
  insight, 
  onViewUpcoming 
}) => {
  const getSeverityLevel = () => {
    if (insight.urgentCount > 0) return 'high';
    if (insight.weekCount > 0) return 'medium';
    return 'low';
  };

  const severityColors = getSeverityColors(getSeverityLevel());

  return (
    <div className={`rounded-xl border-2 p-6 transition-all hover:shadow-md ${severityColors.bg} ${severityColors.border}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">🔔</span>
          <div>
            <h3 className={`font-semibold ${severityColors.text}`}>Upcoming Renewals</h3>
            <p className={`text-sm opacity-80 ${severityColors.text}`}>{insight.message}</p>
          </div>
        </div>
        
        {insight.actionable && onViewUpcoming && (
          <button 
            onClick={onViewUpcoming}
            className="rounded-lg bg-white px-3 py-1 text-sm font-medium shadow-sm hover:shadow-md transition-shadow"
          >
            View All
          </button>
        )}
      </div>
      
      {insight.nextRenewal && (
        <div className="mt-4 rounded-lg bg-white bg-opacity-50 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${severityColors.text}`}>Next: {insight.nextRenewal.name}</p>
              <p className={`text-xs opacity-80 ${severityColors.text}`}>
                {insight.nextRenewal.daysUntil === 0 ? 'Today' : 
                 insight.nextRenewal.daysUntil === 1 ? 'Tomorrow' : 
                 `In ${insight.nextRenewal.daysUntil} days`}
              </p>
            </div>
            <p className={`text-sm font-bold ${severityColors.text}`}>${insight.nextRenewal.cost}</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Category Insight Card
interface CategoryInsightCardProps {
  insight: CategoryInsight;
  onViewBreakdown?: () => void;
}

export const CategoryInsightCard: React.FC<CategoryInsightCardProps> = ({
  insight,
  onViewBreakdown
}) => {

  return (
    <div className="rounded-xl border-2 p-6 transition-all hover:shadow-md border-[#2e4e6b] bg-[#1a2332]">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">📊</span>
          <div>
            <h3 className="font-semibold text-white">Category Breakdown</h3>
            <p className="text-sm opacity-80 text-gray-300">{insight.message}</p>
          </div>
        </div>
        
        {onViewBreakdown && (
          <button 
            onClick={onViewBreakdown}
            className="rounded-lg bg-white px-3 py-1 text-sm font-medium shadow-sm hover:shadow-md transition-shadow text-gray-800"
          >
            View All
          </button>
        )}
      </div>
      
      <div className="mt-4 space-y-2">
        {insight.breakdown.slice(0, 3).map((category) => (
          <div key={category.category} className="flex items-center justify-between p-2 rounded-lg bg-[#0f1a24]">
            <div className="flex items-center space-x-2">
              <CategoryBadge category={category.category} />
            </div>
            <div className="text-right">
              <p className="text-white font-medium">${category.amount.toFixed(2)}</p>
              <p className="text-gray-400 text-xs">{category.percentage.toFixed(1)}%</p>
            </div>
          </div>
        ))}
        
        {insight.breakdown.length > 3 && (
          <p className="text-center text-gray-400 text-sm pt-2">
            And {insight.breakdown.length - 3} more categories...
          </p>
        )}
      </div>
    </div>
  );
};

// Quick Action Button
interface QuickActionButtonProps {
  onClick: () => void;
  icon: string;
  label: string;
  className?: string;
}

export const QuickActionButton: React.FC<QuickActionButtonProps> = ({
  onClick,
  icon,
  label,
  className = ''
}) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors ${className}`}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
};

// Summary Card with enhanced styling
interface SummaryCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue
}) => {
  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-400';
      case 'down':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return '↗️';
      case 'down':
        return '↘️';
      default:
        return '➡️';
    }
  };

  return (
    <div className="flex flex-col gap-2 rounded-xl p-6 border border-[#2e4e6b] bg-[#1a2332] min-w-0">
      <div className="flex items-center justify-between">
        <p className="text-white text-base font-medium leading-normal">{title}</p>
        {icon && <span className="text-lg">{icon}</span>}
      </div>
      
      <p className="text-white tracking-light text-2xl font-bold leading-tight">
        {typeof value === 'number' ? `$${value.toFixed(2)}` : value}
      </p>
      
      <div className="flex items-center justify-between">
        {subtitle && (
          <p className="text-xs text-gray-400">{subtitle}</p>
        )}
        {trend && trendValue && (
          <div className={`flex items-center space-x-1 text-xs ${getTrendColor()}`}>
            <span>{getTrendIcon()}</span>
            <span>{trendValue}</span>
          </div>
        )}
      </div>
    </div>
  );
};
