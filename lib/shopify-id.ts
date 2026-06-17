const GID_PREFIX = "gid://shopify/Product/";

export function extractId(gid: string): string {
  if (gid.startsWith(GID_PREFIX)) return gid.slice(GID_PREFIX.length);
  return gid;
}

export function buildGid(numericId: string | number): string {
  return `${GID_PREFIX}${numericId}`;
}

export function buildVariantGid(numericId: string | number): string {
  return `gid://shopify/ProductVariant/${numericId}`;
}
