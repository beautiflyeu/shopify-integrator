"use client";

import { RefreshCw } from "lucide-react";
import { ExportCsvButton } from "@/components/export-csv-button";
import { useSelectionStore } from "@/stores/selection";

export function DashboardHeader() {
  const { selectedProductIds } = useSelectionStore();

  return (
    <div className="mb-6 flex items-center justify-between">
      <div>
        <h1 className="text-lg font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Produkty z PIM Beautifly</p>
      </div>
      <div className="flex items-center gap-2">
        <ExportCsvButton
          getProductIds={() => [...selectedProductIds]}
          label={selectedProductIds.size > 0 ? `Eksportuj zaznaczone (${selectedProductIds.size})` : "Eksportuj CSV"}
        />
        <button
          disabled={selectedProductIds.size === 0}
          className="inline-flex items-center gap-2 rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background transition-opacity disabled:opacity-40"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Synchronizuj zaznaczone
        </button>
      </div>
    </div>
  );
}
