import { useRouter } from "expo-router";
import { LogOut, Pencil, Plus } from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, StatusBar, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  AppHeader,
  BG,
  BORDER,
  BottomNav,
  DANGER,
  DANGER_BG,
  FONT_MED,
  FONT_REG,
  FONT_SEMI,
  GRADIENT_FOREST,
  GradientStatCard,
  GREEN,
  InfoRow,
  NAV_CLEARANCE,
  PageTitle,
  PrimaryButton,
  SectionHeading,
  SHADOW_SM,
  showToast,
  SPACE_3,
  SPACE_4,
  SURFACE,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  ToastHost,
  type NotificationItem,
} from "../../components/dashboard/dashboardUI";

/* Settings — business profile, connected integrations, app preferences and
   team access. Reached from the profile avatar menu, not the tab bar. */

const INTEGRATIONS = [
  {
    name: "M-Pesa Till",
    detail: "Till 5482 · Buy Goods · Safaricom",
    status: "Active" as const,
  },
  {
    name: "M-Pesa Paybill",
    detail: "Paybill 400200 · Account by invoice ref",
    status: "Active" as const,
  },
  {
    name: "Equity Bank",
    detail: "Account ····4471 · Statement feed daily 06:00",
    status: "Active" as const,
  },
  {
    name: "KRA eTIMS",
    detail: "PIN P051428776K · 2 invoices awaiting control no.",
    status: "Fix" as const,
  },
  {
    name: "QuickBooks Export",
    detail: "Last export 31 Jul 2026 · Monthly journal",
    status: "Active" as const,
  },
];

const TEAM = [
  { name: "Wanjiku Mwangi", detail: "Owner · full access", role: "Owner" },
  { name: "Grace Achieng", detail: "Nairobi Branch · sales & inventory", role: "Manager" },
  { name: "Mercy Wairimu", detail: "Accounts · read-only reports", role: "Clerk" },
];

const NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    title: "eTIMS needs attention on 2 invoices",
    time: "Today, 09:12",
    tone: "danger",
  },
];

