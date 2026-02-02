"use client";

import React from "react";

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}

export default function FormField({
  label,
  required = false,
  error,
  hint,
  children,
  className = "",
}: FormFieldProps) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="ml-0.5 text-error-500">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-error-500">{error}</p>}
      {hint && !error && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{hint}</p>
      )}
    </div>
  );
}
