import { Stack } from "expo-router";

/* Onboarding swiper lives at (tabs)/index. */

export default function TabsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}
