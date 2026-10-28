import { Bell, CheckCheck, Eye, Trash2 } from "lucide-react-native";
import { useState } from "react";
import { Text, View } from "react-native";

import {
  ActionSheet,
  Appear,
  EmptyState,
  ErrorState,
  LoadingState,
  MoreButton,
  PressableScale,
} from "../../components/dashboard/crud";
import {
  BG,
  DANGER,
  DANGER_BG,
  FilterChips,
  FONT_REG,
  FONT_SEMI,
  GhostPillButton,
  GRADIENT_FOREST,
  GradientStatCard,
  GREEN,
  GREEN_TINT,
  PageTitle,
  SHADOW_SM,
  showToast,
  SPACE_4,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  WARNING,
  WARNING_BG,
} from "../../components/dashboard/dashboardUI";
import { Body, Screen } from "../../components/dashboard/Screen";
import { useResource } from "../../hooks/useResource";
import { apiError } from "../../services/api";
import { notificationApi } from "../../services/resources";
import type { ApiNotification } from "../../types/api";
import { relativeTime } from "../../utils/format";

/* Notifications — the business's alert feed: read, mark read, delete. */

const GROUPS = ["All", "Unread", "Tax", "Stock", "Payments", "System"];
const GROUP_OF: Record<ApiNotification["type"], string> = {
  TAX_DEADLINE: "Tax",
  LOW_STOCK: "Stock",
  PAYMENT_RECEIVED: "Payments",
  SYSTEM: "System",
};
const TONE_STYLE: Record<ApiNotification["severity"], { fill: string; fg: string; label: string }> = {
  DANGER: { fill: DANGER_BG, fg: DANGER, label: "Action needed" },
  WARNING: { fill: WARNING_BG, fg: WARNING, label: "Due soon" },
  SUCCESS: { fill: GREEN_TINT, fg: GREEN, label: "Update" },
};

function FeedRow({ item, onPress, onMore }: { item: ApiNotification; onPress: () => void; onMore: () => void }) {
  const tone = TONE_STYLE[item.severity] ?? TONE_STYLE.SUCCESS;
  const unread = !item.readAt;
  return (
    <PressableScale onPress={onPress} className="rounded-[12px] p-4 mb-3" style={{ backgroundColor: BG, ...SHADOW_SM, opacity: unread ? 1 : 0.78 }}>
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center">
          {unread && <View className="w-2 h-2 rounded-[999px] mr-2" style={{ backgroundColor: GREEN }} />}
          <View className="px-2.5 py-1 rounded-[999px]" style={{ backgroundColor: tone.fill }}>
            <Text className="text-[11px]" style={{ color: tone.fg, fontFamily: FONT_SEMI }}>
              {GROUP_OF[item.type]} · {tone.label}
            </Text>
          </View>
        </View>
        <View className="flex-row items-center">
          <Text className="text-[11px]" style={{ color: TEXT_SECONDARY, fontFamily: FONT_REG }}>
            {relativeTime(item.createdAt)}
          </Text>
          <MoreButton onPress={onMore} />
        </View>
      </View>
      <Text className="text-[14px]" style={{ color: TEXT_PRIMARY, fontFamily: unread ? FONT_SEMI : FONT_REG, lineHeight: 20 }}>
        {item.message}
      </Text>
    </PressableScale>
  );
}

export default function NotificationsScreen() {
  const feed = useResource<ApiNotification[]>(async () => {
    const list = await notificationApi.list();
    return [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, []);
  const [group, setGroup] = useState("All");
  const [actionsFor, setActionsFor] = useState<ApiNotification | null>(null);

  const items = feed.data.filter((f) => (group === "All" ? true : group === "Unread" ? !f.readAt : GROUP_OF[f.type] === group));
  const unread = feed.data.filter((f) => !f.readAt);
  const needsAction = unread.filter((f) => f.severity === "DANGER");
  const countOf = (type: ApiNotification["type"]) => unread.filter((f) => f.type === type).length;

  const replace = (n: ApiNotification) => feed.setData((list) => list.map((x) => (x.id === n.id ? n : x)));

  const markRead = async (n: ApiNotification) => {
    if (n.readAt) return;
    try {
      replace(await notificationApi.markRead(n.id));
    } catch (err) {
      showToast(apiError(err, "Couldn't mark it as read"));
    }
  };

  const markAll = async () => {
    try {
      await notificationApi.markAllRead();
      const now = new Date().toISOString();
      feed.setData((list) => list.map((n) => (n.readAt ? n : { ...n, readAt: now })));
      showToast("All notifications marked as read");
    } catch (err) {
      showToast(apiError(err, "Couldn't mark them as read"));
    }
  };

  const remove = async (n: ApiNotification) => {
    try {
      await notificationApi.remove(n.id);
      feed.setData((list) => list.filter((x) => x.id !== n.id));
      showToast("Notification removed");
    } catch (err) {
      showToast(apiError(err, "Couldn't remove it"));
    }
  };

  return (
    <Screen
      refreshing={feed.refreshing}
      onRefresh={feed.refresh}
      overlays={
        <ActionSheet
          visible={!!actionsFor}
          title={actionsFor ? GROUP_OF[actionsFor.type] : ""}
          subtitle={actionsFor?.message}
          onClose={() => setActionsFor(null)}
          actions={
            actionsFor
              ? [
                  ...(!actionsFor.readAt
                    ? [{ label: "Mark as read", tone: "positive" as const, icon: (c: string) => <Eye size={17} color={c} />, onPress: () => markRead(actionsFor) }]
                    : []),
                  { label: "Delete notification", tone: "danger", icon: (c) => <Trash2 size={17} color={c} />, onPress: () => remove(actionsFor) },
                ]
              : []
          }
        />
      }
    >
      <PageTitle title="Notifications" subtitle={`${feed.data.length} alerts · ${unread.length} unread · ${needsAction.length} need action`} />

      <Body>
        {feed.error && <ErrorState message={feed.error} onRetry={feed.refresh} />}

        {feed.loading ? (
          <LoadingState />
        ) : (
          <>
            {unread.length > 0 && (
              <View style={{ marginBottom: SPACE_4, alignItems: "flex-start" }}>
                <GhostPillButton label="Mark all as read" icon={<CheckCheck size={14} color={TEXT_SECONDARY} />} onPress={markAll} />
              </View>
            )}

            <Appear index={0}>
              <GradientStatCard
                title="Needs Your Attention"
                badgeLabel={`${unread.length} unread`}
                value={`${needsAction.length} blocking alert${needsAction.length === 1 ? "" : "s"}`}
                helper="Unread items that can stop a filing, payment or delivery"
                rows={[
                  { label: "Tax deadlines", value: String(countOf("TAX_DEADLINE")) },
                  { label: "Low stock", value: String(countOf("LOW_STOCK")) },
                  { label: "Payments", value: String(countOf("PAYMENT_RECEIVED")) },
                ]}
                colors={GRADIENT_FOREST}
              />
            </Appear>

            <FilterChips options={GROUPS} value={group} onChange={setGroup} />

            {items.length === 0 ? (
              <EmptyState
                icon={<Bell size={24} color={GREEN} />}
                title={group === "All" ? "You're all caught up" : `Nothing in ${group}`}
                message="Alerts about tax deadlines, low stock and payments will appear here."
              />
            ) : (
              items.map((item, i) => (
                <Appear key={item.id} index={i + 1}>
                  <FeedRow item={item} onPress={() => markRead(item)} onMore={() => setActionsFor(item)} />
                </Appear>
              ))
            )}
          </>
        )}
      </Body>
    </Screen>
  );
}
