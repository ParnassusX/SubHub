import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Database } from '../types/supabase';
import { updateDynamicCategories } from '../utils/categoryColors';
import { timeOperation } from '../utils/performanceMonitor';

type Category = Database['public']['Tables']['categories']['Row'] & {
  subscription_count?: number;
};

const fetchCategories = async () => {
  return timeOperation('fetch-categories', async () => {
    const { data, error } = await db.categories.getAll();
    if (error) throw error;
    return data || [];
  });
};

export const useCategories = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading: loading, error } = useQuery<Category[], Error>({
    queryKey: ['categories', user?.id],
    queryFn: fetchCategories,
    enabled: !!user,
    retry: 2, // Retry failed requests up to 2 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    staleTime: 30000, // Consider data fresh for 30 seconds
    gcTime: 300000, // Keep in cache for 5 minutes
  });

  useEffect(() => {
    if (categories) {
      updateDynamicCategories(categories.map(cat => ({ name: cat.name, color: cat.color })));
    }
  }, [categories]);

  const createCategoryMutation = useMutation<Category, Error, { name: string; color: string; icon?: string }>({
    mutationFn: async (categoryData) => {
      if (!user?.id) throw new Error('User not authenticated');
      const { data, error } = await db.categories.create({ ...categoryData, user_id: user.id });
      if (error) throw error;
      return data as Category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', user?.id] });
    },
  });

  const updateCategoryMutation = useMutation<Category, Error, { id: string; updates: Partial<Pick<Category, 'name' | 'color' | 'icon'>> }>({
    mutationFn: async ({ id, updates }) => {
      const { data, error } = await db.categories.update(id, updates);
      if (error) throw error;
      return data as Category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', user?.id] });
    },
  });

  const deleteCategoryMutation = useMutation<void, Error, string>({
    mutationFn: async (id: string) => {
      const { error } = await db.categories.delete(id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', user?.id] });
    },
  });

  const getCategoryNames = (): string[] => {
    return categories.map(cat => cat.name);
  };

  const getCategoryByName = (name: string): Category | undefined => {
    return categories.find(cat => cat.name === name);
  };

  const getCategoryById = (id: string): Category | undefined => {
    return categories.find(cat => cat.id === id);
  };

  // This function will need to be updated to work with the new data flow
  const updateSubscriptionCounts = () => {
    // This logic will be moved to the backend or a separate hook
  };

  return {
    categories,
    loading,
    error: error?.message || null,
    createCategory: createCategoryMutation.mutateAsync,
    updateCategory: updateCategoryMutation.mutateAsync,
    deleteCategory: deleteCategoryMutation.mutateAsync,
    getCategoryNames,
    getCategoryByName,
    getCategoryById,
    updateSubscriptionCounts,
    refetch: () => queryClient.invalidateQueries({ queryKey: ['categories', user?.id] }),
  };
};
