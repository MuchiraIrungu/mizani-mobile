/* Page shell used by every dashboard screen: safe area, status bar,
   pull-to-refresh scroll view, shared header, bottom nav and toast host.
   Keeps outer spacing identical everywhere. */
import type { ReactNode } from "react";
import { RefreshControl, ScrollView, StatusBar, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useResource } from "@/hooks/useResource";
import { branchApi } from "@/services/resources";
import { useBranchStore } from "@/store/branchStore";
import type { Branch } from "@/types/api";
import {
  AppHeader,
  BottomNav,
  GREEN,
  NAV_CLEARANCE,
  SelectorPill,
  SPACE_3,
  SPACE_4,
  SURFACE,
  ToastHost,
} from "./dashboardUI";

export function Screen({
  children,
  refreshing = false,
  onRefresh,
  overlays,
  showBack,
  hideNav,
}: {
  children: ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
  /** Sheets/modals rendered outside the scroll view. */
  overlays?: ReactNode;
  showBack?: boolean;
  hideNav?: boolean;
}) {
  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: SURFACE }}>
      <StatusBar barStyle="dark-content" backgroundColor={SURFACE} />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingTop: SPACE_3, paddingBottom: hideNav ? SPACE_4 * 2 : NAV_CLEARANCE }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          onRefresh ? (
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={GREEN} colors={[GREEN]} />
          ) : undefined
        }
      >
        <AppHeader showBack={showBack} />
        {children}
      </ScrollView>
      {!hideNav && <BottomNav />}
      {overlays}
      <ToastHost />
    </SafeAreaView>
  );
}

/** Body padding used under the title on every screen. */
export function Body({ children }: { children: ReactNode }) {
  return <View className="px-4">{children}</View>;
}

/** Loads the business's branches once and exposes the shared selection. */
export function useBranches() {
  const res = useResource<Branch[]>(branchApi.list, []);
  const branchId = useBranchStore((s) => s.branchId);
  const setBranchId = useBranchStore((s) => s.setBranchId);
  const selected = res.data.find((b) => b.id === branchId) ?? null;
  const main = res.data.find((b) => b.isMain) ?? res.data[0] ?? null;
  return { ...res, branches: res.data, selected, main, branchId: selected?.id ?? null, setBranchId };
}

/** Header pill to switch branch; "All branches" clears the filter. */
export function BranchPill({ branches, selectedName, onSelect }: {
  branches: Branch[];
  selectedName: string | null;
  onSelect: (id: string | null) => void;
}) {
  const ALL = "All branches";
  return (
    <SelectorPill
      label={selectedName ?? ALL}
      options={[ALL, ...branches.map((b) => b.name)]}
      onSelect={(label) => onSelect(label === ALL ? null : branches.find((b) => b.name === label)?.id ?? null)}
    />
  );
}
