import { create } from "zustand";

interface PageHeaderStore {
  productName: string | null;
  productId: string | null;
  set: (opts: { productName: string; productId: string }) => void;
  reset: () => void;
}

export const usePageHeaderStore = create<PageHeaderStore>((set) => ({
  productName: null,
  productId: null,
  set: (opts) => set(opts),
  reset: () => set({ productName: null, productId: null }),
}));
