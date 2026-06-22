export const dynamic = "force-dynamic";

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

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return Response.json([]);

  const query = `{
    taxonomy {
      categories(first: 50, search: "${q.replace(/"/g, "")}") {
        nodes { id fullName }
      }
    }
  }`;

  const data = await gql(query);
  const nodes: { id: string; fullName: string }[] = data?.data?.taxonomy?.categories?.nodes ?? [];
  return Response.json(nodes);
}
