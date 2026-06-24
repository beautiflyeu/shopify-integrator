const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION ?? "2025-01";

function getEndpoint(): string {
  const domain = process.env.SHOP_DOMAIN;
  if (!domain) throw new Error("SHOP_DOMAIN is not set");
  return `https://${domain}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`;
}

function getHeaders(): HeadersInit {
  const token = process.env.SHOPIFY_ACCESS_TOKEN;
  if (!token) throw new Error("SHOPIFY_ACCESS_TOKEN is not set");
  return {
    "Content-Type": "application/json",
    "X-Shopify-Access-Token": token,
  };
}

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
  extensions?: {
    cost?: {
      requestedQueryCost: number;
      actualQueryCost: number;
      throttleStatus: {
        maximumAvailable: number;
        currentlyAvailable: number;
        restoreRate: number;
      };
    };
  };
}

async function shopifyGraphQL<T>(
  query: string,
  variables?: Record<string, unknown>,
  attempt = 0
): Promise<T> {
  const res = await fetch(getEndpoint(), {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ query, variables }),
  });

  if (res.status === 429) {
    if (attempt >= 3) throw new Error("Shopify rate limit exceeded after 3 retries");
    const retryAfter = Number(res.headers.get("Retry-After") ?? 2);
    await new Promise((r) => setTimeout(r, retryAfter * 1000));
    return shopifyGraphQL<T>(query, variables, attempt + 1);
  }

  if (!res.ok) throw new Error(`Shopify API ${res.status}: ${res.statusText}`);

  const json = (await res.json()) as GraphQLResponse<T>;
  if (json.errors?.length) throw new Error(json.errors[0].message);
  if (!json.data) throw new Error("Empty Shopify response");
  return json.data;
}

export interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  descriptionHtml: string;
  vendor: string;
  productType: string;
  tags: string[];
  status: "ACTIVE" | "DRAFT" | "ARCHIVED";
  updatedAt: string;
  seo: { title: string | null; description: string | null };
  priceRangeV2: {
    minVariantPrice: { amount: string; currencyCode: string };
    maxVariantPrice: { amount: string; currencyCode: string };
  };
  images: {
    edges: Array<{ node: { id: string; url: string; altText: string | null; position: number } }>;
  };
  variants: {
    edges: Array<{
      node: {
        id: string;
        sku: string;
        barcode: string | null;
        price: string;
        compareAtPrice: string | null;
        selectedOptions: Array<{ name: string; value: string }>;
        image: { url: string } | null;
        weight: number;
        weightUnit: string;
      };
    }>;
  };
}

const PRODUCTS_QUERY = `
  query GetProducts($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      pageInfo { hasNextPage endCursor }
      edges {
        node {
          id title handle descriptionHtml vendor productType tags status updatedAt
          seo { title description }
          priceRangeV2 {
            minVariantPrice { amount currencyCode }
            maxVariantPrice { amount currencyCode }
          }
          images(first: 20) {
            edges { node { id url altText position } }
          }
          variants(first: 100) {
            edges {
              node {
                id sku price compareAtPrice weight weightUnit barcode
                selectedOptions { name value }
                image { url }
              }
            }
          }
        }
      }
    }
  }
`;

interface ProductsQueryResult {
  products: {
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
    edges: Array<{ node: ShopifyProduct }>;
  };
}

export async function fetchAllShopifyProducts(): Promise<ShopifyProduct[]> {
  const all: ShopifyProduct[] = [];
  let cursor: string | null = null;
  let hasNext = true;

  while (hasNext) {
    const data: ProductsQueryResult = await shopifyGraphQL<ProductsQueryResult>(PRODUCTS_QUERY, {
      first: 50,
      after: cursor,
    });
    all.push(...data.products.edges.map((e: { node: ShopifyProduct }) => e.node));
    hasNext = data.products.pageInfo.hasNextPage;
    cursor = data.products.pageInfo.endCursor;
  }

  return all;
}

const SINGLE_PRODUCT_QUERY = `
  query GetProduct($id: ID!) {
    product(id: $id) {
      id title handle descriptionHtml vendor productType tags status updatedAt
      seo { title description }
      priceRangeV2 {
        minVariantPrice { amount currencyCode }
        maxVariantPrice { amount currencyCode }
      }
      images(first: 20) {
        edges { node { id url altText position } }
      }
      variants(first: 100) {
        edges {
          node {
            id sku price compareAtPrice weight weightUnit
            selectedOptions { name value }
            image { url }
          }
        }
      }
    }
  }
`;

