import { useState, useEffect } from 'react';
import { db } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Database } from '../types/supabase';
import { defaultCategories, updateDynamicCategories } from '../utils/categoryColors';

type Category = Database['public']['Tables']['categories']['Row'] & {
  subscription_count?: number;
};

export const useCategories = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await db.categories.getAll();
      
      if (fetchError) {
        throw fetchError;
      }

      // If no categories exist, create default ones
      if (!data || data.length === 0) {
        await createDefaultCategories();
        return;
      }

      const categoriesData = data || [];
      setCategories(categoriesData);

      // Update dynamic color system
      updateDynamicCategories(categoriesData.map(cat => ({ name: cat.name, color: cat.color })));
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
      
      // Fallback to default categories
      setCategories(defaultCategories.map((cat, index) => ({
        id: `fallback-${index}`,
        name: cat.name,
        color: cat.color,
        user_id: user?.id || '',
        created_at: new Date().toISOString(),
        updated_at: null,
        subscription_count: 0
      })));
    } finally {
      setLoading(false);
    }
  };

  const createDefaultCategories = async () => {
    if (!user?.id) return;

    try {
      const promises = defaultCategories.map(cat => 
        db.categories.create({
          name: cat.name,
          color: cat.color,
          user_id: user.id
        })
      );

      const results = await Promise.all(promises);
      const newCategories = results
        .map(result => result.data)
        .filter((data): data is Category => data !== null)
        .map(cat => ({ ...cat, subscription_count: 0 }));

      setCategories(newCategories);

      // Update dynamic color system
      updateDynamicCategories(newCategories.map(cat => ({ name: cat.name, color: cat.color })));
    } catch (error) {
      console.error('Error creating default categories:', error);
      setError('Failed to create default categories');
    }
  };

  const createCategory = async (categoryData: { name: string; color: string }) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      const { data, error } = await db.categories.create({
        name: categoryData.name,
        color: categoryData.color,
        user_id: user.id
      });

      if (error) throw error;
      
      if (data) {
        const newCategory = { ...data, subscription_count: 0 };
        setCategories(prev => [...prev, newCategory]);
        return newCategory;
      }
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  };

  const updateCategory = async (id: string, updates: Partial<Pick<Category, 'name' | 'color'>>) => {
    try {
      const { data, error } = await db.categories.update(id, updates);
      
      if (error) throw error;
      
      if (data) {
        const updatedCategories = categories.map(cat =>
          cat.id === id
            ? { ...data, subscription_count: cat.subscription_count }
            : cat
        );
        setCategories(updatedCategories);

        // Update dynamic color system
        updateDynamicCategories(updatedCategories.map(cat => ({ name: cat.name, color: cat.color })));

        return data;
      }
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const { error } = await db.categories.delete(id);
      
      if (error) throw error;
      
      setCategories(prev => prev.filter(cat => cat.id !== id));
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  };

  const getCategoryNames = (): string[] => {
    return categories.map(cat => cat.name);
  };

  const getCategoryByName = (name: string): Category | undefined => {
    return categories.find(cat => cat.name === name);
  };

  const getCategoryById = (id: string): Category | undefined => {
    return categories.find(cat => cat.id === id);
  };

  // Update subscription counts
  const updateSubscriptionCounts = (subscriptions: any[]) => {
    setCategories(prev => prev.map(category => {
      const count = subscriptions.filter(sub => sub.category === category.name).length;
      return { ...category, subscription_count: count };
    }));
  };

  useEffect(() => {
    fetchCategories();
  }, [user]);

  return {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryNames,
    getCategoryByName,
    getCategoryById,
    updateSubscriptionCounts,
    refetch: fetchCategories
  };
};
