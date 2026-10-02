import { createCustomer } from "@/services/dashboardDataService";
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

export default function AddCustomerScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (saving) return;
    if (!name.trim()) return setError("Customer name is required");
    setError(null);
    setSaving(true);
    try {
      await createCustomer({
        name: name.trim(),
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
      });
      showToast(`${name.trim()} added`);
      router.back();
    } catch (err) {
      setError(apiError(err, "Failed to add customer"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormScreen title="Add Customer" error={error}>
      <Field
        label="Customer name"
        value={name}
        onChangeText={setName}
        placeholder="e.g. Sokoni Retail Group"
      />
      <Field
        label="Phone (optional)"
        value={phone}
        onChangeText={setPhone}
        placeholder="07XX XXX XXX"
        keyboardType="phone-pad"
      />
      <Field
        label="Email (optional)"
        value={email}
        onChangeText={setEmail}
        placeholder="accounts@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <PrimaryButton
        label="Save customer"
        icon={<Check size={16} color="#FFFFFF" />}
        onPress={save}
        colors={GRADIENT_FOREST}
      />
    </FormScreen>
  );
}
