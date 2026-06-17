import type { BeautiflyProduct, BeautiflyProductListItem } from "@/services/beautifly";
import type { NormalizedProduct } from "@/types/product";

export function normalizeProduct(raw: BeautiflyProduct): NormalizedProduct {
  const md = raw.main_details ?? {};
  const dd = raw.description_data ?? {};
  const price = raw.price ?? {};

  const directImages = (raw.media?.images ?? [])
    .filter((m) => m.type !== "document")
    .map((m, i) => ({
      url: m.url,
      alt: m.alt ?? null,
      position: m.position ?? i,
    }))
    .sort((a, b) => a.position - b.position);

  const driveImages = (raw.media?.external_sources ?? [])
    .filter((s) => s.source === "google_drive" && s.type === "file" && s.path?.includes("Photos"))
    .map((s, i) => ({
      url: `https://drive.google.com/uc?export=view&id=${s.id}`,
      alt: s.name?.replace(/\.[^.]+$/, "") ?? null,
      position: s.name === "_main.jpg" ? 0 : i + 1,
    }))
    .sort((a, b) => a.position - b.position);

  const images = directImages.length > 0 ? directImages : driveImages;

  const attributes: Record<string, string> = {};
  for (const attr of raw.attributes ?? []) {
    const key = attr.code ?? attr.name;
    attributes[key] = String(attr.value);
  }

  const parameters: Record<string, string> = {};
  for (const param of raw.parameters ?? []) {
    const key = param.name;
    parameters[key] = param.unit ? `${param.value} ${param.unit}` : String(param.value);
  }

  const categories = (raw.categories ?? []).map((c) => c.name);
  const families = (raw.families ?? []).map((f) => f.name);

  return {
    id: String(raw.id),
    sku: raw.sku,
    name: raw.name,
    lang: "pl",
    title: String(md.title ?? raw.name),
    description: String(dd.description ?? dd.short_descriptions?.[0] ?? "") || null,
    seoTitle: String(dd.seo_title ?? "") || null,
    seoDescription: String(dd.seo_description ?? "") || null,
    price: price.pln?.gross != null ? Number(price.pln.gross) : null,
    compareAtPrice: price.pln?.net != null ? Number(price.pln.net) : null,
    images,
    categories,
    tags: [...categories, ...families],
    variants: [],
    attributes,
    parameters,
    metafields: {},
    updatedAt: raw.updated_at ?? null,
    rawSource: raw as Record<string, unknown>,
    barcode: raw.ean ?? null,
    inventoryQty: raw.stock?.available ?? 0,
    vendor: raw.brand ?? null,
    weightGrams: raw.main_details?.weight_gross != null ? Math.round(raw.main_details.weight_gross * 1000) : null,
    productType: raw.model ?? null,
  };
}

export function normalizeListItem(
  item: BeautiflyProductListItem
): Pick<NormalizedProduct, "id" | "sku" | "name" | "lang" | "title"> {
  return {
    id: String(item.id),
    sku: item.sku,
    name: item.name,
    lang: "pl",
    title: item.name,
  };
}
