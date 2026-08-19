import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StatusBar, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
    AlertBanner,
    BottomNav,
    BrandMark,
    FilterChips,
    GRADIENT_PRIMARY,
    GradientStatCard,
    GREEN,
    GreetingBanner,
    NotificationBell,
    PillRow,
    SearchModal,
    SearchTrigger,
    SelectorPill,
    showToast,
    SPACE_4,
    SPACE_5,
    StatCard,
    SURFACE,
    TEXT_PRIMARY,
    TEXT_SECONDARY,
    //ToastHost,
    TransactionRow,
    UserMenu,
    type NotificationItem,
    type SearchItem,
    type Transaction,
} from "../../components/dashboard/dashboardUI";

const FONT_REG = "Lexend_400Regular";
const FONT_SEMI = "Lexend_600SemiBold";
const FONT_BOLD = "Lexend_700Bold";

const TRANSACTIONS: Transaction[] = [
  {
    id: "1",
    date: "16 Aug 2026",
    time: "14:22",
    details: "Counter sale — Till 5482",
    reference: "INV-2043",
    category: "Sales",
    source: "M-Pesa",
    sourceTone: "positive",
    status: "Compliant",
    statusTone: "positive",
    amount: "KSh 18,900",
  },
  {
    id: "2",
    date: "16 Aug 2026",
    time: "12:05",
    details: "Bidii Suppliers — stock order",
    reference: "PO-0881",
    category: "Purchases",
    source: "Bank",
    sourceTone: "neutral",
    status: "Compliant",
    statusTone: "positive",
    amount: "46,000",
    isNegative: true,
  },
  {
    id: "3",
    date: "16 Aug 2026",
    time: "10:41",
    details: "Counter sale — walk-in",
    reference: "INV-2042",
    category: "Sales",
    source: "Cash",
    sourceTone: "warning",
    status: "Pending",
    statusTone: "warning",
    amount: "KSh 7,250",
  },
];

const SOURCE_FILTERS = ["All sources", "M-Pesa", "Bank", "Cash"];

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    title: "New invoice #INV-2044 created",
    time: "2 min ago",
    tone: "positive",
  },
  {
    id: "2",
    title: "KRA filing deadline in 5 days",
    time: "1 hour ago",
    tone: "warning",
  },
  {
    id: "3",
    title: "Payment received from Sokoni Retail",
    time: "3 hours ago",
    tone: "positive",
  },
];

const SEARCH_DATA: SearchItem[] = [
  { id: "tx1", title: "INV-2043 - Sokoni Retail", subtitle: "KSh 121,034" },
  { id: "tx2", title: "INV-2042 - Karibu Foods", subtitle: "KSh 151,728" },
  { id: "tx3", title: "INV-2038 - Jenga Hardware", subtitle: "KSh 131,776" },
  { id: "cust1", title: "Sokoni Retail Group", subtitle: "Customer" },
  { id: "cust2", title: "Karibu Foods Ltd", subtitle: "Customer" },
];

