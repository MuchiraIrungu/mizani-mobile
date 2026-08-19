import { Stack } from "expo-router";

export default function DashboardLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="main" />
      <Stack.Screen name="sales" />
      <Stack.Screen name="inventory" />
      <Stack.Screen name="payroll" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="reports" />
      <Stack.Screen name="kra" />
      <Stack.Screen name="suppliers" />
      <Stack.Screen name="add-transaction" />
    </Stack>
  );
}
