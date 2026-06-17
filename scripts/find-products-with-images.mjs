// Run: node scripts/find-products-with-images.mjs
const BASE_URL = "https://devbeautifly.host486049.xce.pl";
const API_KEY = "29u8b7h1q2vuLQ0lTu5F";
const CONCURRENCY = 10;

const headers = { "X-API-Key": API_KEY, Accept: "application/json" };

async function fetchAllIds() {
  const all = [];
  let page = 1;
  while (true) {
    const url = `${BASE_URL}/api/v1/products?fields=id,sku,name&lang=pl&page=${page}`;
    const res = await fetch(url, { headers });
    const json = await res.json();
    const items = Array.isArray(json) ? json : (json.data ?? []);
    if (items.length === 0) break;
    all.push(...items);
    const total = json.meta?.total ?? json.meta?.total_count ?? null;
    if (total !== null && all.length >= total) break;
    page++;
  }
  return all;
}

async function fetchMedia(product) {
  const url = `${BASE_URL}/api/v1/products/${product.id}?include=media&lang=pl`;
  const res = await fetch(url, { headers });
  const json = await res.json();
  const images = json.data?.media?.images ?? [];
  return { ...product, imageCount: images.length };
}

async function runBatch(items) {
  return Promise.all(items.map(fetchMedia));
}

(async () => {
  console.log("Fetching product list...");
  const all = await fetchAllIds();
  console.log(`Found ${all.length} products. Checking media (${CONCURRENCY} at a time)...\n`);

  const withImages = [];
  for (let i = 0; i < all.length; i += CONCURRENCY) {
    const batch = all.slice(i, i + CONCURRENCY);
    const results = await runBatch(batch);
    for (const p of results) {
      if (p.imageCount > 0) withImages.push(p);
    }
    process.stdout.write(`\r  ${Math.min(i + CONCURRENCY, all.length)}/${all.length} checked...`);
  }

  console.log(`\n\nProducts WITH images (${withImages.length}):\n`);
  console.log("ID\t\tSKU\t\t\tImages\tName");
  console.log("─".repeat(80));
  for (const p of withImages) {
    console.log(`${p.id}\t\t${p.sku}\t\t${p.imageCount}\t${p.name}`);
  }

  console.log(`\nIDs only (for reference):`);
  console.log(withImages.map(p => p.id).join(", "));
})();
