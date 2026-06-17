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
import { cn } from "@/lib/utils";
import { SearchInput } from "@/components/search-input";
import { searchProducts } from "@/services/beautifly";
import type { BeautiflyProductListItem } from "@/services/beautifly";

const col = createColumnHelper<BeautiflyProductListItem>();

const columns = [
  col.accessor("id", {
    header: "ID",
    cell: (info) => (
      <span className="font-mono text-xs text-muted-foreground">{info.getValue()}</span>
    ),
    size: 70,
  }),
  col.accessor("model", {
    header: "Model produktu",
    cell: (info) => <span className="font-mono text-xs">{info.getValue() ?? "—"}</span>,
    size: 150,
  }),
  col.accessor("name", {
    header: "Nazwa produktu",
    cell: (info) => <span className="text-sm">{info.getValue()}</span>,
  }),
];

interface ProductsTableProps {
  products: BeautiflyProductListItem[];
}

export function ProductsTable({ products }: ProductsTableProps) {
  const [query, setQuery] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);

  const filtered = useMemo(
    () => (query.trim() ? searchProducts(products, query) : products),
    [products, query]
  );

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Szukaj po nazwie lub modelu..."
          className="w-80"
        />
        <span className="text-sm text-muted-foreground">
          {filtered.length} / {products.length} produktów
        </span>
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
                <td colSpan={columns.length} className="px-4 py-8 text-center text-sm text-muted-foreground">
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
