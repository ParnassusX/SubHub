
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { SubscriptionProvider } from './contexts/SubscriptionContext'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import Sidebar from './components/Sidebar'
import MobileNav from './components/MobileNav'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import AdminDashboard from './pages/AdminDashboard'
import Subscriptions from './pages/Subscriptions'
import Reports from './pages/Reports'
import Categories from './pages/Categories'
import Settings from './pages/Settings'
import Help from './pages/Help'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <SubscriptionProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes */}
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

                    {/* Main content */}
                    <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-auto">
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/admin" element={
                          <AdminRoute>
                            <AdminDashboard />
                          </AdminRoute>
                        } />
                        <Route path="/subscriptions" element={<Subscriptions />} />
                        <Route path="/reports" element={<Reports />} />
                        <Route path="/categories" element={<Categories />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/help" element={<Help />} />
                      </Routes>
                    </div>
                  </div>
                </div>
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </SubscriptionProvider>
    </AuthProvider>
  )
}

export default App
