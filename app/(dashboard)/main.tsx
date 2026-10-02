import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView, StatusBar, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { RevealOnMount } from "@/components/dashboard/RevealOnMount";
import {
  AlertBanner,
  AppHeader,
  BottomNav,
  FilterChips,
  GRADIENT_FOREST,
  GradientStatCard,
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
} from "../../components/dashboard/dashboardUI";
import DashboardSkeleton from "./DashboardSkeleton";

import {
  getNotifications,
  getTransactions,
  getUserInfo,
} from "@/services/dashboardDataService";
import { useAuthStore } from "@/store/authStore";
import { NotificationResponse, TransactionResponse } from "@/types/dashboard";
import type { UserInfo } from "@/types/users";
import { toTransanction } from "@/utils/transaction";
import { toUserInfo } from "@/utils/user";

import { ErrorBanner } from "@/components/auth/AuthUI";
import {
  byType,
  fmtDate,
  fmtRange,
  getRange,
  inRange,
  ksh,
  pctChange,
  previousRange,
  RANGE_OPTIONS,
  sum,
  toNotificationItem,
  unfiledSales,
  vatDeadline,
} from "@/utils/dashboardStats";

/* Dashboard — greeting, KRA alert, revenue/cost/liability headline cards and
   the most recent transactions. */

const SOURCE_FILTERS = ["All sources", "M-Pesa", "Bank", "Cash"];

