import { CheckCheck } from "lucide-react-native";
import { useCallback, useMemo, useState } from "react";
import { ScrollView, StatusBar, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ErrorBanner } from "@/components/auth/AuthUI";
import {
  getNotifications,
  markAllNotificationsRead,
} from "@/services/dashboardDataService";
import { useAuthStore } from "@/store/authStore";
import { NotificationResponse } from "@/types/dashboard";
import { toNotificationItem } from "@/utils/dashboardStats";
import { useFocusEffect } from "expo-router";
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
  GRADIENT_FOREST,
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

type FeedItem = NotificationItem & { group: string; read: boolean };

const GROUP_BY_TYPE: Record<string, string> = {
  KRA_DEADLINE: "KRA",
  ETIMS: "KRA",
  INVOICE: "Sales",
  PAYMENT: "Sales",
  LOW_STOCK: "Inventory",
  PAYROLL: "Payroll",
};

const toFeedItem = (n: NotificationResponse): FeedItem => ({
  ...toNotificationItem(n),
  group: GROUP_BY_TYPE[n.type] ?? "General",
  read: n.readAt != null,
});

const TONE_STYLE: Record<string, { fill: string; fg: string; label: string }> =
  {
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
    </View>
  );
}

export default function NotificationsScreen() {
  const user = useAuthStore((s) => s.user);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [group, setGroup] = useState("All");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      setFeed((await getNotifications()).map(toFeedItem));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load notifications",
      );
    }
  }, []);
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const handleMarkAll = async () => {
    try {
      await markAllNotificationsRead();
      await load();
      showToast("All notifications marked as read");
    } catch {
      showToast("Could not mark as read");
    }
  };

  const groups = useMemo(
    () => ["All", ...new Set(feed.map((f) => f.group))],
    [feed],
  );
  const items = feed.filter((f) => group === "All" || f.group === group);
  const urgent = feed.filter((f) => f.tone === "danger" && !f.read);
  const urgentIn = (g: string) => urgent.filter((f) => f.group === g).length;

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
          initials={
            `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}` || "??"
          }
          name={`${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim()}
          role={user?.roleName ?? ""}
          notifications={feed.filter((f) => !f.read)}
        />

        <PageTitle
          title="Notifications"
          subtitle={`${feed.length} alerts · ${urgent.length} need action`}
        />

        {!!error && <ErrorBanner message={error} />}

        <View className="px-4">
          <View style={{ marginBottom: SPACE_4 }}>
            <GhostPillButton
              label="Mark all as read"
              icon={<CheckCheck size={14} color={TEXT_SECONDARY} />}
              onPress={handleMarkAll}
            />
          </View>

          <GradientStatCard
            title="Needs Your Attention"
            badgeLabel={`${urgent.length} items`}
            value={`${urgent.length} blocking alerts`}
            helper="Items that stop a filing, a payment or a delivery from completing"
            rows={[
              { label: "KRA", value: "1" },
              { label: "Payroll", value: "1" },
              { label: "Inventory", value: "0" },
            ]}
            colors={GRADIENT_FOREST}
          />

          <FilterChips options={groups} value={group} onChange={setGroup} />

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
