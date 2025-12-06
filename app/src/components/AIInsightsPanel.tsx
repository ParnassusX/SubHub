import React, { useMemo, useState, useEffect } from 'react';
import { Sparkles, TrendingDown, Package, DollarSign, ChevronRight, Zap } from 'lucide-react';
import { useSubscriptions } from '../contexts/SubscriptionContext';
import { AIInsightsService, AIInsight } from '../services/aiInsightsService';
import { RealAIService } from '../services/realAIService';

const AIInsightsPanel: React.FC = () => {
  const { subscriptions } = useSubscriptions();
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiRecommendations, setAIRecommendations] = useState<any[]>([]);
  const [useRealAI, setUseRealAI] = useState(false);

  // Check if AI is configured
  useEffect(() => {
    setUseRealAI(RealAIService.isConfigured());
  }, []);

  // Load AI recommendations if available
  useEffect(() => {
    const loadAIRecommendations = async () => {
      if (useRealAI && subscriptions.length > 0) {
        setIsLoadingAI(true);
        try {
          const recommendations = await RealAIService.generateRecommendations(subscriptions);
          setAIRecommendations(recommendations);
        } catch (error) {
          console.error('Failed to load AI recommendations:', error);
          // Gracefully fallback - don't show error to user, just use local insights
          setUseRealAI(false);
          setAIRecommendations([]);
        } finally {
          setIsLoadingAI(false);
        }
      }
    };

    loadAIRecommendations();
  }, [useRealAI, subscriptions]);

  // Generate insights (combines rule-based + AI)
  const insights = useMemo(() => {
    const ruleBasedInsights = AIInsightsService.generateInsights(subscriptions);
    
    // If we have AI recommendations, prioritize them
    if (aiRecommendations.length > 0) {
      const aiInsights: AIInsight[] = aiRecommendations.map(rec => ({
        id: rec.id,
        type: rec.type as any,
        priority: rec.confidence > 0.8 ? 'high' as const : 'medium' as const,
        title: rec.title,
        description: rec.description,
        potentialSavings: rec.potentialSavings,
        subscriptionIds: [],
        action: rec.actionable ? 'Review and take action' : undefined,
        icon: '🤖'
      }));
      
      // Merge AI insights with rule-based, AI takes priority
      return [...aiInsights, ...ruleBasedInsights].slice(0, 5);
    }
    
    return ruleBasedInsights;
  }, [subscriptions, aiRecommendations]);

  const totalSavings = useMemo(() => {
    return AIInsightsService.getTotalPotentialSavings(insights);
  }, [insights]);

  // Show only top 3 insights
  const topInsights = insights.slice(0, 3);

  if (topInsights.length === 0) {
    return (
      <div className="glass-card p-6 animate-fade-in">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-700 rounded-lg flex items-center justify-center shadow-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Smart Insights</h3>
            <p className="text-sm text-gray-400">
              {useRealAI ? (
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-yellow-400" />
                  AI Powered
                </span>
              ) : (
                'Smart analysis'
              )}
            </p>
          </div>
        </div>

        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gradient-to-br from-green-600/20 to-green-700/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-3xl">✨</span>
          </div>
          <p className="text-gray-300 font-medium mb-2">🎉 You're doing great!</p>
          <p className="text-sm text-gray-400 mb-4">
            No optimization opportunities found. Your subscriptions are well-managed.
          </p>
          {subscriptions.length > 0 && (
            <p className="text-xs text-gray-500">
              {subscriptions.length} subscription{subscriptions.length > 1 ? 's' : ''} tracked
            </p>
          )}
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
      {/* Header with modern design */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg hover-scale transition-smooth">
            {isLoadingAI ? (
              <div className="animate-spin">⟳</div>
            ) : useRealAI ? (
              <Zap className="w-5 h-5 text-white" />
            ) : (
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              Smart Insights
              {useRealAI && (
                <span className="text-xs px-2 py-0.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full animate-pulse shadow-lg">
                  ⚡ AI POWERED
                </span>
              )}
            </h3>
            <p className="text-sm text-gray-400">
              {isLoadingAI ? 'Analyzing your subscriptions...' :
               useRealAI ? 'AI-powered recommendations' : 'Rule-based optimization suggestions'}
            </p>
          </div>
        </div>

        {totalSavings > 0 && (
          <div className="text-right bg-gradient-to-br from-green-600/10 to-green-700/10 px-4 py-2 rounded-lg border border-green-600/20">
            <p className="text-2xl font-bold text-green-400 flex items-center gap-1">
              ${totalSavings.toFixed(2)}
            </p>
            <p className="text-xs text-gray-400">potential savings/mo</p>
          </div>
        )}
      </div>

      {/* Insights List with modern cards */}
      <div className="space-y-3">
        {isLoadingAI && topInsights.length === 0 ? (
          // Loading skeleton
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 animate-pulse">
              <div className="flex items-start gap-3">
                <div className="skeleton h-8 w-8 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 w-3/4"></div>
                  <div className="skeleton h-3 w-full"></div>
                  <div className="skeleton h-3 w-1/2"></div>
                </div>
              </div>
            </div>
          ))
        ) : (
          topInsights.map((insight, index) => (
            <div
              key={insight.id}
              className="p-4 bg-gradient-to-br from-gray-800/50 to-gray-850/50 rounded-lg border border-gray-700 hover:border-blue-500/50 hover:shadow-lg transition-smooth hover-lift cursor-pointer group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
            <div className="flex items-start gap-3">
              {/* Icon with modern styling */}
              <div className="text-2xl flex-shrink-0 mt-1 group-hover:scale-110 transition-transform">{insight.icon}</div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">
                    {insight.title}
                  </h4>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(insight.priority)} flex-shrink-0 shadow-sm`}>
                    {insight.priority}
                  </span>
                </div>

                <p className="text-xs text-gray-400 mb-2 group-hover:text-gray-300 transition-colors">
                  {insight.description}
                </p>

                {insight.potentialSavings && (
                  <div className="flex items-center gap-2 text-xs text-green-400 mb-2 font-medium">
                    <TrendingDown className="w-3 h-3" />
                    <span>💰 Save ${insight.potentialSavings.toFixed(2)}/month</span>
                  </div>
                )}

                {insight.action && (
                  <div className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium">
                    {getTypeIcon(insight.type)}
                    <span>{insight.action}</span>
                    <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))
        )}
      </div>

      {/* View More with modern button */}
      {insights.length > 3 && (
        <button className="w-full mt-4 py-3 text-sm text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg transition-smooth hover-lift shadow-md font-medium flex items-center justify-center gap-2">
          View {insights.length - 3} more insight{insights.length - 3 > 1 ? 's' : ''} 
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      {/* Footer Note with modern styling */}
      <div className="mt-4 pt-4 border-t border-gray-700/50">
        <p className="text-xs text-gray-500 text-center flex items-center justify-center gap-1">
          <Sparkles className="w-3 h-3" />
          {useRealAI ? 
            'AI-powered recommendations based on your subscription patterns' :
            'Smart suggestions generated from intelligent analysis'
          }
        </p>
      </div>
    </div>
  );
};

export default AIInsightsPanel;
