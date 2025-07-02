// Budget Optimization Component - Display intelligent budget recommendations
import React, { useMemo, useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useCurrency } from '../../hooks/useCurrency';
import { useBudget } from '../../hooks/useBudget';
import { useSubscriptions } from '../../contexts/SubscriptionContext';
import { 
  BudgetOptimizationService, 
  OptimizationRecommendation,
  BudgetOptimizationAnalysis 
} from '../../services/budgetOptimizationService';

interface BudgetOptimizationProps {
  className?: string;
  maxRecommendations?: number;
}

const BudgetOptimization: React.FC<BudgetOptimizationProps> = ({
  className = '',
  maxRecommendations = 5
}) => {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const { monthlyBudget, yearlyBudget, categoryBudgets } = useBudget();
  const { subscriptions } = useSubscriptions();
  const [activeTab, setActiveTab] = useState<'all' | 'quick' | 'longterm'>('all');

  // Generate optimization analysis
  const analysis = useMemo((): BudgetOptimizationAnalysis | null => {
    if (subscriptions.length === 0) return null;
    
    return BudgetOptimizationService.analyzeBudgetOptimization(
      subscriptions,
      monthlyBudget || undefined,
      yearlyBudget || undefined,
      categoryBudgets
    );
  }, [subscriptions, monthlyBudget, yearlyBudget, categoryBudgets]);

  // Get recommendations to display based on active tab
  const displayRecommendations = useMemo(() => {
    if (!analysis) return [];
    
    let recommendations: OptimizationRecommendation[] = [];
    
    switch (activeTab) {
      case 'quick':
        recommendations = analysis.quickWins;
        break;
      case 'longterm':
        recommendations = analysis.longTermOptimizations;
        break;
      default:
        recommendations = analysis.recommendations;
    }
    
    return recommendations.slice(0, maxRecommendations);
  }, [analysis, activeTab, maxRecommendations]);

  // Get recommendation icon
  const getRecommendationIcon = (recommendation: OptimizationRecommendation) => {
    switch (recommendation.type) {
      case 'reduce_spending': return '💰';
      case 'cancel_subscription': return '❌';
      case 'consolidate': return '📦';
      case 'optimize_frequency': return '📅';
      case 'reallocate': return '🔄';
      case 'increase_budget': return '📈';
      default: return '💡';
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      default: return 'text-green-400';
    }
  };

  // Get priority background
  const getPriorityBg = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-900/20 border-red-700/50';
      case 'medium': return 'bg-yellow-900/20 border-yellow-700/50';
      default: return 'bg-green-900/20 border-green-700/50';
    }
  };

  // Get effort badge
  const getEffortBadge = (effort: string) => {
    const colors = {
      easy: 'bg-green-900/30 text-green-400',
      moderate: 'bg-yellow-900/30 text-yellow-400',
      difficult: 'bg-red-900/30 text-red-400'
    };
    
    return colors[effort as keyof typeof colors] || colors.moderate;
  };

  if (!analysis) {
    return (
      <div className={`bg-[#1a2332] rounded-xl border border-[#2e4e6b] p-6 ${className}`}>
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">
            <svg className="w-12 h-12 mx-auto opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h4 className="text-white font-medium mb-2">{t('noOptimizationData')}</h4>
          <p className="text-gray-400 text-sm">
            {t('addSubscriptionsForOptimization')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-[#1a2332] rounded-xl border border-[#2e4e6b] p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold text-white">{t('budgetOptimizationTitle')}</h3>
          <div className="flex items-center space-x-1">
            <span className="text-sm text-gray-400">{t('score')}:</span>
            <span className={`text-sm font-bold ${
              analysis.overallScore >= 80 ? 'text-green-400' :
              analysis.overallScore >= 60 ? 'text-yellow-400' :
              'text-red-400'
            }`}>
              {analysis.overallScore}/100
            </span>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-gray-800/30 rounded-lg">
          <p className="text-green-400 text-lg font-bold">
            {formatPrice(analysis.insights.totalPotentialSavings)}
          </p>
          <p className="text-gray-400 text-xs">{t('potentialSavings')}</p>
        </div>
        
        <div className="text-center p-3 bg-gray-800/30 rounded-lg">
          <p className="text-red-400 text-lg font-bold">
            {analysis.insights.highPriorityActions}
          </p>
          <p className="text-gray-400 text-xs">{t('highPriorityActions')}</p>
        </div>
        
        <div className="text-center p-3 bg-gray-800/30 rounded-lg">
          <p className="text-blue-400 text-lg font-bold">
            {analysis.quickWins.length}
          </p>
          <p className="text-gray-400 text-xs">{t('quickWins')}</p>
        </div>
        
        <div className="text-center p-3 bg-gray-800/30 rounded-lg">
          <p className="text-purple-400 text-lg font-bold">
            {analysis.insights.spendingEfficiency}%
          </p>
          <p className="text-gray-400 text-xs">{t('efficiency')}</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-4 bg-gray-800/30 rounded-lg p-1">
        {[
          { id: 'all', label: t('allRecommendations'), count: analysis.recommendations.length },
          { id: 'quick', label: t('quickWins'), count: analysis.quickWins.length },
          { id: 'longterm', label: t('longTerm'), count: analysis.longTermOptimizations.length }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Recommendations List */}
      {displayRecommendations.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400">{t('noRecommendationsInCategory')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayRecommendations.map(recommendation => (
            <div
              key={recommendation.id}
              className={`p-4 rounded-lg border ${getPriorityBg(recommendation.priority)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="text-lg flex-shrink-0">
                    {getRecommendationIcon(recommendation)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className={`font-medium ${getPriorityColor(recommendation.priority)}`}>
                        {recommendation.title}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${getEffortBadge(recommendation.effort)}`}>
                          {t(recommendation.effort)}
                        </span>
                        {recommendation.potentialSavings && (
                          <span className="text-green-400 text-sm font-medium">
                            {formatPrice(recommendation.potentialSavings)}/mo
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-300 mb-2">
                      {recommendation.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-xs text-gray-400">
                        <span>{t('impact')}: {t(recommendation.impact)}</span>
                        {recommendation.category && (
                          <span>{t('category')}: {recommendation.category}</span>
                        )}
                      </div>

                      {recommendation.actionable && (
                        <button className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                          {t('takeAction')} →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Category Issues */}
      {analysis.insights.categoryIssues.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-700">
          <h4 className="text-sm font-medium text-gray-300 mb-3">
            {t('categoriesNeedingAttention')}
          </h4>
          <div className="flex flex-wrap gap-2">
            {analysis.insights.categoryIssues.map(category => (
              <span
                key={category}
                className="px-3 py-1 bg-yellow-900/30 text-yellow-400 text-xs rounded-full"
              >
                {category}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetOptimization;
