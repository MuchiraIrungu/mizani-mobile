import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/** The branch picked in the header pills, shared across screens.
    null means "All branches". */
interface BranchState {
  branchId: string | null;
  setBranchId: (id: string | null) => void;
}

export const useBranchStore = create<BranchState>()(
  persist(
    (set) => ({
      branchId: null,
      setBranchId: (branchId) => set({ branchId }),
    }),
    { name: "mizani-branch", storage: createJSONStorage(() => AsyncStorage) },
  ),
);
