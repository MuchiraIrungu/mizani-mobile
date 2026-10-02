import { Plus } from "lucide-react-native";
import { useCallback, useMemo, useState } from "react";
import { ScrollView, StatusBar, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getInvoices, getNotifications } from "@/services/dashboardDataService";
import { useAuthStore } from "@/store/authStore";
import type { NotificationResponse } from "@/types/dashboard";
import type { InvoiceResponse } from "@/types/sales";
import {
  fmtRange,
  getRange,
  ksh,
  RANGE_OPTIONS,
  toNotificationItem,
} from "@/utils/dashboardStats";
import { toInvoiceView, type InvoiceView } from "@/utils/invoiceStats";
import { useFocusEffect, useRouter } from "expo-router";
import {
  AppHeader,
  BottomNav,
  ErrorBanner,
  FilterChips,
  GRADIENT_FOREST,
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
  type NotificationItem,
  type SearchItem,
} from "../../components/dashboard/dashboardUI";

const STATUS_FILTERS = ["All", "Pending", "Overdue", "Paid"];

const sumOf = (vs: InvoiceView[]) => vs.reduce((s, v) => s + v.amount, 0);

export default function SalesScreen() {
  const user = useAuthStore((s) => s.user);
  const [invoices, setInvoices] = useState<InvoiceResponse[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [now, setNow] = useState(() => new Date());
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState("This Month");
  const [topTab, setTopTab] = useState("Invoices");
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchVisible, setSearchVisible] = useState(false);

  const router = useRouter();

  const load = useCallback(async () => {
    try {
      setError(null);
      const [inv, notes] = await Promise.all([
        getInvoices(),
        getNotifications().catch((): NotificationResponse[] => []),
      ]);
      setInvoices(inv);
      setNotifications(notes.filter((n) => !n.readAt).map(toNotificationItem));
      setNow(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load invoices");
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const range = useMemo(() => getRange(dateRange, now), [dateRange, now]);

  const views = useMemo(
    () =>
      invoices
        .filter((i) => i.status !== "VOID")
        .map((i) => toInvoiceView(i, now))
        .filter((v) => {
          const t = new Date(v.createdAt).getTime();
          return t >= range.start.getTime() && t <= range.end.getTime();
        }),
    [invoices, now, range],
  );

  const pending = views.filter((v) => v.status === "pending");
  const overdue = views.filter((v) => v.status === "overdue");
  const paid = views.filter((v) => v.status === "paid");
  const outstandingTotal = sumOf(pending) + sumOf(overdue);
  const oldest = overdue.reduce<InvoiceView | null>(
    (o, v) => (!o || v.daysOverdue > o.daysOverdue ? v : o),
    null,
  );

  const filtered = views.filter(
    (v) => statusFilter === "All" || v.status === statusFilter.toLowerCase(),
  );

  const customers = useMemo(() => {
    const map = new Map<
      string,
      { name: string; count: number; owed: number }
    >();
    for (const v of views) {
      if (v.status === "paid") continue;
      const c = map.get(v.row.customer) ?? {
        name: v.row.customer,
        count: 0,
        owed: 0,
      };
      c.count += 1;
      c.owed += v.amount;
      map.set(v.row.customer, c);
    }
    return [...map.values()].sort((a, b) => b.owed - a.owed);
  }, [views]);

  const searchData: SearchItem[] = useMemo(
    () =>
      views.map((v) => ({
        id: v.row.id,
        title: `${v.row.reference} — ${v.row.customer}`,
        subtitle: `${v.row.amount} · ${v.row.statusLabel}`,
      })),
    [views],
  );

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
          initials={
            `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}` || "??"
          }
          name={`${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim()}
          role={user?.roleName ?? ""}
          notifications={notifications}
        />

        <PillRow>
          <SelectorPill
            label={dateRange}
            options={RANGE_OPTIONS}
            onSelect={setDateRange}
          />
          <SearchTrigger onPress={() => setSearchVisible(true)} />
        </PillRow>

        <PageTitle
          title="Sales"
          subtitle={`${fmtRange(range)} · ${views.length} invoices`}
        />
        {!!error && <ErrorBanner message={error} />}

        <View className="px-4">
          <GradientStatCard
            title="Total Outstanding"
            badgeLabel={`${pending.length + overdue.length} invoices`}
            value={`KSh ${ksh(outstandingTotal)}`}
            helper={`Across ${pending.length} pending and ${overdue.length} overdue invoices`}
            footerStats={[
              { label: "PENDING", value: ksh(sumOf(pending)) },
              { label: "OVERDUE", value: ksh(sumOf(overdue)) },
              { label: "PAID", value: ksh(sumOf(paid)) },
            ]}
            colors={GRADIENT_FOREST}
          />

          <StatCard
            title="Overdue"
            tone="danger"
            badgeLabel={`${
              outstandingTotal
                ? Math.round((sumOf(overdue) / outstandingTotal) * 100)
                : 0
            }% of outstanding`}
            value={`KSh ${ksh(sumOf(overdue))}`}
            helper={
              oldest
                ? `Oldest unpaid invoice is ${oldest.daysOverdue} days past its due date`
                : "No overdue invoices"
            }
            footerStats={[
              { label: "INVOICES", value: String(overdue.length) },
              {
                label: "OLDEST",
                value: oldest ? `${oldest.daysOverdue} days` : "—",
              },
              { label: "AT RISK", value: oldest ? ksh(oldest.amount) : "0" },
            ]}
          />

          <View style={{ marginBottom: SPACE_4 }}>
            <PrimaryButton
              label="New Invoice"
              icon={<Plus size={16} color="#FFFFFF" />}
              onPress={() => router.push("/(dashboard)/new-invoice")}
              colors={GRADIENT_FOREST}
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
                subtitle={`${filtered.length} shown`}
              />
              <FilterChips
                options={STATUS_FILTERS}
                value={statusFilter}
                onChange={setStatusFilter}
              />
              {filtered.map((v) => (
                <InvoiceRow
                  key={v.row.id}
                  invoice={v.row}
                  onPress={() => showToast(`${v.row.reference} · detail soon`)}
                />
              ))}
            </>
          ) : (
            <>
              <SectionHeading
                title="Customers"
                subtitle={`${customers.length} accounts with a balance`}
              />
              {customers.map((c) => (
                <InvoiceRow
                  key={c.name}
                  invoice={{
                    id: c.name,
                    customer: c.name,
                    reference: `${c.count} open invoice${c.count > 1 ? "s" : ""}`,
                    dueDate: "",
                    statusLabel: "Balance outstanding",
                    amount: `KSh ${ksh(c.owed)}`,
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
        data={searchData}
        placeholder="Search invoices, customers…"
        onSelect={(item) => showToast(item.title)}
      />

      <ToastHost />
    </SafeAreaView>
  );
}
