"use client";

import { useState } from "react";
import Link from "next/link";
import { RefreshCw, Loader2, ChevronRight } from "lucide-react";
import { ExportCsvButton } from "@/components/export-csv-button";
import { useExportedProductsStore } from "@/stores/exported-products";
import { useExportQueueStore } from "@/stores/export-queue";
import { usePageHeaderStore } from "@/stores/page-header";

export function DashboardHeader() {
  const loadExported = useExportedProductsStore((s) => s.load);
  const { queue } = useExportQueueStore();
  const { productName, productId } = usePageHeaderStore();
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

  const csvLabel = queue.length > 0 ? `Eksportuj CSV (${queue.length})` : "Eksportuj CSV";

  return (
    <div className="sticky top-0 z-40 border-b border-border bg-background px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Left: breadcrumb or dashboard title */}
        {productId ? (
          <div className="flex min-w-0 items-center gap-1 text-sm">
            <Link
              href="/dashboard"
              className="shrink-0 text-muted-foreground hover:text-foreground"
            >
              Dashboard
            </Link>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="truncate font-medium" title={productName ?? ""}>
              {productName}
            </span>
          </div>
        ) : (
          <div>
            <h1 className="text-lg font-semibold">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Produkty z PIM Beautifly</p>
          </div>
        )}

        {/* Right: action buttons */}
        <div className="flex shrink-0 flex-col items-end gap-1">
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
              getProductIds={() => [...queue]}
              label={csvLabel}
              disabled={queue.length === 0}
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
