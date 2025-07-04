import { lazy } from 'react';

// Lazy load all major page components for better performance
export const Dashboard = lazy(() => import('../pages/Dashboard'));
export const Subscriptions = lazy(() => import('../pages/Subscriptions'));
export const Reports = lazy(() => import('../pages/Reports'));
export const AdvancedAnalytics = lazy(() => import('../pages/AdvancedAnalytics'));
export const Settings = lazy(() => import('../pages/Settings'));

// Lazy load heavy components
export const ImportExport = lazy(() => import('./ImportExport'));
export const SearchAndFilter = lazy(() => import('./SearchAndFilter'));

// Enhanced loading fallback component with modern design
export const ComponentLoader = ({ message = 'Loading...' }: { message?: string }) => (
  <div className="flex items-center justify-center h-32">
    <div className="text-center">
      <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-body text-gray-400">{message}</p>
    </div>
  </div>
);

// Skeleton loading components
export const SkeletonCard = () => (
  <div className="elevated-card p-6 animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <div className="skeleton h-6 w-32"></div>
      <div className="skeleton h-8 w-8 rounded-lg"></div>
    </div>
    <div className="skeleton h-8 w-24 mb-3"></div>
    <div className="skeleton h-4 w-40"></div>
  </div>
);

export const SkeletonInsightCard = () => (
  <div className="glass-card p-6 animate-pulse">
    <div className="flex items-start justify-between mb-6">
      <div className="flex items-center space-x-4">
        <div className="skeleton h-12 w-12 rounded-xl"></div>
        <div>
          <div className="skeleton h-6 w-32 mb-2"></div>
          <div className="skeleton h-4 w-48"></div>
        </div>
      </div>
      <div className="skeleton h-10 w-24 rounded-lg"></div>
    </div>
    <div className="skeleton h-16 w-full rounded-lg"></div>
  </div>
);

// Page-specific loading components
export const DashboardLoader = () => <ComponentLoader message="Loading Dashboard..." />;
export const SubscriptionsLoader = () => <ComponentLoader message="Loading Subscriptions..." />;
export const ReportsLoader = () => <ComponentLoader message="Loading Reports..." />;
export const AdvancedAnalyticsLoader = () => <ComponentLoader message="Loading Advanced Analytics..." />;
export const SettingsLoader = () => <ComponentLoader message="Loading Settings..." />;
