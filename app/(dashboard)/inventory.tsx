import { Boxes, Download, Plus } from "lucide-react-native";
import { useState } from "react";
import { ScrollView, StatusBar, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  AlertBanner,
  AppHeader,
  BG,
  BottomNav,
  FONT_REG,
  FONT_SEMI,
  GhostPillButton,
  GRADIENT_TEAL,
  GradientStatCard,
  GREEN,
  GREEN_TINT,
  NAV_CLEARANCE,
  PageTitle,
  PillRow,
  PrimaryButton,
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
  type NotificationItem,
  type SearchItem,
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

const CATEGORIES: Category[] = [
  {
    id: "dry",
    name: "DRY GOODS",
    items: [
      {
        id: "1",
        name: "Maize flour 2kg — Jogoo",
        sku: "DRY-MZ-2000",
        supplier: "Unga Group",
        quantity: "184",
        unit: "packets",
        status: "in-stock",
      },
      {
        id: "2",
        name: "Rice 25kg — Pishori",
        sku: "DRY-RC-2500",
        supplier: "Mwea Millers",
        quantity: "22",
        unit: "bags",
        status: "reorder",
      },
      {
        id: "3",
        name: "Sugar 50kg — Mumias",
        sku: "DRY-SG-5000",
        supplier: "Mumias Sugar",
        quantity: "41",
        unit: "bags",
        status: "in-stock",
      },
      {
        id: "4",
        name: "Wheat flour 2kg — Exe",
        sku: "DRY-WF-2000",
        supplier: "Unga Group",
        quantity: "9",
        unit: "packets",
        status: "reorder",
      },
    ],
  },
  {
    id: "oils",
    name: "COOKING OILS",
    items: [
      {
        id: "5",
        name: "Cooking oil 5L — Rina",
        sku: "LIQ-CO-5000",
        supplier: "Pwani Oil",
        quantity: "76",
        unit: "jerricans",
        status: "in-stock",
      },
      {
        id: "6",
        name: "Cooking fat 1kg — Kimbo",
        sku: "LIQ-CF-1000",
        supplier: "Bidco Africa",
        quantity: "14",
        unit: "tins",
        status: "reorder",
      },
    ],
  },
];

const NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    title: "3 items are at or below reorder level",
    time: "20 min ago",
    tone: "warning",
  },
  {
    id: "2",
    title: "Stock count completed for Nairobi Branch",
    time: "Yesterday",
    tone: "positive",
  },
];

const SEARCH_DATA: SearchItem[] = CATEGORIES.flatMap((c) =>
  c.items.map((i) => ({
    id: i.id,
    title: i.name,
    subtitle: `${i.sku} · ${i.supplier}`,
  })),
);

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

export default function InventoryScreen() {
  const [branch, setBranch] = useState("Nairobi Branch");
  const [category, setCategory] = useState("All categories");
  const [searchVisible, setSearchVisible] = useState(false);

  const visible =
    category === "All categories"
      ? CATEGORIES
      : CATEGORIES.filter((c) => c.name === category);

  const totalItems = CATEGORIES.reduce((sum, c) => sum + c.items.length, 0);
  const lowStock = CATEGORIES.reduce(
    (sum, c) => sum + c.items.filter((i) => i.status === "reorder").length,
    0,
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
          <SelectorPill
            label={category}
            options={["All categories", ...CATEGORIES.map((c) => c.name)]}
            onSelect={setCategory}
          />
          <SearchTrigger onPress={() => setSearchVisible(true)} />
        </PillRow>

        <PageTitle
          title="Inventory"
          subtitle={`${branch} · ${CATEGORIES.length} categories · counted 16 Aug 2026`}
        />

        <View className="px-4">
          <View style={{ marginBottom: SPACE_4 }}>
            <GhostPillButton
              label="Stock report"
              icon={<Download size={14} color={TEXT_SECONDARY} />}
              onPress={() => showToast("Preparing stock report…")}
            />
          </View>

          <AlertBanner
            tone="warning"
            title={`${lowStock} items need reordering`}
            description="These SKUs are at or below their reorder level. Raise a purchase order before the next delivery window closes."
            actionLabel="Create purchase order"
            onAction={() => showToast("Purchase orders coming soon")}
          />

          <GradientStatCard
            title="Stock on Hand"
            badgeLabel={`${CATEGORIES.length} categories`}
            value="KSh 1,284,600"
            helper={`${totalItems} distinct SKUs tracked at this branch`}
            rows={[
              { label: "Dry goods", value: "KSh 921,400" },
              { label: "Cooking oils", value: "KSh 363,200" },
            ]}
            actionLabel="Export valuation"
            onAction={() => showToast("Preparing valuation…")}
            colors={GRADIENT_TEAL}
          />

          <StatCard
            title="Low Stock"
            tone="warning"
            badgeLabel={`${lowStock} to reorder`}
            value={String(lowStock)}
            helper="Items at or below their reorder level"
            footerStats={[
              { label: "DRY GOODS", value: "2" },
              { label: "OILS", value: "1" },
              { label: "OUT OF STOCK", value: "0" },
            ]}
          />

          <View style={{ marginBottom: SPACE_4 }}>
            <PrimaryButton
              label="Add Product"
              icon={<Plus size={16} color="#FFFFFF" />}
              onPress={() => showToast("Product form coming soon")}
              colors={GRADIENT_TEAL}
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
        data={SEARCH_DATA}
        placeholder="Search products, SKUs, suppliers…"
        onSelect={(item) => showToast(item.title)}
      />

      <ToastHost />
    </SafeAreaView>
  );
}
