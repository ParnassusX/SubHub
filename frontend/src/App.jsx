// src/App.jsx
import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Categories from './components/Categories';
import Settings from './components/Settings';
import Reports from './components/Reports';
import HelpPage from './components/HelpPage';
import SubscriptionsPage from './components/SubscriptionsPage';
import AddSubscriptionForm from './components/AddSubscriptionForm';
import EditSubscriptionForm from './components/EditSubscriptionForm';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute'; // Import ProtectedRoute

function App() {
  const { isAuthenticated, user, logoutAction } = useAuth();

  return (
    <>
      <nav className="bg-gray-900 text-white p-4 flex justify-between items-center">
        <div>
          <Link to="/" className="mr-4 hover:text-gray-300">SubHub</Link>
          {isAuthenticated && (
            <>
              <Link to="/" className="mr-4 hover:text-gray-300">Dashboard</Link>
              <Link to="/subscriptions" className="mr-4 hover:text-gray-300">Subscriptions</Link>
            </>
          )}
        </div>
        <div>
          {isAuthenticated ? (
            <>
              <span className="mr-4">Welcome, {user?.email}</span>
              <button onClick={logoutAction} className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="mr-4 hover:text-gray-300">Login</Link>
              <Link to="/signup" className="hover:text-gray-300">Sign Up</Link>
            </>
          )}
        </div>
      </nav>

      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/subscriptions" element={<SubscriptionsPage />} />
          <Route path="/subscriptions/new" element={<AddSubscriptionForm />} />
          <Route path="/subscriptions/edit/:id" element={<EditSubscriptionForm />} />
          <Route path="/categories" element={<Categories />} /> {/* Assuming protected */}
          <Route path="/reports" element={<Reports />} />       {/* Assuming protected */}
          <Route path="/settings" element={<Settings />} />     {/* Assuming protected */}
          <Route path="/help" element={<HelpPage />} />         {/* Assuming protected */}
        </Route>

        {/* Optional: Add a 404 Not Found Route */}
        {/* <Route path="*" element={<div>Page Not Found</div>} /> */}
      </Routes>
    </>
  );
}
export default App;
