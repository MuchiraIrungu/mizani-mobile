// Formatting shared by every screen — money in KSh, dates in en-KE.

export function ksh(value: number | string | null | undefined, opts: { decimals?: boolean } = {}): string {
  const n = Number(value ?? 0);
  const safe = Number.isFinite(n) ? n : 0;
  return `KSh ${safe.toLocaleString("en-KE", {
    minimumFractionDigits: opts.decimals ? 2 : 0,
    maximumFractionDigits: opts.decimals ? 2 : 0,
  })}`;
}

/** 1.28M / 412K — for tight stat footers. */
export function compactKsh(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `KSh ${(value / 1_000_000).toFixed(abs >= 10_000_000 ? 0 : 1)}M`;
  if (abs >= 1_000) return `KSh ${(value / 1_000).toFixed(abs >= 100_000 ? 0 : 1)}K`;
  return ksh(value);
}

export function shortDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
}

export function timeOf(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" });
}

/** "Just now", "20 min ago", "Yesterday", "3 days ago", then a date. */
export function relativeTime(iso: string | null | undefined): string {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.round(diff / 60000);
  if (min < 1) return "Just now";
  if (min < 60) return `${min} min ago`;
  const hours = Math.round(min / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return shortDate(iso);
}

/** Whole days from today until `iso` (negative when it's past). */
export function daysUntil(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(iso);
  d.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - today.getTime()) / 86400000);
}

/** YYYY-MM-DD for LocalDate fields. */
export function isoDate(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function titleCase(s: string | null | undefined): string {
  if (!s) return "";
  return s
    .toLowerCase()
    .split(/[_\s]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function sum<T>(items: T[], pick: (item: T) => number | null | undefined): number {
  return items.reduce((acc, item) => acc + Number(pick(item) ?? 0), 0);
}
