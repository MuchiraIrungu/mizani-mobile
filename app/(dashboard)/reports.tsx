import { Pencil, Plus, Receipt, Share2, Trash2 } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { Share, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming, Easing } from "react-native-reanimated";

import {
  ActionSheet,
  Appear,
  ConfirmSheet,
  EmptyState,
  ErrorState,
  FormSheet,
  LoadingState,
  MoreButton,
  PressableScale,
  type FormValues,
} from "../../components/dashboard/crud";
import {
  BG,
  BORDER,
  FONT_REG,
  FONT_SEMI,
  GRADIENT_FOREST,
  GradientStatCard,
  GREEN,
  GREEN_TINT,
  PageTitle,
  PillRow,
  PillTabs,
  PrimaryButton,
  SectionHeading,
  SHADOW_SM,
  showToast,
  SPACE_4,
  StatCard,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
} from "../../components/dashboard/dashboardUI";
import { BranchPill, Body, Screen, useBranches } from "../../components/dashboard/Screen";
import { useResource } from "../../hooks/useResource";
import { expenseApi, ledgerApi } from "../../services/resources";
import type { Expense, LedgerEntry } from "../../types/api";
import { ksh, shortDate, sum } from "../../utils/format";

/* Reports — profit and loss for the chosen period from the ledger,
   a cost breakdown, and the expense register (add/edit/delete). */

const PERIOD_DAYS: Record<string, number> = { W: 7, M: 30, Q: 91, Y: 365 };
const PERIOD_LABEL: Record<string, string> = { W: "Last 7 days", M: "Last 30 days", Q: "Last 3 months", Y: "Last 12 months" };
const BAR_COLORS = ["#063D24", "#0A5C36", "#15803D", "#22C55E", "#86EFAC", "#94A3B8"];
const EXPENSE_CATEGORIES = ["Rent", "Utilities", "Transport", "Supplies", "Marketing", "Other"];

const age = (iso: string) => (Date.now() - new Date(iso).getTime()) / 86400000;

/** Breakdown bar that grows to its share when it appears. */
function ShareBar({ pct, color, index }: { pct: number; color: string; index: number }) {
  const width = useSharedValue(0);
  useEffect(() => {
    width.value = withDelay(120 + index * 80, withTiming(pct, { duration: 700, easing: Easing.out(Easing.cubic) }));
  }, [pct, index, width]);
  const style = useAnimatedStyle(() => ({ width: `${width.value}%` }));
  return (
    <View className="h-[6px] rounded-[999px] mt-2 overflow-hidden" style={{ backgroundColor: "#EEF2EF" }}>
      <Animated.View className="h-full rounded-[999px]" style={[{ backgroundColor: color }, style]} />
    </View>
  );
}

function ExpenseRow({ expense, onMore }: { expense: Expense; onMore: () => void }) {
  return (
    <PressableScale onPress={onMore} className="flex-row items-center rounded-[12px] p-4 mb-3" style={{ backgroundColor: BG, ...SHADOW_SM }}>
      <View className="w-10 h-10 rounded-[10px] items-center justify-center mr-3" style={{ backgroundColor: GREEN_TINT }}>
        <Receipt size={18} color={GREEN} />
      </View>
      <View className="flex-1 mr-2">
        <Text className="text-[14px] mb-1" numberOfLines={1} style={{ color: TEXT_PRIMARY, fontFamily: FONT_SEMI }}>
          {expense.category}
        </Text>
        <Text className="text-[12px]" numberOfLines={1} style={{ color: TEXT_SECONDARY, fontFamily: FONT_REG }}>
          {[expense.referenceNumber, expense.description, shortDate(expense.occurredAt)].filter(Boolean).join(" · ")}
        </Text>
      </View>
      <Text className="text-[14px]" style={{ color: TEXT_PRIMARY, fontFamily: FONT_SEMI }}>
        −{ksh(expense.amount)}
      </Text>
      <MoreButton onPress={onMore} />
    </PressableScale>
  );
}

