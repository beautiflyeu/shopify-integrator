export const revalidate = 3600;

// Search terms covering the Health & Beauty and Apparel subtrees needed for this store.
// Shopify's taxonomy search matches keywords in fullName, not prefix/path.
const SEARCH_TERMS = [
  "skin care",
  "skin care tool",
  "light therapy",
  "massager",
  "massage relaxation",
  "hair styling tool",
  "hair straightener",
  "hair accessories",
  "hair care",
  "nail care",
  "cosmetic tool",
  "personal care",
  "hair pin",
];

const QUERY_SEARCH = (term: string, cursor?: string) => `{
  taxonomy {
    categories(first: 250, search: "${term}"${cursor ? `, after: "${cursor}"` : ""}) {
      nodes { id fullName }
      pageInfo { hasNextPage endCursor }
    }
  }
}`;

const QUERY_ROOTS = `{
  taxonomy {
    categories(first: 250) {
      nodes { id fullName }
    }
  }
}`;

async function gql(query: string) {
  const res = await fetch(
    `https://${process.env.SHOP_DOMAIN}/admin/api/${process.env.SHOPIFY_API_VERSION}/graphql.json`,
    {
      method: "POST",
      headers: {
        "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    }
  );
  return res.json();
}

async function fetchBySearch(term: string): Promise<{ id: string; fullName: string }[]> {
  const all: { id: string; fullName: string }[] = [];
  let cursor: string | undefined;
  while (true) {
    const data = await gql(QUERY_SEARCH(term, cursor));
    const page = data?.data?.taxonomy?.categories;
    if (!page) break;
    all.push(...(page.nodes ?? []));
    if (!page.pageInfo?.hasNextPage) break;
    cursor = page.pageInfo.endCursor;
  }
  return all;
}

export async function GET() {
  const seen = new Set<string>();
  const all: { id: string; fullName: string }[] = [];

  const add = (items: { id: string; fullName: string }[]) => {
    for (const item of items) {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        all.push(item);
      }
    }
  };

  // Root categories for top-level browsability
  const rootData = await gql(QUERY_ROOTS);
  add(rootData?.data?.taxonomy?.categories?.nodes ?? []);

  // Subcategories via search
  const results = await Promise.all(SEARCH_TERMS.map(fetchBySearch));
  results.forEach(add);

  all.sort((a, b) => a.fullName.localeCompare(b.fullName));

  return Response.json(all);
}
