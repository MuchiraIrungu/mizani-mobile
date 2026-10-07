import {
    cancelSupplierPayment,
    completeSupplierPayment,
    createSupplier,
    createSupplierPayment,
    deleteSupplier,
    getPaymentsForSupplier,
    getSupplier,
    updateSupplier,
} from "@/services/dashboardDataService";
import type { SupplierPaymentResponse } from "@/types/supplier";
import { ksh } from "@/utils/dashboardStats";
import { apiError } from "@/utils/header";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Banknote, Check, Trash2 } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { Alert, View } from "react-native";
import { Field, FormScreen } from "../../components/dashboard/FormUI";
import {
    GRADIENT_CRIMSON,
    GRADIENT_FOREST,
    InfoRow,
    PrimaryButton,
    SectionHeading,
    showToast,
    SPACE_4,
} from "../../components/dashboard/dashboardUI";

/* Add / edit supplier. Opened with ?id=<supplierId> it edits, deletes and
   records payments to the supplier. */

const paymentTone = (s: SupplierPaymentResponse["status"]) =>
  s === "PAID" ? "positive" : s === "FAILED" ? "danger" : "warning";

export default function AddSupplierScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const editing = !!id;
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState("");
  const [payments, setPayments] = useState<SupplierPaymentResponse[]>([]);
  const [payAmount, setPayAmount] = useState("");
  const [payRef, setPayRef] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadPayments = useCallback(() => {
    if (!id) return;
    getPaymentsForSupplier(id)
      .then(setPayments)
      .catch(() => setPayments([]));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    getSupplier(id)
      .then((s) => {
        setName(s.name);
        setPhone(s.phone ?? "");
        setCategory(s.category ?? "");
      })
      .catch((e) => setError(apiError(e, "Failed to load supplier")));
    loadPayments();
  }, [id, loadPayments]);

  const save = async () => {
    if (saving) return;
    if (!name.trim()) return setError("Supplier name is required");
    const body = {
      name: name.trim(),
      phone: phone.trim() || undefined,
      category: category.trim() || undefined,
    };
    setError(null);
    setSaving(true);
    try {
      if (editing) {
        await updateSupplier(id, body);
        showToast(`${body.name} updated`);
      } else {
        await createSupplier(body);
        showToast(`${body.name} added`);
      }
      router.back();
    } catch (err) {
      setError(apiError(err, "Failed to save supplier"));
    } finally {
      setSaving(false);
    }
  };

  const recordPayment = async () => {
    if (saving || !id) return;
    const amount = Number(payAmount);
    if (!payAmount.trim() || Number.isNaN(amount) || amount <= 0)
      return setError("Enter a valid payment amount");
    setError(null);
    setSaving(true);
    try {
      await createSupplierPayment({
        supplierId: id,
        referenceNumber: payRef.trim() || undefined,
        amount,
        currency: "KES",
      });
      setPayAmount("");
      setPayRef("");
      loadPayments();
      showToast("Payment recorded as pending");
    } catch (err) {
      setError(apiError(err, "Failed to record payment"));
    } finally {
      setSaving(false);
    }
  };

  const paymentActions = (p: SupplierPaymentResponse) => {
    if (p.status !== "PENDING") return;
    const run = async (fn: (id: string) => Promise<unknown>, msg: string) => {
      try {
        await fn(p.id);
        loadPayments();
        showToast(msg);
      } catch (err) {
        setError(apiError(err, "Failed to update payment"));
      }
    };
    Alert.alert(p.referenceNumber, `KSh ${ksh(p.amount)}`, [
      { text: "Close", style: "cancel" },
      {
        text: "Cancel payment",
        style: "destructive",
        onPress: () => run(cancelSupplierPayment, "Payment cancelled"),
      },
      {
        text: "Mark paid",
        onPress: () => run(completeSupplierPayment, "Payment marked paid"),
      },
    ]);
  };

  const remove = () => {
    if (!id) return;
    Alert.alert("Delete supplier", `Delete ${name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteSupplier(id);
            showToast(`${name} deleted`);
            router.back();
          } catch (err) {
            setError(apiError(err, "Failed to delete supplier"));
          }
        },
      },
    ]);
  };

  return (
    <FormScreen title={editing ? "Edit Supplier" : "Add Supplier"} error={error}>
      <Field
        label="Supplier name"
        value={name}
        onChangeText={setName}
        placeholder="e.g. Unga Group"
      />
      <Field
        label="Phone (optional)"
        value={phone}
        onChangeText={setPhone}
        placeholder="07XX XXX XXX"
        keyboardType="phone-pad"
      />
      <Field
        label="Category (optional)"
        value={category}
        onChangeText={setCategory}
        placeholder="e.g. Dry goods"
      />
      <PrimaryButton
        label={editing ? "Save changes" : "Save supplier"}
        icon={<Check size={16} color="#FFFFFF" />}
        onPress={save}
        colors={GRADIENT_FOREST}
      />

      {editing && (
        <>
          <View style={{ marginTop: SPACE_4 }}>
            <SectionHeading
              title="Payments"
              subtitle={`${payments.length} recorded · tap a pending one to settle`}
            />
          </View>
          {payments.map((p) => (
            <InfoRow
              key={p.id}
              icon={<Banknote size={18} color="#0A5C36" />}
              title={`KSh ${ksh(p.amount)}`}
              subtitle={`${p.referenceNumber} · ${new Date(p.createdAt).toLocaleDateString()}`}
              trailingLabel={p.status}
              trailingTone={paymentTone(p.status)}
              onPress={() => paymentActions(p)}
            />
          ))}
          <Field
            label="Payment amount (KSh)"
            value={payAmount}
            onChangeText={setPayAmount}
            placeholder="0.00"
            keyboardType="numeric"
          />
          <Field
            label="Reference (optional)"
            value={payRef}
            onChangeText={setPayRef}
            placeholder="e.g. M-Pesa code or cheque no."
            autoCapitalize="characters"
          />
          <PrimaryButton
            label="Record payment"
            icon={<Banknote size={16} color="#FFFFFF" />}
            onPress={recordPayment}
            colors={GRADIENT_FOREST}
          />
          <View style={{ marginTop: SPACE_4 }}>
            <PrimaryButton
              label="Delete supplier"
              icon={<Trash2 size={16} color="#FFFFFF" />}
              onPress={remove}
              colors={GRADIENT_CRIMSON}
            />
          </View>
        </>
      )}
    </FormScreen>
  );
}
