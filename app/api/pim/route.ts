import { NextResponse } from "next/server";
import { fetchAllProducts } from "@/services/beautifly";

export async function GET() {
  try {
    const products = await fetchAllProducts("pl");
    return NextResponse.json({ data: products });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
