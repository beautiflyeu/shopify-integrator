"use client";

import { useEffect } from "react";
import { useCategoryStore } from "@/stores/category";
import { suggestTopCategories, suggestCategory } from "@/lib/suggest-category";
import { CategorySelector } from "@/components/category-selector";

interface CategoryDiffRowProps {
  productId: string;
  productName: string;
  productModel?: string | null;
  allCategories: { id: string; fullName: string }[];
}

export function CategoryDiffRow({ productId, productName, productModel, allCategories }: CategoryDiffRowProps) {
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
    <tr className="border-b border-border bg-blue-50/40 text-sm">
      <td className="px-4 py-2">
        <span className="font-medium text-foreground">Product category</span>
        <span className="ml-2 inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium bg-blue-100 text-blue-700">
          Shopify
        </span>
      </td>
      <td className="px-4 py-2 min-w-[260px]">
        <CategorySelector
          value={value}
          onChange={(v) => (v ? setCategory(productId, v) : clearCategory(productId))}
          suggestions={suggestions}
          allCategories={allCategories}
        />
      </td>
      <td className="px-4 py-2 text-muted-foreground">—</td>
      <td className="px-4 py-2">
        <span className="text-xs font-medium text-blue-600">Nowe</span>
      </td>
      <td className="px-4 py-2" />
    </tr>
  );
}
