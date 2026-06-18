export const revalidate = 3600;

const QUERY = `{
  taxonomy {
    categories(first: 250) {
      nodes {
        id
        fullName
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
}`;

const QUERY_AFTER = (cursor: string) => `{
  taxonomy {
    categories(first: 250, after: "${cursor}") {
      nodes {
        id
        fullName
      }
      pageInfo {
        hasNextPage
        endCursor
      }
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

export async function GET() {
  const categories: { id: string; fullName: string }[] = [];

  let data = await gql(QUERY);
  let page = data?.data?.taxonomy?.categories;
  categories.push(...(page?.nodes ?? []));

  while (page?.pageInfo?.hasNextPage) {
    data = await gql(QUERY_AFTER(page.pageInfo.endCursor));
    page = data?.data?.taxonomy?.categories;
    categories.push(...(page?.nodes ?? []));
  }

  categories.sort((a, b) => a.fullName.localeCompare(b.fullName));

  return Response.json(categories);
}
