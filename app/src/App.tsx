
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
import ErrorBoundary, { PageErrorBoundary } from './components/ErrorBoundary'
import PerformanceMonitor from './components/PerformanceMonitor'
import PWAUpdatePrompt from './components/PWAUpdatePrompt'
import PWAInstallPrompt from './components/PWAInstallPrompt'
import OnboardingOverlay from './components/onboarding/OnboardingOverlay'
import OnboardingTestPanel from './components/onboarding/OnboardingTestPanel'
import { OnboardingService } from './services/onboardingService'
import { usePerformanceOptimization } from './hooks/usePerformanceOptimization'
import { useErrorHandler } from './hooks/useErrorHandler'
import './App.css'

// Lazy load heavy components for better performance
import {
  Dashboard,
  Subscriptions,
  Reports,
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
      <PerformanceMonitor />
      <AuthProvider>
        <SubscriptionProvider>
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
              {/* Public routes */}
              <Route
                path="/"
                element={
                  <Suspense fallback={<ComponentLoader message="Loading Landing Page..." />}>
                    <LandingPage />
                  </Suspense>
                }
              />
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

                      {/* Main content with Suspense for lazy loading */}
                      <div className="flex-1 flex flex-col overflow-hidden">
                        <PageErrorBoundary>
                          <Suspense fallback={<PageLoader />}>
                            <Routes>
                              <Route
                                path="/"
                                element={
                                  <PageErrorBoundary>
                                    <Suspense fallback={<ComponentLoader message="Loading Dashboard..." />}>
                                      <Dashboard />
                                    </Suspense>
                                  </PageErrorBoundary>
                                }
                              />
                              <Route
                                path="/admin"
                                element={
                                  <AdminRoute>
                                    <PageErrorBoundary>
                                      <Suspense fallback={<ComponentLoader message="Loading Admin Dashboard..." />}>
                                        <AdminDashboard />
                                      </Suspense>
                                    </PageErrorBoundary>
                                  </AdminRoute>
                                }
                              />
                              <Route
                                path="/subscriptions"
                                element={
                                  <PageErrorBoundary>
                                    <Suspense fallback={<ComponentLoader message="Loading Subscriptions..." />}>
                                      <Subscriptions />
                                    </Suspense>
                                  </PageErrorBoundary>
                                }
                              />
                              <Route
                                path="/reports"
                                element={
                                  <PageErrorBoundary>
                                    <Suspense fallback={<ComponentLoader message="Loading Reports..." />}>
                                      <Reports />
                                    </Suspense>
                                  </PageErrorBoundary>
                                }
                              />
                              <Route
                                path="/categories"
                                element={
                                  <PageErrorBoundary>
                                    <Suspense fallback={<ComponentLoader message="Loading Categories..." />}>
                                      <Categories />
                                    </Suspense>
                                  </PageErrorBoundary>
                                }
                              />
                              <Route
                                path="/settings"
                                element={
                                  <PageErrorBoundary>
                                    <Suspense fallback={<ComponentLoader message="Loading Settings..." />}>
                                      <Settings />
                                    </Suspense>
                                  </PageErrorBoundary>
                                }
                              />
                              <Route
                                path="/help"
                                element={
                                  <PageErrorBoundary>
                                    <Suspense fallback={<ComponentLoader message="Loading Help..." />}>
                                      <Help />
                                    </Suspense>
                                  </PageErrorBoundary>
                                }
                              />

                              <Route
                                path="/renewals"
                                element={
                                  <PageErrorBoundary>
                                    <Suspense fallback={<ComponentLoader message="Loading Renewals..." />}>
                                      <Renewals />
                                    </Suspense>
                                  </PageErrorBoundary>
                                }
                              />
                            </Routes>
                          </Suspense>
                        </PageErrorBoundary>
                      </div>
                    </div>
                  </div>
                </ProtectedRoute>
              } />
            </Routes>
          </Router>
        {/* Onboarding Overlay - Must be inside both AuthProvider and SubscriptionProvider */}
        <OnboardingOverlay />

        {/* Development Test Panel */}
        <OnboardingTestPanel />
        </SubscriptionProvider>
      </AuthProvider>

      {/* PWA Prompts */}
      <PWAUpdatePrompt />
      <PWAInstallPrompt />
    </ErrorBoundary>
  )
}

export default App
