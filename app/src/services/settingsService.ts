import { supabase } from '../lib/supabase';
import { Database } from '../types/supabase';
import { BudgetData, CategoryBudget, BudgetValidationResult, BudgetFormData } from '../types/budget';
import { BUDGET_LIMITS, BUDGET_VALIDATION_MESSAGES } from '../constants/budget';

type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];
type UserPreferences = Database['public']['Tables']['user_preferences']['Row'];
type UserPreferencesUpdate = Database['public']['Tables']['user_preferences']['Update'];

export class SettingsService {
  // Profile Management
  static async getProfile(): Promise<Profile | null> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  }

  static async updateProfile(updates: ProfileUpdate): Promise<Profile> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  // User Preferences Management
  static async getPreferences(): Promise<UserPreferences | null> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error fetching preferences:', error);
      return null;
    }
  }

  static async updatePreferences(updates: Partial<UserPreferencesUpdate>): Promise<UserPreferences> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user?.id) throw new Error('User not authenticated');

      // First try to update existing preferences
      const { data, error } = await supabase
        .from('user_preferences')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.user.id)
        .select()
        .single();

      if (error && error.code === 'PGRST116') {
        // No existing preferences, create new ones
        const { data: newData, error: insertError } = await supabase
          .from('user_preferences')
          .insert({
            user_id: user.user.id,
            ...updates,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (insertError) throw insertError;
        return newData;
      }

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  }

  // Combined Settings Operations
  static async getAllSettings(): Promise<{ profile: Profile | null; preferences: UserPreferences | null }> {
    try {
      const [profile, preferences] = await Promise.all([
        this.getProfile(),
        this.getPreferences()
      ]);

      return { profile, preferences };
    } catch (error) {
      console.error('Error fetching all settings:', error);
      return { profile: null, preferences: null };
    }
  }

  static async initializeDefaultSettings(): Promise<{ profile: Profile; preferences: UserPreferences }> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user?.id) throw new Error('User not authenticated');

      // Initialize profile with defaults including budget settings
      const profile = await this.updateProfile({
        timezone: 'UTC',
        currency: 'USD',
        date_format: 'MM/DD/YYYY',
        monthly_budget: null,
        yearly_budget: null,
        category_budgets: {},
        budget_alerts_enabled: true
      });

      // Initialize preferences with defaults
      const preferences = await this.updatePreferences({
        email_notifications: true,
        push_notifications: false,
        renewal_alerts: true,
        spending_alerts: true,
        weekly_summary: true,
        monthly_report: true,
        reminder_frequency: '3_days',
        theme: 'dark',
        language: 'en',
        auto_categorize: true,
        data_export_format: 'csv'
      });

      return { profile, preferences };
    } catch (error) {
      console.error('Error initializing default settings:', error);
      throw error;
    }
  }

  // Specific update methods for different settings sections
  static async updateNotificationSettings(settings: {
    email_notifications?: boolean;
    push_notifications?: boolean;
    renewal_alerts?: boolean;
    spending_alerts?: boolean;
    weekly_summary?: boolean;
    monthly_report?: boolean;
    reminder_frequency?: string;
  }): Promise<UserPreferences> {
    return this.updatePreferences(settings);
  }

  static async updateAppearanceSettings(settings: {
    theme?: string;
    language?: string;
  }): Promise<UserPreferences> {
    return this.updatePreferences(settings);
  }

  static async updatePrivacySettings(settings: {
    auto_categorize?: boolean;
    data_export_format?: string;
  }): Promise<UserPreferences> {
    return this.updatePreferences(settings);
  }

  static async updateProfileSettings(settings: {
    name?: string;
    timezone?: string;
    currency?: string;
    date_format?: string;
  }): Promise<Profile> {
    return this.updateProfile(settings);
  }

  // Budget Management Operations
  static async getBudgetData(): Promise<BudgetData | null> {
    try {
      const profile = await this.getProfile();
      if (!profile) return null;

      return {
        monthlyBudget: profile.monthly_budget,
        yearlyBudget: profile.yearly_budget,
        categoryBudgets: (profile.category_budgets as CategoryBudget) || {},
        budgetAlertsEnabled: profile.budget_alerts_enabled ?? true
      };
    } catch (error) {
      console.error('Error fetching budget data:', error);
      return null;
    }
  }

  static async updateBudgetData(budgetData: Partial<BudgetData>): Promise<Profile> {
    try {
      const updateData: any = {};

      if (budgetData.monthlyBudget !== undefined) {
        updateData.monthly_budget = budgetData.monthlyBudget;
      }
      if (budgetData.yearlyBudget !== undefined) {
        updateData.yearly_budget = budgetData.yearlyBudget;
      }
      if (budgetData.categoryBudgets !== undefined) {
        updateData.category_budgets = budgetData.categoryBudgets;
      }
      if (budgetData.budgetAlertsEnabled !== undefined) {
        updateData.budget_alerts_enabled = budgetData.budgetAlertsEnabled;
      }

      return this.updateProfile(updateData);
    } catch (error) {
      console.error('Error updating budget data:', error);
      throw error;
    }
  }

  static async updateMonthlyBudget(amount: number | null): Promise<Profile> {
    return this.updateBudgetData({ monthlyBudget: amount });
  }

  static async updateYearlyBudget(amount: number | null): Promise<Profile> {
    return this.updateBudgetData({ yearlyBudget: amount });
  }

  static async updateCategoryBudgets(categoryBudgets: CategoryBudget): Promise<Profile> {
    return this.updateBudgetData({ categoryBudgets });
  }

  static async updateCategoryBudget(category: string, amount: number | null): Promise<Profile> {
    try {
      const currentBudgetData = await this.getBudgetData();
      const currentCategoryBudgets = currentBudgetData?.categoryBudgets || {};

      if (amount === null || amount === 0) {
        // Remove category budget
        const { [category]: removed, ...remainingBudgets } = currentCategoryBudgets;
        return this.updateCategoryBudgets(remainingBudgets);
      } else {
        // Update category budget
        const updatedCategoryBudgets = {
          ...currentCategoryBudgets,
          [category]: amount
        };
        return this.updateCategoryBudgets(updatedCategoryBudgets);
      }
    } catch (error) {
      console.error('Error updating category budget:', error);
      throw error;
    }
  }

  static async updateBudgetAlertsEnabled(enabled: boolean): Promise<Profile> {
    return this.updateBudgetData({ budgetAlertsEnabled: enabled });
  }

  static async resetBudgetData(): Promise<Profile> {
    return this.updateBudgetData({
      monthlyBudget: null,
      yearlyBudget: null,
      categoryBudgets: {},
      budgetAlertsEnabled: true
    });
  }

  // Budget validation
  static validateBudgetData(formData: BudgetFormData): BudgetValidationResult {
    const errors: Array<{ field: string; message: string; code: 'REQUIRED' | 'INVALID_AMOUNT' | 'NEGATIVE_VALUE' | 'EXCEEDS_LIMIT' }> = [];

    // Validate monthly budget
    if (formData.monthlyBudget) {
      const monthlyAmount = parseFloat(formData.monthlyBudget);
      if (isNaN(monthlyAmount)) {
        errors.push({
          field: 'monthlyBudget',
          message: BUDGET_VALIDATION_MESSAGES.INVALID_AMOUNT,
          code: 'INVALID_AMOUNT'
        });
      } else if (monthlyAmount < 0) {
        errors.push({
          field: 'monthlyBudget',
          message: BUDGET_VALIDATION_MESSAGES.NEGATIVE_VALUE,
          code: 'NEGATIVE_VALUE'
        });
      } else if (monthlyAmount > BUDGET_LIMITS.MAX_BUDGET) {
        errors.push({
          field: 'monthlyBudget',
          message: BUDGET_VALIDATION_MESSAGES.EXCEEDS_LIMIT,
          code: 'EXCEEDS_LIMIT'
        });
      }
    }

    // Validate yearly budget
    if (formData.yearlyBudget) {
      const yearlyAmount = parseFloat(formData.yearlyBudget);
      if (isNaN(yearlyAmount)) {
        errors.push({
          field: 'yearlyBudget',
          message: BUDGET_VALIDATION_MESSAGES.INVALID_AMOUNT,
          code: 'INVALID_AMOUNT'
        });
      } else if (yearlyAmount < 0) {
        errors.push({
          field: 'yearlyBudget',
          message: BUDGET_VALIDATION_MESSAGES.NEGATIVE_VALUE,
          code: 'NEGATIVE_VALUE'
        });
      } else if (yearlyAmount > BUDGET_LIMITS.MAX_BUDGET) {
        errors.push({
          field: 'yearlyBudget',
          message: BUDGET_VALIDATION_MESSAGES.EXCEEDS_LIMIT,
          code: 'EXCEEDS_LIMIT'
        });
      }
    }

    // Validate category budgets
    Object.entries(formData.categoryBudgets).forEach(([category, amountStr]) => {
      if (amountStr) {
        const amount = parseFloat(amountStr);
        if (isNaN(amount)) {
          errors.push({
            field: `categoryBudgets.${category}`,
            message: BUDGET_VALIDATION_MESSAGES.INVALID_AMOUNT,
            code: 'INVALID_AMOUNT'
          });
        } else if (amount < 0) {
          errors.push({
            field: `categoryBudgets.${category}`,
            message: BUDGET_VALIDATION_MESSAGES.NEGATIVE_VALUE,
            code: 'NEGATIVE_VALUE'
          });
        } else if (amount > BUDGET_LIMITS.MAX_BUDGET) {
          errors.push({
            field: `categoryBudgets.${category}`,
            message: BUDGET_VALIDATION_MESSAGES.EXCEEDS_LIMIT,
            code: 'EXCEEDS_LIMIT'
          });
        }
      }
    });

    // Check category budget limits
    const categoryCount = Object.keys(formData.categoryBudgets).length;
    if (categoryCount > BUDGET_LIMITS.MAX_CATEGORY_BUDGETS) {
      errors.push({
        field: 'categoryBudgets',
        message: `Maximum ${BUDGET_LIMITS.MAX_CATEGORY_BUDGETS} category budgets allowed`,
        code: 'EXCEEDS_LIMIT'
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Export user data
  static async exportUserData(): Promise<any> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user?.id) throw new Error('User not authenticated');

      const [profile, preferences, subscriptions, budgetData] = await Promise.all([
        this.getProfile(),
        this.getPreferences(),
        supabase.from('subscriptions').select('*').eq('user_id', user.user.id),
        this.getBudgetData()
      ]);

      return {
        profile,
        preferences,
        subscriptions: subscriptions.data || [],
        budget: budgetData,
        exported_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error exporting user data:', error);
      throw error;
    }
  }

  // Delete account (soft delete - keep data but mark as deleted)
  static async deleteAccount(): Promise<void> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user?.id) throw new Error('User not authenticated');

      // Mark profile as deleted instead of hard delete
      await this.updateProfile({
        role: 'deleted',
        updated_at: new Date().toISOString()
      });

      // Sign out user
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  }
}
