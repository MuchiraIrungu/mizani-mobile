import { useRouter } from "expo-router";
import { Check, ChevronLeft, X } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeOut, LinearTransition } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { SelectField } from "../../components/dashboard/crud";
import {
  BG,
  BORDER,
  ErrorBanner,
  FONT_MED,
  FONT_REG,
  FONT_SEMI,
  FormCard,
  GRADIENT_FOREST,
  GREEN,
  GREEN_TINT,
  PillTabs,
  PrimaryButton,
  SHADOW_SM,
  showToast,
  SPACE_4,
  SURFACE,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  ToastHost,
} from "../../components/dashboard/dashboardUI";
import { useBranches } from "../../components/dashboard/Screen";
import { useResource } from "../../hooks/useResource";
import { apiError } from "../../services/api";
import { customerApi, expenseApi, productApi, saleApi, supplierApi, supplierPaymentApi } from "../../services/resources";
import type { Customer, Product, Supplier } from "../../types/api";
import { ksh } from "../../utils/format";

/* Add Transaction — quick entry behind the bottom nav's "+" button.
   Sale → POST /sales (+ complete), Purchase → supplier payment,
   Expense → POST /expenses. Each lands in the ledger. */

const TRANSACTION_TYPES = ["Sale", "Purchase", "Expense"] as const;
type TxType = (typeof TRANSACTION_TYPES)[number];
const PAYMENT_SOURCES = ["M-Pesa", "Bank", "Cash"];
const EXPENSE_CATEGORIES = ["Rent", "Utilities", "Transport", "Supplies", "Marketing", "Other"];

function FieldLabel({ label }: { label: string }) {
  return (
    <Text className="text-[13px] mb-2" style={{ color: TEXT_PRIMARY, fontFamily: FONT_MED }}>
      {label}
    </Text>
  );
}

/** Animated block so fields slide in/out when the transaction type changes. */
function Section({ children }: { children: React.ReactNode }) {
  return (
    <Animated.View entering={FadeInDown.duration(260)} exiting={FadeOut.duration(120)} layout={LinearTransition}>
      {children}
    </Animated.View>
  );
}

