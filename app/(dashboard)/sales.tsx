import {
  Ban,
  CheckCircle2,
  Clock,
  FileText,
  Pencil,
  Plus,
  Receipt,
  ShoppingCart,
  Trash2,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import { Text, View } from "react-native";

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
  type Field,
  type FormValues,
  type RowAction,
} from "../../components/dashboard/crud";
import {
  BG,
  FilterChips,
  FONT_REG,
  FONT_SEMI,
  GhostPillButton,
  GRADIENT_FOREST,
  GradientStatCard,
  GREEN,
  GREEN_TINT,
  InvoiceRow,
  PageTitle,
  PillRow,
  PillTabs,
  PrimaryButton,
  SearchModal,
  SearchTrigger,
  SectionHeading,
  SelectorPill,
  SHADOW_SM,
  showToast,
  SPACE_4,
  StatCard,
  StatusPill,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  type Invoice as InvoiceRowData,
  type SearchItem,
} from "../../components/dashboard/dashboardUI";
import { BranchPill, Body, Screen, useBranches } from "../../components/dashboard/Screen";
import { useResource } from "../../hooks/useResource";
import { apiError } from "../../services/api";
import { customerApi, invoiceApi, productApi, saleApi } from "../../services/resources";
import type { Customer, Invoice, Product, Sale, SaleInput } from "../../types/api";
import { daysUntil, isoDate, ksh, shortDate, sum } from "../../utils/format";

/* Sales — record sales (line items from inventory), raise invoices from
   them, track payment status, and manage customers. */

const INVOICE_FILTERS = ["All", "Pending", "Overdue", "Paid", "Void"];
const SALE_FILTERS = ["All", "Pending", "Paid", "Failed", "Refunded"];
const PERIODS = ["This month", "Last 30 days", "All time"];

const inPeriod = (iso: string, period: string) => {
  if (period === "All time") return true;
  const d = new Date(iso);
  const now = new Date();
  if (period === "This month") return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  return now.getTime() - d.getTime() <= 30 * 86400000;
};

const SALE_TONE = { PENDING: "warning", PAID: "positive", FAILED: "danger", REFUNDED: "neutral" } as const;

function toInvoiceRow(inv: Invoice): InvoiceRowData {
  const days = daysUntil(inv.dueDate);
  const overdue = inv.status === "OVERDUE" || (inv.status === "PENDING" && days !== null && days < 0);
  return {
    id: inv.id,
    customer: inv.customerName ?? "Customer",
    reference: inv.invoiceNumber,
    dueDate: inv.dueDate ? shortDate(inv.dueDate) : "No due date",
    statusLabel:
      inv.status === "PAID"
        ? `Paid ${shortDate(inv.paidAt)}`
        : inv.status === "VOID"
          ? "Voided"
          : days === null
            ? "Awaiting payment"
            : days < 0
              ? `${-days} days overdue`
              : days === 0
                ? "Due today"
                : `Due in ${days} days`,
    amount: ksh(inv.totalAmount),
    status: inv.status === "PAID" ? "paid" : overdue ? "overdue" : "pending",
  };
}

function SaleRow({ sale, customer, onMore }: { sale: Sale; customer?: string; onMore: () => void }) {
  const items = sale.lineItems ?? [];
  return (
    <PressableScale
      onPress={onMore}
      className="flex-row items-center rounded-[12px] p-4 mb-3"
      style={{ backgroundColor: BG, ...SHADOW_SM }}
    >
      <View className="w-10 h-10 rounded-[10px] items-center justify-center mr-3" style={{ backgroundColor: GREEN_TINT }}>
        <ShoppingCart size={18} color={GREEN} />
      </View>
      <View className="flex-1 mr-2">
        <Text className="text-[14px] mb-1" numberOfLines={1} style={{ color: TEXT_PRIMARY, fontFamily: FONT_SEMI }}>
          {customer ?? "Walk-in customer"}
        </Text>
        <Text className="text-[12px]" numberOfLines={1} style={{ color: TEXT_SECONDARY, fontFamily: FONT_REG }}>
          {items.map((li) => `${li.quantity}× ${li.productName}`).join(", ") || "No items"} · {shortDate(sale.occurredAt)}
        </Text>
      </View>
      <View className="items-end">
        <Text className="text-[14px] mb-1.5" style={{ color: TEXT_PRIMARY, fontFamily: FONT_SEMI }}>
          {ksh(sale.totalAmount)}
        </Text>
        <StatusPill label={sale.status.charAt(0) + sale.status.slice(1).toLowerCase()} tone={SALE_TONE[sale.status]} />
      </View>
      <MoreButton onPress={onMore} />
    </PressableScale>
  );
}

