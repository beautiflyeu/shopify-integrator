"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Loader2, Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/status-badge";
import { useExportQueueStore } from "@/stores/export-queue";
import { useExportedProductsStore } from "@/stores/exported-products";
import { FIELD_MAP } from "@/config/field-map";
import type { NormalizedProduct } from "@/types/product";
import type { ProductDiff } from "@/modules/diff/diffProduct";

const FIELD_LABELS: Record<string, string> = {
  title: "Tytuł",
  description: "Opis",
  seoTitle: "SEO tytuł",
  seoDescription: "SEO opis",
  price: "Cena",
  compareAtPrice: "Cena przekreślona",
  tags: "Tagi",
  images: "Zdjęcia",
  barcode: "Barcode (EAN)",
  vendor: "Producent",
  productType: "Model/Typ",
  weightGrams: "Waga (g)",
  inventoryQty: "Stan magazynowy",
};

type DiffStatus = "unchanged" | "changed" | "new" | "removed";

function rowBg(status: DiffStatus): string {
  switch (status) {
    case "changed": return "bg-amber-500/10";
    case "new":     return "bg-blue-500/8";
    case "removed": return "bg-red-500/8";
    default:        return "";
  }
}

function StatusDot({ status }: { status: DiffStatus }) {
  const colors: Record<DiffStatus, string> = {
    changed:   "bg-amber-500",
    new:       "bg-blue-500",
    removed:   "bg-red-500",
    unchanged: "bg-green-500/60",
  };
  return <span className={cn("inline-block h-1.5 w-1.5 shrink-0 rounded-full", colors[status])} />;
}

type ImageItem = { url: string; alt: string | null };

function ImageThumbnails({ images }: { images: ImageItem[] }) {
  if (!images || images.length === 0) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }
  return (
    <div className="flex flex-wrap gap-1">
      {images.slice(0, 6).map((img, i) => (
        <div key={i} className="group relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={img.url}
            alt={img.alt ?? ""}
            className="h-10 w-10 rounded object-cover ring-1 ring-border"
          />
          <div className="pointer-events-none absolute bottom-full left-0 z-50 mb-1 hidden rounded-md bg-background p-0.5 shadow-xl ring-1 ring-border group-hover:block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.url} alt="" className="h-48 w-48 rounded object-cover" />
          </div>
        </div>
      ))}
      {images.length > 6 && (
        <span className="self-center text-xs text-muted-foreground">+{images.length - 6}</span>
      )}
    </div>
  );
}

function formatValue(value: unknown, fieldKey: string): React.ReactNode {
  if (value === null || value === undefined) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }
  if (fieldKey === "images" && Array.isArray(value)) {
    return <ImageThumbnails images={value as ImageItem[]} />;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-xs text-muted-foreground">—</span>;
    return <span className="text-xs">{(value as string[]).join(", ")}</span>;
  }
  if ((fieldKey === "price" || fieldKey === "compareAtPrice") && typeof value === "number") {
    return <span className="tabular-nums text-xs">{value.toFixed(2)} zł</span>;
  }
  if (fieldKey === "description" && typeof value === "string") {
    const stripped = value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    return (
      <span className="line-clamp-3 text-xs" title={stripped}>
        {stripped.slice(0, 160)}{stripped.length > 160 ? "…" : ""}
      </span>
    );
  }
  if (fieldKey === "weightGrams" && typeof value === "number") {
    return <span className="tabular-nums text-xs">{value} g</span>;
  }
  return <span className="text-xs">{String(value)}</span>;
}

function FieldLabel({
  label,
  technical,
}: {
  label: string;
  technical: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium leading-none">{label}</span>
      <span className="font-mono text-[10px] leading-none text-muted-foreground">{technical}</span>
    </div>
  );
}

interface Props {
  productId: string;
  pim: NormalizedProduct;
  shopify: NormalizedProduct | null;
  diff: ProductDiff;
  initialSelections: Record<string, boolean>;
}

