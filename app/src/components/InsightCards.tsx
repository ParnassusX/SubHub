import React from 'react';
import { SpendingInsight, RenewalInsight, CategoryInsight } from '../utils/insightCalculations';
import { getCategoryHex } from '../utils/categoryColors';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Bell,
  Calendar,
  CreditCard,
  DollarSign,
  ArrowRight,
  Lightbulb
} from 'lucide-react';

// Spending Insight Card
interface SpendingInsightCardProps {
  insight: SpendingInsight;
  onViewDetails?: () => void;
}

export const SpendingInsightCard: React.FC<SpendingInsightCardProps> = ({
  insight,
  onViewDetails
}) => {
  const getIcon = () => {
    switch (insight.type) {
      case 'spending_increase':
        return TrendingUp;
      case 'spending_decrease':
        return TrendingDown;
      default:
        return BarChart3;
    }
  };

  const IconComponent = getIcon();

  return (
    <div className="elevated-card p-6 interactive">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-primary-500/20">
            <IconComponent className="w-6 h-6 text-primary-400" />
          </div>
          <div>
            <h3 className="text-heading-2 font-semibold text-white">Spending Trend</h3>
            <p className="text-body text-gray-300 mt-1">{insight.message}</p>
          </div>
        </div>

        {insight.severity !== 'low' && onViewDetails && (
          <button
            onClick={onViewDetails}
            className="btn-glass flex items-center space-x-2 group"
          >
            <span>View Details</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        )}
      </div>

      {insight.recommendation && (
        <div className="mt-6 glass-card p-4">
          <div className="flex items-start space-x-3">
            <Lightbulb className="w-5 h-5 text-warning-400 mt-0.5" />
            <div>
              <p className="text-caption font-medium text-warning-400 uppercase tracking-wide">Recommendation</p>
              <p className="text-body text-gray-300 mt-1">{insight.recommendation}</p>
            </div>
          </div>
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

  const getSeverityColors = (level: string) => {
    switch (level) {
      case 'high': return { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500' };
      case 'medium': return { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500' };
      default: return { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500' };
    }
  };

  const severityColors = getSeverityColors(getSeverityLevel());

  return (
    <div className="elevated-card p-6 interactive">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-warning-500/20">
            <Bell className="w-6 h-6 text-warning-400" />
          </div>
          <div>
            <h3 className="text-heading-2 font-semibold text-white">Upcoming Renewals</h3>
            <p className="text-body text-gray-300 mt-1">{insight.message}</p>
          </div>
        </div>

        {insight.actionable && onViewUpcoming && (
          <button
            onClick={onViewUpcoming}
            className="btn-glass flex items-center space-x-2 group"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
    <div className="elevated-card p-6 interactive">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-info-500/20">
            <BarChart3 className="w-6 h-6 text-info-400" />
          </div>
          <div>
            <h3 className="text-heading-2 font-semibold text-white">Category Breakdown</h3>
            <p className="text-body text-gray-300 mt-1">{insight.message}</p>
          </div>
        </div>

        {onViewBreakdown && (
          <button
            onClick={onViewBreakdown}
            className="btn-glass flex items-center space-x-2 group"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        )}
      </div>
      
      <div className="mt-4 space-y-2">
        {insight.breakdown.slice(0, 3).map((category) => (
          <div key={category.category} className="flex items-center justify-between p-2 rounded-lg bg-[#0f1a24]">
            <div className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getCategoryHex(category.category) }}
              />
              <span className="text-gray-300 text-sm">{category.category}</span>
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

// Quick Action Button with Professional Icons
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
  // Map emoji icons to Lucide icons
  const getIconComponent = () => {
    switch (icon) {
      case '➕':
        return <CreditCard className="w-4 h-4" />;
      default:
        return <span>{icon}</span>;
    }
  };

  return (
    <button
      onClick={onClick}
      className={`btn-primary flex items-center space-x-2 group ${className}`}
    >
      {getIconComponent()}
      <span>{label}</span>
      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
        return TrendingUp;
      case 'down':
        return TrendingDown;
      default:
        return ArrowRight;
    }
  };

  const TrendIcon = getTrendIcon();

  // Map emoji icons to Lucide icons
  const getIconComponent = () => {
    switch (icon) {
      case '💰':
        return DollarSign;
      case '📅':
        return Calendar;
      case '📱':
        return CreditCard;
      case '🔔':
        return Bell;
      default:
        return BarChart3;
    }
  };

  const IconComponent = getIconComponent();

  return (
    <div className="elevated-card p-6 min-w-0 interactive">
      <div className="flex items-center justify-between mb-4">
        <p className="text-white text-body font-medium">{title}</p>
        <div className="p-2 rounded-lg bg-primary-500/20">
          <IconComponent className="w-5 h-5 text-primary-400" />
        </div>
      </div>

      <p className="text-white text-heading-1 font-bold mb-3">
        {typeof value === 'number' ? `$${value.toFixed(2)}` : value}
      </p>

      <div className="flex items-center justify-between">
        {subtitle && (
          <p className="text-caption text-gray-400">{subtitle}</p>
        )}
        {trend && trendValue && (
          <div className={`flex items-center space-x-1 text-caption ${getTrendColor()}`}>
            <TrendIcon className="w-3 h-3" />
            <span>{trendValue}</span>
          </div>
        )}
      </div>
    </div>
  );
};
