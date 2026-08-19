import { useRouter } from "expo-router";
import {
    BarChart3,
    Download,
    LayoutGrid,
    MoreHorizontal,
    Package,
    RefreshCw,
    Settings as SettingsIcon,
    Truck,
    Users,
} from "lucide-react-native";
import { useState } from "react";
import { ScrollView, StatusBar, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
    AlertBanner,
    BottomNav,
    BrandMark,
    GhostPillButton,
    MoreSheet,
    NotificationBell,
    PillTabs,
    PrimaryButton,
    SettingsMenu,
    SPACE_4,
    SPACE_5,
    StatusPill,
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

const LIABILITY_ROWS = [
  {
    label: "VAT (16%)",
    detail: "Output tax less input tax on purchases",
    value: "KSh 218,940",
  },
  {
    label: "Turnover Tax",
    detail: "3% on non-VAT branch turnover",
    value: "KSh 25,000",
  },
];

const ETIMS_INVOICES = [
  {
    ref: "INV-2043",
    date: "16 Aug 2026",
    customer: "Sokoni Retail Group",
    amount: "KSh 96,048",
    status: "syncing" as const,
  },
  {
    ref: "INV-2044",
    date: "15 Aug 2026",
    customer: "Mama Njeri Grocers",
    amount: "KSh 18,560",
    status: "syncing" as const,
  },
];

const NAV_ITEMS: {
  key: NavKey;
  label: string;
  icon: (c: string) => React.ReactNode;
  badge?: number;
}[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: (c) => <LayoutGrid size={20} color={c} />,
  },
  {
    key: "sales",
    label: "Sales",
    icon: (c) => <BarChart3 size={20} color={c} />,
  },
  {
    key: "kra",
    label: "KRA",
    icon: (c) => <BarChart3 size={20} color={c} />,
    badge: 2,
  },
  {
    key: "more",
    label: "More",
    icon: (c) => <MoreHorizontal size={20} color={c} />,
  },
];

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    title: "KRA filing deadline in 5 days",
    time: "1 hour ago",
    tone: "warning",
  },
];

