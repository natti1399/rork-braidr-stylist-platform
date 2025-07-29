import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService, User, AuthTokens } from '../src/services/api';

interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: 'customer' | 'stylist';
  firstName: string;
  lastName: string;
  isEmailVerified: boolean;
  avatar?: string;
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
  }, []);

  const checkAuthState = async () => {
    try {
      const tokens = await AsyncStorage.getItem('authTokens');
      if (tokens) {
        // Try to get user profile with stored token
        const response = await apiService.getProfile();
        if (response.success && response.data) {
          const userData: AuthUser = {
            id: response.data.id,
            fullName: `${response.data.firstName} ${response.data.lastName}`,
            email: response.data.email,
            role: response.data.role,
            firstName: response.data.firstName,
            lastName: response.data.lastName,
            isEmailVerified: response.data.isEmailVerified,
            avatar: response.data.avatar,
          };
          setUser(userData);
        } else {
          // Token is invalid, clear storage
          await AsyncStorage.multiRemove(['authTokens', 'user', 'needsOnboarding']);
        }
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
      // Clear invalid tokens
      await AsyncStorage.multiRemove(['authTokens', 'user', 'needsOnboarding']);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string, role: 'customer' | 'stylist') => {
    try {
      setIsLoading(true);
      
      const response = await apiService.login(email, password);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to sign in');
      }
      
      if (response.data) {
        // Validate that the user's role matches the selected role
        if (response.data.user.role !== role) {
          throw new Error(`Invalid role. Please sign in as a ${response.data.user.role}.`);
        }
        
        // Store tokens
        await AsyncStorage.setItem('authTokens', JSON.stringify(response.data.tokens));
        
        // Create user data
        const userData: AuthUser = {
          id: response.data.user.id,
          fullName: `${response.data.user.firstName} ${response.data.user.lastName}`,
          email: response.data.user.email,
          role: response.data.user.role,
          firstName: response.data.user.firstName,
          lastName: response.data.user.lastName,
          isEmailVerified: response.data.user.isEmailVerified,
          avatar: response.data.user.avatar,
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
  }) => {
    try {
      setIsLoading(true);
      
      const registerData = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: userData.password,
        userType: userData.role,
      };
      
      const response = await apiService.register(registerData);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to create account');
      }
      
      if (response.data) {
        // Store tokens
        await AsyncStorage.setItem('authTokens', JSON.stringify(response.data.tokens));
        
        // Create user data
        const newUser: AuthUser = {
          id: response.data.user.id,
          fullName: `${response.data.user.firstName} ${response.data.user.lastName}`,
          email: response.data.user.email,
          role: response.data.user.role,
          firstName: response.data.user.firstName,
          lastName: response.data.user.lastName,
          isEmailVerified: response.data.user.isEmailVerified,
          avatar: response.data.user.avatar,
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
      // Call logout endpoint
      await apiService.logout();
      
      // Clear local storage
      await AsyncStorage.multiRemove(['user', 'needsOnboarding', 'authTokens']);
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
      // Even if API call fails, clear local data
      await AsyncStorage.multiRemove(['user', 'needsOnboarding', 'authTokens']);
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
      const response = await apiService.getProfile();
      if (response.success && response.data) {
        const userData: AuthUser = {
          id: response.data.id,
          fullName: `${response.data.firstName} ${response.data.lastName}`,
          email: response.data.email,
          role: response.data.role,
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          isEmailVerified: response.data.isEmailVerified,
          avatar: response.data.avatar,
        };
        setUser(userData);
        await AsyncStorage.setItem('user', JSON.stringify(userData));
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