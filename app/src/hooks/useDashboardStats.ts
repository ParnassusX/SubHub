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
  });
};