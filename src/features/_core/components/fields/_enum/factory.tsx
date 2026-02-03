"use client";

import { memo, useCallback, useId } from "react";

import { cn } from "@/lib/utils";

import { FIELD_STYLES, type BadgeColor } from "../styles";
import type { FieldProps, EnumOption } from "../types";

/**
 * Enum 欄位工廠函數
 *
 * @description 建立具有統一行為的 Enum 選擇欄位
 * @example
 * ```tsx
 * const CourseStatusField = createEnumField("CourseStatusField", [
 *   { value: "DRAFT", label: "草稿", color: "gray" },
 *   { value: "ACTIVE", label: "進行中", color: "green" },
 * ]);
 * ```
 */
export function createEnumField<T extends string>(
  displayName: string,
  options: EnumOption<T>[],
  defaultBadgeColor: BadgeColor = "gray"
) {
  const EnumField = memo(function EnumField({
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
    placeholder = "請選擇",
    hint,
    // 5️⃣ 樣式和擴展
    className,
    id: propId,
  }: FieldProps<T>) {
    const generatedId = useId();
    const id = propId ?? generatedId;

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLSelectElement>) => {
        onChange?.(e.target.value as T);
      },
      [onChange]
    );

    const selectedOption = options.find((opt) => opt.value === value);
    const badgeColor = selectedOption?.color ?? defaultBadgeColor;

    // Readonly 模式 — Badge 顯示
    if (mode === "readonly") {
      return (
        <div className={className}>
          {label && <span className={FIELD_STYLES.label.base}>{label}</span>}
          {value ? (
            <span
              className={cn(
                FIELD_STYLES.badge.base,
                FIELD_STYLES.badge.colors[badgeColor as BadgeColor] ??
                  FIELD_STYLES.badge.colors.gray
              )}
            >
              {selectedOption?.label ?? value}
            </span>
          ) : (
            <span className={FIELD_STYLES.readonly.empty}>未選擇</span>
          )}
        </div>
      );
    }

    // Compact 模式 — Badge 顯示（無標籤）
    if (mode === "compact") {
      return value ? (
        <span
          className={cn(
            FIELD_STYLES.badge.base,
            FIELD_STYLES.badge.colors[badgeColor as BadgeColor] ??
              FIELD_STYLES.badge.colors.gray,
            className
          )}
        >
          {selectedOption?.label ?? value}
        </span>
      ) : (
        <span className={cn(FIELD_STYLES.compact.base, className)}>-</span>
      );
    }

    // Edit 模式 — Select 下拉選單
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
          aria-describedby={
            error ? `${id}-error` : hint ? `${id}-hint` : undefined
          }
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

  EnumField.displayName = displayName;
  return EnumField;
}
