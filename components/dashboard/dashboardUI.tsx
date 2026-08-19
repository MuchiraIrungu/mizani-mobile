import { LinearGradient } from "expo-linear-gradient";
import {
    AlertTriangle,
    Bell,
    ChevronDown,
    ChevronRight,
    Download,
    LogOut,
    Search,
    Settings,
    User,
} from "lucide-react-native";
import type { ReactNode } from "react";
import { useRef, useState } from "react";
import {
    Modal,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
    type ViewStyle,
} from "react-native";

/**
 * Dashboard chrome — LIGHT theme, pulled from design.css's :root tokens.
 *   bg #FFFFFF · page #F7F9F8 · text-primary #111827 · text-secondary #4B5563
 *   primary #0A5C36 · primary-dark #063D24 · primary-tint #E6F2EB
 *
 * Distinction model: the page itself sits on SURFACE (a soft off-white),
 * every card/pill/row sits on pure BG (white), and the contrast between
 * those two — reinforced by shadow, not borders — is what separates one
 * element from the next. Semi-transparent (rgba) fills are used ONLY
 * where a tint needs to sit *on top of* another surface (badges, avatars,
 * the dropdown/modal backdrop) rather than replace it outright — every
 * other surface stays fully opaque so it never looks washed out or lets
 * whatever's behind it show through.
 */

export const BG = "#FFFFFF";
export const SURFACE = "#F7F9F8";
export const BORDER = "#D9DEDB";
export const TEXT_PRIMARY = "#111827";
export const TEXT_SECONDARY = "#4B5563";
export const GREEN = "#0A5C36";
export const GREEN_DARK = "#063D24";
export const GREEN_TINT = "#E6F2EB";
export const WARNING = "#D97706";
export const WARNING_BG = "#FEF3E2";
export const DANGER = "#DC2626";
export const DANGER_DARK = "#991B1B";
export const DANGER_BG = "#FDECEC";

export const OVERLAY_SCRIM = "rgba(17,24,39,0.32)";
export const GLASS_HEADER = "rgba(255,255,255,0.82)";
export const GREEN_TINT_A = "rgba(10,92,54,0.10)";
export const DANGER_TINT_A = "rgba(220,38,38,0.08)";

export const SPACE_1 = 4;
export const SPACE_2 = 8;
export const SPACE_3 = 16;
export const SPACE_4 = 24;
export const SPACE_5 = 32;

export const SHADOW_SM: ViewStyle = {
  shadowColor: "#0F172A",
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.14,
  shadowRadius: 7,
  elevation: 4,
};

export const SHADOW_MD: ViewStyle = {
  shadowColor: "#0F172A",
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.2,
  shadowRadius: 20,
  elevation: 8,
};

/** Opaque, "lively" brand gradient — used sparingly on hero/CTA surfaces only. Requires expo-linear-gradient. */
export const GRADIENT_PRIMARY: [string, string, string] = [
  "#063D24",
  "#0A5C36",
  "#22C55E",
];
export const GRADIENT_AMBER: [string, string] = ["#B45309", "#F59E0B"];

const FONT_REG = "Lexend_400Regular";
const FONT_MED = "Lexend_500Medium";
const FONT_SEMI = "Lexend_600SemiBold";
const FONT_BOLD = "Lexend_700Bold";

function useAnchor() {
  const ref = useRef<View>(null);
  const [anchor, setAnchor] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const measure = () => {
    ref.current?.measureInWindow((x, y, width, height) => {
      setAnchor({ x, y, width, height });
    });
  };
  return { ref, anchor, measure };
}

function DropdownMenu({
  visible,
  onClose,
  anchor,
  children,
  align = "left",
  width = 220,
}: {
  visible: boolean;
  onClose: () => void;
  anchor: { x: number; y: number; width: number; height: number };
  children: ReactNode;
  align?: "left" | "right";
  width?: number;
}) {
  if (!visible) return null;
  const left =
    align === "right"
      ? Math.max(12, anchor.x + anchor.width - width)
      : anchor.x;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        style={{ flex: 1, backgroundColor: OVERLAY_SCRIM }}
        onPress={onClose}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="rounded-[12px] overflow-hidden"
          style={{
            position: "absolute",
            top: anchor.y + anchor.height + 6,
            left,
            width,
            backgroundColor: BG,
            ...SHADOW_MD,
          }}
        >
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export function PillRow({ children }: { children: ReactNode }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingVertical: SPACE_2,
        paddingHorizontal: 2,
        alignItems: "center",
      }}
    >
      {children}
    </ScrollView>
  );
}

export function BrandMark({ size = 36 }: { size?: number }) {
  return (
    <View
      className="items-center justify-center rounded-[10px] mr-2"
      style={{
        width: size,
        height: size,
        backgroundColor: GREEN,
        ...SHADOW_SM,
      }}
    >
      <Text style={{ fontSize: size * 0.5 }}>⚖️</Text>
    </View>
  );
}

