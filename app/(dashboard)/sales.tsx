import { Plus } from "lucide-react-native";
import { useState } from "react";
import { ScrollView, StatusBar, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  AppHeader,
  BottomNav,
  FilterChips,
  GRADIENT_OCEAN,
  GradientStatCard,
  InvoiceRow,
  NAV_CLEARANCE,
  PageTitle,
  PillRow,
  PillTabs,
  PrimaryButton,
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
  type Invoice,
  type NotificationItem,
  type SearchItem,
} from "../../components/dashboard/dashboardUI";

/* Sales — invoice book with outstanding/overdue headline figures, status
   filters and the full invoice list. */

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

const CUSTOMERS = [
  { name: "Sokoni Retail Group", detail: "12 invoices · Net 30", owed: "KSh 121,034" },
  { name: "Karibu Foods Ltd", detail: "8 invoices · Net 30", owed: "KSh 151,728" },
  { name: "Jenga Hardware", detail: "5 invoices · Net 14", owed: "KSh 131,776" },
];

const STATUS_FILTERS = ["All", "Pending", "Overdue", "Paid"];

const NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    title: "New invoice #INV-2044 created",
    time: "2 min ago",
    tone: "positive",
  },
  {
    id: "2",
    title: "INV-2035 is now 15 days overdue",
    time: "1 hour ago",
    tone: "danger",
  },
];

const SEARCH_DATA: SearchItem[] = INVOICES.map((i) => ({
  id: i.id,
  title: `${i.reference} — ${i.customer}`,
  subtitle: `${i.amount} · ${i.statusLabel}`,
}));

export default function SalesScreen() {
  const [topTab, setTopTab] = useState("Invoices");
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchVisible, setSearchVisible] = useState(false);
  const [branch, setBranch] = useState("Nairobi Branch");
  const [dateRange, setDateRange] = useState("1 – 31 Aug 2026");

  const filteredInvoices = INVOICES.filter((inv) =>
    statusFilter === "All" ? true : inv.status === statusFilter.toLowerCase(),
  );
  const outstanding = INVOICES.filter((i) => i.status !== "paid");

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
          title="Sales"
          subtitle={`${branch} · ${dateRange} · ${INVOICES.length} invoices`}
        />

        <View className="px-4">
          <GradientStatCard
            title="Total Outstanding"
            badgeLabel={`${outstanding.length} invoices`}
            value="KSh 478,662"
            helper="Across 2 pending and 2 overdue invoices"
            footerStats={[
              { label: "PENDING", value: "272,762" },
              { label: "OVERDUE", value: "205,900" },
              { label: "PAID (MTD)", value: "305,990" },
            ]}
            colors={GRADIENT_OCEAN}
          />

          <StatCard
            title="Overdue"
            tone="danger"
            badgeLabel="43% of outstanding"
            value="KSh 205,900"
            helper="Oldest unpaid invoice is 15 days past its due date"
            footerStats={[
              { label: "INVOICES", value: "2" },
              { label: "OLDEST", value: "15 days" },
              { label: "AT RISK", value: "74,124" },
            ]}
          />

          <View style={{ marginBottom: SPACE_4 }}>
            <PrimaryButton
              label="New Invoice"
              icon={<Plus size={16} color="#FFFFFF" />}
              onPress={() => showToast("Invoice creation coming soon")}
              colors={GRADIENT_OCEAN}
            />
          </View>

          <PillTabs
            options={["Invoices", "Customers"]}
            value={topTab}
            onChange={setTopTab}
          />

          {topTab === "Invoices" ? (
            <>
              <SectionHeading
                title="All invoices"
                subtitle={`${filteredInvoices.length} shown`}
              />
              <FilterChips
                options={STATUS_FILTERS}
                value={statusFilter}
                onChange={setStatusFilter}
              />
              {filteredInvoices.map((inv) => (
                <InvoiceRow
                  key={inv.id}
                  invoice={inv}
                  onPress={() => showToast(`${inv.reference} · detail soon`)}
                />
              ))}
            </>
          ) : (
            <>
              <SectionHeading
                title="Customers"
                subtitle={`${CUSTOMERS.length} accounts with a balance`}
              />
              {CUSTOMERS.map((c) => (
                <InvoiceRow
                  key={c.name}
                  invoice={{
                    id: c.name,
                    customer: c.name,
                    reference: c.detail,
                    dueDate: "",
                    statusLabel: "Balance outstanding",
                    amount: c.owed,
                    status: "pending",
                  }}
                  onPress={() => showToast(`${c.name} · detail soon`)}
                />
              ))}
            </>
          )}
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
