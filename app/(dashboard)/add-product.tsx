import {
    adjustStock,
    createProduct,
    deleteProduct,
    getProduct,
    getSuppliers,
    updateProduct,
} from "@/services/dashboardDataService";
import type { ProductResponse } from "@/types/product";
import type { SupplierResponse } from "@/types/supplier";
import { apiError } from "@/utils/header";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Check, PackagePlus, Trash2 } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Alert, View } from "react-native";
import {
    Field,
    FieldLabel,
    FormScreen,
} from "../../components/dashboard/FormUI";
import {
    GRADIENT_CRIMSON,
    GRADIENT_FOREST,
    PillTabs,
    PrimaryButton,
    SectionHeading,
    SelectorPill,
    showToast,
    SPACE_4,
} from "../../components/dashboard/dashboardUI";

const NO_SUPPLIER = "No supplier";
const ADJUST_MODES = ["Add stock", "Remove stock"];

/* Add / edit product. Opened with ?id=<productId> it loads the product and
   also offers stock adjustment and delete. */

export default function AddProductScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const editing = !!id;
  const [product, setProduct] = useState<ProductResponse | null>(null);
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [threshold, setThreshold] = useState("");
  const [supplier, setSupplier] = useState(NO_SUPPLIER);
  const [suppliers, setSuppliers] = useState<SupplierResponse[]>([]);
  const [adjustMode, setAdjustMode] = useState(ADJUST_MODES[0]);
  const [adjustQty, setAdjustQty] = useState("");
  const [adjustReason, setAdjustReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      getSuppliers().catch((): SupplierResponse[] => []),
      id ? getProduct(id) : Promise.resolve(null),
    ])
      .then(([s, p]) => {
        setSuppliers(s);
        if (!p) return;
        setProduct(p);
        setName(p.name);
        setSku(p.sku);
        setCategory(p.category ?? "");
        setPrice(String(p.unitPrice));
        setThreshold(String(p.lowStockThreshold));
        setSupplier(
          s.find((x) => x.id === p.supplierId)?.name ?? NO_SUPPLIER,
        );
      })
      .catch((e) => setError(apiError(e, "Failed to load product")));
  }, [id]);

  const save = async () => {
    if (saving) return;
    const unitPrice = Number(price);
    if (!name.trim() || !sku.trim())
      return setError("Name and SKU are required");
    if (!price.trim() || Number.isNaN(unitPrice) || unitPrice < 0)
      return setError("Enter a valid unit price");
    const qty = stock.trim() ? Number.parseInt(stock, 10) : 0;
    const low = threshold.trim() ? Number.parseInt(threshold, 10) : 0;
    if (Number.isNaN(qty) || qty < 0 || Number.isNaN(low) || low < 0)
      return setError("Stock figures must be whole numbers");

    const body = {
      name: name.trim(),
      sku: sku.trim(),
      category: category.trim() || undefined,
      unitPrice,
      lowStockThreshold: low,
      supplierId: suppliers.find((s) => s.name === supplier)?.id,
    };

    setError(null);
    setSaving(true);
    try {
      if (editing) {
        // Stock is changed through adjustments below, never overwritten here.
        await updateProduct(id, body);
        showToast(`${body.name} updated`);
      } else {
        await createProduct({ ...body, stockQuantity: qty });
        showToast(`${body.name} added`);
      }
      router.back();
    } catch (err) {
      setError(apiError(err, "Failed to save product"));
    } finally {
      setSaving(false);
    }
  };

  const applyAdjustment = async () => {
    if (saving || !id) return;
    const qty = Number.parseInt(adjustQty, 10);
    if (Number.isNaN(qty) || qty <= 0)
      return setError("Enter a whole quantity above 0");
    setError(null);
    setSaving(true);
    try {
      const updated = await adjustStock(id, {
        quantityChange: adjustMode === "Add stock" ? qty : -qty,
        reason: adjustReason.trim() || adjustMode,
      });
      setProduct(updated);
      setAdjustQty("");
      setAdjustReason("");
      showToast(`Stock is now ${updated.stockQuantity}`);
    } catch (err) {
      setError(apiError(err, "Failed to adjust stock"));
    } finally {
      setSaving(false);
    }
  };

  const remove = () => {
    if (!id) return;
    Alert.alert("Delete product", `Delete ${name}? This cannot be undone.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteProduct(id);
            showToast(`${name} deleted`);
            router.back();
          } catch (err) {
            setError(apiError(err, "Failed to delete product"));
          }
        },
      },
    ]);
  };

  return (
    <FormScreen title={editing ? "Edit Product" : "Add Product"} error={error}>
      <Field
        label="Product name"
        value={name}
        onChangeText={setName}
        placeholder="e.g. Maize flour 2kg"
      />
      <Field
        label="SKU"
        value={sku}
        onChangeText={setSku}
        placeholder="e.g. DRY-MZ-2000"
        autoCapitalize="characters"
      />
      <Field
        label="Category"
        value={category}
        onChangeText={setCategory}
        placeholder="e.g. Dry goods"
      />
      <Field
        label="Unit price (KSh)"
        value={price}
        onChangeText={setPrice}
        placeholder="0.00"
        keyboardType="numeric"
      />
      {!editing && (
        <Field
          label="Opening stock"
          value={stock}
          onChangeText={setStock}
          placeholder="0"
          keyboardType="number-pad"
        />
      )}
      <Field
        label="Reorder level"
        value={threshold}
        onChangeText={setThreshold}
        placeholder="0"
        keyboardType="number-pad"
      />
      <FieldLabel label="Supplier (optional)" />
      <View className="mb-6 flex-row">
        <SelectorPill
          label={supplier}
          options={[NO_SUPPLIER, ...suppliers.map((s) => s.name)]}
          onSelect={setSupplier}
        />
      </View>
      <PrimaryButton
        label={editing ? "Save changes" : "Save product"}
        icon={<Check size={16} color="#FFFFFF" />}
        onPress={save}
        colors={GRADIENT_FOREST}
      />

      {editing && (
        <>
          <View style={{ marginTop: SPACE_4 }}>
            <SectionHeading
              title="Adjust stock"
              subtitle={`${product?.stockQuantity ?? 0} units on hand`}
            />
          </View>
          <View className="mb-5">
            <PillTabs
              options={ADJUST_MODES}
              value={adjustMode}
              onChange={setAdjustMode}
            />
          </View>
          <Field
            label="Quantity"
            value={adjustQty}
            onChangeText={setAdjustQty}
            placeholder="0"
            keyboardType="number-pad"
          />
          <Field
            label="Reason (optional)"
            value={adjustReason}
            onChangeText={setAdjustReason}
            placeholder="e.g. Delivery received, damaged goods"
          />
          <PrimaryButton
            label="Apply adjustment"
            icon={<PackagePlus size={16} color="#FFFFFF" />}
            onPress={applyAdjustment}
            colors={GRADIENT_FOREST}
          />
          <View style={{ marginTop: SPACE_4 }}>
            <PrimaryButton
              label="Delete product"
              icon={<Trash2 size={16} color="#FFFFFF" />}
              onPress={remove}
              colors={GRADIENT_CRIMSON}
            />
          </View>
        </>
      )}
    </FormScreen>
  );
}
