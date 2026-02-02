import React, { useState, useRef, useEffect } from "react";
import { DataTableFilter } from "./types";

interface DataTableToolbarProps {
  searchable?: boolean;
  searchPlaceholder?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  filters?: DataTableFilter[];
  filterValues: Record<string, string>;
  onFilterChange: (key: string, value: string) => void;
}

const FilterDropdown: React.FC<{
  filters: DataTableFilter[];
  filterValues: Record<string, string>;
  onFilterChange: (key: string, value: string) => void;
  showFilter: boolean;
  setShowFilter: (show: boolean) => void;
}> = ({ filters, filterValues, onFilterChange, showFilter, setShowFilter }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setShowFilter(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [setShowFilter]);

  return (
    <div className="relative" ref={ref}>
      <button
        className="shadow-theme-xs flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 sm:w-auto sm:min-w-[100px] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
        onClick={() => setShowFilter(!showFilter)}
        type="button"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
        >
          <path
            d="M14.6537 5.90414C14.6537 4.48433 13.5027 3.33331 12.0829 3.33331C10.6631 3.33331 9.51206 4.48433 9.51204 5.90415M14.6537 5.90414C14.6537 7.32398 13.5027 8.47498 12.0829 8.47498C10.663 8.47498 9.51204 7.32398 9.51204 5.90415M14.6537 5.90414L17.7087 5.90411M9.51204 5.90415L2.29199 5.90411M5.34694 14.0958C5.34694 12.676 6.49794 11.525 7.91777 11.525C9.33761 11.525 10.4886 12.676 10.4886 14.0958M5.34694 14.0958C5.34694 15.5156 6.49794 16.6666 7.91778 16.6666C9.33761 16.6666 10.4886 15.5156 10.4886 14.0958M5.34694 14.0958L2.29199 14.0958M10.4886 14.0958L17.7087 14.0958"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Filter
      </button>
      {showFilter && (
        <div className="absolute right-0 z-10 mt-2 w-56 rounded-lg border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          {filters.map((filter, index) => (
            <div key={filter.key} className={index < filters.length - 1 ? "mb-5" : ""}>
              <label className="mb-2 block text-xs font-medium text-gray-700 dark:text-gray-300">
                {filter.label}
              </label>
              {filter.type === "text" ? (
                <input
                  type="text"
                  value={filterValues[filter.key] || ""}
                  onChange={(e) => onFilterChange(filter.key, e.target.value)}
                  className="shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-10 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                  placeholder={filter.placeholder || `Search ${filter.label.toLowerCase()}...`}
                />
              ) : (
                <select
                  value={filterValues[filter.key] || ""}
                  onChange={(e) => onFilterChange(filter.key, e.target.value)}
                  className="shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-10 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                >
                  <option value="">All</option>
                  {filter.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const DataTableToolbar: React.FC<DataTableToolbarProps> = ({
  searchable,
  searchPlaceholder = "Search...",
  searchValue,
  onSearchChange,
  filters,
  filterValues,
  onFilterChange,
}) => {
  const [showFilter, setShowFilter] = useState(false);

  if (!searchable && !filters?.length) return null;

  return (
    <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
      <div className="flex gap-3 sm:justify-between">
        {searchable && (
          <div className="relative flex-1 sm:flex-auto">
            <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
              <svg
                className="fill-current"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M3.04199 9.37336937363C3.04199 5.87693 5.87735 3.04199 9.37533 3.04199C12.8733 3.04199 15.7087 5.87693 15.7087 9.37363C15.7087 12.8703 12.8733 15.7053 9.37533 15.7053C5.87735 15.7053 3.04199 12.8703 3.04199 9.37363ZM9.37533 1.54199C5.04926 1.54199 1.54199 5.04817 1.54199 9.37363C1.54199 13.6991 5.04926 17.2053 9.37533 17.2053C11.2676 17.2053 13.0032 16.5344 14.3572 15.4176L17.1773 18.238C17.4702 18.5309 17.945 18.5309 18.2379 18.238C18.5308 17.9451 18.5309 17.4703 18.238 17.1773L15.4182 14.3573C16.5367 13.0033 17.2087 11.2669 17.2087 9.37363C17.2087 5.04817 13.7014 1.54199 9.37533 1.54199Z"
                  fill=""
                />
              </svg>
            </span>
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="shadow-sm focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pr-4 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-none sm:w-[300px] sm:min-w-[300px] dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
            />
          </div>
        )}
        {filters && filters.length > 0 && (
          <FilterDropdown
            filters={filters}
            filterValues={filterValues}
            onFilterChange={onFilterChange}
            showFilter={showFilter}
            setShowFilter={setShowFilter}
          />
        )}
      </div>
    </div>
  );
};
