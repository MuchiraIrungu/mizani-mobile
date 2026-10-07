import { useFocusEffect, useRouter } from "expo-router";
import { Download, Plus } from "lucide-react-native";
import { useCallback, useMemo, useState } from "react";
import { ScrollView, StatusBar, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useNotificationItems } from "@/hooks/useNotificationItems";
import {
  getSupplierPayments,
  getSuppliers,
} from "@/services/dashboardDataService";
import { useAuthStore } from "@/store/authStore";
import type { SupplierResponse } from "@/types/supplier";
import { ksh } from "@/utils/dashboardStats";
import { apiError, headerProps } from "@/utils/header";
import {
  AppHeader,
  BottomNav,
  DataCard,
  DataRow,
  ErrorBanner,
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
  showToast,
  SPACE_3,
  SPACE_4,
  StatCard,
  SURFACE,
  TEXT_SECONDARY,
  ToastHost,
  type SearchItem,
} from "../../components/dashboard/dashboardUI";

/* Suppliers — payables by supplier account, ageing and supplier register. */

// Bills are pending supplier payments; ageing runs from the payment's creation date.
type Bill = { supplierId: string; amount: number; dueDate: string }; // dueDate "YYYY-MM-DD"

const titleCase = (s: string) =>
  s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

export default function SuppliersScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const notifications = useNotificationItems();
  const [suppliers, setSuppliers] = useState<SupplierResponse[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState("All");
  const [searchVisible, setSearchVisible] = useState(false);
  const [now, setNow] = useState(() => new Date());

  useFocusEffect(
    useCallback(() => {
      Promise.all([getSuppliers(), getSupplierPayments("PENDING")])
        .then(([s, p]) => {
          setSuppliers(s);
          setBills(
            p.map((x) => ({
              supplierId: x.supplierId,
              amount: Number(x.amount),
              dueDate: x.createdAt.slice(0, 10),
            })),
          );
          setNow(new Date());
          setError(null);
        })
        .catch((e) => setError(apiError(e, "Failed to load suppliers")));
    }, []),
  );

  const { owed, ageing, total } = useMemo(() => {
    const owed = new Map<string, number>();
    const buckets = [0, 0, 0]; // current, 1-30, 31-60+
    const today = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    ).getTime();
    for (const b of bills) {
      owed.set(b.supplierId, (owed.get(b.supplierId) ?? 0) + b.amount);
      const days = Math.floor(
        (today - new Date(`${b.dueDate}T00:00:00`).getTime()) / 864e5,
      );
      buckets[days <= 0 ? 0 : days <= 30 ? 1 : 2] += b.amount;
    }
    return {
      owed,
      total: buckets.reduce((a, b) => a + b, 0),
      ageing: [
        { label: "Current", detail: "Not yet due", value: buckets[0] },
        { label: "1 – 30 days", detail: "Past due", value: buckets[1] },
        { label: "31 – 60+ days", detail: "Past due", value: buckets[2] },
      ],
    };
  }, [now, bills]);

  const balanceOf = (s: SupplierResponse) => owed.get(s.id) ?? 0;
  const owing = suppliers.filter((s) => balanceOf(s) > 0).length;
  const filtered = suppliers.filter((s) =>
    tab === "All"
      ? true
      : tab === "Owing"
        ? balanceOf(s) > 0
        : balanceOf(s) === 0,
  );

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
        <AppHeader
          {...headerProps(user)}
          role={titleCase(user?.roleName ?? "")}
          notifications={notifications}
        />

        <PillRow>
          <SearchTrigger onPress={() => setSearchVisible(true)} />
        </PillRow>

        <PageTitle
          title="Suppliers"
          subtitle={`${owing} accounts with a balance`}
        />
        {!!error && <ErrorBanner message={error} />}

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
            badgeLabel={`${owing} to pay`}
            value={`KSh ${ksh(total)}`}
            helper="Outstanding across all supplier accounts"
            rows={ageing.map((a) => ({
              label: a.label,
              value: `KSh ${ksh(a.value)}`,
            }))}
            actionLabel="Export statement"
            onAction={() => showToast("Preparing statement…")}
            colors={GRADIENT_FOREST}
          />

          <StatCard
            title="Active Suppliers"
            badgeLabel={`${suppliers.length - owing} settled`}
            badgeTone="positive"
            value={String(suppliers.length)}
            helper="Suppliers on your books"
            footerStats={[
              { label: "OWING", value: String(owing) },
              { label: "SETTLED", value: String(suppliers.length - owing) },
              { label: "ON HOLD", value: "0" },
            ]}
          />

          <DataCard
            title="Payables Ageing"
            subtitle="By days past the due date"
          >
            {ageing.map((a, i) => (
              <DataRow
                key={a.label}
                label={a.label}
                detail={a.detail}
                value={`KSh ${ksh(a.value)}`}
                first={i === 0}
              />
            ))}
            <DataRow label="Total" value={`KSh ${ksh(total)}`} emphasis />
          </DataCard>

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
            subtitle={`${filtered.length} shown`}
          />
          <PillTabs
            options={["All", "Owing", "Settled"]}
            value={tab}
            onChange={setTab}
          />

          {filtered.map((s) => {
            const bal = balanceOf(s);
            return (
              <InfoRow
                key={s.id}
                initials={s.name
                  .split(" ")
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join("")}
                title={s.name}
                subtitle={`${s.category ?? "General"} · ${s.phone ?? "no phone"}`}
                trailingLabel={bal > 0 ? `KSh ${ksh(bal)}` : "Settled"}
                trailingTone={bal > 0 ? "warning" : "positive"}
                onPress={() =>
                  router.push({
                    pathname: "/(dashboard)/add-supplier",
                    params: { id: s.id },
                  })
                }
              />
            );
          })}
        </View>
      </ScrollView>

      <BottomNav onAdd={() => router.push("/(dashboard)/add-supplier")} />
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
