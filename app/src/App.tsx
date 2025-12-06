
import React, { Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './contexts/AuthContext'
import { SubscriptionProvider } from './contexts/SubscriptionContext'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import Sidebar from './components/Sidebar'
import MobileNav from './components/MobileNav'
import Login from './pages/Login'
import Register from './pages/Register'
import ErrorBoundary from './components/ErrorBoundary'
import PWAUpdatePrompt from './components/PWAUpdatePrompt'
import PWAInstallPrompt from './components/PWAInstallPrompt'
import OnboardingOverlay from './components/onboarding/OnboardingOverlay'
import PerformanceDashboard from './components/PerformanceDashboard'
import RootRoute from './components/RootRoute'
import { OnboardingService } from './services/onboardingService'
import { usePerformanceOptimization } from './hooks/usePerformanceOptimization'
import { useErrorHandler } from './hooks/useErrorHandler'
import { initializePWAEventListeners, runPWADiagnostics, isPWAMode } from './utils/pwaUtils'
import AuthDebugger from './components/AuthDebugger'
import './App.css'

// Lazy load heavy components for better performance
import {
  Dashboard,
  Subscriptions,
  Reports,
  AdvancedAnalytics,
  Settings,
} from './components/LazyComponents'

// Unified loading system
import { PageLoader, ComponentLoader } from './components/UnifiedLoading'

// Feature flags for UX elements
import { isFeatureEnabled, logFeatureFlagStatus } from './config/featureFlags'

// Import simple pages directly for instant loading (anti-over-engineering)
import Categories from './pages/Categories'
import Help from './pages/Help'
import Renewals from './pages/Renewals'

// Only lazy load heavy pages that benefit from code splitting
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'))
const LandingPage = React.lazy(() => import('./pages/LandingPage'))

// Compliance pages
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsOfService from './pages/TermsOfService'
import CookieConsent from './components/CookieConsent'

function App() {
  // Initialize performance optimizations and error handling
  usePerformanceOptimization()
  useErrorHandler()

  // Create a client
  const queryClient = new QueryClient()

  // Setup debug methods in development and PWA initialization
  React.useEffect(() => {
    OnboardingService.setupDebugMethods();

    // Log feature flag status in development
    logFeatureFlagStatus();

    // Initialize PWA utilities and diagnostics
    initializePWAEventListeners();
    runPWADiagnostics();

    // PWA-specific initialization
    if (isPWAMode()) {
      console.log('🚀 SubHub PWA Mode Active - Enhanced mobile experience enabled');
      document.body.classList.add('pwa-mode');
    }
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AuthProvider>
            <SubscriptionProvider>
              <Routes>
                {/* Smart root route - directs based on authentication */}
                <Route path="/" element={<RootRoute />} />

              {/* Public routes */}
              <Route
                path="/landing"
                element={
                  <Suspense fallback={<ComponentLoader message="Loading Landing Page..." />}>
                    <LandingPage />
                  </Suspense>
                }
              />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Compliance pages - accessible to all */}
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />

              {/* Protected routes with lazy loading and error boundaries */}
              <Route path="/*" element={
                <ProtectedRoute>
                  <div className="flex flex-col h-screen w-screen bg-background-primary text-white" style={{fontFamily: 'Epilogue, "Noto Sans", sans-serif'}}>
                    {/* Mobile Navigation */}
                    <MobileNav />

                    <div className="flex flex-1 overflow-hidden">
                      {/* Sidebar - Hidden on mobile, shown on desktop */}
                      <div className="hidden lg:flex lg:w-80 lg:flex-shrink-0">
                        <Sidebar />
                      </div>

                      {/* Main content - simplified for better performance */}
                      <div className="flex-1 flex flex-col overflow-hidden">
                        <Suspense fallback={<PageLoader />}>
                          <Routes>
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route
                              path="/admin"
                              element={
                                <AdminRoute>
                                  <AdminDashboard />
                                </AdminRoute>
                                }
                            />
                            <Route path="/subscriptions" element={<Subscriptions />} />
                            <Route path="/reports" element={<Reports />} />
                            <Route path="/analytics" element={<AdvancedAnalytics />} />
                            <Route path="/categories" element={<Categories />} />
                            <Route path="/settings" element={<Settings />} />
                            <Route path="/help" element={<Help />} />
                            <Route path="/renewals" element={<Renewals />} />
                          </Routes>
                        </Suspense>
                      </div>
                    </div>
                  </div>
                {/* Onboarding Overlay - Temporarily disabled to prevent UX conflicts */}
                {isFeatureEnabled('ONBOARDING_ENABLED') && <OnboardingOverlay />}
                </ProtectedRoute>
              } />
            </Routes>

            {/* Auth Debugger - Development Only (must be inside AuthProvider) */}
            <AuthDebugger />
          </SubscriptionProvider>
          </AuthProvider>
        </Router>
      </QueryClientProvider>

      {/* PWA Prompts */}
      <PWAUpdatePrompt />
      <PWAInstallPrompt />

      {/* Cookie Consent Banner */}
      <CookieConsent />

      {/* Performance Dashboard - Development Only */}
      <PerformanceDashboard />
    </ErrorBoundary>
  )
}

export default App