/** Preference switch — solid track, no translucency, so it stays legible on white. */
function ToggleRow({
  label,
  detail,
  value,
  onChange,
  first,
}: {
  label: string;
  detail: string;
  value: boolean;
  onChange: (v: boolean) => void;
  first?: boolean;
}) {
  return (
    <Pressable
      onPress={() => onChange(!value)}
      className="flex-row items-center justify-between py-3.5"
      style={{ borderTopWidth: first ? 0 : 1, borderTopColor: BORDER }}
    >
      <View className="flex-1 mr-4">
        <Text
          className="text-[14px]"
          style={{ color: TEXT_PRIMARY, fontFamily: FONT_SEMI }}
        >
          {label}
        </Text>
        <Text
          className="text-[12px] mt-0.5"
          style={{ color: TEXT_SECONDARY, fontFamily: FONT_REG }}
        >
          {detail}
        </Text>
      </View>
      <View
        className="rounded-[999px] justify-center"
        style={{
          width: 46,
          height: 27,
          padding: 3,
          backgroundColor: value ? GREEN : BORDER,
        }}
      >
        <View
          className="rounded-[999px]"
          style={{
            width: 21,
            height: 21,
            backgroundColor: "#FFFFFF",
            alignSelf: value ? "flex-end" : "flex-start",
          }}
        />
      </View>
    </Pressable>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const [prefs, setPrefs] = useState({
    etims: true,
    reorder: true,
    digest: false,
    biometric: true,
  });

  const setPref = (key: keyof typeof prefs) => (v: boolean) =>
    setPrefs((p) => ({ ...p, [key]: v }));

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: SURFACE }}>
      <StatusBar barStyle="dark-content" backgroundColor={SURFACE} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingTop: SPACE_3,
          paddingBottom: NAV_CLEARANCE,
        }}
        showsVerticalScrollIndicator={false}
      >
        <AppHeader
          showBack
          initials="WM"
          name="Wanjiku Mwangi"
          role="Owner · Mizani Trading Co."
          notifications={NOTIFICATIONS}
        />

        <PageTitle
          title="Settings"
          subtitle="Business profile, integrations and access control"
        />

        <View className="px-4">
          <GradientStatCard
            title="Business Profile"
            badgeLabel="Verified"
            value="Mizani Trading Co. Ltd"
            helper="Westlands, Nairobi · 3 branches"
            rows={[
              { label: "KRA PIN", value: "P051428776K" },
              { label: "Registration", value: "PVT-8KLM2QP" },
              { label: "VAT status", value: "Registered" },
            ]}
            actionLabel="Edit Profile"
            actionIcon={<Pencil size={15} color={GREEN} />}
            onAction={() => showToast("Profile editing coming soon")}
            colors={GRADIENT_FOREST}
          />

          <SectionHeading
            title="Connected Integrations"
            subtitle={`${INTEGRATIONS.length} connected · 1 needs attention`}
          />

          {INTEGRATIONS.map((i) => (
            <InfoRow
              key={i.name}
              title={i.name}
              subtitle={i.detail}
              trailingLabel={i.status}
              trailingTone={i.status === "Active" ? "positive" : "danger"}
              onPress={() => showToast(`${i.name} · settings coming soon`)}
            />
          ))}

          <View style={{ marginTop: SPACE_3, marginBottom: SPACE_4 }}>
            <PrimaryButton
              label="Add Integration"
              icon={<Plus size={16} color="#FFFFFF" />}
              onPress={() => showToast("Integration picker coming soon")}
              colors={GRADIENT_FOREST}
            />
          </View>

          <SectionHeading
            title="Preferences"
            subtitle="Alerts and security on this device"
          />

          <View
            className="rounded-[14px] px-5 py-1"
            style={{
              backgroundColor: BG,
              marginBottom: SPACE_4,
              ...SHADOW_SM,
            }}
          >
            <ToggleRow
              first
              label="eTIMS sync alerts"
              detail="Warn when an invoice has no control number"
              value={prefs.etims}
              onChange={setPref("etims")}
            />
            <ToggleRow
              label="Low stock alerts"
              detail="Notify when an SKU hits its reorder level"
              value={prefs.reorder}
              onChange={setPref("reorder")}
            />
            <ToggleRow
              label="Daily digest"
              detail="A 06:00 summary of yesterday's trading"
              value={prefs.digest}
              onChange={setPref("digest")}
            />
            <ToggleRow
              label="Biometric unlock"
              detail="Require a fingerprint or face scan to open Mizani"
              value={prefs.biometric}
              onChange={setPref("biometric")}
            />
          </View>

          <SectionHeading
            title="Team Access"
            subtitle={`${TEAM.length} people can sign in`}
          />

          {TEAM.map((t) => (
            <InfoRow
              key={t.name}
              initials={t.name
                .split(" ")
                .map((w) => w[0])
                .slice(0, 2)
                .join("")}
              title={t.name}
              subtitle={t.detail}
              trailingLabel={t.role}
              trailingTone={t.role === "Owner" ? "positive" : "neutral"}
              onPress={() => showToast(`${t.name} · permissions coming soon`)}
            />
          ))}

          <Pressable
            onPress={() => router.replace("/login")}
            className="flex-row items-center justify-center rounded-[999px] h-[50px]"
            style={{ backgroundColor: DANGER_BG, marginTop: SPACE_4 }}
          >
            <LogOut size={16} color={DANGER} />
            <Text
              className="text-[14px] ml-2"
              style={{ color: DANGER, fontFamily: FONT_SEMI }}
            >
              Log out
            </Text>
          </Pressable>

          <Text
            className="text-[11px] text-center mt-4"
            style={{ color: TEXT_SECONDARY, fontFamily: FONT_MED }}
          >
            Mizani · v1.0.0
          </Text>
        </View>
      </ScrollView>

      <BottomNav />
      <ToastHost />
    </SafeAreaView>
  );
}
