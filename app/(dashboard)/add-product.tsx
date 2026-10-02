import { createProduct, getSuppliers } from "@/services/dashboardDataService";
import type { SupplierResponse } from "@/types/supplier";
import { apiError } from "@/utils/header";
import { useRouter } from "expo-router";
import { Check } from "lucide-react-native";
import { useEffect, useState } from "react";
import { View } from "react-native";
import {
    Field,
    FieldLabel,
    FormScreen,
} from "../../components/dashboard/FormUI";
import {
    GRADIENT_FOREST,
    PrimaryButton,
    SelectorPill,
    showToast,
} from "../../components/dashboard/dashboardUI";

const NO_SUPPLIER = "No supplier";

export default function AddProductScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [threshold, setThreshold] = useState("");
  const [supplier, setSupplier] = useState(NO_SUPPLIER);
  const [suppliers, setSuppliers] = useState<SupplierResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSuppliers()
      .then(setSuppliers)
      .catch(() => {});
  }, []);

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

    setError(null);
    setSaving(true);
    try {
      await createProduct({
        name: name.trim(),
        sku: sku.trim(),
        category: category.trim() || undefined,
        unitPrice,
        stockQuantity: qty,
        lowStockThreshold: low,
        supplierId: suppliers.find((s) => s.name === supplier)?.id,
      });
      showToast(`${name.trim()} added`);
      router.back();
    } catch (err) {
      setError(apiError(err, "Failed to add product"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormScreen title="Add Product" error={error}>
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
      <Field
        label="Opening stock"
        value={stock}
        onChangeText={setStock}
        placeholder="0"
        keyboardType="number-pad"
      />
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
        label="Save product"
        icon={<Check size={16} color="#FFFFFF" />}
        onPress={save}
        colors={GRADIENT_FOREST}
      />
    </FormScreen>
  );
}
