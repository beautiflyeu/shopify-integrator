"use client";

import { forwardRef } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ value, onChange, placeholder = "Szukaj...", className }, ref) => {
    return (
      <div className={cn("relative", className)}>
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-16 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus:placeholder-transparent focus-visible:ring-2 focus-visible:ring-ring"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 pointer-events-none">
          <kbd className="inline-flex items-center rounded border border-border bg-muted px-1 font-mono text-[10px] text-muted-foreground">⌘</kbd>
          <kbd className="inline-flex items-center rounded border border-border bg-muted px-1 font-mono text-[10px] text-muted-foreground">K</kbd>
        </div>
      </div>
    );
  }
);

SearchInput.displayName = "SearchInput";
