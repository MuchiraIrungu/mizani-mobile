import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Building2, LogOut, MapPin, Pencil, Plus, Star, Trash2, UserRound } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, { useAnimatedStyle, withSpring } from "react-native-reanimated";

import {
  ActionSheet,
  Appear,
  ConfirmSheet,
  ErrorState,
  FormSheet,
  LoadingState,
  type FormValues,
} from "../../components/dashboard/crud";
import {
  BG,
  BORDER,
  DANGER,
  DANGER_BG,
  FONT_MED,
  FONT_REG,
  FONT_SEMI,
  GRADIENT_FOREST,
  GradientStatCard,
  GREEN,
  InfoRow,
  PageTitle,
  PrimaryButton,
  SectionHeading,
  SHADOW_SM,
  showToast,
  SPACE_3,
  SPACE_4,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
} from "../../components/dashboard/dashboardUI";
import { Body, Screen } from "../../components/dashboard/Screen";
import { useResource } from "../../hooks/useResource";
import { listTeam, updateMe } from "../../services/authService";
import { branchApi, businessApi } from "../../services/resources";
import { displayName, initialsOf, roleLabel, useAuthStore } from "../../store/authStore";
import type { Branch, Business } from "../../types/api";

/* Settings — business profile, your account, branches, team and
   device preferences. */

// Payment and accounting integrations aren't exposed by the backend yet,
// so this list is informational.
const INTEGRATIONS = [
  { name: "M-Pesa", detail: "Till and Paybill collections", status: "Active" as const },
  { name: "DPO Pay", detail: "Card and mobile-money gateway", status: "Active" as const },
  { name: "KRA eTIMS", detail: "Managed in the KRA section", status: "Active" as const },
];

