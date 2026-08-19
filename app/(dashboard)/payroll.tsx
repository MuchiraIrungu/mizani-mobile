import { useRouter } from "expo-router";
import {
  BarChart3,
  LayoutGrid,
  MoreHorizontal,
  Package,
  Settings as SettingsIcon,
  Truck,
  Users,
} from "lucide-react-native";
import { useState } from "react";
import { ScrollView, StatusBar, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  BottomNav,
  BrandMark,
  MoreSheet,
  NotificationBell,
  SPACE_4,
  SPACE_5,
  SURFACE,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  UserMenu,
  type MoreRoute,
  type NavKey,
  type NotificationItem,
} from "../../components/dashboard/dashboardUI";

const FONT_REG = "Lexend_400Regular";
const FONT_BOLD = "Lexend_700Bold";

const NAV_ITEMS = [
  {
    key: "dashboard" as NavKey,
    label: "Dashboard",
    icon: (c: string) => <LayoutGrid size={20} color={c} />,
  },
  {
    key: "sales" as NavKey,
    label: "Sales",
    icon: (c: string) => <BarChart3 size={20} color={c} />,
  },
  {
    key: "kra" as NavKey,
    label: "KRA",
    icon: (c: string) => <BarChart3 size={20} color={c} />,
    badge: 2,
  },
  {
    key: "more" as NavKey,
    label: "More",
    icon: (c: string) => <MoreHorizontal size={20} color={c} />,
  },
];

const ROUTES: Partial<Record<NavKey, string>> = {
  dashboard: "/(dashboard)/main",
  sales: "/(dashboard)/sales",
  kra: "/(dashboard)/kra",
};

const MOCK_NOTIFICATIONS: NotificationItem[] = [];

export default function PayrollScreen() {
  const router = useRouter();
  const [moreVisible, setMoreVisible] = useState(false);

  const moreRoutes: MoreRoute[] = [
    {
      key: "inventory",
      label: "Inventory",
      icon: (c) => <Package size={18} color={c} />,
      onPress: () => router.push("/(dashboard)/inventory"),
    },
    {
      key: "suppliers",
      label: "Suppliers",
      icon: (c) => <Truck size={18} color={c} />,
      onPress: () => router.push("/(dashboard)/suppliers"),
    },
    {
      key: "reports",
      label: "Reports",
      icon: (c) => <SettingsIcon size={18} color={c} />,
      onPress: () => router.push("/(dashboard)/reports"),
    },
    {
      key: "settings",
      label: "Settings",
      icon: (c) => <SettingsIcon size={18} color={c} />,
      onPress: () => router.push("/(dashboard)/settings"),
    },
  ];

  const handleNavChange = (key: NavKey) => {
    if (key === "more") {
      setMoreVisible(true);
      return;
    }
    const route = ROUTES[key];
    if (route) router.push(route as any);
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: SURFACE }}>
      <StatusBar barStyle="dark-content" backgroundColor={SURFACE} />
      <ScrollView
        contentContainerStyle={{ paddingTop: SPACE_4, paddingBottom: 120 }}
      >
        <View className="flex-row items-center justify-between px-4">
          <View className="flex-row items-center">
            <BrandMark size={36} />
            <Text
              className="text-[17px]"
              style={{ color: TEXT_PRIMARY, fontFamily: FONT_BOLD }}
            >
              Mizani
            </Text>
          </View>
          <View className="flex-row items-center">
            <NotificationBell
              notifications={MOCK_NOTIFICATIONS}
              onViewAll={() => {}}
            />
            <UserMenu
              initials="WM"
              onSettings={() => router.push("/(dashboard)/settings")}
              onLogout={() => router.replace("/login")}
            />
          </View>
        </View>

        <View
          className="px-4"
          style={{ marginTop: SPACE_5, marginBottom: SPACE_4 }}
        >
          <Text
            className="text-[26px]"
            style={{ color: TEXT_PRIMARY, fontFamily: FONT_BOLD }}
          >
            Payroll
          </Text>
          <Text
            className="text-[13px] mt-1"
            style={{ color: TEXT_SECONDARY, fontFamily: FONT_REG }}
          >
            Nairobi Branch · August 2026
          </Text>
        </View>

        <View className="px-4">
          <Text
            className="text-[15px]"
            style={{ color: TEXT_SECONDARY, fontFamily: FONT_REG }}
          >
            Payroll module coming soon.
          </Text>
        </View>
      </ScrollView>

      <BottomNav
        active="more"
        onChange={handleNavChange}
        navItems={NAV_ITEMS}
        onAdd={() => router.push("/(dashboard)/add-transaction")}
      />
      <MoreSheet
        visible={moreVisible}
        onClose={() => setMoreVisible(false)}
        routes={moreRoutes}
      />
    </SafeAreaView>
  );
}
