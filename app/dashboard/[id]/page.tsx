import { fetchProduct, ALL_INCLUDES } from "@/services/beautifly";
import { fetchShopifyProduct } from "@/services/shopify";
import { normalizeProduct } from "@/modules/pim/normalize";
import { normalizeShopifyProduct } from "@/modules/shopify/normalize";
import { diffProduct } from "@/modules/diff/diffProduct";
import { readExportedProducts } from "@/lib/exported-products-db";
import { getFieldSelections } from "@/lib/field-selections-db";
import { ProductComparisonView } from "@/components/product-comparison-view";
import { ProductCategorySelector } from "@/components/product-category-selector";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;

  let error: string | null = null;
  let normalized = null;
  let shopifyNorm = null;
  let diff = null;
  let fieldSelections: Record<string, boolean> = {};

  try {
    const raw = await fetchProduct(Number(id), { lang: "pl", include: [...ALL_INCLUDES] });
    normalized = normalizeProduct(raw);

    const exportedEntry = readExportedProducts().find(
      (e) => e.pimId === String(id) && e.shopifyId
    );
    const shopifyRaw = exportedEntry?.shopifyId
      ? await fetchShopifyProduct(exportedEntry.shopifyId).catch(() => null)
      : null;
    shopifyNorm = shopifyRaw ? normalizeShopifyProduct(shopifyRaw) : null;

    diff = diffProduct(normalized, shopifyNorm);
    fieldSelections = getFieldSelections(id);
  } catch (err) {
    error = err instanceof Error ? err.message : "Błąd pobierania produktu";
  }

  return (
    <div className="p-6">
      {error ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : normalized && diff ? (
        <div className="flex flex-col gap-6">
          <div className="w-full min-[1400px]:w-1/2">
            <ProductCategorySelector
              productId={id}
              productName={normalized.name}
              productModel={normalized.productType}
            />
          </div>

          <ProductComparisonView
            productId={id}
            pim={normalized}
            shopify={shopifyNorm}
            diff={diff}
            initialSelections={fieldSelections}
          />
        </div>
      ) : null}
    </div>
  );
}
