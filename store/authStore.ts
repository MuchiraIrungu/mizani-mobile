import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { AuthTokens, User } from "../types/auth";

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  /** True once the persisted session has been read back on app start. */
  hydrated: boolean;
  /** "Keep me signed in" — when false the session lives in memory only. */
  remember: boolean;
  setSession: (user: User, tokens: AuthTokens, remember?: boolean) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

// Tokens live in the device keychain/keystore rather than AsyncStorage.
// SecureStore has no web implementation, so web falls back to localStorage.
const secureStorage = {
  getItem: async (name: string) =>
    Platform.OS === "web"
      ? globalThis.localStorage?.getItem(name) ?? null
      : (await SecureStore.getItemAsync(name)) ?? null,
  setItem: async (name: string, value: string) =>
    Platform.OS === "web"
      ? globalThis.localStorage?.setItem(name, value)
      : SecureStore.setItemAsync(name, value),
  removeItem: async (name: string) =>
    Platform.OS === "web"
      ? globalThis.localStorage?.removeItem(name)
      : SecureStore.deleteItemAsync(name),
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      hydrated: false,
      remember: true,
      setSession: (user, tokens, remember = true) =>
        set({ user, tokens, isAuthenticated: true, remember }),
      setUser: (user) => set({ user }),
      logout: () => set({ user: null, tokens: null, isAuthenticated: false }),
    }),
    {
      name: "mizani-auth",
      storage: createJSONStorage(() => secureStorage),
      partialize: ({ user, tokens, isAuthenticated, remember }) =>
        remember
          ? { user, tokens, isAuthenticated, remember }
          : { user: null, tokens: null, isAuthenticated: false, remember: true },
      onRehydrateStorage: () => () => {
        useAuthStore.setState({ hydrated: true });
      },
    },
  ),
);

/** Display helpers for the signed-in user (header, greeting, settings). */
export function displayName(user: User | null): string {
  if (!user) return "";
  return [user.firstName, user.lastName].filter(Boolean).join(" ").trim() || user.email;
}

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

export function roleLabel(role: string | null | undefined): string {
  if (!role) return "Member";
  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
}
