export type SyncChannel = "csv" | "api" | "both";

export interface FieldMapping {
  pimKey: keyof import("@/types/product").NormalizedProduct;
  csvColumn: string;
  shopifyApiField: string;
  channel: SyncChannel;
  required: boolean;
}

export const FIELD_MAP: FieldMapping[] = [
  { pimKey: "title",          csvColumn: "Title",             shopifyApiField: "title",           channel: "both", required: true  },
  { pimKey: "description",    csvColumn: "Description",       shopifyApiField: "descriptionHtml", channel: "both", required: false },
  { pimKey: "seoTitle",       csvColumn: "SEO title",         shopifyApiField: "seo.title",       channel: "both", required: false },
  { pimKey: "seoDescription", csvColumn: "SEO description",   shopifyApiField: "seo.description", channel: "both", required: false },
  { pimKey: "price",          csvColumn: "Price",             shopifyApiField: "variants.price",  channel: "both", required: true  },
  { pimKey: "compareAtPrice", csvColumn: "Compare-at price",  shopifyApiField: "variants.compareAtPrice", channel: "both", required: false },
  { pimKey: "tags",           csvColumn: "Tags",                   shopifyApiField: "tags",                        channel: "both", required: false },
  { pimKey: "images",         csvColumn: "Product image URL",      shopifyApiField: "images",                      channel: "both", required: false },
  { pimKey: "barcode",        csvColumn: "Barcode",                shopifyApiField: "variants.barcode",            channel: "both", required: false },
  { pimKey: "vendor",         csvColumn: "Vendor",                 shopifyApiField: "vendor",                      channel: "both", required: false },
  { pimKey: "productType",    csvColumn: "Type",                   shopifyApiField: "productType",                 channel: "both", required: false },
  { pimKey: "weightGrams",    csvColumn: "Weight value (grams)",   shopifyApiField: "variants.weight",             channel: "both", required: false },
  { pimKey: "inventoryQty",   csvColumn: "Inventory quantity",     shopifyApiField: "variants.inventoryQuantity",  channel: "csv",  required: false },
];

export const DIFFABLE_FIELDS = FIELD_MAP.map((f) => f.pimKey);
