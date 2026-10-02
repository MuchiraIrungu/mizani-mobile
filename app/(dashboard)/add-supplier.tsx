import { createSupplier } from "@/services/dashboardDataService";
import { apiError } from "@/utils/header";
import { useRouter } from "expo-router";
import { Check } from "lucide-react-native";
import { useState } from "react";
import { Field, FormScreen } from "../../components/dashboard/FormUI";
import {
    GRADIENT_FOREST,
    PrimaryButton,
    showToast,
} from "../../components/dashboard/dashboardUI";

export default function AddSupplierScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (saving) return;
    if (!name.trim()) return setError("Supplier name is required");
    setError(null);
    setSaving(true);
    try {
      await createSupplier({
        name: name.trim(),
        phone: phone.trim() || undefined,
        category: category.trim() || undefined,
      });
      showToast(`${name.trim()} added`);
      router.back();
    } catch (err) {
      setError(apiError(err, "Failed to add supplier"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormScreen title="Add Supplier" error={error}>
      <Field
        label="Supplier name"
        value={name}
        onChangeText={setName}
        placeholder="e.g. Unga Group"
      />
      <Field
        label="Phone (optional)"
        value={phone}
        onChangeText={setPhone}
        placeholder="07XX XXX XXX"
        keyboardType="phone-pad"
      />
      <Field
        label="Category (optional)"
        value={category}
        onChangeText={setCategory}
        placeholder="e.g. Dry goods"
      />
      <PrimaryButton
        label="Save supplier"
        icon={<Check size={16} color="#FFFFFF" />}
        onPress={save}
        colors={GRADIENT_FOREST}
      />
    </FormScreen>
  );
}
