import { CheckCheck } from "lucide-react-native";
import { useState } from "react";
import { ScrollView, StatusBar, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  AppHeader,
  BG,
  BottomNav,
  DANGER,
  DANGER_BG,
  FilterChips,
  FONT_MED,
  FONT_REG,
  FONT_SEMI,
  GhostPillButton,
  GRADIENT_SLATE,
  GradientStatCard,
  GREEN,
  GREEN_TINT,
  NAV_CLEARANCE,
  PageTitle,
  SHADOW_SM,
  showToast,
  SPACE_3,
  SPACE_4,
  SURFACE,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  ToastHost,
  WARNING,
  WARNING_BG,
  type NotificationItem,
} from "../../components/dashboard/dashboardUI";

/* Notifications — the full alert feed behind the header bell. */

type FeedItem = NotificationItem & { detail: string; group: string };

const FEED: FeedItem[] = [
  {
    id: "1",
    title: "2 invoices awaiting an eTIMS control number",
    detail: "INV-2043 and INV-2044 cannot be included in the VAT-3 return until KRA returns a control number.",
    time: "Today, 09:12",
    tone: "danger",
    group: "KRA",
  },
  {
    id: "2",
    title: "KRA filing deadline in 5 days",
    detail: "Your August VAT-3 return is due on 20 Sep 2026.",
    time: "Today, 08:00",
    tone: "warning",
    group: "KRA",
  },
  {
    id: "3",
    title: "3 items are at or below reorder level",
    detail: "Rice 25kg, Wheat flour 2kg and Cooking fat 1kg need a purchase order.",
    time: "Today, 07:40",
    tone: "warning",
    group: "Inventory",
  },
  {
    id: "4",
    title: "New invoice #INV-2044 created",
    detail: "KSh 18,560 to Mama Njeri Grocers, due 14 Sep 2026.",
    time: "2 hours ago",
    tone: "positive",
    group: "Sales",
  },
  {
    id: "5",
    title: "Payment received from Sokoni Retail",
    detail: "KSh 121,034 settled against INV-2043 via M-Pesa.",
    time: "3 hours ago",
    tone: "positive",
    group: "Sales",
  },
  {
    id: "6",
    title: "2 employees are still awaiting payment",
    detail: "Joseph Otieno and Mercy Wairimu have not been paid for August.",
    time: "Yesterday",
    tone: "danger",
    group: "Payroll",
  },
  {
    id: "7",
    title: "Stock count completed for Nairobi Branch",
    detail: "All 6 SKUs reconciled with no variance.",
    time: "Yesterday",
    tone: "positive",
    group: "Inventory",
  },
];

const GROUPS = ["All", "KRA", "Sales", "Inventory", "Payroll"];

const TONE_STYLE: Record<string, { fill: string; fg: string; label: string }> = {
  danger: { fill: DANGER_BG, fg: DANGER, label: "Action needed" },
  warning: { fill: WARNING_BG, fg: WARNING, label: "Due soon" },
  positive: { fill: GREEN_TINT, fg: GREEN, label: "Update" },
  neutral: { fill: SURFACE, fg: TEXT_SECONDARY, label: "Info" },
};

function FeedRow({ item }: { item: FeedItem }) {
  const tone = TONE_STYLE[item.tone];
  return (
    <View
      className="rounded-[12px] p-4 mb-3"
      style={{ backgroundColor: BG, ...SHADOW_SM }}
    >
      <View className="flex-row items-center justify-between mb-2">
        <View
          className="px-2.5 py-1 rounded-[999px]"
          style={{ backgroundColor: tone.fill }}
        >
          <Text
            className="text-[11px]"
            style={{ color: tone.fg, fontFamily: FONT_SEMI }}
          >
            {item.group} · {tone.label}
          </Text>
        </View>
        <Text
          className="text-[11px]"
          style={{ color: TEXT_SECONDARY, fontFamily: FONT_REG }}
        >
          {item.time}
        </Text>
      </View>
      <Text
        className="text-[14px] mb-1"
        style={{ color: TEXT_PRIMARY, fontFamily: FONT_SEMI }}
      >
        {item.title}
      </Text>
      <Text
        className="text-[12px] leading-[18px]"
        style={{ color: TEXT_SECONDARY, fontFamily: FONT_REG }}
      >
        {item.detail}
      </Text>
    </View>
  );
}

export default function NotificationsScreen() {
  const [group, setGroup] = useState("All");

  const items = FEED.filter((f) => (group === "All" ? true : f.group === group));
  const needsAction = FEED.filter((f) => f.tone === "danger").length;

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
          notifications={FEED}
        />

        <PageTitle
          title="Notifications"
          subtitle={`${FEED.length} alerts · ${needsAction} need action`}
        />

        <View className="px-4">
          <View style={{ marginBottom: SPACE_4 }}>
            <GhostPillButton
              label="Mark all as read"
              icon={<CheckCheck size={14} color={TEXT_SECONDARY} />}
              onPress={() => showToast("All notifications marked as read")}
            />
          </View>

          <GradientStatCard
            title="Needs Your Attention"
            badgeLabel={`${needsAction} items`}
            value={`${needsAction} blocking alerts`}
            helper="Items that stop a filing, a payment or a delivery from completing"
            rows={[
              { label: "KRA", value: "1" },
              { label: "Payroll", value: "1" },
              { label: "Inventory", value: "0" },
            ]}
            colors={GRADIENT_SLATE}
          />

          <FilterChips options={GROUPS} value={group} onChange={setGroup} />

          {items.length === 0 ? (
            <View
              className="rounded-[12px] p-6 items-center"
              style={{ backgroundColor: BG, ...SHADOW_SM }}
            >
              <Text
                className="text-[13px]"
                style={{ color: TEXT_SECONDARY, fontFamily: FONT_MED }}
              >
                Nothing here for {group}
              </Text>
            </View>
          ) : (
            items.map((item) => <FeedRow key={item.id} item={item} />)
          )}
        </View>
      </ScrollView>

      <BottomNav />
      <ToastHost />
    </SafeAreaView>
  );
}
