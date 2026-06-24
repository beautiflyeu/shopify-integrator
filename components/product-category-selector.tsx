"use client";

import { useEffect } from "react";
import { useCategoryStore } from "@/stores/category";
import { useTaxonomyStore } from "@/stores/shopify-taxonomy";
import { useCategoryRulesStore } from "@/stores/category-rules";
import { suggestCategory } from "@/lib/suggest-category";
import { CategorySelector } from "@/components/category-selector";
import { CategoryRuleBadges } from "@/components/category-rule-badges";

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
  const rules = useCategoryRulesStore((s) => s.rules);

  const value = categoryMap[productId] ?? null;

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (categoryMap[productId]) return;
    if (status !== "done") return;
    const top = suggestCategory(productName, productModel, rules);
    if (top && fullNameSet.has(top)) setCategory(productId, top);
  }, [productId, status, fullNameSet, categoryMap, productName, productModel, rules, setCategory]);

  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">Kategoria Shopify</label>
      <CategorySelector
        value={value}
        onChange={(v) => (v ? setCategory(productId, v) : clearCategory(productId))}
      />
      <CategoryRuleBadges onSelect={(v) => setCategory(productId, v)} selectedEnglish={value} />
    </div>
  );
}
