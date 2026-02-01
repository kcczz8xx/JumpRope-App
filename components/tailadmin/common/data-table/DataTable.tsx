"use client";

import React, { useState, useMemo, useCallback } from "react";
import { DataTableProps, SortState } from "./types";
import { DataTableHeader } from "./DataTableHeader";
import { DataTableToolbar } from "./DataTableToolbar";
import { DataTablePagination } from "./DataTablePagination";
import Button from "@/components/tailadmin/ui/button/Button";
import Link from "next/link";

const getNestedValue = (obj: any, path: string): any => {
  return path.includes(".")
    ? path.split(".").reduce((o, k) => o?.[k], obj)
    : obj[path];
};

const SortIcon = ({ sortKey, currentSort }: { sortKey: string; currentSort: SortState | null }) => (
  <span className="flex flex-col gap-0.5">
    <svg
      className={
        currentSort?.key === sortKey && currentSort.asc
          ? "text-gray-500 dark:text-gray-400"
          : "text-gray-300 dark:text-gray-400/50"
      }
      width="8"
      height="5"
      viewBox="0 0 8 5"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4.40962 0.585167C4.21057 0.300808 3.78943 0.300807 3.59038 0.585166L1.05071 4.21327C0.81874 4.54466 1.05582 5 1.46033 5H6.53967C6.94418 5 7.18126 4.54466 6.94929 4.21327L4.40962 0.585167Z"
        fill="currentColor"
      />
    </svg>
    <svg
      className={
        currentSort?.key === sortKey && !currentSort.asc
          ? "text-gray-500 dark:text-gray-400"
          : "text-gray-300 dark:text-gray-400/50"
      }
      width="8"
      height="5"
      viewBox="0 0 8 5"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4.40962 4.41483C4.21057 4.69919 3.78943 4.69919 3.59038 4.41483L1.05071 0.786732C0.81874 0.455343 1.05582 0 1.46033 0H6.53967C6.94418 0 7.18126 0.455342 6.94929 0.786731L4.40962 4.41483Z"
        fill="currentColor"
      />
    </svg>
  </span>
);

