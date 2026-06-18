import { create } from "zustand";

interface CategoryState {
  categoryMap: Record<string, string>;
  setCategory: (productId: string, category: string) => void;
  clearCategory: (productId: string) => void;
  getCategoryMap: () => Record<string, string>;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categoryMap: {},

  setCategory: (productId, category) =>
    set((s) => ({ categoryMap: { ...s.categoryMap, [productId]: category } })),

  clearCategory: (productId) =>
    set((s) => {
      const next = { ...s.categoryMap };
      delete next[productId];
      return { categoryMap: next };
    }),

  getCategoryMap: () => get().categoryMap,
}));
