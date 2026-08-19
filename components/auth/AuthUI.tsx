import type { ReactNode } from "react";
import { Pressable, Text, View, type ViewStyle } from "react-native";
import Svg, { Path } from "react-native-svg";

/**
 * Shared building blocks for the Mizani auth flow (Login + Register).
 *
 * Distinction rule: borders are reserved for text-input fields, plus the
 * checkbox (which benefits from a visible edge at that small size).
 * Every other surface (cards, buttons, pills) uses a soft box-shadow for
 * elevation instead of a border.
 */

const GREEN = "#0A5C36";
const GREEN_DARK = "#063D24";
const GREEN_TINT = "#E6F2EB";
const BORDER = "#D9DEDB";
const TEXT_PRIMARY = "#111827";
const TEXT_SECONDARY = "#4B5563";

// Two elevation levels, reused everywhere a shadow (not a border) is needed.
export const SHADOW_SM: ViewStyle = {
  shadowColor: "#0F172A",
  shadowOffset: { width: 1, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 4,
  elevation: 2,
};

export const SHADOW_MD: ViewStyle = {
  shadowColor: "#000000",
  shadowOffset: { width: 2, height: 6 },
  shadowOpacity: 0.15,
  shadowRadius: 14,
  elevation: 5,
};

/** Official multi-color Google "G" mark for the OAuth button. */
export function GoogleIcon({ size = 18 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"
      />
      <Path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.5 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <Path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.6 39.6 16.3 44 24 44z"
      />
      <Path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.1 5.6l6.2 5.2C39.9 36.5 44 31 44 24c0-1.3-.1-2.7-.4-3.5z"
      />
    </Svg>
  );
}

/** "Continue/Sign up with Google" button — white surface, shadow for lift, real logo for color. */
export function GoogleButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      className="flex-row items-center justify-center h-[52px] rounded-[14px] bg-gray-200 mb-6 active:bg-[#F7F9F8]"
      style={SHADOW_SM}
      onPress={onPress}
    >
      <GoogleIcon size={18} />
      <Text
        className="text-[15px] text-[#111827] ml-2"
        style={{ fontFamily: "Lexend_500Medium" }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function Wordmark() {
  return (
    <View className="flex-row items-center mb-6">
      <View className="w-9 h-9 rounded-[12px] bg-[#0A5C36] items-center justify-center mr-2">
        <Text className="text-white text-base">⚖️</Text>
      </View>
      <Text
        className="text-[20px] text-[#111827]"
        style={{ fontFamily: "Lexend_600SemiBold" }}
      >
        Mizani
      </Text>
    </View>
  );
}

/** Tinted panel that opens the screen — the header's own moment of color. */
export function AuthHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <View className="bg-[#E6F2EB] rounded-[24px] px-5 py-6 mb-6">
      <Wordmark />
      <Text
        className="text-[26px] leading-[32px] text-[#111827] mb-2"
        style={{ fontFamily: "Lexend_600SemiBold" }}
      >
        {title}
      </Text>
      <Text
        className="text-[14px] text-[#4B5563]"
        style={{ fontFamily: "Lexend_400Regular" }}
      >
        {subtitle}
      </Text>
    </View>
  );
}

/** White card that wraps the form. Elevated with shadow — no border. */
export function FormCard({ children }: { children: ReactNode }) {
  return (
    <View className="rounded-[24px] bg-white p-5 mb-6" style={SHADOW_MD}>
      {children}
    </View>
  );
}

/** Inline error banner — danger tint + shadow, no border. */
export function ErrorBanner({ message }: { message: string }) {
  return (
    <View
      className="rounded-[14px] bg-[#FDECEC] px-3 py-2 mb-4"
      style={SHADOW_SM}
    >
      <Text
        className="text-[#DC2626] text-[13px]"
        style={{ fontFamily: "Lexend_500Medium" }}
      >
        {message}
      </Text>
    </View>
  );
}

/** Checked-circle bullet used for feature lists. */
export function FeatureItem({ label }: { label: string }) {
  return (
    <View className="flex-row items-center mb-3">
      <View
        className="w-5 h-5 rounded-[999px] bg-white items-center justify-center mr-3"
        style={SHADOW_SM}
      >
        <Text className="text-[#0A5C36] text-[11px]">✓</Text>
      </View>
      <Text
        className="flex-1 text-[14px] text-[#111827]"
        style={{ fontFamily: "Lexend_400Regular" }}
      >
        {label}
      </Text>
    </View>
  );
}

/** Neutral elevated note — social proof line, helper copy, etc. */
export function TrustNote({ children }: { children: ReactNode }) {
  return (
    <View
      className="rounded-[18px] bg-[#F7F9F8] px-4 py-3 mb-4"
      style={SHADOW_SM}
    >
      <Text
        className="text-[13px] text-[#4B5563] leading-[19px]"
        style={{ fontFamily: "Lexend_400Regular" }}
      >
        {children}
      </Text>
    </View>
  );
}

/** Green pill for trust/compliance signals — tinted + shadow, no border. */
export function TrustPill({ label }: { label: string }) {
  return (
    <View
      className="self-center flex-row items-center px-3 py-1.5 rounded-[999px] bg-[#E6F2EB]"
      style={SHADOW_SM}
    >
      <Text
        className="text-[12px] text-[#0A5C36]"
        style={{ fontFamily: "Lexend_500Medium" }}
      >
        {label}
      </Text>
    </View>
  );
}

/**
 * Square checkbox — unlike the other chrome, this one gets a visible border
 * (in addition to its shadow) since a shadow alone reads too faint at 18px:
 * gray border when unchecked, green border + green fill when checked.
 */
export function Checkbox({
  checked,
  onToggle,
  children,
}: {
  checked: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <Pressable className="flex-row items-start mb-6" onPress={onToggle}>
      <View
        className={`w-[18px] h-[18px] rounded-[6px] border items-center justify-center mr-2 mt-[1px] ${
          checked
            ? "bg-[#0A5C36] border-[#000000]"
            : "bg-gray-200 border-[#D9DEDB]"
        }`}
        style={SHADOW_SM}
      >
        {checked && <Text className="text-white text-[11px]">✓</Text>}
      </View>
      <Text
        className="flex-1 text-[13px] text-[#4B5563] leading-[19px]"
        style={{ fontFamily: "Lexend_400Regular" }}
      >
        {children}
      </Text>
    </Pressable>
  );
}

/** Segmented pill selector for Business type — shadow when inactive, solid fill when active. */
export function PillTabs<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: T }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            className={`px-3 py-2 rounded-[999px] ${
              active ? "bg-[#0A5C36]" : "bg-white"
            }`}
            style={active ? undefined : SHADOW_SM}
          >
            <Text
              className={
                active ? "text-white text-[13px]" : "text-[#4B5563] text-[13px]"
              }
              style={{ fontFamily: "Lexend_500Medium" }}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
