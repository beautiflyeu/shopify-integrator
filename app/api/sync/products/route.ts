import { NextResponse } from "next/server";
import { fetchProduct, ALL_INCLUDES } from "@/services/beautifly";
import { normalizeProduct } from "@/modules/pim/normalize";
import { buildShopifyInput } from "@/modules/sync/buildShopifyInput";
import {
  shopifyProductCreate,
  shopifyProductUpdate,
  fetchCollectionByTitle,
  createManualCollection,
  addProductToCollection,
} from "@/services/shopify";
import { fetchShopifyCategories } from "@/services/shopify-taxonomy";

const MAX_PRODUCTS = 10;

interface SyncRequestProduct {
  pimId: string;
  shopifyId: string | null;
}

interface SyncResult {
  pimId: string;
  status: "created" | "updated" | "error";
  shopifyId?: string;
  collections?: string[];
  message?: string;
}

async function syncCollections(
  productShopifyId: string,
  families: string[],
  collectionCache: Map<string, string>
): Promise<string[]> {
  const synced: string[] = [];
  for (const family of families) {
    try {
      let collectionId = collectionCache.get(family);
      if (!collectionId) {
        const existing = await fetchCollectionByTitle(family);
        if (existing) {
          collectionId = existing.id;
        } else {
          const created = await createManualCollection(family);
          collectionId = created.id;
        }
        collectionCache.set(family, collectionId);
      }
      await addProductToCollection(collectionId, productShopifyId);
      synced.push(family);
    } catch {
      // best-effort — don't fail the whole sync for a collection error
    }
  }
  return synced;
}

export async function POST(request: Request) {
  let body: {
    products?: SyncRequestProduct[];
    fieldKeys?: string[];
    categoryMap?: Record<string, string>;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { products, fieldKeys, categoryMap } = body;

  if (!Array.isArray(products) || products.length === 0) {
    return NextResponse.json({ error: "products array required" }, { status: 400 });
  }

  const batch = products.slice(0, MAX_PRODUCTS);
  const fieldSet = fieldKeys && fieldKeys.length > 0 ? new Set(fieldKeys) : undefined;

  // Build fullName → GID map once per request if categoryMap has entries
  let categoryGidMap: Record<string, string> | undefined;
  if (categoryMap && Object.keys(categoryMap).length > 0) {
    try {
      const taxonomyList = await fetchShopifyCategories();
      categoryGidMap = Object.fromEntries(taxonomyList.map((c) => [c.fullName, c.id]));
    } catch {
      // non-fatal — sync continues without category assignment
    }
  }

  // shared cache across all products in this request batch
  const collectionCache = new Map<string, string>();

  const results: SyncResult[] = [];
  for (const { pimId, shopifyId } of batch) {
    try {
      const raw = await fetchProduct(Number(pimId), { lang: "pl", include: [...ALL_INCLUDES] });
      const normalized = normalizeProduct(raw);
      const input = buildShopifyInput(normalized, fieldSet, categoryMap, categoryGidMap);

      let resultShopifyId: string;
      let status: "created" | "updated";

      if (shopifyId) {
        resultShopifyId = await shopifyProductUpdate(shopifyId, input);
        status = "updated";
      } else {
        resultShopifyId = await shopifyProductCreate(input);
        status = "created";
      }

      const collections = await syncCollections(resultShopifyId, normalized.families, collectionCache);

      results.push({ pimId, status, shopifyId: resultShopifyId, collections });
    } catch (err) {
      results.push({
        pimId,
        status: "error",
        message: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  return NextResponse.json({ results });
}
