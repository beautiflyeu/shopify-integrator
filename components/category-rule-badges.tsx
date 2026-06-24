"use client";

import { useCategoryRulesStore } from "@/stores/category-rules";
import { cn } from "@/lib/utils";

interface CategoryRuleBadgesProps {
  onSelect: (englishFullName: string) => void;
  selectedEnglish?: string | null;
}

export function CategoryRuleBadges({ onSelect, selectedEnglish }: CategoryRuleBadgesProps) {
  const rules = useCategoryRulesStore((s) => s.rules);

  const unique = rules.filter((r, i, arr) =>
    arr.findIndex((x) => x.englishFullName === r.englishFullName) === i
  );

  function label(englishFullName: string) {
    const parts = englishFullName.split(" > ");
    return parts[parts.length - 1];
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5 mt-2">
      <span className="text-xs text-muted-foreground shrink-0">Popularne:</span>
      {unique.map((rule) => (
        <button
          key={rule.englishFullName}
          type="button"
          onClick={() => onSelect(rule.englishFullName)}
          className={cn(
            "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border transition-colors",
            selectedEnglish === rule.englishFullName
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-muted text-muted-foreground border-border hover:bg-accent hover:text-accent-foreground"
          )}
        >
          {label(rule.englishFullName)}
        </button>
      ))}
    </div>
  );
}