export default function AddTransactionScreen() {
  const router = useRouter();
  const products = useResource<Product[]>(() => productApi.list(), []);
  const suppliers = useResource<Supplier[]>(supplierApi.list, []);
  const customers = useResource<Customer[]>(customerApi.list, []);
  const { branchId, main } = useBranches();

  const [type, setType] = useState<TxType>("Sale");
  const [source, setSource] = useState("M-Pesa");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [customerId, setCustomerId] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [paidNow, setPaidNow] = useState(true);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const product = products.data.find((p) => p.id === productId);
  const saleTotal = product ? product.unitPrice * Math.max(0, Number(quantity) || 0) : 0;
  const targetBranch = branchId ?? main?.id ?? null;

  const handleSave = async () => {
    if (saving) return;
    setError(null);
    const qty = Math.round(Number(quantity));
    const amt = Number(amount.replace(/,/g, ""));

    if (type === "Sale") {
      if (!product) return setError("Choose the product you sold.");
      if (!qty || qty < 1) return setError("Enter how many you sold.");
      if (qty > product.stockQuantity) return setError(`Only ${product.stockQuantity} ${product.name} in stock.`);
    } else {
      if (!amt || amt <= 0) return setError("Enter an amount before saving.");
      if (type === "Purchase" && !supplierId) return setError("Choose the supplier you bought from.");
      if (type === "Expense" && !category.trim()) return setError("Pick or type a category.");
    }
    if (!targetBranch && type !== "Purchase") return setError("Create a branch in Settings first.");

    setSaving(true);
    try {
      if (type === "Sale") {
        let sale = await saleApi.create({
          branchId: targetBranch!,
          customerId: customerId || null,
          currency: "KES",
          lineItems: [{ productId: product!.id, quantity: qty }],
        });
        if (paidNow) sale = await saleApi.complete(sale.id);
        showToast(`Sale of ${ksh(sale.totalAmount)} ${paidNow ? "recorded" : "saved as pending"}`);
        router.replace("/(dashboard)/sales");
      } else if (type === "Purchase") {
        let payment = await supplierPaymentApi.create({
          supplierId,
          amount: amt,
          referenceNumber: reference.trim() || undefined,
          currency: "KES",
        });
        if (paidNow) payment = await supplierPaymentApi.complete(payment.id);
        showToast(`${ksh(payment.amount)} ${paidNow ? "paid to" : "owed to"} ${payment.supplierName ?? "supplier"}`);
        router.replace("/(dashboard)/suppliers");
      } else {
        await expenseApi.create({
          branchId: targetBranch!,
          category: category.trim(),
          description: [notes.trim(), reference.trim() && `Ref ${reference.trim()}`, `Paid via ${source}`].filter(Boolean).join(" · "),
          amount: amt,
          currency: "KES",
        });
        showToast(`Expense of ${ksh(amt)} saved`);
        router.replace("/(dashboard)/main");
      }
    } catch (err) {
      setError(apiError(err));
      setSaving(false);
    }
  };

  const inputStyle = (field: string) => ({
    borderColor: focusedField === field ? GREEN : BORDER,
    borderWidth: 1,
  });

  const textInput = (
    field: string,
    value: string,
    onChange: (v: string) => void,
    props: Partial<React.ComponentProps<typeof TextInput>> = {},
  ) => (
    <TextInput
      value={value}
      onChangeText={onChange}
      onFocus={() => setFocusedField(field)}
      onBlur={() => setFocusedField(null)}
      placeholderTextColor={TEXT_SECONDARY}
      className="h-[52px] px-4 rounded-[12px] text-[15px] mb-5"
      style={{ backgroundColor: BG, color: TEXT_PRIMARY, fontFamily: FONT_REG, ...inputStyle(field) }}
      {...props}
    />
  );

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: SURFACE }}>
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View className="flex-row items-center justify-between px-4 py-3">
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 rounded-[999px] items-center justify-center"
            style={{ backgroundColor: BG, ...SHADOW_SM }}
          >
            <ChevronLeft size={18} color={TEXT_PRIMARY} />
          </Pressable>
          <Text className="text-[16px]" style={{ color: TEXT_PRIMARY, fontFamily: FONT_SEMI }}>
            Add Transaction
          </Text>
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 rounded-[999px] items-center justify-center"
            style={{ backgroundColor: BG, ...SHADOW_SM }}
          >
            <X size={18} color={TEXT_SECONDARY} />
          </Pressable>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: SPACE_4, paddingBottom: 48 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <FormCard>
            {!!error && (
              <Animated.View entering={FadeInDown.duration(180)}>
                <ErrorBanner message={error} />
              </Animated.View>
            )}

            <FieldLabel label="Transaction type" />
            <View className="mb-2">
              <PillTabs options={[...TRANSACTION_TYPES]} value={type} onChange={(v) => setType(v as TxType)} />
            </View>

            {type === "Sale" && (
              <Section key="sale">
                <FieldLabel label="Product" />
                <View className="mb-5">
                  <SelectField
                    field={{
                      key: "product",
                      label: "Product",
                      placeholder: products.data.length ? "Choose a product" : "No products — add some in Inventory",
                      options: products.data.map((p) => ({ label: `${p.name} · ${ksh(p.unitPrice)} · ${p.stockQuantity} left`, value: p.id })),
                    }}
                    value={productId}
                    onChange={setProductId}
                  />
                </View>

                <FieldLabel label="Quantity" />
                {textInput("qty", quantity, setQuantity, { keyboardType: "number-pad", placeholder: "1" })}

                <FieldLabel label="Customer (optional)" />
                <View className="mb-5">
                  <SelectField
                    field={{
                      key: "customer",
                      label: "Customer",
                      placeholder: "Walk-in customer",
                      options: [{ label: "Walk-in customer", value: "" }, ...customers.data.map((c) => ({ label: c.name, value: c.id }))],
                    }}
                    value={customerId}
                    onChange={setCustomerId}
                  />
                </View>

                {!!product && (
                  <Animated.View
                    entering={FadeInDown.duration(200)}
                    className="flex-row items-center justify-between rounded-[12px] px-4 py-3 mb-5"
                    style={{ backgroundColor: GREEN_TINT }}
                  >
                    <Text style={{ color: GREEN, fontFamily: FONT_MED, fontSize: 13 }}>
                      {Number(quantity) || 0} × {ksh(product.unitPrice)}
                    </Text>
                    <Text style={{ color: GREEN, fontFamily: FONT_SEMI, fontSize: 16 }}>{ksh(saleTotal)}</Text>
                  </Animated.View>
                )}
              </Section>
            )}

            {type === "Purchase" && (
              <Section key="purchase">
                <FieldLabel label="Supplier" />
                <View className="mb-5">
                  <SelectField
                    field={{
                      key: "supplier",
                      label: "Supplier",
                      placeholder: suppliers.data.length ? "Choose a supplier" : "No suppliers — add one in Suppliers",
                      options: suppliers.data.map((s) => ({ label: s.name, value: s.id })),
                    }}
                    value={supplierId}
                    onChange={setSupplierId}
                  />
                </View>
                <FieldLabel label="Amount (KSh)" />
                {textInput("amount", amount, setAmount, { keyboardType: "decimal-pad", placeholder: "0.00" })}
                <FieldLabel label="Reference / delivery note" />
                {textInput("reference", reference, setReference, { placeholder: "Leave blank to auto-number", autoCapitalize: "characters" })}
              </Section>
            )}

            {type === "Expense" && (
              <Section key="expense">
                <FieldLabel label="Amount (KSh)" />
                {textInput("amount", amount, setAmount, { keyboardType: "decimal-pad", placeholder: "0.00" })}

                <FieldLabel label="Paid with" />
                <View className="mb-2">
                  <PillTabs options={PAYMENT_SOURCES} value={source} onChange={setSource} />
                </View>

                <FieldLabel label="Category" />
                <View className="flex-row flex-wrap mb-3" style={{ gap: 8 }}>
                  {EXPENSE_CATEGORIES.map((c) => (
                    <Pressable
                      key={c}
                      onPress={() => setCategory(c)}
                      className="px-3.5 h-[34px] rounded-[999px] items-center justify-center"
                      style={{ backgroundColor: category === c ? GREEN : BG, ...SHADOW_SM }}
                    >
                      <Text style={{ color: category === c ? "#FFFFFF" : TEXT_SECONDARY, fontFamily: FONT_MED, fontSize: 13 }}>{c}</Text>
                    </Pressable>
                  ))}
                </View>
                {textInput("category", category, setCategory, { placeholder: "Or type your own" })}

                <FieldLabel label="Reference / receipt #" />
                {textInput("reference", reference, setReference, { placeholder: "e.g. KPLC-0921", autoCapitalize: "characters" })}

                <FieldLabel label="Notes (optional)" />
                <TextInput
                  value={notes}
                  onChangeText={setNotes}
                  onFocus={() => setFocusedField("notes")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Anything worth remembering about this entry"
                  placeholderTextColor={TEXT_SECONDARY}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  className="px-4 py-3 rounded-[12px] text-[15px] mb-5"
                  style={{ backgroundColor: BG, color: TEXT_PRIMARY, fontFamily: FONT_REG, minHeight: 88, ...inputStyle("notes") }}
                />
              </Section>
            )}

            {type !== "Expense" && (
              <Animated.View layout={LinearTransition} className="flex-row items-center justify-between mb-6">
                <View className="flex-1 pr-3">
                  <Text className="text-[14px]" style={{ color: TEXT_PRIMARY, fontFamily: FONT_MED }}>
                    {type === "Sale" ? "Paid now" : "Already paid"}
                  </Text>
                  <Text className="text-[12px] mt-0.5" style={{ color: TEXT_SECONDARY, fontFamily: FONT_REG }}>
                    {paidNow ? "Recorded in your books straight away." : "Saved as pending until you mark it paid."}
                  </Text>
                </View>
                <Switch value={paidNow} onValueChange={setPaidNow} trackColor={{ true: GREEN, false: BORDER }} thumbColor="#FFFFFF" />
              </Animated.View>
            )}

            <PrimaryButton
              label={saving ? "Saving…" : "Save transaction"}
              icon={saving ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Check size={16} color="#FFFFFF" />}
              onPress={handleSave}
              colors={GRADIENT_FOREST}
            />
          </FormCard>
        </ScrollView>
      </KeyboardAvoidingView>
      <ToastHost />
    </SafeAreaView>
  );
}
