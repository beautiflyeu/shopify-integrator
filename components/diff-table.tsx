"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { SearchInput } from "@/components/search-input";
import { StatusBadge } from "@/components/status-badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSelectionStore } from "@/stores/selection";
import { useCategoryStore } from "@/stores/category";
import { suggestCategory } from "@/lib/suggest-category";
import { CategoryRulesPanel } from "@/components/category-rules-panel";
import type { ProductStatus } from "@/types/product";

export interface DiffTableRow {
  id: string;
  sku: string;
  ean?: string | null;
  name: string;
  productType?: string | null;
  status: ProductStatus;
  changedFieldsCount: number;
  family?: string | null;
  shopifyId?: string | null;
}

const col = createColumnHelper<DiffTableRow>();

function DiffTableInner({ rows }: { rows: DiffTableRow[] }) {
  const { isProductSelected, toggleProduct, selectProducts, deselectProducts, selectedProductIds, registerShopifyIds } = useSelectionStore();
  const setCategory = useCategoryStore((s) => s.setCategory);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProductStatus | "all">("all");
  const [familyFilter, setFamilyFilter] = useState<string | "all">("all");
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    const map: Record<string, string | null> = {};
    for (const row of rows) map[row.id] = row.shopifyId ?? null;
    registerShopifyIds(map);
  }, [rows, registerShopifyIds]);

  // auto-suggest disabled — categories must be set manually
  // useEffect(() => {
  //   for (const row of rows) {
  //     const suggested = suggestCategory(row.name, row.productType);
  //     if (suggested) setCategory(row.id, suggested);
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [rows]);

  const families = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of rows) {
      const name = r.family ?? "(bez rodziny)";
      map.set(name, (map.get(name) ?? 0) + 1);
    }
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0], "pl"))
      .map(([name, count]) => ({ name, count }));
  }, [rows]);

  const filtered = useMemo(() => {
    let data = rows;
    if (familyFilter !== "all") {
      data = data.filter((r) => (r.family ?? "(bez rodziny)") === familyFilter);
    }
    if (query.trim()) {
      const term = query.toLowerCase();
      data = data.filter(
        (r) =>
          String(r.name ?? "").toLowerCase().includes(term) ||
          String(r.productType ?? "").toLowerCase().includes(term) ||
          String(r.ean ?? "").toLowerCase().includes(term)
      );
    }
    if (statusFilter !== "all") {
      data = data.filter((r) => r.status === statusFilter);
    }
    return data;
  }, [rows, query, statusFilter, familyFilter]);

  const filteredIds = filtered.map((r) => r.id);
  const allFilteredSelected =
    filteredIds.length > 0 && filteredIds.every((id) => selectedProductIds.has(id));

  const columns = [
    col.display({
      id: "select",
      header: () => (
        <Checkbox
          checked={allFilteredSelected}
          onCheckedChange={(v) => {
            if (v) selectProducts(filteredIds);
            else deselectProducts(filteredIds);
          }}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={isProductSelected(row.original.id)}
          onCheckedChange={() => toggleProduct(row.original.id)}
        />
      ),
      size: 28,
    }),
    col.accessor("productType", {
      header: "Model",
      cell: (info) => {
        const val = info.getValue();
        return val ? (
          <span className="text-xs">{val}</span>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        );
      },
      size: 150,
    }),
    col.accessor("ean", {
      header: "EAN",
      cell: (info) => {
        const val = info.getValue();
        return val ? (
          <span className="font-mono text-xs">{val}</span>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        );
      },
      size: 140,
    }),
    col.accessor("name", {
      header: "Nazwa produktu",
      cell: (info) => (
        <Link
          href={`/dashboard/${info.row.original.id}`}
          className="line-clamp-2 text-xs hover:underline"
          title={info.getValue()}
        >
          {info.getValue()}
        </Link>
      ),
    }),
    col.accessor("status", {
      header: "Status",
      cell: (info) => <StatusBadge status={info.getValue()} />,
      size: 130,
    }),
    col.accessor("changedFieldsCount", {
      header: "Pola zmienione",
      cell: (info) => {
        const count = info.getValue();
        return count > 0 ? (
          <span className="text-xs font-medium text-warning-foreground-light">{count} pól</span>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        );
      },
      size: 120,
    }),
    col.accessor("shopifyId", {
      header: "Shopify",
      cell: (info) =>
        info.getValue() ? (
          <span className="text-xs font-medium text-green-600">✓</span>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
      size: 70,
    }),
  ];

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const STATUS_FILTERS: Array<{ value: ProductStatus | "all"; label: string }> = [
    { value: "all", label: "Wszystkie" },
    { value: "new", label: "Nowe" },
    { value: "changed", label: "Zmienione" },
    { value: "removed", label: "Usunięte" },
    { value: "needs_decision", label: "Wymaga decyzji" },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          ref={searchRef}
          value={query}
          onChange={setQuery}
          placeholder="Szukaj..."
          className="w-72"
        />
        <Select value={familyFilter} onValueChange={(v: string) => setFamilyFilter(v)}>
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Wszystkie rodziny" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszystkie rodziny ({rows.length})</SelectItem>
            {families.map((f) => (
              <SelectItem key={f.name} value={f.name}>
                {f.name} ({f.count})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex gap-1">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                statusFilter === f.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-md border border-border">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b border-border bg-muted/50">
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className={cn(
                      "px-2 py-2 text-left text-xs font-medium text-muted-foreground",
                      header.column.getCanSort() && "cursor-pointer select-none"
                    )}
                    style={{ width: header.column.getSize() }}
                  >
                    <span className="flex items-center gap-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && (
                        <ArrowUpDown className="h-3 w-3 opacity-50" />
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-sm text-muted-foreground"
                >
                  Brak wyników
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-2 py-2">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <CategoryRulesPanel />
    </div>
  );
}

export { DiffTableInner as DiffTable };
