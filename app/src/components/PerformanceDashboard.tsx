// Performance Dashboard Component for SubHub Development
// Shows real-time performance metrics and database query times

import React, { useState, useEffect } from 'react';
import { usePerformanceMonitor } from '../utils/performanceMonitor';
import { Activity, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

const PerformanceDashboard: React.FC = () => {
  // Only render in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const { getMetrics, getAverageTime, getSlowOperations, generateReport } = usePerformanceMonitor();
  const [metrics, setMetrics] = useState<any[]>([]);
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    const updateMetrics = () => {
      setMetrics(getMetrics());
    };

    // Update metrics every 3 seconds (reduced frequency)
    const interval = setInterval(updateMetrics, 3000);
    updateMetrics(); // Initial load

    return () => clearInterval(interval);
  }, [getMetrics]);

  const recentMetrics = metrics.slice(-10); // Show last 10 operations
  const slowOps = getSlowOperations(1000); // Operations slower than 1 second
  const avgFetchTime = getAverageTime('fetch_subscriptions_paginated');
  const avgLoadMoreTime = getAverageTime('load_more_subscriptions');

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-50">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
            <h3 className="text-white font-semibold">Performance Monitor</h3>
          </div>
          <button
            onClick={() => setShowReport(!showReport)}
            className="text-xs text-gray-400 hover:text-white"
          >
            {showReport ? 'Hide' : 'Report'}
          </button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-800 p-3 rounded">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-green-400" />
              <span className="text-xs text-gray-400">Avg Fetch</span>
            </div>
            <div className="text-lg font-bold text-white">
              {avgFetchTime > 0 ? `${avgFetchTime.toFixed(0)}ms` : 'N/A'}
            </div>
          </div>

          <div className="bg-gray-800 p-3 rounded">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-gray-400">Avg Load More</span>
            </div>
            <div className="text-lg font-bold text-white">
              {avgLoadMoreTime > 0 ? `${avgLoadMoreTime.toFixed(0)}ms` : 'N/A'}
            </div>
          </div>
        </div>

        {/* Slow Operations Alert */}
        {slowOps.length > 0 && (
          <div className="bg-yellow-900/50 border border-yellow-600 p-3 rounded mb-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-yellow-400 font-medium">
                {slowOps.length} Slow Operation{slowOps.length > 1 ? 's' : ''}
              </span>
            </div>
            <div className="text-xs text-yellow-200">
              Operations taking longer than 1 second detected
            </div>
          </div>
        )}

        {/* Recent Operations */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-300">Recent Operations</h4>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {recentMetrics.length === 0 ? (
              <div className="text-xs text-gray-500 text-center py-2">
                No operations recorded yet
              </div>
            ) : (
              recentMetrics.reverse().map((metric, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-xs bg-gray-800 p-2 rounded"
                >
                  <div className="flex items-center gap-2">
                    {metric.success ? (
                      <CheckCircle className="w-3 h-3 text-green-400" />
                    ) : (
                      <AlertTriangle className="w-3 h-3 text-red-400" />
                    )}
                    <span className="text-gray-300 truncate">
                      {metric.operation.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <span className={`font-mono ${
                    (metric.duration || 0) > 1000 ? 'text-yellow-400' : 
                    (metric.duration || 0) > 2000 ? 'text-red-400' : 'text-gray-400'
                  }`}>
                    {metric.duration ? `${metric.duration.toFixed(0)}ms` : 'N/A'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Performance Report */}
        {showReport && (
          <div className="mt-4 pt-4 border-t border-gray-700">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Performance Report</h4>
            <pre className="text-xs text-gray-400 bg-gray-800 p-2 rounded overflow-auto max-h-40">
              {generateReport()}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceDashboard;
