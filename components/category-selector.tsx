"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategorySelectorProps {
  value: string | null;
  onChange: (v: string | null) => void;
  suggestions: string[];
  isLoading?: boolean;
}

export function CategorySelector({
  value,
  onChange,
  suggestions,
  isLoading,
}: CategorySelectorProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ id: string; fullName: string }[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
        setDebouncedQuery("");
        setSearchResults([]);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleQueryChange(val: string) {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQuery(val), 300);
  }

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setIsSearching(true);

    fetch(`/api/shopify/categories/search?q=${encodeURIComponent(debouncedQuery)}`, {
      signal: abortRef.current.signal,
    })
      .then((r) => r.json())
      .then((data: { id: string; fullName: string }[]) => {
        setSearchResults(data);
        setIsSearching(false);
      })
      .catch((err) => {
        if (err.name !== "AbortError") setIsSearching(false);
      });
  }, [debouncedQuery]);

  const lowerQuery = debouncedQuery.toLowerCase().trim();

  const filteredSuggestions = useMemo(
    () => (lowerQuery ? suggestions.filter((s) => s.toLowerCase().includes(lowerQuery)) : suggestions),
    [suggestions, lowerQuery]
  );

  const showSuggestions = filteredSuggestions.length > 0;
  const showSearchResults = searchResults.length > 0 && debouncedQuery.length >= 2;

  function select(category: string) {
    onChange(category);
    setOpen(false);
    setQuery("");
    setDebouncedQuery("");
    setSearchResults([]);
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
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="Szukaj w taksonomii Shopify…"
              className="w-full rounded bg-muted px-2 py-1.5 text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>

          <div className="max-h-72 overflow-y-auto">
            {isLoading && !debouncedQuery && (
              <div className="flex items-center gap-2 px-3 py-4 text-sm text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Ładowanie sugestii…
              </div>
            )}

            {!isLoading && showSuggestions && (
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
                {(showSearchResults || isSearching) && <div className="mx-3 my-1 border-t border-border" />}
              </>
            )}

            {isSearching && (
              <div className="flex items-center gap-2 px-3 py-4 text-sm text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Szukanie w taksonomii…
              </div>
            )}

            {!isSearching && showSearchResults && (
              <>
                {!showSuggestions && <p className="px-3 py-1.5 text-xs font-medium text-muted-foreground">Wyniki</p>}
                {searchResults.map((c) => (
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

            {!isSearching && !showSuggestions && !showSearchResults && (
              <p className="px-3 py-4 text-center text-sm text-muted-foreground">
                {debouncedQuery.length >= 2 ? "Brak wyników" : "Zacznij pisać aby wyszukać"}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
