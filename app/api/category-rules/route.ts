import { db } from "@/lib/db";

export async function GET() {
  const row = db
    .prepare("SELECT value FROM settings WHERE key = ?")
    .get("category-rules") as { value: string } | undefined;
  if (!row) return new Response(null, { status: 404 });
  return new Response(row.value, { headers: { "Content-Type": "application/json" } });
}

export async function PUT(request: Request) {
  const body = await request.text();
  if (!body) return new Response("Empty body", { status: 400 });
  db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)").run("category-rules", body);
  return new Response(null, { status: 204 });
}