export function DataTable<T = any>({
  title,
  description,
  columns,
  data,
  actions,
  filters,
  searchable = false,
  searchPlaceholder = "Search...",
  searchKeys,
  selectable = false,
  onSelectionChange,
  getRowId = (row: any) => row.id,
  pagination = true,
  pageSize: initialPageSize = 10,
  pageSizeOptions = [10, 20, 50, 100],
  showPageSizeSelector = false,
  emptyMessage = "No data available",
  emptyAction,
}: DataTableProps<T>) {
  const [selected, setSelected] = useState<string[]>([]);
  const [sort, setSort] = useState<SortState | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [searchValue, setSearchValue] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});

  const filteredData = useMemo(() => {
    let result = [...data];

    if (searchValue && searchable) {
      const keysToSearch = searchKeys || columns.map((col) => col.key);
      const lowerSearch = searchValue.toLowerCase();
      result = result.filter((row: any) => {
        return keysToSearch.some((key) => {
          const value = getNestedValue(row, key);
          if (value == null) return false;
          return String(value).toLowerCase().includes(lowerSearch);
        });
      });
    }

    if (filters) {
      filters.forEach((filter) => {
        const filterValue = filterValues[filter.key];
        if (filterValue) {
          const lowerFilter = filterValue.toLowerCase();
          result = result.filter((row: any) => {
            const value = getNestedValue(row, filter.key);
            if (value == null) return false;
            return String(value).toLowerCase().includes(lowerFilter);
          });
        }
      });
    }

    return result;
  }, [data, searchValue, filterValues, columns, filters, searchable, searchKeys]);

  // 當搜尋或篩選改變時重置頁碼
  React.useEffect(() => {
    setPage(1);
  }, [searchValue, filterValues]);

  const sortedData = useMemo(() => {
    if (!sort) return filteredData;

    return [...filteredData].sort((a: any, b: any) => {
      let valA = getNestedValue(a, sort.key);
      let valB = getNestedValue(b, sort.key);

      if (valA == null && valB == null) return 0;
      if (valA == null) return sort.asc ? 1 : -1;
      if (valB == null) return sort.asc ? -1 : 1;

      if (typeof valA === "string" && typeof valB === "string") {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      if (valA < valB) return sort.asc ? -1 : 1;
      if (valA > valB) return sort.asc ? 1 : -1;
      return 0;
    });
  }, [filteredData, sort]);

  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;
    const start = (page - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, page, pageSize, pagination]);

  const totalPages = Math.ceil(sortedData.length / pageSize);
  const startItem = sortedData.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, sortedData.length);

  const handleSort = (key: string) => {
    const column = columns.find((col) => col.key === key);
    if (!column?.sortable) return;

    setSort((prev) => ({
      key,
      asc: prev?.key === key ? !prev.asc : true,
    }));
  };

  const toggleSelect = (id: string) => {
    const newSelected = selected.includes(id)
      ? selected.filter((i) => i !== id)
      : [...selected, id];
    setSelected(newSelected);
    onSelectionChange?.(newSelected);
  };

  const isAllSelected = useMemo(() => {
    const ids = paginatedData.map((row) => getRowId(row));
    return ids.length > 0 && ids.every((id) => selected.includes(id));
  }, [paginatedData, selected, getRowId]);

  const toggleAll = () => {
    const ids = paginatedData.map((row) => getRowId(row));
    const newSelected = isAllSelected
      ? selected.filter((id) => !ids.includes(id))
      : [...new Set([...selected, ...ids])];
    setSelected(newSelected);
    onSelectionChange?.(newSelected);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilterValues((prev) => ({ ...prev, [key]: value }));
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <DataTableHeader title={title} description={description} actions={actions} />

      <DataTableToolbar
        searchable={searchable}
        searchPlaceholder={searchPlaceholder}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        filters={filters}
        filterValues={filterValues}
        onFilterChange={handleFilterChange}
      />

      <div className="overflow-x-auto custom-scrollbar">
        {paginatedData.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center">
            <div className="text-gray-500 dark:text-gray-400">{emptyMessage}</div>
            {emptyAction && (
              <div className="mt-4">
                {emptyAction.href ? (
                  <Link href={emptyAction.href}>
                    <Button>{emptyAction.label}</Button>
                  </Link>
                ) : (
                  <Button onClick={emptyAction.onClick}>{emptyAction.label}</Button>
                )}
              </div>
            )}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:divide-gray-800 dark:border-gray-800">
                {selectable && (
                  <th className="w-14 px-5 py-4 text-left">
                    <label className="cursor-pointer text-sm font-medium text-gray-700 select-none dark:text-gray-400">
                      <input
                        type="checkbox"
                        className="sr-only"
                        onChange={toggleAll}
                        checked={isAllSelected}
                      />
                      <span
                        className={`flex h-4 w-4 items-center justify-center rounded-sm border-[1.25px] ${
                          isAllSelected
                            ? "border-brand-500 bg-brand-500"
                            : "bg-transparent border-gray-300 dark:border-gray-700"
                        }`}
                      >
                        <span className={isAllSelected ? "" : "opacity-0"}>
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 12 12"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M10 3L4.5 8.5L2 6"
                              stroke="white"
                              strokeWidth="1.6666"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                      </span>
                    </label>
                  </th>
                )}
                {columns.map((column) => (
                  <th
                    key={column.key}
                    onClick={() => column.sortable && handleSort(column.key)}
                    className={`px-5 py-4 text-${column.align || "left"} text-xs font-medium text-gray-500 dark:text-gray-400 ${
                      column.sortable ? "cursor-pointer" : ""
                    }`}
                    style={column.width ? { width: column.width } : undefined}
                  >
                    <div className="flex items-center gap-3">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        {column.label}
                      </p>
                      {column.sortable && <SortIcon sortKey={column.key} currentSort={sort} />}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-x divide-y divide-gray-200 dark:divide-gray-800">
              {paginatedData.map((row) => {
                const rowId = getRowId(row);
                return (
                  <tr
                    key={rowId}
                    className="transition hover:bg-gray-50 dark:hover:bg-gray-900"
                  >
                    {selectable && (
                      <td className="w-14 px-5 py-4 whitespace-nowrap">
                        <label className="cursor-pointer text-sm font-medium text-gray-700 select-none dark:text-gray-400">
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={selected.includes(rowId)}
                            onChange={() => toggleSelect(rowId)}
                          />
                          <span
                            className={`flex h-4 w-4 items-center justify-center rounded-sm border-[1.25px] ${
                              selected.includes(rowId)
                                ? "border-brand-500 bg-brand-500"
                                : "bg-transparent border-gray-300 dark:border-gray-700"
                            }`}
                          >
                            <span className={selected.includes(rowId) ? "" : "opacity-0"}>
                              <svg
                                width="12"
                                height="12"
                                viewBox="0 0 12 12"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M10 3L4.5 8.5L2 6"
                                  stroke="white"
                                  strokeWidth="1.6666"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </span>
                          </span>
                        </label>
                      </td>
                    )}
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={`px-5 py-4 whitespace-nowrap text-${column.align || "left"}`}
                      >
                        {column.render ? column.render(row) : (row as any)[column.key]}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {pagination && paginatedData.length > 0 && (
        <DataTablePagination
          page={page}
          totalPages={totalPages}
          totalItems={sortedData.length}
          startItem={startItem}
          endItem={endItem}
          onPageChange={setPage}
          pageSize={showPageSizeSelector ? pageSize : undefined}
          pageSizeOptions={pageSizeOptions}
          onPageSizeChange={showPageSizeSelector ? handlePageSizeChange : undefined}
        />
      )}
    </div>
  );
}