const PREFS_KEY = "mizani-prefs";
type Prefs = { reorder: boolean; digest: boolean; biometric: boolean };

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
  // Knob slides with a spring instead of jumping
  const knob = useAnimatedStyle(() => ({
    transform: [{ translateX: withSpring(value ? 19 : 0, { damping: 16, stiffness: 220 }) }],
  }));
  return (
    <Pressable
      onPress={() => onChange(!value)}
      className="flex-row items-center justify-between py-3.5"
      style={{ borderTopWidth: first ? 0 : 1, borderTopColor: BORDER }}
    >
      <View className="flex-1 mr-4">
        <Text className="text-[14px]" style={{ color: TEXT_PRIMARY, fontFamily: FONT_SEMI }}>
          {label}
        </Text>
        <Text className="text-[12px] mt-0.5" style={{ color: TEXT_SECONDARY, fontFamily: FONT_REG }}>
          {detail}
        </Text>
      </View>
      <View className="rounded-[999px] justify-center" style={{ width: 46, height: 27, padding: 3, backgroundColor: value ? GREEN : BORDER }}>
        <Animated.View className="rounded-[999px]" style={[{ width: 21, height: 21, backgroundColor: "#FFFFFF" }, knob]} />
      </View>
    </Pressable>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const logout = useAuthStore((s) => s.logout);

  const business = useResource<Business | null>(() => (user ? businessApi.forUser(user.id) : Promise.resolve(null)), null);
  const branches = useResource<Branch[]>(branchApi.list, []);
  const team = useResource(listTeam, []);

  const [prefs, setPrefs] = useState<Prefs>({ reorder: true, digest: false, biometric: false });
  const [businessFormOpen, setBusinessFormOpen] = useState(false);
  const [accountFormOpen, setAccountFormOpen] = useState(false);
  const [branchForm, setBranchForm] = useState<{ branch?: Branch } | null>(null);
  const [branchActions, setBranchActions] = useState<Branch | null>(null);
  const [deletingBranch, setDeletingBranch] = useState<Branch | null>(null);
  const [confirmLogout, setConfirmLogout] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(PREFS_KEY)
      .then((raw) => raw && setPrefs((p) => ({ ...p, ...JSON.parse(raw) })))
      .catch(() => {});
  }, []);
  const setPref = (key: keyof Prefs) => (v: boolean) =>
    setPrefs((p) => {
      const next = { ...p, [key]: v };
      AsyncStorage.setItem(PREFS_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });

  const b = business.data;
  const name = displayName(user);

  const saveBusiness = async (v: FormValues) => {
    if (!b) return;
    const str = (k: string) => String(v[k] ?? "").trim() || null;
    const updated = await businessApi.update(b.id, {
      name: str("name"),
      businessType: str("businessType"),
      kraPin: str("kraPin"),
      registrationNumber: str("registrationNumber"),
      phone: str("phone"),
      email: str("email"),
      address: str("address"),
      currency: str("currency") ?? "KES",
    });
    business.setData(updated);
    showToast("Business profile updated");
    setBusinessFormOpen(false);
  };

  const saveAccount = async (v: FormValues) => {
    const updated = await updateMe({ fullName: String(v.fullName).trim(), phone: String(v.phone || "").trim() });
    setUser(updated);
    team.reload();
    showToast("Your details were updated");
    setAccountFormOpen(false);
  };

  const saveBranch = async (v: FormValues) => {
    const body = { name: String(v.name).trim(), location: String(v.location || "").trim() || undefined, isMain: !!v.isMain };
    if (branchForm?.branch) {
      const updated = await branchApi.update(branchForm.branch.id, body);
      branches.setData((list) => list.map((x) => (x.id === updated.id ? updated : body.isMain ? { ...x, isMain: false } : x)));
      showToast(`${updated.name} updated`);
    } else {
      const created = await branchApi.create(body);
      branches.setData((list) => [...list.map((x) => (body.isMain ? { ...x, isMain: false } : x)), created]);
      showToast(`${created.name} added`);
    }
    setBranchForm(null);
  };

  return (
    <Screen
      showBack
      refreshing={business.refreshing || branches.refreshing}
      onRefresh={() => {
        business.refresh();
        branches.refresh();
        team.reload();
      }}
      overlays={
        <>
          <FormSheet
            visible={businessFormOpen}
            title="Edit business profile"
            subtitle="Shown on invoices and receipts."
            fields={[
              { key: "name", label: "Business name", required: true },
              { key: "businessType", label: "Business type", placeholder: "e.g. Retail" },
              { key: "kraPin", label: "KRA PIN", placeholder: "e.g. P051428776K" },
              { key: "registrationNumber", label: "Registration number", placeholder: "e.g. PVT-8KLM2QP" },
              { key: "phone", label: "Phone", type: "phone" },
              { key: "email", label: "Email", type: "email" },
              { key: "address", label: "Address", type: "multiline", placeholder: "Street, town" },
              { key: "currency", label: "Currency", placeholder: "KES" },
            ]}
            initialValues={
              b
                ? {
                    name: b.name ?? "",
                    businessType: b.businessType ?? "",
                    kraPin: b.kraPin ?? "",
                    registrationNumber: b.registrationNumber ?? "",
                    phone: b.phone ?? "",
                    email: b.email ?? "",
                    address: b.address ?? "",
                    currency: b.currency ?? "KES",
                  }
                : undefined
            }
            submitLabel="Save profile"
            onSubmit={saveBusiness}
            onClose={() => setBusinessFormOpen(false)}
          />
          <FormSheet
            visible={accountFormOpen}
            title="Your details"
            subtitle={user?.email}
            fields={[
              { key: "fullName", label: "Full name", required: true },
              { key: "phone", label: "Phone", type: "phone" },
            ]}
            initialValues={{ fullName: name, phone: user?.phone ?? "" }}
            submitLabel="Save"
            onSubmit={saveAccount}
            onClose={() => setAccountFormOpen(false)}
          />
          <FormSheet
            visible={!!branchForm}
            title={branchForm?.branch ? "Edit branch" : "Add branch"}
            subtitle={branchForm?.branch?.name ?? "Sales and expenses can be tracked per branch."}
            fields={[
              { key: "name", label: "Branch name", required: true, placeholder: "e.g. Mombasa Branch" },
              { key: "location", label: "Location", placeholder: "e.g. Nyali, Mombasa" },
              { key: "isMain", label: "Main branch", type: "switch", helper: "Business-wide payments are posted here." },
            ]}
            initialValues={branchForm?.branch ? { name: branchForm.branch.name, location: branchForm.branch.location ?? "", isMain: branchForm.branch.isMain } : undefined}
            submitLabel={branchForm?.branch ? "Save changes" : "Add branch"}
            onSubmit={saveBranch}
            onClose={() => setBranchForm(null)}
          />
          <ActionSheet
            visible={!!branchActions}
            title={branchActions?.name ?? ""}
            subtitle={branchActions?.location ?? undefined}
            onClose={() => setBranchActions(null)}
            actions={
              branchActions
                ? [
                    { label: "Edit branch", icon: (c) => <Pencil size={17} color={c} />, onPress: () => setBranchForm({ branch: branchActions }) },
                    { label: "Delete branch", tone: "danger", icon: (c) => <Trash2 size={17} color={c} />, onPress: () => setDeletingBranch(branchActions) },
                  ]
                : []
            }
          />
          <ConfirmSheet
            visible={!!deletingBranch}
            title="Delete branch?"
            message={`${deletingBranch?.name ?? "This branch"} will be removed. Branches with sales or expenses recorded against them may need to stay.`}
            confirmLabel="Delete"
            onConfirm={async () => {
              if (!deletingBranch) return;
              await branchApi.remove(deletingBranch.id);
              branches.setData((list) => list.filter((x) => x.id !== deletingBranch.id));
              showToast(`${deletingBranch.name} deleted`);
              setDeletingBranch(null);
            }}
            onClose={() => setDeletingBranch(null)}
          />
          <ConfirmSheet
            visible={confirmLogout}
            title="Log out of Mizani?"
            message="You'll need your email and password to sign back in on this device."
            confirmLabel="Log out"
            onConfirm={async () => {
              logout();
              setConfirmLogout(false);
              router.replace("/(auth)/login");
            }}
            onClose={() => setConfirmLogout(false)}
          />
        </>
      }
    >
      <PageTitle title="Settings" subtitle="Business profile, branches, team and preferences" />

      <Body>
        {business.error && <ErrorState message={business.error} onRetry={business.refresh} />}

        {business.loading ? (
          <LoadingState rows={2} />
        ) : (
          <Appear index={0}>
            <GradientStatCard
              title="Business Profile"
              badgeLabel={b?.status ? roleLabel(b.status) : "Active"}
              value={b?.name || "Your business"}
              helper={[b?.address, `${branches.data.length} branch${branches.data.length === 1 ? "" : "es"}`].filter(Boolean).join(" · ")}
              rows={[
                { label: "KRA PIN", value: b?.kraPin || "Not set" },
                { label: "Registration", value: b?.registrationNumber || "Not set" },
                { label: "Business type", value: b?.businessType || "Not set" },
              ]}
              actionLabel="Edit Profile"
              actionIcon={<Pencil size={15} color={GREEN} />}
              onAction={() => setBusinessFormOpen(true)}
              colors={GRADIENT_FOREST}
            />
          </Appear>
        )}

        <SectionHeading title="Your Account" subtitle="Signed in on this device" />
        <Appear index={1}>
          <InfoRow
            initials={initialsOf(name || "?")}
            title={name || "Your account"}
            subtitle={[user?.email, user?.phone].filter(Boolean).join(" · ")}
            trailingLabel="Edit"
            trailingTone="neutral"
            onPress={() => setAccountFormOpen(true)}
          />
        </Appear>

        <View style={{ marginTop: SPACE_3 }}>
          <SectionHeading title="Branches" subtitle={`${branches.data.length} location${branches.data.length === 1 ? "" : "s"}`} actionLabel="Add" onAction={() => setBranchForm({})} />
        </View>
        {branches.data.map((br, i) => (
          <Appear key={br.id} index={i + 2}>
            <InfoRow
              icon={br.isMain ? <Star size={17} color={GREEN} /> : <MapPin size={17} color={GREEN} />}
              title={br.name}
              subtitle={br.location || "No location set"}
              trailingLabel={br.isMain ? "Main" : "Branch"}
              trailingTone={br.isMain ? "positive" : "neutral"}
              onPress={() => setBranchActions(br)}
            />
          </Appear>
        ))}
        <View style={{ marginTop: SPACE_3, marginBottom: SPACE_4 }}>
          <PrimaryButton label="Add Branch" icon={<Plus size={16} color="#FFFFFF" />} onPress={() => setBranchForm({})} colors={GRADIENT_FOREST} />
        </View>

        <SectionHeading title="Team Access" subtitle={`${team.data.length} ${team.data.length === 1 ? "person" : "people"} can sign in`} />
        {team.data.map((t, i) => {
          const tName = displayName(t);
          return (
            <Appear key={t.id} index={i}>
              <InfoRow
                initials={initialsOf(tName)}
                title={tName}
                subtitle={[t.email, branches.data.find((x) => x.id === t.branchId)?.name].filter(Boolean).join(" · ")}
                trailingLabel={roleLabel(t.roleName)}
                trailingTone={(t.roleName ?? "").toUpperCase() === "OWNER" ? "positive" : "neutral"}
                onPress={() => (t.id === user?.id ? setAccountFormOpen(true) : showToast(`${tName} · ${roleLabel(t.roleName)}`))}
              />
            </Appear>
          );
        })}

        <View style={{ marginTop: SPACE_4 }}>
          <SectionHeading title="Connected Integrations" subtitle="Payment and tax services" />
        </View>
        {INTEGRATIONS.map((i) => (
          <InfoRow
            key={i.name}
            icon={<Building2 size={17} color={GREEN} />}
            title={i.name}
            subtitle={i.detail}
            trailingLabel={i.status}
            trailingTone="positive"
            onPress={() => (i.name === "KRA eTIMS" ? router.replace("/(dashboard)/kra") : showToast(`${i.name} is managed by your Mizani administrator`))}
          />
        ))}

        <View style={{ marginTop: SPACE_4 }}>
          <SectionHeading title="Preferences" subtitle="Alerts and security on this device" />
        </View>
        <View className="rounded-[14px] px-5 py-1" style={{ backgroundColor: BG, marginBottom: SPACE_4, ...SHADOW_SM }}>
          <ToggleRow first label="Low stock alerts" detail="Notify when a product hits its reorder level" value={prefs.reorder} onChange={setPref("reorder")} />
          <ToggleRow label="Daily digest" detail="A morning summary of yesterday's trading" value={prefs.digest} onChange={setPref("digest")} />
          <ToggleRow label="Biometric unlock" detail="Require a fingerprint or face scan to open Mizani" value={prefs.biometric} onChange={setPref("biometric")} />
        </View>

        <Pressable
          onPress={() => setConfirmLogout(true)}
          className="flex-row items-center justify-center rounded-[999px] h-[50px]"
          style={{ backgroundColor: DANGER_BG }}
        >
          <LogOut size={16} color={DANGER} />
          <Text className="text-[14px] ml-2" style={{ color: DANGER, fontFamily: FONT_SEMI }}>
            Log out
          </Text>
        </Pressable>
        <View className="flex-row items-center justify-center mt-4">
          <UserRound size={12} color={TEXT_SECONDARY} />
          <Text className="text-[11px] ml-1.5" style={{ color: TEXT_SECONDARY, fontFamily: FONT_MED }}>
            Mizani · v1.0.0
          </Text>
        </View>
      </Body>
    </Screen>
  );
}
