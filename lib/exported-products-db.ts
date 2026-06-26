import { db } from "./db";

export interface ExportEntry {
  pimId: string;
  method: "csv" | "api";
  shopifyId?: string;
  exportedAt: string;
}

interface DbRow {
  pim_id: string;
  method: string;
  shopify_id: string | null;
  exported_at: string;
}

function toEntry(row: DbRow): ExportEntry {
  return {
    pimId: row.pim_id,
    method: row.method as "csv" | "api",
    shopifyId: row.shopify_id ?? undefined,
    exportedAt: row.exported_at,
  };
}

export function readExportedProducts(): ExportEntry[] {
  const rows = db
    .prepare("SELECT * FROM exported_products ORDER BY exported_at DESC")
    .all() as DbRow[];
  return rows.map(toEntry);
}

export function appendExportedProducts(entries: ExportEntry[]): void {
  const insert = db.prepare(
    "INSERT OR REPLACE INTO exported_products (pim_id, method, shopify_id, exported_at) VALUES (?, ?, ?, ?)"
  );
  db.transaction(() => {
    for (const e of entries) {
      insert.run(e.pimId, e.method, e.shopifyId ?? null, e.exportedAt);
    }
  })();
}
