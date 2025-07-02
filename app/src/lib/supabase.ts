import { createClient } from '@supabase/supabase-js'
import { Database } from '../types/supabase'

const supabaseUrl = 'https://kfzuzxsywaptgbumrfgv.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmenV6eHN5d2FwdGdidW1yZmd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NTgwNTYsImV4cCI6MjA2NjUzNDA1Nn0.zXged0s_9x_K7i1EA8N8MaysPOYe-LJS4Nz0uzz3L8w'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Helper functions for common operations
export const auth = supabase.auth

// Database helpers
export const db = {
  // Profiles
  profiles: {
    get: () => supabase.from('profiles').select('*').single(),
    update: async (data: Partial<Database['public']['Tables']['profiles']['Update']>) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user?.id) throw new Error('User not authenticated');
      return supabase.from('profiles').update(data).eq('id', user.user.id);
    },
  },

  // User Preferences
  userPreferences: {
    get: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user?.id) throw new Error('User not authenticated');
      return supabase.from('user_preferences').select('*').eq('user_id', user.user.id).single();
    },
    create: async (data: Database['public']['Tables']['user_preferences']['Insert']) =>
      supabase.from('user_preferences').insert(data).select().single(),
    update: async (data: Database['public']['Tables']['user_preferences']['Update']) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user?.id) throw new Error('User not authenticated');
      return supabase.from('user_preferences').update(data).eq('user_id', user.user.id).select().single();
    },
    upsert: async (data: Database['public']['Tables']['user_preferences']['Insert']) =>
      supabase.from('user_preferences').upsert(data).select().single(),
  },

  // Subscriptions
  subscriptions: {
    getAll: () => supabase.from('subscriptions').select('*').order('created_at', { ascending: false }),
    getById: (id: string) => supabase.from('subscriptions').select('*').eq('id', id).single(),
    create: (data: Database['public']['Tables']['subscriptions']['Insert']) =>
      supabase.from('subscriptions').insert(data).select().single(),
    update: (id: string, data: Database['public']['Tables']['subscriptions']['Update']) =>
      supabase.from('subscriptions').update(data).eq('id', id).select().single(),
    delete: (id: string) => supabase.from('subscriptions').delete().eq('id', id),
  },

  // Notification Preferences
  notificationPreferences: {
    get: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user?.id) throw new Error('User not authenticated');
      return supabase.from('notification_preferences').select('*').eq('user_id', user.user.id).single();
    },
    create: async (data: Database['public']['Tables']['notification_preferences']['Insert']) =>
      supabase.from('notification_preferences').insert(data).select().single(),
    update: async (data: Database['public']['Tables']['notification_preferences']['Update']) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user?.id) throw new Error('User not authenticated');
      return supabase.from('notification_preferences').update(data).eq('user_id', user.user.id).select().single();
    },
    upsert: async (data: Database['public']['Tables']['notification_preferences']['Insert']) =>
      supabase.from('notification_preferences').upsert(data).select().single(),
  },

  // Notifications
  notifications: {
    getAll: () => {
      return supabase.from('notifications').select('*').order('created_at', { ascending: false });
    },
    getUnread: () => {
      return supabase.from('notifications').select('*').eq('is_read', false).order('created_at', { ascending: false });
    },
    create: async (data: Database['public']['Tables']['notifications']['Insert']) =>
      supabase.from('notifications').insert(data).select().single(),
    markAsRead: async (id: string) =>
      supabase.from('notifications').update({ is_read: true }).eq('id', id),
    markAllAsRead: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user?.id) throw new Error('User not authenticated');
      return supabase.from('notifications').update({ is_read: true }).eq('user_id', user.user.id).eq('is_read', false);
    },
    delete: async (id: string) =>
      supabase.from('notifications').delete().eq('id', id),
  },

  // Categories
  categories: {
    getAll: () => supabase.from('categories').select('*').order('name'),
    create: (data: Database['public']['Tables']['categories']['Insert']) =>
      supabase.from('categories').insert(data).select().single(),
    update: (id: string, data: Database['public']['Tables']['categories']['Update']) =>
      supabase.from('categories').update(data).eq('id', id).select().single(),
    delete: (id: string) => supabase.from('categories').delete().eq('id', id),
  },

  // Dashboard functions
  dashboard: {
    getUserStats: () => supabase.rpc('get_user_dashboard_stats'),
    getCategoryBreakdown: () => supabase.rpc('get_category_breakdown'),
  },

  // Admin functions
  admin: {
    getAnalytics: () => supabase.rpc('get_admin_analytics'),
  }
}

// Auth helpers
export const authHelpers = {
  signUp: async (email: string, password: string, name?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || email.split('@')[0]
        }
      }
    })
    return { data, error }
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  signOut: () => supabase.auth.signOut(),

  getCurrentUser: () => supabase.auth.getUser(),

  getCurrentProfile: async () => {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) return { data: null, error: new Error('No user') }
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.user.id)
      .single()
    
    return { data, error }
  },

  isAdmin: async () => {
    const { data } = await authHelpers.getCurrentProfile()
    return data?.role === 'admin'
  }
}
