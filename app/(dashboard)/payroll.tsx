import { CalendarPlus, CheckCircle2, Pencil, Send, Trash2, UserPlus, Users, Wallet } from "lucide-react-native";
import { useMemo, useState } from "react";
import { View } from "react-native";

import {
  ActionSheet,
  Appear,
  ConfirmSheet,
  EmptyState,
  ErrorState,
  FormSheet,
  LoadingState,
  type FormValues,
  type RowAction,
} from "../../components/dashboard/crud";
import {
  AlertBanner,
  DataCard,
  DataRow,
  FilterChips,
  GRADIENT_FOREST,
  GradientStatCard,
  GREEN,
  GhostPillButton,
  InfoRow,
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
  TEXT_SECONDARY,
  type SearchItem,
} from "../../components/dashboard/dashboardUI";
import { Body, Screen } from "../../components/dashboard/Screen";
import { useResource } from "../../hooks/useResource";
import { apiError } from "../../services/api";
import { employeeApi, payrollApi } from "../../services/resources";
import { initialsOf } from "../../store/authStore";
import type { Employee, PayrollEntry, PayrollRun } from "../../types/api";
import { daysUntil, isoDate, ksh, shortDate, sum } from "../../utils/format";

/* Payroll — employee register plus payroll runs: create a run, generate
   each employee's entry (gross → PAYE/NSSF/SHA → net), pay entries and
   complete the run. */

const STATUS_FILTERS = ["All", "Paid", "Pending", "Not in run"];

const runLabel = (r: PayrollRun) =>
  `${new Date(r.payoutDate).toLocaleDateString("en-KE", { month: "long", year: "numeric" })} · ${shortDate(r.payoutDate)}`;

/** Last working day of next month — a sensible default payout date. */
function nextPayoutDate(): string {
  const d = new Date();
  d.setMonth(d.getMonth() + 1, 0);
  while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() - 1);
  return isoDate(d);
}

