import { create } from "zustand";

type FieldKey = string;

interface SelectionState {
  // Level 1: select all
  allSelected: boolean;
  // Level 2: selected product IDs
  selectedProductIds: Set<string>;
  // Level 3: per-product field overrides — true = include, false = skip
  fieldSelections: Map<string, Map<FieldKey, boolean>>;

  setAllSelected: (v: boolean) => void;
  toggleProduct: (id: string) => void;
  setProductSelected: (id: string, selected: boolean) => void;
  toggleField: (productId: string, field: FieldKey) => void;
  setFieldSelected: (productId: string, field: FieldKey, selected: boolean) => void;
  resetProduct: (productId: string) => void;
  reset: () => void;

  isProductSelected: (id: string) => boolean;
  isFieldSelected: (productId: string, field: FieldKey) => boolean;
  getSelectedProductIds: () => string[];
  getSelectedFields: (productId: string) => FieldKey[];
}

export const useSelectionStore = create<SelectionState>((set, get) => ({
  allSelected: false,
  selectedProductIds: new Set(),
  fieldSelections: new Map(),

  setAllSelected: (v) =>
    set((s) => ({
      allSelected: v,
      selectedProductIds: v ? s.selectedProductIds : new Set(),
    })),

  toggleProduct: (id) =>
    set((s) => {
      const next = new Set(s.selectedProductIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { selectedProductIds: next, allSelected: false };
    }),

  setProductSelected: (id, selected) =>
    set((s) => {
      const next = new Set(s.selectedProductIds);
      if (selected) next.add(id);
      else next.delete(id);
      return { selectedProductIds: next, allSelected: false };
    }),

  toggleField: (productId, field) =>
    set((s) => {
      const map = new Map(s.fieldSelections);
      const current = new Map(map.get(productId) ?? new Map<FieldKey, boolean>());
      current.set(field, !current.get(field));
      map.set(productId, current);
      return { fieldSelections: map };
    }),

  setFieldSelected: (productId, field, selected) =>
    set((s) => {
      const map = new Map(s.fieldSelections);
      const current = new Map(map.get(productId) ?? new Map<FieldKey, boolean>());
      current.set(field, selected);
      map.set(productId, current);
      return { fieldSelections: map };
    }),

  resetProduct: (productId) =>
    set((s) => {
      const map = new Map(s.fieldSelections);
      map.delete(productId);
      return { fieldSelections: map };
    }),

  reset: () => set({ allSelected: false, selectedProductIds: new Set(), fieldSelections: new Map() }),

  isProductSelected: (id) => get().allSelected || get().selectedProductIds.has(id),

  isFieldSelected: (productId, field) => {
    const perProduct = get().fieldSelections.get(productId);
    if (!perProduct) return true;
    return perProduct.get(field) ?? true;
  },

  getSelectedProductIds: () => Array.from(get().selectedProductIds),

  getSelectedFields: (productId) => {
    const perProduct = get().fieldSelections.get(productId);
    if (!perProduct) return [];
    return Array.from(perProduct.entries())
      .filter(([, v]) => v)
      .map(([k]) => k);
  },
}));
