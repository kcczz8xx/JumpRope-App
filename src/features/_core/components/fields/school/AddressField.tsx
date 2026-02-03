"use client";

import { memo, useCallback, useId } from "react";

import { cn } from "@/lib/utils";

import { FIELD_STYLES } from "../styles";
import type { BaseFieldProps } from "../types";

export interface AddressValue {
  line1: string;
  line2?: string;
  district?: string;
  region?: string;
}

export interface AddressFieldProps extends BaseFieldProps {
  value: AddressValue;
  onChange?: (value: AddressValue) => void;
  /** 是否顯示地區選擇 */
  showDistrict?: boolean;
  /** 是否顯示區域選擇 */
  showRegion?: boolean;
}

const HK_REGIONS = [
  { value: "", label: "請選擇" },
  { value: "香港島", label: "香港島" },
  { value: "九龍", label: "九龍" },
  { value: "新界", label: "新界" },
  { value: "離島", label: "離島" },
];

/**
 * 地址欄位（複合）
 *
 * @description 包含地址行1、地址行2、地區、區域的複合欄位
 * @example
 * ```tsx
 * <AddressField
 *   value={address}
 *   onChange={setAddress}
 *   label="學校地址"
 *   showDistrict
 *   showRegion
 *   required
 * />
 * ```
 */
export const AddressField = memo(function AddressField({
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
  // 額外 props
  showDistrict = true,
  showRegion = true,
}: AddressFieldProps) {
  const generatedId = useId();
  const id = propId ?? generatedId;

  const handleChange = useCallback(
    (field: keyof AddressValue) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        onChange?.({ ...value, [field]: e.target.value });
      },
    [onChange, value]
  );

  const formatFullAddress = () => {
    const parts = [value.line1, value.line2, value.district, value.region].filter(
      Boolean
    );
    return parts.join(", ");
  };

  // Readonly 模式
  if (mode === "readonly") {
    const fullAddress = formatFullAddress();
    return (
      <div className={className}>
        {label && <span className={FIELD_STYLES.label.base}>{label}</span>}
        <p
          className={cn(
            FIELD_STYLES.readonly.base,
            !fullAddress && FIELD_STYLES.readonly.empty
          )}
        >
          {fullAddress || "未填寫"}
        </p>
      </div>
    );
  }

  // Compact 模式
  if (mode === "compact") {
    const shortAddress = value.line1 || "-";
    return (
      <span
        className={cn(FIELD_STYLES.compact.base, className)}
        title={formatFullAddress() || undefined}
      >
        {shortAddress}
      </span>
    );
  }

  // Edit 模式
  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={`${id}-line1`}
          className={cn(
            FIELD_STYLES.label.base,
            required && FIELD_STYLES.label.required
          )}
        >
          {label}
        </label>
      )}
      <div className="space-y-3">
        <div>
          <input
            id={`${id}-line1`}
            type="text"
            value={value.line1}
            onChange={handleChange("line1")}
            disabled={disabled}
            placeholder="地址行 1"
            aria-invalid={!!error}
            className={cn(
              FIELD_STYLES.input.base,
              error && FIELD_STYLES.input.error,
              disabled && FIELD_STYLES.input.disabled
            )}
          />
        </div>
        <div>
          <input
            id={`${id}-line2`}
            type="text"
            value={value.line2 ?? ""}
            onChange={handleChange("line2")}
            disabled={disabled}
            placeholder="地址行 2（選填）"
            className={cn(
              FIELD_STYLES.input.base,
              disabled && FIELD_STYLES.input.disabled
            )}
          />
        </div>
        {(showDistrict || showRegion) && (
          <div className="grid grid-cols-2 gap-3">
            {showDistrict && (
              <div>
                <label
                  htmlFor={`${id}-district`}
                  className="block text-xs text-gray-500 dark:text-gray-400 mb-1"
                >
                  地區
                </label>
                <input
                  id={`${id}-district`}
                  type="text"
                  value={value.district ?? ""}
                  onChange={handleChange("district")}
                  disabled={disabled}
                  placeholder="例：觀塘"
                  className={cn(
                    FIELD_STYLES.input.base,
                    disabled && FIELD_STYLES.input.disabled
                  )}
                />
              </div>
            )}
            {showRegion && (
              <div>
                <label
                  htmlFor={`${id}-region`}
                  className="block text-xs text-gray-500 dark:text-gray-400 mb-1"
                >
                  區域
                </label>
                <select
                  id={`${id}-region`}
                  value={value.region ?? ""}
                  onChange={handleChange("region")}
                  disabled={disabled}
                  className={cn(
                    FIELD_STYLES.select.base,
                    disabled && FIELD_STYLES.select.disabled
                  )}
                >
                  {HK_REGIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}
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
