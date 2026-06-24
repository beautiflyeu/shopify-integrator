"use client";

import { useEffect, useMemo } from "react";
import { AlertCircle } from "lucide-react";
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
  const autoSuggest = useCategoryRulesStore((s) => s.autoSuggest);

  const value = categoryMap[productId] ?? null;

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!autoSuggest) return;
    if (categoryMap[productId]) return;
    if (status !== "done") return;
    const top = suggestCategory(productName, productModel, rules);
    if (top && fullNameSet.has(top)) setCategory(productId, top);
  }, [productId, status, fullNameSet, categoryMap, productName, productModel, rules, setCategory, autoSuggest]);

  const noSuggestion = useMemo(() => {
    if (!autoSuggest) return false;
    if (status !== "done") return false;
    const top = suggestCategory(productName, productModel, rules);
    return !top || !fullNameSet.has(top);
  }, [autoSuggest, status, productName, productModel, rules, fullNameSet]);

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">Kategoria Shopify</label>
        {noSuggestion && !value && (
          <span className="flex items-center gap-1 text-[11px] text-orange-500">
            <AlertCircle className="h-3 w-3" />
            Brak sugestii
          </span>
        )}
      </div>
      <CategorySelector
        value={value}
        onChange={(v) => (v ? setCategory(productId, v) : clearCategory(productId))}
      />
      <CategoryRuleBadges onSelect={(v) => setCategory(productId, v)} selectedEnglish={value} />
    </div>
  );
}
