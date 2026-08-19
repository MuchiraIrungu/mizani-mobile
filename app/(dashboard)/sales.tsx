import { useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import { useState } from "react";
import { ScrollView, StatusBar, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
    BottomNav,
    BrandMark,
    FilterChips,
    InvoiceRow,
    NotificationBell,
    PillRow,
    PillTabs,
    PrimaryButton,
    SearchModal,
    SearchTrigger,
    SelectorPill,
    showToast,
    SPACE_2,
    SPACE_4,
    SPACE_5,
    StatCard,
    SURFACE,
    TEXT_PRIMARY,
    TEXT_SECONDARY,
    //ToastHost,
    UserMenu,
    type Invoice,
    type NotificationItem,
    type SearchItem,
} from "../../components/dashboard/dashboardUI";

const FONT_REG = "Lexend_400Regular";
const FONT_SEMI = "Lexend_600SemiBold";
const FONT_BOLD = "Lexend_700Bold";

const INVOICES: Invoice[] = [
  {
    id: "1",
    customer: "Sokoni Retail Group",
    reference: "INV-2043",
    dueDate: "30 Aug 2026",
    statusLabel: "Due in 14 days",
    amount: "KSh 121,034",
    status: "pending",
  },
  {
    id: "2",
    customer: "Karibu Foods Ltd",
    reference: "INV-2042",
    dueDate: "28 Aug 2026",
    statusLabel: "Due in 12 days",
    amount: "KSh 151,728",
    status: "pending",
  },
  {
    id: "3",
    customer: "Jenga Hardware",
    reference: "INV-2038",
    dueDate: "5 Aug 2026",
    statusLabel: "11 days overdue",
    amount: "KSh 131,776",
    status: "overdue",
  },
  {
    id: "4",
    customer: "Afya Pharma Chemist",
    reference: "INV-2035",
    dueDate: "1 Aug 2026",
    statusLabel: "15 days overdue",
    amount: "KSh 74,124",
    status: "overdue",
  },
  {
    id: "5",
    customer: "Rift Logistics",
    reference: "INV-2031",
    dueDate: "24 Jul 2026",
    statusLabel: "Settled 21 Jul 2026",
    amount: "KSh 180,090",
    status: "paid",
  },
  {
    id: "6",
    customer: "Tuskys Fresh — Ngong Road",
    reference: "INV-2028",
    dueDate: "18 Jul 2026",
    statusLabel: "Settled 17 Jul 2026",
    amount: "KSh 125,900",
    status: "paid",
  },
];

const STATUS_FILTERS = ["All", "Pending", "Overdue", "Paid"];

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
  { id: "inv1", title: "INV-2043 - Sokoni Retail", subtitle: "KSh 121,034" },
  { id: "inv2", title: "INV-2042 - Karibu Foods", subtitle: "KSh 151,728" },
  { id: "inv3", title: "INV-2038 - Jenga Hardware", subtitle: "KSh 131,776" },
  { id: "cust1", title: "Sokoni Retail Group", subtitle: "Customer" },
  { id: "cust2", title: "Karibu Foods Ltd", subtitle: "Customer" },
];

export default function SalesInventoryScreen() {
  const router = useRouter();
  const [topTab, setTopTab] = useState("Invoices");
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchVisible, setSearchVisible] = useState(false);
  const [branch, setBranch] = useState("Nairobi Branch");
  const [dateRange, setDateRange] = useState("1 – 31 Aug 2026");
  const [notifications] = useState(MOCK_NOTIFICATIONS);

  const filteredInvoices = INVOICES.filter((inv) => {
    if (statusFilter === "All") return true;
    return inv.status === statusFilter.toLowerCase();
  });

  const totalOutstanding = INVOICES.filter((i) => i.status !== "paid");

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: SURFACE }}>
      <StatusBar barStyle="dark-content" backgroundColor={SURFACE} />

      <ScrollView
        className="flex-1"
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
              notifications={notifications}
              onViewAll={() => router.push("/(dashboard)/main" as any)}
            />
            <UserMenu
              initials="WM"
              onAccount={() => {}}
              onSettings={() => router.push("/(dashboard)/settings" as any)}
              onLogout={() => router.replace("/login" as any)}
            />
          </View>
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

        <View
          className="flex-row items-start justify-between px-4"
          style={{ marginTop: SPACE_5, marginBottom: SPACE_4 }}
        >
          <View className="flex-1 mr-3">
            <Text
              className="text-[26px]"
              style={{ color: TEXT_PRIMARY, fontFamily: FONT_BOLD }}
            >
              Invoices
            </Text>
            <Text
              className="text-[13px] mt-1"
              style={{ color: TEXT_SECONDARY, fontFamily: FONT_REG }}
            >
              {branch} · {dateRange} · {INVOICES.length} invoices
            </Text>
          </View>
        </View>

        <View className="px-4">
          <PrimaryButton
            label="New Invoice"
            icon={<Plus size={16} color="#FFFFFF" />}
            onPress={() => showToast("Invoice creation coming soon")}
          />

          <View style={{ marginTop: SPACE_5 }}>
            <PillTabs
              options={["Invoices", "Customers"]}
              value={topTab}
              onChange={setTopTab}
            />
          </View>

          <StatCard
            title="Total Outstanding"
            badgeLabel={`${totalOutstanding.length} invoices`}
            value="KSh 478,662"
            helper="Across 2 pending and 2 overdue invoices"
          />

          <StatCard
            title="Overdue"
            badgeLabel="43% of outstanding"
            badgeTone="danger"
            tone="danger"
            value="KSh 205,900"
            helper="Oldest unpaid invoice is 15 days past its due date"
          />

          <View style={{ marginTop: SPACE_2, marginBottom: SPACE_4 }}>
            <Text
              className="text-[18px]"
              style={{ color: TEXT_PRIMARY, fontFamily: FONT_SEMI }}
            >
              All invoices
            </Text>
            <Text
              className="text-[12px] mt-1"
              style={{ color: TEXT_SECONDARY, fontFamily: FONT_REG }}
            >
              {filteredInvoices.length} shown
            </Text>
          </View>

          <FilterChips
            options={STATUS_FILTERS}
            value={statusFilter}
            onChange={setStatusFilter}
          />

          {filteredInvoices.map((inv) => (
            <InvoiceRow
              key={inv.id}
              invoice={inv}
              onPress={() => showToast("Invoice detail view coming soon")}
            />
          ))}
        </View>
      </ScrollView>

      <BottomNav active="sales" />

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
