import { LinearGradient } from "expo-linear-gradient";
import { usePathname, useRouter } from "expo-router";
import {
  AlertTriangle,
  BarChart3,
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Info,
  LayoutGrid,
  LogOut,
  Moon,
  MoreHorizontal,
  Package,
  Receipt,
  Search,
  Settings,
  Sun,
  Truck,
  User,
  Users,
} from "lucide-react-native";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
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
 * Mizani design system — every screen's chrome, cards and navigation.
 *
 * Tokens mirror global.css :root. Surface model: the page sits on SURFACE
 * (off-white), cards sit on BG (white) or on a page gradient, and depth comes
 * from shadow rather than borders. Translucent (rgba) fills appear ONLY on top
 * of a gradient — that is the "glass" treatment. Anything sitting directly on
 * SURFACE or BG uses a fully opaque solid color so it never looks washed out.
 */

/* ---------------------------------------------------------------- */
/* Tokens                                                            */
/* ---------------------------------------------------------------- */

export const BG = "#FFFFFF";
export const SURFACE = "#F7F9F8";
export const BORDER = "#D9DEDB";
export const TEXT_PRIMARY = "#111827";
export const TEXT_SECONDARY = "#4B5563";
export const GREEN = "#0A5C36";
export const GREEN_DARK = "#063D24";
export const GREEN_TINT = "#E6F2EB";
export const WARNING = "#D97706";
export const WARNING_DARK = "#92400E";
export const WARNING_BG = "#FEF3E2";
export const DANGER = "#DC2626";
export const DANGER_DARK = "#991B1B";
export const DANGER_BG = "#FDECEC";

export const OVERLAY_SCRIM = "rgba(17,24,39,0.42)";

/** Glass layers — valid only on top of a gradient surface. */
export const GLASS_FILL = "rgba(255,255,255,0.14)";
export const GLASS_FILL_STRONG = "rgba(255,255,255,0.22)";
export const GLASS_BORDER = "rgba(255,255,255,0.28)";
export const GLASS_TEXT = "rgba(255,255,255,0.86)";
export const GLASS_TEXT_DIM = "rgba(255,255,255,0.70)";

/** Opaque tints for pills sitting on white — solid, not rgba. */
export const GREEN_TINT_A = GREEN_TINT;
export const WARNING_TINT_A = WARNING_BG;
export const DANGER_TINT_A = DANGER_BG;

export const SPACE_1 = 4;
export const SPACE_2 = 8;
export const SPACE_3 = 16;
export const SPACE_4 = 24;
export const SPACE_5 = 32;

export const FONT_REG = "Lexend_400Regular";
export const FONT_MED = "Lexend_500Medium";
export const FONT_SEMI = "Lexend_600SemiBold";
export const FONT_BOLD = "Lexend_700Bold";

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

export type Gradient = [string, string, ...string[]];

/**
 * Three gradients, one job each. Every hue is a global.css token (primary
 * green, simba red, warning amber) pushed to a dark → mid → lively stop.
 *
 *   FOREST  — the default. Every page hero, CTA, the avatar and the FAB.
 *   CRIMSON — alerts only: overdue money, blocked filings, unpaid staff.
 *   AMBER   — statutory deadlines: tax and payroll obligations with a due date.
 */
export const GRADIENT_FOREST: Gradient = ["#063D24", "#0A5C36", "#22C55E"];
export const GRADIENT_CRIMSON: Gradient = ["#7F1414", "#B91C1C", "#F87171"];
export const GRADIENT_AMBER: Gradient = ["#7C2D12", "#B45309", "#F59E0B"];

/** Brand gradient — the avatar, FAB and primary CTAs use this on every screen. */
export const GRADIENT_PRIMARY = GRADIENT_FOREST;

const GRADIENT_START = { x: 0, y: 0 } as const;
const GRADIENT_END = { x: 1, y: 1 } as const;

/* ---------------------------------------------------------------- */
/* Toast                                                             */
/* ---------------------------------------------------------------- */

let toastListener: ((message: string) => void) | null = null;

/** Fire-and-forget confirmation, e.g. "Transaction saved". Rendered by ToastHost. */
export function showToast(message: string) {
  toastListener?.(message);
}

/** Mount once per screen, after the BottomNav, to display showToast() messages. */
export function ToastHost() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    toastListener = (m) => setMessage(m);
    return () => {
      toastListener = null;
    };
  }, []);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 2400);
    return () => clearTimeout(t);
  }, [message]);

  if (!message) return null;

  return (
    <View
      pointerEvents="none"
      style={{ position: "absolute", left: 16, right: 16, bottom: 96 }}
    >
      <View
        className="rounded-[12px] px-4 py-3"
        style={{ backgroundColor: TEXT_PRIMARY, ...SHADOW_MD }}
      >
        <Text
          className="text-[13px]"
          style={{ color: "#FFFFFF", fontFamily: FONT_MED }}
        >
          {message}
        </Text>
      </View>
    </View>
  );
}

/* ---------------------------------------------------------------- */
/* Route registry — the single source of truth for navigation.        */
/* Add a page here and it appears in the tab bar or the More sheet    */
/* on every screen, with no per-screen wiring.                       */
/* ---------------------------------------------------------------- */

export type NavKey = string;

export type NavRoute = {
  /** Stable id — also the BottomNav active key. */
  key: NavKey;
  label: string;
  /** expo-router path. The last segment is matched against the pathname. */
  href: string;
  icon: (color: string, size?: number) => ReactNode;
  /** "tab" pins it to the bottom bar, "more" puts it in the More sheet. */
  slot: "tab" | "more";
  /** Page accent gradient, used by that screen's hero card. */
  gradient: Gradient;
  badge?: number;
};

