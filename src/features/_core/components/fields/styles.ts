/**
 * 原子化欄位系統 - 樣式常數
 *
 * @description 統一管理所有欄位組件的 Tailwind 樣式
 * @see docs/02-Tasks/_ACTIVE/TASK-0010-atomic-field-system/02-Technical-Plan.md
 */

export const FIELD_STYLES = {
  /** 輸入框樣式 */
  input: {
    base: "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-blue-400",
    error:
      "border-red-500 focus:border-red-500 focus:ring-red-500 dark:border-red-400",
    disabled: "bg-gray-100 cursor-not-allowed dark:bg-gray-700",
  },

  /** 標籤樣式 */
  label: {
    base: "block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300",
    required: "after:content-['*'] after:ml-0.5 after:text-red-500",
  },

  /** 錯誤訊息樣式 */
  error: "mt-1 text-sm text-red-500 dark:text-red-400",

  /** 提示文字樣式 */
  hint: "mt-1 text-sm text-gray-500 dark:text-gray-400",

  /** Readonly 模式樣式 */
  readonly: {
    base: "text-sm text-gray-900 dark:text-gray-100",
    empty: "text-gray-400 italic dark:text-gray-500",
  },

  /** Compact 模式樣式 */
  compact: {
    base: "text-sm text-gray-700 truncate dark:text-gray-300",
  },

  /** Textarea 樣式 */
  textarea: {
    base: "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 resize-none",
    error:
      "border-red-500 focus:border-red-500 focus:ring-red-500 dark:border-red-400",
    disabled: "bg-gray-100 cursor-not-allowed dark:bg-gray-700",
  },

  /** Select 樣式 */
  select: {
    base: "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100",
    error:
      "border-red-500 focus:border-red-500 focus:ring-red-500 dark:border-red-400",
    disabled: "bg-gray-100 cursor-not-allowed dark:bg-gray-700",
  },

  /** Badge 樣式（用於 Enum 欄位的 readonly/compact 模式） */
  badge: {
    base: "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
    colors: {
      gray: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
      green:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      yellow:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      red: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      blue: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      purple:
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    },
  },
} as const;

/** Badge 顏色類型 */
export type BadgeColor = keyof typeof FIELD_STYLES.badge.colors;
