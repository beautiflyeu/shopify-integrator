const BASE_URL = "https://devbeautifly.host486049.xce.pl";

function getHeaders(): HeadersInit {
  const apiKey = process.env.BEAUTIFLY_API_KEY;
  if (!apiKey) throw new Error("BEAUTIFLY_API_KEY is not set");
  return {
    "X-API-Key": apiKey,
    Accept: "application/json",
  };
}

export interface BeautiflyProductListItem {
  id: number;
  sku: string;
  model?: string | null;
  name: string;
  ean?: string | null;
}

export interface BeautiflyProduct {
  id: number;
  sku: string;
  ean?: string | null;
  model?: string | null;
  brand?: string | null;
  name: string;
  updated_at?: string;
  stock?: {
    available?: number;
    status?: string;
  };
  main_details?: {
    title?: string;
    subtitle?: string;
    brand?: string;
    weight_net?: number;
    weight_gross?: number;
    height?: number;
    width?: number;
    length?: number;
    [key: string]: unknown;
  };
  description_data?: {
    description?: string;
    short_descriptions?: string[];
    usp?: string[];
    [key: string]: unknown;
  };
  media?: {
    images?: Array<{
      url: string;
      alt?: string;
      position?: number;
      type?: string;
    }>;
    external_sources?: Array<{
      id?: string;
      type?: string;
      source?: string;
      name?: string;
      path?: string;
      url?: string;
    }>;
  };
  categories?: Array<{ id: number; name: string; path?: string }>;
  families?: Array<{ id: number; name: string }>;
  attributes?: Array<{ name: string; value: string; code?: string }>;
  parameters?: Array<{ name: string; value: string; unit?: string }>;
  price?: {
    pln?: { net?: number; gross?: number };
    eur?: { net?: number; gross?: number };
  };
  [key: string]: unknown;
}

export interface BeautiflyListResponse {
  data: BeautiflyProductListItem[];
  meta?: {
    total?: number;
    total_count?: number;
    page?: number;
    per_page?: number;
    current_page?: number;
    last_page?: number;
  };
}

export interface BeautiflyProductResponse {
  data: BeautiflyProduct;
}

export async function fetchAllProducts(
  lang: "pl" | "en" | "de" = "pl"
): Promise<BeautiflyProductListItem[]> {
  const all: BeautiflyProductListItem[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const params = new URLSearchParams({ fields: "id,sku,model,name,ean", lang, limit: "500", page: String(page) });
    const res = await fetch(`${BASE_URL}/api/v1/products?${params}`, {
      headers: getHeaders(),
      next: { revalidate: 300 },
    });
    if (!res.ok) throw new Error(`Beautifly API ${res.status}: ${res.statusText}`);
    const json = (await res.json()) as BeautiflyListResponse;

    const items = Array.isArray(json) ? (json as BeautiflyProductListItem[]) : (json.data ?? []);
    all.push(...items);

    const lastPage = json.meta?.last_page ?? 1;
    const currentPage = json.meta?.current_page ?? page;
    hasMore = currentPage < lastPage;
    page++;
  }

  return all;
}

export async function fetchProduct(
  id: number,
  opts: {
    lang?: "pl" | "en" | "de";
    include?: string[];
  } = {}
): Promise<BeautiflyProduct> {
  const { lang = "pl", include = [] } = opts;
  const params = new URLSearchParams({ lang });
  if (include.length) params.set("include", include.join(","));

  const res = await fetch(`${BASE_URL}/api/v1/products/${id}?${params}`, {
    headers: getHeaders(),
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`Beautifly API ${res.status}: ${res.statusText}`);
  const json = (await res.json()) as BeautiflyProductResponse;
  return json.data;
}

export function searchProducts(
  list: BeautiflyProductListItem[],
  query: string
): BeautiflyProductListItem[] {
  const term = query.toLowerCase();
  return list.filter(
    (p) =>
      String(p.name ?? "").toLowerCase().includes(term) ||
      String(p.sku ?? "").toLowerCase().includes(term) ||
      String(p.model ?? "").toLowerCase().includes(term)
  );
}

export const ALL_INCLUDES = [
  "main_details",
  "description_data",
  "media",
  "categories",
  "families",
  "attributes",
  "parameters",
  "price",
] as const;
