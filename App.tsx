import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { Toaster } from 'sonner-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { supabase } from './utils/supabase';
import { trpc, trpcClient } from './lib/trpc';

// Auth
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthNavigator from './navigation/AuthNavigator';

// Components
import LoadingScreen from './components/LoadingScreen';

// Screens
import RoleSelectScreen from './screens/RoleSelectScreen';

// Stylist Screens
import StylistHomeScreen from './screens/stylist/StylistHomeScreen';
import StylistCalendarScreen from './screens/stylist/StylistCalendarScreen';
import StylistMessagesScreen from './screens/stylist/StylistMessagesScreen';
import StylistProfileScreen from './screens/stylist/StylistProfileScreen';

// Customer Screens
import CustomerHomeScreen from './screens/customer/CustomerHomeScreen';
import CustomerSearchScreen from './screens/customer/CustomerSearchScreen';
import CustomerBookingsScreen from './screens/customer/CustomerBookingsScreen';
import CustomerMessagesScreen from './screens/customer/CustomerMessagesScreen';
import CustomerProfileScreen from './screens/customer/CustomerProfileScreen';

// Customer Sub-screens
import PersonalInfoScreen from './screens/customer/PersonalInfoScreen';
import ContactInfoScreen from './screens/customer/ContactInfoScreen';
import LocationSettingsScreen from './screens/customer/LocationSettingsScreen';
import FavoriteStylists from './screens/customer/FavoriteStylists';
import ReviewsRatingsScreen from './screens/customer/ReviewsRatingsScreen';

// New Customer Screens
import ChatScreen from './screens/customer/ChatScreen';
import StylistDetailScreen from './screens/customer/StylistDetailScreen';
import ServiceSelectionScreen from './screens/customer/ServiceSelectionScreen';
import BookingDetailsScreen from './screens/customer/BookingDetailsScreen';
import TimeSlotSelectionScreen from './screens/customer/TimeSlotSelectionScreen';
import BookingConfirmationScreen from './screens/customer/BookingConfirmationScreen';
import WriteReviewScreen from './screens/customer/WriteReviewScreen';
import ReviewDetailScreen from './screens/customer/ReviewDetailScreen';
import NotificationCenterScreen from './screens/customer/NotificationCenterScreen';
import AdvancedFiltersScreen from './screens/customer/AdvancedFiltersScreen';

// New Stylist Screens
import ServiceManagementScreen from './screens/stylist/ServiceManagementScreen';
import AvailabilityManagementScreen from './screens/stylist/AvailabilityManagementScreen';
import StylistSettingsScreen from './screens/stylist/StylistSettingsScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stylist Tab Navigator
function StylistTabNavigator() {
  return (
    <Tab.Navigator
      id="StylistTabs"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Calendar') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Messages') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4267FF',
        tabBarInactiveTintColor: 'gray',
        tabBarShowLabel: false,
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={StylistHomeScreen} />
      <Tab.Screen name="Calendar" component={StylistCalendarScreen} />
      <Tab.Screen name="Messages" component={StylistMessagesScreen} />
      <Tab.Screen name="Profile" component={StylistProfileScreen} />
    </Tab.Navigator>
  );
}

// Stylist Stack Navigator (includes sub-screens)
function StylistStackNavigator() {
  return (
    <Stack.Navigator id="StylistStack" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="StylistTabs" component={StylistTabNavigator} />
      
      {/* Stylist Management Screens */}
      <Stack.Screen name="ServiceManagement" component={ServiceManagementScreen} />
      <Stack.Screen name="AvailabilityManagement" component={AvailabilityManagementScreen} />
      <Stack.Screen name="StylistSettings" component={StylistSettingsScreen} />
      
      {/* Shared Screens (accessible by stylists too) */}
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="NotificationCenter" component={NotificationCenterScreen} />
    </Stack.Navigator>
  );
}

// Customer Tab Navigator
function CustomerTabNavigator() {
  return (
    <Tab.Navigator
      id="CustomerTabs"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Search') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Bookings') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Messages') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4267FF',
        tabBarInactiveTintColor: 'gray',
        tabBarShowLabel: false,
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={CustomerHomeScreen} />
      <Tab.Screen name="Search" component={CustomerSearchScreen} />
      <Tab.Screen name="Bookings" component={CustomerBookingsScreen} />
      <Tab.Screen name="Messages" component={CustomerMessagesScreen} />
      <Tab.Screen name="Profile" component={CustomerProfileScreen} />
    </Tab.Navigator>
  );
}

// Customer Stack Navigator (includes sub-screens)
function CustomerStackNavigator() {
  return (
    <Stack.Navigator id="CustomerStack" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CustomerTabs" component={CustomerTabNavigator} />
      
      {/* Profile Sub-screens */}
      <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen} />
      <Stack.Screen name="ContactInfo" component={ContactInfoScreen} />
      <Stack.Screen name="LocationSettings" component={LocationSettingsScreen} />
      <Stack.Screen name="FavoriteStylists" component={FavoriteStylists} />
      <Stack.Screen name="ReviewsRatings" component={ReviewsRatingsScreen} />
      
      {/* Main App Screens */}
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="StylistDetail" component={StylistDetailScreen} />
      <Stack.Screen name="ServiceSelection" component={ServiceSelectionScreen} />
      <Stack.Screen name="BookingDetails" component={BookingDetailsScreen} />
      <Stack.Screen name="TimeSlotSelection" component={TimeSlotSelectionScreen} />
      <Stack.Screen name="BookingConfirmation" component={BookingConfirmationScreen} />
      <Stack.Screen name="WriteReview" component={WriteReviewScreen} />
      <Stack.Screen name="ReviewDetail" component={ReviewDetailScreen} />
      <Stack.Screen name="NotificationCenter" component={NotificationCenterScreen} />
      <Stack.Screen name="AdvancedFilters" component={AdvancedFiltersScreen} />
    </Stack.Navigator>
  );
}

// Root Stack Navigator
function RootStackNavigator() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    checkOnboardingStatus();
  }, [user]);

  const checkOnboardingStatus = async () => {
    if (user) {
      try {
        const onboardingStatus = await AsyncStorage.getItem('needsOnboarding');
        console.log('App - checking onboarding status for user:', user.email, 'status:', onboardingStatus);
        setNeedsOnboarding(onboardingStatus === 'true');
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      }
    } else {
      console.log('App - no user, clearing onboarding status');
      setNeedsOnboarding(false);
    }
  };

  if (isLoading) {
    console.log('App - showing loading screen');
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    console.log('App - user not authenticated, showing AuthNavigator');
    return <AuthNavigator />;
  }

  if (needsOnboarding) {
    console.log('App - user needs onboarding, showing AuthNavigator');
    return <AuthNavigator />;
  }

  console.log('App - user authenticated and onboarded, showing main app for role:', user?.role);
  return user?.role === 'stylist' ? <StylistStackNavigator /> : <CustomerStackNavigator />;
}

// Create a query client
const queryClient = new QueryClient();

export default function App() {
  return (
    <SafeAreaProvider>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <NavigationContainer>
              <RootStackNavigator />
            </NavigationContainer>
            <Toaster />
          </AuthProvider>
        </QueryClientProvider>
      </trpc.Provider>
    </SafeAreaProvider>
  );
}