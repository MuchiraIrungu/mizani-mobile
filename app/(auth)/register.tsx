import {
  AuthHeader,
  Checkbox,
  ErrorBanner,
  FormCard,
  GoogleButton,
  PillTabs,
} from "@/components/auth/AuthUI";
import { register } from "@/services/authService";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

const BUSINESS_TYPES = [
  { label: "Retail / duka", value: "retail" },
  { label: "Wholesale", value: "wholesale" },
  { label: "Services", value: "services" },
  { label: "Restaurant", value: "restaurant" },
  { label: "Other", value: "other" },
] as const;

type BusinessType = (typeof BUSINESS_TYPES)[number]["value"];

export default function RegisterScreen() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState<BusinessType>("retail");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);

  const handleRegister = async () => {
    if (loading) return;
    if (!agreed) {
      setError(
        "Please accept the terms of service and privacy policy to continue",
      );
      return;
    }
    setError(null);
    setLoading(true);

    try {
      // NOTE: adjust the payload shape to match your authService.register signature.
      const data = await register({
        fullName,
        phone,
        businessName,
        businessType,
        email,
        password,
      });
      const { user, tokens } = data;
      setSession(user, tokens);
      router.replace("/(tabs)");
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field: string) =>
    `h-[52px] px-4 rounded-[14px] border bg-white text-[#111827] text-[15px] ${
      focusedField === field ? "border-[#0A5C36]" : "border-[#D9DEDB]"
    }`;

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* pt-14 instead of py-8's pt-8: a bit more breathing room above the header */}
        <View className="flex-1 px-6 pt-14 pb-8">
          <AuthHeader
            title="Create your Mizani account"
            subtitle="Start with one branch — add the rest whenever you are ready."
          />

          <FormCard>
            {error && <ErrorBanner message={error} />}

            <GoogleButton label="Sign up with Google" onPress={() => {}} />

            {/* Divider */}
            <View className="flex-row items-center mb-6">
              <View className="flex-1 h-[1px] bg-[#D9DEDB]" />
              <Text
                className="text-[13px] text-[#4B5563] mx-3"
                style={{ fontFamily: "Lexend_400Regular" }}
              >
                or sign up with email
              </Text>
              <View className="flex-1 h-[1px] bg-[#D9DEDB]" />
            </View>

            {/* Full name */}
            <Text
              className="text-[13px] text-[#111827] mb-2"
              style={{ fontFamily: "Lexend_500Medium" }}
            >
              Full name
            </Text>
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              onFocus={() => setFocusedField("fullName")}
              onBlur={() => setFocusedField(null)}
              placeholder="Wanjiku Mwangi"
              placeholderTextColor="#4B5563"
              className={`${inputClass("fullName")} mb-5`}
              style={{ fontFamily: "Lexend_400Regular" }}
            />

            {/* Phone */}
            <Text
              className="text-[13px] text-[#111827] mb-2"
              style={{ fontFamily: "Lexend_500Medium" }}
            >
              Phone number
            </Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              onFocus={() => setFocusedField("phone")}
              onBlur={() => setFocusedField(null)}
              placeholder="0722 000 000"
              placeholderTextColor="#4B5563"
              keyboardType="phone-pad"
              className={`${inputClass("phone")} mb-5`}
              style={{ fontFamily: "Lexend_400Regular" }}
            />

            {/* Business name */}
            <Text
              className="text-[13px] text-[#111827] mb-2"
              style={{ fontFamily: "Lexend_500Medium" }}
            >
              Business name
            </Text>
            <TextInput
              value={businessName}
              onChangeText={setBusinessName}
              onFocus={() => setFocusedField("businessName")}
              onBlur={() => setFocusedField(null)}
              placeholder="Mizani Trading Co."
              placeholderTextColor="#4B5563"
              className={`${inputClass("businessName")} mb-5`}
              style={{ fontFamily: "Lexend_400Regular" }}
            />

            {/* Business type — pill-tabs, shadow when inactive */}
            <Text
              className="text-[13px] text-[#111827] mb-2"
              style={{ fontFamily: "Lexend_500Medium" }}
            >
              Business type
            </Text>
            <View className="mb-5">
              <PillTabs
                options={
                  BUSINESS_TYPES as unknown as {
                    label: string;
                    value: BusinessType;
                  }[]
                }
                value={businessType}
                onChange={setBusinessType}
              />
            </View>

            {/* Work email */}
            <Text
              className="text-[13px] text-[#111827] mb-2"
              style={{ fontFamily: "Lexend_500Medium" }}
            >
              Work email
            </Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField(null)}
              placeholder="you@business.co.ke"
              placeholderTextColor="#4B5563"
              autoCapitalize="none"
              keyboardType="email-address"
              className={`${inputClass("email")} mb-5`}
              style={{ fontFamily: "Lexend_400Regular" }}
            />

            {/* Password */}
            <Text
              className="text-[13px] text-[#111827] mb-2"
              style={{ fontFamily: "Lexend_500Medium" }}
            >
              Password
            </Text>
            <View
              className={`flex-row items-center h-[52px] rounded-[14px] border bg-white pr-2 ${
                focusedField === "password"
                  ? "border-[#0A5C36]"
                  : "border-[#D9DEDB]"
              }`}
            >
              <TextInput
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField(null)}
                placeholder="At least 8 characters"
                placeholderTextColor="#4B5563"
                secureTextEntry={!showPassword}
                className="flex-1 h-full px-4 text-[#111827] text-[15px]"
                style={{ fontFamily: "Lexend_400Regular" }}
              />
              <Pressable
                onPress={() => setShowPassword((v) => !v)}
                className="px-2 py-1 rounded-[999px]"
              >
                <Text
                  className="text-[13px] text-[#4B5563]"
                  style={{ fontFamily: "Lexend_500Medium" }}
                >
                  {showPassword ? "Hide" : "Show"}
                </Text>
              </Pressable>
            </View>
            <Text
              className="text-[12px] text-[#4B5563] mt-2 mb-5"
              style={{ fontFamily: "Lexend_400Regular" }}
            >
              At least 8 characters and one number.
            </Text>

            <Checkbox checked={agreed} onToggle={() => setAgreed((v) => !v)}>
              I agree to the Mizani terms of service and privacy policy, and to
              Mizani filing on my behalf where I enable it.
            </Checkbox>

            {/* Create account button — solid fill, no border needed */}
            <Pressable
              className="h-[52px] rounded-[14px] bg-[#0A5C36] items-center justify-center flex-row active:bg-[#063D24]"
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Text
                    className="text-white text-[15px] mr-2"
                    style={{ fontFamily: "Lexend_600SemiBold" }}
                  >
                    Create account
                  </Text>
                  <Text className="text-white text-[15px]">→</Text>
                </>
              )}
            </Pressable>
          </FormCard>

          <View className="items-center mb-8">
            <Text
              className="text-[14px] text-[#4B5563]"
              style={{ fontFamily: "Lexend_400Regular" }}
            >
              Already have an account?{" "}
              <Text
                className="text-[#0A5C36]"
                style={{ fontFamily: "Lexend_600SemiBold" }}
                onPress={() => router.push("/login")}
              >
                Sign in
              </Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
