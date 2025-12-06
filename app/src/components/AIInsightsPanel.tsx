import React, { useMemo } from 'react';
import { Sparkles, TrendingDown, Package, DollarSign, ChevronRight } from 'lucide-react';
import { useSubscriptions } from '../contexts/SubscriptionContext';
import { AIInsightsService, AIInsight } from '../services/aiInsightsService';

const AIInsightsPanel: React.FC = () => {
  const { subscriptions } = useSubscriptions();

  // Generate insights
  const insights = useMemo(() => {
    return AIInsightsService.generateInsights(subscriptions);
  }, [subscriptions]);

  const totalSavings = useMemo(() => {
    return AIInsightsService.getTotalPotentialSavings(insights);
  }, [insights]);

  // Show only top 3 insights
  const topInsights = insights.slice(0, 3);

  if (topInsights.length === 0) {
    return (
      <div className="glass-card p-6 animate-fade-in">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">AI Insights</h3>
            <p className="text-sm text-gray-400">Powered by smart analysis</p>
          </div>
        </div>

        <div className="text-center py-8">
          <div className="text-4xl mb-2">✨</div>
          <p className="text-gray-300 font-medium">Looking Good!</p>
          <p className="text-sm text-gray-400 mt-1">
            No optimization opportunities found right now.
          </p>
        </div>
      </div>
    );
  }

  const getPriorityColor = (priority: AIInsight['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-600 text-red-100';
      case 'medium':
        return 'bg-yellow-600 text-yellow-100';
      case 'low':
        return 'bg-blue-600 text-blue-100';
    }
  };

  const getTypeIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'cost_saving':
        return <DollarSign className="w-4 h-4" />;
      case 'duplicate':
        return <Package className="w-4 h-4" />;
      case 'bundle':
        return <Package className="w-4 h-4" />;
      case 'optimization':
        return <TrendingDown className="w-4 h-4" />;
      case 'unused':
        return <TrendingDown className="w-4 h-4" />;
    }
  };

  return (
    <div className="glass-card p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">AI Insights</h3>
            <p className="text-sm text-gray-400">Smart optimization suggestions</p>
          </div>
        </div>

        {totalSavings > 0 && (
          <div className="text-right">
            <p className="text-2xl font-bold text-green-400">
              ${totalSavings.toFixed(2)}
            </p>
            <p className="text-xs text-gray-400">potential savings/mo</p>
          </div>
        )}
      </div>

      {/* Insights List */}
      <div className="space-y-3">
        {topInsights.map((insight, index) => (
          <div
            key={insight.id}
            className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-gray-600 transition-smooth hover-lift cursor-pointer"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className="text-2xl flex-shrink-0 mt-1">{insight.icon}</div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="text-sm font-medium text-white">
                    {insight.title}
                  </h4>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(insight.priority)} flex-shrink-0`}>
                    {insight.priority}
                  </span>
                </div>

                <p className="text-xs text-gray-400 mb-2">
                  {insight.description}
                </p>

                {insight.potentialSavings && (
                  <div className="flex items-center gap-2 text-xs text-green-400 mb-2">
                    <TrendingDown className="w-3 h-3" />
                    <span>Save ${insight.potentialSavings.toFixed(2)}/month</span>
                  </div>
                )}

                {insight.action && (
                  <div className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors">
                    {getTypeIcon(insight.type)}
                    <span>{insight.action}</span>
                    <ChevronRight className="w-3 h-3" />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View More */}
      {insights.length > 3 && (
        <button className="w-full mt-4 py-2 text-sm text-blue-400 hover:text-blue-300 transition-colors text-center">
          View {insights.length - 3} more insight{insights.length - 3 > 1 ? 's' : ''} →
        </button>
      )}

      {/* Footer Note */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <p className="text-xs text-gray-500 text-center">
          💡 These suggestions are generated using intelligent analysis of your subscription patterns
        </p>
      </div>
    </div>
  );
};

export default AIInsightsPanel;
