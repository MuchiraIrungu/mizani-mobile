import { useRouter } from "expo-router";
import {
    BarChart3,
    Boxes,
    LayoutGrid,
    MoreHorizontal,
    Package,
    Plus,
    Truck,
    Users,
} from "lucide-react-native";
import { useState } from "react";
import { ScrollView, StatusBar, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
    BottomNav,
    BrandMark,
    GRADIENT_PRIMARY,
    GradientStatCard,
    InfoRow,
    MoreSheet,
    NotificationBell,
    PrimaryButton,
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
const FONT_SEMI = "Lexend_600SemiBold";
const FONT_BOLD = "Lexend_700Bold";

const INTEGRATIONS = [
  {
    name: "M-Pesa Till",
    detail: "Till 5482 · Buy Goods · Safaricom",
    status: "Active" as const,
  },
  {
    name: "M-Pesa Paybill",
    detail: "Paybill 400200 · Account by invoice ref",
    status: "Active" as const,
  },
  {
    name: "Equity Bank",
    detail: "Account ····4471 · Statement feed daily 06:00",
    status: "Active" as const,
  },
  {
    name: "KRA eTIMS",
    detail: "PIN P051428776K · 2 invoices awaiting control no.",
    status: "Fix" as const,
  },
  {
    name: "QuickBooks Export",
    detail: "Last export 31 Jul 2026 · Monthly journal",
    status: "Active" as const,
  },
];

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

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    title: "New invoice #INV-2044 created",
    time: "2 min ago",
    tone: "positive",
  },
];

export default function SettingsScreen() {
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
      key: "payroll",
      label: "Payroll",
      icon: (c) => <Users size={18} color={c} />,
      onPress: () => router.push("/(dashboard)/payroll"),
    },
    {
      key: "suppliers",
      label: "Suppliers",
      icon: (c) => <Truck size={18} color={c} />,
      onPress: () => router.push("/(dashboard)/supplier"),
    },
    {
      key: "reports",
      label: "Reports",
      icon: (c) => <Boxes size={18} color={c} />,
      onPress: () => router.push("/(dashboard)/reports"),
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
        showsVerticalScrollIndicator={false}
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
              onViewAll={() => router.push("/(dashboard)/main")}
            />
            <UserMenu
              initials="WM"
              onSettings={() => {}}
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
            Settings
          </Text>
          <Text
            className="text-[13px] mt-1"
            style={{ color: TEXT_SECONDARY, fontFamily: FONT_REG }}
          >
            Business profile, integrations and access control
          </Text>
        </View>

        <View className="px-4">
          <GradientStatCard
            title="Mizani Trading Co. Ltd"
            value="Westlands, Nairobi"
            helper="3 branches · KRA PIN P051428776K · Reg. PVT-8KLM2QP"
            actionLabel="Edit Profile"
            onAction={() => {}}
            colors={GRADIENT_PRIMARY}
          />

          <Text
            className="text-[16px] mb-3"
            style={{ color: TEXT_PRIMARY, fontFamily: FONT_SEMI }}
          >
            Connected Integrations
          </Text>
          {INTEGRATIONS.map((i) => (
            <InfoRow
              key={i.name}
              title={i.name}
              subtitle={i.detail}
              trailingLabel={i.status}
              trailingTone={i.status === "Active" ? "positive" : "danger"}
            />
          ))}
          <View style={{ marginTop: SPACE_4 }}>
            <PrimaryButton
              label="Add Integration"
              icon={<Plus size={16} color="#FFFFFF" />}
              onPress={() => {}}
            />
          </View>
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
