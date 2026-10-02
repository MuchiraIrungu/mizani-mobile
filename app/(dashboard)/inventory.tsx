import { Boxes, Download, Plus } from "lucide-react-native";
import { useCallback, useMemo, useState } from "react";
import { ScrollView, StatusBar, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ErrorBanner } from "@/components/auth/AuthUI";
import { useNotificationItems } from "@/hooks/useNotificationItems";
import { getProducts, getSuppliers } from "@/services/dashboardDataService";
import { useAuthStore } from "@/store/authStore";
import { ProductResponse } from "@/types/product";
import { SupplierResponse } from "@/types/supplier";
import { ksh } from "@/utils/dashboardStats";
import { apiError, headerProps } from "@/utils/header";
import { useFocusEffect, useRouter } from "expo-router";
import {
  AlertBanner,
  AppHeader,
  BG,
  BottomNav,
  FONT_REG,
  FONT_SEMI,
  GhostPillButton,
  GRADIENT_FOREST,
  GradientStatCard,
  GREEN,
  GREEN_TINT,
  NAV_CLEARANCE,
  PageTitle,
  PillRow,
  PrimaryButton,
  SearchItem,
  SearchModal,
  SearchTrigger,
  SelectorPill,
  SHADOW_SM,
  showToast,
  SPACE_2,
  SPACE_3,
  SPACE_4,
  StatCard,
  StatusPill,
  SURFACE,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  ToastHost,
} from "../../components/dashboard/dashboardUI";

/* Inventory — stock on hand grouped by category, with reorder warnings. */

type InventoryItem = {
  id: string;
  name: string;
  sku: string;
  supplier: string;
  quantity: string;
  unit: string;
  status: "in-stock" | "reorder";
};

type Category = {
  id: string;
  name: string;
  items: InventoryItem[];
};

function CategoryHeader({
  name,
  count,
  toReorder,
}: {
  name: string;
  count: number;
  toReorder: number;
}) {
  return (
    <View
      className="flex-row items-center justify-between"
      style={{ marginTop: SPACE_2, marginBottom: SPACE_3 }}
    >
      <View className="flex-row items-center">
        <Text
          className="text-[13px] mr-2"
          style={{
            color: TEXT_SECONDARY,
            fontFamily: FONT_SEMI,
            letterSpacing: 0.5,
          }}
        >
          {name}
        </Text>
        <Text
          className="text-[12px]"
          style={{ color: TEXT_SECONDARY, fontFamily: FONT_REG }}
        >
          {count} items
        </Text>
      </View>
      {toReorder > 0 && (
        <StatusPill label={`${toReorder} to reorder`} tone="warning" />
      )}
    </View>
  );
}

function InventoryItemRow({ item }: { item: InventoryItem }) {
  return (
    <View
      className="flex-row items-center rounded-[12px] p-4 mb-3"
      style={{ backgroundColor: BG, ...SHADOW_SM }}
    >
      <View
        className="w-10 h-10 rounded-[10px] items-center justify-center mr-3"
        style={{ backgroundColor: GREEN_TINT }}
      >
        <Boxes size={18} color={GREEN} />
      </View>

      <View className="flex-1 mr-2">
        <Text
          className="text-[14px] mb-1"
          style={{ color: TEXT_PRIMARY, fontFamily: FONT_SEMI }}
        >
          {item.name}
        </Text>
        <Text
          className="text-[12px]"
          style={{ color: TEXT_SECONDARY, fontFamily: FONT_REG }}
        >
          {item.sku} · {item.supplier}
        </Text>
      </View>

      <View className="items-end">
        <Text
          className="text-[15px] mb-1.5"
          style={{ color: TEXT_PRIMARY, fontFamily: FONT_SEMI }}
        >
          {item.quantity}{" "}
          <Text
            className="text-[12px]"
            style={{ color: TEXT_SECONDARY, fontFamily: FONT_REG }}
          >
            {item.unit}
          </Text>
        </Text>
        <StatusPill
          label={item.status === "in-stock" ? "In Stock" : "Reorder"}
          tone={item.status === "in-stock" ? "positive" : "warning"}
        />
      </View>
    </View>
  );
}

const titleCase = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();

