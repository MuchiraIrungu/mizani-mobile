import { useRouter } from "expo-router";
import { ChevronLeft, X } from "lucide-react-native";
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
    GREEN,
    PillTabs,
    PrimaryButton,
    SHADOW_MD,
    SPACE_4,
    SURFACE,
    TEXT_PRIMARY,
    TEXT_SECONDARY,
} from "../../components/dashboard/dashboardUI";

const FONT_REG = "Lexend_400Regular";
const FONT_MED = "Lexend_500Medium";
const FONT_SEMI = "Lexend_600SemiBold";
const FONT_BOLD = "Lexend_700Bold";

const TRANSACTION_TYPES = ["Sale", "Purchase", "Expense"];
const PAYMENT_SOURCES = ["M-Pesa", "Bank", "Cash"];

/** White card wrapper — same shadow/radius language as the rest of the
 *  dashboard (StatCard, InvoiceRow), not the auth screen's rounder card. */
function FormCard({ children }: { children: React.ReactNode }) {
  return (
    <View
      className="rounded-[16px] bg-white p-5"
      style={{ backgroundColor: BG, ...SHADOW_MD }}
    >
      {children}
    </View>
  );
}

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
    // For now this just confirms the form works end-to-end.
    router.back();
  };

  const inputStyle = (field: string) => ({
    borderColor: focusedField === field ? GREEN : BORDER,
  });

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: SURFACE }}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* ---- Header ---- */}
        <View className="flex-row items-center justify-between px-4 py-3">
          <Pressable
            onPress={() => router.back()}
            className="w-9 h-9 rounded-[999px] items-center justify-center"
            style={{ backgroundColor: BG, ...SHADOW_MD }}
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
            className="w-9 h-9 rounded-[999px] items-center justify-center"
            style={{ backgroundColor: BG, ...SHADOW_MD }}
          >
            <X size={18} color={TEXT_SECONDARY} />
          </Pressable>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: SPACE_4, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          <FormCard>
            {error && (
              <View
                className="rounded-[12px] px-3 py-2 mb-4"
                style={{ backgroundColor: "#FDECEC" }}
              >
                <Text
                  className="text-[13px]"
                  style={{ color: "#DC2626", fontFamily: FONT_MED }}
                >
                  {error}
                </Text>
              </View>
            )}

            <FieldLabel label="Transaction type" />
            <View className="mb-5">
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
              className="h-[52px] px-4 rounded-[14px] border bg-white text-[15px] mb-5"
              style={{
                color: TEXT_PRIMARY,
                fontFamily: FONT_REG,
                ...inputStyle("amount"),
              }}
            />

            <FieldLabel label="Payment source" />
            <View className="mb-5">
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
              className="h-[52px] px-4 rounded-[14px] border bg-white text-[15px] mb-5"
              style={{
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
              className="h-[52px] px-4 rounded-[14px] border bg-white text-[15px] mb-5"
              style={{
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
              className="px-4 py-3 rounded-[14px] border bg-white text-[15px] mb-6"
              style={{
                color: TEXT_PRIMARY,
                fontFamily: FONT_REG,
                minHeight: 88,
                ...inputStyle("notes"),
              }}
            />

            <PrimaryButton label="Save transaction" onPress={handleSave} />
          </FormCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
