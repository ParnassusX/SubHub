
import React, { Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
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

// Lazy load admin and other pages
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'))
const Categories = React.lazy(() => import('./pages/Categories'))
const Help = React.lazy(() => import('./pages/Help'))
const Renewals = React.lazy(() => import('./pages/Renewals'))
const LandingPage = React.lazy(() => import('./pages/LandingPage'))

function App() {
  // Initialize performance optimizations and error handling
  usePerformanceOptimization()
  useErrorHandler()

  // Setup debug methods in development
  React.useEffect(() => {
    OnboardingService.setupDebugMethods();
  }, []);

  return (
    <ErrorBoundary>
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
                {/* Onboarding Overlay - Must be inside ProtectedRoute for authenticated users only */}
                <OnboardingOverlay />
                </ProtectedRoute>
              } />
            </Routes>
          </SubscriptionProvider>
        </AuthProvider>
      </Router>

      {/* PWA Prompts */}
      <PWAUpdatePrompt />
      <PWAInstallPrompt />

      {/* Performance Dashboard - Development Only */}
      <PerformanceDashboard />
    </ErrorBoundary>
  )
}

export default App
