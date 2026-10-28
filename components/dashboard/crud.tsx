/* Shared building blocks for screens that read and write backend data:
   form sheet (create/edit), confirm sheet, row action sheet, entrance
   animations and loading/empty/error states. Everything uses the tokens
   from dashboardUI.tsx so the theme stays exactly as it is. */
import { Check, ChevronDown, MoreHorizontal, RefreshCw, X } from "lucide-react-native";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
  type ViewStyle,
} from "react-native";
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeOut,
  LinearTransition,
  SlideInDown,
  SlideOutDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { apiError } from "@/services/api";
import {
  BG,
  BORDER,
  DANGER,
  DANGER_BG,
  ErrorBanner,
  FONT_MED,
  FONT_REG,
  FONT_SEMI,
  GREEN,
  GREEN_DARK,
  GREEN_TINT,
  OVERLAY_SCRIM,
  SHADOW_MD,
  SHADOW_SM,
  SPACE_2,
  SPACE_3,
  SPACE_4,
  SURFACE,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  WARNING_BG,
  WARNING_DARK,
} from "./dashboardUI";

/* ------------------------------------------------------------------ */
/* Animation helpers                                                   */
/* ------------------------------------------------------------------ */

/** Fades + lifts children in, staggered by `index`. Re-layouts smoothly. */
export function Appear({
  index = 0,
  children,
  style,
}: {
  index?: number;
  children: ReactNode;
  style?: ViewStyle;
}) {
  return (
    <Animated.View
      entering={FadeInDown.delay(Math.min(index, 12) * 45)
        .duration(380)
        .easing(Easing.out(Easing.cubic))}
      exiting={FadeOut.duration(160)}
      layout={LinearTransition.springify().damping(18)}
      style={style}
    >
      {children}
    </Animated.View>
  );
}

/** Pressable that dips slightly when touched — the app-wide tap feedback. */
export function PressableScale({
  onPress,
  onLongPress,
  disabled,
  children,
  style,
  className,
}: {
  onPress?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  children: ReactNode;
  style?: ViewStyle;
  className?: string;
}) {
  const scale = useSharedValue(1);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  // The outer animated layer takes the flex size (so `flex-1` buttons fill
  // their row); the Pressable keeps every other layout and visual style.
  const flex = style?.flex ?? (className?.split(/\s+/).includes("flex-1") ? 1 : undefined);
  return (
    <Animated.View style={[flex !== undefined ? { flex } : null, animated]}>
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        disabled={disabled}
        onPressIn={() => (scale.value = withSpring(0.97, { damping: 20, stiffness: 300 }))}
        onPressOut={() => (scale.value = withSpring(1, { damping: 14, stiffness: 220 }))}
        className={className}
        style={style}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

/* ------------------------------------------------------------------ */
/* States                                                               */
/* ------------------------------------------------------------------ */

function SkeletonBlock({ height, width = "100%", radius = 12 }: { height: number; width?: ViewStyle["width"]; radius?: number }) {
  const opacity = useSharedValue(0.55);
  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(withTiming(1, { duration: 650 }), withTiming(0.55, { duration: 650 })),
      -1,
    );
  }, [opacity]);
  const animated = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return (
    <Animated.View
      style={[{ height, width, borderRadius: radius, backgroundColor: "#E9EDEA" }, animated]}
    />
  );
}

/** Placeholder cards shown while the first load is in flight. */
export function LoadingState({ rows = 4 }: { rows?: number }) {
  return (
    <View style={{ gap: SPACE_3 }}>
      <SkeletonBlock height={132} radius={18} />
      {Array.from({ length: rows }).map((_, i) => (
        <View
          key={i}
          className="flex-row items-center rounded-[12px] p-4"
          style={{ backgroundColor: BG, ...SHADOW_SM, gap: SPACE_3 }}
        >
          <SkeletonBlock height={40} width={40} radius={10} />
          <View style={{ flex: 1, gap: 8 }}>
            <SkeletonBlock height={12} width="65%" radius={6} />
            <SkeletonBlock height={10} width="40%" radius={5} />
          </View>
          <SkeletonBlock height={14} width={64} radius={6} />
        </View>
      ))}
    </View>
  );
}

