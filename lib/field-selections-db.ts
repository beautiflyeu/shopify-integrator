import { db } from "./db";

interface DbRow {
  field_key: string;
  selected: number;
}

export function getFieldSelections(pimId: string): Record<string, boolean> {
  const rows = db
    .prepare("SELECT field_key, selected FROM field_selections WHERE pim_id = ?")
    .all(pimId) as DbRow[];
  return Object.fromEntries(rows.map((r) => [r.field_key, r.selected === 1]));
}

export function setFieldSelections(pimId: string, selections: Record<string, boolean>): void {
  const upsert = db.prepare(
    "INSERT OR REPLACE INTO field_selections (pim_id, field_key, selected) VALUES (?, ?, ?)"
  );
  db.transaction(() => {
    for (const [key, selected] of Object.entries(selections)) {
      upsert.run(pimId, key, selected ? 1 : 0);
    }
  })();
}
