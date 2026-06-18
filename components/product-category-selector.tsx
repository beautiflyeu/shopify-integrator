"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useCategoryStore } from "@/stores/category";
import { suggestTopCategories, suggestCategory } from "@/lib/suggest-category";
import { CategorySelector } from "@/components/category-selector";

interface SimpleCategory {
  id: string;
  fullName: string;
}

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
  const value = categoryMap[productId] ?? null;
  const suggestions = useMemo(
    () => suggestTopCategories(productName, productModel, 3),
    [productName, productModel]
  );

  const [rawCategories, setRawCategories] = useState<SimpleCategory[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const fetchedRef = useRef(false);

  function loadCategories() {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    setStatus("loading");
    fetch("/api/shopify/categories")
      .then((r) => r.json())
      .then((data: SimpleCategory[]) => {
        setRawCategories(data);
        setStatus("done");
      })
      .catch(() => setStatus("error"));
  }

  const allCategories = useMemo(
    () => rawCategories.map((c) => ({ id: c.id, fullName: c.fullName })),
    [rawCategories]
  );

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
        isLoading={status === "loading"}
        onOpen={loadCategories}
      />
    </div>
  );
}
