"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategorySelectorProps {
  value: string | null;
  onChange: (v: string | null) => void;
  suggestions: string[];
  allCategories: { id: string; fullName: string }[];
}

export function CategorySelector({ value, onChange, suggestions, allCategories }: CategorySelectorProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const lowerQuery = query.toLowerCase().trim();

  const filteredSuggestions = lowerQuery
    ? suggestions.filter((s) => s.toLowerCase().includes(lowerQuery))
    : suggestions;

  const filteredAll = lowerQuery
    ? allCategories.filter((c) => c.fullName.toLowerCase().includes(lowerQuery)).slice(0, 50)
    : [];

  const showSuggestions = filteredSuggestions.length > 0;

  function select(category: string) {
    onChange(category);
    setOpen(false);
    setQuery("");
  }

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-md border border-border bg-background px-3 py-2 text-left text-sm transition-colors hover:bg-muted",
          open && "border-primary ring-1 ring-primary"
        )}
      >
        <span className={cn("flex-1 truncate", !value && "text-muted-foreground")}>
          {value ?? "Wybierz kategorię Shopify…"}
        </span>
        <span className="flex items-center gap-1 shrink-0">
          {value && (
            <span
              role="button"
              onClick={(e) => { e.stopPropagation(); onChange(null); }}
              className="rounded p-0.5 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </span>
          )}
          <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")} />
        </span>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-background shadow-lg">
          <div className="border-b border-border p-2">
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Szukaj kategorii…"
              className="w-full rounded bg-muted px-2 py-1.5 text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>

          <div className="max-h-64 overflow-y-auto">
            {showSuggestions && (
              <>
                <p className="px-3 py-1.5 text-xs font-medium text-muted-foreground">Sugestie</p>
                {filteredSuggestions.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => select(cat)}
                    className={cn(
                      "flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted",
                      value === cat && "bg-primary/10 font-medium text-primary"
                    )}
                  >
                    <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
                    {cat}
                  </button>
                ))}
                <div className="mx-3 my-1 border-t border-border" />
              </>
            )}

            {filteredAll.length > 0 && (
              <>
                <p className="px-3 py-1.5 text-xs font-medium text-muted-foreground">Wszystkie kategorie</p>
                {filteredAll.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => select(c.fullName)}
                    className={cn(
                      "w-full px-3 py-2 text-left text-sm hover:bg-muted",
                      value === c.fullName && "bg-primary/10 font-medium text-primary"
                    )}
                  >
                    {c.fullName}
                  </button>
                ))}
              </>
            )}

            {!showSuggestions && filteredAll.length === 0 && (
              <p className="px-3 py-4 text-center text-sm text-muted-foreground">
                {lowerQuery ? "Brak wyników" : "Zacznij pisać aby wyszukać"}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
