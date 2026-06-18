"use client";

import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface FieldToggleProps {
  selected: boolean;
  onToggle: () => void;
  className?: string;
}

export function FieldToggle({ selected, onToggle, className }: FieldToggleProps) {
  return (
    <div className={cn("flex items-center", className)}>
      <Switch checked={selected} onCheckedChange={onToggle} size="sm" />
    </div>
  );
}