export const APP_ROUTES: NavRoute[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    href: "/(dashboard)/main",
    icon: (c, s = 20) => <LayoutGrid size={s} color={c} />,
    slot: "tab",
    gradient: GRADIENT_FOREST,
  },
  {
    key: "sales",
    label: "Sales",
    href: "/(dashboard)/sales",
    icon: (c, s = 20) => <Receipt size={s} color={c} />,
    slot: "tab",
    gradient: GRADIENT_FOREST,
  },
  {
    key: "kra",
    label: "KRA",
    href: "/(dashboard)/kra",
    icon: (c, s = 20) => <FileText size={s} color={c} />,
    slot: "tab",
    gradient: GRADIENT_AMBER,
    badge: 2,
  },
  {
    key: "payroll",
    label: "Payroll",
    href: "/(dashboard)/payroll",
    icon: (c, s = 20) => <Users size={s} color={c} />,
    slot: "tab",
    gradient: GRADIENT_FOREST,
  },
  {
    key: "inventory",
    label: "Inventory",
    href: "/(dashboard)/inventory",
    icon: (c, s = 20) => <Package size={s} color={c} />,
    slot: "more",
    gradient: GRADIENT_FOREST,
  },
  {
    key: "suppliers",
    label: "Suppliers",
    href: "/(dashboard)/suppliers",
    icon: (c, s = 20) => <Truck size={s} color={c} />,
    slot: "more",
    gradient: GRADIENT_FOREST,
  },
  {
    key: "reports",
    label: "Reports",
    href: "/(dashboard)/reports",
    icon: (c, s = 20) => <BarChart3 size={s} color={c} />,
    slot: "more",
    gradient: GRADIENT_FOREST,
  },
  {
    key: "notifications",
    label: "Notifications",
    href: "/(dashboard)/notifications",
    icon: (c, s = 20) => <Bell size={s} color={c} />,
    slot: "more",
    gradient: GRADIENT_FOREST,
  },
];

/** Settings is reached from the avatar menu only — never the tab bar or More sheet. */
export const SETTINGS_HREF = "/(dashboard)/settings";
export const ADD_TRANSACTION_HREF = "/(dashboard)/add-transaction";

export const TAB_ROUTES = APP_ROUTES.filter((r) => r.slot === "tab");
export const MORE_ROUTES = APP_ROUTES.filter((r) => r.slot === "more");

const lastSegment = (path: string) => path.split("/").filter(Boolean).pop();

export function routeByKey(key: NavKey) {
  return APP_ROUTES.find((r) => r.key === key);
}

/** Page accent gradient for a route key, falling back to the brand gradient. */
export function gradientFor(key: NavKey): Gradient {
  return routeByKey(key)?.gradient ?? GRADIENT_PRIMARY;
}

/** Resolves the active route key from the current pathname. */
export function useActiveRouteKey(): NavKey | undefined {
  const pathname = usePathname();
  const segment = lastSegment(pathname ?? "");
  if (!segment) return undefined;
  if (segment === "main") return "dashboard";
  return APP_ROUTES.find((r) => lastSegment(r.href) === segment)?.key;
}

/* ---------------------------------------------------------------- */
/* Primitives                                                        */
/* ---------------------------------------------------------------- */

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
          className="rounded-[14px] overflow-hidden"
          style={{
            position: "absolute",
            top: anchor.y + anchor.height + 8,
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

/** Translucent panel — only valid on top of a gradient (the glass treatment). */
export function GlassPanel({
  children,
  strong,
  style,
}: {
  children: ReactNode;
  strong?: boolean;
  style?: ViewStyle;
}) {
  return (
    <View
      className="rounded-[12px] p-4"
      style={{
        backgroundColor: strong ? GLASS_FILL_STRONG : GLASS_FILL,
        borderWidth: 1,
        borderColor: GLASS_BORDER,
        ...style,
      }}
    >
      {children}
    </View>
  );
}

/** Glass pill — the small translucent badge used on gradient surfaces. */
export function GlassBadge({ label }: { label: string }) {
  return (
    <View
      className="px-2.5 py-1 rounded-[999px]"
      style={{
        backgroundColor: GLASS_FILL_STRONG,
        borderWidth: 1,
        borderColor: GLASS_BORDER,
      }}
    >
      <Text
        className="text-[11px]"
        style={{ color: "#FFFFFF", fontFamily: FONT_SEMI }}
      >
        {label}
      </Text>
    </View>
  );
}

export function PillRow({ children }: { children: ReactNode }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingVertical: SPACE_2,
        paddingHorizontal: SPACE_3,
        alignItems: "center",
      }}
    >
      {children}
    </ScrollView>
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
          width={210}
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

/** Round icon button. Header-level actions use size 44 so they read as primary. */
export function IconButton({
  icon,
  onPress,
  dot,
  size = 44,
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
          className="absolute top-2.5 right-2.5 rounded-[999px]"
          style={{
            width: 9,
            height: 9,
            backgroundColor: DANGER,
            borderWidth: 1.5,
            borderColor: BG,
          }}
        />
      )}
    </Pressable>
  );
}

