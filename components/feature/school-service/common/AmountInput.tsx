"use client";

import React from "react";

interface AmountInputProps {
  value: number | null;
  onChange: (value: number | null) => void;
  placeholder?: string;
  prefix?: string;
  suffix?: string;
  disabled?: boolean;
  error?: boolean;
  min?: number;
  step?: number;
  className?: string;
}

export default function AmountInput({
  value,
  onChange,
  placeholder = "0",
  prefix = "HK$",
  suffix,
  disabled = false,
  error = false,
  min = 0,
  step = 1,
  className = "",
}: AmountInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "" || val === null) {
      onChange(null);
    } else {
      const num = parseFloat(val);
      if (!isNaN(num)) {
        onChange(num);
      }
    }
  };

  let inputClasses = `h-11 w-full rounded-lg border appearance-none py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 ${className}`;

  if (prefix) {
    inputClasses += " pl-12 pr-4";
  } else {
    inputClasses += " px-4";
  }

  if (disabled) {
    inputClasses +=
      " text-gray-500 border-gray-300 opacity-40 bg-gray-100 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700";
  } else if (error) {
    inputClasses +=
      " border-error-500 focus:border-error-300 focus:ring-error-500/20 dark:border-error-500 dark:focus:border-error-800";
  } else {
    inputClasses +=
      " bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white/90 dark:focus:border-brand-800";
  }

  return (
    <div className="relative">
      {prefix && (
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-500 dark:text-gray-400">
          {prefix}
        </span>
      )}
      <input
        type="number"
        value={value ?? ""}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        min={min}
        step={step}
        className={inputClasses}
      />
      {suffix && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500 dark:text-gray-400">
          {suffix}
        </span>
      )}
    </div>
  );
}
