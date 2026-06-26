import { NextRequest, NextResponse } from "next/server";
import { fetchAllShopifyProducts } from "@/services/shopify";
import { fetchAllProducts } from "@/services/beautifly";
import { appendExportedProducts } from "@/lib/exported-products-db";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({})) as { pimId?: string };
  const filterPimId = body.pimId ?? null;

  const [shopifyProducts, pimProducts] = await Promise.all([
    fetchAllShopifyProducts(),
    fetchAllProducts("pl"),
  ]);

  // ean → pimId
  const eanToPimId = new Map<string, string>();
  for (const p of pimProducts) {
    if (p.ean) eanToPimId.set(p.ean.trim(), String(p.id));
  }

  const entries = [];
  for (const sp of shopifyProducts) {
    const barcode = sp.variants.edges[0]?.node.barcode?.trim();
    if (!barcode) continue;
    const pimId = eanToPimId.get(barcode);
    if (!pimId) continue;
    if (filterPimId && pimId !== filterPimId) continue;
    entries.push({
      pimId,
      method: "api" as const,
      shopifyId: sp.id,
      exportedAt: sp.updatedAt,
    });
  }

  if (entries.length > 0) appendExportedProducts(entries);

  return NextResponse.json({ imported: entries.length });
}