export default function DashboardScreen() {
  const router = useRouter();
  const userId = useAuthStore((state) => state.user?.id);
  const [isLoading, setIsLoading] = useState(true);
  const [sourceFilter, setSourceFilter] = useState("All sources");
  const [branch, setBranch] = useState("Nairobi Branch");
  const [dateRange, setDateRange] = useState("1 – 31 Aug 2026");
  const [searchVisible, setSearchVisible] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [lastSynced, setLastSynced] = useState("");
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [now, setNow] = useState(() => new Date());

  const [error, setError] = useState<string | null>(null);

  //fetch user data
  useEffect(() => {
    if (!userId) return;

    const fetchUserInfo = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getUserInfo(String(userId));
        setUserInfo(toUserInfo(result));
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch user info",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserInfo();
  }, [userId]);

  //get transaction data
  useEffect(() => {
    if (!userId) return;

    const fetchTransactions = async () => {
      try {
        console.log(userInfo?.businessId);
        const result = await getTransactions();
        console.log(result);
        setTransactions(result);
      } catch (err) {
        console.log("error:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch transactions",
        );
      }
    };
    fetchTransactions();
  }, [userId, userInfo]);

  //
  const load = useCallback(async () => {
    if (!userId) return;
    setError(null);
    try {
      const [user, txs, notes] = await Promise.all([
        getUserInfo(String(userId)),
        getTransactions(),
        getNotifications().catch((): NotificationResponse[] => []),
      ]);
      setUserInfo(toUserInfo(user));
      setTransactions(txs);
      setNotifications(notes.map(toNotificationItem));
      setLastSynced(
        new Date().toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
      setNow(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      setIsLoading(false); // skeleton only on first load
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );
  const range = useMemo(() => getRange(dateRange, now), [dateRange, now]);
  const branchOptions = useMemo(
    () => [
      "All Branches",
      ...new Set(transactions.map((t) => t.branchName).filter(Boolean)),
    ],
    [transactions],
  );

  //const branchMatch = (t: TransactionResponse) =>
  //branch === "All Branches" || t.branchName === branch;

  const scoped = useMemo(
    () =>
      transactions.filter(
        (t) =>
          inRange(t, range) &&
          (branch === "All Branches" || t.branchName === branch),
      ),
    [transactions, range, branch],
  );

  const previous = useMemo(() => {
    const p = previousRange(range);
    return transactions.filter(
      (t) =>
        inRange(t, p) && (branch === "All Branches" || t.branchName === branch),
    );
  }, [transactions, range, branch]);

  const sales = byType(scoped, "SALE");
  const revenue = sum(sales);
  const prevRevenue = sum(byType(previous, "SALE"));
  const revenueChange = pctChange(revenue, prevRevenue);
  //const costs = sum(byType(scoped, "EXPENSE"));
  const unfiled = unfiledSales(scoped);
  const deadline = vatDeadline(range);
  const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / 864e5);
  const expenses = byType(scoped, "EXPENSE");
  const costs = sum(expenses);
  const prevCosts = sum(byType(previous, "EXPENSE"));
  const costChange = pctChange(costs, prevCosts);

  const recent = useMemo(
    () =>
      scoped
        .filter(
          (t) =>
            sourceFilter === "All sources" ||
            t.paymentProviderDisplayName === sourceFilter,
        )
        .sort(
          (a, b) =>
            new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
        )
        .slice(0, 9),
    [scoped, sourceFilter],
  );

  const searchData: SearchItem[] = useMemo(
    () =>
      transactions.map((t) => ({
        id: t.id,
        title: `${t.referenceNumber} — ${t.description ?? t.entryType}`,
        subtitle: `KSh ${ksh(t.amount)}`,
      })),
    [transactions],
  );
  if (isLoading) {
    return <DashboardSkeleton />;
  }

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
        <RevealOnMount delay={0}>
          <AppHeader
            initials={userInfo?.initials ?? "??"}
            name={userInfo?.name}
            role={userInfo?.role}
            notifications={notifications}
          />
        </RevealOnMount>

        <RevealOnMount delay={60}>
          <View className="px-4" style={{ marginTop: SPACE_4 }}>
            <GreetingBanner
              name={userInfo?.firstName ?? "there"}
              subtitle="Here is how the business is doing today."
              colors={GRADIENT_FOREST}
            />
          </View>
        </RevealOnMount>

        <RevealOnMount delay={120}>
          <PillRow>
            <SelectorPill
              label={branch}
              options={branchOptions}
              onSelect={setBranch}
            />
            <SelectorPill
              label={dateRange}
              options={RANGE_OPTIONS}
              onSelect={setDateRange}
            />
            <SearchTrigger onPress={() => setSearchVisible(true)} />
          </PillRow>
        </RevealOnMount>

        <RevealOnMount delay={160}>
          <PageTitle
            title="Dashboard"
            subtitle={`${branch} · ${fmtRange(range)}${lastSynced ? ` · Last synced ${lastSynced} EAT` : ""}`}
          />
        </RevealOnMount>

        {!!error && <ErrorBanner message={error} />}

        <View className="px-4">
          {unfiled.count > 0 && (
            <RevealOnMount delay={200}>
              <AlertBanner
                tone={daysLeft <= 7 ? "danger" : "warning"}
                title="KRA Filing Deadline Approaching"
                description={`Your VAT return is due on ${fmtDate(deadline)}. ${unfiled.count} sale${unfiled.count > 1 ? "s" : ""} worth KSh ${ksh(unfiled.total)} not yet compliant on eTIMS.`}
                actionLabel="Review filing"
                onAction={() => router.replace("/(dashboard)/kra")}
              />
            </RevealOnMount>
          )}

          <RevealOnMount delay={260}>
            <StatCard
              title="Total Revenue"
              badgeLabel={
                revenueChange == null
                  ? "—"
                  : `${revenueChange >= 0 ? "+" : ""}${revenueChange.toFixed(1)}%`
              }
              badgeTone={
                revenueChange != null && revenueChange < 0
                  ? "warning"
                  : "positive"
              }
              value={`KSh ${ksh(revenue)}`}
              helper={`KSh ${ksh(Math.abs(revenue - prevRevenue))} ${revenue >= prevRevenue ? "above" : "below"} the previous period`}
              footerStats={SOURCE_FILTERS.slice(1).map((s) => ({
                label: s.toUpperCase(),
                value: ksh(
                  sum(sales.filter((t) => t.paymentProviderDisplayName === s)),
                ),
              }))}
            />
          </RevealOnMount>

          <RevealOnMount delay={320}>
            <StatCard
              title="Operating Costs"
              badgeLabel={
                costChange == null
                  ? "—"
                  : `${costChange >= 0 ? "+" : ""}${costChange.toFixed(1)}%`
              }
              badgeTone={
                costChange != null && costChange > 0 ? "warning" : "positive"
              }
              value={`KSh ${ksh(costs)}`}
              helper={`KSh ${ksh(Math.abs(costs - prevCosts))} ${costs >= prevCosts ? "more" : "less"} than the previous period`}
              footerStats={SOURCE_FILTERS.slice(1).map((s) => ({
                label: s.toUpperCase(),
                value: ksh(
                  sum(
                    expenses.filter((t) => t.paymentProviderDisplayName === s),
                  ),
                ),
              }))}
            />
          </RevealOnMount>

          <RevealOnMount delay={380}>
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
          </RevealOnMount>

          <RevealOnMount delay={440}>
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
          </RevealOnMount>

          {transactions &&
            transactions.map((tx, i) => (
              <RevealOnMount key={tx.id} delay={480 + i * 50}>
                <TransactionRow
                  tx={toTransanction(tx)}
                  onPress={() =>
                    showToast(`${tx.referenceNumber} · detail view soon`)
                  }
                />
              </RevealOnMount>
            ))}
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
