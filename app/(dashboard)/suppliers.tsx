import { Download, Plus } from "lucide-react-native";
import { useState } from "react";
import { ScrollView, StatusBar, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  AppHeader,
  BottomNav,
  DataCard,
  DataRow,
  GhostPillButton,
  GRADIENT_FOREST,
  GradientStatCard,
  InfoRow,
  NAV_CLEARANCE,
  PageTitle,
  PillRow,
  PillTabs,
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
  TEXT_SECONDARY,
  ToastHost,
  type NotificationItem,
  type SearchItem,
} from "../../components/dashboard/dashboardUI";

/* Suppliers — payables by supplier account, ageing and the last order date. */

type Supplier = {
  name: string;
  detail: string;
  amount: string;
  terms: string;
};

const SUPPLIERS: Supplier[] = [
  {
    name: "Unga Group",
    detail: "Dry goods · Flour milling · last order 14 Aug 2026",
    amount: "KSh 284,500",
    terms: "Net 30",
  },
  {
    name: "Bidii Suppliers",
    detail: "General wholesale · last order 16 Aug 2026",
    amount: "KSh 146,000",
    terms: "Net 14",
  },
  {
    name: "Pwani Oil",
    detail: "Cooking oils · last order 9 Aug 2026",
    amount: "KSh 98,400",
    terms: "Net 30",
  },
  {
    name: "Brookside Dairy",
    detail: "Chilled · Dairy · last order 15 Aug 2026",
    amount: "KSh 52,180",
    terms: "Net 7",
  },
  {
    name: "Afya Distributors",
    detail: "Medical supplies · last order 11 Aug 2026",
    amount: "KSh 36,900",
    terms: "Net 14",
  },
  {
    name: "Bamburi Cement",
    detail: "Hardware · Building materials · last order 2 Aug 2026",
    amount: "KSh 0",
    terms: "Net 30",
  },
];

const AGEING = [
  { label: "Current", detail: "Not yet due", value: "KSh 331,080" },
  { label: "1 – 30 days", detail: "Past due", value: "KSh 198,500" },
  { label: "31 – 60 days", detail: "Past due", value: "KSh 88,400" },
];

const NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    title: "Unga Group invoice due in 3 days",
    time: "Today, 07:40",
    tone: "warning",
  },
];

const SEARCH_DATA: SearchItem[] = SUPPLIERS.map((s) => ({
  id: s.name,
  title: s.name,
  subtitle: `${s.detail} · ${s.terms}`,
}));

export default function SuppliersScreen() {
  const [tab, setTab] = useState("All");
  const [branch, setBranch] = useState("Nairobi Branch");
  const [searchVisible, setSearchVisible] = useState(false);

  const settled = (s: Supplier) => s.amount === "KSh 0";
  const filtered = SUPPLIERS.filter((s) => {
    if (tab === "All") return true;
    if (tab === "Owing") return !settled(s);
    return settled(s);
  });

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
          <SearchTrigger onPress={() => setSearchVisible(true)} />
        </PillRow>

        <PageTitle
          title="Suppliers"
          subtitle={`${branch} · 5 accounts with a balance`}
        />

        <View className="px-4">
          <View style={{ marginBottom: SPACE_4 }}>
            <GhostPillButton
              label="Payables report"
              icon={<Download size={14} color={TEXT_SECONDARY} />}
              onPress={() => showToast("Preparing payables report…")}
            />
          </View>

          <GradientStatCard
            title="Total Payables"
            badgeLabel="5 to pay"
            value="KSh 617,980"
            helper="Outstanding across all supplier accounts at this branch"
            rows={AGEING.map((a) => ({ label: a.label, value: a.value }))}
            actionLabel="Export statement"
            onAction={() => showToast("Preparing statement…")}
            colors={GRADIENT_FOREST}
          />

          <StatCard
            title="Active Suppliers"
            badgeLabel="3 settled"
            badgeTone="positive"
            value="8"
            helper="Suppliers ordered from in the last 90 days"
            footerStats={[
              { label: "OWING", value: "5" },
              { label: "SETTLED", value: "3" },
              { label: "ON HOLD", value: "0" },
            ]}
          />

          <DataCard title="Payables Ageing" subtitle="By days past the due date">
            {AGEING.map((a, i) => (
              <DataRow
                key={a.label}
                label={a.label}
                detail={a.detail}
                value={a.value}
                first={i === 0}
              />
            ))}
            <DataRow label="Total" value="KSh 617,980" emphasis />
          </DataCard>

          <View style={{ marginBottom: SPACE_4 }}>
            <PrimaryButton
              label="Add Supplier"
              icon={<Plus size={16} color="#FFFFFF" />}
              onPress={() => showToast("Supplier form coming soon")}
              colors={GRADIENT_FOREST}
            />
          </View>

          <SectionHeading
            title="Supplier Accounts"
            subtitle={`${filtered.length} shown`}
          />

          <PillTabs
            options={["All", "Owing", "Settled"]}
            value={tab}
            onChange={setTab}
          />

          {filtered.map((s) => (
            <InfoRow
              key={s.name}
              initials={s.name
                .split(" ")
                .map((w) => w[0])
                .slice(0, 2)
                .join("")}
              title={s.name}
              subtitle={`${s.detail} · ${s.terms}`}
              trailingLabel={settled(s) ? "Settled" : s.amount}
              trailingTone={settled(s) ? "positive" : "warning"}
              onPress={() => showToast(`${s.name} · statement coming soon`)}
            />
          ))}
        </View>
      </ScrollView>

      <BottomNav />

      <SearchModal
        visible={searchVisible}
        onClose={() => setSearchVisible(false)}
        data={SEARCH_DATA}
        placeholder="Search suppliers…"
        onSelect={(item) => showToast(item.title)}
      />

      <ToastHost />
    </SafeAreaView>
  );
}