export default function InventoryScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const notifications = useNotificationItems();
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState("All categories");
  const [searchVisible, setSearchVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      Promise.all([
        getProducts(),
        getSuppliers().catch((): SupplierResponse[] => []),
      ])
        .then(([p, s]) => {
          setProducts(p);
          setSuppliers(s);
          setError(null);
        })
        .catch((e) => setError(apiError(e, "Failed to load inventory")));
    }, []),
  );

  const stock = useMemo(() => {
    const supplierName = new Map(suppliers.map((s) => [s.id, s.name]));
    const groups = new Map<string, InventoryItem[]>();
    const value = new Map<string, number>();
    for (const p of products) {
      const key = (p.category || "UNCATEGORISED").toUpperCase();
      groups.set(key, [
        ...(groups.get(key) ?? []),
        {
          id: p.id,
          name: p.name,
          sku: p.sku,
          supplier: p.supplierId
            ? (supplierName.get(p.supplierId) ?? "—")
            : "No supplier",
          quantity: String(p.stockQuantity),
          unit: "units",
          status:
            p.stockQuantity <= p.lowStockThreshold ? "reorder" : "in-stock",
        },
      ]);
      value.set(key, (value.get(key) ?? 0) + p.unitPrice * p.stockQuantity);
    }
    const categories: Category[] = [...groups].map(([name, items]) => ({
      id: name,
      name,
      items,
    }));
    const total = [...value.values()].reduce((a, b) => a + b, 0);
    return { categories, value, total };
  }, [products, suppliers]);

  const searchData: SearchItem[] = useMemo(
    () =>
      stock.categories.flatMap((c) =>
        c.items.map((i) => ({
          id: i.id,
          title: i.name,
          subtitle: `${i.sku} · ${i.supplier}`,
        })),
      ),
    [stock],
  );

  const visible =
    category === "All categories"
      ? stock.categories
      : stock.categories.filter((c) => c.name === category);
  const lowStock = products.filter(
    (p) => p.stockQuantity <= p.lowStockThreshold,
  ).length;
  const outOfStock = products.filter((p) => p.stockQuantity === 0).length;

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
          <SelectorPill
            label={category}
            options={["All categories", ...stock.categories.map((c) => c.name)]}
            onSelect={setCategory}
          />
          <SearchTrigger onPress={() => setSearchVisible(true)} />
        </PillRow>

        <PageTitle
          title="Inventory"
          subtitle={`${stock.categories.length} categories · ${products.length} products`}
        />
        {!!error && <ErrorBanner message={error} />}

        <View className="px-4">
          <View style={{ marginBottom: SPACE_4 }}>
            <GhostPillButton
              label="Stock report"
              icon={<Download size={14} color={TEXT_SECONDARY} />}
              onPress={() => showToast("Preparing stock report…")}
            />
          </View>

          {lowStock > 0 && (
            <AlertBanner
              tone="warning"
              title={`${lowStock} items need reordering`}
              description="These SKUs are at or below their reorder level. Raise a purchase order before the next delivery window closes."
              actionLabel="Create purchase order"
              onAction={() => showToast("Purchase orders coming soon")}
            />
          )}

          <GradientStatCard
            title="Stock on Hand"
            badgeLabel={`${stock.categories.length} categories`}
            value={`KSh ${ksh(stock.total)}`}
            helper={`${products.length} distinct SKUs tracked`}
            rows={stock.categories.slice(0, 4).map((c) => ({
              label: titleCase(c.name),
              value: `KSh ${ksh(stock.value.get(c.name) ?? 0)}`,
            }))}
            actionLabel="Export valuation"
            onAction={() => showToast("Preparing valuation…")}
            colors={GRADIENT_FOREST}
          />

          <StatCard
            title="Low Stock"
            tone="warning"
            badgeLabel={`${lowStock} to reorder`}
            value={String(lowStock)}
            helper="Items at or below their reorder level"
            footerStats={[
              { label: "TO REORDER", value: String(lowStock) },
              { label: "OUT OF STOCK", value: String(outOfStock) },
              { label: "TOTAL SKUS", value: String(products.length) },
            ]}
          />

          <View style={{ marginBottom: SPACE_4 }}>
            <PrimaryButton
              label="Add Product"
              icon={<Plus size={16} color="#FFFFFF" />}
              onPress={() => router.push("/(dashboard)/add-product")}
              colors={GRADIENT_FOREST}
            />
          </View>

          {visible.map((cat) => (
            <View key={cat.id}>
              <CategoryHeader
                name={cat.name}
                count={cat.items.length}
                toReorder={
                  cat.items.filter((i) => i.status === "reorder").length
                }
              />
              {cat.items.map((item) => (
                <InventoryItemRow key={item.id} item={item} />
              ))}
            </View>
          ))}
        </View>
      </ScrollView>

      <BottomNav />
      <SearchModal
        visible={searchVisible}
        onClose={() => setSearchVisible(false)}
        data={searchData}
        placeholder="Search products, SKUs, suppliers…"
        onSelect={(item) => showToast(item.title)}
      />
      <ToastHost />
    </SafeAreaView>
  );
}
