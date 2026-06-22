import { create } from "zustand";

interface TaxonomyState {
  categories: { id: string; fullName: string }[];
  fullNameSet: Set<string>;
  status: "idle" | "loading" | "done" | "error";
  load: () => void;
}

export const useTaxonomyStore = create<TaxonomyState>((set, get) => ({
  categories: [],
  fullNameSet: new Set(),
  status: "idle",
  load: () => {
    if (get().status !== "idle") return;
    set({ status: "loading" });
    fetch("/api/shopify/categories")
      .then((r) => r.json())
      .then((data: { id: string; fullName: string }[]) => {
        set({ categories: data, fullNameSet: new Set(data.map((c) => c.fullName)), status: "done" });
      })
      .catch(() => set({ status: "error" }));
  },
}));