export function ProductComparisonView({ productId, pim, shopify, diff, initialSelections }: Props) {
  const router = useRouter();
  const { add, remove, isInQueue } = useExportQueueStore();
  const loadExported = useExportedProductsStore((s) => s.load);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const inQueue = mounted && isInQueue(productId);
  const [refreshing, setRefreshing] = useState(false);

  async function handleRefreshStatus() {
    setRefreshing(true);
    try {
      const res = await fetch("/api/shopify/import-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pimId: productId }),
      });
      if (!res.ok) throw new Error();
      await loadExported();
      router.refresh();
    } finally {
      setRefreshing(false);
    }
  }

  const [selections, setSelections] = useState<Record<string, boolean>>(() => {
    const defaults: Record<string, boolean> = {};
    for (const f of FIELD_MAP) defaults[String(f.pimKey)] = true;
    return { ...defaults, ...initialSelections };
  });

  const saveSelections = useCallback(
    async (next: Record<string, boolean>) => {
      await fetch(`/api/field-selections/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selections: next }),
      }).catch(() => {});
    },
    [productId]
  );

  function toggleField(key: string) {
    const next = { ...selections, [key]: !selections[key] };
    setSelections(next);
    saveSelections(next);
  }

  function toggleAllChanged() {
    const changedKeys = FIELD_MAP.map((f) => String(f.pimKey)).filter((k) => {
      const s = (diff.fields as Record<string, string>)[k];
      return s && s !== "unchanged";
    });
    if (changedKeys.length === 0) return;
    const allSelected = changedKeys.every((k) => selections[k] !== false);
    const next = { ...selections };
    for (const k of changedKeys) next[k] = !allSelected;
    setSelections(next);
    saveSelections(next);
  }

  const allFieldsSelected = FIELD_MAP.every((f) => selections[String(f.pimKey)] !== false);

  function toggleAllFields(v: boolean) {
    const next: Record<string, boolean> = {};
    for (const f of FIELD_MAP) next[String(f.pimKey)] = v;
    setSelections(next);
    saveSelections(next);
  }

  const hasShopify = shopify !== null;
  const mainImage = pim.images[0];

  const changedCount = Object.values(diff.fields as Record<string, string>).filter(
    (s) => s !== "unchanged"
  ).length;
  const selectedChangedCount = FIELD_MAP.filter((f) => {
    const key = String(f.pimKey);
    const status = (diff.fields as Record<string, string>)[key];
    return status && status !== "unchanged" && selections[key] !== false;
  }).length;

  const paramEntries = Object.entries(pim.parameters ?? {});
  const attrEntries = Object.entries(pim.attributes ?? {});
  const families = pim.families ?? [];
  const categories = pim.categories ?? [];
  const hasPimExtras = paramEntries.length > 0 || attrEntries.length > 0 || families.length > 0 || categories.length > 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Header row */}
      <div className="flex items-start gap-5">
        {mainImage ? (
          <div className="group relative shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={mainImage.url}
              alt={mainImage.alt ?? pim.name}
              className="h-[160px] w-[160px] rounded-md border object-cover"
            />
            <div className="pointer-events-none absolute bottom-full left-0 z-50 mb-1 hidden rounded-md bg-background p-0.5 shadow-xl ring-1 ring-border group-hover:block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={mainImage.url} alt="" className="h-64 w-64 rounded object-cover" />
            </div>
          </div>
        ) : (
          <div className="flex h-[160px] w-[160px] shrink-0 items-center justify-center rounded-md border bg-muted text-xs text-muted-foreground">
            Brak zdjęcia
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={diff.status} />
            {pim.vendor && (
              <Badge variant="outline" className="text-xs">{pim.vendor}</Badge>
            )}
            {pim.productType && (
              <Badge variant="secondary" className="text-xs">{pim.productType}</Badge>
            )}
          </div>
          {pim.sku && (
            <p className="text-xs text-muted-foreground">
              SKU: <span className="font-mono text-foreground">{pim.sku}</span>
            </p>
          )}
          {pim.barcode && (
            <p className="text-xs text-muted-foreground">
              EAN: <span className="font-mono text-foreground">{pim.barcode}</span>
            </p>
          )}
          {!hasShopify && (
            <p className="max-w-sm rounded-md bg-blue-500/10 px-3 py-1.5 text-xs text-blue-700 dark:text-blue-300">
              Produkt nie jest potwierdzony w Shopify — kliknij &quot;Pobierz status Shopify&quot; aby odświeżyć
            </p>
          )}
        </div>
      </div>

      {/* Side-by-side comparison */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-medium">Porównanie pól</h2>
            {changedCount > 0 && (
              <span className="text-xs text-muted-foreground">
                Zaznaczono{" "}
                <span className="font-medium text-foreground">{selectedChangedCount}</span>
                {" "}z{" "}
                <span className="font-medium text-foreground">{changedCount}</span>
                {" "}zmienionych
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefreshStatus}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium transition-opacity disabled:opacity-40"
            >
              {refreshing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
              {refreshing ? "Pobieranie…" : "Pobierz status Shopify"}
            </button>
            <button
              onClick={() => (inQueue ? remove(productId) : add(productId))}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
                inQueue
                  ? "border-green-500/50 bg-green-500/10 text-green-700 hover:bg-green-500/20 dark:text-green-400"
                  : "border-border hover:bg-muted"
              )}
            >
              {inQueue ? (
                <><Check className="h-3.5 w-3.5" /> W kolejce</>
              ) : (
                <><Plus className="h-3.5 w-3.5" /> Dodaj do exportu</>
              )}
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-md border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="w-8 px-2 py-2 text-center">
                  <Checkbox
                    checked={allFieldsSelected}
                    onCheckedChange={(v) => toggleAllFields(Boolean(v))}
                  />
                </th>
                <th className="w-[130px] px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                  Pole PIM
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                  Wartość PIM
                </th>
                <th className="w-[130px] px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/Shopify_icon.svg" alt="" width={11} height={11} />
                    Pole Shopify
                  </div>
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                  Wartość Shopify
                </th>
              </tr>
            </thead>
            <tbody>
              {FIELD_MAP.map((mapping) => {
                const key = String(mapping.pimKey);
                const status = ((diff.fields as Record<string, string>)[key] ?? "unchanged") as DiffStatus;
                const pimVal = pim[mapping.pimKey];
                const shopifyVal = shopify?.[mapping.pimKey] ?? null;
                const selected = selections[key] !== false;

                return (
                  <tr
                    key={key}
                    className={cn(
                      "border-b border-border last:border-0 transition-colors",
                      rowBg(status)
                    )}
                  >
                    {/* Field checkbox */}
                    <td className="px-2 py-2.5 text-center align-top">
                      <Checkbox
                        checked={selected}
                        onCheckedChange={() => toggleField(key)}
                      />
                    </td>
                    {/* PIM field label */}
                    <td className="px-3 py-2.5 align-top">
                      <div className="flex items-center gap-1.5">
                        <StatusDot status={status} />
                        <FieldLabel
                          label={FIELD_LABELS[key] ?? mapping.csvColumn}
                          technical={key}
                        />
                      </div>
                    </td>
                    {/* PIM value */}
                    <td className="px-3 py-2.5 align-top">
                      {formatValue(pimVal, key)}
                    </td>
                    {/* Shopify field label */}
                    <td className="px-3 py-2.5 align-top">
                      <FieldLabel
                        label={mapping.shopifyApiField}
                        technical={mapping.csvColumn}
                      />
                    </td>
                    {/* Shopify value */}
                    <td className="px-3 py-2.5 align-top">
                      {hasShopify
                        ? formatValue(shopifyVal, key)
                        : <span className="text-xs text-muted-foreground">—</span>
                      }
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* PIM-only extras */}
      {hasPimExtras && (
        <div className="flex flex-col gap-2">
          <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Dane PIM
          </h2>
          <div className="overflow-hidden rounded-md border border-border">
            <table className="w-full">
              <tbody>
                {families.length > 0 && (
                  <tr className="border-b border-border">
                    <td className="w-[140px] px-3 py-2 align-top text-xs font-medium text-muted-foreground">
                      Familie
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-1">
                        {families.map((f) => (
                          <span key={f} className="rounded bg-muted px-1.5 py-0.5 text-xs">{f}</span>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
                {categories.length > 0 && (
                  <tr className="border-b border-border">
                    <td className="w-[140px] px-3 py-2 align-top text-xs font-medium text-muted-foreground">
                      Kategorie
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-1">
                        {categories.map((c) => (
                          <span key={c} className="rounded bg-muted px-1.5 py-0.5 text-xs">{c}</span>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
                {attrEntries.length > 0 && (
                  <tr className="border-b border-border last:border-0">
                    <td className="px-3 py-2 align-top text-xs font-medium text-muted-foreground">
                      Atrybuty
                    </td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">
                      {attrEntries.map(([k, v]) => `${k}: ${v}`).join(" · ")}
                    </td>
                  </tr>
                )}
                {paramEntries.length > 0 && (
                  <tr className="last:border-0">
                    <td className="px-3 py-2 align-top text-xs font-medium text-muted-foreground">
                      Parametry
                    </td>
                    <td className="px-3 py-2 text-xs text-muted-foreground leading-relaxed">
                      {paramEntries.map(([k, v]) => `${k}: ${v}`).join(" · ")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
