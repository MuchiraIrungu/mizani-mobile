import { Download } from "lucide-react-native";
import { useCallback, useMemo, useState } from "react";
import { ScrollView, StatusBar, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ErrorBanner } from "@/components/auth/AuthUI";
import { useNotificationItems } from "@/hooks/useNotificationItems";
import { getTransactions } from "@/services/dashboardDataService";
import { useAuthStore } from "@/store/authStore";
import { TransactionResponse } from "@/types/dashboard";
import {
  byType,
  fmtRange,
  getPeriodRange,
  inRange,
  ksh,
  pctChange,
  previousRange,
  sum,
} from "@/utils/dashboardStats";
import { apiError, headerProps } from "@/utils/header";
import { useFocusEffect } from "expo-router";
import {
  AppHeader,
  BottomNav,
  DataCard,
  DataRow,
  FONT_SEMI,
  GRADIENT_FOREST,
  GradientStatCard,
  NAV_CLEARANCE,
  PageTitle,
  PillRow,
  PillTabs,
  PrimaryButton,
  SectionHeading,
  SelectorPill,
  showToast,
  SPACE_3,
  SPACE_4,
  StatCard,
  SURFACE,
  TEXT_PRIMARY,
  ToastHost,
} from "../../components/dashboard/dashboardUI";

/* Reports — revenue vs expenses for the period, expense mix and exportable
   statements. */

const SHADES = ["#063D24", "#0A5C36", "#15803D", "#22C55E", "#94A3B8"];
const SOURCES = ["M-Pesa", "Bank", "Cash"];
const fmtPct = (c: number | null) =>
  c == null ? "—" : `${c >= 0 ? "+" : ""}${c.toFixed(1)}%`;

const STATEMENTS = [
  {
    label: "Profit & Loss",
    detail: "Income statement for the period",
    value: "PDF",
  },
  {
    label: "Balance Sheet",
    detail: "Assets, liabilities and equity",
    value: "PDF",
  },
  {
    label: "Cash Flow",
    detail: "Operating, investing and financing",
    value: "PDF",
  },
  { label: "Trial Balance", detail: "All ledger accounts", value: "CSV" },
];

