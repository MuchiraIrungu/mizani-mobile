import { useFocusEffect, useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import { useCallback, useMemo, useState } from "react";
import { ScrollView, StatusBar, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useNotificationItems } from "@/hooks/useNotificationItems";
import { getSuppliers } from "@/services/dashboardDataService";
import { useAuthStore } from "@/store/authStore";
import type { SupplierResponse } from "@/types/supplier";
import { apiError, headerProps } from "@/utils/header";
import {
  AppHeader,
  BottomNav,
  ErrorBanner,
  GRADIENT_FOREST,
  InfoRow,
  NAV_CLEARANCE,
  PageTitle,
  PillRow,
  PrimaryButton,
  SearchModal,
  SearchTrigger,
  SectionHeading,
  showToast,
  SPACE_3,
  SPACE_4,
  StatCard,
  SURFACE,
  ToastHost,
  type SearchItem,
} from "../../components/dashboard/dashboardUI";

export default function SuppliersScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const notifications = useNotificationItems();
  const [suppliers, setSuppliers] = useState<SupplierResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchVisible, setSearchVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getSuppliers()
        .then((s) => {
          setSuppliers(s);
          setError(null);
        })
        .catch((e) => setError(apiError(e, "Failed to load suppliers")));
    }, []),
  );

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const s of suppliers)
      counts.set(
        s.category || "Other",
        (counts.get(s.category || "Other") ?? 0) + 1,
      );
    return [...counts].sort((a, b) => b[1] - a[1]);
  }, [suppliers]);

  const searchData: SearchItem[] = useMemo(
    () =>
      suppliers.map((s) => ({
        id: s.id,
        title: s.name,
        subtitle: `${s.category ?? "—"} · ${s.phone ?? "no phone"}`,
      })),
    [suppliers],
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
        <AppHeader {...headerProps(user)} notifications={notifications} />
        <PillRow>
          <SearchTrigger onPress={() => setSearchVisible(true)} />
        </PillRow>
        <PageTitle
          title="Suppliers"
          subtitle={`${suppliers.length} suppliers`}
        />
        {!!error && <ErrorBanner message={error} />}

        <View className="px-4">
          <StatCard
            title="Suppliers"
            badgeLabel={`${categories.length} categories`}
            badgeTone="positive"
            value={String(suppliers.length)}
            helper="Suppliers on your books"
            footerStats={categories.slice(0, 3).map(([label, n]) => ({
              label: label.toUpperCase(),
              value: String(n),
            }))}
          />

          <View style={{ marginBottom: SPACE_4 }}>
            <PrimaryButton
              label="Add Supplier"
              icon={<Plus size={16} color="#FFFFFF" />}
              onPress={() => router.push("/(dashboard)/add-supplier")}
              colors={GRADIENT_FOREST}
            />
          </View>

          <SectionHeading
            title="Supplier Accounts"
            subtitle={`${suppliers.length} shown`}
          />
          {suppliers.map((s) => (
            <InfoRow
              key={s.id}
              initials={s.name
                .split(" ")
                .map((w) => w[0])
                .slice(0, 2)
                .join("")}
              title={s.name}
              subtitle={s.phone ?? "No phone"}
              trailingLabel={s.category ?? "—"}
              trailingTone="positive"
              onPress={() => showToast(`${s.name} · statement coming soon`)}
            />
          ))}
        </View>
      </ScrollView>

      <BottomNav />
      <SearchModal
        visible={searchVisible}
        onClose={() => setSearchVisible(false)}
        data={searchData}
        placeholder="Search suppliers…"
        onSelect={(item) => showToast(item.title)}
      />
      <ToastHost />
    </SafeAreaView>
  );
}
