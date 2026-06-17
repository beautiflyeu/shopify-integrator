"use client";

import { cn } from "@/lib/utils";

interface FieldToggleProps {
  selected: boolean;
  onToggle: () => void;
  className?: string;
}

export function FieldToggle({ selected, onToggle, className }: FieldToggleProps) {
  return (
    <div className={cn("flex gap-1", className)}>
      <button
        onClick={onToggle}
        className={cn(
          "rounded px-2 py-0.5 text-xs font-medium transition-colors",
          selected
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground hover:bg-muted/80"
        )}
      >
        Synchronizuj
      </button>
      <button
        onClick={onToggle}
        className={cn(
          "rounded px-2 py-0.5 text-xs font-medium transition-colors",
          !selected
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground hover:bg-muted/80"
        )}
      >
        Pomiń
      </button>
    </div>
  );
}
