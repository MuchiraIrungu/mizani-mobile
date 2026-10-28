import { Boxes, Pencil, Plus, Trash2 } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Text, View } from "react-native";

import {
  ActionSheet,
  Appear,
  ConfirmSheet,
  EmptyState,
  ErrorState,
  FormSheet,
  GroupLabel,
  LoadingState,
  MoreButton,
  PressableScale,
  type Field,
  type FormValues,
} from "../../components/dashboard/crud";
import {
  AlertBanner,
  BG,
  FONT_REG,
  FONT_SEMI,
  GRADIENT_FOREST,
  GradientStatCard,
  GREEN,
  GREEN_TINT,
  PageTitle,
  PillRow,
  PrimaryButton,
  SearchModal,
  SearchTrigger,
  SelectorPill,
  SHADOW_SM,
  showToast,
  SPACE_4,
  StatCard,
  StatusPill,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  WARNING_BG,
  WARNING_DARK,
  type SearchItem,
} from "../../components/dashboard/dashboardUI";
import { Body, Screen } from "../../components/dashboard/Screen";
import { useResource } from "../../hooks/useResource";
import { productApi, supplierApi } from "../../services/resources";
import type { Product, ProductInput, Supplier } from "../../types/api";
import { ksh, relativeTime, sum } from "../../utils/format";

/* Inventory — products grouped by category, with reorder warnings,
   add/edit/delete and stock adjustments. */

const ALL = "All categories";
const UNCATEGORISED = "Uncategorised";

const isLow = (p: Product) => p.stockQuantity <= p.lowStockThreshold;
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

function ProductRow({ product, supplier, onMore }: { product: Product; supplier?: string; onMore: () => void }) {
  const low = isLow(product);
  const out = product.stockQuantity <= 0;
  return (
    <PressableScale
      onPress={onMore}
      className="flex-row items-center rounded-[12px] p-4 mb-3"
      style={{ backgroundColor: BG, ...SHADOW_SM }}
    >
      <View
        className="w-10 h-10 rounded-[10px] items-center justify-center mr-3"
        style={{ backgroundColor: low ? WARNING_BG : GREEN_TINT }}
      >
        <Boxes size={18} color={low ? WARNING_DARK : GREEN} />
      </View>

      <View className="flex-1 mr-2">
        <Text className="text-[14px] mb-1" numberOfLines={1} style={{ color: TEXT_PRIMARY, fontFamily: FONT_SEMI }}>
          {product.name}
        </Text>
        <Text className="text-[12px]" numberOfLines={1} style={{ color: TEXT_SECONDARY, fontFamily: FONT_REG }}>
          {[product.sku, supplier, ksh(product.unitPrice)].filter(Boolean).join(" · ")}
        </Text>
      </View>

      <View className="items-end">
        <Text className="text-[15px] mb-1.5" style={{ color: TEXT_PRIMARY, fontFamily: FONT_SEMI }}>
          {product.stockQuantity}
          <Text className="text-[12px]" style={{ color: TEXT_SECONDARY, fontFamily: FONT_REG }}> in stock</Text>
        </Text>
        <StatusPill label={out ? "Out of stock" : low ? "Reorder" : "In stock"} tone={out ? "danger" : low ? "warning" : "positive"} />
      </View>
      <MoreButton onPress={onMore} />
    </PressableScale>
  );
}

