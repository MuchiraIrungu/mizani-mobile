import {
  AuthHeader,
  Checkbox,
  ErrorBanner,
  FormCard,
  GoogleButton,
} from "@/components/auth/AuthUI";
import { login } from "@/services/authService";
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

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [focusedField, setFocusedField] = useState<"email" | "password" | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);

  const handleLogin = async () => {
    if (loading) return;
    setError(null);
    setLoading(true);
    try {
      const data = await login({ email, password });
      setSession(data.user, {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
      router.replace("/(dashboard)/main");
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid credentials");
      //router.replace("/(dashboard)/main");
    } finally {
      setLoading(false);
    }
  };

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
        {/* justify-center: vertically centers the card instead of pinning it to the top */}
        <View className="flex-1 justify-center px-6 py-8">
          <AuthHeader
            title="Sign in to Mizani"
            subtitle="Welcome back. Pick up where your books left off."
          />

          <FormCard>
            {error && <ErrorBanner message={error} />}

            <GoogleButton label="Continue with Google" onPress={() => {}} />

            {/* Divider */}
            <View className="flex-row items-center mb-6">
              <View className="flex-1 h-[1px] bg-[#D9DEDB]" />
              <Text
                className="text-[13px] text-[#4B5563] mx-3"
                style={{ fontFamily: "Lexend_400Regular" }}
              >
                or sign in with email
              </Text>
              <View className="flex-1 h-[1px] bg-[#D9DEDB]" />
            </View>

            {/* Email — border stays, this is an input field */}
            <Text
              className="text-[13px] text-[#111827] mb-2"
              style={{ fontFamily: "Lexend_500Medium" }}
            >
              Email address
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
              className={`h-[52px] px-4 rounded-[14px] border bg-white text-[#111827] text-[15px] mb-5 ${
                focusedField === "email"
                  ? "border-[#0A5C36]"
                  : "border-[#D9DEDB]"
              }`}
              style={{ fontFamily: "Lexend_400Regular" }}
            />

            {/* Password — border stays, this is an input field */}
            <View className="flex-row items-center justify-between mb-2">
              <Text
                className="text-[13px] text-[#111827]"
                style={{ fontFamily: "Lexend_500Medium" }}
              >
                Password
              </Text>
              <Pressable onPress={() => {}}>
                <Text
                  className="text-[13px] text-[#0A5C36]"
                  style={{ fontFamily: "Lexend_500Medium" }}
                >
                  Forgot password?
                </Text>
              </Pressable>
            </View>
            <View
              className={`flex-row items-center h-[52px] rounded-[14px] border bg-white mb-5 pr-2 ${
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
                placeholder="••••••••"
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

            <Checkbox
              checked={keepSignedIn}
              onToggle={() => setKeepSignedIn((v) => !v)}
            >
              Keep me signed in on this device
            </Checkbox>

            {/* Sign in button — solid fill, no border needed */}
            <Pressable
              className="h-[52px] rounded-[14px] bg-[#0A5C36] items-center justify-center flex-row active:bg-[#063D24]"
              onPress={handleLogin}
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
                    Sign in
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
              New to Mizani?{" "}
              <Text
                className="text-[#0A5C36]"
                style={{ fontFamily: "Lexend_600SemiBold" }}
                onPress={() => router.push("/register")}
              >
                Create an account
              </Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
