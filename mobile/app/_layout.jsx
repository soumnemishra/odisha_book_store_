import { SplashScreen, Slot } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import SafeScreen from "../components/SafeScreen";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StyleSheet } from "react-native";
import { ToastProvider } from "../components/ui/Toast";

// Odia fonts from Google Fonts
import {
  NotoSansOriya_400Regular,
  NotoSansOriya_500Medium,
  NotoSansOriya_600SemiBold,
  NotoSansOriya_700Bold,
} from "@expo-google-fonts/noto-sans-oriya";

import { useAuthStore } from "../store/authStore";
import { useCartStore } from "../store/cartStore";
import { useEffect } from "react";

SplashScreen.preventAutoHideAsync();

// Create QueryClient instance for React Query
// This handles all server state caching, refetching, and synchronization
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time: How long data is considered fresh (5 minutes)
      staleTime: 1000 * 60 * 5,
      // Cache time: How long data stays in cache (30 minutes)
      cacheTime: 1000 * 60 * 30,
      // Retry failed requests 2 times before giving up
      retry: 2,
      // Refetch on window focus (useful for mobile when app comes back to foreground)
      refetchOnWindowFocus: true,
      // Don't refetch on component mount if data is still fresh
      refetchOnMount: false,
    },
  },
});

export default function RootLayout() {
  const { checkAuth } = useAuthStore();
  const { loadCart } = useCartStore();

  const [fontsLoaded] = useFonts({
    "JetBrainsMono-Medium": require("../assets/fonts/JetBrainsMono-Medium.ttf"),
    // Odia fonts for regional text
    "NotoSansOriya-Regular": NotoSansOriya_400Regular,
    "NotoSansOriya-Medium": NotoSansOriya_500Medium,
    "NotoSansOriya-SemiBold": NotoSansOriya_600SemiBold,
    "NotoSansOriya-Bold": NotoSansOriya_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  useEffect(() => {
    checkAuth();
    loadCart(); // Load cart from AsyncStorage on app start
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <ToastProvider>
            <SafeScreen>
              <Slot />
            </SafeScreen>
            <StatusBar style="dark" />
          </ToastProvider>
        </SafeAreaProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
