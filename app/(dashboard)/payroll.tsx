import { CheckCircle2, Send } from "lucide-react-native";
import { useCallback, useState } from "react";
import { ScrollView, StatusBar, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ErrorBanner } from "@/components/auth/AuthUI";
import { useNotificationItems } from "@/hooks/useNotificationItems";
import {
  createPayrollRun,
  generatePayrollEntries,
  getPayrollRuns,
} from "@/services/dashboardDataService";
import { useAuthStore } from "@/store/authStore";
import { PayrollEntryResponse, PayrollRunResponse } from "@/types/employee";
import { ksh } from "@/utils/dashboardStats";
import { apiError, headerProps } from "@/utils/header";
import { useFocusEffect } from "expo-router";
import {
  AlertBanner,
  AppHeader,
  BottomNav,
  DataCard,
  DataRow,
  FilterChips,
  GRADIENT_FOREST,
  GradientStatCard,
  InfoRow,
  NAV_CLEARANCE,
  PageTitle,
  PillRow,
  PrimaryButton,
  SearchModal,
  SearchTrigger,
  SectionHeading,
  SelectorPill,
  showToast,
  SPACE_3,
  SPACE_4,
  StatCard,
  SURFACE,
  ToastHost,
  type SearchItem,
} from "../../components/dashboard/dashboardUI";

/* Payroll — the month's payroll run, statutory deductions and the employee
   register with per-person net pay. */

const STATUS_FILTERS = ["All", "Paid", "Pending"];

