import {
  Lexend_400Regular,
  Lexend_500Medium,
  Lexend_600SemiBold,
  Lexend_700Bold,
  useFonts,
} from "@expo-google-fonts/lexend";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useRootNavigationState, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { useAuthStore } from "@/store/authStore";
import "../global.css";

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const navigationState = useRootNavigationState();
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(
    null,
  );
  // Restored from secure storage on launch — a signed-in user skips login
  const hydrated = useAuthStore((s) => s.hydrated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // Every screen styles text with Lexend, so all four weights load once here.
  const [fontsLoaded] = useFonts({
    Lexend_400Regular,
    Lexend_500Medium,
    Lexend_600SemiBold,
    Lexend_700Bold,
  });

  useEffect(() => {
    const checkOnboarding = async () => {
      // 🛠️ DEV ONLY: uncomment to clear the flag and see onboarding again.
      // await AsyncStorage.removeItem("hasSeenOnboarding");

      const seen = await AsyncStorage.getItem("hasSeenOnboarding");
      setHasSeenOnboarding(seen === "true");
    };
    checkOnboarding();
  }, []);

  useEffect(() => {
    if (hasSeenOnboarding === null || !hydrated || !navigationState?.key) return;

    // Only redirect when the current place doesn't fit the session, so deep
    // links (and web reloads) into a dashboard screen stay where they are.
    const area = segments[0];
    if (!hasSeenOnboarding) {
      if (area !== "(tabs)") router.replace("/(tabs)");
    } else if (isAuthenticated) {
      if (area !== "(dashboard)") router.replace("/(dashboard)/main");
    } else if (area !== "(auth)") {
      router.replace("/(auth)/login");
    }
  }, [hasSeenOnboarding, hydrated, isAuthenticated, navigationState?.key, router, segments]);

  // Prevent a flash of unstyled content while fonts, the flag and the
  // saved session load.
  if (hasSeenOnboarding === null || !fontsLoaded || !hydrated) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0A5C36" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "none",
        gestureEnabled: false,
      }}
    >
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(dashboard)" />
    </Stack>
  );
}
