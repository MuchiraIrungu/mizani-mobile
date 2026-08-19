import { Download } from "lucide-react-native";
import { useState } from "react";
import { ScrollView, StatusBar, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  AppHeader,
  BottomNav,
  DataCard,
  DataRow,
  FONT_SEMI,
  GRADIENT_FOREST,
  GradientStatCard,
  NAV_CLEARANCE,
  PageTitle,
  PillRow,
  PillTabs,
  PrimaryButton,
  SectionHeading,
  SelectorPill,
  showToast,
  SPACE_3,
  SPACE_4,
  StatCard,
  SURFACE,
  TEXT_PRIMARY,
  ToastHost,
  type NotificationItem,
} from "../../components/dashboard/dashboardUI";

/* Reports — revenue vs expenses for the period, expense mix and exportable
   statements. */

/* Shades of the brand green, darkest for the largest share, so the mix reads
   as one family rather than five unrelated hues. */
const EXPENSE_BREAKDOWN = [
  { label: "Stock purchases", value: "KSh 812,000", pct: "58%", color: "#063D24" },
  { label: "Payroll", value: "KSh 402,150", pct: "29%", color: "#0A5C36" },
  { label: "Rent & utilities", value: "KSh 96,400", pct: "7%", color: "#15803D" },
  { label: "Logistics", value: "KSh 54,600", pct: "4%", color: "#22C55E" },
  { label: "Other", value: "KSh 29,000", pct: "2%", color: "#94A3B8" },
];

const STATEMENTS = [
  { label: "Profit & Loss", detail: "Income statement for the period", value: "PDF" },
  { label: "Balance Sheet", detail: "Assets, liabilities and equity", value: "PDF" },
  { label: "Cash Flow", detail: "Operating, investing and financing", value: "PDF" },
  { label: "Trial Balance", detail: "All ledger accounts", value: "CSV" },
];

const PERIOD_LABEL: Record<string, string> = {
  W: "This week",
  M: "1 – 31 Aug 2026",
  Q: "Q3 2026",
  Y: "FY 2026",
};

const NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    title: "August close is ready to review",
    time: "2 hours ago",
    tone: "positive",
  },
];

export default function ReportsScreen() {
  const [period, setPeriod] = useState("M");
  const [branch, setBranch] = useState("Nairobi Branch");

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
        </PillRow>

        <PageTitle
          title="Reports"
          subtitle={`${branch} · ${PERIOD_LABEL[period]}`}
        />

        <View className="px-4">
          <PillTabs
            options={["W", "M", "Q", "Y"]}
            value={period}
            onChange={setPeriod}
          />

          <GradientStatCard
            title="Net Profit"
            badgeLabel="+18.2%"
            value="KSh 1,092,750"
            helper={`Revenue less operating costs for ${PERIOD_LABEL[period]}`}
            rows={[
              { label: "Revenue", value: "KSh 2,486,900" },
              { label: "Operating costs", value: "KSh 1,394,150" },
              { label: "Gross margin", value: "44%" },
            ]}
            actionLabel="Export summary"
            onAction={() => showToast("Preparing summary…")}
            colors={GRADIENT_FOREST}
          />

          <StatCard
            title="Revenue"
            badgeLabel="+12.5%"
            badgeTone="positive"
            value="KSh 2,486,900"
            helper="Against the previous month"
            footerStats={[
              { label: "M-PESA", value: "1,642,300" },
              { label: "BANK", value: "618,200" },
              { label: "CASH", value: "226,400" },
            ]}
          />

          <StatCard
            title="Expenses"
            badgeLabel="+4.1%"
            badgeTone="warning"
            value="KSh 1,394,150"
            helper="Gross margin 44% this month"
            progressPercent={78}
          />

          <SectionHeading
            title="Expense Breakdown"
            subtitle="Share of total operating costs"
          />

          <View
            className="rounded-[14px] p-5"
            style={{
              backgroundColor: "#FFFFFF",
              marginBottom: SPACE_4,
              shadowColor: "#0F172A",
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.14,
              shadowRadius: 7,
              elevation: 4,
            }}
          >
            {EXPENSE_BREAKDOWN.map((row, i) => (
              <View
                key={row.label}
                className="flex-row items-center justify-between py-3"
                style={{
                  borderTopWidth: i === 0 ? 0 : 1,
                  borderTopColor: "#D9DEDB",
                }}
              >
                <View className="flex-row items-center flex-1 mr-3">
                  <View
                    className="w-2.5 h-2.5 rounded-[999px] mr-3"
                    style={{ backgroundColor: row.color }}
                  />
                  <Text
                    className="text-[13px]"
                    style={{ color: TEXT_PRIMARY, fontFamily: FONT_SEMI }}
                  >
                    {row.label}
                  </Text>
                </View>
                <Text
                  className="text-[13px] mr-3"
                  style={{ color: TEXT_PRIMARY, fontFamily: FONT_SEMI }}
                >
                  {row.value}
                </Text>
                <View
                  className="px-2.5 py-1 rounded-[999px]"
                  style={{ backgroundColor: row.color }}
                >
                  <Text
                    className="text-[11px]"
                    style={{ color: "#FFFFFF", fontFamily: FONT_SEMI }}
                  >
                    {row.pct}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <DataCard
            title="Statements"
            subtitle={`Ready to export for ${PERIOD_LABEL[period]}`}
          >
            {STATEMENTS.map((s, i) => (
              <DataRow
                key={s.label}
                label={s.label}
                detail={s.detail}
                value={s.value}
                first={i === 0}
              />
            ))}
          </DataCard>

          <View style={{ marginBottom: SPACE_3 }}>
            <PrimaryButton
              label="Export Report (PDF)"
              icon={<Download size={16} color="#FFFFFF" />}
              onPress={() => showToast("Preparing PDF export…")}
              colors={GRADIENT_FOREST}
            />
          </View>
        </View>
      </ScrollView>

      <BottomNav />
      <ToastHost />
    </SafeAreaView>
  );
}
