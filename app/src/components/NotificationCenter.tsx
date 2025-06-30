import React, { useState, useEffect, useRef } from 'react';
import { useSubscriptions } from '../contexts/SubscriptionContext';
import { Bell } from 'lucide-react';

interface Notification {
  id: string;
  type: 'payment_due' | 'payment_overdue' | 'renewal' | 'price_change' | 'info';
  title: string;
  message: string;
  subscriptionName?: string;
  amount?: number;
  dueDate?: string;
  isRead: boolean;
  createdAt: string;
}

const NotificationCenter: React.FC = () => {
  const { subscriptions } = useSubscriptions();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Generate notifications based on subscriptions
  useEffect(() => {
    const generateNotifications = () => {
      const now = new Date();
      const newNotifications: Notification[] = [];

      subscriptions.forEach(subscription => {
        const startDate = new Date(subscription.startDate);
        const nextBilling = new Date(startDate);
        
        // Calculate next billing date
        if (subscription.frequency === 'Monthly') {
          while (nextBilling < now) {
            nextBilling.setMonth(nextBilling.getMonth() + 1);
          }
        } else {
          while (nextBilling < now) {
            nextBilling.setFullYear(nextBilling.getFullYear() + 1);
          }
        }

        const daysUntilBilling = Math.ceil((nextBilling.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        // Payment due in 3 days
        if (daysUntilBilling <= 3 && daysUntilBilling > 0) {
          newNotifications.push({
            id: `payment_due_${subscription.id}`,
            type: 'payment_due',
            title: 'Payment Due Soon',
            message: `Your ${subscription.name} subscription payment of $${subscription.cost} is due in ${daysUntilBilling} day${daysUntilBilling > 1 ? 's' : ''}`,
            subscriptionName: subscription.name,
            amount: subscription.cost,
            dueDate: nextBilling.toISOString(),
            isRead: false,
            createdAt: new Date().toISOString(),
          });
        }

        // Payment overdue
        if (daysUntilBilling < 0) {
          newNotifications.push({
            id: `payment_overdue_${subscription.id}`,
            type: 'payment_overdue',
            title: 'Payment Overdue',
            message: `Your ${subscription.name} subscription payment of $${subscription.cost} is overdue by ${Math.abs(daysUntilBilling)} day${Math.abs(daysUntilBilling) > 1 ? 's' : ''}`,
            subscriptionName: subscription.name,
            amount: subscription.cost,
            dueDate: nextBilling.toISOString(),
            isRead: false,
            createdAt: new Date().toISOString(),
          });
        }
      });

      // Real notifications will be loaded from PocketBase when collections are set up
      const allNotifications = [...newNotifications];
      setNotifications(allNotifications);
      setUnreadCount(allNotifications.filter(n => !n.isRead).length);
    };

    generateNotifications();
  }, [subscriptions]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'payment_due':
        return (
          <div className="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" viewBox="0 0 256 256">
              <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm16-40a8,8,0,0,1-8,8,16,16,0,0,1-16-16V128a8,8,0,0,1,0-16,16,16,0,0,1,16,16v40A8,8,0,0,1,144,176ZM112,84a12,12,0,1,1,12,12A12,12,0,0,1,112,84Z"></path>
            </svg>
          </div>
        );
      case 'payment_overdue':
        return (
          <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" viewBox="0 0 256 256">
              <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm0-144a12,12,0,1,1-12,12A12,12,0,0,1,128,72Zm0,36a8,8,0,0,1,8,8v56a8,8,0,0,1-16,0V116A8,8,0,0,1,128,108Z"></path>
            </svg>
          </div>
        );
      case 'renewal':
        return (
          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" viewBox="0 0 256 256">
              <path d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"></path>
            </svg>
          </div>
        );
      case 'price_change':
        return (
          <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" viewBox="0 0 256 256">
              <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216ZM172.49,99.51a12,12,0,0,1,0,17l-56,56a12,12,0,0,1-17-17l56-56A12,12,0,0,1,172.49,99.51ZM108,84a12,12,0,1,1-12,12A12,12,0,0,1,108,84Zm60,72a12,12,0,1,1-12,12A12,12,0,0,1,168,156Z"></path>
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" viewBox="0 0 256 256">
              <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm16-40a8,8,0,0,1-8,8,16,16,0,0,1-16-16V128a8,8,0,0,1,0-16,16,16,0,0,1,16,16v40A8,8,0,0,1,144,176ZM112,84a12,12,0,1,1,12,12A12,12,0,0,1,112,84Z"></path>
            </svg>
          </div>
        );
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-white hover:bg-background-secondary rounded-lg transition-all interactive"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-error-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse-soft">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown - Mobile Responsive */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-1rem)] bg-[#1a2332] border border-[#2e4e6b] rounded-xl shadow-2xl z-50 max-h-96 overflow-hidden animate-slide-down">
          <div className="p-4 border-b border-[#2e4e6b] flex items-center justify-between">
            <h3 className="text-white font-medium">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-blue-400 hover:text-blue-300 text-sm font-medium"
              >
                Mark all read
              </button>
            )}
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-gray-400">No notifications</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-[#2e4e6b] hover:bg-[#2e4e6b]/30 cursor-pointer transition-colors ${
                    !notification.isRead ? 'bg-blue-600/10' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-white text-sm font-medium">{notification.title}</h4>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                      <p className="text-gray-400 text-xs mt-1">{notification.message}</p>
                      <p className="text-gray-500 text-xs mt-2">{formatTimeAgo(notification.createdAt)}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
