/**
 * 原子化欄位系統 - 類型定義
 *
 * @description 所有欄位組件的共用類型接口
 * @see docs/02-Tasks/_ACTIVE/TASK-0010-atomic-field-system/02-Technical-Plan.md
 */

/**
 * 欄位顯示模式
 * - edit: 可編輯輸入框，帶驗證
 * - readonly: 純顯示，無輸入框
 * - compact: 精簡顯示（用於列表/卡片）
 */
export type FieldMode = "edit" | "readonly" | "compact";

/**
 * 基礎欄位 Props（不含 value/onChange）
 *
 * Props 結構順序（規範 B）：
 * 1. 數據（value, onChange）— 由子接口定義
 * 2. 顯示模式（mode）
 * 3. 狀態（error, disabled, required）
 * 4. 標籤和提示（label, placeholder, hint）
 * 5. 樣式和擴展（className, id）
 */
export interface BaseFieldProps {
  /** 顯示模式 */
  mode?: FieldMode;

  /** 錯誤訊息（由父組件驗證後傳入） */
  error?: string;

  /** 是否禁用 */
  disabled?: boolean;

  /** 是否必填（影響標籤顯示） */
  required?: boolean;

  /** 欄位標籤 */
  label?: string;

  /** 輸入框佔位符 */
  placeholder?: string;

  /** 提示文字（顯示在輸入框下方） */
  hint?: string;

  /** 額外 CSS 類名 */
  className?: string;

  /** 欄位 ID（用於 label 關聯） */
  id?: string;
}

/**
 * 通用欄位 Props（含 value/onChange）
 *
 * @template T 欄位值類型
 */
export interface FieldProps<T> extends BaseFieldProps {
  /** 欄位值 */
  value: T;

  /** 值變更回調 */
  onChange?: (value: T) => void;
}

/**
 * 可為空的欄位 Props
 *
 * @template T 欄位值類型（不含 null）
 */
export interface NullableFieldProps<T> extends BaseFieldProps {
  /** 欄位值（可為 null） */
  value: T | null;

  /** 值變更回調 */
  onChange?: (value: T | null) => void;
}

/**
 * Enum 選項定義
 *
 * @template T Enum 值類型
 */
export interface EnumOption<T extends string> {
  /** Enum 值 */
  value: T;

  /** 顯示標籤（中文） */
  label: string;

  /** Badge 顏色（用於 readonly/compact 模式） */
  color?: string;
}
