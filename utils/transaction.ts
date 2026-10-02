import { Transaction } from "@/components/dashboard/dashboardUI";
import { TransactionResponse } from "@/types/dashboard";

const ENTRY_TYPE_LABEL: Record<string, string> = {
  SALE: "Sale",
  EXPENSE: "Expense",
};

const KRA_STATUS_TONE: Record<string, Transaction["statusTone"]> = {
  COMPLIANT: "positive",
  NON_COMPLIANT: "danger",
  PENDING: "warning",
};

export function toTransanction(tx: TransactionResponse): Transaction {
  const occurred = new Date(tx.occurredAt);

  return {
    id: tx.id,
    date: occurred.toLocaleDateString(),
    time: occurred.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    details: tx.description || tx.referenceNumber,
    reference: tx.referenceNumber,
    category: ENTRY_TYPE_LABEL[tx.entryType] ?? tx.entryType,
    source: tx.paymentProviderDisplayName ?? "--",
    sourceTone: "neutral",
    status: tx.kraStatus ?? "--",
    statusTone: KRA_STATUS_TONE[tx.kraStatus ?? ""] ?? "neutral",
    amount: `KSh ${tx.amount.toLocaleString()}`,
    isNegative: tx.direction === "OUTFLOW",
  };
}
