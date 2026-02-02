"use client";

import { useState, useId } from "react";
import Label from "@/components/tailadmin/form/Label";
import { EyeIcon, EyeCloseIcon } from "@/icons";

interface PasswordFieldProps {
  name: string;
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  autoComplete?: string;
  required?: boolean;
}

export function PasswordField({
  name,
  label,
  placeholder = "輸入密碼",
  value,
  onChange,
  error,
  disabled = false,
  autoComplete = "current-password",
  required = true,
}: PasswordFieldProps) {
  const [show, setShow] = useState(false);
  const id = useId();
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div>
      <Label htmlFor={id}>
        {label} {required && <span className="text-error-500">*</span>}
      </Label>
      <div className="relative">
        <input
          id={id}
          type={show ? "text" : "password"}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          autoComplete={autoComplete}
          aria-invalid={!!error}
          aria-describedby={errorId}
          aria-required={required}
          className={`h-11 w-full rounded-lg border bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 disabled:cursor-not-allowed disabled:opacity-50 ${
            error
              ? "border-error-500 focus:border-error-500 focus:ring-error-500/20 dark:border-error-500"
              : "border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:focus:border-brand-800"
          }`}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          disabled={disabled}
          aria-label={show ? "隱藏密碼" : "顯示密碼"}
          aria-pressed={show}
          className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {show ? (
            <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
          ) : (
            <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
          )}
        </button>
      </div>
      {error && (
        <p
          id={errorId}
          role="alert"
          className="mt-1.5 text-sm text-error-600 dark:text-error-400"
        >
          {error}
        </p>
      )}
    </div>
  );
}
