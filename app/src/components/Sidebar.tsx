import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import NotificationCenter from './NotificationCenter';
import {
  Home,
  Shield,
  CreditCard,
  BarChart3,
  FolderOpen,
  Settings,
  HelpCircle,
  LogOut,
  User
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { isAdmin } = useAuth();
  const { user, logout } = useAuth();

  const menuItems = [
    {
      path: '/',
      name: 'Dashboard',
      icon: Home
    },
    {
      path: '/admin',
      name: 'Admin Dashboard',
      icon: Shield,
      adminOnly: true
    },
    {
      path: '/subscriptions',
      name: 'Subscriptions',
      icon: CreditCard
    },
    {
      path: '/reports',
      name: 'Reports',
      icon: BarChart3
    },
    {
      path: '/categories',
      name: 'Categories',
      icon: FolderOpen
    },
    {
      path: '/settings',
      name: 'Settings',
      icon: Settings
    },
    {
      path: '/help',
      name: 'Help',
      icon: HelpCircle
    }
  ];

  return (
    <div className="w-full lg:w-80 bg-background-primary p-6 flex flex-col h-full justify-between border-r border-glass-border overflow-y-auto">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-heading-2 font-bold text-white">SubscriptionHub</h1>
          <NotificationCenter />
        </div>
        <div className="flex flex-col gap-2">
          {menuItems.filter(item => !item.adminOnly || isAdmin).map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`elevated-card flex items-center gap-4 px-4 py-3 transition-all interactive ${
                  isActive
                    ? 'bg-primary-600 text-white shadow-glow'
                    : 'text-white hover:bg-background-secondary'
                }`}
              >
                <div className="text-white w-6 h-6 flex-shrink-0">
                  <item.icon className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-body font-medium">{item.name}</p>
                  {item.adminOnly && (
                    <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                      Admin
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* User Profile Section */}
      {user && (
        <div className="border-t border-glass-border pt-6">
          <div className="glass-card p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-body font-medium truncate">{user.name || user.email}</p>
                <p className="text-gray-400 text-caption truncate">{user.email}</p>
              </div>
              <button
                onClick={logout}
                className="text-gray-400 hover:text-white p-2 rounded-lg transition-colors interactive"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
