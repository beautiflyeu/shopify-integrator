import { NextResponse } from "next/server";
import { readExportedProducts, appendExportedProducts, type ExportEntry } from "@/lib/exported-products-db";

export async function GET() {
  return NextResponse.json({ exports: readExportedProducts() });
}

export async function POST(request: Request) {
  let body: { entries?: ExportEntry[] };
  try {
    body = await request.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }
  if (!Array.isArray(body.entries) || body.entries.length === 0) {
    return new Response("entries required", { status: 400 });
  }
  appendExportedProducts(body.entries);
  return new Response(null, { status: 204 });
}
