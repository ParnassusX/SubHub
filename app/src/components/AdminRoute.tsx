import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, isLoading, isAdmin } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f1a24] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0f1a24] flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-600 text-white p-6 rounded-lg max-w-md">
            <h2 className="text-xl font-bold mb-2">Access Denied</h2>
            <p className="mb-4">You don't have permission to access this page.</p>
            <p className="text-sm text-red-200">Admin access required.</p>
            <button 
              onClick={() => window.history.back()}
              className="mt-4 bg-red-700 hover:bg-red-800 px-4 py-2 rounded text-white"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminRoute;
