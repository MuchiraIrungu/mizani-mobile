import { useRouter } from "expo-router";
import {
    BarChart3,
    Boxes,
    Download,
    LayoutGrid,
    MoreHorizontal,
    Package,
    Settings as SettingsIcon,
    Users,
} from "lucide-react-native";
import { useState } from "react";
import { ScrollView, StatusBar, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
    BottomNav,
    BrandMark,
    GhostPillButton,
    InfoRow,
    MoreSheet,
    NotificationBell,
    PillTabs,
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
const FONT_BOLD = "Lexend_700Bold";

const SUPPLIERS = [
  {
    name: "Unga Group",
    detail: "Dry goods · Flour milling · Net 30 · last order 14 Aug 2026",
    amount: "KSh 284,500",
  },
  {
    name: "Bidii Suppliers",
    detail: "General wholesale · Net 14 · last order 16 Aug 2026",
    amount: "KSh 146,000",
  },
  {
    name: "Pwani Oil",
    detail: "Cooking oils · Net 30 · last order 9 Aug 2026",
    amount: "KSh 98,400",
  },
  {
    name: "Brookside Dairy",
    detail: "Chilled · Dairy · Net 7 · last order 15 Aug 2026",
    amount: "KSh 52,180",
  },
  {
    name: "Afya Distributors",
    detail: "Medical supplies · Net 14 · last order 11 Aug 2026",
    amount: "KSh 36,900",
  },
  {
    name: "Bamburi Cement",
    detail: "Hardware · Building materials · Net 30 · last order 2 Aug 2026",
    amount: "KSh 0",
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

export default function SuppliersScreen() {
  const router = useRouter();
  const [tab, setTab] = useState("All");
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
      key: "reports",
      label: "Reports",
      icon: (c) => <Boxes size={18} color={c} />,
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

  const filtered = SUPPLIERS.filter((s) => {
    if (tab === "All") return true;
    if (tab === "Owing") return s.amount !== "KSh 0";
    return s.amount === "KSh 0";
  });

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
          className="flex-row items-start justify-between px-4"
          style={{ marginTop: SPACE_5, marginBottom: SPACE_4 }}
        >
          <View className="flex-1 mr-3">
            <Text
              className="text-[26px]"
              style={{ color: TEXT_PRIMARY, fontFamily: FONT_BOLD }}
            >
              Suppliers
            </Text>
            <Text
              className="text-[13px] mt-1"
              style={{ color: TEXT_SECONDARY, fontFamily: FONT_REG }}
            >
              Nairobi Branch · 5 accounts with a balance
            </Text>
          </View>
        </View>

        <View className="px-4">
          <GhostPillButton
            label="Payables report"
            icon={<Download size={14} color={TEXT_SECONDARY} />}
            onPress={() => {}}
          />
          <View style={{ marginTop: SPACE_4 }}>
            <StatCard
              title="Total Owed"
              badgeLabel="5 to pay"
              badgeTone="warning"
              value="KSh 617,980"
              helper="Outstanding across all supplier accounts"
            />
            <StatCard
              title="Active Suppliers"
              badgeLabel="3 settled"
              badgeTone="positive"
              value="8"
              helper="Suppliers ordered from in the last 90 days"
            />
          </View>
          <PillTabs
            options={["All", "Owing", "Settled"]}
            value={tab}
            onChange={setTab}
          />
          {filtered.map((s) => (
            <InfoRow
              key={s.name}
              initials={s.name
                .split(" ")
                .map((w) => w[0])
                .slice(0, 2)
                .join("")}
              title={s.name}
              subtitle={s.detail}
              trailingLabel={s.amount === "KSh 0" ? "Settled" : s.amount}
              trailingTone={s.amount === "KSh 0" ? "positive" : "warning"}
              onPress={() => {}}
            />
          ))}
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
