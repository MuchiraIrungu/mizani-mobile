import { Ban, CheckCircle2, Pencil, Plus, Trash2, Truck, Wallet, XCircle } from "lucide-react-native";
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
  type FormValues,
  type RowAction,
} from "../../components/dashboard/crud";
import {
  BG,
  DataCard,
  DataRow,
  FONT_REG,
  FONT_SEMI,
  GRADIENT_FOREST,
  GradientStatCard,
  GREEN,
  GREEN_TINT,
  InfoRow,
  PageTitle,
  PillRow,
  PillTabs,
  PrimaryButton,
  SearchModal,
  SearchTrigger,
  SectionHeading,
  SHADOW_SM,
  showToast,
  SPACE_4,
  StatCard,
  StatusPill,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  type SearchItem,
} from "../../components/dashboard/dashboardUI";
import { Body, Screen } from "../../components/dashboard/Screen";
import { useResource } from "../../hooks/useResource";
import { supplierApi, supplierPaymentApi } from "../../services/resources";
import { initialsOf } from "../../store/authStore";
import type { Supplier, SupplierPayment } from "../../types/api";
import { ksh, relativeTime, shortDate, sum } from "../../utils/format";

/* Suppliers — accounts, what's owed to each (pending supplier payments),
   ageing, and the payment lifecycle: record → paid / failed / cancelled. */

const ageDays = (iso: string) => Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);

const PAYMENT_TONE = { PENDING: "warning", PAID: "positive", FAILED: "danger" } as const;

function PaymentRow({ payment, onMore }: { payment: SupplierPayment; onMore: () => void }) {
  return (
    <PressableScale
      onPress={onMore}
      className="flex-row items-center rounded-[12px] p-4 mb-3"
      style={{ backgroundColor: BG, ...SHADOW_SM }}
    >
      <View className="w-10 h-10 rounded-[10px] items-center justify-center mr-3" style={{ backgroundColor: GREEN_TINT }}>
        <Wallet size={18} color={GREEN} />
      </View>
      <View className="flex-1 mr-2">
        <Text className="text-[14px] mb-1" numberOfLines={1} style={{ color: TEXT_PRIMARY, fontFamily: FONT_SEMI }}>
          {payment.supplierName ?? "Supplier"}
        </Text>
        <Text className="text-[12px]" style={{ color: TEXT_SECONDARY, fontFamily: FONT_REG }}>
          {payment.referenceNumber} · {shortDate(payment.createdAt)}
        </Text>
      </View>
      <View className="items-end">
        <Text className="text-[14px] mb-1.5" style={{ color: TEXT_PRIMARY, fontFamily: FONT_SEMI }}>
          {ksh(payment.amount)}
        </Text>
        <StatusPill label={payment.status.charAt(0) + payment.status.slice(1).toLowerCase()} tone={PAYMENT_TONE[payment.status]} />
      </View>
      <MoreButton onPress={onMore} />
    </PressableScale>
  );
}

