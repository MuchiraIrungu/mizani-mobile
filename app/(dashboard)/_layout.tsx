import { Stack } from "expo-router";

/* Dashboard stack — one screen per file in this folder. Navigation between
   them is driven by APP_ROUTES in components/dashboard/dashboardUI.tsx. */

export default function DashboardLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="main" />
      <Stack.Screen name="sales" />
      <Stack.Screen name="kra" />
      <Stack.Screen name="payroll" />
      <Stack.Screen name="inventory" />
      <Stack.Screen name="suppliers" />
      <Stack.Screen name="reports" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="settings" />
      <Stack.Screen
        name="add-transaction"
        options={{ presentation: "modal", animation: "slide_from_bottom" }}
      />
    </Stack>
  );
}
