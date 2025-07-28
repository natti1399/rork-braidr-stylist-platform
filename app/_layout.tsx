import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { StylistProvider } from "@/context/StylistContext";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="add-service" options={{ title: "Add Service" }} />
      <Stack.Screen name="edit-service/[id]" options={{ title: "Edit Service" }} />
      <Stack.Screen name="appointment/[id]" options={{ title: "Appointment Details" }} />
      <Stack.Screen name="add-booking" options={{ title: "Add Booking" }} />
      <Stack.Screen name="reschedule/[id]" options={{ title: "Reschedule" }} />
      <Stack.Screen name="conversation/[id]" options={{ title: "Conversation" }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StylistProvider>
          <RootLayoutNav />
        </StylistProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}