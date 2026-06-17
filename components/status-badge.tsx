import { cn } from "@/lib/utils";
import type { ProductStatus } from "@/types/product";

const STATUS_CONFIG: Record<ProductStatus, { label: string; className: string }> = {
  new: {
    label: "Nowy",
    className: "bg-info text-info-foreground border-info",
  },
  changed: {
    label: "Zmieniony",
    className: "bg-warning text-warning-foreground border-warning",
  },
  removed: {
    label: "Usunięty",
    className: "bg-error text-error-foreground border-error",
  },
  unchanged: {
    label: "Bez zmian",
    className: "bg-muted text-muted-foreground border-border",
  },
  needs_decision: {
    label: "Wymaga decyzji",
    className: "bg-purple-100 text-purple-700 border-purple-200",
  },
};

interface StatusBadgeProps {
  status: ProductStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
