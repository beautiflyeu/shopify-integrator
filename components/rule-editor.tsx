"use client";

import { useState } from "react";
import { CategorySelector } from "@/components/category-selector";
import type { CategoryRule } from "@/config/category-rules";
import { cn } from "@/lib/utils";

interface RuleEditorProps {
  initial?: Partial<CategoryRule>;
  onSave: (rule: CategoryRule) => void;
  onCancel: () => void;
}

export function RuleEditor({ initial, onSave, onCancel }: RuleEditorProps) {
  const [keywordInput, setKeywordInput] = useState(initial?.keywords?.join(", ") ?? "");
  const [englishFullName, setEnglishFullName] = useState<string | null>(initial?.englishFullName ?? null);

  const keywords = keywordInput
    .split(",")
    .map((k) => k.trim().toLowerCase())
    .filter(Boolean);

  const isValid = keywords.length > 0 && !!englishFullName;

  return (
    <div className="rounded-md border border-border bg-muted/30 p-4 space-y-3">
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">Słowa kluczowe (po przecinku)</label>
        <input
          type="text"
          value={keywordInput}
          onChange={(e) => setKeywordInput(e.target.value)}
          placeholder="np. masażer, massage, cellulite"
          className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-primary"
        />
        {keywords.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {keywords.map((kw) => (
              <span key={kw} className="inline-block rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                {kw}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">Kategoria Shopify</label>
        <CategorySelector value={englishFullName} onChange={setEnglishFullName} />
      </div>

      <div className="flex items-center justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted transition-colors"
        >
          Anuluj
        </button>
        <button
          type="button"
          onClick={() => isValid && onSave({ keywords, englishFullName: englishFullName! })}
          disabled={!isValid}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            isValid
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
        >
          Zapisz
        </button>
      </div>
    </div>
  );
}
