import React, { Suspense } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ComponentLoader } from './UnifiedLoading';

// Lazy load components
const Dashboard = React.lazy(() => import('../pages/Dashboard'));
const LandingPage = React.lazy(() => import('../pages/LandingPage'));

/**
 * Smart root route component that directs users based on authentication status
 * - Authenticated users: Dashboard
 * - Non-authenticated users: Landing Page
 */
const RootRoute: React.FC = () => {
  const { user, isLoading } = useAuth();

  // Show loading while determining authentication status
  if (isLoading) {
    return <ComponentLoader message="Loading..." />;
  }

  // Authenticated users go to Dashboard
  if (user) {
    return (
      <Suspense fallback={<ComponentLoader message="Loading Dashboard..." />}>
        <Dashboard />
      </Suspense>
    );
  }

  // Non-authenticated users go to Landing Page
  return (
    <Suspense fallback={<ComponentLoader message="Loading Landing Page..." />}>
      <LandingPage />
    </Suspense>
  );
};

export default RootRoute;