export function EmptyState({
  icon,
  title,
  message,
  actionLabel,
  onAction,
}: {
  icon: ReactNode;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <Appear>
      <View
        className="items-center rounded-[18px] px-6 py-8"
        style={{ backgroundColor: BG, ...SHADOW_SM, marginBottom: SPACE_4 }}
      >
        <View
          className="w-14 h-14 rounded-[16px] items-center justify-center"
          style={{ backgroundColor: GREEN_TINT, marginBottom: SPACE_3 }}
        >
          {icon}
        </View>
        <Text className="text-[15px] text-center mb-1" style={{ color: TEXT_PRIMARY, fontFamily: FONT_SEMI }}>
          {title}
        </Text>
        <Text className="text-[13px] text-center" style={{ color: TEXT_SECONDARY, fontFamily: FONT_REG, lineHeight: 19 }}>
          {message}
        </Text>
        {actionLabel && onAction && (
          <PressableScale
            onPress={onAction}
            className="mt-4 px-5 h-[40px] rounded-[999px] items-center justify-center"
            style={{ backgroundColor: GREEN }}
          >
            <Text className="text-[13px] text-white" style={{ fontFamily: FONT_SEMI }}>
              {actionLabel}
            </Text>
          </PressableScale>
        )}
      </View>
    </Appear>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Appear>
      <View
        className="rounded-[14px] p-4 flex-row items-center"
        style={{ backgroundColor: DANGER_BG, marginBottom: SPACE_4 }}
      >
        <Text className="flex-1 text-[13px] mr-3" style={{ color: DANGER, fontFamily: FONT_MED, lineHeight: 19 }}>
          {message}
        </Text>
        <PressableScale
          onPress={onRetry}
          className="flex-row items-center px-3 h-[34px] rounded-[999px]"
          style={{ backgroundColor: BG }}
        >
          <RefreshCw size={13} color={DANGER} />
          <Text className="text-[12px] ml-1.5" style={{ color: DANGER, fontFamily: FONT_SEMI }}>
            Retry
          </Text>
        </PressableScale>
      </View>
    </Appear>
  );
}

/* ------------------------------------------------------------------ */
/* Bottom sheet shell                                                  */
/* ------------------------------------------------------------------ */

