
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
  DashboardLoader,
  SubscriptionsLoader,
  ReportsLoader,
  SettingsLoader,
} from './components/LazyComponents'

// Lazy load admin and other pages
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'))
const Categories = React.lazy(() => import('./pages/Categories'))
const Help = React.lazy(() => import('./pages/Help'))

// Performance optimized loading component
const PageLoader = ({ message = 'Loading...' }: { message?: string }) => (
  <div className="flex items-center justify-center h-screen bg-[#0f1a24]">
    <div className="text-center">
      <div className="animate-spin text-4xl mb-4">⚙️</div>
      <p className="text-white text-lg">{message}</p>
    </div>
  </div>
)

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
                  <div className="flex flex-col min-h-screen w-full max-w-full bg-[#0f1a24] text-white overflow-x-hidden" style={{fontFamily: 'Epilogue, "Noto Sans", sans-serif'}}>
                    {/* Mobile Navigation */}
                    <MobileNav />

                    <div className="flex flex-1 min-h-0 overflow-hidden">
                      {/* Sidebar - Hidden on mobile, shown on desktop */}
                      <div className="hidden lg:flex lg:w-80 lg:flex-shrink-0 lg:min-h-0">
                        <Sidebar />
                      </div>

                      {/* Main content with Suspense for lazy loading */}
                      <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-auto">
                        <PageErrorBoundary>
                          <Suspense fallback={<PageLoader />}>
                            <Routes>
                              <Route
                                path="/"
                                element={
                                  <PageErrorBoundary>
                                    <Suspense fallback={<DashboardLoader />}>
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
                                      <Suspense fallback={<PageLoader message="Loading Admin Dashboard..." />}>
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
                                    <Suspense fallback={<SubscriptionsLoader />}>
                                      <Subscriptions />
                                    </Suspense>
                                  </PageErrorBoundary>
                                }
                              />
                              <Route
                                path="/reports"
                                element={
                                  <PageErrorBoundary>
                                    <Suspense fallback={<ReportsLoader />}>
                                      <Reports />
                                    </Suspense>
                                  </PageErrorBoundary>
                                }
                              />
                              <Route
                                path="/categories"
                                element={
                                  <PageErrorBoundary>
                                    <Suspense fallback={<PageLoader message="Loading Categories..." />}>
                                      <Categories />
                                    </Suspense>
                                  </PageErrorBoundary>
                                }
                              />
                              <Route
                                path="/settings"
                                element={
                                  <PageErrorBoundary>
                                    <Suspense fallback={<SettingsLoader />}>
                                      <Settings />
                                    </Suspense>
                                  </PageErrorBoundary>
                                }
                              />
                              <Route
                                path="/help"
                                element={
                                  <PageErrorBoundary>
                                    <Suspense fallback={<PageLoader message="Loading Help..." />}>
                                      <Help />
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
