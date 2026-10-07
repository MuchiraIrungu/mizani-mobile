import {
    createEmployee,
    deleteEmployee,
    getEmployee,
    updateEmployee,
} from "@/services/dashboardDataService";
import { apiError } from "@/utils/header";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Check, Trash2 } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Alert, View } from "react-native";
import { Field, FormScreen } from "../../components/dashboard/FormUI";
import {
    GRADIENT_CRIMSON,
    GRADIENT_FOREST,
    PrimaryButton,
    showToast,
    SPACE_4,
} from "../../components/dashboard/dashboardUI";

/* Add / edit employee. Opened with ?id=<employeeId> it edits and can delete. */

export default function AddEmployeeScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const editing = !!id;
  const [name, setName] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [phone, setPhone] = useState("");
  const [netPay, setNetPay] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    getEmployee(id)
      .then((e) => {
        setName(e.name);
        setRoleTitle(e.roleTitle ?? "");
        setPhone(e.phone ?? "");
        setNetPay(String(e.standardNetPay));
      })
      .catch((e) => setError(apiError(e, "Failed to load employee")));
  }, [id]);

  const save = async () => {
    if (saving) return;
    const standardNetPay = Number(netPay);
    if (!name.trim()) return setError("Employee name is required");
    if (!netPay.trim() || Number.isNaN(standardNetPay) || standardNetPay <= 0)
      return setError("Enter a monthly net pay above 0");
    const body = {
      name: name.trim(),
      roleTitle: roleTitle.trim() || undefined,
      phone: phone.trim() || undefined,
      standardNetPay,
    };
    setError(null);
    setSaving(true);
    try {
      if (editing) {
        await updateEmployee(id, body);
        showToast(`${body.name} updated`);
      } else {
        await createEmployee(body);
        showToast(`${body.name} added`);
      }
      router.back();
    } catch (err) {
      setError(apiError(err, "Failed to save employee"));
    } finally {
      setSaving(false);
    }
  };

  const remove = () => {
    if (!id) return;
    Alert.alert("Remove employee", `Remove ${name} from the register?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteEmployee(id);
            showToast(`${name} removed`);
            router.back();
          } catch (err) {
            setError(apiError(err, "Failed to remove employee"));
          }
        },
      },
    ]);
  };

  return (
    <FormScreen title={editing ? "Edit Employee" : "Add Employee"} error={error}>
      <Field
        label="Full name"
        value={name}
        onChangeText={setName}
        placeholder="e.g. Jane Wanjiku"
      />
      <Field
        label="Role / title (optional)"
        value={roleTitle}
        onChangeText={setRoleTitle}
        placeholder="e.g. Cashier"
      />
      <Field
        label="Phone (optional)"
        value={phone}
        onChangeText={setPhone}
        placeholder="07XX XXX XXX"
        keyboardType="phone-pad"
      />
      <Field
        label="Monthly net pay (KSh)"
        value={netPay}
        onChangeText={setNetPay}
        placeholder="0.00"
        keyboardType="numeric"
      />
      <PrimaryButton
        label={editing ? "Save changes" : "Save employee"}
        icon={<Check size={16} color="#FFFFFF" />}
        onPress={save}
        colors={GRADIENT_FOREST}
      />
      {editing && (
        <View style={{ marginTop: SPACE_4 }}>
          <PrimaryButton
            label="Remove employee"
            icon={<Trash2 size={16} color="#FFFFFF" />}
            onPress={remove}
            colors={GRADIENT_CRIMSON}
          />
        </View>
      )}
    </FormScreen>
  );
}