/* ---------------------------------------------------------------- */
/* Header — no app name or logo: gradient avatar left, bell right.    */
/* ---------------------------------------------------------------- */

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
        className="w-12 h-12 rounded-[999px] items-center justify-center ml-2"
        style={{ backgroundColor: BG, ...SHADOW_SM }}
      >
        <Bell size={22} color={TEXT_PRIMARY} />
        {notifications.length > 0 && (
          <View
            className="absolute rounded-[999px] items-center justify-center"
            style={{
              top: 6,
              right: 6,
              minWidth: 18,
              height: 18,
              paddingHorizontal: 4,
              backgroundColor: DANGER,
              borderWidth: 2,
              borderColor: BG,
            }}
          >
            <Text
              style={{ color: "#FFFFFF", fontSize: 9, fontFamily: FONT_BOLD }}
            >
              {notifications.length}
            </Text>
          </View>
        )}
      </Pressable>

      <DropdownMenu
        visible={open}
        onClose={() => setOpen(false)}
        anchor={anchor}
        align="right"
        width={290}
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
              You&rsquo;re all caught up
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

/** Gradient-filled avatar — the app's most-tapped control, so it carries the
 *  brand gradient and a white ring to stay unmissable against the page. */
export function UserMenu({
  initials,
  name,
  role,
  onAccount,
  onSettings,
  onLogout,
  colors = GRADIENT_PRIMARY,
}: {
  initials: string;
  name?: string;
  role?: string;
  onAccount?: () => void;
  onSettings?: () => void;
  onLogout?: () => void;
  colors?: Gradient;
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
        className="rounded-[999px] items-center justify-center"
        style={{
          width: 48,
          height: 48,
          backgroundColor: BG,
          padding: 2.5,
          ...SHADOW_MD,
        }}
      >
        <LinearGradient
          colors={colors}
          start={GRADIENT_START}
          end={GRADIENT_END}
          style={{
            flex: 1,
            alignSelf: "stretch",
            borderRadius: 999,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            className="text-[15px]"
            style={{ color: "#FFFFFF", fontFamily: FONT_BOLD }}
          >
            {initials}
          </Text>
        </LinearGradient>
      </Pressable>

      <DropdownMenu
        visible={open}
        onClose={() => setOpen(false)}
        anchor={anchor}
        width={220}
      >
        {(name || role) && (
          <View
            className="px-4 py-3"
            style={{ borderBottomWidth: 1, borderBottomColor: BORDER }}
          >
            <Text
              className="text-[13px]"
              style={{ color: TEXT_PRIMARY, fontFamily: FONT_SEMI }}
            >
              {name}
            </Text>
            {!!role && (
              <Text
                className="text-[11px] mt-0.5"
                style={{ color: TEXT_SECONDARY, fontFamily: FONT_REG }}
              >
                {role}
              </Text>
            )}
          </View>
        )}

        <Pressable
          className="flex-row items-center px-4 py-3"
          onPress={() => {
            setOpen(false);
            onAccount?.();
          }}
        >
          <User size={16} color={TEXT_SECONDARY} />
          <Text
            className="text-[13px] ml-2.5"
            style={{ color: TEXT_PRIMARY, fontFamily: FONT_MED }}
          >
            Account
          </Text>
        </Pressable>

        <Pressable
          className="flex-row items-center px-4 py-3"
          style={{ borderTopWidth: 1, borderTopColor: BORDER }}
          onPress={() => {
            setOpen(false);
            onSettings?.();
          }}
        >
          <Settings size={16} color={TEXT_SECONDARY} />
          <Text
            className="text-[13px] ml-2.5"
            style={{ color: TEXT_PRIMARY, fontFamily: FONT_MED }}
          >
            Settings
          </Text>
        </Pressable>

        <Pressable
          className="flex-row items-center px-4 py-3"
          style={{ borderTopWidth: 1, borderTopColor: BORDER }}
          onPress={() => {
            setOpen(false);
            onLogout?.();
          }}
        >
          <LogOut size={16} color={DANGER} />
          <Text
            className="text-[13px] ml-2.5"
            style={{ color: DANGER, fontFamily: FONT_MED }}
          >
            Log out
          </Text>
        </Pressable>
      </DropdownMenu>
    </>
  );
}

/**
 * Shared top bar for every screen: profile avatar on the left (Account,
 * Settings and Log out all live in its menu — there is deliberately no
 * separate gear icon) and notifications on the right.
 */
export function AppHeader({
  initials = "WM",
  name,
  role,
  notifications = [],
  showBack,
}: {
  initials?: string;
  name?: string;
  role?: string;
  notifications?: NotificationItem[];
  /** For pushed screens such as Settings, which are not in the tab bar. */
  showBack?: boolean;
}) {
  const router = useRouter();

  return (
    <View className="flex-row items-center justify-between px-4">
      <View className="flex-row items-center">
        {showBack && (
          <Pressable
            onPress={() => router.back()}
            className="w-11 h-11 rounded-[999px] items-center justify-center mr-2"
            style={{ backgroundColor: BG, ...SHADOW_SM }}
          >
            <ChevronLeft size={20} color={TEXT_PRIMARY} />
          </Pressable>
        )}
        <UserMenu
          initials={initials}
          name={name}
          role={role}
          onAccount={() => showToast("Account profile coming soon")}
          onSettings={() => router.push(SETTINGS_HREF as never)}
          onLogout={() => router.replace("/login" as never)}
        />
      </View>

      <NotificationBell
        notifications={notifications}
        onViewAll={() => router.push("/(dashboard)/notifications" as never)}
      />
    </View>
  );
}

/* ---------------------------------------------------------------- */
/* Search                                                            */
/* ---------------------------------------------------------------- */

export type SearchItem = { id: string; title: string; subtitle: string };

export function SearchTrigger({ onPress }: { onPress: () => void }) {
  return (
    <IconButton
      icon={<Search size={18} color={TEXT_PRIMARY} />}
      onPress={onPress}
      size={40}
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
                  No results for “{query}”
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

/* ---------------------------------------------------------------- */
/* Buttons                                                           */
/* ---------------------------------------------------------------- */

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
      className="flex-row items-center self-start px-3.5 py-2.5 rounded-[999px]"
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

/** Primary CTA — gradient fill, so it reads as the liveliest thing on the page. */
export function PrimaryButton({
  label,
  icon,
  onPress,
  colors = GRADIENT_PRIMARY,
}: {
  label: string;
  icon?: ReactNode;
  onPress?: () => void;
  colors?: Gradient;
}) {
  return (
    <Pressable onPress={onPress} style={{ borderRadius: 999, ...SHADOW_SM }}>
      <LinearGradient
        colors={colors}
        start={GRADIENT_START}
        end={GRADIENT_END}
        style={{
          borderRadius: 999,
          height: 50,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
        <Text
          className="text-[14px] ml-1.5"
          style={{ color: "#FFFFFF", fontFamily: FONT_SEMI }}
        >
          {label}
        </Text>
      </LinearGradient>
    </Pressable>
  );
}

/* ---------------------------------------------------------------- */
/* Greeting                                                          */
/* ---------------------------------------------------------------- */

function timeOfDay(hour: number) {
  if (hour < 12) return { label: "Good morning", icon: Sun };
  if (hour < 17) return { label: "Good afternoon", icon: Sun };
  return { label: "Good evening", icon: Moon };
}

/**
 * Dashboard welcome banner — gradient surface, Lexend throughout, with the
 * time-of-day icon set in a glass circle so the greeting and the icon read as
 * one element rather than two stacked ones.
 */
export function GreetingBanner({
  name,
  subtitle,
  colors = GRADIENT_PRIMARY,
}: {
  name: string;
  subtitle?: string;
  colors?: Gradient;
}) {
  const { label, icon: Icon } = timeOfDay(new Date().getHours());

  return (
    <LinearGradient
      colors={colors}
      start={GRADIENT_START}
      end={GRADIENT_END}
      style={{ borderRadius: 18, padding: 18, ...SHADOW_MD }}
    >
      <View className="flex-row items-center">
        <View
          className="rounded-[999px] items-center justify-center mr-3.5"
          style={{
            width: 46,
            height: 46,
            backgroundColor: GLASS_FILL_STRONG,
            borderWidth: 1,
            borderColor: GLASS_BORDER,
          }}
        >
          <Icon size={22} color="#FFFFFF" />
        </View>

        <View className="flex-1">
          <Text
            className="text-[12px]"
            style={{
              color: GLASS_TEXT,
              fontFamily: FONT_MED,
              letterSpacing: 0.4,
            }}
          >
            {label.toUpperCase()}
          </Text>
          <Text
            className="text-[22px] mt-0.5"
            style={{ color: "#FFFFFF", fontFamily: FONT_BOLD }}
          >
            {name}
          </Text>
          {!!subtitle && (
            <Text
              className="text-[12px] mt-1"
              style={{ color: GLASS_TEXT, fontFamily: FONT_REG }}
            >
              {subtitle}
            </Text>
          )}
        </View>
      </View>
    </LinearGradient>
  );
}

/** Page title block — same rhythm on every screen. */
export function PageTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <View
      className="px-4"
      style={{ marginTop: SPACE_5, marginBottom: SPACE_4 }}
    >
      <Text
        className="text-[26px]"
        style={{ color: TEXT_PRIMARY, fontFamily: FONT_BOLD }}
      >
        {title}
      </Text>
      {!!subtitle && (
        <Text
          className="text-[13px] mt-1"
          style={{ color: TEXT_SECONDARY, fontFamily: FONT_REG }}
        >
          {subtitle}
        </Text>
      )}
    </View>
  );
}

/** Section heading with an optional right-hand link. */
export function SectionHeading({
  title,
  subtitle,
  actionLabel,
  onAction,
}: {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View
      className="flex-row items-start justify-between"
      style={{ marginBottom: SPACE_3 }}
    >
      <View className="flex-1 mr-3">
        <Text
          className="text-[17px]"
          style={{ color: TEXT_PRIMARY, fontFamily: FONT_SEMI }}
        >
          {title}
        </Text>
        {!!subtitle && (
          <Text
            className="text-[12px] mt-1"
            style={{ color: TEXT_SECONDARY, fontFamily: FONT_REG }}
          >
            {subtitle}
          </Text>
        )}
      </View>
      {!!actionLabel && (
        <Pressable onPress={onAction}>
          <Text
            className="text-[12px] mt-1"
            style={{ color: GREEN, fontFamily: FONT_SEMI }}
          >
            {actionLabel}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

/* ---------------------------------------------------------------- */
/* Alerts                                                            */
/* ---------------------------------------------------------------- */

/**
 * Alert banner. `tone="danger"` renders on the crimson gradient with glass
 * inner surfaces — the loudest thing the app can show — while "warning" and
 * "info" stay on solid tinted fills.
 */
export function AlertBanner({
  title,
  description,
  actionLabel,
  onAction,
  tone = "warning",
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  tone?: "warning" | "danger" | "info";
}) {
  if (tone === "danger") {
    return (
      <LinearGradient
        colors={GRADIENT_CRIMSON}
        start={GRADIENT_START}
        end={GRADIENT_END}
        style={{
          borderRadius: 14,
          padding: 16,
          marginBottom: SPACE_4,
          ...SHADOW_MD,
        }}
      >
        <View className="flex-row items-center mb-2.5">
          <View
            className="w-9 h-9 rounded-[999px] items-center justify-center mr-3"
            style={{
              backgroundColor: GLASS_FILL_STRONG,
              borderWidth: 1,
              borderColor: GLASS_BORDER,
            }}
          >
            <AlertTriangle size={17} color="#FFFFFF" />
          </View>
          <Text
            className="flex-1 text-[15px]"
            style={{ color: "#FFFFFF", fontFamily: FONT_SEMI }}
          >
            {title}
          </Text>
        </View>
        <Text
          className="text-[13px] leading-[19px] mb-3.5"
          style={{ color: GLASS_TEXT, fontFamily: FONT_REG }}
        >
          {description}
        </Text>
        {!!actionLabel && (
          <Pressable
            onPress={onAction}
            className="self-start px-4 py-2.5 rounded-[999px]"
            style={{ backgroundColor: "#FFFFFF" }}
          >
            <Text
              className="text-[13px]"
              style={{ color: DANGER_DARK, fontFamily: FONT_SEMI }}
            >
              {actionLabel}
            </Text>
          </Pressable>
        )}
      </LinearGradient>
    );
  }

  const isInfo = tone === "info";
  const fill = isInfo ? GREEN_TINT : WARNING_BG;
  const accent = isInfo ? GREEN : WARNING;
  const titleColor = isInfo ? GREEN_DARK : WARNING_DARK;
  const Icon = isInfo ? Info : AlertTriangle;

  return (
    <View
      className="rounded-[14px] p-4"
      style={{ backgroundColor: fill, marginBottom: SPACE_4, ...SHADOW_SM }}
    >
      <View className="flex-row items-center mb-2.5">
        <View
          className="w-9 h-9 rounded-[999px] items-center justify-center mr-3"
          style={{ backgroundColor: accent }}
        >
          <Icon size={17} color="#FFFFFF" />
        </View>
        <Text
          className="flex-1 text-[15px]"
          style={{ color: titleColor, fontFamily: FONT_SEMI }}
        >
          {title}
        </Text>
      </View>
      <Text
        className="text-[13px] leading-[19px] mb-3.5"
        style={{ color: TEXT_SECONDARY, fontFamily: FONT_REG }}
      >
        {description}
      </Text>
      {!!actionLabel && (
        <Pressable
          onPress={onAction}
          className="self-start px-4 py-2.5 rounded-[999px]"
          style={{ backgroundColor: accent }}
        >
          <Text
            className="text-[13px]"
            style={{ color: "#FFFFFF", fontFamily: FONT_SEMI }}
          >
            {actionLabel}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

/* ---------------------------------------------------------------- */
/* Stat cards                                                        */
/* ---------------------------------------------------------------- */

export function BudgetProgress({
  percent,
  color = WARNING,
  track = BORDER,
}: {
  percent: number;
  color?: string;
  track?: string;
}) {
  return (
    <View
      className="h-[6px] rounded-[999px] mb-4 overflow-hidden"
      style={{ backgroundColor: track }}
    >
      <View
        style={{
          width: `${Math.min(Math.max(percent, 0), 100)}%`,
          height: "100%",
          backgroundColor: color,
          borderRadius: 999,
        }}
      />
    </View>
  );
}

type MiniStat = { label: string; value: string };

/** Solid-fill stat card. Tones are fully opaque colors — never a translucent tint. */
export function StatCard({
  title,
  badgeLabel,
  badgeTone = "neutral",
  value,
  helper,
  progressPercent,
  footerStats,
  tone = "neutral",
}: {
  title: string;
  badgeLabel?: string;
  badgeTone?: "positive" | "warning" | "neutral" | "danger";
  value: string;
  helper?: string;
  progressPercent?: number;
  footerStats?: MiniStat[];
  tone?: "neutral" | "success" | "danger" | "warning";
}) {
  const filled = tone !== "neutral";
  const cardBg =
    tone === "success" ? GREEN : tone === "warning" ? WARNING : DANGER;

  const badgeColors: Record<string, { bg: string; fg: string }> = {
    positive: { bg: GREEN_TINT, fg: GREEN },
    warning: { bg: WARNING_BG, fg: WARNING_DARK },
    danger: { bg: DANGER_BG, fg: DANGER },
    neutral: { bg: SURFACE, fg: TEXT_SECONDARY },
  };
  const badge = badgeColors[badgeTone];

  return (
    <View
      className="rounded-[14px] p-5"
      style={{
        backgroundColor: filled ? cardBg : BG,
        marginBottom: SPACE_4,
        ...(filled ? SHADOW_MD : SHADOW_SM),
      }}
    >
      <View className="flex-row items-center justify-between mb-3">
        <Text
          className="text-[13px]"
          style={{
            color: filled ? "rgba(255,255,255,0.88)" : TEXT_SECONDARY,
            fontFamily: FONT_MED,
          }}
        >
          {title}
        </Text>
        {!!badgeLabel && (
          <View
            className="px-2.5 py-1 rounded-[999px]"
            style={{ backgroundColor: filled ? "#FFFFFF" : badge.bg }}
          >
            <Text
              className="text-[11px]"
              style={{
                color: filled ? cardBg : badge.fg,
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
        style={{
          color: filled ? "#FFFFFF" : TEXT_PRIMARY,
          fontFamily: FONT_BOLD,
        }}
      >
        {value}
      </Text>

      {!!helper && (
        <Text
          className="text-[13px] mb-3"
          style={{
            color: filled ? "rgba(255,255,255,0.88)" : TEXT_SECONDARY,
            fontFamily: FONT_REG,
          }}
        >
          {helper}
        </Text>
      )}

      {progressPercent !== undefined && (
        <BudgetProgress
          percent={progressPercent}
          color={filled ? "#FFFFFF" : WARNING}
          track={filled ? "rgba(255,255,255,0.28)" : BORDER}
        />
      )}

      {!!footerStats && (
        <View
          className="flex-row justify-between pt-3"
          style={{
            borderTopWidth: 1,
            borderTopColor: filled ? "rgba(255,255,255,0.3)" : BORDER,
          }}
        >
          {footerStats.map((stat) => (
            <View key={stat.label}>
              <Text
                className="text-[11px] mb-1"
                style={{
                  color: filled ? "rgba(255,255,255,0.78)" : TEXT_SECONDARY,
                  fontFamily: FONT_MED,
                }}
              >
                {stat.label}
              </Text>
              <Text
                className="text-[14px]"
                style={{
                  color: filled ? "#FFFFFF" : TEXT_PRIMARY,
                  fontFamily: FONT_SEMI,
                }}
              >
                {stat.value}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

/**
 * Hero card on a page gradient with glass inner surfaces — the treatment from
 * the dashboard's KRA liability card, reused as each screen's headline metric.
 * `rows` renders a glass breakdown list underneath the value.
 */
export function GradientStatCard({
  title,
  badgeLabel,
  value,
  helper,
  rows,
  footerStats,
  actionLabel,
  actionIcon,
  onAction,
  colors = GRADIENT_PRIMARY,
}: {
  title: string;
  badgeLabel?: string;
  value: string;
  helper?: string;
  rows?: MiniStat[];
  footerStats?: MiniStat[];
  actionLabel?: string;
  actionIcon?: ReactNode;
  onAction?: () => void;
  colors?: Gradient;
}) {
  return (
    <LinearGradient
      colors={colors}
      start={GRADIENT_START}
      end={GRADIENT_END}
      style={{
        borderRadius: 16,
        padding: 20,
        marginBottom: SPACE_4,
        ...SHADOW_MD,
      }}
    >
      <View className="flex-row items-center justify-between mb-3">
        <Text
          className="text-[13px] flex-1 mr-2"
          style={{ color: GLASS_TEXT, fontFamily: FONT_MED }}
        >
          {title}
        </Text>
        {!!badgeLabel && <GlassBadge label={badgeLabel} />}
      </View>

      <Text
        className="text-[30px] mb-2"
        style={{ color: "#FFFFFF", fontFamily: FONT_BOLD }}
      >
        {value}
      </Text>

      {!!helper && (
        <Text
          className="text-[13px]"
          style={{ color: GLASS_TEXT, fontFamily: FONT_REG }}
        >
          {helper}
        </Text>
      )}

      {!!rows?.length && (
        <GlassPanel style={{ marginTop: SPACE_3, padding: 4 }}>
          {rows.map((row, i) => (
            <View
              key={row.label}
              className="flex-row items-center justify-between px-3 py-2.5"
              style={{
                borderTopWidth: i === 0 ? 0 : 1,
                borderTopColor: GLASS_BORDER,
              }}
            >
              <Text
                className="text-[12px]"
                style={{ color: GLASS_TEXT, fontFamily: FONT_MED }}
              >
                {row.label}
              </Text>
              <Text
                className="text-[13px]"
                style={{ color: "#FFFFFF", fontFamily: FONT_SEMI }}
              >
                {row.value}
              </Text>
            </View>
          ))}
        </GlassPanel>
      )}

      {!!footerStats?.length && (
        <View
          className="flex-row justify-between pt-3"
          style={{
            marginTop: SPACE_3,
            borderTopWidth: 1,
            borderTopColor: GLASS_BORDER,
          }}
        >
          {footerStats.map((stat) => (
            <View key={stat.label}>
              <Text
                className="text-[11px] mb-1"
                style={{ color: GLASS_TEXT_DIM, fontFamily: FONT_MED }}
              >
                {stat.label}
              </Text>
              <Text
                className="text-[14px]"
                style={{ color: "#FFFFFF", fontFamily: FONT_SEMI }}
              >
                {stat.value}
              </Text>
            </View>
          ))}
        </View>
      )}

      {!!actionLabel && (
        <Pressable
          onPress={onAction}
          className="flex-row items-center justify-center h-[46px] rounded-[10px]"
          style={{ backgroundColor: "#FFFFFF", marginTop: SPACE_3 }}
        >
          {actionIcon ?? <Download size={15} color={GREEN_DARK} />}
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

/** White card wrapper for row lists — kra liability, reports breakdown, etc. */
export function DataCard({
  children,
  title,
  subtitle,
}: {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}) {
  return (
    <View
      className="rounded-[14px] p-5"
      style={{ backgroundColor: BG, marginBottom: SPACE_4, ...SHADOW_SM }}
    >
      {!!title && (
        <Text
          className="text-[16px] mb-1"
          style={{ color: TEXT_PRIMARY, fontFamily: FONT_SEMI }}
        >
          {title}
        </Text>
      )}
      {!!subtitle && (
        <Text
          className="text-[12px] mb-3"
          style={{ color: TEXT_SECONDARY, fontFamily: FONT_REG }}
        >
          {subtitle}
        </Text>
      )}
      {children}
    </View>
  );
}

/** Label / detail / value row used inside DataCard. */
export function DataRow({
  label,
  detail,
  value,
  first,
  accent,
  emphasis,
}: {
  label: string;
  detail?: string;
  value: string;
  first?: boolean;
  accent?: string;
  emphasis?: boolean;
}) {
  return (
    <View
      className="flex-row items-center justify-between py-3"
      style={{ borderTopWidth: first ? 0 : 1, borderTopColor: BORDER }}
    >
      <View className="flex-row items-center flex-1 mr-3">
        {!!accent && (
          <View
            className="w-2.5 h-2.5 rounded-[999px] mr-3"
            style={{ backgroundColor: accent }}
          />
        )}
        <View className="flex-1">
          <Text
            className="text-[13px]"
            style={{ color: TEXT_PRIMARY, fontFamily: FONT_SEMI }}
          >
            {label}
          </Text>
          {!!detail && (
            <Text
              className="text-[12px] mt-0.5"
              style={{ color: TEXT_SECONDARY, fontFamily: FONT_REG }}
            >
              {detail}
            </Text>
          )}
        </View>
      </View>
      <Text
        className={emphasis ? "text-[18px]" : "text-[14px]"}
        style={{
          color: emphasis ? GREEN : TEXT_PRIMARY,
          fontFamily: emphasis ? FONT_BOLD : FONT_SEMI,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

/* ---------------------------------------------------------------- */
/* Pills, rows and tabs                                              */
/* ---------------------------------------------------------------- */

export function StatusPill({
  label,
  tone,
}: {
  label: string;
  tone: "positive" | "warning" | "neutral" | "danger";
}) {
  const toneColors: Record<string, { bg: string; fg: string }> = {
    positive: { bg: GREEN_TINT, fg: GREEN },
    warning: { bg: WARNING_BG, fg: WARNING_DARK },
    danger: { bg: DANGER_BG, fg: DANGER },
    neutral: { bg: SURFACE, fg: TEXT_SECONDARY },
  };
  const c = toneColors[tone] ?? toneColors.neutral;
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
  statusTone: "positive" | "warning" | "neutral" | "danger";
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
            color: tx.isNegative ? DANGER : GREEN,
            fontFamily: FONT_SEMI,
          }}
        >
          {tx.isNegative ? "-" : "+"}
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
  /** Human-readable timing note, e.g. "Due in 14 days" or "11 days overdue". */
  statusLabel: string;
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
  const tone = INVOICE_STATUS_TONE[invoice.status];

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center rounded-[12px] p-4 mb-3"
      style={{ backgroundColor: BG, ...SHADOW_SM }}
    >
      <View
        className="w-10 h-10 rounded-[999px] items-center justify-center mr-3"
        style={{
          backgroundColor: tone === "danger" ? DANGER_BG : GREEN_TINT,
        }}
      >
        <Text
          className="text-[14px]"
          style={{
            color: tone === "danger" ? DANGER : GREEN,
            fontFamily: FONT_SEMI,
          }}
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
          className="text-[12px] mb-1.5"
          style={{ color: TEXT_SECONDARY, fontFamily: FONT_REG }}
        >
          {invoice.reference} · {invoice.statusLabel}
        </Text>
        <View className="flex-row">
          <StatusPill
            label={INVOICE_STATUS_LABEL[invoice.status]}
            tone={tone}
          />
        </View>
      </View>

      <View className="items-end">
        <Text
          className="text-[15px]"
          style={{ color: TEXT_PRIMARY, fontFamily: FONT_BOLD }}
        >
          {invoice.amount}
        </Text>
        <ChevronRight size={16} color={TEXT_SECONDARY} />
      </View>
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
      className="flex-row self-start rounded-[999px] p-1"
      style={{ backgroundColor: BG, marginBottom: SPACE_4, ...SHADOW_SM }}
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

/** Segmented tabs for {label,value} option objects (e.g. form pickers). */
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
      style={{ marginBottom: SPACE_3 }}
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

/** White form card — used by Add Transaction and the auth screens. */
export function FormCard({ children }: { children: ReactNode }) {
  return (
    <View
      className="rounded-[18px] p-5"
      style={{ backgroundColor: BG, ...SHADOW_MD }}
    >
      {children}
    </View>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <View
      className="rounded-[12px] px-3 py-2.5 mb-4"
      style={{ backgroundColor: DANGER_BG }}
    >
      <Text style={{ color: DANGER, fontFamily: FONT_MED, fontSize: 13 }}>
        {message}
      </Text>
    </View>
  );
}

/** Avatar + title/subtitle + trailing pill — Settings integrations, Suppliers, KRA lists. */
export function InfoRow({
  initials,
  icon,
  title,
  subtitle,
  trailingLabel,
  trailingTone = "neutral",
  onPress,
}: {
  initials?: string;
  icon?: ReactNode;
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
      {(!!initials || !!icon) && (
        <View
          className="w-10 h-10 rounded-[10px] items-center justify-center mr-3"
          style={{ backgroundColor: GREEN_TINT }}
        >
          {icon ?? (
            <Text
              className="text-[13px]"
              style={{ color: GREEN, fontFamily: FONT_SEMI }}
            >
              {initials}
            </Text>
          )}
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
      {!!trailingLabel && (
        <StatusPill label={trailingLabel} tone={trailingTone} />
      )}
    </Pressable>
  );
}

/* ---------------------------------------------------------------- */
/* Bottom navigation — shared by every screen, driven by APP_ROUTES.  */
/* ---------------------------------------------------------------- */

/** Bottom sheet listing every route not pinned to the tab bar. */
export function MoreSheet({
  visible,
  onClose,
  routes = MORE_ROUTES,
}: {
  visible: boolean;
  onClose: () => void;
  routes?: NavRoute[];
}) {
  const router = useRouter();
  const activeKey = useActiveRouteKey();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
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
          className="rounded-t-[22px] px-2 pt-3 pb-9"
          style={{ backgroundColor: BG, ...SHADOW_MD }}
        >
          <View
            className="self-center rounded-[999px] mb-3"
            style={{ width: 40, height: 4, backgroundColor: BORDER }}
          />
          <Text
            className="text-[12px] px-4 mb-1"
            style={{
              color: TEXT_SECONDARY,
              fontFamily: FONT_MED,
              letterSpacing: 0.4,
            }}
          >
            ALL SECTIONS
          </Text>

          {routes.map((r) => {
            const active = r.key === activeKey;
            return (
              <Pressable
                key={r.key}
                onPress={() => {
                  onClose();
                  if (!active) router.replace(r.href as never);
                }}
                className="flex-row items-center px-4 py-3.5"
              >
                <View
                  className="w-10 h-10 rounded-[12px] items-center justify-center mr-3"
                  style={{ backgroundColor: active ? GREEN : GREEN_TINT }}
                >
                  {r.icon(active ? "#FFFFFF" : GREEN, 19)}
                </View>
                <Text
                  className="flex-1 text-[14px]"
                  style={{
                    color: active ? GREEN : TEXT_PRIMARY,
                    fontFamily: active ? FONT_SEMI : FONT_MED,
                  }}
                >
                  {r.label}
                </Text>
                <ChevronRight size={16} color={TEXT_SECONDARY} />
              </Pressable>
            );
          })}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/**
 * The app's bottom tab bar: four pinned sections plus More, which opens a sheet
 * with everything else. It reads APP_ROUTES and the current pathname itself, so
 * a new screen only has to render <BottomNav /> — no props, no per-page config.
 */
export function BottomNav({
  active,
  onAdd,
  tabs = TAB_ROUTES,
}: {
  /** Optional override; by default the active tab comes from the pathname. */
  active?: NavKey;
  onAdd?: () => void;
  tabs?: NavRoute[];
}) {
  const router = useRouter();
  const derived = useActiveRouteKey();
  const activeKey = active ?? derived;
  const [moreVisible, setMoreVisible] = useState(false);

  const inMoreSheet = MORE_ROUTES.some((r) => r.key === activeKey);

  const items: {
    key: string;
    label: string;
    icon: (color: string, size?: number) => ReactNode;
    badge?: number;
    active: boolean;
    onPress: () => void;
  }[] = [
    ...tabs.map((r) => ({
      key: r.key,
      label: r.label,
      icon: r.icon,
      badge: r.badge,
      active: r.key === activeKey,
      onPress: () => {
        if (r.key !== activeKey) router.replace(r.href as never);
      },
    })),
    {
      key: "more",
      label: "More",
      icon: (c: string, s = 20) => <MoreHorizontal size={s} color={c} />,
      active: inMoreSheet || moreVisible,
      onPress: () => setMoreVisible(true),
    },
  ];

  return (
    <>
      <View
        className="absolute bottom-0 left-0 right-0"
        style={{
          backgroundColor: BG,
          height: 78,
          borderTopWidth: 1,
          borderTopColor: BORDER,
          ...SHADOW_MD,
          shadowOffset: { width: 0, height: -4 },
        }}
      >
        <View
          className="flex-1 flex-row items-center pt-2"
          style={{ paddingBottom: 22 }}
        >
          {items.map((item) => {
            const color = item.active ? GREEN : TEXT_SECONDARY;
            return (
              <Pressable
                key={item.key}
                onPress={item.onPress}
                className="items-center justify-center flex-1"
              >
                <View
                  className="items-center justify-center rounded-[999px]"
                  style={{
                    width: 42,
                    height: 28,
                    backgroundColor: item.active ? GREEN_TINT : "transparent",
                  }}
                >
                  {item.icon(color, 19)}
                  {!!item.badge && (
                    <View
                      className="absolute rounded-[999px] items-center justify-center"
                      style={{
                        top: -3,
                        right: 1,
                        minWidth: 16,
                        height: 16,
                        paddingHorizontal: 3,
                        backgroundColor: DANGER,
                        borderWidth: 1.5,
                        borderColor: BG,
                      }}
                    >
                      <Text
                        style={{
                          color: "#FFFFFF",
                          fontSize: 9,
                          fontFamily: FONT_BOLD,
                        }}
                      >
                        {item.badge}
                      </Text>
                    </View>
                  )}
                </View>
                <Text
                  className="text-[10px] mt-1"
                  style={{
                    color,
                    fontFamily: item.active ? FONT_SEMI : FONT_MED,
                  }}
                  numberOfLines={1}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Quick-add FAB — floats above the bar so it clears the tab labels. */}
      <Pressable
        onPress={onAdd ?? (() => router.push(ADD_TRANSACTION_HREF as never))}
        className="absolute items-center justify-center"
        style={{ right: 18, bottom: 90, borderRadius: 999, ...SHADOW_MD }}
      >
        <LinearGradient
          colors={GRADIENT_PRIMARY}
          start={GRADIENT_START}
          end={GRADIENT_END}
          style={{
            width: 56,
            height: 56,
            borderRadius: 999,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{ color: "#FFFFFF", fontSize: 28, fontFamily: FONT_REG }}
          >
            +
          </Text>
        </LinearGradient>
      </Pressable>

      <MoreSheet
        visible={moreVisible}
        onClose={() => setMoreVisible(false)}
        routes={MORE_ROUTES}
      />
    </>
  );
}

/** Height to leave clear at the bottom of a ScrollView so the nav never overlaps content. */
export const NAV_CLEARANCE = 150;