export default function InventoryScreen() {
  const products = useResource<Product[]>(() => productApi.list(), []);
  const suppliers = useResource<Supplier[]>(supplierApi.list, []);
  const [category, setCategory] = useState(ALL);
  const [searchVisible, setSearchVisible] = useState(false);

  const [form, setForm] = useState<{ mode: "create" | "edit"; product?: Product } | null>(null);
  const [adjusting, setAdjusting] = useState<Product | null>(null);
  const [actionsFor, setActionsFor] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);

  const supplierName = (id: string | null) => suppliers.data.find((s) => s.id === id)?.name;

  const groups = useMemo(() => {
    const map = new Map<string, Product[]>();
    products.data.forEach((p) => {
      const key = p.category?.trim() || UNCATEGORISED;
      map.set(key, [...(map.get(key) ?? []), p]);
    });
    return [...map.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, items]) => ({ name, items: items.sort((x, y) => x.name.localeCompare(y.name)) }));
  }, [products.data]);

  const visible = category === ALL ? groups : groups.filter((g) => g.name === category);
  const lowStock = products.data.filter(isLow);
  const outOfStock = products.data.filter((p) => p.stockQuantity <= 0);
  const stockValue = sum(products.data, (p) => p.unitPrice * p.stockQuantity);
  const lastUpdate = products.data.reduce<string | null>(
    (latest, p) => (!latest || p.updatedAt > latest ? p.updatedAt : latest),
    null,
  );

  const searchData: SearchItem[] = products.data.map((p) => ({
    id: p.id,
    title: p.name,
    subtitle: [p.sku, supplierName(p.supplierId), `${p.stockQuantity} in stock`].filter(Boolean).join(" · "),
  }));

  const productFields: Field[] = [
    { key: "name", label: "Product name", required: true, placeholder: "e.g. Maize flour 2kg — Jogoo" },
    { key: "sku", label: "SKU", placeholder: "e.g. DRY-MZ-2000" },
    { key: "category", label: "Category", placeholder: "e.g. Dry goods" },
    {
      key: "supplierId",
      label: "Supplier",
      type: "select",
      placeholder: "No supplier",
      options: [{ label: "No supplier", value: "" }, ...suppliers.data.map((s) => ({ label: s.name, value: s.id }))],
    },
    { key: "unitPrice", label: "Unit price (KSh)", type: "number", required: true, min: 0 },
    { key: "stockQuantity", label: "Quantity in stock", type: "number", required: true, min: 0 },
    { key: "lowStockThreshold", label: "Reorder level", type: "number", required: true, min: 0, helper: "You'll be warned when stock falls to this level." },
  ];

  const toInput = (v: FormValues): ProductInput => ({
    name: String(v.name).trim(),
    sku: String(v.sku || "").trim() || undefined,
    category: String(v.category || "").trim() || undefined,
    supplierId: v.supplierId ? String(v.supplierId) : null,
    unitPrice: Number(v.unitPrice),
    stockQuantity: Math.round(Number(v.stockQuantity)),
    lowStockThreshold: Math.round(Number(v.lowStockThreshold)),
  });

  const saveProduct = async (v: FormValues) => {
    if (form?.mode === "edit" && form.product) {
      const updated = await productApi.update(form.product.id, toInput(v));
      products.setData((list) => list.map((p) => (p.id === updated.id ? updated : p)));
      showToast(`${updated.name} updated`);
    } else {
      const created = await productApi.create(toInput(v));
      products.setData((list) => [created, ...list]);
      showToast(`${created.name} added`);
    }
    setForm(null);
  };

  const adjustStock = async (v: FormValues) => {
    if (!adjusting) return;
    const change = Math.round(Number(v.quantity)) * (v.direction === "remove" ? -1 : 1);
    const updated = await productApi.adjustStock(adjusting.id, change, String(v.reason || "Manual adjustment"));
    products.setData((list) => list.map((p) => (p.id === updated.id ? updated : p)));
    showToast(`${updated.name}: ${updated.stockQuantity} in stock`);
    setAdjusting(null);
  };

  return (
    <Screen
      refreshing={products.refreshing}
      onRefresh={() => {
        products.refresh();
        suppliers.reload();
      }}
      overlays={
        <>
          <SearchModal
            visible={searchVisible}
            onClose={() => setSearchVisible(false)}
            data={searchData}
            placeholder="Search products, SKUs, suppliers…"
            onSelect={(item) => setActionsFor(products.data.find((p) => p.id === item.id) ?? null)}
          />
          <FormSheet
            visible={!!form}
            title={form?.mode === "edit" ? "Edit product" : "Add product"}
            subtitle={form?.mode === "edit" ? form.product?.name : "It will appear in stock and in the sale form."}
            fields={productFields}
            initialValues={
              form?.product
                ? {
                    name: form.product.name,
                    sku: form.product.sku ?? "",
                    category: form.product.category ?? "",
                    supplierId: form.product.supplierId ?? "",
                    unitPrice: String(form.product.unitPrice),
                    stockQuantity: String(form.product.stockQuantity),
                    lowStockThreshold: String(form.product.lowStockThreshold),
                  }
                : { lowStockThreshold: "10", stockQuantity: "0" }
            }
            submitLabel={form?.mode === "edit" ? "Save changes" : "Add product"}
            onSubmit={saveProduct}
            onClose={() => setForm(null)}
          />
          <FormSheet
            visible={!!adjusting}
            title="Adjust stock"
            subtitle={adjusting ? `${adjusting.name} · ${adjusting.stockQuantity} in stock now` : undefined}
            fields={[
              {
                key: "direction",
                label: "Change",
                type: "select",
                required: true,
                options: [
                  { label: "Add stock (delivery, return)", value: "add" },
                  { label: "Remove stock (damage, loss, count)", value: "remove" },
                ],
              },
              { key: "quantity", label: "Quantity", type: "number", required: true, min: 1 },
              { key: "reason", label: "Reason", placeholder: "e.g. Delivery from Unga Group" },
            ]}
            initialValues={{ direction: "add" }}
            submitLabel="Update stock"
            onSubmit={adjustStock}
            onClose={() => setAdjusting(null)}
          />
          <ActionSheet
            visible={!!actionsFor}
            title={actionsFor?.name ?? ""}
            subtitle={actionsFor ? `${actionsFor.stockQuantity} in stock · ${ksh(actionsFor.unitPrice)} each` : undefined}
            onClose={() => setActionsFor(null)}
            actions={
              actionsFor
                ? [
                    { label: "Edit product", icon: (c) => <Pencil size={17} color={c} />, onPress: () => setForm({ mode: "edit", product: actionsFor }) },
                    { label: "Adjust stock", icon: (c) => <Plus size={17} color={c} />, tone: "positive", onPress: () => setAdjusting(actionsFor) },
                    { label: "Delete product", icon: (c) => <Trash2 size={17} color={c} />, tone: "danger", onPress: () => setDeleting(actionsFor) },
                  ]
                : []
            }
          />
          <ConfirmSheet
            visible={!!deleting}
            title="Delete product?"
            message={`${deleting?.name ?? "This product"} will be removed from inventory. Past sales keep their records.`}
            confirmLabel="Delete"
            onConfirm={async () => {
              if (!deleting) return;
              await productApi.remove(deleting.id);
              products.setData((list) => list.filter((p) => p.id !== deleting.id));
              showToast(`${deleting.name} deleted`);
              setDeleting(null);
            }}
            onClose={() => setDeleting(null)}
          />
        </>
      }
    >
      <PillRow>
        <SelectorPill label={category} options={[ALL, ...groups.map((g) => g.name)]} onSelect={setCategory} />
        <SearchTrigger onPress={() => setSearchVisible(true)} />
      </PillRow>

      <PageTitle
        title="Inventory"
        subtitle={`${plural(products.data.length, "product")} · ${plural(groups.length, "category", "categories")}${lastUpdate ? ` · updated ${relativeTime(lastUpdate)}` : ""}`}
      />

      <Body>
        {products.error && <ErrorState message={products.error} onRetry={products.refresh} />}

        {products.loading ? (
          <LoadingState />
        ) : (
          <>
            {lowStock.length > 0 && (
              <Appear index={0}>
                <AlertBanner
                  tone="warning"
                  title={`${lowStock.length} product${lowStock.length === 1 ? " needs" : "s need"} reordering`}
                  description={`${lowStock.slice(0, 3).map((p) => p.name).join(", ")}${lowStock.length > 3 ? "…" : ""} ${lowStock.length === 1 ? "is" : "are"} at or below the reorder level.`}
                  actionLabel="Restock first item"
                  onAction={() => setAdjusting(lowStock[0])}
                />
              </Appear>
            )}

            <Appear index={1}>
              <GradientStatCard
                title="Stock on Hand"
                badgeLabel={plural(groups.length, "category", "categories")}
                value={ksh(stockValue)}
                helper={`${plural(products.data.length, "product")} valued at their selling price`}
                rows={groups.slice(0, 3).map((g) => ({
                  label: g.name,
                  value: ksh(sum(g.items, (p) => p.unitPrice * p.stockQuantity)),
                }))}
                colors={GRADIENT_FOREST}
              />
            </Appear>

            <Appear index={2}>
              <StatCard
                title="Low Stock"
                tone="warning"
                badgeLabel={`${lowStock.length} to reorder`}
                value={String(lowStock.length)}
                helper="Products at or below their reorder level"
                footerStats={[
                  { label: "TO REORDER", value: String(lowStock.length - outOfStock.length) },
                  { label: "OUT OF STOCK", value: String(outOfStock.length) },
                  { label: "HEALTHY", value: String(products.data.length - lowStock.length) },
                ]}
              />
            </Appear>

            <Appear index={3} style={{ marginBottom: SPACE_4 }}>
              <PrimaryButton
                label="Add Product"
                icon={<Plus size={16} color="#FFFFFF" />}
                onPress={() => setForm({ mode: "create" })}
                colors={GRADIENT_FOREST}
              />
            </Appear>

            {products.data.length === 0 && !products.error ? (
              <EmptyState
                icon={<Boxes size={24} color={GREEN} />}
                title="No products yet"
                message="Add the items you sell to track stock, get reorder warnings and record sales."
                actionLabel="Add your first product"
                onAction={() => setForm({ mode: "create" })}
              />
            ) : (
              visible.map((group, gi) => (
                <View key={group.name}>
                  <GroupLabel
                    label={`${group.name} · ${group.items.length}`}
                    trailing={
                      group.items.filter(isLow).length > 0 ? (
                        <StatusPill label={`${group.items.filter(isLow).length} to reorder`} tone="warning" />
                      ) : undefined
                    }
                  />
                  {group.items.map((p, i) => (
                    <Appear key={p.id} index={gi * 3 + i + 4}>
                      <ProductRow product={p} supplier={supplierName(p.supplierId)} onMore={() => setActionsFor(p)} />
                    </Appear>
                  ))}
                </View>
              ))
            )}
          </>
        )}
      </Body>
    </Screen>
  );
}
