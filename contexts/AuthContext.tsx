import { supabase } from '@/config/supabase';
import { removeNotificationToken, saveNotificationToken } from '@/services/jobService';
import { registerForPushNotificationsAsync } from '@/services/notificationService';
import { Session, User } from '@supabase/supabase-js';
import React, { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { AppState } from 'react-native';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  expoPushToken: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Tells Supabase Auth to continuously refresh the session automatically
// if the app is in the foreground
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh()
  } else {
    supabase.auth.stopAutoRefresh()
  }
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);

  // Register for push notifications and save token when user signs in
  useEffect(() => {
    if (user && !expoPushToken) {
      registerForPushNotificationsAsync().then(token => {
        if (token) {
          setExpoPushToken(token);
          saveNotificationToken(user.id, token).catch(error => {
            console.error('Failed to save notification token:', error);
          });
        }
      });
    }
  }, [user, expoPushToken]);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session?.user?.email || 'No user');
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', session?.user?.email || 'No user');
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Clear token when user signs out
      if (!session?.user) {
        setExpoPushToken(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      console.log('Sign in successful');
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw new Error(getAuthErrorMessage(error.message));
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: name,
          }
        }
      });
      
      if (error) throw error;
      
      // Check if email confirmation is required
      if (!data.session) {
        throw new Error('Please check your inbox for email verification!');
      }
      
      console.log('Sign up successful');
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw new Error(getAuthErrorMessage(error.message));
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('Attempting to sign out...');
      
      // Remove notification token before signing out
      if (user) {
        await removeNotificationToken(user.id).catch(error => {
          console.error('Failed to remove notification token:', error);
        });
      }
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      console.log('Sign out successful');
    } catch (error: any) {
      console.error('Sign out error:', error);
      throw new Error('Failed to sign out. Please try again.');
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, logout, expoPushToken }}>
      {children}
    </AuthContext.Provider>
  );
}

function getAuthErrorMessage(errorMessage: string): string {
  if (errorMessage.includes('Invalid login credentials')) {
    return 'Invalid email or password.';
  }
  if (errorMessage.includes('User already registered')) {
    return 'An account with this email already exists.';
  }
  if (errorMessage.includes('Password should be at least')) {
    return 'Password should be at least 6 characters.';
  }
  if (errorMessage.includes('Invalid email')) {
    return 'Invalid email address.';
  }
  if (errorMessage.includes('Email not confirmed')) {
    return 'Please check your email and click the confirmation link.';
  }
  return errorMessage || 'Authentication failed. Please try again.';
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 