import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../utils/supabase';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';

interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: 'customer' | 'stylist';
  firstName: string;
  lastName: string;
  isEmailVerified: boolean;
  avatar?: string;
  supabaseUser?: SupabaseUser;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string, role: 'customer' | 'stylist') => Promise<void>;
  signUp: (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: 'customer' | 'stylist';
  }) => Promise<void>;
  signOut: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (event === 'SIGNED_IN' && session?.user) {
          // User signed in, fetch their profile
          const { data: userProfile, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (!error && userProfile) {
            const userData: AuthUser = {
              id: userProfile.id,
              fullName: `${userProfile.first_name} ${userProfile.last_name}`,
              email: userProfile.email,
              role: userProfile.role,
              firstName: userProfile.first_name,
              lastName: userProfile.last_name,
              isEmailVerified: userProfile.is_email_verified,
              avatar: userProfile.avatar,
              supabaseUser: session.user,
            };
            setUser(userData);
            await AsyncStorage.setItem('user', JSON.stringify(userData));
          }
        } else if (event === 'SIGNED_OUT') {
          // User signed out
          setUser(null);
          await AsyncStorage.removeItem('user');
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkAuthState = async () => {
    try {
      // Get current session from Supabase
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        setUser(null);
        return;
      }
      
      if (session?.user) {
        // Get user profile from our users table
        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profileError) {
          console.error('Error fetching user profile:', profileError);
          setUser(null);
          return;
        }
        
        if (userProfile) {
          const userData: AuthUser = {
            id: userProfile.id,
            fullName: `${userProfile.first_name} ${userProfile.last_name}`,
            email: userProfile.email,
            role: userProfile.role,
            firstName: userProfile.first_name,
            lastName: userProfile.last_name,
            isEmailVerified: userProfile.is_email_verified,
            avatar: userProfile.avatar,
            supabaseUser: session.user,
          };
          setUser(userData);
          await AsyncStorage.setItem('user', JSON.stringify(userData));
        }
      } else {
        setUser(null);
        await AsyncStorage.removeItem('user');
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string, role: 'customer' | 'stylist') => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (data.user) {
        // Get user profile from our users table
        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();
        
        if (profileError) {
          throw new Error('Failed to fetch user profile');
        }
        
        // Validate that the user's role matches the selected role
        if (userProfile.role !== role) {
          throw new Error(`Invalid role. Please sign in as a ${userProfile.role}.`);
        }
        
        const userData: AuthUser = {
          id: userProfile.id,
          fullName: `${userProfile.first_name} ${userProfile.last_name}`,
          email: userProfile.email,
          role: userProfile.role,
          firstName: userProfile.first_name,
          lastName: userProfile.last_name,
          isEmailVerified: userProfile.is_email_verified,
          avatar: userProfile.avatar,
          supabaseUser: data.user,
        };
        
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: 'customer' | 'stylist';
    phone?: string;
  }) => {
    setIsLoading(true);
    try {
      // Sign up with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (data.user) {
        // Create user profile in our users table
        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: userData.email,
            first_name: userData.firstName,
            last_name: userData.lastName,
            role: userData.role,
            phone: userData.phone,
            is_email_verified: false,
            is_active: true,
          })
          .select()
          .single();
        
        if (profileError) {
          throw new Error('Failed to create user profile');
        }
        
        const newUser: AuthUser = {
          id: userProfile.id,
          fullName: `${userProfile.first_name} ${userProfile.last_name}`,
          email: userProfile.email,
          role: userProfile.role,
          firstName: userProfile.first_name,
          lastName: userProfile.last_name,
          isEmailVerified: userProfile.is_email_verified,
          avatar: userProfile.avatar,
          supabaseUser: data.user,
        };
        
        await AsyncStorage.setItem('user', JSON.stringify(newUser));
        await AsyncStorage.setItem('needsOnboarding', 'true');
        setUser(newUser);
      }
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Supabase sign out error:', error);
      }
      
      // Clear local storage
      await AsyncStorage.multiRemove(['user', 'needsOnboarding']);
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
      // Even if sign out fails, clear local data
      await AsyncStorage.multiRemove(['user', 'needsOnboarding']);
      setUser(null);
    }
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.removeItem('needsOnboarding');
    } catch (error) {
      console.error('Complete onboarding error:', error);
    }
  };

  const refreshUserProfile = async () => {
    try {
      const { data: { user: supabaseUser } } = await supabase.auth.getUser();
      
      if (supabaseUser) {
        const { data: userProfile, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', supabaseUser.id)
          .single();
        
        if (error) {
          console.error('Error fetching user profile:', error);
          return;
        }
        
        if (userProfile) {
          const userData: AuthUser = {
            id: userProfile.id,
            fullName: `${userProfile.first_name} ${userProfile.last_name}`,
            email: userProfile.email,
            role: userProfile.role,
            firstName: userProfile.first_name,
            lastName: userProfile.last_name,
            isEmailVerified: userProfile.is_email_verified,
            avatar: userProfile.avatar,
            supabaseUser,
          };
          setUser(userData);
          await AsyncStorage.setItem('user', JSON.stringify(userData));
        }
      }
    } catch (error) {
      console.error('Error refreshing user profile:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    completeOnboarding,
    refreshUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;