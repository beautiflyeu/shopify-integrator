"use client";

import { useEffect, useMemo } from "react";
import { useCategoryStore } from "@/stores/category";
import { useTaxonomyStore } from "@/stores/shopify-taxonomy";
import { suggestTopCategories, suggestCategory } from "@/lib/suggest-category";
import { CategorySelector } from "@/components/category-selector";

interface ProductCategorySelectorProps {
  productId: string;
  productName: string;
  productModel?: string | null;
}

export function ProductCategorySelector({
  productId,
  productName,
  productModel,
}: ProductCategorySelectorProps) {
  const { categoryMap, setCategory, clearCategory } = useCategoryStore();
  const { fullNameSet, status, load } = useTaxonomyStore();

  const value = categoryMap[productId] ?? null;

  const rawSuggestions = useMemo(
    () => suggestTopCategories(productName, productModel, 3),
    [productName, productModel]
  );

  // Filter suggestions to only valid Shopify taxonomy entries.
  const suggestions = useMemo(
    () =>
      status === "done"
        ? rawSuggestions.filter((s) => fullNameSet.has(s))
        : rawSuggestions,
    [rawSuggestions, fullNameSet, status]
  );

  // Load taxonomy once for validation (store guards against duplicate calls)
  useEffect(() => {
    load();
  }, [load]);

  // Auto-apply top suggestion only when confirmed valid in the taxonomy
  useEffect(() => {
    if (categoryMap[productId]) return;
    if (status !== "done") return;
    const top = suggestCategory(productName, productModel);
    if (top && fullNameSet.has(top)) setCategory(productId, top);
  }, [productId, status, fullNameSet, categoryMap, productName, productModel, setCategory]);

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">Kategoria Shopify</label>
      <CategorySelector
        value={value}
        onChange={(v) => (v ? setCategory(productId, v) : clearCategory(productId))}
        suggestions={suggestions}
      />
    </div>
  );
}
