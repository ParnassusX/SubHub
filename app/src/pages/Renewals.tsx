import React, { useState, useEffect } from 'react';
import { useSubscriptions } from '../contexts/SubscriptionContext';
import { calculateNextRenewal, calculateDaysUntil } from '../utils/insightCalculations';
import { useCurrency } from '../hooks/useCurrency';
import { useNavigate } from 'react-router-dom';

interface RenewalItem {
  id: string;
  name: string;
  cost: number;
  frequency: 'Monthly' | 'Yearly';
  category: string;
  nextRenewalDate: Date;
  daysUntil: number;
  urgencyLevel: 'overdue' | 'urgent' | 'soon' | 'upcoming';
}

const Renewals: React.FC = () => {
  const { subscriptions } = useSubscriptions();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  const [renewals, setRenewals] = useState<RenewalItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'overdue' | 'urgent' | 'soon' | 'upcoming'>('all');

  useEffect(() => {
    const processRenewals = () => {
      const renewalItems: RenewalItem[] = subscriptions
        .map(sub => {
          const nextRenewalDate = calculateNextRenewal(sub);
          const daysUntil = calculateDaysUntil(nextRenewalDate);
          
          let urgencyLevel: 'overdue' | 'urgent' | 'soon' | 'upcoming';
          if (daysUntil < 0) urgencyLevel = 'overdue';
          else if (daysUntil <= 3) urgencyLevel = 'urgent';
          else if (daysUntil <= 7) urgencyLevel = 'soon';
          else urgencyLevel = 'upcoming';

          return {
            id: sub.id,
            name: sub.name,
            cost: sub.cost,
            frequency: sub.frequency,
            category: sub.category,
            nextRenewalDate,
            daysUntil,
            urgencyLevel
          };
        })
        .sort((a, b) => a.daysUntil - b.daysUntil);

      setRenewals(renewalItems);
    };

    processRenewals();
  }, [subscriptions]);

  const filteredRenewals = renewals.filter(renewal => {
    if (filter === 'all') return true;
    return renewal.urgencyLevel === filter;
  });

  const getUrgencyColor = (urgencyLevel: string) => {
    switch (urgencyLevel) {
      case 'overdue': return 'bg-red-600/20 border-red-500 text-red-300';
      case 'urgent': return 'bg-orange-600/20 border-orange-500 text-orange-300';
      case 'soon': return 'bg-yellow-600/20 border-yellow-500 text-yellow-300';
      case 'upcoming': return 'bg-blue-600/20 border-blue-500 text-blue-300';
      default: return 'bg-gray-600/20 border-gray-500 text-gray-300';
    }
  };

  const getUrgencyText = (daysUntil: number) => {
    if (daysUntil < 0) return `Overdue by ${Math.abs(daysUntil)} day${Math.abs(daysUntil) > 1 ? 's' : ''}`;
    if (daysUntil === 0) return 'Due today';
    if (daysUntil === 1) return 'Due tomorrow';
    return `Due in ${daysUntil} days`;
  };

  const urgencyCounts = {
    overdue: renewals.filter(r => r.urgencyLevel === 'overdue').length,
    urgent: renewals.filter(r => r.urgencyLevel === 'urgent').length,
    soon: renewals.filter(r => r.urgencyLevel === 'soon').length,
    upcoming: renewals.filter(r => r.urgencyLevel === 'upcoming').length,
  };

  return (
    <div className="flex-1 bg-[#0f1a24] h-full overflow-y-auto overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-6 w-full max-w-full">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-white tracking-light text-2xl sm:text-[32px] font-bold leading-tight">
            Upcoming Renewals
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-full min-w-0 p-4 sm:p-6">
        <div className="bg-[#1a2332] rounded-xl border border-[#2e4e6b] p-6">
          
          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              All ({renewals.length})
            </button>
            <button
              onClick={() => setFilter('overdue')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'overdue' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Overdue ({urgencyCounts.overdue})
            </button>
            <button
              onClick={() => setFilter('urgent')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'urgent' 
                  ? 'bg-orange-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Urgent ({urgencyCounts.urgent})
            </button>
            <button
              onClick={() => setFilter('soon')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'soon' 
                  ? 'bg-yellow-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              This Week ({urgencyCounts.soon})
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'upcoming' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Upcoming ({urgencyCounts.upcoming})
            </button>
          </div>

          {/* Renewals List */}
          <div className="space-y-4">
            {filteredRenewals.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-gray-400 text-2xl">📅</span>
                </div>
                <p className="text-gray-400 text-lg mb-2">No renewals found</p>
                <p className="text-gray-500">
                  {filter === 'all' 
                    ? 'You have no upcoming subscription renewals.' 
                    : `No ${filter} renewals at this time.`}
                </p>
              </div>
            ) : (
              filteredRenewals.map((renewal) => (
                <div
                  key={renewal.id}
                  className={`p-4 rounded-lg border-2 ${getUrgencyColor(renewal.urgencyLevel)} hover:bg-opacity-30 transition-all duration-200`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm font-bold">
                          {renewal.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-lg">{renewal.name}</h3>
                        <p className="text-gray-400 text-sm">{renewal.category} • {renewal.frequency}</p>
                        <p className="text-sm font-medium mt-1">
                          {getUrgencyText(renewal.daysUntil)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white text-xl font-bold">{formatPrice(renewal.cost)}</p>
                      <p className="text-gray-400 text-sm">
                        {renewal.nextRenewalDate.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Summary */}
          {filteredRenewals.length > 0 && (
            <div className="mt-6 pt-6 border-t border-[#2e4e6b]">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">
                    {formatPrice(filteredRenewals.reduce((sum, r) => sum + r.cost, 0))}
                  </p>
                  <p className="text-gray-400 text-sm">Total Amount</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{filteredRenewals.length}</p>
                  <p className="text-gray-400 text-sm">Renewals</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-400">{urgencyCounts.urgent}</p>
                  <p className="text-gray-400 text-sm">Urgent</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-400">{urgencyCounts.overdue}</p>
                  <p className="text-gray-400 text-sm">Overdue</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Renewals;
