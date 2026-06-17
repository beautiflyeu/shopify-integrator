"use client";

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
      <td className="px-4 py-2 text-muted-foreground max-w-[200px] truncate">{pimValue ?? "—"}</td>
      <td className="px-4 py-2 text-muted-foreground max-w-[200px] truncate">
        {shopifyValue ?? "—"}
      </td>
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
