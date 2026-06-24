import { create } from "zustand";

type FieldKey = string;

interface SelectionState {
  // Level 1: select all
  allSelected: boolean;
  // Level 2: selected product IDs
  selectedProductIds: Set<string>;
  // Level 3: per-product field overrides — true = include, false = skip
  fieldSelections: Map<string, Map<FieldKey, boolean>>;
  // Shopify GID lookup: pimId → shopifyId | null
  shopifyIdMap: Map<string, string | null>;

  setAllSelected: (v: boolean) => void;
  selectProducts: (ids: string[]) => void;
  deselectProducts: (ids: string[]) => void;
  registerShopifyIds: (map: Record<string, string | null>) => void;
  toggleProduct: (id: string) => void;
  setProductSelected: (id: string, selected: boolean) => void;
  toggleField: (productId: string, field: FieldKey) => void;
  setFieldSelected: (productId: string, field: FieldKey, selected: boolean) => void;
  setAllFieldsForProduct: (productId: string, fieldKeys: FieldKey[], selected: boolean) => void;
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
  shopifyIdMap: new Map(),

  setAllSelected: (v) =>
    set((s) => ({
      allSelected: v,
      selectedProductIds: v ? s.selectedProductIds : new Set(),
    })),

  selectProducts: (ids) =>
    set((s) => ({
      selectedProductIds: new Set([...s.selectedProductIds, ...ids]),
      allSelected: false,
    })),

  deselectProducts: (ids) =>
    set((s) => {
      const next = new Set(s.selectedProductIds);
      ids.forEach((id) => next.delete(id));
      return { selectedProductIds: next, allSelected: false };
    }),

  registerShopifyIds: (map) =>
    set((s) => ({
      shopifyIdMap: new Map([...s.shopifyIdMap, ...Object.entries(map)]),
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

  setAllFieldsForProduct: (productId, fieldKeys, selected) =>
    set((s) => {
      const map = new Map(s.fieldSelections);
      if (selected) {
        map.delete(productId);
      } else {
        const current = new Map<FieldKey, boolean>();
        fieldKeys.forEach((k) => current.set(k, false));
        map.set(productId, current);
      }
      return { fieldSelections: map };
    }),

  resetProduct: (productId) =>
    set((s) => {
      const map = new Map(s.fieldSelections);
      map.delete(productId);
      return { fieldSelections: map };
    }),

  reset: () => set({ allSelected: false, selectedProductIds: new Set(), fieldSelections: new Map(), shopifyIdMap: new Map() }),

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
