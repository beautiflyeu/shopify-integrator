import fs from "fs";
import path from "path";

export interface ExportEntry {
  pimId: string;
  method: "csv" | "api";
  shopifyId?: string;
  exportedAt: string;
}

const DATA_FILE = path.join(process.cwd(), "data", "exported-products.json");

export function readExportedProducts(): ExportEntry[] {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    const data = JSON.parse(raw);
    return Array.isArray(data.exports) ? data.exports : [];
  } catch {
    return [];
  }
}

export function appendExportedProducts(entries: ExportEntry[]): void {
  const existing = readExportedProducts();
  const map = new Map(existing.map((e) => [`${e.pimId}:${e.method}`, e]));
  for (const entry of entries) {
    map.set(`${entry.pimId}:${entry.method}`, entry);
  }
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify({ exports: Array.from(map.values()) }, null, 2), "utf-8");
}
