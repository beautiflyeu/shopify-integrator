"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useCategoryRulesStore } from "@/stores/category-rules";
import { cn } from "@/lib/utils";

export function CategoryRulesPanel() {
  const [open, setOpen] = useState(false);
  const rules = useCategoryRulesStore((s) => s.rules);

  return (
    <div className="rounded-md border border-border bg-background">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-2.5 text-sm font-medium hover:bg-muted/50 transition-colors"
      >
        <span>Reguły kategorii <span className="ml-1 text-muted-foreground font-normal">({rules.length})</span></span>
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="border-t border-border overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-2 text-left font-medium text-muted-foreground w-1/3">Słowa kluczowe</th>
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">Kategoria Shopify</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((rule, i) => (
                <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-2 align-top">
                    <div className="flex flex-wrap gap-1">
                      {rule.keywords.map((kw) => (
                        <span key={kw} className="inline-block rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">
                    {rule.englishFullName.split(" > ").map((part, j, arr) => (
                      <span key={j}>
                        {j < arr.length - 1 ? (
                          <span className="text-muted-foreground/50">{part} › </span>
                        ) : (
                          <span className="font-medium text-foreground">{part}</span>
                        )}
                      </span>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
