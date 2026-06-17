import { NextResponse } from "next/server";
import { fetchAllShopifyProducts } from "@/services/shopify";

export async function GET() {
  try {
    const products = await fetchAllShopifyProducts();
    return NextResponse.json({ data: products });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
