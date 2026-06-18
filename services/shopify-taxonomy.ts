const QUERY = (cursor?: string) => `{
  taxonomy {
    categories(first: 250${cursor ? `, after: "${cursor}"` : ""}) {
      nodes { id fullName }
      pageInfo { hasNextPage endCursor }
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
      next: { revalidate: 3600 },
    }
  );
  return res.json();
}

export async function fetchShopifyCategories(): Promise<{ id: string; fullName: string }[]> {
  const all: { id: string; fullName: string }[] = [];
  let cursor: string | undefined;

  while (true) {
    const data = await gql(QUERY(cursor));
    const page = data?.data?.taxonomy?.categories;
    if (!page) break;
    all.push(...(page.nodes ?? []));
    if (!page.pageInfo?.hasNextPage) break;
    cursor = page.pageInfo.endCursor;
  }

  return all.sort((a, b) => a.fullName.localeCompare(b.fullName));
}
