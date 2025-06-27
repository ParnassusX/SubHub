import { supabase } from '../lib/supabase';
import { Database } from '../types/supabase';

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

      // Initialize profile with defaults
      const profile = await this.updateProfile({
        timezone: 'UTC',
        currency: 'USD',
        date_format: 'MM/DD/YYYY'
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

  // Export user data
  static async exportUserData(): Promise<any> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user?.id) throw new Error('User not authenticated');

      const [profile, preferences, subscriptions] = await Promise.all([
        this.getProfile(),
        this.getPreferences(),
        supabase.from('subscriptions').select('*').eq('user_id', user.user.id)
      ]);

      return {
        profile,
        preferences,
        subscriptions: subscriptions.data || [],
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
