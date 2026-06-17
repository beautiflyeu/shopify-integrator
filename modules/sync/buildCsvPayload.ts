import { FIELD_MAP } from "@/config/field-map";
import type { NormalizedProduct } from "@/types/product";

const REQUIRED_FIELDS = new Set(["title", "price"]);

const CSV_HEADERS = [
  "Title",
  "URL handle",
  "Description",
  "Vendor",
  "Product category",
  "Type",
  "Tags",
  "Published on online store",
  "Status",
  "SKU",
  "Barcode",
  "Option1 name",
  "Option1 value",
  "Option2 name",
  "Option2 value",
  "Price",
  "Compare-at price",
  "Charge tax",
  "Inventory tracker",
  "Inventory quantity",
  "Continue selling when out of stock",
  "Requires shipping",
  "Fulfillment service",
  "Weight value (grams)",
  "Weight unit for display",
  "Product image URL",
  "Image position",
  "Image alt text",
  "Variant image URL",
  "Gift card",
  "SEO title",
  "SEO description",
];

function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function escapeCsvField(value: string | null | undefined): string {
  if (value === null || value === undefined || value === "") return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function rowToLine(cells: (string | null | undefined)[]): string {
  return cells.map(escapeCsvField).join(",");
}

interface CsvRow {
  Title?: string;
  "URL handle"?: string;
  Description?: string;
  Vendor?: string;
  "Product category"?: string;
  Type?: string;
  Tags?: string;
  "Published on online store"?: string;
  Status?: string;
  SKU?: string;
  Barcode?: string;
  "Option1 name"?: string;
  "Option1 value"?: string;
  "Option2 name"?: string;
  "Option2 value"?: string;
  Price?: string;
  "Compare-at price"?: string;
  "Charge tax"?: string;
  "Inventory tracker"?: string;
  "Inventory quantity"?: string;
  "Continue selling when out of stock"?: string;
  "Requires shipping"?: string;
  "Fulfillment service"?: string;
  "Weight value (grams)"?: string;
  "Weight unit for display"?: string;
  "Product image URL"?: string;
  "Image position"?: string;
  "Image alt text"?: string;
  "Variant image URL"?: string;
  "Gift card"?: string;
  "SEO title"?: string;
  "SEO description"?: string;
}

function buildProductRows(product: NormalizedProduct, activeFields: Set<string>): CsvRow[] {
  const handle = slugify(product.title || product.name);
  const rows: CsvRow[] = [];

  const include = (fieldKey: string) =>
    activeFields.has(fieldKey) || REQUIRED_FIELDS.has(fieldKey);

  const firstImages = product.images.slice(0, 1);
  const extraImages = product.images.slice(1);

  const hasVariants = product.variants.length > 0;

  if (hasVariants) {
    product.variants.forEach((variant, vi) => {
      const optionEntries = Object.entries(variant.options ?? {});
      const row: CsvRow = { "URL handle": handle };

      if (vi === 0) {
        if (include("title")) row.Title = product.title || product.name;
        if (include("description")) row.Description = product.description ?? undefined;
        if (include("tags")) row.Tags = product.tags?.join(", ") ?? undefined;
        if (include("seoTitle")) row["SEO title"] = product.seoTitle ?? undefined;
        if (include("seoDescription")) row["SEO description"] = product.seoDescription ?? undefined;
        row.Vendor = product.vendor ?? "Beautifly";
        row.Type = product.productType ?? undefined;
        row["Gift card"] = "FALSE";
        row["Published on online store"] = "TRUE";
        row.Status = "Active";
        if (firstImages.length > 0 && include("images")) {
          row["Product image URL"] = firstImages[0].url;
          row["Image position"] = "1";
          row["Image alt text"] = firstImages[0].alt ?? undefined;
        }
      }

      row.SKU = variant.sku;
      row.Barcode = variant.sku ? undefined : product.barcode ?? undefined;
      if (optionEntries[0]) {
        row["Option1 name"] = optionEntries[0][0];
        row["Option1 value"] = optionEntries[0][1];
      }
      if (optionEntries[1]) {
        row["Option2 name"] = optionEntries[1][0];
        row["Option2 value"] = optionEntries[1][1];
      }
      if (include("price")) row.Price = variant.price != null ? String(variant.price) : undefined;
      if (include("compareAtPrice")) row["Compare-at price"] = variant.compareAtPrice != null ? String(variant.compareAtPrice) : undefined;
      row["Charge tax"] = "TRUE";
      row["Inventory tracker"] = "shopify";
      row["Inventory quantity"] = String(product.inventoryQty ?? 0);
      row["Continue selling when out of stock"] = "DENY";
      row["Requires shipping"] = "TRUE";
      row["Fulfillment service"] = "manual";
      if (product.weightGrams != null) {
        row["Weight value (grams)"] = String(product.weightGrams);
        row["Weight unit for display"] = "g";
      }

      rows.push(row);
    });
  } else {
    const row: CsvRow = { "URL handle": handle };
    if (include("title")) row.Title = product.title || product.name;
    if (include("description")) row.Description = product.description ?? undefined;
    if (include("tags")) row.Tags = product.tags?.join(", ") ?? undefined;
    row.Vendor = product.vendor ?? "Beautifly";
    row.Type = product.productType ?? undefined;
    row["Gift card"] = "FALSE";
    row.SKU = product.sku;
    row.Barcode = product.barcode ?? undefined;
    if (include("price")) row.Price = product.price != null ? String(product.price) : undefined;
    if (include("compareAtPrice")) row["Compare-at price"] = product.compareAtPrice != null ? String(product.compareAtPrice) : undefined;
    row["Charge tax"] = "TRUE";
    row["Inventory tracker"] = "shopify";
    row["Inventory quantity"] = String(product.inventoryQty ?? 0);
    row["Continue selling when out of stock"] = "DENY";
    row["Requires shipping"] = "TRUE";
    row["Fulfillment service"] = "manual";
    if (product.weightGrams != null) {
      row["Weight value (grams)"] = String(product.weightGrams);
      row["Weight unit for display"] = "g";
    }
    if (include("images") && firstImages.length > 0) {
      row["Product image URL"] = firstImages[0].url;
      row["Image position"] = "1";
      row["Image alt text"] = firstImages[0].alt ?? undefined;
    }
    if (include("seoTitle")) row["SEO title"] = product.seoTitle ?? undefined;
    if (include("seoDescription")) row["SEO description"] = product.seoDescription ?? undefined;
    row["Published on online store"] = "TRUE";
    row.Status = "Active";
    rows.push(row);
  }

  if (include("images")) {
    extraImages.forEach((img, idx) => {
      rows.push({
        "URL handle": handle,
        "Product image URL": img.url,
        "Image position": String(idx + 2),
        "Image alt text": img.alt ?? undefined,
      });
    });
  }

  return rows;
}

export function buildCsvPayload(products: NormalizedProduct[], fieldKeys?: Set<string>): string {
  const activeFields: Set<string> =
    fieldKeys && fieldKeys.size > 0
      ? new Set([...fieldKeys, ...REQUIRED_FIELDS])
      : new Set(FIELD_MAP.map((f) => String(f.pimKey)));

  const lines: string[] = [rowToLine(CSV_HEADERS)];

  for (const product of products) {
    const rows = buildProductRows(product, activeFields);
    for (const row of rows) {
      lines.push(rowToLine(CSV_HEADERS.map((h) => (row as Record<string, string | undefined>)[h])));
    }
  }

  return lines.join("\n");
}
