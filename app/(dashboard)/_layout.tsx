import { Stack } from "expo-router";

/* Dashboard stack — one screen per file in this folder. Navigation between
   them is driven by APP_ROUTES in components/dashboard/dashboardUI.tsx.
   Screens swap with no animation and no swipe-back gesture: sections are
   siblings reached from the bottom nav, not a back-and-forward history. */

export default function DashboardLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "none",
        gestureEnabled: false,
      }}
    >
      <Stack.Screen name="main" />
      <Stack.Screen name="sales" />
      <Stack.Screen name="kra" />
      <Stack.Screen name="payroll" />
      <Stack.Screen name="inventory" />
      <Stack.Screen name="suppliers" />
      <Stack.Screen name="reports" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="add-transaction" />
    </Stack>
  );
}