type SaleFormState = { mode: "create"; customerId?: string } | { mode: "edit"; sale: Sale } | { mode: "invoice"; sale: Sale };

export default function SalesScreen() {
  const invoices = useResource<Invoice[]>(() => invoiceApi.list(), []);
  const sales = useResource<Sale[]>(() => saleApi.list(), []);
  const customers = useResource<Customer[]>(customerApi.list, []);
  const products = useResource<Product[]>(() => productApi.list(), []);
  const branchState = useBranches();

  const [topTab, setTopTab] = useState("Invoices");
  const [invoiceFilter, setInvoiceFilter] = useState("All");
  const [saleFilter, setSaleFilter] = useState("All");
  const [period, setPeriod] = useState("This month");
  const [searchVisible, setSearchVisible] = useState(false);

  const [saleForm, setSaleForm] = useState<SaleFormState | null>(null);
  const [customerForm, setCustomerForm] = useState<{ customer?: Customer } | null>(null);
  const [invoiceActions, setInvoiceActions] = useState<Invoice | null>(null);
  const [saleActions, setSaleActions] = useState<Sale | null>(null);
  const [customerActions, setCustomerActions] = useState<Customer | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);
  const [cancellingSale, setCancellingSale] = useState<Sale | null>(null);

  const customerName = (id: string | null) => customers.data.find((c) => c.id === id)?.name;
  const branchId = branchState.branchId;
  const inBranch = (s: Sale) => !branchId || s.branchId === branchId;

  const periodSales = sales.data.filter((s) => inBranch(s) && inPeriod(s.occurredAt, period));
  const periodInvoices = invoices.data.filter((i) => inPeriod(i.createdAt, period));
  const open = invoices.data.filter((i) => i.status === "PENDING" || i.status === "OVERDUE");
  const overdue = open.filter((i) => i.status === "OVERDUE" || (daysUntil(i.dueDate) ?? 0) < 0);
  const pendingOnly = open.filter((i) => !overdue.includes(i));
  const oldestOverdue = overdue.reduce((max, i) => Math.max(max, -(daysUntil(i.dueDate) ?? 0)), 0);

  const owedByCustomer = useMemo(() => {
    const m = new Map<string, number>();
    open.forEach((i) => m.set(i.customerId, (m.get(i.customerId) ?? 0) + Number(i.totalAmount)));
    return m;
  }, [open]);

  const invoiceRows = periodInvoices
    .filter((i) => {
      if (invoiceFilter === "All") return true;
      if (invoiceFilter === "Overdue") return overdue.includes(i);
      if (invoiceFilter === "Pending") return pendingOnly.includes(i);
      return i.status === invoiceFilter.toUpperCase();
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const saleRows = periodSales
    .filter((s) => saleFilter === "All" || s.status === saleFilter.toUpperCase())
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));

  const searchData: SearchItem[] = [
    ...invoices.data.map((i) => ({ id: `inv:${i.id}`, title: `${i.invoiceNumber} · ${i.customerName ?? ""}`, subtitle: `${ksh(i.totalAmount)} · ${i.status.toLowerCase()}` })),
    ...customers.data.map((c) => ({ id: `cus:${c.id}`, title: c.name, subtitle: [c.phone, c.email].filter(Boolean).join(" · ") || "Customer" })),
  ];

  const reloadAll = () => {
    invoices.reload();
    sales.reload();
    customers.reload();
    products.reload();
  };

  /* ---------- Sale form ---------- */
  const productOptions = products.data.map((p) => ({ label: `${p.name} · ${ksh(p.unitPrice)} · ${p.stockQuantity} left`, value: p.id }));
  const saleFields: Field[] = [
    {
      key: "customerId",
      label: "Customer",
      type: "select",
      placeholder: "Walk-in customer",
      options: [{ label: "Walk-in customer", value: "" }, ...customers.data.map((c) => ({ label: c.name, value: c.id }))],
      visibleWhen: () => saleForm?.mode !== "invoice",
    },
    ...[1, 2, 3].flatMap((n): Field[] => [
      {
        key: `product${n}`,
        label: n === 1 ? "Product" : `Product ${n}`,
        type: "select",
        required: n === 1,
        placeholder: n === 1 ? "Choose a product" : "Add another product (optional)",
        options: n === 1 ? productOptions : [{ label: "None", value: "" }, ...productOptions],
        visibleWhen: (v) => saleForm?.mode !== "invoice" && (n === 1 || !!v[`product${n - 1}`]),
      },
      {
        key: `qty${n}`,
        label: "Quantity",
        type: "number",
        required: n === 1,
        min: 1,
        visibleWhen: (v) => saleForm?.mode !== "invoice" && !!v[`product${n}`],
      },
    ]),
    {
      key: "raiseInvoice",
      label: "Raise an invoice",
      type: "switch",
      helper: "Bill the customer and track payment.",
      visibleWhen: (v) => saleForm?.mode === "create" && !!v.customerId,
    },
    {
      key: "dueDate",
      label: "Invoice due date",
      type: "date",
      required: true,
      visibleWhen: (v) => saleForm?.mode === "invoice" || (saleForm?.mode === "create" && !!v.customerId && !!v.raiseInvoice),
    },
    {
      key: "paidNow",
      label: "Paid now",
      type: "switch",
      helper: "Completes the sale and records it in your books.",
      visibleWhen: (v) => saleForm?.mode === "create" && !v.raiseInvoice,
    },
  ];

  const linesFrom = (v: FormValues) =>
    [1, 2, 3]
      .filter((n) => v[`product${n}`])
      .map((n) => ({ productId: String(v[`product${n}`]), quantity: Math.round(Number(v[`qty${n}`] || 1)) }));

  const saleInitial = (): FormValues => {
    const due = new Date();
    due.setDate(due.getDate() + 14);
    if (!saleForm || saleForm.mode === "create")
      return { paidNow: true, dueDate: isoDate(due), customerId: saleForm?.mode === "create" ? saleForm.customerId ?? "" : "" };
    const s = saleForm.sale;
    const v: FormValues = { customerId: s.customerId ?? "", dueDate: isoDate(due) };
    (s.lineItems ?? []).slice(0, 3).forEach((li, i) => {
      v[`product${i + 1}`] = li.productId;
      v[`qty${i + 1}`] = String(li.quantity);
    });
    return v;
  };

  const saveSale = async (v: FormValues) => {
    if (!saleForm) return;
    if (saleForm.mode === "invoice") {
      if (!saleForm.sale.customerId) throw new Error("Add a customer to this sale before invoicing it.");
      const inv = await invoiceApi.create({ saleId: saleForm.sale.id, customerId: saleForm.sale.customerId, dueDate: String(v.dueDate) });
      invoices.setData((list) => [inv, ...list]);
      setTopTab("Invoices");
      showToast(`${inv.invoiceNumber} raised`);
      setSaleForm(null);
      return;
    }
    const targetBranch = branchId ?? branchState.main?.id;
    if (!targetBranch) throw new Error("Create a branch in Settings first.");
    const body: SaleInput = {
      branchId: saleForm.mode === "edit" ? saleForm.sale.branchId : targetBranch,
      customerId: v.customerId ? String(v.customerId) : null,
      currency: "KES",
      lineItems: linesFrom(v),
    };
    if (saleForm.mode === "edit") {
      const updated = await saleApi.update(saleForm.sale.id, body);
      sales.setData((list) => list.map((s) => (s.id === updated.id ? updated : s)));
      showToast("Sale updated");
    } else {
      let created = await saleApi.create(body);
      if (v.raiseInvoice && body.customerId) {
        const inv = await invoiceApi.create({ saleId: created.id, customerId: body.customerId, dueDate: String(v.dueDate) });
        invoices.setData((list) => [inv, ...list]);
        setTopTab("Invoices");
        showToast(`Sale recorded · ${inv.invoiceNumber} raised`);
      } else if (v.paidNow) {
        created = await saleApi.complete(created.id);
        setTopTab("Sales");
        showToast(`Sale of ${ksh(created.totalAmount)} recorded`);
      } else {
        setTopTab("Sales");
        showToast("Sale saved as pending");
      }
      sales.setData((list) => [created, ...list]);
    }
    products.reload();
    setSaleForm(null);
  };

  /* ---------- Customers ---------- */
  const saveCustomer = async (v: FormValues) => {
    const body = { name: String(v.name).trim(), phone: String(v.phone || "").trim() || undefined, email: String(v.email || "").trim() || undefined };
    if (customerForm?.customer) {
      const updated = await customerApi.update(customerForm.customer.id, body);
      customers.setData((list) => list.map((c) => (c.id === updated.id ? updated : c)));
      showToast(`${updated.name} updated`);
    } else {
      const created = await customerApi.create(body);
      customers.setData((list) => [...list, created].sort((a, b) => a.name.localeCompare(b.name)));
      showToast(`${created.name} added`);
    }
    setCustomerForm(null);
  };

  /* ---------- Row actions ---------- */
  const act = (fn: () => Promise<void>, failure: string) => async () => {
    try {
      await fn();
    } catch (err) {
      showToast(apiError(err, failure));
    }
  };
  const replaceInvoice = (inv: Invoice) => invoices.setData((list) => list.map((i) => (i.id === inv.id ? inv : i)));
  const replaceSale = (s: Sale) => sales.setData((list) => list.map((x) => (x.id === s.id ? s : x)));

  const invoiceActionList = (inv: Invoice): RowAction[] =>
    inv.status === "PAID" || inv.status === "VOID"
      ? []
      : [
          { label: "Mark as paid", tone: "positive", icon: (c) => <CheckCircle2 size={17} color={c} />, onPress: act(async () => { replaceInvoice(await invoiceApi.markPaid(inv.id)); sales.reload(); showToast(`${inv.invoiceNumber} paid`); }, "Couldn't mark it paid") },
          ...(inv.status === "PENDING"
            ? [{ label: "Mark as overdue", tone: "warning" as const, icon: (c: string) => <Clock size={17} color={c} />, onPress: act(async () => { replaceInvoice(await invoiceApi.markOverdue(inv.id)); showToast(`${inv.invoiceNumber} marked overdue`); }, "Couldn't update the invoice") }]
            : []),
          { label: "Void invoice", tone: "danger", icon: (c) => <Ban size={17} color={c} />, onPress: act(async () => { replaceInvoice(await invoiceApi.void(inv.id)); showToast(`${inv.invoiceNumber} voided`); }, "Couldn't void the invoice") },
        ];

  const saleActionList = (s: Sale): RowAction[] => {
    const hasInvoice = invoices.data.some((i) => i.saleId === s.id && i.status !== "VOID");
    if (s.status !== "PENDING") {
      return hasInvoice || !s.customerId
        ? []
        : [{ label: "Raise invoice", icon: (c) => <FileText size={17} color={c} />, onPress: () => setSaleForm({ mode: "invoice", sale: s }) }];
    }
    return [
      { label: "Mark as paid", tone: "positive", icon: (c) => <CheckCircle2 size={17} color={c} />, onPress: act(async () => { replaceSale(await saleApi.complete(s.id)); invoices.reload(); showToast("Sale completed"); }, "Couldn't complete the sale") },
      { label: "Edit sale", icon: (c) => <Pencil size={17} color={c} />, onPress: () => setSaleForm({ mode: "edit", sale: s }) },
      ...(!hasInvoice && s.customerId ? [{ label: "Raise invoice", icon: (c: string) => <FileText size={17} color={c} />, onPress: () => setSaleForm({ mode: "invoice", sale: s }) }] : []),
      { label: "Cancel sale", tone: "danger", icon: (c) => <XCircle size={17} color={c} />, onPress: () => setCancellingSale(s) },
    ];
  };

  const loading = invoices.loading || sales.loading;
  const error = invoices.error || sales.error || customers.error;

  return (
    <Screen
      refreshing={invoices.refreshing || sales.refreshing}
      onRefresh={() => {
        invoices.refresh();
        sales.refresh();
        customers.reload();
        products.reload();
        branchState.reload();
      }}
      overlays={
        <>
          <SearchModal
            visible={searchVisible}
            onClose={() => setSearchVisible(false)}
            data={searchData}
            placeholder="Search invoices, customers…"
            onSelect={(item) => {
              const [kind, id] = item.id.split(":");
              if (kind === "inv") setInvoiceActions(invoices.data.find((i) => i.id === id) ?? null);
              else setCustomerActions(customers.data.find((c) => c.id === id) ?? null);
            }}
          />
          <FormSheet
            visible={!!saleForm}
            title={saleForm?.mode === "edit" ? "Edit sale" : saleForm?.mode === "invoice" ? "Raise invoice" : "New sale"}
            subtitle={
              saleForm?.mode === "invoice"
                ? `${customerName(saleForm.sale.customerId) ?? "Customer"} · ${ksh(saleForm.sale.totalAmount)}`
                : products.data.length
                  ? "Prices come from your inventory."
                  : "Add products in Inventory first."
            }
            fields={saleFields}
            initialValues={saleInitial()}
            submitLabel={saleForm?.mode === "edit" ? "Save changes" : saleForm?.mode === "invoice" ? "Raise invoice" : "Record sale"}
            onSubmit={saveSale}
            onClose={() => setSaleForm(null)}
          />
          <FormSheet
            visible={!!customerForm}
            title={customerForm?.customer ? "Edit customer" : "Add customer"}
            subtitle={customerForm?.customer?.name}
            fields={[
              { key: "name", label: "Customer name", required: true, placeholder: "e.g. Karibu Foods Ltd" },
              { key: "phone", label: "Phone", type: "phone", placeholder: "07XX XXX XXX" },
              { key: "email", label: "Email", type: "email", placeholder: "accounts@karibu.co.ke" },
            ]}
            initialValues={customerForm?.customer ? { name: customerForm.customer.name, phone: customerForm.customer.phone ?? "", email: customerForm.customer.email ?? "" } : undefined}
            submitLabel={customerForm?.customer ? "Save changes" : "Add customer"}
            onSubmit={saveCustomer}
            onClose={() => setCustomerForm(null)}
          />
          <ActionSheet
            visible={!!invoiceActions}
            title={invoiceActions ? `${invoiceActions.invoiceNumber} · ${ksh(invoiceActions.totalAmount)}` : ""}
            subtitle={invoiceActions ? `${invoiceActions.customerName ?? ""} · ${toInvoiceRow(invoiceActions).statusLabel}` : undefined}
            onClose={() => setInvoiceActions(null)}
            actions={invoiceActions ? invoiceActionList(invoiceActions) : []}
          />
          <ActionSheet
            visible={!!saleActions}
            title={saleActions ? `${ksh(saleActions.totalAmount)} · ${customerName(saleActions.customerId) ?? "Walk-in"}` : ""}
            subtitle={saleActions ? `${shortDate(saleActions.occurredAt)} · ${saleActions.status.toLowerCase()}` : undefined}
            onClose={() => setSaleActions(null)}
            actions={saleActions ? saleActionList(saleActions) : []}
          />
          <ActionSheet
            visible={!!customerActions}
            title={customerActions?.name ?? ""}
            subtitle={customerActions ? (owedByCustomer.get(customerActions.id) ? `Owes ${ksh(owedByCustomer.get(customerActions.id))}` : "Nothing owed") : undefined}
            onClose={() => setCustomerActions(null)}
            actions={
              customerActions
                ? [
                    { label: "New sale for this customer", tone: "positive", icon: (c) => <ShoppingCart size={17} color={c} />, onPress: () => setSaleForm({ mode: "create", customerId: customerActions.id }) },
                    { label: "Edit customer", icon: (c) => <Pencil size={17} color={c} />, onPress: () => setCustomerForm({ customer: customerActions }) },
                    { label: "Delete customer", tone: "danger", icon: (c) => <Trash2 size={17} color={c} />, onPress: () => setDeletingCustomer(customerActions) },
                  ]
                : []
            }
          />
          <ConfirmSheet
            visible={!!deletingCustomer}
            title="Delete customer?"
            message={`${deletingCustomer?.name ?? "This customer"} will be removed. Customers with sales or invoices may need to keep their record.`}
            confirmLabel="Delete"
            onConfirm={async () => {
              if (!deletingCustomer) return;
              await customerApi.remove(deletingCustomer.id);
              customers.setData((list) => list.filter((c) => c.id !== deletingCustomer.id));
              showToast(`${deletingCustomer.name} deleted`);
              setDeletingCustomer(null);
            }}
            onClose={() => setDeletingCustomer(null)}
          />
          <ConfirmSheet
            visible={!!cancellingSale}
            title="Cancel this sale?"
            message={`The ${ksh(cancellingSale?.totalAmount)} sale will be cancelled and won't count towards your takings.`}
            confirmLabel="Cancel sale"
            onConfirm={async () => {
              if (!cancellingSale) return;
              replaceSale(await saleApi.cancel(cancellingSale.id));
              products.reload();
              showToast("Sale cancelled");
              setCancellingSale(null);
            }}
            onClose={() => setCancellingSale(null)}
          />
        </>
      }
    >
      <PillRow>
        <BranchPill branches={branchState.branches} selectedName={branchState.selected?.name ?? null} onSelect={branchState.setBranchId} />
        <SelectorPill label={period} options={PERIODS} onSelect={setPeriod} />
        <SearchTrigger onPress={() => setSearchVisible(true)} />
      </PillRow>

      <PageTitle
        title="Sales"
        subtitle={`${branchState.selected?.name ?? "All branches"} · ${period.toLowerCase()} · ${periodSales.length} sales · ${periodInvoices.length} invoices`}
      />

      <Body>
        {error && <ErrorState message={error} onRetry={reloadAll} />}

        {loading ? (
          <LoadingState />
        ) : (
          <>
            <Appear index={0}>
              <GradientStatCard
                title="Total Outstanding"
                badgeLabel={`${open.length} invoices`}
                value={ksh(sum(open, (i) => i.totalAmount))}
                helper={`Across ${pendingOnly.length} pending and ${overdue.length} overdue invoices`}
                footerStats={[
                  { label: "PENDING", value: sum(pendingOnly, (i) => i.totalAmount).toLocaleString("en-KE") },
                  { label: "OVERDUE", value: sum(overdue, (i) => i.totalAmount).toLocaleString("en-KE") },
                  { label: "SALES", value: sum(periodSales.filter((s) => s.status === "PAID"), (s) => s.totalAmount).toLocaleString("en-KE") },
                ]}
                colors={GRADIENT_FOREST}
              />
            </Appear>

            <Appear index={1}>
              <StatCard
                title="Overdue"
                tone={overdue.length ? "danger" : "success"}
                badgeLabel={open.length ? `${Math.round((sum(overdue, (i) => i.totalAmount) / Math.max(1, sum(open, (i) => i.totalAmount))) * 100)}% of outstanding` : "All clear"}
                value={ksh(sum(overdue, (i) => i.totalAmount))}
                helper={overdue.length ? `Oldest unpaid invoice is ${oldestOverdue} days past its due date` : "No invoices are past their due date"}
                footerStats={[
                  { label: "INVOICES", value: String(overdue.length) },
                  { label: "OLDEST", value: `${oldestOverdue} days` },
                  { label: "CUSTOMERS", value: String(new Set(overdue.map((i) => i.customerId)).size) },
                ]}
              />
            </Appear>

            <Appear index={2} style={{ marginBottom: SPACE_4 }}>
              <PrimaryButton
                label="New Sale"
                icon={<Plus size={16} color="#FFFFFF" />}
                onPress={() => setSaleForm({ mode: "create" })}
                colors={GRADIENT_FOREST}
              />
            </Appear>

            <PillTabs options={["Invoices", "Sales", "Customers"]} value={topTab} onChange={setTopTab} />

            {topTab === "Invoices" && (
              <>
                <SectionHeading title="Invoices" subtitle={`${invoiceRows.length} shown`} />
                <FilterChips options={INVOICE_FILTERS} value={invoiceFilter} onChange={setInvoiceFilter} />
                {invoiceRows.length === 0 ? (
                  <EmptyState
                    icon={<Receipt size={24} color={GREEN} />}
                    title="No invoices here"
                    message="Record a sale for a customer and switch on “Raise an invoice” to bill them."
                    actionLabel="New sale"
                    onAction={() => setSaleForm({ mode: "create" })}
                  />
                ) : (
                  invoiceRows.map((inv, i) => (
                    <Appear key={inv.id} index={i}>
                      <InvoiceRow invoice={toInvoiceRow(inv)} onPress={() => setInvoiceActions(inv)} />
                    </Appear>
                  ))
                )}
              </>
            )}

            {topTab === "Sales" && (
              <>
                <SectionHeading title="Sales" subtitle={`${saleRows.length} shown · ${ksh(sum(saleRows, (s) => s.totalAmount))}`} />
                <FilterChips options={SALE_FILTERS} value={saleFilter} onChange={setSaleFilter} />
                {saleRows.length === 0 ? (
                  <EmptyState
                    icon={<ShoppingCart size={24} color={GREEN} />}
                    title="No sales in this period"
                    message="Sales you record show here with their payment status."
                    actionLabel="Record a sale"
                    onAction={() => setSaleForm({ mode: "create" })}
                  />
                ) : (
                  saleRows.map((s, i) => (
                    <Appear key={s.id} index={i}>
                      <SaleRow sale={s} customer={customerName(s.customerId)} onMore={() => setSaleActions(s)} />
                    </Appear>
                  ))
                )}
              </>
            )}

            {topTab === "Customers" && (
              <>
                <SectionHeading title="Customers" subtitle={`${customers.data.length} accounts · ${owedByCustomer.size} with a balance`} />
                <View style={{ marginBottom: SPACE_4, alignItems: "flex-start" }}>
                  <GhostPillButton label="Add customer" icon={<UserPlus size={14} color={TEXT_SECONDARY} />} onPress={() => setCustomerForm({})} />
                </View>
                {customers.data.length === 0 ? (
                  <EmptyState
                    icon={<Users size={24} color={GREEN} />}
                    title="No customers yet"
                    message="Add the businesses and people you invoice."
                    actionLabel="Add a customer"
                    onAction={() => setCustomerForm({})}
                  />
                ) : (
                  customers.data.map((c, i) => {
                    const owed = owedByCustomer.get(c.id) ?? 0;
                    const count = invoices.data.filter((inv) => inv.customerId === c.id).length;
                    return (
                      <Appear key={c.id} index={i}>
                        <InvoiceRow
                          invoice={{
                            id: c.id,
                            customer: c.name,
                            reference: [c.phone, `${count} invoice${count === 1 ? "" : "s"}`].filter(Boolean).join(" · "),
                            dueDate: "",
                            statusLabel: owed ? "Balance outstanding" : "Nothing owed",
                            amount: ksh(owed),
                            status: owed ? "pending" : "paid",
                          }}
                          onPress={() => setCustomerActions(c)}
                        />
                      </Appear>
                    );
                  })
                )}
              </>
            )}
          </>
        )}
      </Body>
    </Screen>
  );
}
