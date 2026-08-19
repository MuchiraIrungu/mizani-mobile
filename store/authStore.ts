import * as SecureStore from "expo-secure-store";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { AuthTokens, User } from "../types/auth";

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  setSession: (user: User, tokens: AuthTokens) => void;
  logout: () => void;
}

//store to hold tokens avoid keeping them in asyncstorage
const secureStorage = {
  getItem: async (name: string) =>
    (await SecureStore.getItemAsync(name)) ?? null,
  setItem: async (name: string, value: string) =>
    SecureStore.setItemAsync(name, value),
  removeItem: async (name: string) => SecureStore.deleteItemAsync(name),
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      setSession: (user, tokens) =>
        set({ user, tokens, isAuthenticated: true }),
      logout: () => set({ user: null, tokens: null, isAuthenticated: false }),
    }),
    {
      name: "mizani-auth",
      storage: createJSONStorage(() => secureStorage),
    },
  ),
);
