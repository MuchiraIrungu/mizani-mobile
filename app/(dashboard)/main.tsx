import { useRouter } from "expo-router";
import { ArrowRight, Pencil, Receipt, Trash2 } from "lucide-react-native";
import { useMemo, useState } from "react";
import { View } from "react-native";

import {
  ActionSheet,
  Appear,
  ConfirmSheet,
  EmptyState,
  ErrorState,
  FormSheet,
  LoadingState,
  type FormValues,
  type RowAction,
} from "../../components/dashboard/crud";
import {
  AlertBanner,
  FilterChips,
  GRADIENT_FOREST,
  GradientStatCard,
  GREEN,
  GreetingBanner,
  PageTitle,
  PillRow,
  SearchModal,
  SearchTrigger,
  SectionHeading,
  SelectorPill,
  showToast,
  SPACE_4,
  StatCard,
  TransactionRow,
  type SearchItem,
  type Transaction,
} from "../../components/dashboard/dashboardUI";
import { BranchPill, Body, Screen, useBranches } from "../../components/dashboard/Screen";
import { useResource } from "../../hooks/useResource";
import { expenseApi, ledgerApi, payrollApi, productApi } from "../../services/resources";
import { useAuthStore } from "../../store/authStore";
import type { EntryType, Expense, LedgerEntry, PayrollRun, Product } from "../../types/api";
import { ksh, shortDate, sum, timeOf } from "../../utils/format";

/* Dashboard — today's picture from the ledger: money in, money out,
   low stock and the latest entries. */

const PERIODS = ["This month", "Last 30 days", "All time"];
const TYPE_FILTERS = ["All", "Sales", "Expenses", "Suppliers", "Payroll"];
const TYPE_OF_FILTER: Record<string, EntryType> = {
  Sales: "SALE",
  Expenses: "EXPENSE",
  Suppliers: "SUPPLIER_PAYMENT",
  Payroll: "PAYROLL",
};
const TYPE_LABEL: Record<EntryType, string> = {
  SALE: "Sales",
  EXPENSE: "Expense",
  SUPPLIER_PAYMENT: "Supplier",
  PAYROLL: "Payroll",
};
const SCREEN_FOR: Record<EntryType, string> = {
  SALE: "/(dashboard)/sales",
  EXPENSE: "/(dashboard)/reports",
  SUPPLIER_PAYMENT: "/(dashboard)/suppliers",
  PAYROLL: "/(dashboard)/payroll",
};

function inPeriod(iso: string, period: string, offsetMonths = 0) {
  if (period === "All time") return offsetMonths === 0;
  const d = new Date(iso);
  const now = new Date();
  if (period === "This month") {
    const ref = new Date(now.getFullYear(), now.getMonth() - offsetMonths, 1);
    return d.getMonth() === ref.getMonth() && d.getFullYear() === ref.getFullYear();
  }
  const age = (now.getTime() - d.getTime()) / 86400000;
  return offsetMonths === 0 ? age <= 30 : age > 30 && age <= 60;
}

function toTransaction(e: LedgerEntry): Transaction {
  const inflow = e.direction === "INFLOW";
  const kra = e.kraStatus === "COMPLIANT" ? "Compliant" : e.kraStatus === "PENDING" ? "eTIMS pending" : "Recorded";
  return {
    id: e.id,
    date: shortDate(e.occurredAt),
    time: timeOf(e.occurredAt),
    details: e.description || `${TYPE_LABEL[e.entryType]} · ${e.branchName}`,
    reference: e.referenceNumber,
    category: TYPE_LABEL[e.entryType],
    source: e.paymentProviderDisplayName || e.branchName,
    sourceTone: inflow ? "positive" : "neutral",
    status: kra,
    statusTone: e.kraStatus === "COMPLIANT" ? "positive" : e.kraStatus === "PENDING" ? "warning" : "neutral",
    amount: ksh(e.amount),
    isNegative: !inflow,
  };
}

