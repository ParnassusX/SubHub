
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

function App() {
  // Initialize performance optimizations and error handling
  usePerformanceOptimization()
  useErrorHandler()

  return (
    <ErrorBoundary>
      <PerformanceMonitor />
      <AuthProvider>
        <SubscriptionProvider>
          <Router>
            <Routes>
              {/* Public routes */}
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
        </SubscriptionProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
