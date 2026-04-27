import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { queryClient } from "@/lib/query-client";
import { AuthProvider } from "@/lib/auth-context";
import { AppProvider } from "@/context/AppContext";
import { MascotProvider } from "@/lib/mascot-context";
import { useFonts, Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold, Nunito_800ExtraBold } from "@expo-google-fonts/nunito";
import { 
  Fredoka_400Regular, 
  Fredoka_500Medium, 
  Fredoka_600SemiBold, 
  Fredoka_700Bold 
} from "@expo-google-fonts/fredoka";
import { StatusBar } from "expo-status-bar";
import { DemoBanner } from "@/components/DemoBanner";

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  return (
    <>
      <DemoBanner />
      <Stack screenOptions={{ headerShown: false, headerBackTitle: "Back" }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="role-select" />
        <Stack.Screen name="login" />
        <Stack.Screen name="login-parent" />
        <Stack.Screen name="login-child" />
        <Stack.Screen name="register" />
        <Stack.Screen name="parent/(tabs)" />
        <Stack.Screen name="parent/create-task" options={{ presentation: "modal" }} />
        <Stack.Screen name="parent/create-campaign" options={{ presentation: "modal" }} />
        <Stack.Screen name="parent/create-mission" options={{ presentation: "modal" }} />
        <Stack.Screen name="parent/add-child" options={{ presentation: "modal" }} />
        <Stack.Screen name="parent/approve" />
        <Stack.Screen name="child/(tabs)" />
        <Stack.Screen name="child/submit-task" options={{ presentation: "modal" }} />
        <Stack.Screen name="child/shop" />
        <Stack.Screen name="child/quiz" />
        <Stack.Screen name="child/aula" />
        <Stack.Screen name="admin-login" />
        <Stack.Screen name="admin" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
    Fredoka_400Regular,
    Fredoka_500Medium,
    Fredoka_600SemiBold,
    Fredoka_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView>
          <KeyboardProvider>
            <AuthProvider>
              <AppProvider>
                <MascotProvider>
                  <StatusBar style="light" />
                  <RootLayoutNav />
                </MascotProvider>
              </AppProvider>
            </AuthProvider>
          </KeyboardProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