export default function KRAScreen() {
  const router = useRouter();
  const [tab, setTab] = useState("All");
  const [moreVisible, setMoreVisible] = useState(false);

  const moreRoutes: MoreRoute[] = [
    {
      key: "inventory",
      label: "Inventory",
      icon: (c) => <Package size={18} color={c} />,
      onPress: () => router.push("/(dashboard)/inventory" as any),
    },
    {
      key: "payroll",
      label: "Payroll",
      icon: (c) => <Users size={18} color={c} />,
      onPress: () => router.push("/(dashboard)/payroll" as any),
    },
    {
      key: "suppliers",
      label: "Suppliers",
      icon: (c) => <Truck size={18} color={c} />,
      onPress: () => router.push("/(dashboard)/suppliers" as any),
    },
    {
      key: "reports",
      label: "Reports",
      icon: (c) => <SettingsIcon size={18} color={c} />,
      onPress: () => router.push("/(dashboard)/reports" as any),
    },
    {
      key: "settings",
      label: "Settings",
      icon: (c) => <SettingsIcon size={18} color={c} />,
      onPress: () => router.push("/(dashboard)/settings" as any),
    },
  ];

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
              onViewAll={() => router.push("/(dashboard)/notifications" as any)}
            />
            <SettingsMenu
              onSettings={() => router.push("/(dashboard)/settings" as any)}
              onHelp={() => {}}
            />
            <UserMenu
              initials="WM"
              onLogout={() => router.replace("/login" as any)}
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
              KRA
            </Text>
            <Text
              className="text-[13px] mt-1"
              style={{ color: TEXT_SECONDARY, fontFamily: FONT_REG }}
            >
              August 2026 · VAT-3 return · Nairobi Branch
            </Text>
          </View>
        </View>

        <View className="px-4">
          <GhostPillButton
            label="Re-sync eTIMS"
            icon={<RefreshCw size={14} color={TEXT_SECONDARY} />}
            onPress={() => {}}
          />

          <View style={{ marginTop: SPACE_4 }}>
            <AlertBanner
              title="VAT Filing Due"
              description="Your VAT-3 return for August 2026 must be filed by 20 Sep 2026 — 35 days remaining."
              actionLabel="File now"
              onAction={() => {}}
            />
          </View>

          <View
            className="rounded-[12px] p-5 mb-5"
            style={{
              backgroundColor: "#FFFFFF",
              shadowColor: "#0F172A",
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.14,
              shadowRadius: 7,
              elevation: 4,
            }}
          >
            <Text
              className="text-[16px] mb-1"
              style={{ color: TEXT_PRIMARY, fontFamily: FONT_SEMI }}
            >
              Estimated Liability
            </Text>
            <Text
              className="text-[12px] mb-4"
              style={{ color: TEXT_SECONDARY, fontFamily: FONT_REG }}
            >
              Computed from signed eTIMS invoices for August 2026 · Due 20 Sep
              2026
            </Text>
            {LIABILITY_ROWS.map((row, i) => (
              <View
                key={row.label}
                className="flex-row items-center justify-between py-3"
                style={{
                  borderTopWidth: i === 0 ? 0 : 1,
                  borderTopColor: "#D9DEDB",
                }}
              >
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
                    {row.detail}
                  </Text>
                </View>
                <Text
                  className="text-[14px]"
                  style={{ color: TEXT_PRIMARY, fontFamily: FONT_SEMI }}
                >
                  {row.value}
                </Text>
              </View>
            ))}
            <View
              className="flex-row items-center justify-between pt-3"
              style={{ borderTopWidth: 1, borderTopColor: "#D9DEDB" }}
            >
              <Text
                className="text-[15px]"
                style={{ color: TEXT_PRIMARY, fontFamily: FONT_SEMI }}
              >
                Total Due
              </Text>
              <Text
                className="text-[20px]"
                style={{ color: "#0A5C36", fontFamily: FONT_BOLD }}
              >
                KSh 243,940
              </Text>
            </View>
            <Text
              className="text-[12px] mt-3 mb-4"
              style={{ color: TEXT_SECONDARY, fontFamily: FONT_REG }}
            >
              PAYE of KSh 74,532 is filed separately with the payroll return.
            </Text>
            <PrimaryButton
              label="Export Filing Report"
              icon={<Download size={16} color="#FFFFFF" />}
              onPress={() => {}}
            />
          </View>

          <View className="flex-row items-start justify-between mb-4">
            <View>
              <Text
                className="text-[16px]"
                style={{ color: TEXT_PRIMARY, fontFamily: FONT_SEMI }}
              >
                eTIMS Compliance
              </Text>
              <Text
                className="text-[12px] mt-1"
                style={{ color: TEXT_SECONDARY, fontFamily: FONT_REG }}
              >
                7 invoices in this period · 2 still syncing
              </Text>
            </View>
          </View>

          <PillTabs
            options={["All", "Validated", "Syncing"]}
            value={tab}
            onChange={setTab}
          />

          {ETIMS_INVOICES.map((inv) => (
            <View
              key={inv.ref}
              className="flex-row items-center justify-between rounded-[12px] p-4 mb-3"
              style={{
                backgroundColor: "#FFFFFF",
                shadowColor: "#0F172A",
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.14,
                shadowRadius: 7,
                elevation: 4,
              }}
            >
              <View className="flex-1 mr-2">
                <Text
                  className="text-[14px] mb-1"
                  style={{ color: TEXT_PRIMARY, fontFamily: FONT_SEMI }}
                >
                  {inv.ref}
                </Text>
                <Text
                  className="text-[12px]"
                  style={{ color: TEXT_SECONDARY, fontFamily: FONT_REG }}
                >
                  {inv.date} · KSh {inv.amount.replace("KSh ", "")} ·{" "}
                  {inv.customer}
                </Text>
              </View>
              <StatusPill label="Awaiting control no." tone="warning" />
            </View>
          ))}
        </View>
      </ScrollView>

      <BottomNav
        active="kra"
        onChange={(k) =>
          k === "more"
            ? setMoreVisible(true)
            : router.push(
                `/(dashboard)/${k === "dashboard" ? "main" : k}` as any,
              )
        }
        navItems={NAV_ITEMS}
        onAdd={() => router.push("/(dashboard)/add-transaction" as any)}
      />
      <MoreSheet
        visible={moreVisible}
        onClose={() => setMoreVisible(false)}
        routes={moreRoutes}
      />
    </SafeAreaView>
  );
}