function Sheet({
  visible,
  onClose,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  // Keep the modal mounted until the slide-out finishes
  const [mounted, setMounted] = useState(visible);
  useEffect(() => {
    if (visible) setMounted(true);
    else {
      const t = setTimeout(() => setMounted(false), 220);
      return () => clearTimeout(t);
    }
  }, [visible]);
  if (!mounted) return null;

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {visible && (
          <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
            style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: OVERLAY_SCRIM }}
          >
            <Pressable style={{ flex: 1 }} onPress={onClose} />
          </Animated.View>
        )}
        <View style={{ flex: 1, justifyContent: "flex-end" }} pointerEvents="box-none">
          {visible && (
            <Animated.View
              entering={SlideInDown.springify().damping(20).stiffness(180)}
              exiting={SlideOutDown.duration(200)}
              className="rounded-t-[22px]"
              style={{ backgroundColor: BG, maxHeight: "92%", ...SHADOW_MD }}
            >
              <View
                className="self-center rounded-[999px] mt-3 mb-1"
                style={{ width: 40, height: 4, backgroundColor: BORDER }}
              />
              {children}
            </Animated.View>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function SheetHeader({ title, subtitle, onClose }: { title: string; subtitle?: string; onClose: () => void }) {
  return (
    <View className="flex-row items-start px-5 pt-2 pb-3">
      <View className="flex-1 pr-3">
        <Text className="text-[17px]" style={{ color: TEXT_PRIMARY, fontFamily: FONT_SEMI }}>
          {title}
        </Text>
        {!!subtitle && (
          <Text className="text-[13px] mt-1" style={{ color: TEXT_SECONDARY, fontFamily: FONT_REG, lineHeight: 18 }}>
            {subtitle}
          </Text>
        )}
      </View>
      <Pressable
        onPress={onClose}
        hitSlop={8}
        className="w-9 h-9 rounded-[999px] items-center justify-center"
        style={{ backgroundColor: SURFACE }}
      >
        <X size={16} color={TEXT_SECONDARY} />
      </Pressable>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Form sheet                                                           */
/* ------------------------------------------------------------------ */

export type FieldOption = { label: string; value: string };

export type Field = {
  key: string;
  label: string;
  type?: "text" | "number" | "email" | "phone" | "multiline" | "select" | "date" | "switch";
  placeholder?: string;
  required?: boolean;
  options?: FieldOption[];
  helper?: string;
  /** Hide unless this returns true for the current values. */
  visibleWhen?: (values: FormValues) => boolean;
  /** Number fields: reject values below this. */
  min?: number;
};

export type FormValues = Record<string, string | boolean>;

/** Inline dropdown; also used directly by full-screen forms. */
export function SelectField({
  field,
  value,
  onChange,
}: {
  field: Field;
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = field.options?.find((o) => o.value === value);
  return (
    <View>
      <Pressable
        onPress={() => setOpen((v) => !v)}
        className="h-[52px] px-4 rounded-[12px] flex-row items-center"
        style={{ backgroundColor: BG, borderWidth: 1, borderColor: open ? GREEN : BORDER }}
      >
        <Text
          className="flex-1 text-[15px]"
          numberOfLines={1}
          style={{ color: selected ? TEXT_PRIMARY : TEXT_SECONDARY, fontFamily: FONT_REG }}
        >
          {selected?.label ?? field.placeholder ?? "Select…"}
        </Text>
        <ChevronDown size={16} color={TEXT_SECONDARY} />
      </Pressable>
      {open && (
        <Animated.View
          entering={FadeInDown.duration(180)}
          className="rounded-[12px] mt-2 py-1"
          style={{ backgroundColor: BG, ...SHADOW_SM }}
        >
          {(field.options ?? []).length === 0 && (
            <Text className="px-4 py-3 text-[13px]" style={{ color: TEXT_SECONDARY, fontFamily: FONT_REG }}>
              Nothing to choose yet.
            </Text>
          )}
          {(field.options ?? []).map((o) => (
            <Pressable
              key={o.value}
              onPress={() => {
                onChange(o.value);
                setOpen(false);
              }}
              className="flex-row items-center px-4 py-3"
            >
              <Text
                className="flex-1 text-[14px]"
                style={{ color: o.value === value ? GREEN : TEXT_PRIMARY, fontFamily: o.value === value ? FONT_SEMI : FONT_REG }}
              >
                {o.label}
              </Text>
              {o.value === value && <Check size={15} color={GREEN} />}
            </Pressable>
          ))}
        </Animated.View>
      )}
    </View>
  );
}

/**
 * Config-driven create/edit sheet. Values are strings (switches are
 * booleans); `onSubmit` receives them and does the API call. Any thrown
 * error is shown in the sheet using the backend's message.
 */
export function FormSheet({
  visible,
  title,
  subtitle,
  fields,
  initialValues,
  submitLabel = "Save",
  onSubmit,
  onClose,
}: {
  visible: boolean;
  title: string;
  subtitle?: string;
  fields: Field[];
  initialValues?: FormValues;
  submitLabel?: string;
  onSubmit: (values: FormValues) => Promise<void>;
  onClose: () => void;
}) {
  const [values, setValues] = useState<FormValues>({});
  const [focused, setFocused] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      const start: FormValues = {};
      fields.forEach((f) => {
        start[f.key] = initialValues?.[f.key] ?? (f.type === "switch" ? false : "");
      });
      setValues(start);
      setError(null);
      setSaving(false);
    }
    // Only reset when the sheet opens, not on every parent render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const shown = fields.filter((f) => !f.visibleWhen || f.visibleWhen(values));
  const set = (key: string, v: string | boolean) => setValues((prev) => ({ ...prev, [key]: v }));

  const submit = async () => {
    for (const f of shown) {
      const v = values[f.key];
      if (f.required && (v === "" || v === undefined)) {
        setError(`${f.label} is required.`);
        return;
      }
      if (f.type === "number" && v !== "" && v !== undefined) {
        const n = Number(String(v).replace(/,/g, ""));
        if (!Number.isFinite(n)) {
          setError(`${f.label} must be a number.`);
          return;
        }
        if (f.min !== undefined && n < f.min) {
          setError(`${f.label} must be at least ${f.min}.`);
          return;
        }
      }
      if (f.type === "date" && v && !/^\d{4}-\d{2}-\d{2}$/.test(String(v))) {
        setError(`${f.label} must look like 2026-11-30.`);
        return;
      }
    }
    setError(null);
    setSaving(true);
    try {
      await onSubmit(values);
    } catch (err) {
      setError(apiError(err));
      setSaving(false);
    }
  };

  return (
    <Sheet visible={visible} onClose={saving ? () => {} : onClose}>
      <SheetHeader title={title} subtitle={subtitle} onClose={onClose} />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: SPACE_2 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {!!error && (
          <Animated.View entering={FadeInDown.duration(180)}>
            <ErrorBanner message={error} />
          </Animated.View>
        )}
        {shown.map((f) => (
          <View key={f.key} style={{ marginBottom: 18 }}>
            {f.type === "switch" ? (
              <View className="flex-row items-center justify-between">
                <View className="flex-1 pr-3">
                  <Text className="text-[14px]" style={{ color: TEXT_PRIMARY, fontFamily: FONT_MED }}>
                    {f.label}
                  </Text>
                  {!!f.helper && (
                    <Text className="text-[12px] mt-0.5" style={{ color: TEXT_SECONDARY, fontFamily: FONT_REG }}>
                      {f.helper}
                    </Text>
                  )}
                </View>
                <Switch
                  value={!!values[f.key]}
                  onValueChange={(v) => set(f.key, v)}
                  trackColor={{ true: GREEN, false: BORDER }}
                  thumbColor="#FFFFFF"
                />
              </View>
            ) : (
              <>
                <Text className="text-[13px] mb-2" style={{ color: TEXT_PRIMARY, fontFamily: FONT_MED }}>
                  {f.label}
                  {f.required ? <Text style={{ color: DANGER }}> *</Text> : null}
                </Text>
                {f.type === "select" ? (
                  <SelectField field={f} value={String(values[f.key] ?? "")} onChange={(v) => set(f.key, v)} />
                ) : (
                  <TextInput
                    value={String(values[f.key] ?? "")}
                    onChangeText={(v) => set(f.key, v)}
                    onFocus={() => setFocused(f.key)}
                    onBlur={() => setFocused(null)}
                    placeholder={f.placeholder ?? (f.type === "date" ? "YYYY-MM-DD" : undefined)}
                    placeholderTextColor={TEXT_SECONDARY}
                    keyboardType={
                      f.type === "number" ? "decimal-pad" : f.type === "email" ? "email-address" : f.type === "phone" ? "phone-pad" : f.type === "date" ? "numbers-and-punctuation" : "default"
                    }
                    autoCapitalize={f.type === "email" ? "none" : "sentences"}
                    multiline={f.type === "multiline"}
                    textAlignVertical={f.type === "multiline" ? "top" : "center"}
                    className={`${f.type === "multiline" ? "min-h-[92px] py-3" : "h-[52px]"} px-4 rounded-[12px] text-[15px]`}
                    style={{
                      backgroundColor: BG,
                      color: TEXT_PRIMARY,
                      fontFamily: FONT_REG,
                      borderWidth: 1,
                      borderColor: focused === f.key ? GREEN : BORDER,
                    }}
                  />
                )}
                {!!f.helper && (
                  <Text className="text-[12px] mt-1.5" style={{ color: TEXT_SECONDARY, fontFamily: FONT_REG }}>
                    {f.helper}
                  </Text>
                )}
              </>
            )}
          </View>
        ))}
      </ScrollView>

      <View className="flex-row px-5 pt-2" style={{ paddingBottom: Platform.OS === "ios" ? 34 : 20, gap: 12 }}>
        <PressableScale
          onPress={onClose}
          disabled={saving}
          className="flex-1 h-[52px] rounded-[14px] items-center justify-center"
          style={{ backgroundColor: SURFACE }}
        >
          <Text className="text-[15px]" style={{ color: TEXT_SECONDARY, fontFamily: FONT_SEMI }}>
            Cancel
          </Text>
        </PressableScale>
        <View style={{ flex: 1.4 }}>
          <PressableScale
            onPress={submit}
            disabled={saving}
            className="h-[52px] rounded-[14px] items-center justify-center"
            style={{ backgroundColor: saving ? GREEN_DARK : GREEN }}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-[15px] text-white" style={{ fontFamily: FONT_SEMI }}>
                {submitLabel}
              </Text>
            )}
          </PressableScale>
        </View>
      </View>
    </Sheet>
  );
}

/* ------------------------------------------------------------------ */
/* Confirm sheet                                                        */
/* ------------------------------------------------------------------ */

export function ConfirmSheet({
  visible,
  title,
  message,
  confirmLabel = "Confirm",
  tone = "danger",
  onConfirm,
  onClose,
}: {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  tone?: "danger" | "primary";
  onConfirm: () => Promise<void>;
  onClose: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (visible) {
      setBusy(false);
      setError(null);
    }
  }, [visible]);

  const confirm = async () => {
    setBusy(true);
    setError(null);
    try {
      await onConfirm();
    } catch (err) {
      setError(apiError(err));
      setBusy(false);
    }
  };

  const color = tone === "danger" ? DANGER : GREEN;
  return (
    <Sheet visible={visible} onClose={busy ? () => {} : onClose}>
      <SheetHeader title={title} onClose={onClose} />
      <View className="px-5">
        <Text className="text-[14px]" style={{ color: TEXT_SECONDARY, fontFamily: FONT_REG, lineHeight: 21, marginBottom: SPACE_3 }}>
          {message}
        </Text>
        {!!error && <ErrorBanner message={error} />}
      </View>
      <View className="flex-row px-5 pt-1" style={{ paddingBottom: Platform.OS === "ios" ? 34 : 20, gap: 12 }}>
        <PressableScale
          onPress={onClose}
          disabled={busy}
          className="flex-1 h-[52px] rounded-[14px] items-center justify-center"
          style={{ backgroundColor: SURFACE }}
        >
          <Text className="text-[15px]" style={{ color: TEXT_SECONDARY, fontFamily: FONT_SEMI }}>
            Keep
          </Text>
        </PressableScale>
        <View style={{ flex: 1.2 }}>
          <PressableScale
            onPress={confirm}
            disabled={busy}
            className="h-[52px] rounded-[14px] items-center justify-center"
            style={{ backgroundColor: color }}
          >
            {busy ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-[15px] text-white" style={{ fontFamily: FONT_SEMI }}>
                {confirmLabel}
              </Text>
            )}
          </PressableScale>
        </View>
      </View>
    </Sheet>
  );
}

