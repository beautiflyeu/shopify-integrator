import type { NormalizedProduct, ProductStatus } from "@/types/product";
import { DIFFABLE_FIELDS } from "@/config/field-map";
import { createHash } from "crypto";

export type FieldStatus = "new" | "changed" | "removed" | "unchanged";

export interface ProductDiff {
  fields: Partial<Record<keyof NormalizedProduct, FieldStatus>>;
  hash: string;
  status: ProductStatus;
}

function serialize(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function hashProduct(product: NormalizedProduct): string {
  const relevant = DIFFABLE_FIELDS.map((key) => serialize(product[key])).join("|");
  return createHash("sha256").update(relevant).digest("hex").slice(0, 16);
}

export function diffProduct(
  pim: NormalizedProduct,
  shopify: NormalizedProduct | null
): ProductDiff {
  const hash = hashProduct(pim);
  const fields: Partial<Record<keyof NormalizedProduct, FieldStatus>> = {};

  if (!shopify) {
    for (const key of DIFFABLE_FIELDS) {
      fields[key] = pim[key] != null ? "new" : "unchanged";
    }
    return { fields, hash, status: "new" };
  }

  let hasChanges = false;

  for (const key of DIFFABLE_FIELDS) {
    const pimVal = serialize(pim[key]);
    const shopifyVal = serialize(shopify[key]);

    if (pimVal === shopifyVal) {
      fields[key] = "unchanged";
    } else if (!pimVal && shopifyVal) {
      fields[key] = "removed";
      hasChanges = true;
    } else if (pimVal && !shopifyVal) {
      fields[key] = "new";
      hasChanges = true;
    } else {
      fields[key] = "changed";
      hasChanges = true;
    }
  }

  return {
    fields,
    hash,
    status: hasChanges ? "changed" : "unchanged",
  };
}

export { hashProduct };