export function SelectorPill({
  label,
  options,
  onSelect,
  onPress,
}: {
  label: string;
  options?: string[];
  onSelect?: (v: string) => void;
  onPress?: () => void;
}) {
  const { ref, anchor, measure } = useAnchor();
  const [open, setOpen] = useState(false);
  const hasOptions = !!options?.length;

  return (
    <>
      <Pressable
        ref={ref}
        onPress={() => {
          if (hasOptions) {
            measure();
            setOpen(true);
          } else {
            onPress?.();
          }
        }}
        className="flex-row items-center px-3 py-2 rounded-[999px] mr-2"
        style={{ backgroundColor: BG, ...SHADOW_SM }}
      >
        <Text
          className="text-[13px] mr-1"
          style={{ color: TEXT_PRIMARY, fontFamily: FONT_MED }}
        >
          {label}
        </Text>
        <ChevronDown size={14} color={TEXT_SECONDARY} />
      </Pressable>

      {hasOptions && (
        <DropdownMenu
          visible={open}
          onClose={() => setOpen(false)}
          anchor={anchor}
          width={200}
        >
          {options!.map((opt, i) => {
            const active = opt === label;
            return (
              <Pressable
                key={opt}
                onPress={() => {
                  setOpen(false);
                  onSelect?.(opt);
                }}
                className="px-4 py-3"
                style={{
                  borderTopWidth: i === 0 ? 0 : 1,
                  borderTopColor: BORDER,
                  backgroundColor: active ? GREEN_TINT : BG,
                }}
              >
                <Text
                  className="text-[13px]"
                  style={{
                    color: active ? GREEN : TEXT_PRIMARY,
                    fontFamily: active ? FONT_SEMI : FONT_MED,
                  }}
                >
                  {opt}
                </Text>
              </Pressable>
            );
          })}
        </DropdownMenu>
      )}
    </>
  );
}

/** Round icon button. `size` controls the container diameter — bump it for
 *  header-level actions (bell, search, settings) that should read as primary. */
export function IconButton({
  icon,
  onPress,
  dot,
  size = 40,
}: {
  icon: ReactNode;
  onPress?: () => void;
  dot?: boolean;
  size?: number;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="rounded-[999px] items-center justify-center ml-2"
      style={{ width: size, height: size, backgroundColor: BG, ...SHADOW_SM }}
    >
      {icon}
      {dot && (
        <View
          className="absolute top-2 right-2 w-2 h-2 rounded-[999px]"
          style={{ backgroundColor: DANGER }}
        />
      )}
    </Pressable>
  );
}

export type NotificationTone = "positive" | "warning" | "danger" | "neutral";

export type NotificationItem = {
  id: string;
  title: string;
  time: string;
  tone: NotificationTone;
};

const NOTIFICATION_TONE_COLOR: Record<NotificationTone, string> = {
  positive: GREEN,
  warning: WARNING,
  danger: DANGER,
  neutral: TEXT_SECONDARY,
};

export function NotificationBell({
  notifications,
  onViewAll,
}: {
  notifications: NotificationItem[];
  onViewAll?: () => void;
}) {
  const { ref, anchor, measure } = useAnchor();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable
        ref={ref}
        onPress={() => {
          measure();
          setOpen(true);
        }}
        className="w-11 h-11 rounded-[999px] items-center justify-center ml-2"
        style={{ backgroundColor: BG, ...SHADOW_SM }}
      >
        <Bell size={20} color={TEXT_SECONDARY} />
        {notifications.length > 0 && (
          <View
            className="absolute top-2 right-2 w-2 h-2 rounded-[999px]"
            style={{ backgroundColor: DANGER }}
          />
        )}
      </Pressable>

      <DropdownMenu
        visible={open}
        onClose={() => setOpen(false)}
        anchor={anchor}
        align="right"
        width={280}
      >
        <View
          className="px-4 py-3"
          style={{ borderBottomWidth: 1, borderBottomColor: BORDER }}
        >
          <Text
            className="text-[14px]"
            style={{ color: TEXT_PRIMARY, fontFamily: FONT_SEMI }}
          >
            Notifications
          </Text>
        </View>

        {notifications.length === 0 ? (
          <View className="px-4 py-6 items-center">
            <Text
              className="text-[13px]"
              style={{ color: TEXT_SECONDARY, fontFamily: FONT_REG }}
            >
              You&lsquo;re all caught up
            </Text>
          </View>
        ) : (
          notifications.map((n) => (
            <View
              key={n.id}
              className="flex-row items-start px-4 py-3"
              style={{ borderBottomWidth: 1, borderBottomColor: BORDER }}
            >
              <View
                className="w-2 h-2 rounded-[999px] mr-2"
                style={{
                  backgroundColor: NOTIFICATION_TONE_COLOR[n.tone],
                  marginTop: 6,
                }}
              />
              <View className="flex-1">
                <Text
                  className="text-[13px] mb-0.5"
                  style={{ color: TEXT_PRIMARY, fontFamily: FONT_MED }}
                >
                  {n.title}
                </Text>
                <Text
                  className="text-[11px]"
                  style={{ color: TEXT_SECONDARY, fontFamily: FONT_REG }}
                >
                  {n.time}
                </Text>
              </View>
            </View>
          ))
        )}

        <Pressable
          onPress={() => {
            setOpen(false);
            onViewAll?.();
          }}
          className="px-4 py-3 items-center"
        >
          <Text
            className="text-[13px]"
            style={{ color: GREEN, fontFamily: FONT_SEMI }}
          >
            View all notifications
          </Text>
        </Pressable>
      </DropdownMenu>
    </>
  );
}

