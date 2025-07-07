import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
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
  const [isInitialized, setIsInitialized] = useState(false)

  // Track active session handling to prevent race conditions
  const activeSessionRef = useRef<string | null>(null)

  useEffect(() => {
    let mounted = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log('Auth state change:', event, session?.user?.id || 'no user');

      // Skip initial session to prevent race condition with checkInitialSession
      if (event === 'INITIAL_SESSION' && !isInitialized) {
        console.log('⏭️ Skipping INITIAL_SESSION to prevent race condition');
        return;
      }

      if (session?.user) {
        await handleUserSession(session.user);
      } else {
        setUser(null);
        setProfile(null);
        activeSessionRef.current = null;
      }

      if (mounted) {
        setIsLoading(false);
      }

      if (event === 'SIGNED_OUT' && window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        console.log('User signed out, redirecting to login');
        navigate('/login', { replace: true });
      }
    });

    // Check initial session with race condition protection
    const checkInitialSession = async () => {
      if (!mounted) return;

      try {
        console.log('🔄 Checking initial session...');
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => {
            reject(new Error('Authentication timeout after 8 seconds'));
          }, 8000);
        });

        const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]);

        if (mounted && session?.user) {
          await handleUserSession(session.user);
        }
      } catch (error) {
        console.error('Initial session check failed:', error);
      } finally {
        if (mounted) {
          setIsInitialized(true);
          setIsLoading(false);
        }
      }
    };

    checkInitialSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate])

  const handleUserSession = async (supabaseUser: SupabaseUser) => {
    // Prevent duplicate session handling for the same user
    if (activeSessionRef.current === supabaseUser.id) {
      console.log('⏭️ Skipping duplicate session handling for user:', supabaseUser.email);
      return;
    }

    activeSessionRef.current = supabaseUser.id;
    console.log('🔄 Handling user session for:', supabaseUser.email);

    // Set basic user data immediately
    const basicUserData: User = {
      id: supabaseUser.id,
      email: supabaseUser.email!,
      name: supabaseUser.user_metadata?.name || undefined,
      role: 'user' // Default role
    };
    setUser(basicUserData);

    // Fetch profile data with timeout to prevent slow loading
    try {
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Profile fetch timeout after 5 seconds'));
        }, 5000);
      });

      const { data: profileData, error } = await Promise.race([profilePromise, timeoutPromise]);

      if (error) {
        console.warn('Profile fetch failed, using basic user data:', error);
        if (error.code === 'PGRST116') { // "Not found"
          await createBasicProfile(supabaseUser);
        }
        return;
      }

      if (profileData) {
        const enhancedUserData: User = {
          ...basicUserData,
          name: profileData.name || basicUserData.name,
          role: (profileData.role as 'user' | 'admin') || 'user'
        };
        setUser(enhancedUserData);
        setProfile(profileData);
      }
    } catch (profileError) {
      console.error('Profile fetch error (continuing with basic user data):', profileError);
      // Continue with basic user data even if profile fetch fails
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
