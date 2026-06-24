import { FIELD_MAP } from "@/config/field-map";
import type { NormalizedProduct } from "@/types/product";
import type { ProductInput, ProductVariantInput } from "@/services/shopify";

const REQUIRED_API_FIELDS = new Set(["title", "price"]);

export function buildShopifyInput(
  product: NormalizedProduct,
  fieldKeys?: Set<string>,
  categoryMap?: Record<string, string>,
  categoryGidMap?: Record<string, string>
): ProductInput {
  const apiFields = new Set(
    FIELD_MAP.filter((f) => f.channel !== "csv").map((f) => String(f.pimKey))
  );

  const include = (fieldKey: string): boolean => {
    if (REQUIRED_API_FIELDS.has(fieldKey)) return true;
    if (fieldKeys && fieldKeys.size > 0) return fieldKeys.has(fieldKey);
    return apiFields.has(fieldKey);
  };

  const input: ProductInput = {
    status: "ACTIVE",
    vendor: product.vendor ?? "Beautifly",
    productType: product.productType ?? undefined,
  };

  if (categoryMap?.[product.id] && categoryGidMap) {
    const gid = categoryGidMap[categoryMap[product.id]];
    if (gid) input.productCategory = { productTaxonomyNodeId: gid };
  }

  if (include("title")) input.title = product.title || product.name;
  if (include("description")) input.descriptionHtml = product.description ?? undefined;
  if (include("tags") && product.tags?.length) input.tags = product.tags;
  if (include("seoTitle") || include("seoDescription")) {
    input.seo = {};
    if (include("seoTitle")) input.seo.title = product.seoTitle ?? undefined;
    if (include("seoDescription")) input.seo.description = product.seoDescription ?? undefined;
  }

  if (include("images") && product.images.length > 0) {
    input.images = product.images.map((img) => ({
      src: img.url,
      altText: img.alt ?? undefined,
    }));
  }

  if (product.variants.length > 0) {
    input.variants = product.variants.map((v): ProductVariantInput => {
      const variant: ProductVariantInput = {
        sku: v.sku,
        options: Object.values(v.options ?? {}),
      };
      if (include("price") && v.price != null) variant.price = String(v.price);
      if (include("compareAtPrice") && v.compareAtPrice != null)
        variant.barcode = undefined;
      if (include("barcode") && product.barcode) variant.barcode = product.barcode;
      if (include("weightGrams") && v.weight != null) {
        variant.weight = v.weight;
        variant.weightUnit = v.weightUnit ?? "GRAMS";
      }
      return variant;
    });
  } else {
    const variant: ProductVariantInput = { sku: product.sku };
    if (include("price") && product.price != null) variant.price = String(product.price);
    if (include("barcode") && product.barcode) variant.barcode = product.barcode;
    if (include("weightGrams") && product.weightGrams != null) {
      variant.weight = product.weightGrams;
      variant.weightUnit = "GRAMS";
    }
    input.variants = [variant];
  }

  return input;
}
