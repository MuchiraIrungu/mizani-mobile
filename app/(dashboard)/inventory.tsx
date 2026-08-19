import { useRouter } from "expo-router";
import {
    Boxes,
    Download,
    LayoutGrid,
    MoreHorizontal,
    Package,
    Plus,
    TrendingUp,
    Users,
} from "lucide-react-native";
import { useState } from "react";
import { ScrollView, StatusBar, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
    BG,
    BottomNav,
    BrandMark,
    GhostPillButton,
    GREEN,
    GREEN_TINT_A,
    NotificationBell,
    PillRow,
    SearchModal,
    SearchTrigger,
    SelectorPill,
    SHADOW_MD,
    SHADOW_SM,
    SPACE_2,
    SPACE_4,
    SPACE_5,
    StatCard,
    StatusPill,
    SURFACE,
    TEXT_PRIMARY,
    TEXT_SECONDARY,
    UserMenu,
    type NavKey,
    type NotificationItem,
    type SearchItem,
} from "../../components/dashboard/dashboardUI";

const FONT_REG = "Lexend_400Regular";
const FONT_MED = "Lexend_500Medium";
const FONT_SEMI = "Lexend_600SemiBold";
const FONT_BOLD = "Lexend_700Bold";

/* ------------------------------------------------------------------ */
/* Mock data                                                           */
/* ------------------------------------------------------------------ */

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
  toReorder: number;
  items: InventoryItem[];
};

const CATEGORIES: Category[] = [
  {
    id: "dry",
    name: "DRY GOODS",
    toReorder: 2,
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
    toReorder: 1,
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
    ],
  },
];

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    title: "6 items are at or below reorder level",
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

const NAV_ITEMS: {
  key: NavKey;
  label: string;
  icon: (color: string) => React.ReactNode;
}[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: (c) => <LayoutGrid size={20} color={c} />,
  },
  {
    key: "sales",
    label: "Sales",
    icon: (c) => <TrendingUp size={20} color={c} />,
  },
  {
    key: "inventory",
    label: "Inventory",
    icon: (c) => <Package size={20} color={c} />,
  },
  {
    key: "payroll",
    label: "Payroll",
    icon: (c) => <Users size={20} color={c} />,
  },
  {
    key: "more",
    label: "More",
    icon: (c) => <MoreHorizontal size={20} color={c} />,
  },
];

const ROUTES: Record<NavKey, string> = {
  dashboard: "/(dashboard)/main",
  sales: "/(dashboard)/sales",
  inventory: "/(dashboard)/inventory",
  payroll: "/(dashboard)/payroll",
  more: "/(dashboard)/main",
};

/* ------------------------------------------------------------------ */
/* Local building blocks                                               */
/* ------------------------------------------------------------------ */

