import React from 'react';

interface LoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'skeleton' | 'pulse';
  fullScreen?: boolean;
}

export const UnifiedLoader: React.FC<LoadingProps> = ({ 
  message = 'Loading...', 
  size = 'md',
  variant = 'spinner',
  fullScreen = false
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8', 
    lg: 'h-12 w-12'
  };

  const containerClasses = {
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-8'
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  if (variant === 'skeleton') {
    return (
      <div className={`animate-pulse ${containerClasses[size]}`}>
        <div className="bg-gray-700 rounded h-4 w-3/4 mb-2"></div>
        <div className="bg-gray-700 rounded h-4 w-1/2"></div>
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={`animate-pulse ${containerClasses[size]}`}>
        <div className="bg-gray-600 rounded-lg h-16 w-full"></div>
      </div>
    );
  }

  const content = (
    <div className={`flex items-center justify-center ${containerClasses[size]}`}>
      <div className="text-center">
        <div className={`animate-spin rounded-full border-b-2 border-blue-500 ${sizeClasses[size]} mx-auto mb-2`}></div>
        <p className={`text-gray-400 ${textSizes[size]}`}>{message}</p>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0f1a24]">
        {content}
      </div>
    );
  }

  return content;
};

// Specific loading components for different use cases
export const PageLoader = ({ message }: { message?: string }) => (
  <UnifiedLoader message={message} size="lg" fullScreen />
);

export const ComponentLoader = ({ message, size = 'md' }: { message?: string; size?: 'sm' | 'md' | 'lg' }) => (
  <UnifiedLoader message={message} size={size} />
);

export const SkeletonLoader = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => (
  <UnifiedLoader variant="skeleton" size={size} />
);

export const CardSkeleton = () => (
  <div className="bg-[#1a2332] rounded-xl p-4 border border-[#2e4e6b] animate-pulse">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-3">
        <div className="w-4 h-4 bg-gray-600 rounded-full"></div>
        <div className="h-4 bg-gray-600 rounded w-24"></div>
      </div>
      <div className="flex gap-1">
        <div className="w-6 h-6 bg-gray-600 rounded"></div>
        <div className="w-6 h-6 bg-gray-600 rounded"></div>
      </div>
    </div>
    <div className="h-3 bg-gray-600 rounded w-16 mb-3"></div>
    <div className="flex items-center justify-between">
      <div className="h-3 bg-gray-600 rounded w-20"></div>
      <div className="w-6 h-6 bg-gray-600 rounded"></div>
    </div>
  </div>
);

export const ListSkeleton = ({ count = 3 }: { count?: number }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="bg-[#1a2332] rounded-lg p-4 border border-[#2e4e6b] animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-600 rounded-lg"></div>
            <div>
              <div className="h-4 bg-gray-600 rounded w-32 mb-1"></div>
              <div className="h-3 bg-gray-600 rounded w-20"></div>
            </div>
          </div>
          <div className="text-right">
            <div className="h-4 bg-gray-600 rounded w-16 mb-1"></div>
            <div className="h-3 bg-gray-600 rounded w-12"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Enhanced loading with retry functionality
export const LoadingWithRetry: React.FC<{
  message?: string;
  onRetry?: () => void;
  error?: string | null;
}> = ({ message = 'Loading...', onRetry, error }) => {
  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-red-400 mb-2">⚠️</div>
          <p className="text-red-400 text-sm mb-4">{error}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white text-sm transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  return <ComponentLoader message={message} />;
};

// Loading overlay for forms and modals
export const LoadingOverlay: React.FC<{
  isLoading: boolean;
  message?: string;
  children: React.ReactNode;
}> = ({ isLoading, message = 'Processing...', children }) => {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
          <ComponentLoader message={message} size="sm" />
        </div>
      )}
    </div>
  );
};

export default UnifiedLoader;
