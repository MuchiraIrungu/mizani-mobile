import { getNotifications } from "@/services/dashboardDataService";
import { toNotificationItem } from "@/utils/dashboardStats";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import type { NotificationItem } from "../components/dashboard/dashboardUI";

export function useNotificationItems() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  useFocusEffect(
    useCallback(() => {
      let alive = true;
      getNotifications()
        .then(
          (n) =>
            alive &&
            setItems(n.filter((x) => !x.readAt).map(toNotificationItem)),
        )
        .catch(() => {});
      return () => {
        alive = false;
      };
    }, []),
  );
  return items;
}
