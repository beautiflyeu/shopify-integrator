"use client";

import { useCategoryStore } from "@/stores/category";
import { CategorySelector } from "@/components/category-selector";
import { CategoryRuleBadges } from "@/components/category-rule-badges";

interface CategoryDiffRowProps {
  productId: string;
  productName: string;
  productModel?: string | null;
}

export function CategoryDiffRow({ productId, productName, productModel }: CategoryDiffRowProps) {
  const { categoryMap, setCategory, clearCategory } = useCategoryStore();

  const value = categoryMap[productId] ?? null;

  return (
    <tr className="border-b border-border bg-blue-50/40 text-sm">
      <td className="px-4 py-2">
        <span className="font-medium text-foreground">Product category</span>
        <span className="ml-2 inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium bg-blue-100 text-blue-700">
          Shopify
        </span>
      </td>
      <td className="px-4 py-2 min-w-[500px]">
        <CategorySelector
          value={value}
          onChange={(v) => (v ? setCategory(productId, v) : clearCategory(productId))}
        />
        <CategoryRuleBadges onSelect={(v) => setCategory(productId, v)} selectedEnglish={value} />
      </td>
      <td className="px-4 py-2 text-muted-foreground">—</td>
      <td className="px-4 py-2">
        <span className="text-xs font-medium text-blue-600">Nowe</span>
      </td>
      <td className="px-4 py-2" />
    </tr>
  );
}
