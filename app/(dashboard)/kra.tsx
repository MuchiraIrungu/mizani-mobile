import { Download, RefreshCw } from "lucide-react-native";
import { useState } from "react";
import { ScrollView, StatusBar, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  AlertBanner,
  AppHeader,
  BottomNav,
  DataCard,
  DataRow,
  FONT_REG,
  FONT_SEMI,
  GhostPillButton,
  GRADIENT_AMBER,
  GradientStatCard,
  NAV_CLEARANCE,
  PageTitle,
  PillTabs,
  PrimaryButton,
  SectionHeading,
  showToast,
  SPACE_3,
  SPACE_4,
  StatusPill,
  SURFACE,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  ToastHost,
  type NotificationItem,
} from "../../components/dashboard/dashboardUI";

/* KRA — estimated tax liability for the period and the eTIMS sync state of
   every invoice in it. */

const LIABILITY_ROWS = [
  {
    label: "VAT (16%)",
    detail: "Output tax less input tax on purchases",
    value: "KSh 218,940",
  },
  {
    label: "Turnover Tax",
    detail: "3% on non-VAT branch turnover",
    value: "KSh 25,000",
  },
];

type EtimsInvoice = {
  ref: string;
  date: string;
  customer: string;
  amount: string;
  status: "validated" | "syncing";
};

const ETIMS_INVOICES: EtimsInvoice[] = [
  {
    ref: "INV-2043",
    date: "16 Aug 2026",
    customer: "Sokoni Retail Group",
    amount: "KSh 96,048",
    status: "syncing",
  },
  {
    ref: "INV-2044",
    date: "15 Aug 2026",
    customer: "Mama Njeri Grocers",
    amount: "KSh 18,560",
    status: "syncing",
  },
  {
    ref: "INV-2042",
    date: "15 Aug 2026",
    customer: "Karibu Foods Ltd",
    amount: "KSh 151,728",
    status: "validated",
  },
  {
    ref: "INV-2038",
    date: "12 Aug 2026",
    customer: "Jenga Hardware",
    amount: "KSh 131,776",
    status: "validated",
  },
];

const NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    title: "KRA filing deadline in 5 days",
    time: "1 hour ago",
    tone: "warning",
  },
  {
    id: "2",
    title: "2 invoices awaiting an eTIMS control number",
    time: "Today, 09:12",
    tone: "danger",
  },
];

export default function KRAScreen() {
  const [tab, setTab] = useState("All");

  const invoices = ETIMS_INVOICES.filter((inv) =>
    tab === "All" ? true : inv.status === tab.toLowerCase(),
  );

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

        <PageTitle
          title="KRA"
          subtitle="August 2026 · VAT-3 return · Nairobi Branch"
        />

        <View className="px-4">
          <View style={{ marginBottom: SPACE_4 }}>
            <GhostPillButton
              label="Re-sync eTIMS"
              icon={<RefreshCw size={14} color={TEXT_SECONDARY} />}
              onPress={() => showToast("Re-syncing with eTIMS…")}
            />
          </View>

          <AlertBanner
            tone="danger"
            title="VAT Filing Due"
            description="Your VAT-3 return for August 2026 must be filed by 20 Sep 2026 — 35 days remaining, and 2 invoices still have no control number."
            actionLabel="File now"
            onAction={() => showToast("Filing flow coming soon")}
          />

          <GradientStatCard
            title="Estimated Liability"
            badgeLabel="Due 20 Sep"
            value="KSh 243,940"
            helper="Computed from signed eTIMS invoices for August 2026"
            rows={LIABILITY_ROWS.map((r) => ({
              label: r.label,
              value: r.value,
            }))}
            actionLabel="Export Filing Report"
            onAction={() => showToast("Preparing filing report…")}
            colors={GRADIENT_AMBER}
          />

          <DataCard
            title="Liability Breakdown"
            subtitle="How the total above is computed · Due 20 Sep 2026"
          >
            {LIABILITY_ROWS.map((row, i) => (
              <DataRow
                key={row.label}
                label={row.label}
                detail={row.detail}
                value={row.value}
                first={i === 0}
              />
            ))}
            <DataRow label="Total Due" value="KSh 243,940" emphasis />
            <Text
              className="text-[12px] mt-2 mb-4"
              style={{ color: TEXT_SECONDARY, fontFamily: FONT_REG }}
            >
              PAYE of KSh 74,532 is filed separately with the payroll return.
            </Text>
            <PrimaryButton
              label="Export Filing Report"
              icon={<Download size={16} color="#FFFFFF" />}
              onPress={() => showToast("Preparing filing report…")}
              colors={GRADIENT_AMBER}
            />
          </DataCard>

          <SectionHeading
            title="eTIMS Compliance"
            subtitle={`${ETIMS_INVOICES.length} invoices in this period · 2 still syncing`}
          />

          <PillTabs
            options={["All", "Validated", "Syncing"]}
            value={tab}
            onChange={setTab}
          />

          {invoices.map((inv) => (
            <View
              key={inv.ref}
              className="flex-row items-center justify-between rounded-[12px] p-4 mb-3"
              style={{
                backgroundColor: "#FFFFFF",
                shadowColor: "#0F172A",
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.14,
                shadowRadius: 7,
                elevation: 4,
              }}
            >
              <View className="flex-1 mr-2">
                <Text
                  className="text-[14px] mb-1"
                  style={{ color: TEXT_PRIMARY, fontFamily: FONT_SEMI }}
                >
                  {inv.ref} · {inv.amount}
                </Text>
                <Text
                  className="text-[12px]"
                  style={{ color: TEXT_SECONDARY, fontFamily: FONT_REG }}
                >
                  {inv.date} · {inv.customer}
                </Text>
              </View>
              <StatusPill
                label={inv.status === "validated" ? "Validated" : "Awaiting no."}
                tone={inv.status === "validated" ? "positive" : "warning"}
              />
            </View>
          ))}
        </View>
      </ScrollView>

      <BottomNav />
      <ToastHost />
    </SafeAreaView>
  );
}
