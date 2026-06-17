import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { fetchProduct, ALL_INCLUDES } from "@/services/beautifly";
import { normalizeProduct } from "@/modules/pim/normalize";
import { diffProduct } from "@/modules/diff/diffProduct";
import { FIELD_MAP } from "@/config/field-map";
import { FieldDiffDetail } from "@/components/field-diff-detail";
import { StatusBadge } from "@/components/status-badge";
import { ProductInfoTab } from "@/components/product-info-tab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;

  let error: string | null = null;
  let normalized = null;
  let diff = null;
  let raw = null;

  try {
    raw = await fetchProduct(Number(id), {
      lang: "pl",
      include: [...ALL_INCLUDES],
    });
    normalized = normalizeProduct(raw);
    diff = diffProduct(normalized, null);
  } catch (err) {
    error = err instanceof Error ? err.message : "Błąd pobierania produktu";
  }

  return (
    <div className="p-6">
      <nav className="mb-4 flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/dashboard" className="hover:text-foreground">
          Dashboard
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">{normalized?.name ?? `Produkt #${id}`}</span>
      </nav>

      {error ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : normalized && diff && raw ? (
        <>
          <div className="mb-1 flex items-center gap-3">
            <h1 className="text-lg font-semibold">{normalized.name}</h1>
            <StatusBadge status={diff.status} />
          </div>

          {normalized.sku && (
            <p className="mb-6 text-sm text-muted-foreground">
              SKU: <span className="font-mono text-foreground">{normalized.sku}</span>
            </p>
          )}

          <Tabs defaultValue="product">
            <TabsList className="mb-6">
              <TabsTrigger value="product">Dane produktu</TabsTrigger>
              <TabsTrigger value="shopify">Shopify</TabsTrigger>
            </TabsList>

            <TabsContent value="product">
              <ProductInfoTab raw={raw} normalized={normalized} />
            </TabsContent>

            <TabsContent value="shopify">
              <FieldDiffDetail
                productId={id}
                normalized={normalized}
                diff={diff}
                fieldMap={FIELD_MAP}
              />
            </TabsContent>
          </Tabs>
        </>
      ) : null}
    </div>
  );
}
