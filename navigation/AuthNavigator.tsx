import React, { useState, useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Auth Screens
import LandingScreen from '../screens/auth/LandingScreen';
import SignInScreen from '../screens/auth/SignInScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import OnboardingScreen from '../screens/auth/OnboardingScreen';

// Context
import { useAuth } from '../contexts/AuthContext';

export type AuthStackParamList = {
  Landing: undefined;
  SignIn: { role: 'customer' | 'stylist' };
  SignUp: { role: 'customer' | 'stylist' };
  Onboarding: { role: 'customer' | 'stylist' };
};

const Stack = createStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  const { signIn, signUp, completeOnboarding, user, isAuthenticated } = useAuth();
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [userRole, setUserRole] = useState<'customer' | 'stylist' | null>(null);

  useEffect(() => {
    checkOnboardingStatus();
  }, [user, isAuthenticated]);

  const checkOnboardingStatus = async () => {
    try {
      const onboardingStatus = await AsyncStorage.getItem('needsOnboarding');
      console.log('AuthNavigator - checking onboarding status:', onboardingStatus, 'user:', user?.email, user?.role);
      
      if (onboardingStatus === 'true' && user) {
        console.log('AuthNavigator - setting up onboarding for user:', user.role);
        setUserRole(user.role);
        setNeedsOnboarding(true);
      } else {
        console.log('AuthNavigator - no onboarding needed');
        setNeedsOnboarding(false);
        setUserRole(null);
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    }
  };

  const handleRoleSelect = (role: 'customer' | 'stylist') => {
    setUserRole(role);
  };

  const handleSignIn = async (email: string, password: string, role: 'customer' | 'stylist') => {
    await signIn(email, password, role);
  };

  const handleSignUp = async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: 'customer' | 'stylist';
  }) => {
    try {
      await signUp(userData);
      console.log('AuthNavigator - signup successful, setting up onboarding');
      // After successful signup, set the user role and trigger onboarding
      setUserRole(userData.role);
      setNeedsOnboarding(true);
    } catch (error) {
      console.error('Sign up error in navigator:', error);
      throw error;
    }
  };

  const handleCompleteOnboarding = async () => {
    await completeOnboarding();
    setNeedsOnboarding(false);
    setUserRole(null);
  };

  // If user needs onboarding, show onboarding screen
  if (needsOnboarding && userRole) {
    console.log('AuthNavigator - showing onboarding screen for role:', userRole);
    return (
      <OnboardingScreen
        role={userRole}
        onComplete={handleCompleteOnboarding}
        onBack={() => setNeedsOnboarding(false)}
      />
    );
  }

  console.log('AuthNavigator - showing auth stack, needsOnboarding:', needsOnboarding, 'userRole:', userRole);

  return (
    <Stack.Navigator
      id="auth-stack"
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#FFFFFF' },
      }}
      initialRouteName="Landing"
    >
      <Stack.Screen name="Landing">
        {(props) => (
          <LandingScreen
            {...props}
            onRoleSelect={(role) => {
              handleRoleSelect(role);
              props.navigation.navigate('SignIn', { role });
            }}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="SignIn">
        {(props) => (
          <SignInScreen
            {...props}
            role={props.route.params.role}
            onBack={() => props.navigation.goBack()}
            onSignIn={handleSignIn}
            onCreateAccount={() => {
              props.navigation.navigate('SignUp', {
                role: props.route.params.role,
              });
            }}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="SignUp">
        {(props) => (
          <SignUpScreen
            {...props}
            role={props.route.params.role}
            onBack={() => props.navigation.goBack()}
            onSignUp={handleSignUp}
            onSignIn={() => {
              props.navigation.navigate('SignIn', {
                role: props.route.params.role,
              });
            }}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="Onboarding">
        {(props) => (
          <OnboardingScreen
            {...props}
            role={props.route.params.role}
            onComplete={handleCompleteOnboarding}
            onBack={() => props.navigation.goBack()}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}