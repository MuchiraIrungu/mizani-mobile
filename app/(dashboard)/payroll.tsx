import { CheckCircle2, Send } from "lucide-react-native";
import { useState } from "react";
import { ScrollView, StatusBar, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  AlertBanner,
  AppHeader,
  BottomNav,
  DataCard,
  DataRow,
  FilterChips,
  GRADIENT_VIOLET,
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
  type NotificationItem,
  type SearchItem,
} from "../../components/dashboard/dashboardUI";

/* Payroll — the month's payroll run, statutory deductions and the employee
   register with per-person net pay. */

type Employee = {
  id: string;
  name: string;
  role: string;
  net: string;
  status: "paid" | "pending";
};

const EMPLOYEES: Employee[] = [
  {
    id: "1",
    name: "Grace Achieng",
    role: "Branch supervisor · KSh 78,000 gross",
    net: "KSh 61,420",
    status: "paid",
  },
  {
    id: "2",
    name: "Peter Kimani",
    role: "Store keeper · KSh 46,000 gross",
    net: "KSh 38,910",
    status: "paid",
  },
  {
    id: "3",
    name: "Amina Hassan",
    role: "Till attendant · KSh 34,000 gross",
    net: "KSh 29,480",
    status: "paid",
  },
  {
    id: "4",
    name: "Joseph Otieno",
    role: "Driver · KSh 32,000 gross",
    net: "KSh 27,940",
    status: "pending",
  },
  {
    id: "5",
    name: "Mercy Wairimu",
    role: "Accounts clerk · KSh 52,000 gross",
    net: "KSh 43,180",
    status: "pending",
  },
];

const DEDUCTIONS = [
  { label: "PAYE", detail: "Pay-as-you-earn, filed with KRA", value: "KSh 74,532" },
  { label: "NSSF", detail: "Tier I & II employee + employer", value: "KSh 21,600" },
  { label: "SHIF", detail: "2.75% of gross pay", value: "KSh 13,255" },
  { label: "Housing Levy", detail: "1.5% of gross pay", value: "KSh 7,230" },
];

const STATUS_FILTERS = ["All", "Paid", "Pending"];

const NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    title: "PAYE return for August is due on 9 Sep",
    time: "Today, 08:00",
    tone: "warning",
  },
  {
    id: "2",
    title: "2 employees are still awaiting payment",
    time: "Yesterday",
    tone: "danger",
  },
];

const SEARCH_DATA: SearchItem[] = EMPLOYEES.map((e) => ({
  id: e.id,
  title: e.name,
  subtitle: e.role,
}));

export default function PayrollScreen() {
  const [month, setMonth] = useState("August 2026");
  const [branch, setBranch] = useState("Nairobi Branch");
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchVisible, setSearchVisible] = useState(false);

  const employees = EMPLOYEES.filter((e) =>
    statusFilter === "All" ? true : e.status === statusFilter.toLowerCase(),
  );
  const pending = EMPLOYEES.filter((e) => e.status === "pending").length;

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
        <AppHeader
          initials="WM"
          name="Wanjiku Mwangi"
          role="Owner · Mizani Trading Co."
          notifications={NOTIFICATIONS}
        />

        <PillRow>
          <SelectorPill
            label={branch}
            options={[
              "Nairobi Branch",
              "Mombasa Branch",
              "Kisumu Branch",
              "All Branches",
            ]}
            onSelect={setBranch}
          />
          <SelectorPill
            label={month}
            options={["June 2026", "July 2026", "August 2026"]}
            onSelect={setMonth}
          />
          <SearchTrigger onPress={() => setSearchVisible(true)} />
        </PillRow>

        <PageTitle
          title="Payroll"
          subtitle={`${branch} · ${month} · ${EMPLOYEES.length} employees`}
        />

        <View className="px-4">
          {pending > 0 && (
            <AlertBanner
              tone="warning"
              title={`${pending} employees not yet paid`}
              description="Their August net pay has been computed but no payment has been released. PAYE for the month is due on 9 Sep 2026."
              actionLabel="Release payments"
              onAction={() => showToast("Payment release coming soon")}
            />
          )}

          <GradientStatCard
            title="August Payroll Run"
            badgeLabel="Due 9 Sep"
            value="KSh 402,150"
            helper="Gross pay across 5 employees, before statutory deductions"
            rows={[
              { label: "Net pay", value: "KSh 200,930" },
              { label: "Statutory deductions", value: "KSh 116,617" },
              { label: "Employer contributions", value: "KSh 84,603" },
            ]}
            actionLabel="Export payslips"
            onAction={() => showToast("Preparing payslips…")}
            colors={GRADIENT_VIOLET}
          />

          <StatCard
            title="Statutory Deductions"
            badgeLabel="Filed separately"
            badgeTone="warning"
            value="KSh 116,617"
            helper="PAYE, NSSF, SHIF and the housing levy for August 2026"
            footerStats={[
              { label: "PAYE", value: "74,532" },
              { label: "NSSF", value: "21,600" },
              { label: "SHIF", value: "13,255" },
            ]}
          />

          <DataCard
            title="Deduction Breakdown"
            subtitle="Employee and employer portions combined"
          >
            {DEDUCTIONS.map((d, i) => (
              <DataRow
                key={d.label}
                label={d.label}
                detail={d.detail}
                value={d.value}
                first={i === 0}
              />
            ))}
            <DataRow label="Total" value="KSh 116,617" emphasis />
          </DataCard>

          <View style={{ marginBottom: SPACE_4 }}>
            <PrimaryButton
              label="Run September payroll"
              icon={<Send size={16} color="#FFFFFF" />}
              onPress={() => showToast("Payroll run coming soon")}
              colors={GRADIENT_VIOLET}
            />
          </View>

          <SectionHeading
            title="Employee Register"
            subtitle={`${employees.length} shown · net pay for ${month}`}
          />

          <FilterChips
            options={STATUS_FILTERS}
            value={statusFilter}
            onChange={setStatusFilter}
          />

          {employees.map((e) => (
            <InfoRow
              key={e.id}
              initials={e.name
                .split(" ")
                .map((w) => w[0])
                .slice(0, 2)
                .join("")}
              title={e.name}
              subtitle={`${e.role} · net ${e.net}`}
              trailingLabel={e.status === "paid" ? "Paid" : "Pending"}
              trailingTone={e.status === "paid" ? "positive" : "warning"}
              onPress={() => showToast(`${e.name} · payslip coming soon`)}
            />
          ))}

          <View style={{ marginTop: SPACE_3 }}>
            <PrimaryButton
              label="Mark all as paid"
              icon={<CheckCircle2 size={16} color="#FFFFFF" />}
              onPress={() => showToast("Marked all employees as paid")}
              colors={GRADIENT_VIOLET}
            />
          </View>
        </View>
      </ScrollView>

      <BottomNav />

      <SearchModal
        visible={searchVisible}
        onClose={() => setSearchVisible(false)}
        data={SEARCH_DATA}
        placeholder="Search employees…"
        onSelect={(item) => showToast(item.title)}
      />

      <ToastHost />
    </SafeAreaView>
  );
}
