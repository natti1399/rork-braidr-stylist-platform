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
  const { signIn, signUp, completeOnboarding } = useAuth();
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [userRole, setUserRole] = useState<'customer' | 'stylist' | null>(null);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const onboardingStatus = await AsyncStorage.getItem('needsOnboarding');
      const userData = await AsyncStorage.getItem('user');
      
      if (onboardingStatus === 'true' && userData) {
        const user = JSON.parse(userData);
        setUserRole(user.role);
        setNeedsOnboarding(true);
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
    fullName: string;
    email: string;
    password: string;
    role: 'customer' | 'stylist';
  }) => {
    await signUp(userData);
    setNeedsOnboarding(true);
    setUserRole(userData.role);
  };

  const handleCompleteOnboarding = async () => {
    await completeOnboarding();
    setNeedsOnboarding(false);
    setUserRole(null);
  };

  // If user needs onboarding, show onboarding screen
  if (needsOnboarding && userRole) {
    return (
      <OnboardingScreen
        role={userRole}
        onComplete={handleCompleteOnboarding}
        onBack={() => setNeedsOnboarding(false)}
      />
    );
  }

  return (
    <Stack.Navigator
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