const FULL_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const monthOf = (iso: string) => {
  const d = new Date(`${iso}T00:00:00`);
  return `${FULL_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};
const isoDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export default function PayrollScreen() {
  const user = useAuthStore((s) => s.user);
  const notifications = useNotificationItems();
  const [runs, setRuns] = useState<PayrollRunResponse[]>([]);
  const [monthSel, setMonthSel] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchVisible, setSearchVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const r = await getPayrollRuns();
      setRuns([...r].sort((a, b) => b.payoutDate.localeCompare(a.payoutDate)));
      setError(null);
    } catch (e) {
      setError(apiError(e, "Failed to load payroll"));
    }
  }, []);
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const run =
    (monthSel
      ? runs.find((r) => monthOf(r.payoutDate) === monthSel)
      : undefined) ??
    runs[0] ??
    null;
  const month = run ? monthOf(run.payoutDate) : "No payroll run";
  const entries = run?.entries ?? [];
  const sumOf = (f: (e: PayrollEntryResponse) => number) =>
    entries.reduce((s, e) => s + f(e), 0);
  const gross = sumOf((e) => e.grossPay);
  const net = sumOf((e) => e.netPay);
  const paye = sumOf((e) => e.payeDeduction);
  const nssf = sumOf((e) => e.nssfDeduction);
  const sha = sumOf((e) => e.shaDeduction);
  const deductions = paye + nssf + sha;
  const pending = entries.filter((e) => e.status === "PENDING").length;

  const shown = entries.filter(
    (e) => statusFilter === "All" || e.status === statusFilter.toUpperCase(),
  );
  const searchData: SearchItem[] = entries.map((e) => ({
    id: e.id,
    title: e.employeeName,
    subtitle: `Net KSh ${ksh(e.netPay)}`,
  }));
  const monthOptions = [...new Set(runs.map((r) => monthOf(r.payoutDate)))];

  const handleRun = async () => {
    if (busy) return;
    const today = new Date();
    const current = `${FULL_MONTHS[today.getMonth()]} ${today.getFullYear()}`;
    if (runs.some((r) => monthOf(r.payoutDate) === current))
      return showToast(`A ${current} run already exists`);
    setBusy(true);
    try {
      const created = await createPayrollRun({
        payoutDate: isoDate(
          new Date(today.getFullYear(), today.getMonth() + 1, 0),
        ),
      });
      await generatePayrollEntries(created.id);
      await load();
      setMonthSel(null);
      showToast("Payroll run created");
    } catch (e) {
      showToast(apiError(e, "Could not run payroll"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: SURFACE }}>
      <StatusBar barStyle="dark-content" backgroundColor={SURFACE} />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingTop: SPACE_3,
          paddingBottom: NAV_CLEARANCE,
        }}
        showsVerticalScrollIndicator={false}
      >
        <AppHeader {...headerProps(user)} notifications={notifications} />

        <PillRow>
          {monthOptions.length > 0 && (
            <SelectorPill
              label={month}
              options={monthOptions}
              onSelect={setMonthSel}
            />
          )}
          <SearchTrigger onPress={() => setSearchVisible(true)} />
        </PillRow>

        <PageTitle
          title="Payroll"
          subtitle={`${month} · ${entries.length} employees`}
        />
        {!!error && <ErrorBanner message={error} />}

        <View className="px-4">
          {pending > 0 && (
            <AlertBanner
              tone="warning"
              title={`${pending} employees not yet paid`}
              description="Net pay has been computed but no payment has been released."
              actionLabel="Release payments"
              onAction={() => showToast("Payment release coming soon")}
            />
          )}

          <GradientStatCard
            title={`${month} Payroll Run`}
            badgeLabel={run?.status ?? "—"}
            value={`KSh ${ksh(gross)}`}
            helper={`Gross pay across ${entries.length} employees, before statutory deductions`}
            rows={[
              { label: "Net pay", value: `KSh ${ksh(net)}` },
              {
                label: "Statutory deductions",
                value: `KSh ${ksh(deductions)}`,
              },
            ]}
            actionLabel="Export payslips"
            onAction={() => showToast("Preparing payslips…")}
            colors={GRADIENT_FOREST}
          />

          <StatCard
            title="Statutory Deductions"
            badgeLabel="Filed separately"
            badgeTone="warning"
            value={`KSh ${ksh(deductions)}`}
            helper={`PAYE, NSSF and SHA for ${month}`}
            footerStats={[
              { label: "PAYE", value: ksh(paye) },
              { label: "NSSF", value: ksh(nssf) },
              { label: "SHA", value: ksh(sha) },
            ]}
          />

          <DataCard
            title="Deduction Breakdown"
            subtitle="Employee deductions for the run"
          >
            <DataRow
              label="PAYE"
              detail="Pay-as-you-earn, filed with KRA"
              value={`KSh ${ksh(paye)}`}
              first
            />
            <DataRow
              label="NSSF"
              detail="National Social Security Fund"
              value={`KSh ${ksh(nssf)}`}
            />
            <DataRow
              label="SHA"
              detail="Social Health Authority"
              value={`KSh ${ksh(sha)}`}
            />
            <DataRow label="Total" value={`KSh ${ksh(deductions)}`} emphasis />
          </DataCard>

          <View style={{ marginBottom: SPACE_4 }}>
            <PrimaryButton
              label="Run payroll"
              icon={<Send size={16} color="#FFFFFF" />}
              onPress={handleRun}
              colors={GRADIENT_FOREST}
            />
          </View>

          <SectionHeading
            title="Employee Register"
            subtitle={`${shown.length} shown · net pay for ${month}`}
          />
          <FilterChips
            options={STATUS_FILTERS}
            value={statusFilter}
            onChange={setStatusFilter}
          />

          {shown.map((e) => (
            <InfoRow
              key={e.id}
              initials={e.employeeName
                .split(" ")
                .map((w) => w[0])
                .slice(0, 2)
                .join("")}
              title={e.employeeName}
              subtitle={`Gross KSh ${ksh(e.grossPay)} · net KSh ${ksh(e.netPay)}`}
              trailingLabel={e.status === "PAID" ? "Paid" : "Pending"}
              trailingTone={e.status === "PAID" ? "positive" : "warning"}
              onPress={() =>
                showToast(`${e.employeeName} · payslip coming soon`)
              }
            />
          ))}

          <View style={{ marginTop: SPACE_3 }}>
            <PrimaryButton
              label="Mark all as paid"
              icon={<CheckCircle2 size={16} color="#FFFFFF" />}
              onPress={() => showToast("Payment sending coming soon")}
              colors={GRADIENT_FOREST}
            />
          </View>
        </View>
      </ScrollView>

      <BottomNav />
      <SearchModal
        visible={searchVisible}
        onClose={() => setSearchVisible(false)}
        data={searchData}
        placeholder="Search employees…"
        onSelect={(item) => showToast(item.title)}
      />
      <ToastHost />
    </SafeAreaView>
  );
}
