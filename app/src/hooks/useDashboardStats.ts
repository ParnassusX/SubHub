import { useQuery } from '@tanstack/react-query';
import { db } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const fetchDashboardStats = async () => {
  try {
    const { data, error } = await db.dashboard.getUserStats();
    if (error) {
      console.error('Dashboard stats fetch error:', error);
      throw error;
    }
    return data?.[0] || {
      total_subscriptions: 0,
      monthly_spending: 0,
      yearly_spending: 0,
      upcoming_renewals: 0
    };
  } catch (error) {
    console.error('Dashboard stats fetch failed:', error);
    // Return default values instead of throwing to prevent infinite loading
    return {
      total_subscriptions: 0,
      monthly_spending: 0,
      yearly_spending: 0,
      upcoming_renewals: 0
    };
  }
};

export const useDashboardStats = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['dashboardStats', user?.id],
    queryFn: fetchDashboardStats,
    enabled: !!user,
    retry: 1, // Reduce retries to prevent long loading times
    retryDelay: 1000, // Fixed 1 second delay
    staleTime: 60000, // Consider data fresh for 1 minute
    gcTime: 300000, // Keep in cache for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    // Add timeout to prevent hanging
    meta: {
      timeout: 5000 // 5 second timeout
    }
  });
};