import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useRootNavigationState, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import "../global.css";

export default function RootLayout() {
  const router = useRouter();
  const navigationState = useRootNavigationState();
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(
    null,
  );

  useEffect(() => {
    const checkOnboarding = async () => {
      // 🛠️ DEV ONLY: Uncomment the line below once to clear the saved flag and see onboarding again!
      await AsyncStorage.removeItem("hasSeenOnboarding");

      const seen = await AsyncStorage.getItem("hasSeenOnboarding");
      setHasSeenOnboarding(seen === "true");
    };
    checkOnboarding();
  }, []);

  useEffect(() => {
    if (hasSeenOnboarding === null || !navigationState?.key) return;

    if (!hasSeenOnboarding) {
      router.replace("/(tabs)");
    } else {
      router.replace("/(auth)/login");
    }
  }, [hasSeenOnboarding, navigationState?.key, router]);

  // Prevent flash of screen content while reading AsyncStorage
  if (hasSeenOnboarding === null) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(dashboard)" />
    </Stack>
  );
}
