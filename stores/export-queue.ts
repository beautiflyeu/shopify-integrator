"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface ExportQueueState {
  queue: string[];
  add: (pimId: string) => void;
  remove: (pimId: string) => void;
  isInQueue: (pimId: string) => boolean;
  clear: () => void;
}

export const useExportQueueStore = create<ExportQueueState>()(
  persist(
    (set, get) => ({
      queue: [],
      add: (pimId) =>
        set((s) => ({ queue: [...new Set([...s.queue, pimId])] })),
      remove: (pimId) =>
        set((s) => ({ queue: s.queue.filter((id) => id !== pimId) })),
      isInQueue: (pimId) => get().queue.includes(pimId),
      clear: () => set({ queue: [] }),
    }),
    { name: "export-queue", storage: createJSONStorage(() => localStorage) }
  )
);