export async function fetchShopifyProduct(gid: string): Promise<ShopifyProduct> {
  const data = await shopifyGraphQL<{ product: ShopifyProduct }>(SINGLE_PRODUCT_QUERY, {
    id: gid,
  });
  return data.product;
}

export interface ProductImageInput {
  src: string;
  altText?: string;
}

export interface ProductVariantInput {
  price?: string;
  sku?: string;
  barcode?: string;
  weight?: number;
  weightUnit?: string;
  options?: string[];
}

export interface ProductInput {
  title?: string;
  descriptionHtml?: string;
  vendor?: string;
  productType?: string;
  productCategory?: { productTaxonomyNodeId: string };
  tags?: string[];
  status?: "ACTIVE" | "DRAFT" | "ARCHIVED";
  seo?: { title?: string; description?: string };
  images?: ProductImageInput[];
  variants?: ProductVariantInput[];
}

const PRODUCT_CREATE_MUTATION = `
  mutation productCreate($input: ProductInput!) {
    productCreate(input: $input) {
      product { id }
      userErrors { field message }
    }
  }
`;

const PRODUCT_UPDATE_MUTATION = `
  mutation productUpdate($input: ProductInput!) {
    productUpdate(input: $input) {
      product { id }
      userErrors { field message }
    }
  }
`;

interface ProductMutationResult {
  product: { id: string } | null;
  userErrors: Array<{ field: string[]; message: string }>;
}

export async function shopifyProductCreate(input: ProductInput): Promise<string> {
  const data = await shopifyGraphQL<{ productCreate: ProductMutationResult }>(
    PRODUCT_CREATE_MUTATION,
    { input }
  );
  const result = data.productCreate;
  if (result.userErrors.length > 0) {
    throw new Error(result.userErrors.map((e) => e.message).join("; "));
  }
  if (!result.product) throw new Error("productCreate returned no product");
  return result.product.id;
}

export async function shopifyProductUpdate(gid: string, input: ProductInput): Promise<string> {
  const data = await shopifyGraphQL<{ productUpdate: ProductMutationResult }>(
    PRODUCT_UPDATE_MUTATION,
    { input: { ...input, id: gid } }
  );
  const result = data.productUpdate;
  if (result.userErrors.length > 0) {
    throw new Error(result.userErrors.map((e) => e.message).join("; "));
  }
  if (!result.product) throw new Error("productUpdate returned no product");
  return result.product.id;
}

const COLLECTION_BY_TITLE_QUERY = `
  query CollectionByTitle($query: String!) {
    collections(first: 1, query: $query) {
      edges { node { id } }
    }
  }
`;

const COLLECTION_CREATE_MUTATION = `
  mutation collectionCreate($input: CollectionInput!) {
    collectionCreate(input: $input) {
      collection { id }
      userErrors { field message }
    }
  }
`;

const COLLECTION_ADD_PRODUCTS_MUTATION = `
  mutation collectionAddProducts($id: ID!, $productIds: [ID!]!) {
    collectionAddProducts(id: $id, productIds: $productIds) {
      collection { id }
      userErrors { field message }
    }
  }
`;

export async function fetchCollectionByTitle(title: string): Promise<{ id: string } | null> {
  const data = await shopifyGraphQL<{
    collections: { edges: Array<{ node: { id: string } }> };
  }>(COLLECTION_BY_TITLE_QUERY, { query: `title:'${title}'` });
  return data.collections.edges[0]?.node ?? null;
}

export async function createManualCollection(title: string): Promise<{ id: string }> {
  const data = await shopifyGraphQL<{
    collectionCreate: {
      collection: { id: string } | null;
      userErrors: Array<{ field: string[]; message: string }>;
    };
  }>(COLLECTION_CREATE_MUTATION, { input: { title } });
  const result = data.collectionCreate;
  if (result.userErrors.length > 0) {
    throw new Error(result.userErrors.map((e) => e.message).join("; "));
  }
  if (!result.collection) throw new Error("collectionCreate returned no collection");
  return result.collection;
}

export async function addProductToCollection(collectionId: string, productId: string): Promise<void> {
  const data = await shopifyGraphQL<{
    collectionAddProducts: {
      userErrors: Array<{ field: string[]; message: string }>;
    };
  }>(COLLECTION_ADD_PRODUCTS_MUTATION, { id: collectionId, productIds: [productId] });
  const errors = data.collectionAddProducts.userErrors;
  if (errors.length > 0) {
    throw new Error(errors.map((e) => e.message).join("; "));
  }
}
