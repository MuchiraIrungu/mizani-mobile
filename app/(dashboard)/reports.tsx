import { useRouter } from "expo-router";
import {
    BarChart3,
    Download,
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
    GREEN,
    GREEN_TINT_A,
    MoreSheet,
    NotificationBell,
    PillTabs,
    PrimaryButton,
    SPACE_4,
    SPACE_5,
    StatCard,
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

const EXPENSE_BREAKDOWN = [
  { label: "Stock purchases", value: "KSh 812,000", pct: "58%" },
  { label: "Payroll", value: "KSh 402,150", pct: "29%" },
  { label: "Rent & utilities", value: "KSh 96,400", pct: "7%" },
  { label: "Logistics", value: "KSh 54,600", pct: "4%" },
  { label: "Other", value: "KSh 29,000", pct: "2%" },
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

export default function ReportsScreen() {
  const router = useRouter();
  const [period, setPeriod] = useState("M");
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
            Reports
          </Text>
          <Text
            className="text-[13px] mt-1"
            style={{ color: TEXT_SECONDARY, fontFamily: FONT_REG }}
          >
            Nairobi Branch · 1 – 31 Aug 2026
          </Text>
        </View>

        <View className="px-4">
          <PillTabs
            options={["W", "M", "Q", "Y"]}
            value={period}
            onChange={setPeriod}
          />
          <StatCard
            title="Revenue"
            badgeLabel="+12.5%"
            badgeTone="positive"
            value="KSh 2,486,900"
            helper="Against the previous month"
          />
          <StatCard
            title="Expenses"
            badgeLabel="+4.1%"
            badgeTone="warning"
            value="KSh 1,394,150"
            helper="Gross margin 44% this month"
          />

          <Text
            className="text-[16px] mb-3"
            style={{ color: TEXT_PRIMARY, fontFamily: FONT_SEMI }}
          >
            Expense Breakdown
          </Text>
          <View
            className="rounded-[12px] p-4 mb-5"
            style={{
              backgroundColor: "#FFFFFF",
              shadowColor: "#0F172A",
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.14,
              shadowRadius: 7,
              elevation: 4,
            }}
          >
            {EXPENSE_BREAKDOWN.map((row, i) => (
              <View
                key={row.label}
                className="flex-row items-center justify-between py-3"
                style={{
                  borderTopWidth: i === 0 ? 0 : 1,
                  borderTopColor: "#D9DEDB",
                }}
              >
                <View className="flex-row items-center flex-1">
                  <View
                    className="w-2.5 h-2.5 rounded-[999px] mr-3"
                    style={{ backgroundColor: GREEN }}
                  />
                  <View>
                    <Text
                      className="text-[13px]"
                      style={{ color: TEXT_PRIMARY, fontFamily: FONT_SEMI }}
                    >
                      {row.label}
                    </Text>
                    <Text
                      className="text-[12px] mt-0.5"
                      style={{ color: TEXT_SECONDARY, fontFamily: FONT_REG }}
                    >
                      {row.value}
                    </Text>
                  </View>
                </View>
                <View
                  className="px-2.5 py-1 rounded-[999px]"
                  style={{ backgroundColor: GREEN_TINT_A }}
                >
                  <Text
                    className="text-[11px]"
                    style={{ color: GREEN, fontFamily: FONT_SEMI }}
                  >
                    {row.pct}
                  </Text>
                </View>
              </View>
            ))}
          </View>
          <PrimaryButton
            label="Export Report (PDF)"
            icon={<Download size={16} color="#FFFFFF" />}
            onPress={() => {}}
          />
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
