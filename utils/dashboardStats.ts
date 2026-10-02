import type {
  NotificationResponse,
  TransactionResponse,
} from "@/types/dashboard";
import type { NotificationItem } from "../components/dashboard/dashboardUI";

export type Range = { start: Date; end: Date };
export const RANGE_OPTIONS = ["Today", "This Week", "This Month", "Last Month"];

export function getRange(label: string, now = new Date()): Range {
  const y = now.getFullYear(),
    m = now.getMonth();
  const today = new Date(y, m, now.getDate());
  switch (label) {
    case "Today":
      return {
        start: today,
        end: new Date(y, m, now.getDate() + 1, 0, 0, 0, -1),
      };
    case "This Week": {
      const start = new Date(today);
      start.setDate(start.getDate() - ((today.getDay() + 6) % 7)); // Monday
      return {
        start,
        end: new Date(
          start.getFullYear(),
          start.getMonth(),
          start.getDate() + 7,
          0,
          0,
          0,
          -1,
        ),
      };
    }
    case "Last Month":
      return {
        start: new Date(y, m - 1, 1),
        end: new Date(y, m, 1, 0, 0, 0, -1),
      };
    default:
      return {
        start: new Date(y, m, 1),
        end: new Date(y, m + 1, 1, 0, 0, 0, -1),
      };
  }
}

export function previousRange({ start, end }: Range): Range {
  const len = end.getTime() - start.getTime() + 1;
  return {
    start: new Date(start.getTime() - len),
    end: new Date(start.getTime() - 1),
  };
}

export const inRange = (tx: TransactionResponse, r: Range) => {
  const t = new Date(tx.occurredAt).getTime();
  return t >= r.start.getTime() && t <= r.end.getTime();
};

export const sum = (txs: TransactionResponse[]) =>
  txs.reduce((s, t) => s + t.amount, 0);
export const byType = (txs: TransactionResponse[], type: "SALE" | "EXPENSE") =>
  txs.filter((t) => t.entryType === type);

export const ksh = (n: number) =>
  Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");

export const pctChange = (cur: number, prev: number) =>
  prev === 0 ? null : ((cur - prev) / prev) * 100;

// Assumes sale amounts are VAT-inclusive. Change if they're not.
export const estimateVat = (salesTotal: number) => (salesTotal * 0.16) / 1.16;

export function unfiledSales(txs: TransactionResponse[]) {
  const open = byType(txs, "SALE").filter((t) => t.kraStatus !== "COMPLIANT");
  return { count: open.length, total: sum(open) };
}

// VAT is due on the 20th of the month after the period ends.
export const vatDeadline = (r: Range) =>
  new Date(r.end.getFullYear(), r.end.getMonth() + 1, 20);

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
export const fmtDate = (d: Date) =>
  `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
export const fmtRange = (r: Range) => `${fmtDate(r.start)} – ${fmtDate(r.end)}`;

export function timeAgo(iso: string) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

// Adjust keys to your real Severity enum values.
const TONE: Record<string, NotificationItem["tone"]> = {
  INFO: "positive",
  WARNING: "warning",
  CRITICAL: "danger",
};
export const toNotificationItem = (
  n: NotificationResponse,
): NotificationItem => ({
  id: n.id,
  title: n.message,
  time: timeAgo(n.createdAt),
  tone: TONE[n.severity] ?? "warning",
});

export function getPeriodRange(period: string, now: Date): Range {
  const y = now.getFullYear(),
    m = now.getMonth();
  if (period === "W") return getRange("This Week", now);
  if (period === "Q") {
    const q = Math.floor(m / 3) * 3;
    return {
      start: new Date(y, q, 1),
      end: new Date(y, q + 3, 1, 0, 0, 0, -1),
    };
  }
  if (period === "Y")
    return {
      start: new Date(y, 0, 1),
      end: new Date(y + 1, 0, 1, 0, 0, 0, -1),
    };
  return getRange("This Month", now);
}


