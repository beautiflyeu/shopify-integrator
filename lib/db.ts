import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

type DbInstance = InstanceType<typeof Database>;

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "app.db");

function openDatabase(): DbInstance {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const db = new Database(DB_PATH);

  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = NORMAL;

    CREATE TABLE IF NOT EXISTS exported_products (
      pim_id TEXT NOT NULL,
      method TEXT NOT NULL,
      shopify_id TEXT,
      exported_at TEXT NOT NULL,
      PRIMARY KEY (pim_id, method)
    );

    CREATE TABLE IF NOT EXISTS field_selections (
      pim_id TEXT NOT NULL,
      field_key TEXT NOT NULL,
      selected INTEGER NOT NULL DEFAULT 1,
      PRIMARY KEY (pim_id, field_key)
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  migrateFromJson(db);

  return db;
}

function migrateFromJson(db: DbInstance): void {
  const exportedPath = path.join(DATA_DIR, "exported-products.json");
  if (fs.existsSync(exportedPath)) {
    const count = (db.prepare("SELECT COUNT(*) as n FROM exported_products").get() as { n: number }).n;
    if (count === 0) {
      try {
        const raw = fs.readFileSync(exportedPath, "utf-8");
        const data: { exports?: Array<{ pimId: string; method: string; shopifyId?: string; exportedAt: string }> } = JSON.parse(raw);
        if (Array.isArray(data.exports) && data.exports.length > 0) {
          const insert = db.prepare(
            "INSERT OR REPLACE INTO exported_products (pim_id, method, shopify_id, exported_at) VALUES (?, ?, ?, ?)"
          );
          db.transaction(() => {
            for (const e of data.exports!) {
              insert.run(e.pimId, e.method, e.shopifyId ?? null, e.exportedAt);
            }
          })();
          fs.renameSync(exportedPath, exportedPath + ".migrated");
        }
      } catch {
        // non-fatal
      }
    }
  }

  const rulesPath = path.join(DATA_DIR, "category-rules.json");
  if (fs.existsSync(rulesPath)) {
    const existing = db.prepare("SELECT value FROM settings WHERE key = ?").get("category-rules");
    if (!existing) {
      try {
        const raw = fs.readFileSync(rulesPath, "utf-8");
        db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)").run("category-rules", raw);
        fs.renameSync(rulesPath, rulesPath + ".migrated");
      } catch {
        // non-fatal
      }
    }
  }
}

const globalForDb = global as typeof globalThis & { __sIntegratorDb?: DbInstance };

if (!globalForDb.__sIntegratorDb) {
  globalForDb.__sIntegratorDb = openDatabase();
}

export const db = globalForDb.__sIntegratorDb;
