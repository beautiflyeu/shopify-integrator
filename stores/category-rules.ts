"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { CATEGORY_RULES, type CategoryRule } from "@/config/category-rules";

interface CategoryRulesState {
  rules: CategoryRule[];
  autoSuggest: boolean;
  addRule: (rule: CategoryRule) => void;
  updateRule: (index: number, rule: CategoryRule) => void;
  deleteRule: (index: number) => void;
  resetToDefaults: () => void;
  setAutoSuggest: (val: boolean) => void;
}

const apiStorage = createJSONStorage(() => ({
  getItem: async (_name: string): Promise<string | null> => {
    try {
      const res = await fetch("/api/category-rules");
      if (!res.ok) return null;
      return res.text();
    } catch {
      return null;
    }
  },
  setItem: async (_name: string, value: string): Promise<void> => {
    try {
      await fetch("/api/category-rules", {
        method: "PUT",
        body: value,
        headers: { "Content-Type": "application/json" },
      });
    } catch {
      // non-fatal
    }
  },
  removeItem: async (): Promise<void> => {},
}));

export const useCategoryRulesStore = create<CategoryRulesState>()(
  persist(
    (set) => ({
      rules: CATEGORY_RULES,
      autoSuggest: true,
      addRule: (rule) => set((s) => ({ rules: [...s.rules, rule] })),
      updateRule: (i, rule) =>
        set((s) => {
          const r = [...s.rules];
          r[i] = rule;
          return { rules: r };
        }),
      deleteRule: (i) =>
        set((s) => ({ rules: s.rules.filter((_, idx) => idx !== i) })),
      resetToDefaults: () => set({ rules: CATEGORY_RULES }),
      setAutoSuggest: (val) => set({ autoSuggest: val }),
    }),
    { name: "category-rules", storage: apiStorage }
  )
);
