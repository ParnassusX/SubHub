import { useQuery } from '@tanstack/react-query';
import { db } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const fetchDashboardStats = async () => {
  const { data, error } = await db.dashboard.getUserStats();
  if (error) throw error;
  return data[0];
};

export const useDashboardStats = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['dashboardStats', user?.id],
    queryFn: fetchDashboardStats,
    enabled: !!user,
    retry: 2, // Retry failed requests
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 60000, // Consider data fresh for 1 minute
    gcTime: 300000, // Keep in cache for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
  });
};