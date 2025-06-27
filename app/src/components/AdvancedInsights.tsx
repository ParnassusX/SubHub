import React from 'react';
import { SavingsOpportunity, TopSubscription } from '../utils/analyticsEngine';

// Savings Opportunities Component
interface SavingsOpportunitiesProps {
  opportunities: SavingsOpportunity[];
}

export const SavingsOpportunities: React.FC<SavingsOpportunitiesProps> = ({ opportunities }) => {
  if (!opportunities || opportunities.length === 0) {
    return (
      <div className="bg-[#1a2332] rounded-xl border border-[#2e4e6b] p-6">
        <h3 className="text-lg font-semibold text-white mb-4">💡 Savings Opportunities</h3>
        <div className="text-center py-8">
          <div className="text-4xl mb-4">💰</div>
          <p className="text-gray-400">No savings opportunities identified yet.</p>
          <p className="text-gray-500 text-sm mt-2">Add more subscriptions to get personalized savings suggestions.</p>
        </div>
      </div>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-900/20 border-red-700';
      case 'medium': return 'text-yellow-400 bg-yellow-900/20 border-yellow-700';
      case 'low': return 'text-green-400 bg-green-900/20 border-green-700';
      default: return 'text-gray-400 bg-gray-900/20 border-gray-700';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return '🚨';
      case 'medium': return '⚠️';
      case 'low': return '💡';
      default: return '📋';
    }
  };

  const totalSavings = opportunities.reduce((sum, opp) => sum + opp.potentialSavings, 0);

  return (
    <div className="bg-[#1a2332] rounded-xl border border-[#2e4e6b] p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">💡 Savings Opportunities</h3>
        <div className="text-right">
          <p className="text-sm text-gray-400">Potential Annual Savings</p>
          <p className="text-xl font-bold text-green-400">${totalSavings.toFixed(2)}</p>
        </div>
      </div>
      
      <div className="space-y-4">
        {opportunities.map((opportunity, index) => (
          <div 
            key={index}
            className={`p-4 rounded-lg border ${getPriorityColor(opportunity.priority)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{getPriorityIcon(opportunity.priority)}</span>
                <div>
                  <h4 className="font-semibold text-white">{opportunity.title}</h4>
                  <p className="text-sm text-gray-300 mt-1">{opportunity.description}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-400">${opportunity.potentialSavings.toFixed(2)}</p>
                <p className="text-xs text-gray-400">per year</p>
              </div>
            </div>
            
            {opportunity.subscriptions.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-600">
                <p className="text-xs text-gray-400 mb-2">Affected subscriptions:</p>
                <div className="flex flex-wrap gap-2">
                  {opportunity.subscriptions.slice(0, 3).map((sub, idx) => (
                    <span 
                      key={idx}
                      className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-full"
                    >
                      {sub}
                    </span>
                  ))}
                  {opportunity.subscriptions.length > 3 && (
                    <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-full">
                      +{opportunity.subscriptions.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Top Subscriptions Table
interface TopSubscriptionsTableProps {
  data: TopSubscription[];
  title?: string;
}

export const TopSubscriptionsTable: React.FC<TopSubscriptionsTableProps> = ({ 
  data, 
  title = "Top Subscriptions by Cost" 
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-[#1a2332] rounded-xl border border-[#2e4e6b] p-6">
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📊</div>
          <p className="text-gray-400">No subscription data available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1a2332] rounded-xl border border-[#2e4e6b] p-6">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-600">
              <th className="text-left py-3 px-2 text-gray-300 font-medium">Rank</th>
              <th className="text-left py-3 px-2 text-gray-300 font-medium">Subscription</th>
              <th className="text-left py-3 px-2 text-gray-300 font-medium">Category</th>
              <th className="text-right py-3 px-2 text-gray-300 font-medium">Monthly</th>
              <th className="text-right py-3 px-2 text-gray-300 font-medium">Yearly</th>
              <th className="text-right py-3 px-2 text-gray-300 font-medium">% of Total</th>
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 10).map((subscription, index) => (
              <tr key={subscription.name} className="border-b border-gray-700 hover:bg-gray-800/50">
                <td className="py-3 px-2">
                  <span className="flex items-center justify-center w-6 h-6 bg-blue-600 text-white text-xs rounded-full">
                    {index + 1}
                  </span>
                </td>
                <td className="py-3 px-2">
                  <span className="text-white font-medium">{subscription.name}</span>
                </td>
                <td className="py-3 px-2">
                  <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-full">
                    {subscription.category}
                  </span>
                </td>
                <td className="py-3 px-2 text-right text-white font-medium">
                  ${subscription.monthlyAmount.toFixed(2)}
                </td>
                <td className="py-3 px-2 text-right text-gray-300">
                  ${subscription.yearlyAmount.toFixed(2)}
                </td>
                <td className="py-3 px-2 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <div className="w-16 bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${Math.min(subscription.percentageOfTotal, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-gray-300 text-sm w-12 text-right">
                      {subscription.percentageOfTotal.toFixed(1)}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Year over Year Comparison
interface YearOverYearProps {
  data: {
    currentYear: number;
    previousYear: number;
    change: number;
    changePercentage: number;
  };
}

export const YearOverYearComparison: React.FC<YearOverYearProps> = ({ data }) => {
  const isIncrease = data.change > 0;
  const changeColor = isIncrease ? 'text-red-400' : 'text-green-400';
  const changeIcon = isIncrease ? '📈' : '📉';
  
  return (
    <div className="bg-[#1a2332] rounded-xl border border-[#2e4e6b] p-6">
      <h3 className="text-lg font-semibold text-white mb-4">📅 Year-over-Year Comparison</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center">
          <p className="text-gray-400 text-sm mb-2">Previous Year</p>
          <p className="text-2xl font-bold text-white">${data.previousYear.toFixed(2)}</p>
        </div>
        
        <div className="text-center">
          <p className="text-gray-400 text-sm mb-2">Current Year</p>
          <p className="text-2xl font-bold text-white">${data.currentYear.toFixed(2)}</p>
        </div>
        
        <div className="text-center">
          <p className="text-gray-400 text-sm mb-2">Change</p>
          <div className="flex items-center justify-center space-x-2">
            <span className="text-xl">{changeIcon}</span>
            <div>
              <p className={`text-xl font-bold ${changeColor}`}>
                {isIncrease ? '+' : ''}${data.change.toFixed(2)}
              </p>
              <p className={`text-sm ${changeColor}`}>
                ({isIncrease ? '+' : ''}{data.changePercentage.toFixed(1)}%)
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-gray-800/50 rounded-lg">
        <p className="text-gray-300 text-sm">
          {isIncrease 
            ? `Your subscription spending has increased by $${data.change.toFixed(2)} (${data.changePercentage.toFixed(1)}%) compared to last year.`
            : `Great job! You've reduced your subscription spending by $${Math.abs(data.change).toFixed(2)} (${Math.abs(data.changePercentage).toFixed(1)}%) compared to last year.`
          }
        </p>
      </div>
    </div>
  );
};
