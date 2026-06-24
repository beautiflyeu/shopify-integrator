"use client";

import { useState } from "react";
import { RefreshCw, Loader2 } from "lucide-react";
import { ExportCsvButton } from "@/components/export-csv-button";
import { useSelectionStore } from "@/stores/selection";
import { useCategoryStore } from "@/stores/category";

interface SyncResult {
  pimId: string;
  status: "created" | "updated" | "error";
  shopifyId?: string;
  message?: string;
}

export function DashboardHeader() {
  const { selectedProductIds, shopifyIdMap } = useSelectionStore();
  const getCategoryMap = useCategoryStore((s) => s.getCategoryMap);

  const [syncing, setSyncing] = useState(false);
  const [syncSummary, setSyncSummary] = useState<string | null>(null);

  async function handleSync() {
    const products = [...selectedProductIds].map((pimId) => ({
      pimId,
      shopifyId: shopifyIdMap.get(pimId) ?? null,
    }));

    setSyncing(true);
    setSyncSummary(null);

    try {
      const res = await fetch("/api/sync/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products, categoryMap: getCategoryMap() }),
      });

      if (!res.ok) throw new Error(`Błąd serwera: ${res.status}`);

      const data: { results: SyncResult[] } = await res.json();
      const created = data.results.filter((r) => r.status === "created").length;
      const updated = data.results.filter((r) => r.status === "updated").length;
      const errors = data.results.filter((r) => r.status === "error").length;

      const parts: string[] = [];
      if (created > 0) parts.push(`${created} dodano`);
      if (updated > 0) parts.push(`${updated} zaktualizowano`);
      if (errors > 0) parts.push(`${errors} błędów`);
      setSyncSummary(parts.join(", "));
    } catch (err) {
      setSyncSummary(err instanceof Error ? err.message : "Błąd synchronizacji");
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="mb-6 flex items-center justify-between">
      <div>
        <h1 className="text-lg font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Produkty z PIM Beautifly</p>
      </div>
      <div className="flex flex-col items-end gap-1">
        <div className="flex items-center gap-2">
          <ExportCsvButton
            getProductIds={() => [...selectedProductIds]}
            label={selectedProductIds.size > 0 ? `Eksportuj zaznaczone (${selectedProductIds.size})` : "Eksportuj CSV"}
          />
          <button
            onClick={handleSync}
            disabled={selectedProductIds.size === 0 || syncing}
            className="inline-flex items-center gap-2 rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background transition-opacity disabled:opacity-40"
          >
            {syncing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            {syncing
              ? "Synchronizuję…"
              : selectedProductIds.size > 0
              ? `Synchronizuj zaznaczone (${selectedProductIds.size})`
              : "Synchronizuj zaznaczone"}
          </button>
        </div>
        {syncSummary && (
          <p className="text-xs text-muted-foreground">{syncSummary}</p>
        )}
      </div>
    </div>
  );
}
