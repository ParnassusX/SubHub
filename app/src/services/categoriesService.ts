import { supabase } from '../lib/supabase';
import { Database } from '../types/supabase';

type Category = Database['public']['Tables']['categories']['Row'];
type CategoryInsert = Database['public']['Tables']['categories']['Insert'];
type CategoryUpdate = Database['public']['Tables']['categories']['Update'];

export interface CategoryWithStats extends Category {
  subscription_count: number;
  total_cost: number;
}

export class CategoriesService {
  // Get all categories for the current user
  static async getCategories(): Promise<CategoryWithStats[]> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user?.id) throw new Error('User not authenticated');

      // Get all categories for the user
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.user.id)
        .order('name');

      if (categoriesError) throw categoriesError;

      // Get all subscriptions for the user
      const { data: subscriptions, error: subscriptionsError } = await supabase
        .from('subscriptions')
        .select('category, cost, frequency')
        .eq('user_id', user.user.id);

      if (subscriptionsError) throw subscriptionsError;

      // Process the data to calculate stats
      const categoriesWithStats: CategoryWithStats[] = (categories || []).map(category => {
        // Find subscriptions for this category
        const categorySubscriptions = (subscriptions || []).filter(sub => sub.category === category.name);
        const subscription_count = categorySubscriptions.length;

        // Calculate total monthly cost
        const total_cost = categorySubscriptions.reduce((total: number, sub: any) => {
          const monthlyCost = sub.frequency === 'Monthly' ? sub.cost : sub.cost / 12;
          return total + monthlyCost;
        }, 0);

        return {
          id: category.id,
          name: category.name,
          color: category.color,
          user_id: category.user_id,
          created_at: category.created_at,
          updated_at: category.updated_at,
          subscription_count,
          total_cost
        };
      });

      return categoriesWithStats;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  // Get default categories (system-wide categories)
  static async getDefaultCategories(): Promise<Category[]> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .is('user_id', null)
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching default categories:', error);
      throw error;
    }
  }

  // Create a new category
  static async createCategory(categoryData: Omit<CategoryInsert, 'user_id'>): Promise<Category> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('categories')
        .insert({
          ...categoryData,
          user_id: user.user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }

  // Update an existing category
  static async updateCategory(id: string, updates: CategoryUpdate): Promise<Category> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('categories')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.user.id) // Ensure user can only update their own categories
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  }

  // Delete a category
  static async deleteCategory(id: string): Promise<void> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user?.id) throw new Error('User not authenticated');

      // Get the category to find its name
      const { data: category, error: categoryError } = await supabase
        .from('categories')
        .select('name')
        .eq('id', id)
        .eq('user_id', user.user.id)
        .single();

      if (categoryError) throw categoryError;

      // Check if category has subscriptions (by category name)
      const { data: subscriptions, error: checkError } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('category', category.name)
        .eq('user_id', user.user.id);

      if (checkError) throw checkError;

      if (subscriptions && subscriptions.length > 0) {
        throw new Error('Cannot delete category that has subscriptions. Please reassign or delete subscriptions first.');
      }

      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)
        .eq('user_id', user.user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }

  // Get category by ID
  static async getCategoryById(id: string): Promise<Category | null> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error fetching category:', error);
      return null;
    }
  }

  // Initialize default categories for a new user
  static async initializeDefaultCategories(): Promise<Category[]> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user?.id) throw new Error('User not authenticated');

      const defaultCategories = [
        { name: 'Entertainment', color: '#ef4444' },
        { name: 'Productivity', color: '#3b82f6' },
        { name: 'Development', color: '#10b981' },
        { name: 'Health', color: '#ec4899' },
        { name: 'Finance', color: '#6366f1' },
        { name: 'Education', color: '#f59e0b' },
        { name: 'Gaming', color: '#8b5cf6' },
        { name: 'Music', color: '#06b6d4' },
        { name: 'News', color: '#64748b' },
        { name: 'Shopping', color: '#d946ef' },
        { name: 'Travel', color: '#0ea5e9' },
        { name: 'Food', color: '#f97316' },
        { name: 'Utilities', color: '#84cc16' },
        { name: 'Other', color: '#6b7280' }
      ];

      const { data, error } = await supabase
        .from('categories')
        .insert(
          defaultCategories.map(cat => ({
            ...cat,
            user_id: user.user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }))
        )
        .select();

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error initializing default categories:', error);
      throw error;
    }
  }

  // Get category usage analytics
  static async getCategoryAnalytics(): Promise<{
    totalCategories: number;
    categoriesWithSubscriptions: number;
    mostUsedCategory: string | null;
    totalSpending: number;
  }> {
    try {
      const categories = await this.getCategories();
      
      const totalCategories = categories.length;
      const categoriesWithSubscriptions = categories.filter(cat => cat.subscription_count > 0).length;
      const totalSpending = categories.reduce((total, cat) => total + cat.total_cost, 0);
      
      // Find most used category
      const mostUsed = categories.reduce((prev, current) => 
        (prev.subscription_count > current.subscription_count) ? prev : current
      );
      
      return {
        totalCategories,
        categoriesWithSubscriptions,
        mostUsedCategory: mostUsed?.name || null,
        totalSpending
      };
    } catch (error) {
      console.error('Error getting category analytics:', error);
      return {
        totalCategories: 0,
        categoriesWithSubscriptions: 0,
        mostUsedCategory: null,
        totalSpending: 0
      };
    }
  }

  // Reassign subscriptions from one category to another
  static async reassignSubscriptions(fromCategoryId: string, toCategoryId: string): Promise<void> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user?.id) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('subscriptions')
        .update({ category: toCategoryId })
        .eq('category', fromCategoryId)
        .eq('user_id', user.user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error reassigning subscriptions:', error);
      throw error;
    }
  }
}
