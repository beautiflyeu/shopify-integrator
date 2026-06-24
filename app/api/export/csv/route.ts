import { fetchProduct, ALL_INCLUDES } from "@/services/beautifly";
import { normalizeProduct } from "@/modules/pim/normalize";
import { buildCsvPayload } from "@/modules/sync/buildCsvPayload";

const MAX_PRODUCTS = 50;

export async function POST(request: Request) {
  let body: { productIds?: string[]; fieldKeys?: string[]; categoryMap?: Record<string, string> };
  try {
    body = await request.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const { productIds, fieldKeys, categoryMap } = body;

  if (!Array.isArray(productIds) || productIds.length === 0) {
    return new Response("productIds required", { status: 400 });
  }

  const ids = productIds.slice(0, MAX_PRODUCTS);

  const results = await Promise.allSettled(
    ids.map((id) =>
      fetchProduct(Number(id), { lang: "pl", include: [...ALL_INCLUDES] }).then(normalizeProduct)
    )
  );

  const products = results
    .filter((r): r is PromiseFulfilledResult<Awaited<ReturnType<typeof normalizeProduct>>> => r.status === "fulfilled")
    .map((r) => r.value);

  if (products.length === 0) {
    return new Response("No products could be fetched", { status: 502 });
  }

  const fieldSet = fieldKeys && fieldKeys.length > 0 ? new Set(fieldKeys) : undefined;

  const csv = buildCsvPayload(products, fieldSet, categoryMap);

  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const time = now.toTimeString().slice(0, 8).replace(/:/g, "");
  const filename = `shopify-export-${date}_${time}.csv`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
