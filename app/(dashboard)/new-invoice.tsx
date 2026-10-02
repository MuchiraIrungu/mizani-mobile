import {
    completeSale,
    createInvoice,
    createSale,
    getCustomers,
    getProducts,
} from "@/services/dashboardDataService";
import { useAuthStore } from "@/store/authStore";
import type { ProductResponse } from "@/types/product";
import type { CustomerResponse } from "@/types/sales";
import { ksh } from "@/utils/dashboardStats";
import { apiError } from "@/utils/header";
import { useFocusEffect, useRouter } from "expo-router";
import { Check, Plus } from "lucide-react-native";
import { useCallback, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import {
    Field,
    FieldLabel,
    FormScreen,
} from "../../components/dashboard/FormUI";
import {
    DANGER,
    FONT_MED,
    GhostPillButton,
    GRADIENT_FOREST,
    PillTabs,
    PrimaryButton,
    SelectorPill,
    showToast,
    TEXT_PRIMARY,
    TEXT_SECONDARY,
} from "../../components/dashboard/dashboardUI";

const TERMS = ["7 days", "14 days", "30 days"];
type Line = { product: string; qty: string };

const isoDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export default function NewInvoiceScreen() {
  const router = useRouter();
  const branchId = useAuthStore((s) => s.user?.branchId);
  const [customers, setCustomers] = useState<CustomerResponse[]>([]);
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [customer, setCustomer] = useState("");
  const [lines, setLines] = useState<Line[]>([{ product: "", qty: "1" }]);
  const [terms, setTerms] = useState("30 days");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState("Credit invoice");

  const walkIn = mode === "Walk-in sale";

  useFocusEffect(
    useCallback(() => {
      getCustomers()
        .then(setCustomers)
        .catch(() => {});
      getProducts()
        .then(setProducts)
        .catch(() => {});
    }, []),
  );

  const label = (p: ProductResponse) => `${p.name} (${p.sku})`;
  const total = useMemo(
    () =>
      lines.reduce((sum, l) => {
        const p = products.find((x) => label(x) === l.product);
        return sum + (p ? p.unitPrice * (Number.parseInt(l.qty, 10) || 0) : 0);
      }, 0),
    [lines, products],
  );

  const setLine = (i: number, patch: Partial<Line>) =>
    setLines((ls) => ls.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));

  const save = async () => {
    if (saving) return;
    const cust = customers.find((c) => c.name === customer);
    if (!walkIn && !cust) return setError("Select a customer");
    if (!branchId) return setError("No branch assigned to your account");

    const lineItems: { productId: string; quantity: number }[] = [];
    for (const l of lines) {
      const p = products.find((x) => label(x) === l.product);
      const quantity = Number.parseInt(l.qty, 10);
      if (!p || Number.isNaN(quantity) || quantity <= 0)
        return setError("Each line needs a product and a quantity above 0");
      lineItems.push({ productId: p.id, quantity });
    }

    const due = new Date();
    due.setDate(due.getDate() + Number.parseInt(terms, 10));

    setError(null);
    setSaving(true);
    try {
      const sale = await createSale(branchId, {
        customerId: cust?.id,
        currency: "KES",
        status: "PENDING",
        lineItems,
      });
      try {
        if (walkIn) {
          await completeSale(sale.id);
        } else {
          await createInvoice({
            saleId: sale.id,
            customerId: cust!.id,
            dueDate: isoDate(due),
            etimsValidated: false,
          });
        }
      } catch (err) {
        setError(
          `Sale saved as pending, but this step failed: ${apiError(err, "unknown error")}`,
        );
        return;
      }
      showToast(walkIn ? "Sale recorded" : "Invoice created");
      router.back();
    } catch (err) {
      setError(apiError(err, "Failed to save"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormScreen title={walkIn ? "New Sale" : "New Invoice"} error={error}>
      <View className="mb-5">
        <PillTabs
          options={["Credit invoice", "Walk-in sale"]}
          value={mode}
          onChange={setMode}
        />
      </View>

      {!walkIn && (
        <>
          <FieldLabel label="Customer" />
          <View className="mb-2 flex-row">
            <SelectorPill
              label={customer || "Select customer"}
              options={customers.map((c) => c.name)}
              onSelect={setCustomer}
            />
          </View>
          <View className="mb-5">
            <GhostPillButton
              label="Add new customer"
              icon={<Plus size={14} color={TEXT_SECONDARY} />}
              onPress={() => router.push("/(dashboard)/add-customer")}
            />
          </View>
        </>
      )}

      <FieldLabel label="Items" />
      {lines.map((l, i) => (
        <View key={i} className="mb-3">
          <View className="mb-2 flex-row">
            <SelectorPill
              label={l.product || "Select product"}
              options={products.map(label)}
              onSelect={(v) => setLine(i, { product: v })}
            />
          </View>
          <Field
            label="Quantity"
            value={l.qty}
            onChangeText={(v) => setLine(i, { qty: v })}
            keyboardType="number-pad"
          />
          {lines.length > 1 && (
            <Pressable
              onPress={() => setLines((ls) => ls.filter((_, idx) => idx !== i))}
              className="mb-3"
            >
              <Text
                style={{ color: DANGER, fontFamily: FONT_MED }}
                className="text-[12px]"
              >
                Remove item
              </Text>
            </Pressable>
          )}
        </View>
      ))}
      <View className="mb-5">
        <GhostPillButton
          label="Add another item"
          icon={<Plus size={14} color={TEXT_SECONDARY} />}
          onPress={() => setLines((ls) => [...ls, { product: "", qty: "1" }])}
        />
      </View>

      {!walkIn && (
        <>
          <FieldLabel label="Payment terms" />
          <View className="mb-5">
            <PillTabs options={TERMS} value={terms} onChange={setTerms} />
          </View>
        </>
      )}

      <Text
        className="text-[15px] mb-5"
        style={{ color: TEXT_PRIMARY, fontFamily: FONT_MED }}
      >
        Total: KSh {ksh(total)}
      </Text>

      <PrimaryButton
        label={walkIn ? "Record sale" : "Create invoice"}
        icon={<Check size={16} color="#FFFFFF" />}
        onPress={save}
        colors={GRADIENT_FOREST}
      />
    </FormScreen>
  );
}
