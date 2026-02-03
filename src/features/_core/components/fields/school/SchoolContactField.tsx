"use client";

import { memo, useCallback, useId } from "react";

import { cn } from "@/lib/utils";

import { FIELD_STYLES } from "../styles";
import type { BaseFieldProps } from "../types";

export interface SchoolContactValue {
  salutation: string;
  nameChinese: string;
  nameEnglish: string;
  position: string;
  phone: string;
  email: string;
}

export interface SchoolContactFieldProps extends BaseFieldProps {
  value: SchoolContactValue;
  onChange?: (value: SchoolContactValue) => void;
}

const SALUTATION_OPTIONS = [
  { value: "", label: "請選擇" },
  { value: "先生", label: "先生" },
  { value: "女士", label: "女士" },
  { value: "小姐", label: "小姐" },
  { value: "太太", label: "太太" },
  { value: "博士", label: "博士" },
  { value: "教授", label: "教授" },
];

/**
 * 學校聯絡人欄位（複合）
 *
 * @description 包含稱謂、中英文姓名、職位、電話、電郵的複合欄位
 * @example
 * ```tsx
 * <SchoolContactField
 *   value={contact}
 *   onChange={setContact}
 *   label="聯絡人資料"
 *   required
 * />
 * ```
 */
export const SchoolContactField = memo(function SchoolContactField({
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
  hint,
  // 5️⃣ 樣式和擴展
  className,
  id: propId,
}: SchoolContactFieldProps) {
  const generatedId = useId();
  const id = propId ?? generatedId;

  const handleChange = useCallback(
    (field: keyof SchoolContactValue) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const newValue =
          field === "phone"
            ? e.target.value.replace(/[^\d+\s-]/g, "")
            : e.target.value;
        onChange?.({ ...value, [field]: newValue });
      },
    [onChange, value]
  );

  // Readonly 模式
  if (mode === "readonly") {
    const hasValue = value.nameChinese || value.nameEnglish;
    const displayName = [value.nameChinese, value.nameEnglish]
      .filter(Boolean)
      .join(" / ");
    return (
      <div className={className}>
        {label && <span className={FIELD_STYLES.label.base}>{label}</span>}
        {hasValue ? (
          <div className="space-y-1">
            <p className={FIELD_STYLES.readonly.base}>
              {value.salutation && `${value.salutation} `}
              {displayName}
              {value.position && (
                <span className="text-gray-500 dark:text-gray-400">
                  {" "}
                  ({value.position})
                </span>
              )}
            </p>
            {value.phone && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                📞 {value.phone}
              </p>
            )}
            {value.email && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                ✉️ {value.email}
              </p>
            )}
          </div>
        ) : (
          <p className={FIELD_STYLES.readonly.empty}>未填寫</p>
        )}
      </div>
    );
  }

  // Compact 模式
  if (mode === "compact") {
    const displayName = value.nameChinese || value.nameEnglish;
    return (
      <span className={cn(FIELD_STYLES.compact.base, className)}>
        {displayName
          ? `${value.salutation ? `${value.salutation} ` : ""}${displayName}`
          : "-"}
      </span>
    );
  }

  // Edit 模式
  return (
    <div className={className}>
      {label && (
        <span
          className={cn(
            FIELD_STYLES.label.base,
            required && FIELD_STYLES.label.required
          )}
        >
          {label}
        </span>
      )}
      <div className="space-y-3">
        {/* 第一行：稱謂 + 中文姓名 + 英文姓名 */}
        <div className="grid grid-cols-6 gap-3">
          <div className="col-span-1">
            <label
              htmlFor={`${id}-salutation`}
              className="block text-xs text-gray-500 dark:text-gray-400 mb-1"
            >
              稱謂
            </label>
            <select
              id={`${id}-salutation`}
              value={value.salutation}
              onChange={handleChange("salutation")}
              disabled={disabled}
              className={cn(
                FIELD_STYLES.select.base,
                disabled && FIELD_STYLES.select.disabled
              )}
            >
              {SALUTATION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="col-span-2">
            <label
              htmlFor={`${id}-nameChinese`}
              className="block text-xs text-gray-500 dark:text-gray-400 mb-1"
            >
              中文姓名
            </label>
            <input
              id={`${id}-nameChinese`}
              type="text"
              value={value.nameChinese}
              onChange={handleChange("nameChinese")}
              disabled={disabled}
              placeholder="中文姓名"
              className={cn(
                FIELD_STYLES.input.base,
                error && FIELD_STYLES.input.error,
                disabled && FIELD_STYLES.input.disabled
              )}
            />
          </div>
          <div className="col-span-3">
            <label
              htmlFor={`${id}-nameEnglish`}
              className="block text-xs text-gray-500 dark:text-gray-400 mb-1"
            >
              英文姓名
            </label>
            <input
              id={`${id}-nameEnglish`}
              type="text"
              value={value.nameEnglish}
              onChange={handleChange("nameEnglish")}
              disabled={disabled}
              placeholder="English Name"
              className={cn(
                FIELD_STYLES.input.base,
                error && FIELD_STYLES.input.error,
                disabled && FIELD_STYLES.input.disabled
              )}
            />
          </div>
        </div>

        {/* 第二行：職位 + 電話 + 電郵 */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label
              htmlFor={`${id}-position`}
              className="block text-xs text-gray-500 dark:text-gray-400 mb-1"
            >
              職位
            </label>
            <input
              id={`${id}-position`}
              type="text"
              value={value.position}
              onChange={handleChange("position")}
              disabled={disabled}
              placeholder="職位"
              className={cn(
                FIELD_STYLES.input.base,
                disabled && FIELD_STYLES.input.disabled
              )}
            />
          </div>
          <div>
            <label
              htmlFor={`${id}-phone`}
              className="block text-xs text-gray-500 dark:text-gray-400 mb-1"
            >
              電話
            </label>
            <input
              id={`${id}-phone`}
              type="tel"
              inputMode="tel"
              value={value.phone}
              onChange={handleChange("phone")}
              disabled={disabled}
              placeholder="電話號碼"
              className={cn(
                FIELD_STYLES.input.base,
                disabled && FIELD_STYLES.input.disabled
              )}
            />
          </div>
          <div>
            <label
              htmlFor={`${id}-email`}
              className="block text-xs text-gray-500 dark:text-gray-400 mb-1"
            >
              電郵
            </label>
            <input
              id={`${id}-email`}
              type="email"
              inputMode="email"
              value={value.email}
              onChange={handleChange("email")}
              disabled={disabled}
              placeholder="電郵地址"
              className={cn(
                FIELD_STYLES.input.base,
                disabled && FIELD_STYLES.input.disabled
              )}
            />
          </div>
        </div>
      </div>
      {hint && !error && (
        <p className={cn(FIELD_STYLES.hint, "mt-1")}>{hint}</p>
      )}
      {error && (
        <p className={cn(FIELD_STYLES.error, "mt-1")} role="alert">
          {error}
        </p>
      )}
    </div>
  );
});
