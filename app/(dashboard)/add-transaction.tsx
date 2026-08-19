import { useRouter } from "expo-router";
import { Check, ChevronLeft, X } from "lucide-react-native";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
  PillTabs,
  PrimaryButton,
  SHADOW_SM,
  showToast,
  SPACE_4,
  SURFACE,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
} from "../../components/dashboard/dashboardUI";

/* Add Transaction — quick-entry form behind the bottom nav's "+" button. */

const TRANSACTION_TYPES = ["Sale", "Purchase", "Expense"];
const PAYMENT_SOURCES = ["M-Pesa", "Bank", "Cash"];

function FieldLabel({ label }: { label: string }) {
  return (
    <Text
      className="text-[13px] mb-2"
      style={{ color: TEXT_PRIMARY, fontFamily: FONT_MED }}
    >
      {label}
    </Text>
  );
}

export default function AddTransactionScreen() {
  const router = useRouter();

  const [type, setType] = useState("Sale");
  const [source, setSource] = useState("M-Pesa");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    if (!amount.trim()) {
      setError("Enter an amount before saving.");
      return;
    }
    setError(null);
    // TODO: wire up to the real create-transaction endpoint.
    showToast(`${type} of KSh ${amount} saved`);
    router.back();
  };

  const inputStyle = (field: string) => ({
    borderColor: focusedField === field ? GREEN : BORDER,
    borderWidth: 1,
  });

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: SURFACE }}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View className="flex-row items-center justify-between px-4 py-3">
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 rounded-[999px] items-center justify-center"
            style={{ backgroundColor: BG, ...SHADOW_SM }}
          >
            <ChevronLeft size={18} color={TEXT_PRIMARY} />
          </Pressable>
          <Text
            className="text-[16px]"
            style={{ color: TEXT_PRIMARY, fontFamily: FONT_SEMI }}
          >
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
            {!!error && <ErrorBanner message={error} />}

            <FieldLabel label="Transaction type" />
            <View className="mb-2">
              <PillTabs
                options={TRANSACTION_TYPES}
                value={type}
                onChange={setType}
              />
            </View>

            <FieldLabel label="Amount (KSh)" />
            <TextInput
              value={amount}
              onChangeText={setAmount}
              onFocus={() => setFocusedField("amount")}
              onBlur={() => setFocusedField(null)}
              placeholder="0.00"
              placeholderTextColor={TEXT_SECONDARY}
              keyboardType="numeric"
              className="h-[52px] px-4 rounded-[12px] text-[15px] mb-5"
              style={{
                backgroundColor: BG,
                color: TEXT_PRIMARY,
                fontFamily: FONT_REG,
                ...inputStyle("amount"),
              }}
            />

            <FieldLabel label="Payment source" />
            <View className="mb-2">
              <PillTabs
                options={PAYMENT_SOURCES}
                value={source}
                onChange={setSource}
              />
            </View>

            <FieldLabel label="Category" />
            <TextInput
              value={category}
              onChangeText={setCategory}
              onFocus={() => setFocusedField("category")}
              onBlur={() => setFocusedField(null)}
              placeholder="e.g. Sales, Purchases, Payroll"
              placeholderTextColor={TEXT_SECONDARY}
              className="h-[52px] px-4 rounded-[12px] text-[15px] mb-5"
              style={{
                backgroundColor: BG,
                color: TEXT_PRIMARY,
                fontFamily: FONT_REG,
                ...inputStyle("category"),
              }}
            />

            <FieldLabel label="Reference / Invoice #" />
            <TextInput
              value={reference}
              onChangeText={setReference}
              onFocus={() => setFocusedField("reference")}
              onBlur={() => setFocusedField(null)}
              placeholder="e.g. INV-2045"
              placeholderTextColor={TEXT_SECONDARY}
              autoCapitalize="characters"
              className="h-[52px] px-4 rounded-[12px] text-[15px] mb-5"
              style={{
                backgroundColor: BG,
                color: TEXT_PRIMARY,
                fontFamily: FONT_REG,
                ...inputStyle("reference"),
              }}
            />

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
              className="px-4 py-3 rounded-[12px] text-[15px] mb-6"
              style={{
                backgroundColor: BG,
                color: TEXT_PRIMARY,
                fontFamily: FONT_REG,
                minHeight: 88,
                ...inputStyle("notes"),
              }}
            />

            <PrimaryButton
              label="Save transaction"
              icon={<Check size={16} color="#FFFFFF" />}
              onPress={handleSave}
              colors={GRADIENT_FOREST}
            />
          </FormCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
