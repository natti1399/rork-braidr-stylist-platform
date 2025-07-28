import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { Toaster } from 'sonner-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stylist Tab Navigator
function StylistTabNavigator() {
  return (
    <Tab.Navigator
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

// Customer Tab Navigator
function CustomerTabNavigator() {
  return (
    <Tab.Navigator
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
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CustomerTabs" component={CustomerTabNavigator} />
      <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen} />
      <Stack.Screen name="ContactInfo" component={ContactInfoScreen} />
      <Stack.Screen name="LocationSettings" component={LocationSettingsScreen} />
      <Stack.Screen name="FavoriteStylists" component={FavoriteStylists} />
      <Stack.Screen name="ReviewsRatings" component={ReviewsRatingsScreen} />
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
        setNeedsOnboarding(onboardingStatus === 'true');
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      }
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated || needsOnboarding) {
    return <AuthNavigator />;
  }

  return user?.role === 'stylist' ? <StylistTabNavigator /> : <CustomerStackNavigator />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <RootStackNavigator />
        </NavigationContainer>
        <Toaster />
      </AuthProvider>
    </SafeAreaProvider>
  );
}