"use client";

import { memo, useCallback, useId, useMemo } from "react";

import { cn } from "@/lib/utils";

import { FIELD_STYLES } from "../styles";
import type { FieldProps } from "../types";

export interface AcademicYearFieldProps extends FieldProps<string> {
  /** 可選年份範圍起始（預設：當前年份 - 2） */
  startYear?: number;
  /** 可選年份範圍結束（預設：當前年份 + 3） */
  endYear?: number;
}

/**
 * 學年選擇欄位
 *
 * @description 支援 edit/readonly/compact 三種模式，格式為 YYYY-YYYY
 * @example
 * ```tsx
 * <AcademicYearField
 *   value={academicYear}
 *   onChange={setAcademicYear}
 *   label="學年"
 *   required
 * />
 * ```
 */
export const AcademicYearField = memo(function AcademicYearField({
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
  placeholder = "選擇學年",
  hint,
  // 5️⃣ 樣式和擴展
  className,
  id: propId,
  // 額外 props
  startYear,
  endYear,
}: AcademicYearFieldProps) {
  const generatedId = useId();
  const id = propId ?? generatedId;

  const currentYear = new Date().getFullYear();
  const yearStart = startYear ?? currentYear - 2;
  const yearEnd = endYear ?? currentYear + 3;

  const options = useMemo(() => {
    const result: { value: string; label: string }[] = [];
    for (let year = yearEnd; year >= yearStart; year--) {
      const academicYear = `${year}-${year + 1}`;
      result.push({
        value: academicYear,
        label: `${year}/${year + 1} 學年`,
      });
    }
    return result;
  }, [yearStart, yearEnd]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onChange?.(e.target.value);
    },
    [onChange]
  );

  const getDisplayLabel = (val: string) => {
    const option = options.find((opt) => opt.value === val);
    return option?.label ?? val;
  };

  // Readonly 模式
  if (mode === "readonly") {
    return (
      <div className={className}>
        {label && <span className={FIELD_STYLES.label.base}>{label}</span>}
        <p
          className={cn(
            FIELD_STYLES.readonly.base,
            !value && FIELD_STYLES.readonly.empty
          )}
        >
          {value ? getDisplayLabel(value) : "未選擇"}
        </p>
      </div>
    );
  }

  // Compact 模式
  if (mode === "compact") {
    return (
      <span className={cn(FIELD_STYLES.compact.base, className)}>
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
      <select
        id={id}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={cn(
          FIELD_STYLES.select.base,
          error && FIELD_STYLES.select.error,
          disabled && FIELD_STYLES.select.disabled
        )}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
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
  );
});