/** Gear icon next to the bell — quick access to Settings without leaving via the avatar menu. */
export function SettingsMenu({
  onSettings,
  onHelp,
}: {
  onSettings?: () => void;
  onHelp?: () => void;
}) {
  const { ref, anchor, measure } = useAnchor();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable
        ref={ref}
        onPress={() => {
          measure();
          setOpen(true);
        }}
        className="w-11 h-11 rounded-[999px] items-center justify-center ml-2"
        style={{ backgroundColor: BG, ...SHADOW_SM }}
      >
        <Settings size={20} color={TEXT_SECONDARY} />
      </Pressable>

      <DropdownMenu
        visible={open}
        onClose={() => setOpen(false)}
        anchor={anchor}
        align="right"
        width={190}
      >
        <Pressable
          className="px-4 py-3"
          onPress={() => {
            setOpen(false);
            onSettings?.();
          }}
        >
          <Text
            className="text-[13px]"
            style={{ color: TEXT_PRIMARY, fontFamily: FONT_MED }}
          >
            Settings
          </Text>
        </Pressable>
        <Pressable
          className="px-4 py-3"
          style={{ borderTopWidth: 1, borderTopColor: BORDER }}
          onPress={() => {
            setOpen(false);
            onHelp?.();
          }}
        >
          <Text
            className="text-[13px]"
            style={{ color: TEXT_PRIMARY, fontFamily: FONT_MED }}
          >
            Help & Support
          </Text>
        </Pressable>
      </DropdownMenu>
    </>
  );
}

export type SearchItem = { id: string; title: string; subtitle: string };

export function SearchTrigger({ onPress }: { onPress: () => void }) {
  return (
    <IconButton
      icon={<Search size={18} color={TEXT_SECONDARY} />}
      onPress={onPress}
      size={44}
    />
  );
}