export default function DashboardScreen() {
  const router = useRouter();
  const [sourceFilter, setSourceFilter] = useState("All sources");
  const [branch, setBranch] = useState("Nairobi Branch");
  const [dateRange, setDateRange] = useState("1 – 31 Aug 2026");
  const [searchVisible, setSearchVisible] = useState(false);
  const [notifications] = useState(MOCK_NOTIFICATIONS);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: SURFACE }}>
      <StatusBar barStyle="dark-content" backgroundColor={SURFACE} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingTop: SPACE_4, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Top bar: brand, notifications, account (Settings lives inside the avatar menu — no separate gear icon) */}
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
              notifications={notifications}
              onViewAll={() => router.push("/(dashboard)/notifications" as any)}
            />
            <UserMenu
              initials="WM"
              onAccount={() => {}}
              onSettings={() => router.push("/(dashboard)/settings" as any)}
              onLogout={() => router.replace("/login" as any)}
            />
          </View>
        </View>

        {/* Greeting — gradient banner combining the welcome message with a time-of-day icon */}
        <View className="px-4" style={{ marginTop: SPACE_4 }}>
          <GreetingBanner name="Wanjiku" colors={GRADIENT_PRIMARY} />
        </View>

        {/* Branch / date / search row */}
        <PillRow>
          <SelectorPill
            label={branch}
            options={[
              "Nairobi Branch",
              "Mombasa Branch",
              "Kisumu Branch",
              "All Branches",
            ]}
            onSelect={setBranch}
          />
          <SelectorPill
            label={dateRange}
            options={["Today", "This Week", "1 – 31 Aug 2026", "Custom range"]}
            onSelect={setDateRange}
          />
          <SearchTrigger onPress={() => setSearchVisible(true)} />
        </PillRow>

        {/* Page title */}
        <View
          className="px-4"
          style={{ marginTop: SPACE_5, marginBottom: SPACE_4 }}
        >
          <Text
            className="text-[26px]"
            style={{ color: TEXT_PRIMARY, fontFamily: FONT_BOLD }}
          >
            Dashboard
          </Text>
          <Text
            className="text-[13px] mt-1"
            style={{ color: TEXT_SECONDARY, fontFamily: FONT_REG }}
          >
            {branch} · {dateRange} · Last synced 14:26 EAT
          </Text>
        </View>

        <View className="px-4">
          <AlertBanner
            title="KRA Filing Deadline Approaching"
            description="Your August VAT return (VAT-3) is due on 20 Sep 2026 — 14 invoices worth KSh 184,300 are still unsigned on eTIMS."
            actionLabel="Review"
            onAction={() => router.push("/(dashboard)/kra" as any)}
          />

          <StatCard
            title="Total Revenue"
            badgeLabel="+12.5%"
            badgeTone="positive"
            value="KSh 2,486,900"
            helper="KSh 276,400 above the same period last month"
            footerStats={[
              { label: "M-PESA", value: "1,642,300" },
              { label: "BANK", value: "618,200" },
              { label: "CASH", value: "226,400" },
            ]}
          />

          <StatCard
            title="Operating Costs"
            badgeLabel="78% of budget"
            badgeTone="warning"
            value="KSh 1,394,150"
            helper="Budget for August: KSh 1,780,000"
            progressPercent={78}
            footerStats={[
              { label: "STOCK", value: "812,000" },
              { label: "PAYROLL", value: "402,150" },
              { label: "OTHER", value: "180,000" },
            ]}
          />

          <GradientStatCard
            title="Estimated KRA Liability"
            badgeLabel="Due 20 Sep"
            value="KSh 318,472"
            helper="VAT 218,940 · PAYE 74,532 · Turnover tax 25,000"
            actionLabel="Auto-Export"
            onAction={() => showToast("Preparing export…")}
            colors={GRADIENT_PRIMARY}
          />

          <View style={{ marginTop: SPACE_4 }}>
            <View className="flex-row items-start justify-between mb-1">
              <View>
                <Text
                  className="text-[18px]"
                  style={{ color: TEXT_PRIMARY, fontFamily: FONT_SEMI }}
                >
                  Recent Transactions
                </Text>
                <Text
                  className="text-[12px] mt-1"
                  style={{ color: TEXT_SECONDARY, fontFamily: FONT_REG }}
                >
                  9 of 214 entries this period
                </Text>
              </View>
              <Text
                className="text-[12px] mt-1"
                style={{ color: GREEN, fontFamily: FONT_SEMI }}
                onPress={() => router.push("/(dashboard)/sales" as any)}
              >
                View all
              </Text>
            </View>
          </View>

          <FilterChips
            options={SOURCE_FILTERS}
            value={sourceFilter}
            onChange={setSourceFilter}
          />

          {TRANSACTIONS.map((tx) => (
            <TransactionRow key={tx.id} tx={tx} />
          ))}
        </View>
      </ScrollView>

      <BottomNav active="dashboard" />

      <SearchModal
        visible={searchVisible}
        onClose={() => setSearchVisible(false)}
        data={SEARCH_DATA}
        onSelect={() => {}}
      />

      <ToastHost />
    </SafeAreaView>
  );
}
