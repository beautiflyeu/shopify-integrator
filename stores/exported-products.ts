"use client";

import { create } from "zustand";

export interface ExportEntry {
  pimId: string;
  method: "csv" | "api";
  shopifyId?: string;
  exportedAt: string;
}

interface ExportedState {
  exportedMap: Map<string, ExportEntry>;
  load: () => Promise<void>;
  markExported: (entries: ExportEntry[]) => void;
}

export const useExportedProductsStore = create<ExportedState>((set) => ({
  exportedMap: new Map(),

  load: async () => {
    try {
      const res = await fetch("/api/exported-products");
      if (!res.ok) return;
      const data: { exports: ExportEntry[] } = await res.json();
      set({ exportedMap: new Map(data.exports.map((e) => [e.pimId, e])) });
    } catch {
      // non-fatal
    }
  },

  markExported: (entries) => {
    set((s) => {
      const m = new Map(s.exportedMap);
      entries.forEach((e) => m.set(e.pimId, e));
      return { exportedMap: m };
    });
  },
}));
