import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StatusBar, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  AlertBanner,
  AppHeader,
  BottomNav,
  FilterChips,
  GradientStatCard,
  GRADIENT_FOREST,
  GreetingBanner,
  NAV_CLEARANCE,
  PageTitle,
  PillRow,
  SearchModal,
  SearchTrigger,
  SectionHeading,
  SelectorPill,
  showToast,
  SPACE_3,
  SPACE_4,
  StatCard,
  SURFACE,
  ToastHost,
  TransactionRow,
  type NotificationItem,
  type SearchItem,
  type Transaction,
} from "../../components/dashboard/dashboardUI";

/* Dashboard — greeting, KRA alert, revenue/cost/liability headline cards and
   the most recent transactions. */

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
    amount: "KSh 46,000",
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

const NOTIFICATIONS: NotificationItem[] = [
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
  { id: "tx1", title: "INV-2043 — Sokoni Retail", subtitle: "KSh 121,034" },
  { id: "tx2", title: "INV-2042 — Karibu Foods", subtitle: "KSh 151,728" },
  { id: "tx3", title: "INV-2038 — Jenga Hardware", subtitle: "KSh 131,776" },
  { id: "cust1", title: "Sokoni Retail Group", subtitle: "Customer" },
  { id: "cust2", title: "Karibu Foods Ltd", subtitle: "Customer" },
];

export default function DashboardScreen() {
  const router = useRouter();
  const [sourceFilter, setSourceFilter] = useState("All sources");
  const [branch, setBranch] = useState("Nairobi Branch");
  const [dateRange, setDateRange] = useState("1 – 31 Aug 2026");
  const [searchVisible, setSearchVisible] = useState(false);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: SURFACE }}>
      <StatusBar barStyle="dark-content" backgroundColor={SURFACE} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingTop: SPACE_3,
          paddingBottom: NAV_CLEARANCE,
        }}
        showsVerticalScrollIndicator={false}
      >
        <AppHeader
          initials="WM"
          name="Wanjiku Mwangi"
          role="Owner · Mizani Trading Co."
          notifications={NOTIFICATIONS}
        />

        <View className="px-4" style={{ marginTop: SPACE_4 }}>
          <GreetingBanner
            name="Wanjiku"
            subtitle="Here is how the business is doing today."
            colors={GRADIENT_FOREST}
          />
        </View>

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

        <PageTitle
          title="Dashboard"
          subtitle={`${branch} · ${dateRange} · Last synced 14:26 EAT`}
        />

        <View className="px-4">
          <AlertBanner
            tone="danger"
            title="KRA Filing Deadline Approaching"
            description="Your August VAT return (VAT-3) is due on 20 Sep 2026 — 14 invoices worth KSh 184,300 are still unsigned on eTIMS."
            actionLabel="Review filing"
            onAction={() => router.replace("/(dashboard)/kra")}
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
            rows={[
              { label: "VAT (16%)", value: "KSh 218,940" },
              { label: "PAYE", value: "KSh 74,532" },
              { label: "Turnover tax", value: "KSh 25,000" },
            ]}
            actionLabel="Auto-Export"
            onAction={() => showToast("Preparing export…")}
            colors={GRADIENT_FOREST}
          />

          <SectionHeading
            title="Recent Transactions"
            subtitle="9 of 214 entries this period"
            actionLabel="View all"
            onAction={() => router.replace("/(dashboard)/sales")}
          />

          <FilterChips
            options={SOURCE_FILTERS}
            value={sourceFilter}
            onChange={setSourceFilter}
          />

          {TRANSACTIONS.map((tx) => (
            <TransactionRow
              key={tx.id}
              tx={tx}
              onPress={() => showToast(`${tx.reference} · detail view soon`)}
            />
          ))}
        </View>
      </ScrollView>

      <BottomNav />

      <SearchModal
        visible={searchVisible}
        onClose={() => setSearchVisible(false)}
        data={SEARCH_DATA}
        placeholder="Search invoices, customers…"
        onSelect={(item) => showToast(item.title)}
      />

      <ToastHost />
    </SafeAreaView>
  );
}
