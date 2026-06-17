"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExportCsvButtonProps {
  getProductIds: () => string[];
  fieldKeys?: string[];
  label?: string;
  className?: string;
  disabled?: boolean;
}

export function ExportCsvButton({
  getProductIds,
  fieldKeys,
  label = "Eksportuj CSV",
  className,
  disabled,
}: ExportCsvButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleExport() {
    const ids = getProductIds();
    if (ids.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/export/csv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIds: ids, fieldKeys }),
      });

      if (!res.ok) {
        throw new Error(`Błąd eksportu: ${res.status}`);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename="([^"]+)"/);
      a.download = match?.[1] ?? "shopify-export.csv";
      a.href = url;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Błąd eksportu");
    } finally {
      setLoading(false);
    }
  }

  const ids = getProductIds();
  const isEmpty = ids.length === 0;

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={handleExport}
        disabled={disabled || loading || isEmpty}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
          "border border-border bg-background text-foreground hover:bg-muted",
          "disabled:pointer-events-none disabled:opacity-50",
          className
        )}
      >
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Download className="h-3.5 w-3.5" />
        )}
        {loading ? "Pobieranie…" : label}
        {!loading && !isEmpty && (
          <span className="text-muted-foreground">({ids.length})</span>
        )}
      </button>
      {error && <p className="text-xs text-error-foreground">{error}</p>}
    </div>
  );
}
