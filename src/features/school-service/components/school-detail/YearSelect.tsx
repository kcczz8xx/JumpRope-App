"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDownIcon } from "@/icons";
import { AcademicYearData } from "./types";
import { formatYearLabel } from "./helpers";

interface YearSelectProps {
  years: AcademicYearData[];
  selectedYear: string;
  onYearChange: (year: string) => void;
}

export default function YearSelect({ years, selectedYear, onYearChange }: YearSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = years.find((y) => y.year === selectedYear);

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-8 items-center gap-1.5 rounded-md border border-gray-300 bg-transparent px-2.5 py-1.5 text-xs shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
      >
        <span className="text-gray-800 dark:text-white">{selectedOption ? formatYearLabel(selectedOption.year) : "選擇學年"}</span>
        <ChevronDownIcon className={`h-4 w-4 text-gray-500 transition-transform dark:text-gray-400 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-1 max-h-60 min-w-[120px] overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
          <div className="py-0.5">
            {years.map((year) => (
              <div
                key={year.year}
                onClick={() => {
                  onYearChange(year.year);
                  setIsOpen(false);
                }}
                className={`cursor-pointer px-3 py-2 text-xs transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${
                  year.year === selectedYear
                    ? "bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400"
                    : "text-gray-700 dark:text-gray-300"
                }`}
              >
                {formatYearLabel(year.year)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
