"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDownIcon } from "@/icons";

interface Option {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  options: Option[];
  placeholder?: string;
  onChange: (value: string) => void;
  className?: string;
  defaultValue?: string;
  allowClear?: boolean;
  allowCreate?: boolean;
  onCreateOption?: (label: string) => Promise<string | void> | string | void;
}

export default function SearchableSelect({
  options,
  placeholder = "搜尋...",
  onChange,
  className = "",
  defaultValue = "",
  allowClear = true,
  allowCreate = false,
  onCreateOption,
}: SearchableSelectProps) {
  const [selectedValue, setSelectedValue] = useState<string>(defaultValue);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const [dynamicOptions, setDynamicOptions] = useState<Option[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const allOptions = [...options, ...dynamicOptions];
  const selectedOption = allOptions.find((opt) => opt.value === selectedValue);

  const filteredOptions = allOptions.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setSelectedValue(defaultValue);
  }, [defaultValue]);

  const handleSelect = (option: Option) => {
    setSelectedValue(option.value);
    onChange(option.value);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleInputClick = () => {
    setIsOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setIsOpen(true);
    
    if (value === "") {
      setSelectedValue("");
      onChange("");
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedValue("");
    onChange("");
    setSearchTerm("");
  };

  const handleCreateOption = async () => {
    if (!searchTerm.trim() || !onCreateOption) return;
    
    const result = await onCreateOption(searchTerm.trim());
    
    if (result && typeof result === "string") {
      const newOption: Option = {
        value: result,
        label: result,
      };
      setDynamicOptions((prev) => [...prev, newOption]);
      setSelectedValue(result);
      onChange(result);
    }
    
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className="relative">
        <input
          type="text"
          className={`h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 ${
            selectedValue && !isOpen
              ? "text-gray-800 dark:text-white/90"
              : "text-gray-400 dark:text-gray-400"
          } ${className}`}
          placeholder={placeholder}
          value={
            isOpen
              ? searchTerm
              : selectedOption?.label || (allowCreate ? selectedValue : "")
          }
          onChange={handleInputChange}
          onClick={handleInputClick}
          autoComplete="off"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {allowClear && selectedValue && !isOpen && (
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0ZM11.5 10.0857L10.0857 11.5L8 9.41429L5.91429 11.5L4.5 10.0857L6.58571 8L4.5 5.91429L5.91429 4.5L8 6.58571L10.0857 4.5L11.5 5.91429L9.41429 8L11.5 10.0857Z"
                  fill="currentColor"
                />
              </svg>
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-500 dark:text-gray-400"
          >
            <ChevronDownIcon
              className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
            />
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
          {filteredOptions.length > 0 ? (
            <div className="py-1">
              {filteredOptions.map((option) => (
                <div
                  key={option.value}
                  onClick={() => handleSelect(option)}
                  className={`cursor-pointer px-4 py-2.5 text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${
                    option.value === selectedValue
                      ? "bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {option.label}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-1">
              {allowCreate && searchTerm.trim() && onCreateOption ? (
                <div
                  onClick={handleCreateOption}
                  className="cursor-pointer px-4 py-2.5 text-sm text-brand-600 transition-colors hover:bg-gray-100 dark:text-brand-400 dark:hover:bg-gray-800"
                >
                  <span className="font-medium">+ 新增「{searchTerm}」</span>
                </div>
              ) : (
                <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                  沒有找到匹配的選項
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
