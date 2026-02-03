"use client";

import { memo, useCallback, useId } from "react";

import { cn } from "@/lib/utils";

import { FIELD_STYLES } from "../styles";
import type { FieldProps } from "../types";

export interface RemarksFieldProps extends FieldProps<string> {
  /** 最大字數限制 */
  maxLength?: number;
  /** 行數（預設：3） */
  rows?: number;
  /** 是否顯示字數統計 */
  showCount?: boolean;
}

/**
 * 備註欄位
 *
 * @description 多行文字輸入，支援 edit/readonly/compact 三種模式
 * @example
 * ```tsx
 * <RemarksField
 *   value={remarks}
 *   onChange={setRemarks}
 *   label="備註"
 *   maxLength={500}
 *   showCount
 * />
 * ```
 */
export const RemarksField = memo(function RemarksField({
  // 1️⃣ 數據
  value,
  onChange,
  // 2️⃣ 顯示模式
  mode = "edit",
  // 3️⃣ 狀態
  error,
  disabled,
  required,
  // 4️⃣ 標籤和提示
  label,
  placeholder = "請輸入備註...",
  hint,
  // 5️⃣ 樣式和擴展
  className,
  id: propId,
  // 額外 props
  maxLength,
  rows = 3,
  showCount = false,
}: RemarksFieldProps) {
  const generatedId = useId();
  const id = propId ?? generatedId;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange?.(e.target.value);
    },
    [onChange]
  );

  const charCount = value?.length ?? 0;

  // Readonly 模式
  if (mode === "readonly") {
    return (
      <div className={className}>
        {label && <span className={FIELD_STYLES.label.base}>{label}</span>}
        <p
          className={cn(
            FIELD_STYLES.readonly.base,
            "whitespace-pre-wrap",
            !value && FIELD_STYLES.readonly.empty
          )}
        >
          {value || "無備註"}
        </p>
      </div>
    );
  }

  // Compact 模式
  if (mode === "compact") {
    return (
      <span
        className={cn(FIELD_STYLES.compact.base, className)}
        title={value || undefined}
      >
        {value || "-"}
      </span>
    );
  }

  // Edit 模式
  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={id}
          className={cn(
            FIELD_STYLES.label.base,
            required && FIELD_STYLES.label.required
          )}
        >
          {label}
        </label>
      )}
      <textarea
        id={id}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={cn(
          FIELD_STYLES.textarea.base,
          error && FIELD_STYLES.textarea.error,
          disabled && FIELD_STYLES.textarea.disabled
        )}
      />
      <div className="mt-1 flex justify-between">
        <div>
          {hint && !error && (
            <p id={`${id}-hint`} className={FIELD_STYLES.hint}>
              {hint}
            </p>
          )}
          {error && (
            <p id={`${id}-error`} className={FIELD_STYLES.error} role="alert">
              {error}
            </p>
          )}
        </div>
        {showCount && maxLength && (
          <span
            className={cn(
              "text-xs text-gray-500 dark:text-gray-400",
              charCount > maxLength && "text-red-500 dark:text-red-400"
            )}
          >
            {charCount}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
});
