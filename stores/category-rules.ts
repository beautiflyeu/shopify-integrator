"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
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
    { name: "category-rules" }
  )
);