export default function ReportsScreen() {
  const ledger = useResource<LedgerEntry[]>(ledgerApi.list, []);
  const expenses = useResource<Expense[]>(() => expenseApi.list(), []);
  const branchState = useBranches();
  const [period, setPeriod] = useState("M");

  const [expenseForm, setExpenseForm] = useState<{ expense?: Expense } | null>(null);
  const [actionsFor, setActionsFor] = useState<Expense | null>(null);
  const [deleting, setDeleting] = useState<Expense | null>(null);

  const days = PERIOD_DAYS[period];
  const branchId = branchState.branchId;
  const scoped = ledger.data.filter((e) => !branchId || e.branchId === branchId);
  const current = scoped.filter((e) => age(e.occurredAt) <= days);
  const previous = scoped.filter((e) => age(e.occurredAt) > days && age(e.occurredAt) <= days * 2);

  const revenue = sum(current.filter((e) => e.direction === "INFLOW"), (e) => e.amount);
  const costs = sum(current.filter((e) => e.direction === "OUTFLOW"), (e) => e.amount);
  const prevRevenue = sum(previous.filter((e) => e.direction === "INFLOW"), (e) => e.amount);
  const prevCosts = sum(previous.filter((e) => e.direction === "OUTFLOW"), (e) => e.amount);
  const profit = revenue - costs;
  const prevProfit = prevRevenue - prevCosts;
  const pct = (now: number, before: number) => (before > 0 ? ((now - before) / before) * 100 : null);
  const fmtPct = (p: number | null) => (p === null ? "New" : `${p >= 0 ? "+" : ""}${p.toFixed(1)}%`);
  const margin = revenue > 0 ? Math.round((profit / revenue) * 100) : 0;

  const periodExpenses = expenses.data
    .filter((e) => (!branchId || e.branchId === branchId) && age(e.occurredAt) <= days)
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));

  // Supplier payments and payroll come from the ledger; other expenses by category
  const breakdown = useMemo(() => {
    const rows = [
      { label: "Stock purchases", value: sum(current.filter((e) => e.entryType === "SUPPLIER_PAYMENT"), (e) => e.amount) },
      { label: "Payroll", value: sum(current.filter((e) => e.entryType === "PAYROLL"), (e) => e.amount) },
    ];
    const byCategory = new Map<string, number>();
    periodExpenses.forEach((e) => byCategory.set(e.category, (byCategory.get(e.category) ?? 0) + Number(e.amount)));
    [...byCategory.entries()].sort((a, b) => b[1] - a[1]).forEach(([label, value]) => rows.push({ label, value }));
    const total = rows.reduce((s, r) => s + r.value, 0) || 1;
    return rows.filter((r) => r.value > 0).map((r, i) => ({ ...r, pct: (r.value / total) * 100, color: BAR_COLORS[Math.min(i, BAR_COLORS.length - 1)] }));
  }, [current, periodExpenses]);

  const shareSummary = async () => {
    const lines = [
      `Mizani report · ${branchState.selected?.name ?? "All branches"} · ${PERIOD_LABEL[period]}`,
      `Revenue: ${ksh(revenue)}`,
      `Operating costs: ${ksh(costs)}`,
      `Net profit: ${ksh(profit)} (${margin}% margin)`,
      "",
      "Cost breakdown:",
      ...breakdown.map((r) => `• ${r.label}: ${ksh(r.value)} (${Math.round(r.pct)}%)`),
    ];
    try {
      await Share.share({ message: lines.join("\n") });
    } catch {
      showToast("Couldn't open the share sheet");
    }
  };

  const saveExpense = async (v: FormValues) => {
    const targetBranch = expenseForm?.expense?.branchId ?? branchId ?? branchState.main?.id;
    if (!targetBranch) throw new Error("Create a branch in Settings first.");
    const body = {
      branchId: targetBranch,
      category: String(v.category).trim(),
      description: String(v.description || "").trim() || undefined,
      amount: Number(v.amount),
      currency: "KES",
    };
    if (expenseForm?.expense) {
      const updated = await expenseApi.update(expenseForm.expense.id, body);
      expenses.setData((list) => list.map((e) => (e.id === updated.id ? updated : e)));
      showToast("Expense updated");
    } else {
      const created = await expenseApi.create(body);
      expenses.setData((list) => [created, ...list]);
      showToast(`Expense of ${ksh(created.amount)} saved`);
    }
    ledger.reload();
    setExpenseForm(null);
  };

  return (
    <Screen
      refreshing={ledger.refreshing || expenses.refreshing}
      onRefresh={() => {
        ledger.refresh();
        expenses.refresh();
        branchState.reload();
      }}
      overlays={
        <>
          <FormSheet
            visible={!!expenseForm}
            title={expenseForm?.expense ? "Edit expense" : "Add expense"}
            subtitle={expenseForm?.expense?.referenceNumber ?? `Recorded against ${branchState.selected?.name ?? branchState.main?.name ?? "your main branch"}.`}
            fields={[
              { key: "category", label: "Category", type: "select", required: true, options: EXPENSE_CATEGORIES.map((c) => ({ label: c, value: c })) },
              { key: "amount", label: "Amount (KSh)", type: "number", required: true, min: 1 },
              { key: "description", label: "Notes", type: "multiline", placeholder: "e.g. KPLC tokens for the shop" },
            ]}
            initialValues={
              expenseForm?.expense
                ? { category: expenseForm.expense.category, amount: String(expenseForm.expense.amount), description: expenseForm.expense.description ?? "" }
                : { category: "Rent" }
            }
            submitLabel={expenseForm?.expense ? "Save changes" : "Add expense"}
            onSubmit={saveExpense}
            onClose={() => setExpenseForm(null)}
          />
          <ActionSheet
            visible={!!actionsFor}
            title={actionsFor ? `${actionsFor.category} · ${ksh(actionsFor.amount)}` : ""}
            subtitle={actionsFor ? `${actionsFor.referenceNumber} · ${shortDate(actionsFor.occurredAt)}` : undefined}
            onClose={() => setActionsFor(null)}
            actions={
              actionsFor
                ? [
                    { label: "Edit expense", icon: (c) => <Pencil size={17} color={c} />, onPress: () => setExpenseForm({ expense: actionsFor }) },
                    { label: "Delete expense", tone: "danger", icon: (c) => <Trash2 size={17} color={c} />, onPress: () => setDeleting(actionsFor) },
                  ]
                : []
            }
          />
          <ConfirmSheet
            visible={!!deleting}
            title="Delete expense?"
            message={`${deleting?.referenceNumber ?? "This expense"} (${ksh(deleting?.amount)}) will be removed from your books.`}
            confirmLabel="Delete"
            onConfirm={async () => {
              if (!deleting) return;
              await expenseApi.remove(deleting.id);
              expenses.setData((list) => list.filter((e) => e.id !== deleting.id));
              ledger.reload();
              showToast("Expense deleted");
              setDeleting(null);
            }}
            onClose={() => setDeleting(null)}
          />
        </>
      }
    >
      <PillRow>
        <BranchPill branches={branchState.branches} selectedName={branchState.selected?.name ?? null} onSelect={branchState.setBranchId} />
      </PillRow>

      <PageTitle title="Reports" subtitle={`${branchState.selected?.name ?? "All branches"} · ${PERIOD_LABEL[period]}`} />

      <Body>
        <PillTabs options={["W", "M", "Q", "Y"]} value={period} onChange={setPeriod} />

        {(ledger.error || expenses.error) && (
          <ErrorState
            message={ledger.error || expenses.error || ""}
            onRetry={() => {
              ledger.refresh();
              expenses.refresh();
            }}
          />
        )}

        {ledger.loading ? (
          <LoadingState rows={3} />
        ) : (
          <>
            <Appear index={0}>
              <GradientStatCard
                title="Net Profit"
                badgeLabel={fmtPct(pct(profit, prevProfit))}
                value={ksh(profit)}
                helper={`Revenue less operating costs · ${PERIOD_LABEL[period].toLowerCase()}`}
                rows={[
                  { label: "Revenue", value: ksh(revenue) },
                  { label: "Operating costs", value: ksh(costs) },
                  { label: "Margin", value: `${margin}%` },
                ]}
                actionLabel="Share summary"
                actionIcon={<Share2 size={15} color={GREEN} />}
                onAction={shareSummary}
                colors={GRADIENT_FOREST}
              />
            </Appear>

            <Appear index={1}>
              <StatCard
                title="Revenue"
                badgeLabel={fmtPct(pct(revenue, prevRevenue))}
                badgeTone={(pct(revenue, prevRevenue) ?? 0) >= 0 ? "positive" : "danger"}
                value={ksh(revenue)}
                helper="Against the previous period of the same length"
                footerStats={[
                  { label: "SALES", value: String(current.filter((e) => e.entryType === "SALE").length) },
                  { label: "PREVIOUS", value: prevRevenue.toLocaleString("en-KE") },
                  { label: "CHANGE", value: (revenue - prevRevenue).toLocaleString("en-KE") },
                ]}
              />
            </Appear>

            <Appear index={2}>
              <StatCard
                title="Expenses"
                badgeLabel={fmtPct(pct(costs, prevCosts))}
                badgeTone={(pct(costs, prevCosts) ?? 0) <= 0 ? "positive" : "warning"}
                value={ksh(costs)}
                helper={revenue > 0 ? `${Math.round((costs / revenue) * 100)}% of revenue went to costs` : "No revenue recorded in this period"}
                progressPercent={revenue > 0 ? Math.min(100, Math.round((costs / revenue) * 100)) : undefined}
              />
            </Appear>

            <SectionHeading title="Cost Breakdown" subtitle="Share of operating costs this period" />
            <Appear index={3}>
              <View className="rounded-[14px] px-5 py-2" style={{ backgroundColor: BG, marginBottom: SPACE_4, ...SHADOW_SM }}>
                {breakdown.length === 0 ? (
                  <Text className="text-[13px] py-4 text-center" style={{ color: TEXT_SECONDARY, fontFamily: FONT_REG }}>
                    No costs recorded in this period.
                  </Text>
                ) : (
                  breakdown.map((row, i) => (
                    <View key={row.label} className="py-3" style={{ borderTopWidth: i === 0 ? 0 : 1, borderTopColor: BORDER }}>
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center flex-1 mr-3">
                          <View className="w-2.5 h-2.5 rounded-[999px] mr-3" style={{ backgroundColor: row.color }} />
                          <Text className="text-[13px]" style={{ color: TEXT_PRIMARY, fontFamily: FONT_SEMI }}>
                            {row.label}
                          </Text>
                        </View>
                        <Text className="text-[13px] mr-3" style={{ color: TEXT_PRIMARY, fontFamily: FONT_SEMI }}>
                          {ksh(row.value)}
                        </Text>
                        <Text className="text-[12px] w-[38px] text-right" style={{ color: TEXT_SECONDARY, fontFamily: FONT_REG }}>
                          {Math.round(row.pct)}%
                        </Text>
                      </View>
                      <ShareBar pct={row.pct} color={row.color} index={i} />
                    </View>
                  ))
                )}
              </View>
            </Appear>

            <SectionHeading
              title="Expense Register"
              subtitle={`${periodExpenses.length} this period · ${ksh(sum(periodExpenses, (e) => e.amount))}`}
              actionLabel="Add"
              onAction={() => setExpenseForm({})}
            />
            {periodExpenses.length === 0 ? (
              <EmptyState
                icon={<Receipt size={24} color={GREEN} />}
                title="No expenses in this period"
                message="Record rent, utilities, transport and other running costs to see your true profit."
                actionLabel="Add an expense"
                onAction={() => setExpenseForm({})}
              />
            ) : (
              periodExpenses.map((e, i) => (
                <Appear key={e.id} index={i}>
                  <ExpenseRow expense={e} onMore={() => setActionsFor(e)} />
                </Appear>
              ))
            )}

            <View style={{ marginTop: SPACE_4 }}>
              <PrimaryButton label="Add Expense" icon={<Plus size={16} color="#FFFFFF" />} onPress={() => setExpenseForm({})} colors={GRADIENT_FOREST} />
            </View>
          </>
        )}
      </Body>
    </Screen>
  );
}