function CategorySectionHeader({
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
      style={{ marginTop: SPACE_4, marginBottom: SPACE_2 }}
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
        style={{ backgroundColor: GREEN_TINT_A }}
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
          style={{ color: TEXT_PRIMARY, fontFamily: FONT_BOLD }}
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

/** Floating "Add Product" pill — separate from the shared BottomNav "+" FAB,
 *  which is reserved for Add Transaction. Sits just above the nav bar. */
function AddProductFab({ onPress }: { onPress?: () => void }) {
  return (
    <View style={{ position: "absolute", right: 16, bottom: 96, zIndex: 20 }}>
      <View
        onTouchEnd={onPress}
        className="flex-row items-center px-4 py-3 rounded-[999px]"
        style={{ backgroundColor: GREEN, ...SHADOW_MD }}
      >
        <Plus size={16} color="#FFFFFF" />
        <Text
          className="text-[13px] ml-1.5"
          style={{ color: "#FFFFFF", fontFamily: FONT_SEMI }}
        >
          Add Product
        </Text>
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Main screen                                                         */
/* ------------------------------------------------------------------ */

export default function InventoryScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<NavKey>("inventory");
  const [branch, setBranch] = useState("Nairobi Branch");
  const [dateRange, setDateRange] = useState("1 – 31 Aug 2026");
  const [searchVisible, setSearchVisible] = useState(false);
  const [notifications] = useState(MOCK_NOTIFICATIONS);

  const totalItems = CATEGORIES.reduce((sum, c) => sum + c.items.length, 0);
  const lowStock = CATEGORIES.reduce(
    (sum, c) => sum + c.items.filter((i) => i.status === "reorder").length,
    0,
  );

  const handleNavChange = (key: NavKey) => {
    setActiveTab(key);
    router.push(ROUTES[key] as any);
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: SURFACE }}>
      <StatusBar barStyle="dark-content" backgroundColor={SURFACE} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingTop: SPACE_4, paddingBottom: 160 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ---- Top bar: brand + notifications + account ---- */}
        <View className="flex-row items-center justify-between px-4">
          <View className="flex-row items-center">
            <BrandMark size={36} />
            <Text
              className="text-[17px]"
              style={{ color: TEXT_PRIMARY, fontFamily: FONT_BOLD }}
            >
              Mizani
            </Text>
          </View>

          <View className="flex-row items-center">
            <NotificationBell
              notifications={notifications}
              onViewAll={() => router.push("/(dashboard)/main" as any)}
            />
            <UserMenu initials="WM" />
          </View>
        </View>

        {/* ---- Branch / date / search row ---- */}
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
            label={dateRange}
            options={["Today", "This Week", "1 – 31 Aug 2026", "Custom range"]}
            onSelect={setDateRange}
          />
          <SearchTrigger onPress={() => setSearchVisible(true)} />
        </PillRow>

        {/* ---- Page title + download action ---- */}
        <View
          className="flex-row items-start justify-between px-4"
          style={{ marginTop: SPACE_5, marginBottom: SPACE_4 }}
        >
          <View className="flex-1 mr-3">
            <Text
              className="text-[26px]"
              style={{ color: TEXT_PRIMARY, fontFamily: FONT_BOLD }}
            >
              Inventory
            </Text>
            <Text
              className="text-[13px] mt-1"
              style={{ color: TEXT_SECONDARY, fontFamily: FONT_REG }}
            >
              {branch} · {CATEGORIES.length} categories · counted 16 Aug 2026
            </Text>
          </View>
        </View>

        <View className="px-4">
          <View className="mb-5">
            <GhostPillButton
              label="Stock report"
              icon={<Download size={14} color={TEXT_PRIMARY} />}
              onPress={() => {}}
            />
          </View>

          <StatCard
            title="Total Items"
            badgeLabel={`${CATEGORIES.length} categories`}
            value={String(totalItems)}
            helper="Distinct SKUs tracked at this branch"
          />

          <StatCard
            title="Low Stock"
            badgeLabel={`${lowStock} to reorder`}
            tone="warning"
            value={String(lowStock)}
            helper="Items at or below their reorder level"
          />

          {CATEGORIES.map((cat) => (
            <View key={cat.id}>
              <CategorySectionHeader
                name={cat.name}
                count={cat.items.length}
                toReorder={cat.toReorder}
              />
              {cat.items.map((item) => (
                <InventoryItemRow key={item.id} item={item} />
              ))}
            </View>
          ))}
        </View>
      </ScrollView>

      <AddProductFab
        onPress={() => router.push("/(dashboard)/add-transaction" as any)}
      />

      <BottomNav
        active={activeTab}
        onChange={handleNavChange}
        navItems={NAV_ITEMS}
        onAdd={() => router.push("/(dashboard)/add-transaction" as any)}
      />

      <SearchModal
        visible={searchVisible}
        onClose={() => setSearchVisible(false)}
        data={SEARCH_DATA}
        placeholder="Search products, SKUs, suppliers…"
        onSelect={(item) => {
          console.log("Selected:", item);
        }}
      />
    </SafeAreaView>
  );
}
