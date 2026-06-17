import { fetchAllProducts } from "@/services/beautifly";
import { normalizeListItem } from "@/modules/pim/normalize";
import { diffProduct } from "@/modules/diff/diffProduct";
import { MetricCard } from "@/components/metric-card";
import { DiffTable, type DiffTableRow } from "@/components/diff-table";
import type { ProductStatus } from "@/types/product";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let rows: DiffTableRow[] = [];
  let error: string | null = null;

  try {
    const rawList = await fetchAllProducts("pl");

    rows = rawList.map((item) => {
      const normalized = normalizeListItem(item);
      const diff = diffProduct(
        { ...normalized, description: null, seoTitle: null, seoDescription: null, price: null, compareAtPrice: null, images: [], categories: [], tags: [], variants: [], attributes: {}, parameters: {}, metafields: {}, updatedAt: null },
        null
      );
      return {
        id: String(item.id),
        sku: item.sku,
        ean: item.ean ?? null,
        name: item.name,
        productType: item.model ?? null,
        status: diff.status,
        changedFieldsCount: Object.values(diff.fields).filter(
          (s) => s !== "unchanged"
        ).length,
      };
    });
  } catch (err) {
    error = err instanceof Error ? err.message : "Błąd pobierania danych";
  }

  const countByStatus = (status: ProductStatus) =>
    rows.filter((r) => r.status === status).length;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-lg font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Produkty z PIM Beautifly</p>
      </div>

      {error ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : (
        <>
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MetricCard label="Łącznie" value={rows.length} type="total" />
            <MetricCard label="Nowe" value={countByStatus("new")} type="new" />
            <MetricCard label="Zmienione" value={countByStatus("changed")} type="changed" />
            <MetricCard label="Wymaga decyzji" value={countByStatus("needs_decision")} type="needs_decision" />
          </div>
          <DiffTable rows={rows} />
        </>
      )}
    </div>
  );
}
