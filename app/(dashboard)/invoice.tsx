import {
    getInvoice,
    markInvoiceOverdue,
    markInvoicePaid,
    voidInvoice,
} from "@/services/dashboardDataService";
import type { InvoiceResponse } from "@/types/sales";
import { ksh } from "@/utils/dashboardStats";
import { apiError } from "@/utils/header";
import { useLocalSearchParams } from "expo-router";
import { Ban, CheckCircle2, Clock } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Alert, View } from "react-native";
import { FormScreen } from "../../components/dashboard/FormUI";
import {
    DataRow,
    GRADIENT_AMBER,
    GRADIENT_CRIMSON,
    GRADIENT_FOREST,
    PrimaryButton,
    showToast,
    SPACE_3,
    StatusPill,
} from "../../components/dashboard/dashboardUI";

/* Invoice detail — opened with ?id=<invoiceId>. Shows the invoice and the
   status transitions the backend allows from its current state. */

const tone = (s: InvoiceResponse["status"]) =>
  s === "PAID"
    ? "positive"
    : s === "OVERDUE" || s === "VOID"
      ? "danger"
      : "warning";

export default function InvoiceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [invoice, setInvoice] = useState<InvoiceResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getInvoice(id)
      .then(setInvoice)
      .catch((e) => setError(apiError(e, "Failed to load invoice")));
  }, [id]);

  const run = async (
    fn: (id: string) => Promise<InvoiceResponse>,
    msg: string,
  ) => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      setInvoice(await fn(id));
      showToast(msg);
    } catch (err) {
      setError(apiError(err, "Failed to update invoice"));
    } finally {
      setBusy(false);
    }
  };

  const confirmVoid = () =>
    Alert.alert("Void invoice", "Voiding cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Void",
        style: "destructive",
        onPress: () => run(voidInvoice, "Invoice voided"),
      },
    ]);

  const status = invoice?.status;
  const open = status === "PENDING" || status === "OVERDUE";

  return (
    <FormScreen title={invoice?.invoiceNumber ?? "Invoice"} error={error}>
      {invoice && (
        <>
          <View className="mb-3 flex-row">
            <StatusPill label={invoice.status} tone={tone(invoice.status)} />
          </View>
          <DataRow label="Customer" value={invoice.customerName} first />
          <DataRow label="Due date" value={invoice.dueDate} />
          <DataRow
            label="Created"
            value={new Date(invoice.createdAt).toLocaleDateString()}
          />
          {invoice.paidAt && (
            <DataRow
              label="Paid"
              value={new Date(invoice.paidAt).toLocaleDateString()}
            />
          )}
          <DataRow
            label="eTIMS"
            value={invoice.etimsValidated ? "Validated" : "Not yet validated"}
          />
          <DataRow
            label="Total"
            value={`KSh ${ksh(invoice.totalAmount)}`}
            emphasis
          />

          {open && (
            <View style={{ marginTop: SPACE_3, gap: SPACE_3 }}>
              <PrimaryButton
                label="Mark as paid"
                icon={<CheckCircle2 size={16} color="#FFFFFF" />}
                onPress={() => run(markInvoicePaid, "Invoice marked paid")}
                colors={GRADIENT_FOREST}
              />
              {status === "PENDING" && (
                <PrimaryButton
                  label="Mark as overdue"
                  icon={<Clock size={16} color="#FFFFFF" />}
                  onPress={() =>
                    run(markInvoiceOverdue, "Invoice marked overdue")
                  }
                  colors={GRADIENT_AMBER}
                />
              )}
              <PrimaryButton
                label="Void invoice"
                icon={<Ban size={16} color="#FFFFFF" />}
                onPress={confirmVoid}
                colors={GRADIENT_CRIMSON}
              />
            </View>
          )}
        </>
      )}
    </FormScreen>
  );
}
