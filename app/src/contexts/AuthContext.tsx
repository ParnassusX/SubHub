import React, { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Note: Supabase handles automatic token refresh via autoRefreshToken: true in client config
  // No manual session refresh needed - this was causing performance overhead

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Add timeout for PWA scenarios to prevent endless loading
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Auth initialization timeout')), 10000)
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
          // In PWA mode, if auth fails, still allow app to load
          setIsLoading(false);
          // Don't redirect in PWA mode to prevent navigation issues
          if (!window.matchMedia('(display-mode: standalone)').matches) {
            console.log('Auth failed, but allowing app to load');
          }
        }
      }
    };

    // Listen for auth changes with better error handling
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log('Auth state change:', event, session?.user?.id || 'no user');

      try {
        if (session?.user) {
          await handleUserSession(session.user);
        } else {
          // User logged out or session expired
          setUser(null);
          setProfile(null);
          setIsLoading(false);

          // Only navigate to login if we're not already there and this is a sign out
          if (event === 'SIGNED_OUT' && window.location.pathname !== '/login' && window.location.pathname !== '/register') {
            console.log('User signed out, redirecting to login');
            navigate('/login', { replace: true });
          }
        }
      } catch (error) {
        console.error('Error handling auth state change:', error);
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

      // Fetch profile data - simplified without timeout for better performance
      try {
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', supabaseUser.id)
          .single();

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
        console.warn('Profile fetch error, continuing with basic user data:', profileError);
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
      console.log('Attempting login for:', email)
      const { data, error } = await authHelpers.signIn(email, password)

      if (error) {
        console.error('Login error:', error)
        setIsLoading(false)
        return false
      }

      if (data.user) {
        await handleUserSession(data.user)

        // Navigate to dashboard on successful login
        console.log('Login successful, navigating to dashboard')
        navigate('/dashboard', { replace: true })
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
    try {
      console.log('Logging out user...')

      // Clear auth state immediately for better UX
      setUser(null)
      setProfile(null)

      // Sign out from Supabase
      const { error } = await authHelpers.signOut()

      if (error) {
        console.error('Logout error:', error)
        // Still navigate even if logout fails to prevent stuck state
      }

      // Navigate to login page
      navigate('/login', { replace: true })
      console.log('User logged out successfully')

    } catch (error) {
      console.error('Critical logout error:', error)
      // Force navigation even on error to prevent stuck state
      navigate('/login', { replace: true })
    }
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
