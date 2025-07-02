import React, { Suspense } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ComponentLoader } from './UnifiedLoading';

// Lazy load components
const LandingPage = React.lazy(() => import('../pages/LandingPage'));

/**
 * Smart root route component that directs users based on authentication status
 * - Authenticated users: Redirect to /dashboard (preserves layout and navigation)
 * - Non-authenticated users: Landing Page
 */
const RootRoute: React.FC = () => {
  const { user, isLoading } = useAuth();

  // Show loading while determining authentication status
  if (isLoading) {
    return <ComponentLoader message="Loading..." />;
  }

  // Authenticated users redirect to /dashboard (preserves sidebar and layout)
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  // Non-authenticated users go to Landing Page
  return (
    <Suspense fallback={<ComponentLoader message="Loading Landing Page..." />}>
      <LandingPage />
    </Suspense>
  );
};

export default RootRoute;
