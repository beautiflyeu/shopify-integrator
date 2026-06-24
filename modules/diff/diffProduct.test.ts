import { describe, it, expect } from "vitest";
import { diffProduct } from "./diffProduct";
import type { NormalizedProduct } from "@/types/product";

const bandTShirt: NormalizedProduct = {
  id: "1",
  sku: "TheBandTShirt-SG",
  name: 'Physical Product "The Band" T-Shirt',
  lang: "pl",
  title: 'Physical Product "The Band" T-Shirt',
  description:
    "Celebrate the timeless legacy of one of rock music's most influential groups with our exclusive The Band Graphic T-Shirt.",
  seoTitle: "Vintage The Band Graphic T-Shirt: Iconic Rock Music Tribute Tee",
  seoDescription:
    "Celebrate the legacy of rock icons with our exclusive The Band Graphic T-Shirt.",
  price: 19.99,
  compareAtPrice: 24.99,
  images: [
    {
      url: "https://burst.shopifycdn.com/photos/forest-hiker.jpg?width=1000",
      alt: "Green t-shirt with The Band graphic",
      position: 1,
    },
  ],
  categories: [],
  families: [],
  tags: ["Unisex", "Clothing", "Men", "Women", "Casual", "Vintage"],
  variants: [],
  attributes: {},
  parameters: {},
  metafields: {},
  updatedAt: null,
};

describe("diffProduct", () => {
  it("marks all relevant fields as 'new' when no Shopify product exists", () => {
    const result = diffProduct(bandTShirt, null);
    expect(result.status).toBe("new");
    expect(result.fields.title).toBe("new");
    expect(result.fields.price).toBe("new");
    expect(result.hash).toHaveLength(16);
  });

  it("returns 'unchanged' when pim and shopify are identical", () => {
    const result = diffProduct(bandTShirt, { ...bandTShirt });
    expect(result.status).toBe("unchanged");
    for (const status of Object.values(result.fields)) {
      expect(status).toBe("unchanged");
    }
  });

  it("flags only 'price' as changed when only price differs", () => {
    const shopifyVersion: NormalizedProduct = { ...bandTShirt, price: 15.0 };
    const result = diffProduct(bandTShirt, shopifyVersion);
    expect(result.status).toBe("changed");
    expect(result.fields.price).toBe("changed");
    expect(result.fields.title).toBe("unchanged");
    expect(result.fields.description).toBe("unchanged");
    expect(result.fields.images).toBe("unchanged");
  });

  it("flags only 'title' as changed when only title differs", () => {
    const shopifyVersion: NormalizedProduct = { ...bandTShirt, title: "Old Title" };
    const result = diffProduct(bandTShirt, shopifyVersion);
    expect(result.status).toBe("changed");
    expect(result.fields.title).toBe("changed");
    expect(result.fields.price).toBe("unchanged");
    expect(result.fields.tags).toBe("unchanged");
  });

  it("produces a stable hash for the same product data", () => {
    const r1 = diffProduct(bandTShirt, null);
    const r2 = diffProduct({ ...bandTShirt }, null);
    expect(r1.hash).toBe(r2.hash);
  });

  it("produces a different hash when price changes", () => {
    const modified: NormalizedProduct = { ...bandTShirt, price: 9.99 };
    const r1 = diffProduct(bandTShirt, null);
    const r2 = diffProduct(modified, null);
    expect(r1.hash).not.toBe(r2.hash);
  });
});
