import type { InvoiceResponse } from "@/types/sales";
import type { Invoice } from "../components/dashboard/dashboardUI";
import { fmtDate, ksh } from "./dashboardStats";

export type InvoiceView = {
  row: Invoice;
  status: "pending" | "overdue" | "paid";
  daysOverdue: number;
  amount: number;
  customerId: string | null;
  createdAt: string;
};

export function toInvoiceView(inv: InvoiceResponse, now: Date): InvoiceView {
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  const due = new Date(`${inv.dueDate}T00:00:00`);
  const diff = Math.round((due.getTime() - startOfToday.getTime()) / 864e5); // + = days left

  const status: InvoiceView["status"] =
    inv.status === "PAID" ? "paid" : diff < 0 ? "overdue" : "pending";

  const statusLabel =
    status === "paid"
      ? `Settled ${inv.paidAt ? fmtDate(new Date(inv.paidAt)) : ""}`.trim()
      : status === "overdue"
        ? `${-diff} day${-diff > 1 ? "s" : ""} overdue`
        : diff === 0
          ? "Due today"
          : `Due in ${diff} day${diff > 1 ? "s" : ""}`;

  return {
    status,
    daysOverdue: status === "overdue" ? -diff : 0,
    amount: inv.totalAmount,
    customerId: inv.customerId,
    createdAt: inv.createdAt,
    row: {
      id: inv.id,
      customer: inv.customerName ?? "Unknown customer",
      reference: inv.invoiceNumber,
      dueDate: fmtDate(due),
      statusLabel,
      amount: `KSh ${ksh(inv.totalAmount)}`,
      status,
    },
  };
}
