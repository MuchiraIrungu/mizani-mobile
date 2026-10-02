import type { User } from "@/types/auth";

export const headerProps = (u: User | null | undefined) => ({
  initials: `${u?.firstName?.[0] ?? ""}${u?.lastName?.[0] ?? ""}` || "??",
  name: `${u?.firstName ?? ""} ${u?.lastName ?? ""}`.trim(),
  role: u?.roleName ?? "",
});

export const apiError = (err: unknown, fallback: string) =>
  (err as any)?.response?.data?.message ??
  (err instanceof Error ? err.message : fallback);
