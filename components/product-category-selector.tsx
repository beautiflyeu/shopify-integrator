"use client";

import { useEffect } from "react";
import { useCategoryStore } from "@/stores/category";
import { suggestTopCategories, suggestCategory } from "@/lib/suggest-category";
import { CategorySelector } from "@/components/category-selector";

interface ProductCategorySelectorProps {
  productId: string;
  productName: string;
  productModel?: string | null;
  allCategories: { id: string; fullName: string }[];
}

export function ProductCategorySelector({
  productId,
  productName,
  productModel,
  allCategories,
}: ProductCategorySelectorProps) {
  const { categoryMap, setCategory, clearCategory } = useCategoryStore();
  const value = categoryMap[productId] ?? null;
  const suggestions = suggestTopCategories(productName, productModel, 3);

  useEffect(() => {
    if (!categoryMap[productId]) {
      const top = suggestCategory(productName, productModel);
      if (top) setCategory(productId, top);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">Kategoria Shopify</label>
      <CategorySelector
        value={value}
        onChange={(v) => (v ? setCategory(productId, v) : clearCategory(productId))}
        suggestions={suggestions}
        allCategories={allCategories}
      />
    </div>
  );
}
