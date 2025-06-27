import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ChartErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Chart rendering error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <ChartFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}

interface ChartFallbackProps {
  error?: Error;
  title?: string;
  message?: string;
}

export const ChartFallback: React.FC<ChartFallbackProps> = ({ 
  error, 
  title = "Chart Unavailable",
  message = "Unable to display chart at this time. Please try refreshing the page."
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-64 bg-[#1a2332] rounded-xl border border-[#2e4e6b] p-6">
      <div className="text-center">
        <div className="text-4xl mb-4">📊</div>
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <p className="text-gray-400 text-sm mb-4">{message}</p>
        {error && process.env.NODE_ENV === 'development' && (
          <details className="text-xs text-gray-500 mt-4">
            <summary className="cursor-pointer">Error Details</summary>
            <pre className="mt-2 text-left bg-gray-800 p-2 rounded overflow-auto">
              {error.message}
            </pre>
          </details>
        )}
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
        >
          Refresh Page
        </button>
      </div>
    </div>
  );
};

// Loading placeholder for charts
export const ChartLoading: React.FC<{ title?: string }> = ({ title = "Loading Chart..." }) => {
  return (
    <div className="flex flex-col items-center justify-center h-64 bg-[#1a2332] rounded-xl border border-[#2e4e6b] p-6">
      <div className="text-center">
        <div className="animate-spin text-4xl mb-4">⏳</div>
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <p className="text-gray-400 text-sm">Preparing your data...</p>
      </div>
    </div>
  );
};

// No data placeholder for charts
export const ChartNoData: React.FC<{ 
  title?: string; 
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}> = ({ 
  title = "No Data Available",
  message = "Add some subscriptions to see analytics and charts.",
  actionLabel = "Add Subscription",
  onAction
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-64 bg-[#1a2332] rounded-xl border border-[#2e4e6b] p-6">
      <div className="text-center">
        <div className="text-4xl mb-4">📈</div>
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <p className="text-gray-400 text-sm mb-4">{message}</p>
        {onAction && (
          <button 
            onClick={onAction}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
};