export default function DashboardScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const ledger = useResource<LedgerEntry[]>(ledgerApi.list, []);
  const products = useResource<Product[]>(() => productApi.list(), []);
  const runs = useResource<PayrollRun[]>(() => payrollApi.listRuns(), []);
  const branchState = useBranches();

  const [typeFilter, setTypeFilter] = useState("All");
  const [period, setPeriod] = useState("This month");
  const [searchVisible, setSearchVisible] = useState(false);
  const [entryActions, setEntryActions] = useState<LedgerEntry | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<LedgerEntry | null>(null);

  const branchId = branchState.branchId;
  const scoped = useMemo(
    () => ledger.data.filter((e) => !branchId || e.branchId === branchId),
    [ledger.data, branchId],
  );
  const current = scoped.filter((e) => inPeriod(e.occurredAt, period));
  const previous = scoped.filter((e) => inPeriod(e.occurredAt, period, 1));

  const revenue = sum(current.filter((e) => e.direction === "INFLOW"), (e) => e.amount);
  const prevRevenue = sum(previous.filter((e) => e.direction === "INFLOW"), (e) => e.amount);
  const costsOf = (t: EntryType) => sum(current.filter((e) => e.entryType === t), (e) => e.amount);
  const costs = sum(current.filter((e) => e.direction === "OUTFLOW"), (e) => e.amount);
  const salesCount = current.filter((e) => e.entryType === "SALE").length;
  const change = prevRevenue > 0 ? ((revenue - prevRevenue) / prevRevenue) * 100 : null;
  const margin = revenue > 0 ? Math.round(((revenue - costs) / revenue) * 100) : null;

  const lowStock = products.data.filter((p) => p.stockQuantity <= p.lowStockThreshold);
  const latestRun = [...runs.data].sort((a, b) => b.payoutDate.localeCompare(a.payoutDate))[0];
  const paye = sum(latestRun?.entries ?? [], (e) => e.payeDeduction);
  const vatEstimate = Math.round(revenue * (16 / 116));

  const recent = current
    .filter((e) => typeFilter === "All" || e.entryType === TYPE_OF_FILTER[typeFilter])
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))
    .slice(0, 12);

  const searchData: SearchItem[] = scoped.map((e) => ({
    id: e.id,
    title: `${e.referenceNumber} · ${ksh(e.amount)}`,
    subtitle: `${TYPE_LABEL[e.entryType]} · ${e.branchName} · ${shortDate(e.occurredAt)}`,
  }));

  const firstName = user?.firstName || "there";

  const actionsFor = (e: LedgerEntry): RowAction[] =>
    e.entryType === "EXPENSE"
      ? [
          {
            label: "Edit expense",
            icon: (c) => <Pencil size={17} color={c} />,
            onPress: async () => {
              try {
                const list = await expenseApi.list();
                const exp = list.find((x) => x.id === e.sourceEntityId);
                if (exp) setEditingExpense(exp);
                else showToast("That expense no longer exists");
              } catch {
                showToast("Couldn't load the expense");
              }
            },
          },
          { label: "Delete expense", tone: "danger", icon: (c) => <Trash2 size={17} color={c} />, onPress: () => setDeletingExpense(e) },
        ]
      : [
          {
            label: `Open ${TYPE_LABEL[e.entryType].toLowerCase()}`,
            icon: (c) => <ArrowRight size={17} color={c} />,
            onPress: () => router.replace(SCREEN_FOR[e.entryType] as never),
          },
        ];

  const saveExpense = async (v: FormValues) => {
    if (!editingExpense) return;
    await expenseApi.update(editingExpense.id, {
      branchId: editingExpense.branchId,
      category: String(v.category).trim(),
      description: String(v.description || "").trim() || undefined,
      amount: Number(v.amount),
    });
    ledger.reload();
    showToast("Expense updated");
    setEditingExpense(null);
  };

  return (
    <Screen
      refreshing={ledger.refreshing}
      onRefresh={() => {
        ledger.refresh();
        products.reload();
        runs.reload();
        branchState.reload();
      }}
      overlays={
        <>
          <SearchModal
            visible={searchVisible}
            onClose={() => setSearchVisible(false)}
            data={searchData}
            placeholder="Search transactions by reference…"
            onSelect={(item) => setEntryActions(scoped.find((e) => e.id === item.id) ?? null)}
          />
          <ActionSheet
            visible={!!entryActions}
            title={entryActions ? `${entryActions.referenceNumber} · ${ksh(entryActions.amount)}` : ""}
            subtitle={entryActions ? `${TYPE_LABEL[entryActions.entryType]} · ${entryActions.branchName} · ${shortDate(entryActions.occurredAt)}` : undefined}
            onClose={() => setEntryActions(null)}
            actions={entryActions ? actionsFor(entryActions) : []}
          />
          <FormSheet
            visible={!!editingExpense}
            title="Edit expense"
            subtitle={editingExpense?.referenceNumber}
            fields={[
              { key: "category", label: "Category", required: true },
              { key: "amount", label: "Amount (KSh)", type: "number", required: true, min: 1 },
              { key: "description", label: "Notes", type: "multiline" },
            ]}
            initialValues={
              editingExpense
                ? { category: editingExpense.category, amount: String(editingExpense.amount), description: editingExpense.description ?? "" }
                : undefined
            }
            submitLabel="Save changes"
            onSubmit={saveExpense}
            onClose={() => setEditingExpense(null)}
          />
          <ConfirmSheet
            visible={!!deletingExpense}
            title="Delete expense?"
            message={`${deletingExpense?.referenceNumber ?? "This expense"} (${ksh(deletingExpense?.amount)}) will be removed from your books.`}
            confirmLabel="Delete"
            onConfirm={async () => {
              if (!deletingExpense) return;
              await expenseApi.remove(deletingExpense.sourceEntityId);
              ledger.setData((list) => list.filter((e) => e.id !== deletingExpense.id));
              showToast("Expense deleted");
              setDeletingExpense(null);
            }}
            onClose={() => setDeletingExpense(null)}
          />
        </>
      }
    >
      <Appear>
        <View className="px-4" style={{ marginTop: SPACE_4 }}>
          <GreetingBanner name={firstName} subtitle="Here is how the business is doing today." colors={GRADIENT_FOREST} />
        </View>
      </Appear>

      <PillRow>
        <BranchPill branches={branchState.branches} selectedName={branchState.selected?.name ?? null} onSelect={branchState.setBranchId} />
        <SelectorPill label={period} options={PERIODS} onSelect={setPeriod} />
        <SearchTrigger onPress={() => setSearchVisible(true)} />
      </PillRow>

      <PageTitle
        title="Dashboard"
        subtitle={`${branchState.selected?.name ?? "All branches"} · ${period.toLowerCase()} · ${current.length} entries`}
      />

      <Body>
        {ledger.error && <ErrorState message={ledger.error} onRetry={ledger.refresh} />}

        {ledger.loading ? (
          <LoadingState />
        ) : (
          <>
            {lowStock.length > 0 ? (
              <Appear index={0}>
                <AlertBanner
                  tone="warning"
                  title={`${lowStock.length} product${lowStock.length === 1 ? " is" : "s are"} running low`}
                  description={`${lowStock.slice(0, 3).map((p) => `${p.name} (${p.stockQuantity} left)`).join(", ")}${lowStock.length > 3 ? "…" : ""}. Restock before you run out.`}
                  actionLabel="Open inventory"
                  onAction={() => router.replace("/(dashboard)/inventory")}
                />
              </Appear>
            ) : (
              <Appear index={0}>
                <AlertBanner
                  tone="info"
                  title="Keep your KRA filings on track"
                  description="Review eTIMS invoices and upcoming returns in the KRA section."
                  actionLabel="Open KRA"
                  onAction={() => router.replace("/(dashboard)/kra")}
                />
              </Appear>
            )}

            <Appear index={1}>
              <StatCard
                title="Total Revenue"
                badgeLabel={change === null ? `${salesCount} sales` : `${change >= 0 ? "+" : ""}${change.toFixed(1)}%`}
                badgeTone={change === null ? "neutral" : change >= 0 ? "positive" : "danger"}
                value={ksh(revenue)}
                helper={
                  change === null
                    ? "Money in from completed sales"
                    : `${ksh(Math.abs(revenue - prevRevenue))} ${revenue >= prevRevenue ? "above" : "below"} the previous period`
                }
                footerStats={[
                  { label: "SALES", value: String(salesCount) },
                  { label: "AVG SALE", value: salesCount ? Math.round(revenue / salesCount).toLocaleString("en-KE") : "0" },
                  { label: "NET", value: (revenue - costs).toLocaleString("en-KE") },
                ]}
              />
            </Appear>

            <Appear index={2}>
              <StatCard
                title="Operating Costs"
                badgeLabel={margin === null ? "No revenue yet" : `${margin}% margin`}
                badgeTone={margin === null ? "neutral" : margin >= 0 ? "positive" : "danger"}
                value={ksh(costs)}
                helper="Stock, payroll and expenses paid out this period"
                progressPercent={revenue > 0 ? Math.min(100, Math.round((costs / revenue) * 100)) : undefined}
                footerStats={[
                  { label: "STOCK", value: costsOf("SUPPLIER_PAYMENT").toLocaleString("en-KE") },
                  { label: "PAYROLL", value: costsOf("PAYROLL").toLocaleString("en-KE") },
                  { label: "OTHER", value: costsOf("EXPENSE").toLocaleString("en-KE") },
                ]}
              />
            </Appear>

            <Appear index={3}>
              <GradientStatCard
                title="Estimated Tax Set-aside"
                badgeLabel="Estimate"
                value={ksh(vatEstimate + paye)}
                helper="A guide to put aside — confirm amounts in the KRA section"
                rows={[
                  { label: "VAT (16% of sales, if registered)", value: ksh(vatEstimate) },
                  { label: `PAYE${latestRun ? ` · ${shortDate(latestRun.payoutDate)} run` : ""}`, value: ksh(paye) },
                ]}
                actionLabel="Open KRA"
                onAction={() => router.replace("/(dashboard)/kra")}
                colors={GRADIENT_FOREST}
              />
            </Appear>

            <SectionHeading
              title="Recent Transactions"
              subtitle={`${recent.length} of ${current.length} entries this period`}
              actionLabel="Reports"
              onAction={() => router.replace("/(dashboard)/reports")}
            />
            <FilterChips options={TYPE_FILTERS} value={typeFilter} onChange={setTypeFilter} />

            {recent.length === 0 ? (
              <EmptyState
                icon={<Receipt size={24} color={GREEN} />}
                title="No transactions yet"
                message="Completed sales, expenses, supplier payments and payroll will show here."
                actionLabel="Add a transaction"
                onAction={() => router.push("/(dashboard)/add-transaction")}
              />
            ) : (
              recent.map((e, i) => (
                <Appear key={e.id} index={i + 4}>
                  <TransactionRow tx={toTransaction(e)} onPress={() => setEntryActions(e)} />
                </Appear>
              ))
            )}
          </>
        )}
      </Body>
    </Screen>
  );
}