export default function SuppliersScreen() {
  const suppliers = useResource<Supplier[]>(supplierApi.list, []);
  const payments = useResource<SupplierPayment[]>(() => supplierPaymentApi.list(), []);
  const [tab, setTab] = useState("All");
  const [paymentTab, setPaymentTab] = useState("Pending");
  const [searchVisible, setSearchVisible] = useState(false);

  const [supplierForm, setSupplierForm] = useState<{ supplier?: Supplier } | null>(null);
  const [paymentFor, setPaymentFor] = useState<Supplier | "pick" | null>(null);
  const [supplierActions, setSupplierActions] = useState<Supplier | null>(null);
  const [paymentActions, setPaymentActions] = useState<SupplierPayment | null>(null);
  const [deleting, setDeleting] = useState<Supplier | null>(null);

  const pending = payments.data.filter((p) => p.status === "PENDING");
  const owedBy = useMemo(() => {
    const m = new Map<string, number>();
    pending.forEach((p) => m.set(p.supplierId, (m.get(p.supplierId) ?? 0) + Number(p.amount)));
    return m;
  }, [pending]);
  const lastPaymentOf = (id: string) =>
    payments.data.filter((p) => p.supplierId === id).sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];

  const totalPayable = sum(pending, (p) => p.amount);
  const ageing = [
    { label: "0 – 30 days", detail: "Recently recorded", items: pending.filter((p) => ageDays(p.createdAt) <= 30) },
    { label: "31 – 60 days", detail: "Follow up soon", items: pending.filter((p) => ageDays(p.createdAt) > 30 && ageDays(p.createdAt) <= 60) },
    { label: "Over 60 days", detail: "Overdue — settle first", items: pending.filter((p) => ageDays(p.createdAt) > 60) },
  ];

  const owing = suppliers.data.filter((s) => (owedBy.get(s.id) ?? 0) > 0);
  const filtered = suppliers.data.filter((s) =>
    tab === "All" ? true : tab === "Owing" ? (owedBy.get(s.id) ?? 0) > 0 : !(owedBy.get(s.id) ?? 0),
  );
  const shownPayments = payments.data
    .filter((p) => p.status === paymentTab.toUpperCase())
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const searchData: SearchItem[] = suppliers.data.map((s) => ({
    id: s.id,
    title: s.name,
    subtitle: [s.category, s.phone, owedBy.get(s.id) ? `owes ${ksh(owedBy.get(s.id))}` : "settled"].filter(Boolean).join(" · "),
  }));

  const replacePayment = (updated: SupplierPayment) =>
    payments.setData((list) => list.map((p) => (p.id === updated.id ? updated : p)));

  const saveSupplier = async (v: FormValues) => {
    const body = {
      name: String(v.name).trim(),
      phone: String(v.phone || "").trim() || undefined,
      category: String(v.category || "").trim() || undefined,
    };
    if (supplierForm?.supplier) {
      const updated = await supplierApi.update(supplierForm.supplier.id, body);
      suppliers.setData((list) => list.map((s) => (s.id === updated.id ? updated : s)));
      payments.reload();
      showToast(`${updated.name} updated`);
    } else {
      const created = await supplierApi.create(body);
      suppliers.setData((list) => [...list, created].sort((a, b) => a.name.localeCompare(b.name)));
      showToast(`${created.name} added`);
    }
    setSupplierForm(null);
  };

  const recordPayment = async (v: FormValues) => {
    const supplierId = paymentFor === "pick" ? String(v.supplierId) : paymentFor?.id;
    if (!supplierId) return;
    let created = await supplierPaymentApi.create({
      supplierId,
      amount: Number(v.amount),
      referenceNumber: String(v.reference || "").trim() || undefined,
      currency: "KES",
    });
    if (v.paidNow) created = await supplierPaymentApi.complete(created.id);
    payments.setData((list) => [created, ...list]);
    setPaymentTab(created.status === "PAID" ? "Paid" : "Pending");
    showToast(`${ksh(created.amount)} ${created.status === "PAID" ? "paid to" : "recorded for"} ${created.supplierName ?? "supplier"}`);
    setPaymentFor(null);
  };

  const paymentActionList = (p: SupplierPayment): RowAction[] =>
    p.status === "PENDING"
      ? [
          {
            label: "Mark as paid",
            tone: "positive",
            icon: (c) => <CheckCircle2 size={17} color={c} />,
            onPress: async () => {
              try {
                replacePayment(await supplierPaymentApi.complete(p.id));
                showToast("Payment marked as paid");
              } catch {
                showToast("Couldn't update the payment");
              }
            },
          },
          {
            label: "Mark as failed",
            tone: "warning",
            icon: (c) => <XCircle size={17} color={c} />,
            onPress: async () => {
              try {
                replacePayment(await supplierPaymentApi.fail(p.id));
                showToast("Payment marked as failed");
              } catch {
                showToast("Couldn't update the payment");
              }
            },
          },
          {
            label: "Cancel payment",
            tone: "danger",
            icon: (c) => <Ban size={17} color={c} />,
            onPress: async () => {
              try {
                replacePayment(await supplierPaymentApi.cancel(p.id));
                showToast("Payment cancelled");
              } catch {
                showToast("Couldn't cancel the payment");
              }
            },
          },
        ]
      : [];

  return (
    <Screen
      refreshing={suppliers.refreshing || payments.refreshing}
      onRefresh={() => {
        suppliers.refresh();
        payments.refresh();
      }}
      overlays={
        <>
          <SearchModal
            visible={searchVisible}
            onClose={() => setSearchVisible(false)}
            data={searchData}
            placeholder="Search suppliers…"
            onSelect={(item) => setSupplierActions(suppliers.data.find((s) => s.id === item.id) ?? null)}
          />
          <FormSheet
            visible={!!supplierForm}
            title={supplierForm?.supplier ? "Edit supplier" : "Add supplier"}
            subtitle={supplierForm?.supplier?.name}
            fields={[
              { key: "name", label: "Supplier name", required: true, placeholder: "e.g. Unga Group" },
              { key: "phone", label: "Phone", type: "phone", placeholder: "07XX XXX XXX" },
              { key: "category", label: "What they supply", placeholder: "e.g. Dry goods" },
            ]}
            initialValues={
              supplierForm?.supplier
                ? {
                    name: supplierForm.supplier.name,
                    phone: supplierForm.supplier.phone ?? "",
                    category: supplierForm.supplier.category ?? "",
                  }
                : undefined
            }
            submitLabel={supplierForm?.supplier ? "Save changes" : "Add supplier"}
            onSubmit={saveSupplier}
            onClose={() => setSupplierForm(null)}
          />
          <FormSheet
            visible={!!paymentFor}
            title="Record supplier payment"
            subtitle={paymentFor && paymentFor !== "pick" ? paymentFor.name : "An amount owed to, or paid to, a supplier."}
            fields={[
              {
                key: "supplierId",
                label: "Supplier",
                type: "select",
                required: true,
                options: suppliers.data.map((s) => ({ label: s.name, value: s.id })),
                visibleWhen: () => paymentFor === "pick",
              },
              { key: "amount", label: "Amount (KSh)", type: "number", required: true, min: 1 },
              { key: "reference", label: "Reference / delivery note", placeholder: "Leave blank to auto-number" },
              { key: "paidNow", label: "Already paid", type: "switch", helper: "Off records it as owed (pending)." },
            ]}
            submitLabel="Save payment"
            onSubmit={recordPayment}
            onClose={() => setPaymentFor(null)}
          />
          <ActionSheet
            visible={!!supplierActions}
            title={supplierActions?.name ?? ""}
            subtitle={
              supplierActions
                ? owedBy.get(supplierActions.id)
                  ? `Owes ${ksh(owedBy.get(supplierActions.id))}`
                  : "Nothing owed"
                : undefined
            }
            onClose={() => setSupplierActions(null)}
            actions={
              supplierActions
                ? [
                    { label: "Record payment", tone: "positive", icon: (c) => <Wallet size={17} color={c} />, onPress: () => setPaymentFor(supplierActions) },
                    { label: "Edit supplier", icon: (c) => <Pencil size={17} color={c} />, onPress: () => setSupplierForm({ supplier: supplierActions }) },
                    { label: "Delete supplier", tone: "danger", icon: (c) => <Trash2 size={17} color={c} />, onPress: () => setDeleting(supplierActions) },
                  ]
                : []
            }
          />
          <ActionSheet
            visible={!!paymentActions}
            title={paymentActions ? `${ksh(paymentActions.amount)} · ${paymentActions.supplierName ?? ""}` : ""}
            subtitle={paymentActions ? `${paymentActions.referenceNumber} · recorded ${relativeTime(paymentActions.createdAt)}` : undefined}
            onClose={() => setPaymentActions(null)}
            actions={paymentActions ? paymentActionList(paymentActions) : []}
          />
          <ConfirmSheet
            visible={!!deleting}
            title="Delete supplier?"
            message={`${deleting?.name ?? "This supplier"} will be removed. Suppliers with payment history may need their payments settled first.`}
            confirmLabel="Delete"
            onConfirm={async () => {
              if (!deleting) return;
              await supplierApi.remove(deleting.id);
              suppliers.setData((list) => list.filter((s) => s.id !== deleting.id));
              showToast(`${deleting.name} deleted`);
              setDeleting(null);
            }}
            onClose={() => setDeleting(null)}
          />
        </>
      }
    >
      <PillRow>
        <SearchTrigger onPress={() => setSearchVisible(true)} />
      </PillRow>

      <PageTitle
        title="Suppliers"
        subtitle={`${suppliers.data.length} suppliers · ${owing.length} with a balance`}
      />

      <Body>
        {(suppliers.error || payments.error) && (
          <ErrorState
            message={suppliers.error || payments.error || ""}
            onRetry={() => {
              suppliers.refresh();
              payments.refresh();
            }}
          />
        )}

        {suppliers.loading ? (
          <LoadingState />
        ) : (
          <>
            <Appear index={0}>
              <GradientStatCard
                title="Total Payables"
                badgeLabel={`${pending.length} to pay`}
                value={ksh(totalPayable)}
                helper="Pending supplier payments across the business"
                rows={ageing.map((a) => ({ label: a.label, value: ksh(sum(a.items, (p) => p.amount)) }))}
                actionLabel="Record payment"
                onAction={() => setPaymentFor("pick")}
                colors={GRADIENT_FOREST}
              />
            </Appear>

            <Appear index={1}>
              <StatCard
                title="Suppliers"
                badgeLabel={`${suppliers.data.length - owing.length} settled`}
                badgeTone="positive"
                value={String(suppliers.data.length)}
                helper="Supplier accounts on file"
                footerStats={[
                  { label: "OWING", value: String(owing.length) },
                  { label: "SETTLED", value: String(suppliers.data.length - owing.length) },
                  { label: "PAID OUT", value: ksh(sum(payments.data.filter((p) => p.status === "PAID"), (p) => p.amount)) },
                ]}
              />
            </Appear>

            <Appear index={2}>
              <DataCard title="Payables Ageing" subtitle="By days since the payment was recorded">
                {ageing.map((a, i) => (
                  <DataRow key={a.label} label={a.label} detail={`${a.items.length} · ${a.detail}`} value={ksh(sum(a.items, (p) => p.amount))} first={i === 0} />
                ))}
                <DataRow label="Total" value={ksh(totalPayable)} emphasis />
              </DataCard>
            </Appear>

            <Appear index={3} style={{ marginBottom: SPACE_4 }}>
              <PrimaryButton
                label="Add Supplier"
                icon={<Plus size={16} color="#FFFFFF" />}
                onPress={() => setSupplierForm({})}
                colors={GRADIENT_FOREST}
              />
            </Appear>

            <SectionHeading title="Supplier Accounts" subtitle={`${filtered.length} shown`} />
            <PillTabs options={["All", "Owing", "Settled"]} value={tab} onChange={setTab} />

            {suppliers.data.length === 0 ? (
              <EmptyState
                icon={<Truck size={24} color={GREEN} />}
                title="No suppliers yet"
                message="Add the businesses you buy from to track what you owe and pay them on time."
                actionLabel="Add a supplier"
                onAction={() => setSupplierForm({})}
              />
            ) : (
              filtered.map((s, i) => {
                const owed = owedBy.get(s.id) ?? 0;
                const last = lastPaymentOf(s.id);
                return (
                  <Appear key={s.id} index={i + 4}>
                    <InfoRow
                      initials={initialsOf(s.name)}
                      title={s.name}
                      subtitle={[s.category, s.phone, last ? `last payment ${shortDate(last.createdAt)}` : "no payments yet"].filter(Boolean).join(" · ")}
                      trailingLabel={owed ? ksh(owed) : "Settled"}
                      trailingTone={owed ? "warning" : "positive"}
                      onPress={() => setSupplierActions(s)}
                    />
                  </Appear>
                );
              })
            )}

            <View style={{ marginTop: SPACE_4 }}>
              <SectionHeading
                title="Supplier Payments"
                subtitle={`${shownPayments.length} ${paymentTab.toLowerCase()}`}
                actionLabel="Record"
                onAction={() => setPaymentFor("pick")}
              />
              <PillTabs options={["Pending", "Paid", "Failed"]} value={paymentTab} onChange={setPaymentTab} />
              {shownPayments.length === 0 ? (
                <EmptyState
                  icon={<Wallet size={24} color={GREEN} />}
                  title={`No ${paymentTab.toLowerCase()} payments`}
                  message={paymentTab === "Pending" ? "Everything owed to suppliers is settled." : "Payments will show here once recorded."}
                />
              ) : (
                shownPayments.map((p, i) => (
                  <Appear key={p.id} index={i}>
                    <PaymentRow
                      payment={p}
                      onMore={() => (p.status === "PENDING" ? setPaymentActions(p) : showToast(`${p.referenceNumber} · ${p.status.toLowerCase()}`))}
                    />
                  </Appear>
                ))
              )}
            </View>
          </>
        )}
      </Body>
    </Screen>
  );
}
