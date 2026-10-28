import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";

import { apiError } from "@/services/api";

/**
 * Loads data for a screen and keeps it fresh:
 *  - fetches on mount and every time the screen regains focus
 *    (so edits made elsewhere show up when you come back)
 *  - `refresh()` for pull-to-refresh, with a separate `refreshing` flag
 *  - `setData` for optimistic updates after a create/edit/delete
 */
export function useResource<T>(load: () => Promise<T>, initial: T) {
  const [data, setData] = useState<T>(initial);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadRef = useRef(load);
  loadRef.current = load;
  const loadedOnce = useRef(false);

  const run = useCallback(async (mode: "initial" | "refresh" | "silent") => {
    if (mode === "refresh") setRefreshing(true);
    try {
      const result = await loadRef.current();
      setData(result);
      setError(null);
    } catch (err) {
      setError(apiError(err));
    } finally {
      loadedOnce.current = true;
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    run("initial");
  }, [run]);

  // Re-fetch quietly when the user navigates back to this screen
  useFocusEffect(
    useCallback(() => {
      if (loadedOnce.current) run("silent");
    }, [run]),
  );

  const refresh = useCallback(() => run("refresh"), [run]);
  const reload = useCallback(() => run("silent"), [run]);

  return { data, setData, loading, refreshing, error, refresh, reload };
}