/* ------------------------------------------------------------------ */
/* Row actions                                                          */
/* ------------------------------------------------------------------ */

export type RowAction = {
  label: string;
  icon: (color: string) => ReactNode;
  tone?: "default" | "danger" | "positive" | "warning";
  onPress: () => void;
};

const ACTION_TONE: Record<NonNullable<RowAction["tone"]>, { fg: string; bg: string }> = {
  default: { fg: TEXT_PRIMARY, bg: SURFACE },
  danger: { fg: DANGER, bg: DANGER_BG },
  positive: { fg: GREEN, bg: GREEN_TINT },
  warning: { fg: WARNING_DARK, bg: WARNING_BG },
};

/** Sheet listing what can be done to one record (edit, delete, status…). */
export function ActionSheet({
  visible,
  title,
  subtitle,
  actions,
  onClose,
}: {
  visible: boolean;
  title: string;
  subtitle?: string;
  actions: RowAction[];
  onClose: () => void;
}) {
  return (
    <Sheet visible={visible} onClose={onClose}>
      <SheetHeader title={title} subtitle={subtitle} onClose={onClose} />
      <View className="px-3" style={{ paddingBottom: Platform.OS === "ios" ? 34 : 20 }}>
        {actions.map((a, i) => {
          const tone = ACTION_TONE[a.tone ?? "default"];
          return (
            <Animated.View key={a.label} entering={FadeInDown.delay(i * 35).duration(220)}>
              <Pressable
                onPress={() => {
                  onClose();
                  // Let the sheet close before the next one opens
                  setTimeout(a.onPress, 230);
                }}
                className="flex-row items-center px-3 py-3 rounded-[12px]"
              >
                <View
                  className="w-10 h-10 rounded-[12px] items-center justify-center mr-3"
                  style={{ backgroundColor: tone.bg }}
                >
                  {a.icon(tone.fg)}
                </View>
                <Text className="text-[14px]" style={{ color: tone.fg, fontFamily: FONT_MED }}>
                  {a.label}
                </Text>
              </Pressable>
            </Animated.View>
          );
        })}
      </View>
    </Sheet>
  );
}

/** Round "⋯" button placed at the end of a row to open its ActionSheet. */
export function MoreButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      className="w-8 h-8 rounded-[999px] items-center justify-center ml-2"
      style={{ backgroundColor: SURFACE }}
    >
      <MoreHorizontal size={16} color={TEXT_SECONDARY} />
    </Pressable>
  );
}

/** Small section label used above grouped lists. */
export function GroupLabel({ label, trailing }: { label: string; trailing?: ReactNode }) {
  return (
    <View className="flex-row items-center justify-between" style={{ marginTop: SPACE_2, marginBottom: SPACE_3 }}>
      <Text className="text-[12px]" style={{ color: TEXT_SECONDARY, fontFamily: FONT_SEMI, letterSpacing: 0.6 }}>
        {label.toUpperCase()}
      </Text>
      {trailing}
    </View>
  );
}
