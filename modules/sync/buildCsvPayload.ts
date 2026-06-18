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
  "Option1 Linked To",
  "Option2 name",
  "Option2 value",
  "Option2 Linked To",
  "Option3 name",
  "Option3 value",
  "Option3 Linked To",
  "Price",
  "Compare-at price",
  "Cost per item",
  "Charge tax",
  "Tax code",
  "Unit price total measure",
  "Unit price total measure unit",
  "Unit price base measure",
  "Unit price base measure unit",
  "Inventory tracker",
  "Inventory quantity",
  "Continue selling when out of stock",
  "Weight value (grams)",
  "Weight unit for display",
  "Requires shipping",
  "Fulfillment service",
  "Product image URL",
  "Image position",
  "Image alt text",
  "Variant image URL",
  "Gift card",
  "SEO title",
  "SEO description",
  "Color (product.metafields.shopify.color-pattern)",
  "Google Shopping / Google product category",
  "Google Shopping / Gender",
  "Google Shopping / Age group",
  "Google Shopping / Manufacturer part number (MPN)",
  "Google Shopping / Ad group name",
  "Google Shopping / Ads labels",
  "Google Shopping / Condition",
  "Google Shopping / Custom product",
  "Google Shopping / Custom label 0",
  "Google Shopping / Custom label 1",
  "Google Shopping / Custom label 2",
  "Google Shopping / Custom label 3",
  "Google Shopping / Custom label 4",
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
  "Option1 Linked To"?: string;
  "Option2 name"?: string;
  "Option2 value"?: string;
  "Option2 Linked To"?: string;
  "Option3 name"?: string;
  "Option3 value"?: string;
  "Option3 Linked To"?: string;
  Price?: string;
  "Compare-at price"?: string;
  "Cost per item"?: string;
  "Charge tax"?: string;
  "Tax code"?: string;
  "Unit price total measure"?: string;
  "Unit price total measure unit"?: string;
  "Unit price base measure"?: string;
  "Unit price base measure unit"?: string;
  "Inventory tracker"?: string;
  "Inventory quantity"?: string;
  "Continue selling when out of stock"?: string;
  "Weight value (grams)"?: string;
  "Weight unit for display"?: string;
  "Requires shipping"?: string;
  "Fulfillment service"?: string;
  "Product image URL"?: string;
  "Image position"?: string;
  "Image alt text"?: string;
  "Variant image URL"?: string;
  "Gift card"?: string;
  "SEO title"?: string;
  "SEO description"?: string;
  "Color (product.metafields.shopify.color-pattern)"?: string;
  "Google Shopping / Google product category"?: string;
  "Google Shopping / Gender"?: string;
  "Google Shopping / Age group"?: string;
  "Google Shopping / Manufacturer part number (MPN)"?: string;
  "Google Shopping / Ad group name"?: string;
  "Google Shopping / Ads labels"?: string;
  "Google Shopping / Condition"?: string;
  "Google Shopping / Custom product"?: string;
  "Google Shopping / Custom label 0"?: string;
  "Google Shopping / Custom label 1"?: string;
  "Google Shopping / Custom label 2"?: string;
  "Google Shopping / Custom label 3"?: string;
  "Google Shopping / Custom label 4"?: string;
}

function buildProductRows(product: NormalizedProduct, activeFields: Set<string>, categoryMap?: Record<string, string>): CsvRow[] {
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
        row["Product category"] = categoryMap?.[product.id] ?? undefined;
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
      if (product.weightGrams != null) {
        row["Weight value (grams)"] = String(product.weightGrams);
        row["Weight unit for display"] = "g";
      }
      row["Requires shipping"] = "TRUE";
      row["Fulfillment service"] = "manual";

      rows.push(row);
    });
  } else {
    const row: CsvRow = { "URL handle": handle };
    if (include("title")) row.Title = product.title || product.name;
    if (include("description")) row.Description = product.description ?? undefined;
    if (include("tags")) row.Tags = product.tags?.join(", ") ?? undefined;
    row.Vendor = product.vendor ?? "Beautifly";
    row.Type = product.productType ?? undefined;
    row["Product category"] = categoryMap?.[product.id] ?? undefined;
    row["Gift card"] = "FALSE";
    row.SKU = product.sku;
    row.Barcode = product.barcode ?? undefined;
    if (include("price")) row.Price = product.price != null ? String(product.price) : undefined;
    if (include("compareAtPrice")) row["Compare-at price"] = product.compareAtPrice != null ? String(product.compareAtPrice) : undefined;
    row["Charge tax"] = "TRUE";
    row["Inventory tracker"] = "shopify";
    row["Inventory quantity"] = String(product.inventoryQty ?? 0);
    row["Continue selling when out of stock"] = "DENY";
    if (product.weightGrams != null) {
      row["Weight value (grams)"] = String(product.weightGrams);
      row["Weight unit for display"] = "g";
    }
    row["Requires shipping"] = "TRUE";
    row["Fulfillment service"] = "manual";
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

export function buildCsvPayload(products: NormalizedProduct[], fieldKeys?: Set<string>, categoryMap?: Record<string, string>): string {
  const activeFields: Set<string> =
    fieldKeys && fieldKeys.size > 0
      ? new Set([...fieldKeys, ...REQUIRED_FIELDS])
      : new Set(FIELD_MAP.map((f) => String(f.pimKey)));

  const lines: string[] = [rowToLine(CSV_HEADERS)];

  for (const product of products) {
    const rows = buildProductRows(product, activeFields, categoryMap);
    for (const row of rows) {
      lines.push(rowToLine(CSV_HEADERS.map((h) => (row as Record<string, string | undefined>)[h])));
    }
  }

  return lines.join("\n");
}
