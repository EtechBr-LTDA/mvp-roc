"use client";

import { useState } from "react";
import { MagnifyingGlass, CaretLeft, CaretRight } from "@phosphor-icons/react";

interface Column<T = any> {
  key: string;
  label: string;
  render?: (value: any, row: T) => React.ReactNode;
}

interface Pagination {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

interface DataTableProps<T = any> {
  columns: Column<T>[];
  data: T[];
  pagination?: Pagination;
  isLoading?: boolean;
  emptyMessage?: string;
  onSearch?: (query: string) => void;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  pagination,
  isLoading = false,
  emptyMessage = "Nenhum registro encontrado.",
  onSearch,
}: DataTableProps<T>) {
  const [searchValue, setSearchValue] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    onSearch?.(value);
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-soft overflow-hidden">
        {/* Search skeleton */}
        {onSearch && (
          <div className="p-4 border-b border-[var(--color-border)]">
            <div className="h-10 w-72 bg-slate-100 rounded-lg animate-pulse" />
          </div>
        )}

        {/* Table skeleton */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-slate-50">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-medium)] uppercase tracking-wider"
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, rowIdx) => (
                <tr
                  key={rowIdx}
                  className="border-b border-[var(--color-border)]"
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3">
                      <div className="h-4 bg-slate-100 rounded animate-pulse w-3/4" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-soft overflow-hidden">
      {/* Search bar */}
      {onSearch && (
        <div className="p-4 border-b border-[var(--color-border)]">
          <div className="relative w-full max-w-sm">
            <MagnifyingGlass
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-light)]"
            />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchValue}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[var(--color-border)]
                text-sm text-[var(--color-text-dark)] placeholder:text-[var(--color-text-light)]
                focus:outline-none focus:ring-2 focus:ring-[var(--color-roc-primary)]/20
                focus:border-[var(--color-roc-primary)] transition-colors"
            />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-slate-50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-medium)] uppercase tracking-wider"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-sm text-[var(--color-text-light)]"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => (
                <tr
                  key={rowIdx}
                  className="border-b border-[var(--color-border)] hover:bg-slate-50 transition-colors"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className="px-4 py-3 text-sm text-[var(--color-text-dark)] whitespace-nowrap"
                    >
                      {col.render
                        ? col.render(row[col.key], row)
                        : row[col.key] ?? "-"}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--color-border)]">
          <button
            onClick={() => pagination.onPageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
              text-[var(--color-text-medium)] hover:bg-slate-100 transition-colors
              disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          >
            <CaretLeft size={16} />
            Previous
          </button>

          <span className="text-sm text-[var(--color-text-medium)]">
            Pagina{" "}
            <span className="font-semibold text-[var(--color-text-dark)]">
              {pagination.page}
            </span>{" "}
            de{" "}
            <span className="font-semibold text-[var(--color-text-dark)]">
              {pagination.totalPages}
            </span>
          </span>

          <button
            onClick={() => pagination.onPageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
              text-[var(--color-text-medium)] hover:bg-slate-100 transition-colors
              disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          >
            Next
            <CaretRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