export function SearchModal({
  visible,
  onClose,
  data,
  onSelect,
  placeholder = "Search…",
}: {
  visible: boolean;
  onClose: () => void;
  data: SearchItem[];
  onSelect?: (item: SearchItem) => void;
  placeholder?: string;
}) {
  const [query, setQuery] = useState("");

  const results = query.trim()
    ? data.filter((d) =>
        `${d.title} ${d.subtitle}`
          .toLowerCase()
          .includes(query.trim().toLowerCase()),
      )
    : data;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        style={{
          flex: 1,
          backgroundColor: OVERLAY_SCRIM,
          justifyContent: "flex-start",
          paddingTop: 90,
        }}
        onPress={() => {
          setQuery("");
          onClose();
        }}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="mx-4 rounded-[16px] overflow-hidden"
          style={{ backgroundColor: BG, maxHeight: "70%", ...SHADOW_MD }}
        >
          <View
            className="flex-row items-center px-4 py-3"
            style={{ borderBottomWidth: 1, borderBottomColor: BORDER }}
          >
            <Search size={16} color={TEXT_SECONDARY} />
            <TextInput
              autoFocus
              value={query}
              onChangeText={setQuery}
              placeholder={placeholder}
              placeholderTextColor={TEXT_SECONDARY}
              className="flex-1 ml-2"
              style={{
                color: TEXT_PRIMARY,
                fontFamily: FONT_REG,
                fontSize: 14,
              }}
            />
            <Pressable
              onPress={() => {
                setQuery("");
                onClose();
              }}
            >
              <Text
                style={{
                  color: TEXT_SECONDARY,
                  fontFamily: FONT_MED,
                  fontSize: 13,
                }}
              >
                Cancel
              </Text>
            </Pressable>
          </View>

          <ScrollView keyboardShouldPersistTaps="handled">
            {results.length === 0 ? (
              <View className="px-4 py-8 items-center">
                <Text
                  style={{
                    color: TEXT_SECONDARY,
                    fontFamily: FONT_REG,
                    fontSize: 13,
                  }}
                >
                  No results for `{query}`
                </Text>
              </View>
            ) : (
              results.map((r, i) => (
                <Pressable
                  key={r.id}
                  onPress={() => {
                    setQuery("");
                    onClose();
                    onSelect?.(r);
                  }}
                  className="px-4 py-3"
                  style={{
                    borderTopWidth: i === 0 ? 0 : 1,
                    borderTopColor: BORDER,
                  }}
                >
                  <Text
                    style={{
                      color: TEXT_PRIMARY,
                      fontFamily: FONT_SEMI,
                      fontSize: 13,
                    }}
                  >
                    {r.title}
                  </Text>
                  <Text
                    style={{
                      color: TEXT_SECONDARY,
                      fontFamily: FONT_REG,
                      fontSize: 12,
                      marginTop: 2,
                    }}
                  >
                    {r.subtitle}
                  </Text>
                </Pressable>
              ))
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export function GhostPillButton({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: ReactNode;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center px-3 py-2 rounded-[999px] mr-2"
      style={{ backgroundColor: BG, ...SHADOW_SM }}
    >
      {icon}
      <Text
        className="text-[12px] ml-1.5"
        style={{ color: TEXT_PRIMARY, fontFamily: FONT_MED }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function PrimaryButton({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon?: ReactNode;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-center px-4 py-3 rounded-[999px]"
      style={{ backgroundColor: GREEN, ...SHADOW_SM }}
    >
      {icon}
      <Text
        className="text-[14px] ml-1.5"
        style={{ color: "#FFFFFF", fontFamily: FONT_SEMI }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function UserMenu({
  initials,
  onAccount,
  onSettings,
  onLogout,
}: {
  initials: string;
  onAccount?: () => void;
  onSettings?: () => void;
  onLogout?: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <View style={{ position: "relative", zIndex: 50 }}>
      <Pressable
        onPress={() => setOpen((v) => !v)}
        className="w-11 h-11 rounded-[999px] items-center justify-center ml-2"
        style={{ backgroundColor: GREEN_TINT }}
      >
        <Text
          className="text-[14px]"
          style={{ color: GREEN, fontFamily: FONT_SEMI }}
        >
          {initials}
        </Text>
      </Pressable>

      {open && (
        <>
          <Pressable
            onPress={() => setOpen(false)}
            style={{
              position: "absolute",
              top: -1000,
              left: -1000,
              right: -1000,
              bottom: -1000,
              backgroundColor: OVERLAY_SCRIM,
              zIndex: 40,
            }}
          />
          <View
            className="absolute right-0 top-12 w-44 rounded-[12px] py-1"
            style={{ backgroundColor: BG, zIndex: 50, ...SHADOW_MD }}
          >
            <Pressable
              className="flex-row items-center px-3 py-3"
              onPress={() => {
                setOpen(false);
                onAccount?.();
              }}
            >
              <User size={16} color={TEXT_SECONDARY} />
              <Text
                className="text-[13px] ml-2"
                style={{ color: TEXT_PRIMARY, fontFamily: FONT_MED }}
              >
                Account
              </Text>
            </Pressable>
            <Pressable
              className="flex-row items-center px-3 py-3"
              onPress={() => {
                setOpen(false);
                onSettings?.();
              }}
            >
              <Settings size={16} color={TEXT_SECONDARY} />
              <Text
                className="text-[13px] ml-2"
                style={{ color: TEXT_PRIMARY, fontFamily: FONT_MED }}
              >
                Settings
              </Text>
            </Pressable>
            <View
              style={{ height: 1, backgroundColor: BORDER, marginVertical: 4 }}
            />
            <Pressable
              className="flex-row items-center px-3 py-3"
              onPress={() => {
                setOpen(false);
                onLogout?.();
              }}
            >
              <LogOut size={16} color={DANGER} />
              <Text
                className="text-[13px] ml-2"
                style={{ color: DANGER, fontFamily: FONT_MED }}
              >
                Log out
              </Text>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

export function AlertBanner({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  actionLabel: string;
  onAction?: () => void;
}) {
  return (
    <View
      className="rounded-[12px] p-4 mb-5"
      style={{ backgroundColor: WARNING_BG, ...SHADOW_SM }}
    >
      <View className="flex-row items-start mb-2">
        <View
          className="w-8 h-8 rounded-[999px] items-center justify-center mr-3"
          style={{ backgroundColor: "rgba(217,119,6,0.16)" }}
        >
          <AlertTriangle size={16} color={WARNING} />
        </View>
        <Text
          className="flex-1 text-[15px] mt-1"
          style={{ color: "#92400E", fontFamily: FONT_SEMI }}
        >
          {title}
        </Text>
      </View>
      <Text
        className="text-[13px] leading-[19px] mb-3"
        style={{ color: TEXT_SECONDARY, fontFamily: FONT_REG }}
      >
        {description}
      </Text>
      <Pressable
        onPress={onAction}
        className="self-start px-4 py-2 rounded-[999px]"
        style={{ backgroundColor: WARNING }}
      >
        <Text
          className="text-[13px]"
          style={{ color: "#FFFFFF", fontFamily: FONT_SEMI }}
        >
          {actionLabel}
        </Text>
      </Pressable>
    </View>
  );
}

export function BudgetProgress({ percent }: { percent: number }) {
  return (
    <View
      className="h-[6px] rounded-[999px] mb-4 overflow-hidden"
      style={{ backgroundColor: BORDER }}
    >
      <View
        style={{
          width: `${Math.min(percent, 100)}%`,
          height: "100%",
          backgroundColor: WARNING,
          borderRadius: 999,
        }}
      />
    </View>
  );
}

type MiniStat = { label: string; value: string };

export function StatCard({
  title,
  badgeLabel,
  badgeTone = "neutral",
  value,
  helper,
  progressPercent,
  footerStats,
  tone = "neutral",
  actionLabel,
  onAction,
}: {
  title: string;
  badgeLabel?: string;
  badgeTone?: "positive" | "warning" | "neutral" | "danger";
  value: string;
  helper?: string;
  progressPercent?: number;
  footerStats?: MiniStat[];
  tone?: "neutral" | "success" | "danger" | "warning";
  actionLabel?: string;
  onAction?: () => void;
}) {
  const badgeColors: Record<string, { bg: string; fg: string }> = {
    positive: { bg: GREEN_TINT, fg: GREEN },
    warning: { bg: WARNING_BG, fg: WARNING },
    danger: { bg: "#FFFFFF", fg: DANGER },
    neutral: { bg: SURFACE, fg: TEXT_SECONDARY },
  };
  const badge = badgeColors[badgeTone];
  const isSuccess = tone === "success";
  const isDanger = tone === "danger";
  const isWarning = tone === "warning";
  const isTinted = isSuccess || isWarning;

  const cardBg = isSuccess
    ? GREEN
    : isWarning
      ? WARNING
      : isDanger
        ? DANGER_TINT_A
        : BG;
  const titleColor = isTinted
    ? "rgba(255,255,255,0.85)"
    : isDanger
      ? DANGER_DARK
      : TEXT_SECONDARY;
  const valueColor = isTinted ? "#FFFFFF" : isDanger ? DANGER : TEXT_PRIMARY;
  const helperColor = isTinted
    ? "rgba(255,255,255,0.85)"
    : isDanger
      ? DANGER_DARK
      : TEXT_SECONDARY;

  return (
    <View
      className="rounded-[12px] p-5 mb-5"
      style={{
        backgroundColor: cardBg,
        ...(isTinted || isDanger ? SHADOW_MD : SHADOW_SM),
      }}
    >
      <View className="flex-row items-center justify-between mb-3">
        <Text
          className="text-[13px]"
          style={{ color: titleColor, fontFamily: FONT_MED }}
        >
          {title}
        </Text>
        {badgeLabel && (
          <View
            className="px-2.5 py-1 rounded-[999px]"
            style={{
              backgroundColor: isTinted
                ? "rgba(255,255,255,0.18)"
                : isDanger
                  ? "rgba(220,38,38,0.12)"
                  : badge.bg,
              ...(isDanger ? SHADOW_SM : null),
            }}
          >
            <Text
              className="text-[11px]"
              style={{
                color: isTinted ? "#FFFFFF" : isDanger ? DANGER : badge.fg,
                fontFamily: FONT_SEMI,
              }}
            >
              {badgeLabel}
            </Text>
          </View>
        )}
      </View>

      <Text
        className="text-[28px] mb-2"
        style={{ color: valueColor, fontFamily: FONT_BOLD }}
      >
        {value}
      </Text>

      {helper && (
        <Text
          className="text-[13px] mb-3"
          style={{ color: helperColor, fontFamily: FONT_REG }}
        >
          {helper}
        </Text>
      )}

      {progressPercent !== undefined && (
        <BudgetProgress percent={progressPercent} />
      )}

      {footerStats && (
        <View
          className="flex-row justify-between pt-3"
          style={{
            borderTopWidth: 1,
            borderTopColor: isTinted
              ? "rgba(255,255,255,0.24)"
              : isDanger
                ? "rgba(220,38,38,0.18)"
                : BORDER,
          }}
        >
          {footerStats.map((stat) => (
            <View key={stat.label}>
              <Text
                className="text-[11px] mb-1"
                style={{
                  color: isTinted ? "rgba(255,255,255,0.75)" : TEXT_SECONDARY,
                  fontFamily: FONT_MED,
                }}
              >
                {stat.label}
              </Text>
              <Text
                className="text-[14px]"
                style={{
                  color: isTinted ? "#FFFFFF" : TEXT_PRIMARY,
                  fontFamily: FONT_SEMI,
                }}
              >
                {stat.value}
              </Text>
            </View>
          ))}
        </View>
      )}

      {actionLabel && (
        <Pressable
          onPress={onAction}
          className="flex-row items-center justify-center h-[44px] rounded-[8px] mt-4"
          style={{ backgroundColor: "#FFFFFF", ...SHADOW_SM }}
        >
          <Download size={15} color={GREEN_DARK} />
          <Text
            className="text-[14px] ml-2"
            style={{ color: GREEN_DARK, fontFamily: FONT_SEMI }}
          >
            {actionLabel}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

/** Gradient variant of the hero stat card — same content shape as StatCard, opaque brand gradient fill.
 *  Use in place of StatCard tone="success" when a screen wants the livelier hero treatment. */
export function GradientStatCard({
  title,
  badgeLabel,
  value,
  helper,
  actionLabel,
  onAction,
  colors = GRADIENT_PRIMARY,
}: {
  title: string;
  badgeLabel?: string;
  value: string;
  helper?: string;
  actionLabel?: string;
  onAction?: () => void;
  colors?: [string, string, ...string[]];
}) {
  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        borderRadius: 12,
        padding: 20,
        marginBottom: SPACE_5,
        ...SHADOW_MD,
      }}
    >
      <View className="flex-row items-center justify-between mb-3">
        <Text
          className="text-[13px]"
          style={{ color: "rgba(255,255,255,0.85)", fontFamily: FONT_MED }}
        >
          {title}
        </Text>
        {badgeLabel && (
          <View
            className="px-2.5 py-1 rounded-[999px]"
            style={{ backgroundColor: "rgba(255,255,255,0.18)" }}
          >
            <Text
              className="text-[11px]"
              style={{ color: "#FFFFFF", fontFamily: FONT_SEMI }}
            >
              {badgeLabel}
            </Text>
          </View>
        )}
      </View>
      <Text
        className="text-[28px] mb-2"
        style={{ color: "#FFFFFF", fontFamily: FONT_BOLD }}
      >
        {value}
      </Text>
      {helper && (
        <Text
          className="text-[13px] mb-3"
          style={{ color: "rgba(255,255,255,0.85)", fontFamily: FONT_REG }}
        >
          {helper}
        </Text>
      )}
      {actionLabel && (
        <Pressable
          onPress={onAction}
          className="flex-row items-center justify-center h-[44px] rounded-[8px] mt-2"
          style={{ backgroundColor: "#FFFFFF" }}
        >
          <Download size={15} color={GREEN_DARK} />
          <Text
            className="text-[14px] ml-2"
            style={{ color: GREEN_DARK, fontFamily: FONT_SEMI }}
          >
            {actionLabel}
          </Text>
        </Pressable>
      )}
    </LinearGradient>
  );
}

export function StatusPill({
  label,
  tone,
}: {
  label: string;
  tone: "positive" | "warning" | "neutral" | "danger";
}) {
  const toneColors: Record<string, { bg: string; fg: string }> = {
    positive: { bg: GREEN_TINT_A, fg: GREEN },
    warning: { bg: "rgba(217,119,6,0.12)", fg: WARNING },
    danger: { bg: DANGER_TINT_A, fg: DANGER },
    neutral: { bg: SURFACE, fg: TEXT_SECONDARY },
  };
  const c = toneColors[tone];
  return (
    <View
      className="px-2.5 py-1 rounded-[999px] mr-2"
      style={{ backgroundColor: c.bg }}
    >
      <Text
        className="text-[11px]"
        style={{ color: c.fg, fontFamily: FONT_MED }}
      >
        {label}
      </Text>
    </View>
  );
}

export type Transaction = {
  id: string;
  date: string;
  time: string;
  details: string;
  reference: string;
  category: string;
  source: string;
  sourceTone: "positive" | "warning" | "neutral";
  status: string;
  statusTone: "positive" | "warning" | "neutral";
  amount: string;
  isNegative?: boolean;
};

export function TransactionRow({
  tx,
  onPress,
}: {
  tx: Transaction;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="rounded-[12px] p-4 mb-3"
      style={{ backgroundColor: BG, ...SHADOW_SM }}
    >
      <View className="flex-row items-start justify-between mb-1">
        <Text
          className="flex-1 text-[14px] mr-3"
          style={{ color: TEXT_PRIMARY, fontFamily: FONT_SEMI }}
        >
          {tx.details}
        </Text>
        <Text
          className="text-[14px]"
          style={{
            color: tx.isNegative ? TEXT_PRIMARY : GREEN,
            fontFamily: FONT_SEMI,
          }}
        >
          {tx.isNegative ? "-" : ""}
          {tx.amount}
        </Text>
      </View>
      <Text
        className="text-[12px] mb-3"
        style={{ color: TEXT_SECONDARY, fontFamily: FONT_REG }}
      >
        {tx.reference} · {tx.date}, {tx.time} · {tx.category}
      </Text>
      <View className="flex-row">
        <StatusPill label={tx.source} tone={tx.sourceTone} />
        <StatusPill label={tx.status} tone={tx.statusTone} />
      </View>
    </Pressable>
  );
}

export type Invoice = {
  id: string;
  customer: string;
  reference: string;
  dueDate: string;
  statusLabel: "";
  amount: string;
  status: "pending" | "overdue" | "paid";
};

const INVOICE_STATUS_TONE: Record<
  Invoice["status"],
  "warning" | "danger" | "positive"
> = {
  pending: "warning",
  overdue: "danger",
  paid: "positive",
};

const INVOICE_STATUS_LABEL: Record<Invoice["status"], string> = {
  pending: "Pending",
  overdue: "Overdue",
  paid: "Paid",
};

export function InvoiceRow({
  invoice,
  onPress,
}: {
  invoice: Invoice;
  onPress?: () => void;
}) {
  const initial = invoice.customer.trim().charAt(0).toUpperCase();
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center rounded-[12px] p-4 mb-3"
      style={{ backgroundColor: BG, ...SHADOW_SM }}
    >
      <View
        className="w-10 h-10 rounded-[999px] items-center justify-center mr-3"
        style={{ backgroundColor: GREEN_TINT_A }}
      >
        <Text
          className="text-[14px]"
          style={{ color: GREEN, fontFamily: FONT_SEMI }}
        >
          {initial}
        </Text>
      </View>

      <View className="flex-1 mr-2">
        <Text
          className="text-[14px] mb-1"
          style={{ color: TEXT_PRIMARY, fontFamily: FONT_SEMI }}
        >
          {invoice.customer}
        </Text>
        <Text
          className="text-[12px]"
          style={{ color: TEXT_SECONDARY, fontFamily: FONT_REG }}
        >
          {invoice.reference} · Due {invoice.dueDate}
        </Text>
      </View>

      <View className="items-end mr-2">
        <Text
          className="text-[12px] mb-1"
          style={{ color: TEXT_SECONDARY, fontFamily: FONT_REG }}
        >
          {invoice.statusLabel}
        </Text>
        <Text
          className="text-[15px] mb-1.5"
          style={{ color: TEXT_PRIMARY, fontFamily: FONT_BOLD }}
        >
          {invoice.amount}
        </Text>
        <StatusPill
          label={INVOICE_STATUS_LABEL[invoice.status]}
          tone={INVOICE_STATUS_TONE[invoice.status]}
        />
      </View>

      <ChevronRight size={16} color={TEXT_SECONDARY} />
    </Pressable>
  );
}

export function PillTabs({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <View
      className="flex-row self-start rounded-[999px] p-1 mb-5"
      style={{ backgroundColor: BG, ...SHADOW_SM }}
    >
      {options.map((opt) => {
        const active = opt === value;
        return (
          <Pressable
            key={opt}
            onPress={() => onChange(opt)}
            className="px-4 py-2 rounded-[999px]"
            style={{ backgroundColor: active ? GREEN : "transparent" }}
          >
            <Text
              className="text-[13px]"
              style={{
                color: active ? "#FFFFFF" : TEXT_SECONDARY,
                fontFamily: FONT_SEMI,
              }}
            >
              {opt}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Generic segmented tabs for {label,value} option objects (e.g. form Type/Source pickers). */
export function SegmentedTabs<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly { label: string; value: T }[];
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
            className="px-3 py-2 rounded-[999px]"
            style={{
              backgroundColor: active ? GREEN : BG,
              ...(active ? null : SHADOW_SM),
            }}
          >
            <Text
              className="text-[13px]"
              style={{
                color: active ? "#FFFFFF" : TEXT_SECONDARY,
                fontFamily: FONT_MED,
              }}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function FilterChips({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="mb-5"
      contentContainerStyle={{ paddingRight: 8, paddingVertical: SPACE_2 }}
    >
      {options.map((opt) => {
        const active = opt === value;
        return (
          <Pressable
            key={opt}
            onPress={() => onChange(opt)}
            className="px-3 py-2 rounded-[999px] mr-2"
            style={{
              backgroundColor: active ? GREEN : BG,
              ...(active ? null : SHADOW_SM),
            }}
          >
            <Text
              className="text-[12px]"
              style={{
                color: active ? "#FFFFFF" : TEXT_SECONDARY,
                fontFamily: FONT_MED,
              }}
            >
              {opt}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

/** White form card — same treatment as the login/register screens' FormCard, reused for Add Transaction etc. */
export function FormCard({ children }: { children: ReactNode }) {
  return (
    <View className="rounded-[24px] bg-white p-5 mb-6" style={SHADOW_MD}>
      {children}
    </View>
  );
}

/** Inline error banner — same treatment as the auth screens' ErrorBanner. */
export function ErrorBanner({ message }: { message: string }) {
  return (
    <View
      className="rounded-[14px] px-3 py-2 mb-4"
      style={{ backgroundColor: DANGER_BG, ...SHADOW_SM }}
    >
      <Text style={{ color: DANGER, fontFamily: FONT_MED, fontSize: 13 }}>
        {message}
      </Text>
    </View>
  );
}

/** Fire-and-forget confirmation, e.g. "Transaction saved". No extra native dependency. */
export function showToast(message: string) {
  console.log("[toast]", message);
}

/** Label/value row with optional avatar-style initials and a trailing status pill — Settings integrations, Suppliers, KRA lists. */
export function InfoRow({
  initials,
  title,
  subtitle,
  trailingLabel,
  trailingTone = "neutral",
  onPress,
}: {
  initials?: string;
  title: string;
  subtitle: string;
  trailingLabel?: string;
  trailingTone?: "positive" | "warning" | "neutral" | "danger";
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center rounded-[12px] p-4 mb-3"
      style={{ backgroundColor: BG, ...SHADOW_SM }}
    >
      {initials && (
        <View
          className="w-10 h-10 rounded-[10px] items-center justify-center mr-3"
          style={{ backgroundColor: GREEN_TINT_A }}
        >
          <Text
            className="text-[13px]"
            style={{ color: GREEN, fontFamily: FONT_SEMI }}
          >
            {initials}
          </Text>
        </View>
      )}
      <View className="flex-1 mr-2">
        <Text
          className="text-[14px] mb-1"
          style={{ color: TEXT_PRIMARY, fontFamily: FONT_SEMI }}
        >
          {title}
        </Text>
        <Text
          className="text-[12px]"
          style={{ color: TEXT_SECONDARY, fontFamily: FONT_REG }}
        >
          {subtitle}
        </Text>
      </View>
      {trailingLabel && (
        <StatusPill label={trailingLabel} tone={trailingTone} />
      )}
    </Pressable>
  );
}

export type NavKey = "dashboard" | "sales" | "kra" | "more";

export type MoreRoute = {
  key: string;
  label: string;
  icon: (color: string) => ReactNode;
  onPress: () => void;
};

/** Bottom sheet listing every route not pinned to the tab bar (Inventory, Payroll, Suppliers, Reports, Settings). */
export function MoreSheet({
  visible,
  onClose,
  routes,
}: {
  visible: boolean;
  onClose: () => void;
  routes: MoreRoute[];
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        style={{
          flex: 1,
          backgroundColor: OVERLAY_SCRIM,
          justifyContent: "flex-end",
        }}
        onPress={onClose}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="rounded-t-[20px] px-2 pt-3 pb-8"
          style={{ backgroundColor: BG, ...SHADOW_MD }}
        >
          <View
            className="self-center rounded-[999px] mb-4"
            style={{ width: 36, height: 4, backgroundColor: BORDER }}
          />
          {routes.map((r, i) => (
            <Pressable
              key={r.key}
              onPress={() => {
                onClose();
                r.onPress();
              }}
              className="flex-row items-center px-4 py-4"
              style={{
                borderTopWidth: i === 0 ? 0 : 1,
                borderTopColor: BORDER,
              }}
            >
              <View
                className="w-9 h-9 rounded-[10px] items-center justify-center mr-3"
                style={{ backgroundColor: GREEN_TINT_A }}
              >
                {r.icon(GREEN)}
              </View>
              <Text
                className="text-[14px]"
                style={{ color: TEXT_PRIMARY, fontFamily: FONT_MED }}
              >
                {r.label}
              </Text>
            </Pressable>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/** Bottom tab bar — Dashboard / Sales / KRA / More. `badge` shows a small red count (e.g. pending KRA filings). */
export function BottomNav({
  active,
  onChange,
  onAdd,
  navItems,
}: {
  active: NavKey;
  onChange: (key: NavKey) => void;
  onAdd?: () => void;
  navItems: {
    key: NavKey;
    label: string;
    icon: (color: string) => ReactNode;
    badge?: number;
  }[];
}) {
  return (
    <View
      className="absolute bottom-0 left-0 right-0"
      style={{
        backgroundColor: BG,
        height: 78,
        ...SHADOW_MD,
        shadowOffset: { width: 0, height: -4 },
      }}
    >
      <View
        className="flex-1 flex-row items-center justify-around pt-2"
        style={{ paddingBottom: 24 }}
      >
        {navItems.map((item) => {
          const isActive = item.key === active;
          const color = isActive ? GREEN : TEXT_SECONDARY;
          return (
            <Pressable
              key={item.key}
              onPress={() => onChange(item.key)}
              className="items-center justify-center flex-1"
            >
              <View
                className="items-center justify-center rounded-[999px] mb-0.5"
                style={{
                  width: 36,
                  height: 28,
                  backgroundColor: isActive ? GREEN_TINT_A : "transparent",
                }}
              >
                {item.icon(color)}
                {!!item.badge && (
                  <View
                    className="absolute -top-1 -right-1 rounded-[999px] items-center justify-center"
                    style={{
                      minWidth: 15,
                      height: 15,
                      paddingHorizontal: 3,
                      backgroundColor: DANGER,
                    }}
                  >
                    <Text
                      style={{
                        color: "#FFFFFF",
                        fontSize: 9,
                        fontFamily: FONT_SEMI,
                      }}
                    >
                      {item.badge}
                    </Text>
                  </View>
                )}
              </View>
              <Text
                className="text-[10px] mt-0.5"
                style={{ color, fontFamily: isActive ? FONT_SEMI : FONT_MED }}
                numberOfLines={1}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        onPress={onAdd}
        className="absolute items-center justify-center w-14 h-14 rounded-[999px]"
        style={{
          backgroundColor: GREEN,
          right: 18,
          top: -50,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.28,
          shadowRadius: 10,
          elevation: 8,
        }}
      >
        <Text style={{ color: "#FFFFFF", fontSize: 26, fontFamily: FONT_SEMI }}>
          +
        </Text>
      </Pressable>
    </View>
  );
}
