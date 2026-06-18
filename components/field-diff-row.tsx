"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { FieldToggle } from "@/components/field-toggle";
import type { FieldStatus } from "@/modules/diff/diffProduct";

const STATUS_CLASSES: Record<FieldStatus, string> = {
  new: "bg-blue-50 border-l-2 border-l-blue-400",
  changed: "bg-amber-50 border-l-2 border-l-amber-400",
  removed: "bg-red-50 border-l-2 border-l-red-400",
  unchanged: "",
};

const STATUS_LABELS: Record<FieldStatus, string> = {
  new: "Nowe",
  changed: "Zmienione",
  removed: "Usunięte",
  unchanged: "Bez zmian",
};

interface FieldDiffRowProps {
  fieldName: string;
  pimValue: string | null;
  shopifyValue: string | null;
  status: FieldStatus;
  selected: boolean;
  onToggle: () => void;
}

const TRUNCATE_THRESHOLD = 60;

function isTruncated(value: string | null): boolean {
  return value != null && value.length > TRUNCATE_THRESHOLD;
}

function ValueCell({ value }: { value: string | null }) {
  const [expanded, setExpanded] = useState(false);
  const truncatable = isTruncated(value);

  if (!value) return <span className="text-muted-foreground">—</span>;

  return (
    <span className="flex items-start gap-1">
      <span className={cn("text-muted-foreground", !expanded && truncatable && "line-clamp-1")}>
        {value}
      </span>
      {truncatable && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-0.5 shrink-0 text-muted-foreground hover:text-foreground"
          title={expanded ? "Zwiń" : "Rozwiń"}
        >
          <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", expanded && "rotate-180")} />
        </button>
      )}
    </span>
  );
}

export function FieldDiffRow({
  fieldName,
  pimValue,
  shopifyValue,
  status,
  selected,
  onToggle,
}: FieldDiffRowProps) {
  return (
    <tr className={cn("border-b border-border text-sm", STATUS_CLASSES[status])}>
      <td className="px-4 py-2 font-medium text-foreground">{fieldName}</td>
      <td className="px-4 py-2 max-w-[200px]"><ValueCell value={pimValue} /></td>
      <td className="px-4 py-2 max-w-[200px]"><ValueCell value={shopifyValue} /></td>
      <td className="px-4 py-2">
        <span
          className={cn(
            "text-xs font-medium",
            status === "new" && "text-blue-600",
            status === "changed" && "text-amber-600",
            status === "removed" && "text-red-600",
            status === "unchanged" && "text-muted-foreground"
          )}
        >
          {STATUS_LABELS[status]}
        </span>
      </td>
      <td className="px-4 py-2">
        {status !== "unchanged" && (
          <FieldToggle selected={selected} onToggle={onToggle} />
        )}
      </td>
    </tr>
  );
}
