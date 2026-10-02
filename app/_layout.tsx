import {
  Lexend_400Regular,
  Lexend_500Medium,
  Lexend_600SemiBold,
  Lexend_700Bold,
  useFonts,
} from "@expo-google-fonts/lexend";
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
      //await AsyncStorage.removeItem("hasSeenOnboarding");

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

  // Prevent a flash of unstyled content while fonts and the flag load.
  if (hasSeenOnboarding === null || !fontsLoaded) {
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
