import type { ShopifyProduct } from "@/services/shopify";
import type { NormalizedProduct, NormalizedVariant } from "@/types/product";
import { extractId } from "@/lib/shopify-id";

export function normalizeShopifyProduct(raw: ShopifyProduct): NormalizedProduct {
  const images = raw.images.edges.map((e) => ({
    url: e.node.url,
    alt: e.node.altText,
    position: e.node.position,
  }));

  const variants: NormalizedVariant[] = raw.variants.edges.map((e) => {
    const v = e.node;
    return {
      id: extractId(v.id),
      sku: v.sku,
      price: v.price ? Number(v.price) : null,
      compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : null,
      options: Object.fromEntries(v.selectedOptions.map((o) => [o.name, o.value])),
      imageUrl: v.image?.url ?? null,
      weight: v.weight ?? null,
      weightUnit: v.weightUnit ?? null,
    };
  });

  const firstVariant = raw.variants.edges[0]?.node;

  return {
    id: extractId(raw.id),
    sku: firstVariant?.sku ?? extractId(raw.id),
    name: raw.title,
    lang: "pl",
    title: raw.title,
    description: raw.descriptionHtml || null,
    seoTitle: raw.seo.title,
    seoDescription: raw.seo.description,
    price: firstVariant?.price ? Number(firstVariant.price) : null,
    compareAtPrice: firstVariant?.compareAtPrice ? Number(firstVariant.compareAtPrice) : null,
    images,
    categories: [],
    tags: raw.tags,
    variants,
    attributes: {},
    parameters: {},
    metafields: {},
    updatedAt: raw.updatedAt,
    rawSource: raw as unknown as Record<string, unknown>,
  };
}
