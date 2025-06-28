import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase, authHelpers } from '../lib/supabase'
import { Profile } from '../types/supabase'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface User {
  id: string
  email: string
  name?: string
  role?: 'user' | 'admin'
}

interface AuthContextType {
  user: User | null
  profile: Profile | null
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, name?: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Session refresh interval
  useEffect(() => {
    const refreshSession = async () => {
      try {
        const { error } = await supabase.auth.refreshSession();
        if (error) {
          console.warn('Session refresh failed:', error);
        }
      } catch (error) {
        console.warn('Session refresh error:', error);
      }
    };

    // Refresh session every 30 minutes
    const interval = setInterval(refreshSession, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Get initial session with timeout
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Session timeout')), 10000)
        );

        const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]) as any;

        if (!mounted) return;

        if (session?.user) {
          await handleUserSession(session.user);
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log('Auth state change:', event, !!session?.user);

      if (session?.user) {
        await handleUserSession(session.user);
      } else {
        setUser(null);
        setProfile(null);
        setIsLoading(false);
      }
    });

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [])

  const handleUserSession = async (supabaseUser: SupabaseUser) => {
    try {
      // Set basic user data immediately to prevent loading state
      const basicUserData: User = {
        id: supabaseUser.id,
        email: supabaseUser.email!,
        name: supabaseUser.user_metadata?.name || undefined,
        role: 'user' // Default role
      };

      setUser(basicUserData);
      setIsLoading(false);

      // Try to get profile data with timeout
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
      );

      try {
        const { data: profileData, error } = await Promise.race([profilePromise, timeoutPromise]) as any;

        if (!error && profileData) {
          const enhancedUserData: User = {
            ...basicUserData,
            name: profileData.name || basicUserData.name,
            role: (profileData.role as 'user' | 'admin') || 'user'
          };

          setUser(enhancedUserData);
          setProfile(profileData);
        } else if (error) {
          console.warn('Profile fetch failed, using basic user data:', error);
          // Create basic profile if it doesn't exist
          if (error.code === 'PGRST116') {
            await createBasicProfile(supabaseUser);
          }
        }
      } catch (profileError) {
        console.warn('Profile fetch timeout or error, continuing with basic user data:', profileError);
      }
    } catch (error) {
      console.error('Critical error in handleUserSession:', error);
      setIsLoading(false);
    }
  };

  const createBasicProfile = async (supabaseUser: SupabaseUser) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: supabaseUser.id,
          email: supabaseUser.email!,
          name: supabaseUser.user_metadata?.name || null,
          role: 'user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (!error && data) {
        setProfile(data);
      }
    } catch (error) {
      console.warn('Failed to create basic profile:', error);
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)

    try {
      const { data, error } = await authHelpers.signIn(email, password)

      if (error) {
        console.error('Login error:', error)
        setIsLoading(false)
        return false
      }

      if (data.user) {
        await handleUserSession(data.user)
        return true
      }

      setIsLoading(false)
      return false
    } catch (error) {
      console.error('Login error:', error)
      setIsLoading(false)
      return false
    }
  }

  const register = async (email: string, password: string, name?: string): Promise<boolean> => {
    setIsLoading(true)

    try {
      const { error } = await authHelpers.signUp(email, password, name)

      if (error) {
        console.error('Registration error:', error)
        setIsLoading(false)
        return false
      }

      // Note: User will need to confirm email before they can login
      setIsLoading(false)
      return true
    } catch (error) {
      console.error('Registration error:', error)
      setIsLoading(false)
      return false
    }
  }

  const logout = async () => {
    await authHelpers.signOut()
    setUser(null)
    setProfile(null)
  }

  const isAdmin = user?.role === 'admin'

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      login,
      register,
      logout,
      isLoading,
      isAdmin
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
