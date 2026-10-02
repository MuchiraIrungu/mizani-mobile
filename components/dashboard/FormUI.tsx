import { useRouter } from "expo-router";
import { ChevronLeft, X } from "lucide-react-native";
import { useState, type ReactNode } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
    type TextInputProps,
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
    GREEN,
    SHADOW_SM,
    SPACE_4,
    SURFACE,
    TEXT_PRIMARY,
    TEXT_SECONDARY,
} from "../../components/dashboard/dashboardUI";

export function FieldLabel({ label }: { label: string }) {
  return (
    <Text
      className="text-[13px] mb-2"
      style={{ color: TEXT_PRIMARY, fontFamily: FONT_MED }}
    >
      {label}
    </Text>
  );
}

export function Field({ label, ...props }: TextInputProps & { label: string }) {
  const [focused, setFocused] = useState(false);
  return (
    <>
      <FieldLabel label={label} />
      <TextInput
        {...props}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholderTextColor={TEXT_SECONDARY}
        className="h-[52px] px-4 rounded-[12px] text-[15px] mb-5"
        style={{
          backgroundColor: BG,
          color: TEXT_PRIMARY,
          fontFamily: FONT_REG,
          borderColor: focused ? GREEN : BORDER,
          borderWidth: 1,
        }}
      />
    </>
  );
}

export function FormScreen({
  title,
  error,
  children,
}: {
  title: string;
  error: string | null;
  children: ReactNode;
}) {
  const router = useRouter();
  const circle = { backgroundColor: BG, ...SHADOW_SM };
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
            style={circle}
          >
            <ChevronLeft size={18} color={TEXT_PRIMARY} />
          </Pressable>
          <Text
            className="text-[16px]"
            style={{ color: TEXT_PRIMARY, fontFamily: FONT_SEMI }}
          >
            {title}
          </Text>
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 rounded-[999px] items-center justify-center"
            style={circle}
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
            {children}
          </FormCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
