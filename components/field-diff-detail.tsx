"use client";

import { useSelectionStore } from "@/stores/selection";
import { FieldDiffRow } from "@/components/field-diff-row";
import { ExportCsvButton } from "@/components/export-csv-button";
import type { NormalizedProduct } from "@/types/product";
import type { ProductDiff } from "@/modules/diff/diffProduct";
import type { FieldMapping } from "@/config/field-map";

interface FieldDiffDetailProps {
  productId: string;
  normalized: NormalizedProduct;
  diff: ProductDiff;
  fieldMap: FieldMapping[];
}

function formatValue(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (Array.isArray(value)) {
    if (value.length === 0) return null;
    if (typeof value[0] === "object") return JSON.stringify(value).slice(0, 80);
    return (value as string[]).join(", ");
  }
  if (typeof value === "object") return JSON.stringify(value).slice(0, 80);
  return String(value);
}

export function FieldDiffDetail({
  productId,
  normalized,
  diff,
  fieldMap,
}: FieldDiffDetailProps) {
  const { isFieldSelected, toggleField } = useSelectionStore();

  const changedCount = Object.values(diff.fields).filter((s) => s !== "unchanged").length;
  const selectedCount = fieldMap.filter((m) => {
    const status = diff.fields[m.pimKey];
    return status && status !== "unchanged" && isFieldSelected(productId, String(m.pimKey));
  }).length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between rounded-md bg-muted/50 px-4 py-2 text-sm text-muted-foreground">
        <span>
          Wybrano{" "}
          <span className="font-medium text-foreground">{selectedCount}</span> z{" "}
          <span className="font-medium text-foreground">{changedCount}</span> zmienionych pól do synchronizacji
        </span>
        <ExportCsvButton
          getProductIds={() => [productId]}
          fieldKeys={fieldMap
            .filter((m) => isFieldSelected(productId, String(m.pimKey)))
            .map((m) => String(m.pimKey))}
          label="Eksportuj CSV"
        />
      </div>

      <div className="rounded-md border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Pole</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Wartość PIM</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Wartość Shopify</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Akcja</th>
            </tr>
          </thead>
          <tbody>
            {fieldMap.map((mapping) => {
              const key = mapping.pimKey;
              const status = diff.fields[key] ?? "unchanged";
              const pimVal = formatValue(normalized[key]);
              const selected = isFieldSelected(productId, String(key));

              return (
                <FieldDiffRow
                  key={String(key)}
                  fieldName={mapping.csvColumn}
                  pimValue={pimVal}
                  shopifyValue={null}
                  status={status}
                  selected={selected}
                  onToggle={() => toggleField(productId, String(key))}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
