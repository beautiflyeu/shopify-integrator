"use client";

import { useState } from "react";
import { RefreshCw, Loader2 } from "lucide-react";
import { ExportCsvButton } from "@/components/export-csv-button";
import { useSelectionStore } from "@/stores/selection";
import { useExportedProductsStore } from "@/stores/exported-products";
import { useExportQueueStore } from "@/stores/export-queue";

export function DashboardHeader() {
  const { selectedProductIds } = useSelectionStore();
  const loadExported = useExportedProductsStore((s) => s.load);
  const { queue } = useExportQueueStore();
  const [importing, setImporting] = useState(false);
  const [importSummary, setImportSummary] = useState<string | null>(null);

  async function handleImportStatus() {
    setImporting(true);
    setImportSummary(null);
    try {
      const res = await fetch("/api/shopify/import-status", { method: "POST" });
      if (!res.ok) throw new Error(`Błąd serwera: ${res.status}`);
      const data: { imported: number } = await res.json();
      await loadExported();
      setImportSummary(`Pobrano ${data.imported} produktów ze Shopify`);
    } catch (err) {
      setImportSummary(err instanceof Error ? err.message : "Błąd importu");
    } finally {
      setImporting(false);
    }
  }

  const csvLabel = queue.length > 0
    ? `Eksportuj CSV (${queue.length})`
    : selectedProductIds.size > 0
      ? `Eksportuj CSV (${selectedProductIds.size})`
      : "Eksportuj CSV";

  return (
    <div className="sticky top-0 z-40 mb-6 border-b border-border bg-background px-6 py-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Produkty z PIM Beautifly</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-2">
            <button
              onClick={handleImportStatus}
              disabled={importing}
              className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-xs font-medium transition-opacity disabled:opacity-40"
            >
              {importing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
              {importing ? "Pobieranie…" : "Pobierz status Shopify"}
            </button>
            <ExportCsvButton
              getProductIds={() => queue.length > 0 ? [...queue] : [...selectedProductIds]}
              label={csvLabel}
            />
          </div>
          {importSummary && (
            <p className="text-xs text-muted-foreground">{importSummary}</p>
          )}
        </div>
      </div>
    </div>
  );
}