export default function ReportsScreen() {
  const user = useAuthStore((s) => s.user);
  const notifications = useNotificationItems();
  const [period, setPeriod] = useState("M");
  const [branch, setBranch] = useState("All Branches");
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [now, setNow] = useState(() => new Date());
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      getTransactions()
        .then((t) => {
          setTransactions(t);
          setNow(new Date());
          setError(null);
        })
        .catch((e) => setError(apiError(e, "Failed to load report data")));
    }, []),
  );

  const range = useMemo(() => getPeriodRange(period, now), [period, now]);
  const branchOptions = useMemo(
    () => [
      "All Branches",
      ...new Set(transactions.map((t) => t.branchName).filter(Boolean)),
    ],
    [transactions],
  );
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

  const periodLabel =
    period === "W"
      ? "This week"
      : period === "Q"
        ? `Q${Math.floor(range.start.getMonth() / 3) + 1} ${range.start.getFullYear()}`
        : period === "Y"
          ? `FY ${range.start.getFullYear()}`
          : fmtRange(range);

  const sales = byType(scoped, "SALE");
  const expenses = byType(scoped, "EXPENSE");
  const revenue = sum(sales);
  const costs = sum(expenses);
  const net = revenue - costs;
  const margin = revenue ? Math.round((net / revenue) * 100) : 0;
  const prevRevenue = sum(byType(previous, "SALE"));
  const prevCosts = sum(byType(previous, "EXPENSE"));
  const prevNet = prevRevenue - prevCosts;
  const bySource = (txs: TransactionResponse[]) =>
    SOURCES.map((s) => ({
      label: s,
      amount: sum(txs.filter((t) => t.paymentProviderDisplayName === s)),
    }));

  const breakdown = bySource(expenses).map((r, i) => ({
    ...r,
    pct: costs ? Math.round((r.amount / costs) * 100) : 0,
    color: SHADES[i],
  }));

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
        <AppHeader {...headerProps(user)} notifications={notifications} />
        <PillRow>
          <SelectorPill
            label={branch}
            options={branchOptions}
            onSelect={setBranch}
          />
        </PillRow>
        <PageTitle title="Reports" subtitle={`${branch} · ${periodLabel}`} />
        {!!error && <ErrorBanner message={error} />}

        <View className="px-4">
          <PillTabs
            options={["W", "M", "Q", "Y"]}
            value={period}
            onChange={setPeriod}
          />

          <GradientStatCard
            title="Net Profit"
            badgeLabel={fmtPct(prevNet > 0 ? pctChange(net, prevNet) : null)}
            value={`KSh ${ksh(net)}`}
            helper={`Revenue less operating costs for ${periodLabel}`}
            rows={[
              { label: "Revenue", value: `KSh ${ksh(revenue)}` },
              { label: "Operating costs", value: `KSh ${ksh(costs)}` },
              { label: "Margin", value: `${margin}%` },
            ]}
            actionLabel="Export summary"
            onAction={() => showToast("Preparing summary…")}
            colors={GRADIENT_FOREST}
          />

          <StatCard
            title="Revenue"
            badgeLabel={fmtPct(pctChange(revenue, prevRevenue))}
            badgeTone="positive"
            value={`KSh ${ksh(revenue)}`}
            helper="Against the previous period"
            footerStats={bySource(sales).map((r) => ({
              label: r.label.toUpperCase(),
              value: ksh(r.amount),
            }))}
          />

          <StatCard
            title="Expenses"
            badgeLabel={fmtPct(pctChange(costs, prevCosts))}
            badgeTone="warning"
            value={`KSh ${ksh(costs)}`}
            helper={`Margin ${margin}% this period`}
          />

          <SectionHeading
            title="Expense Breakdown"
            subtitle="Share of operating costs by payment source"
          />
          <View
            className="rounded-[14px] p-5"
            style={{
              backgroundColor: "#FFFFFF",
              marginBottom: SPACE_4,
              shadowColor: "#0F172A",
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.14,
              shadowRadius: 7,
              elevation: 4,
            }}
          >
            {breakdown.map((row, i) => (
              <View
                key={row.label}
                className="flex-row items-center justify-between py-3"
                style={{
                  borderTopWidth: i === 0 ? 0 : 1,
                  borderTopColor: "#D9DEDB",
                }}
              >
                <View className="flex-row items-center flex-1 mr-3">
                  <View
                    className="w-2.5 h-2.5 rounded-[999px] mr-3"
                    style={{ backgroundColor: row.color }}
                  />
                  <Text
                    className="text-[13px]"
                    style={{ color: TEXT_PRIMARY, fontFamily: FONT_SEMI }}
                  >
                    {row.label}
                  </Text>
                </View>
                <Text
                  className="text-[13px] mr-3"
                  style={{ color: TEXT_PRIMARY, fontFamily: FONT_SEMI }}
                >
                  KSh {ksh(row.amount)}
                </Text>
                <View
                  className="px-2.5 py-1 rounded-[999px]"
                  style={{ backgroundColor: row.color }}
                >
                  <Text
                    className="text-[11px]"
                    style={{ color: "#FFFFFF", fontFamily: FONT_SEMI }}
                  >
                    {row.pct}%
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <DataCard
            title="Statements"
            subtitle={`Ready to export for ${periodLabel}`}
          >
            {STATEMENTS.map((s, i) => (
              <DataRow
                key={s.label}
                label={s.label}
                detail={s.detail}
                value={s.value}
                first={i === 0}
              />
            ))}
          </DataCard>

          <View style={{ marginBottom: SPACE_3 }}>
            <PrimaryButton
              label="Export Report (PDF)"
              icon={<Download size={16} color="#FFFFFF" />}
              onPress={() => showToast("Preparing PDF export…")}
              colors={GRADIENT_FOREST}
            />
          </View>
        </View>
      </ScrollView>

      <BottomNav />
      <ToastHost />
    </SafeAreaView>
  );
}