export default function PayrollScreen() {
  const employees = useResource<Employee[]>(() => employeeApi.list(), []);
  const runs = useResource<PayrollRun[]>(async () => {
    const list = await payrollApi.listRuns();
    return [...list].sort((a, b) => b.payoutDate.localeCompare(a.payoutDate));
  }, []);
  const [runId, setRunId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchVisible, setSearchVisible] = useState(false);
  const [busy, setBusy] = useState(false);

  const [employeeForm, setEmployeeForm] = useState<{ employee?: Employee } | null>(null);
  const [runFormOpen, setRunFormOpen] = useState(false);
  const [employeeActions, setEmployeeActions] = useState<Employee | null>(null);
  const [removing, setRemoving] = useState<Employee | null>(null);
  const [confirmPayAll, setConfirmPayAll] = useState(false);

  const run = runs.data.find((r) => r.id === runId) ?? runs.data[0] ?? null;
  const entries = useMemo(() => run?.entries ?? [], [run]);
  const entryFor = useMemo(() => {
    const m = new Map<string, PayrollEntry>();
    entries.forEach((e) => m.set(e.employeeId, e));
    return m;
  }, [entries]);

  const pendingEntries = entries.filter((e) => e.status === "PENDING");
  const gross = sum(entries, (e) => e.grossPay);
  const net = sum(entries, (e) => e.netPay);
  const paye = sum(entries, (e) => e.payeDeduction);
  const nssf = sum(entries, (e) => e.nssfDeduction);
  const sha = sum(entries, (e) => e.shaDeduction);
  const deductions = paye + nssf + sha;
  const dueIn = daysUntil(run?.payoutDate);

  const statusOf = (e: Employee) => {
    const entry = entryFor.get(e.id);
    return !entry ? "Not in run" : entry.status === "PAID" ? "Paid" : "Pending";
  };
  const shownEmployees = employees.data.filter((e) => statusFilter === "All" || statusOf(e) === statusFilter);

  const searchData: SearchItem[] = employees.data.map((e) => ({
    id: e.id,
    title: e.name,
    subtitle: [e.roleTitle, `net ${ksh(e.standardNetPay)}`, statusOf(e)].filter(Boolean).join(" · "),
  }));

  const replaceRun = (updated: PayrollRun) =>
    runs.setData((list) => {
      const exists = list.some((r) => r.id === updated.id);
      const next = exists ? list.map((r) => (r.id === updated.id ? updated : r)) : [updated, ...list];
      return next.sort((a, b) => b.payoutDate.localeCompare(a.payoutDate));
    });

  /** Re-read the run so totals and auto-completion reflect the server. */
  const refreshRun = async (id: string) => replaceRun(await payrollApi.getRun(id));

  const saveEmployee = async (v: FormValues) => {
    const body = {
      name: String(v.name).trim(),
      roleTitle: String(v.roleTitle || "").trim() || undefined,
      phone: String(v.phone || "").trim() || undefined,
      standardNetPay: Number(v.standardNetPay),
    };
    if (employeeForm?.employee) {
      const updated = await employeeApi.update(employeeForm.employee.id, body);
      employees.setData((list) => list.map((e) => (e.id === updated.id ? updated : e)));
      showToast(`${updated.name} updated`);
    } else {
      const created = await employeeApi.create(body);
      employees.setData((list) => [...list, created].sort((a, b) => a.name.localeCompare(b.name)));
      showToast(`${created.name} added`);
    }
    setEmployeeForm(null);
  };

  const createRun = async (v: FormValues) => {
    const created = await payrollApi.createRun(String(v.payoutDate));
    // Fill the run straight away so it's ready to pay
    const filled = employees.data.length ? await payrollApi.generateEntries(created.id) : created;
    replaceRun(filled);
    setRunId(filled.id);
    showToast(`Payroll run for ${shortDate(filled.payoutDate)} created`);
    setRunFormOpen(false);
  };

  const withBusy = async (fn: () => Promise<void>, failure: string) => {
    if (busy) return;
    setBusy(true);
    try {
      await fn();
    } catch (err) {
      showToast(apiError(err, failure));
    } finally {
      setBusy(false);
    }
  };

  const generateEntries = () =>
    withBusy(async () => {
      if (!run) return;
      replaceRun(await payrollApi.generateEntries(run.id));
      showToast("Entries generated for every employee");
    }, "Couldn't generate entries");

  const payEntry = (entry: PayrollEntry) =>
    withBusy(async () => {
      await payrollApi.payEntry(entry.id);
      if (run) await refreshRun(run.id);
      showToast(`${entry.employeeName} paid ${ksh(entry.netPay)}`);
    }, "Couldn't pay this employee");

  const payAll = async () => {
    if (!run) return;
    for (const entry of pendingEntries) {
      await payrollApi.payEntry(entry.id);
    }
    await refreshRun(run.id);
    showToast(`${pendingEntries.length} employees paid`);
    setConfirmPayAll(false);
  };

  const completeRun = () =>
    withBusy(async () => {
      if (!run) return;
      replaceRun(await payrollApi.completeRun(run.id));
      showToast("Payroll run completed");
    }, "Couldn't complete the run");

  const employeeActionList = (e: Employee): RowAction[] => {
    const entry = entryFor.get(e.id);
    return [
      ...(entry && entry.status === "PENDING"
        ? [{ label: `Pay ${ksh(entry.netPay)}`, tone: "positive" as const, icon: (c: string) => <Wallet size={17} color={c} />, onPress: () => payEntry(entry) }]
        : []),
      { label: "Edit employee", icon: (c) => <Pencil size={17} color={c} />, onPress: () => setEmployeeForm({ employee: e }) },
      { label: "Remove employee", tone: "danger", icon: (c) => <Trash2 size={17} color={c} />, onPress: () => setRemoving(e) },
    ];
  };

  return (
    <Screen
      refreshing={employees.refreshing || runs.refreshing}
      onRefresh={() => {
        employees.refresh();
        runs.refresh();
      }}
      overlays={
        <>
          <SearchModal
            visible={searchVisible}
            onClose={() => setSearchVisible(false)}
            data={searchData}
            placeholder="Search employees…"
            onSelect={(item) => setEmployeeActions(employees.data.find((e) => e.id === item.id) ?? null)}
          />
          <FormSheet
            visible={!!employeeForm}
            title={employeeForm?.employee ? "Edit employee" : "Add employee"}
            subtitle={employeeForm?.employee?.name ?? "PAYE, NSSF and SHA are worked out from their pay on each run."}
            fields={[
              { key: "name", label: "Full name", required: true, placeholder: "e.g. Brian Otieno" },
              { key: "roleTitle", label: "Job title", placeholder: "e.g. Cashier" },
              { key: "phone", label: "Phone (for M-Pesa payouts)", type: "phone", placeholder: "07XX XXX XXX" },
              { key: "standardNetPay", label: "Monthly pay (KSh)", type: "number", required: true, min: 1 },
            ]}
            initialValues={
              employeeForm?.employee
                ? {
                    name: employeeForm.employee.name,
                    roleTitle: employeeForm.employee.roleTitle ?? "",
                    phone: employeeForm.employee.phone ?? "",
                    standardNetPay: String(employeeForm.employee.standardNetPay),
                  }
                : undefined
            }
            submitLabel={employeeForm?.employee ? "Save changes" : "Add employee"}
            onSubmit={saveEmployee}
            onClose={() => setEmployeeForm(null)}
          />
          <FormSheet
            visible={runFormOpen}
            title="New payroll run"
            subtitle={`Creates an entry for each of your ${employees.data.length} employees.`}
            fields={[{ key: "payoutDate", label: "Payout date", type: "date", required: true }]}
            initialValues={{ payoutDate: nextPayoutDate() }}
            submitLabel="Create run"
            onSubmit={createRun}
            onClose={() => setRunFormOpen(false)}
          />
          <ActionSheet
            visible={!!employeeActions}
            title={employeeActions?.name ?? ""}
            subtitle={employeeActions ? `${employeeActions.roleTitle ?? "Employee"} · ${statusOf(employeeActions)}` : undefined}
            onClose={() => setEmployeeActions(null)}
            actions={employeeActions ? employeeActionList(employeeActions) : []}
          />
          <ConfirmSheet
            visible={!!removing}
            title="Remove employee?"
            message={`${removing?.name ?? "This employee"} will be removed from the register. Employees with past payroll entries are kept for your records.`}
            confirmLabel="Remove"
            onConfirm={async () => {
              if (!removing) return;
              await employeeApi.remove(removing.id);
              employees.setData((list) => list.filter((e) => e.id !== removing.id));
              showToast(`${removing.name} removed`);
              setRemoving(null);
            }}
            onClose={() => setRemoving(null)}
          />
          <ConfirmSheet
            visible={confirmPayAll}
            title={`Pay ${pendingEntries.length} employees?`}
            message={`Marks ${ksh(sum(pendingEntries, (e) => e.netPay))} of net pay as paid and records it in your books.`}
            confirmLabel="Pay all"
            tone="primary"
            onConfirm={payAll}
            onClose={() => setConfirmPayAll(false)}
          />
        </>
      }
    >
      <PillRow>
        {runs.data.length > 0 && (
          <SelectorPill
            label={run ? runLabel(run) : "Payroll run"}
            options={runs.data.map(runLabel)}
            onSelect={(label) => setRunId(runs.data.find((r) => runLabel(r) === label)?.id ?? null)}
          />
        )}
        <SearchTrigger onPress={() => setSearchVisible(true)} />
      </PillRow>

      <PageTitle
        title="Payroll"
        subtitle={`${employees.data.length} employees${run ? ` · ${run.status === "COMPLETED" ? "completed" : "open"} run for ${shortDate(run.payoutDate)}` : " · no payroll run yet"}`}
      />

      <Body>
        {(employees.error || runs.error) && (
          <ErrorState
            message={employees.error || runs.error || ""}
            onRetry={() => {
              employees.refresh();
              runs.refresh();
            }}
          />
        )}

        {employees.loading || runs.loading ? (
          <LoadingState />
        ) : (
          <>
            {run && pendingEntries.length > 0 && (
              <Appear index={0}>
                <AlertBanner
                  tone="warning"
                  title={`${pendingEntries.length} employee${pendingEntries.length === 1 ? "" : "s"} not yet paid`}
                  description={`Net pay for this run has been worked out but not released.${dueIn !== null ? ` Payout ${dueIn < 0 ? `was due ${-dueIn} days ago` : dueIn === 0 ? "is due today" : `is due in ${dueIn} days`}.` : ""}`}
                  actionLabel="Pay everyone"
                  onAction={() => setConfirmPayAll(true)}
                />
              </Appear>
            )}

            {run ? (
              <>
                <Appear index={1}>
                  <GradientStatCard
                    title={`${new Date(run.payoutDate).toLocaleDateString("en-KE", { month: "long" })} Payroll Run`}
                    badgeLabel={run.status === "COMPLETED" ? "Completed" : `Pay by ${shortDate(run.payoutDate)}`}
                    value={ksh(gross)}
                    helper={`Gross pay across ${entries.length} employees, before statutory deductions`}
                    rows={[
                      { label: "Net pay", value: ksh(net) },
                      { label: "Statutory deductions", value: ksh(deductions) },
                      { label: "Paid so far", value: ksh(sum(entries.filter((e) => e.status === "PAID"), (e) => e.netPay)) },
                    ]}
                    actionLabel={
                      entries.length === 0 ? "Generate entries" : run.status === "PENDING" && pendingEntries.length === 0 ? "Complete run" : undefined
                    }
                    onAction={entries.length === 0 ? generateEntries : completeRun}
                    colors={GRADIENT_FOREST}
                  />
                </Appear>

                <Appear index={2}>
                  <StatCard
                    title="Statutory Deductions"
                    badgeLabel="Filed separately"
                    badgeTone="warning"
                    value={ksh(deductions)}
                    helper="PAYE, NSSF and SHA withheld this run"
                    footerStats={[
                      { label: "PAYE", value: paye.toLocaleString("en-KE") },
                      { label: "NSSF", value: nssf.toLocaleString("en-KE") },
                      { label: "SHA", value: sha.toLocaleString("en-KE") },
                    ]}
                  />
                </Appear>

                <Appear index={3}>
                  <DataCard title="Deduction Breakdown" subtitle="Employee portions for this run">
                    <DataRow label="PAYE" detail="Pay-as-you-earn, filed with KRA" value={ksh(paye)} first />
                    <DataRow label="NSSF" detail="Tier I & II" value={ksh(nssf)} />
                    <DataRow label="SHA" detail="Social Health Authority" value={ksh(sha)} />
                    <DataRow label="Total" value={ksh(deductions)} emphasis />
                  </DataCard>
                </Appear>
              </>
            ) : (
              <EmptyState
                icon={<CalendarPlus size={24} color={GREEN} />}
                title="No payroll runs yet"
                message="Create a run to work out each employee's pay, deductions and net amount."
                actionLabel={employees.data.length ? "Create payroll run" : undefined}
                onAction={() => setRunFormOpen(true)}
              />
            )}

            <Appear index={4} style={{ marginBottom: SPACE_3 }}>
              <PrimaryButton
                label="New payroll run"
                icon={<Send size={16} color="#FFFFFF" />}
                onPress={() => (employees.data.length ? setRunFormOpen(true) : showToast("Add an employee first"))}
                colors={GRADIENT_FOREST}
              />
            </Appear>
            <View style={{ marginBottom: SPACE_4, alignItems: "flex-start" }}>
              <GhostPillButton
                label="Add employee"
                icon={<UserPlus size={14} color={TEXT_SECONDARY} />}
                onPress={() => setEmployeeForm({})}
              />
            </View>

            <SectionHeading
              title="Employee Register"
              subtitle={`${shownEmployees.length} shown${run ? ` · ${shortDate(run.payoutDate)} run` : ""}`}
            />
            <FilterChips options={STATUS_FILTERS} value={statusFilter} onChange={setStatusFilter} />

            {employees.data.length === 0 ? (
              <EmptyState
                icon={<Users size={24} color={GREEN} />}
                title="No employees yet"
                message="Add your staff with their monthly pay to start running payroll."
                actionLabel="Add an employee"
                onAction={() => setEmployeeForm({})}
              />
            ) : (
              shownEmployees.map((e, i) => {
                const entry = entryFor.get(e.id);
                const status = statusOf(e);
                return (
                  <Appear key={e.id} index={i + 5}>
                    <InfoRow
                      initials={initialsOf(e.name)}
                      title={e.name}
                      subtitle={`${e.roleTitle ?? "Employee"} · net ${ksh(entry?.netPay ?? e.standardNetPay)}`}
                      trailingLabel={status}
                      trailingTone={status === "Paid" ? "positive" : status === "Pending" ? "warning" : "neutral"}
                      onPress={() => setEmployeeActions(e)}
                    />
                  </Appear>
                );
              })
            )}

            {run && pendingEntries.length > 0 && (
              <View style={{ marginTop: SPACE_3 }}>
                <PrimaryButton
                  label={busy ? "Working…" : `Pay all ${pendingEntries.length} pending`}
                  icon={<CheckCircle2 size={16} color="#FFFFFF" />}
                  onPress={() => setConfirmPayAll(true)}
                  colors={GRADIENT_FOREST}
                />
              </View>
            )}
          </>
        )}
      </Body>
    </Screen>
  );
}
