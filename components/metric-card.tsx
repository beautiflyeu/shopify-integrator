import { cn } from "@/lib/utils";
import type { ProductStatus } from "@/types/product";

const METRIC_COLORS: Record<string, string> = {
  new: "text-green-600",
  changed: "text-purple-600",
  removed: "text-red-600",
  needs_decision: "text-blue-600",
  total: "text-foreground",
};

interface MetricCardProps {
  label: string;
  value: number;
  type?: ProductStatus | "total";
  className?: string;
}

export function MetricCard({ label, value, type = "total", className }: MetricCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card px-5 py-4",
        className
      )}
    >
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("mt-1 text-2xl font-semibold tabular-nums", METRIC_COLORS[type])}>
        {value}
      </p>
    </div>
  );
}
