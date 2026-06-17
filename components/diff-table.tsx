"use client";

import { useState, useMemo } from "react";
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
import { ExportCsvButton } from "@/components/export-csv-button";
import { useSelectionStore } from "@/stores/selection";
import type { ProductStatus } from "@/types/product";

export interface DiffTableRow {
  id: string;
  sku: string;
  ean?: string | null;
  name: string;
  productType?: string | null;
  status: ProductStatus;
  changedFieldsCount: number;
}

const col = createColumnHelper<DiffTableRow>();

function DiffTableInner({ rows }: { rows: DiffTableRow[] }) {
  const { isProductSelected, toggleProduct, setAllSelected, allSelected, selectedProductIds } = useSelectionStore();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProductStatus | "all">("all");

  const filtered = useMemo(() => {
    let data = rows;
    if (query.trim()) {
      const term = query.toLowerCase();
      data = data.filter(
        (r) =>
          String(r.name ?? "").toLowerCase().includes(term) ||
          String(r.sku ?? "").toLowerCase().includes(term) ||
          String(r.ean ?? "").toLowerCase().includes(term)
      );
    }
    if (statusFilter !== "all") {
      data = data.filter((r) => r.status === statusFilter);
    }
    return data;
  }, [rows, query, statusFilter]);

  const columns = [
    col.display({
      id: "select",
      header: () => (
        <Checkbox
          checked={allSelected}
          onCheckedChange={(v) => setAllSelected(Boolean(v))}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={isProductSelected(row.original.id)}
          onCheckedChange={() => toggleProduct(row.original.id)}
        />
      ),
      size: 40,
    }),
    col.accessor("name", {
      header: "Nazwa produktu",
      cell: (info) => (
        <Link
          href={`/dashboard/${info.row.original.id}`}
          className="text-sm hover:underline"
        >
          {info.getValue()}
        </Link>
      ),
    }),
    col.accessor("productType", {
      header: "Type",
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
    col.accessor("status", {
      header: "Status",
      cell: (info) => <StatusBadge status={info.getValue()} />,
      size: 130,
    }),
    col.accessor("sku", {
      header: "SKU",
      cell: (info) => <span className="font-mono text-xs">{info.getValue()}</span>,
      size: 120,
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
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Szukaj po nazwie, SKU lub EAN..."
          className="w-72"
        />
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
        <div className="ml-auto flex items-center gap-3">
          <ExportCsvButton
            getProductIds={() => {
              const sel = [...selectedProductIds];
              return sel.length > 0 ? sel : filtered.map((r) => r.id);
            }}
            label={selectedProductIds.size > 0 ? "Eksportuj zaznaczone" : "Eksportuj widoczne"}
          />
          <span className="text-xs text-muted-foreground">
            {filtered.length} / {rows.length} produktów
          </span>
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
                      "px-4 py-2 text-left text-xs font-medium text-muted-foreground",
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
                    <td key={cell.id} className="px-4 py-2">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export { DiffTableInner as DiffTable };
