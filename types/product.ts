export type ProductStatus = "new" | "changed" | "removed" | "unchanged" | "needs_decision";

export interface NormalizedProduct {
  id: string;
  sku: string;
  name: string;
  lang: string;
  title: string;
  description: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  price: number | null;
  compareAtPrice: number | null;
  images: Array<{ url: string; alt: string | null; position: number }>;
  categories: string[];
  families: string[];
  tags: string[];
  variants: NormalizedVariant[];
  attributes: Record<string, string>;
  parameters: Record<string, string>;
  metafields: Record<string, string>;
  updatedAt: string | null;
  rawSource?: Record<string, unknown>;
  barcode?: string | null;
  inventoryQty?: number;
  vendor?: string | null;
  weightGrams?: number | null;
  productType?: string | null;
}

export interface NormalizedVariant {
  id: string;
  sku: string;
  price: number | null;
  compareAtPrice: number | null;
  options: Record<string, string>;
  imageUrl: string | null;
  weight: number | null;
  weightUnit: string | null;
}

export interface SyncedProduct {
  pimId: string;
  shopifyId: string | null;
  lastSyncedHash: string | null;
  lastSyncedAt: string | null;
  status: ProductStatus;
}
