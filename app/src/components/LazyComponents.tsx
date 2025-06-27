import { lazy } from 'react';

// Lazy load all major page components for better performance
export const Dashboard = lazy(() => import('../pages/Dashboard'));
export const Subscriptions = lazy(() => import('../pages/Subscriptions'));
export const Reports = lazy(() => import('../pages/Reports'));
export const Settings = lazy(() => import('../pages/Settings'));

// Lazy load heavy components
export const ImportExport = lazy(() => import('./ImportExport'));
export const SearchAndFilter = lazy(() => import('./SearchAndFilter'));

// Loading fallback component
export const ComponentLoader = ({ message = 'Loading...' }: { message?: string }) => (
  <div className="flex items-center justify-center h-32">
    <div className="text-center">
      <div className="animate-spin text-2xl mb-2">⚙️</div>
      <p className="text-gray-400">{message}</p>
    </div>
  </div>
);

// Page-specific loading components
export const DashboardLoader = () => <ComponentLoader message="Loading Dashboard..." />;
export const SubscriptionsLoader = () => <ComponentLoader message="Loading Subscriptions..." />;
export const ReportsLoader = () => <ComponentLoader message="Loading Reports..." />;
export const SettingsLoader = () => <ComponentLoader message="Loading Settings..." />;
