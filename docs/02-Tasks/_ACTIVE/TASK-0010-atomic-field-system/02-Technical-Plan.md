# 原子化欄位系統 - 技術方案

## 目錄結構（Model-Aligned）

與 `prisma/schema/` 結構對齊，方便 AI 輔助開發和 debug：

```
src/features/_core/
├── components/
│   └── fields/
│       ├── index.ts                    # 公開 API
│       ├── types.ts                    # 欄位接口定義
│       ├── styles.ts                   # FIELD_STYLES 常數
│       │
│       ├── _shared/                    # 跨 Model 共用欄位
│       │   ├── PhoneField.tsx
│       │   ├── EmailField.tsx
│       │   ├── ChineseNameField.tsx
│       │   ├── EnglishNameField.tsx
│       │   ├── DateField.tsx
│       │   ├── TimeField.tsx
│       │   ├── CurrencyField.tsx
│       │   └── RemarksField.tsx
│       │
│       ├── _enum/                      # Enum 工廠 + 標籤
│       │   ├── factory.ts              # createEnumField 工廠
│       │   └── labels.ts               # 中文標籤對照
│       │
│       ├── school/                     # 對應 prisma/schema/school/
│       │   ├── PartnershipStatusField.tsx
│       │   ├── SchoolContactField.tsx
│       │   └── AddressField.tsx
│       │
│       ├── course/                     # 對應 prisma/schema/school/course/
│       │   ├── CourseStatusField.tsx
│       │   ├── CourseTermField.tsx
│       │   ├── AcademicYearField.tsx
│       │   └── ChargingModelField.tsx
│       │
│       ├── lesson/                     # 對應 prisma/schema/school/lesson/
│       │   ├── LessonStatusField.tsx
│       │   ├── LessonTypeField.tsx
│       │   └── TimeRangeField.tsx
│       │
│       ├── invoice/                    # 對應 prisma/schema/school/invoice/
│       │   ├── InvoiceStatusField.tsx
│       │   ├── PaymentMethodField.tsx
│       │   └── ContactField.tsx
│       │
│       └── quotation/                  # 對應 prisma/schema/school/quotation/
│           └── QuotationStatusField.tsx
│
├── schemas/                            # Zod Schemas（同樣對齊）
│   ├── index.ts
│   ├── _shared/
│   │   ├── phone.schema.ts
│   │   ├── email.schema.ts
│   │   ├── name.schema.ts
│   │   ├── date.schema.ts
│   │   └── currency.schema.ts
│   ├── school/
│   ├── course/
│   ├── lesson/
│   └── invoice/
│
└── index.ts                            # features/_core 公開 API
```

### Prisma ↔ Fields 對照表

| Prisma 路徑                       | Fields 路徑         | 說明                  |
| :-------------------------------- | :------------------ | :-------------------- |
| `prisma/schema/school/`           | `fields/school/`    | 學校相關欄位          |
| `prisma/schema/school/course/`    | `fields/course/`    | 課程相關欄位          |
| `prisma/schema/school/lesson/`    | `fields/lesson/`    | 課堂相關欄位          |
| `prisma/schema/school/invoice/`   | `fields/invoice/`   | 發票相關欄位          |
| `prisma/schema/school/quotation/` | `fields/quotation/` | 報價相關欄位          |
| （跨 Model 共用）                 | `fields/_shared/`   | Phone, Email, Name 等 |

---

## 開發規範

### 規範 A：命名一致性

```typescript
// ✅ 統一命名模式
PhoneField.tsx; // 不含 "Base" 前綴
CurrencyField.tsx; // 名稱 = 用途
EmailField.tsx;

// ❌ 避免
BasePhoneField.tsx; // 不一致
PhoneFieldBase.tsx; // 命名混亂
```

### 規範 B：Props 結構順序

所有欄位組件的 Props 必須按以下順序定義：

```typescript
interface FieldProps<T> {
  // 1️⃣ 數據
  value: T;
  onChange?: (value: T) => void;

  // 2️⃣ 顯示模式
  mode?: FieldMode;

  // 3️⃣ 狀態
  error?: string;
  disabled?: boolean;
  required?: boolean;

  // 4️⃣ 標籤和提示
  label?: string;
  placeholder?: string;
  hint?: string;

  // 5️⃣ 樣式和擴展
  className?: string;
  id?: string;
}
```

### 規範 C：文件放置原則

| 欄位類型        | 放置位置           | 範例                          |
| :-------------- | :----------------- | :---------------------------- |
| 跨 Model 共用   | `_shared/`         | PhoneField, EmailField        |
| 特定 Model Enum | 對應 Model 文件夾  | CourseStatusField → `course/` |
| 複合欄位        | 主要使用者的文件夾 | ContactField → `invoice/`     |

---

## 欄位使用頻率分析

根據 Prisma Schema 審視結果：

### 🔴 高頻欄位（10+ 次使用）— 必做

| 欄位              | 使用模型                                                   | 次數 | 優先級 |
| :---------------- | :--------------------------------------------------------- | :--: | :----: |
| `remarks`         | School, Contact, Course, Lesson, Invoice, Quotation, Tutor | 10+  |   P0   |
| `phone`           | User, School, SchoolContact, Invoice                       |  6   |   P0   |
| `email`           | User, School, SchoolContact, Invoice                       |  6   |   P0   |
| `nameChinese`     | User, SchoolContact, Invoice                               |  5   |   P0   |
| `nameEnglish`     | User, SchoolContact, Invoice                               |  5   |   P0   |
| `DateTime` (日期) | Course, Lesson, Invoice, Quotation, Period                 | 15+  |   P0   |
| `Decimal` (金額)  | FeeStructure, FeeItem, Invoice, Quotation, Tutor           | 10+  |   P0   |

### 🟡 中頻欄位（3-9 次使用）— 強烈建議

| 欄位                | 使用模型                                           | 次數 | 優先級 |
| :------------------ | :------------------------------------------------- | :--: | :----: |
| `address`           | School, User                                       |  3   |   P1   |
| `startTime/endTime` | Lesson, Schedule                                   |  4   |   P1   |
| `status` (各種)     | School, Course, Lesson, Invoice, Quotation, Period |  8   |   P1   |
| `academicYear`      | Course, Period                                     |  3   |   P1   |
| `salutation`        | SchoolContact, Invoice                             |  3   |   P1   |
| `position`          | SchoolContact, Invoice                             |  3   |   P1   |

### 🟢 低頻欄位（1-2 次使用）— 視情況

| 欄位              | 使用模型  | 次數 | 優先級 |
| :---------------- | :-------- | :--: | :----: |
| `fax`             | School    |  1   |   P2   |
| `website`         | School    |  1   |   P2   |
| `schoolCode`      | School    |  1   |   P2   |
| `quotationNumber` | Quotation |  1   |   P2   |
| `invoiceNumber`   | Invoice   |  1   |   P2   |

---

## 實作階段

### Phase 0：架構設置（Day 1 上午）

**目標**：建立基礎架構

1. **目錄結構**

   - 建立 `_core/components/fields/` 目錄（含子文件夾）
   - 建立 `_core/schemas/` 目錄

2. **類型定義**

   - `types.ts`（FieldProps 接口，按規範 B 順序）
   - `styles.ts`（FIELD_STYLES 常數）

3. **公開 API**
   - `fields/index.ts`
   - `_core/index.ts`

---

### Phase 1：核心共用欄位 + Schema（Day 1-2）

**目標**：實作高頻欄位，**同步補上 Schema**

| 欄位     | 組件                   | Schema               | 放置位置   |
| :------- | :--------------------- | :------------------- | :--------- |
| 電話     | `PhoneField.tsx`       | `phone.schema.ts`    | `_shared/` |
| 電郵     | `EmailField.tsx`       | `email.schema.ts`    | `_shared/` |
| 中文姓名 | `ChineseNameField.tsx` | `name.schema.ts`     | `_shared/` |
| 英文姓名 | `EnglishNameField.tsx` | `name.schema.ts`     | `_shared/` |
| 金額     | `CurrencyField.tsx`    | `currency.schema.ts` | `_shared/` |
| 備註     | `RemarksField.tsx`     | —                    | `_shared/` |

---

### Phase 2：日期時間欄位（Day 2-3）

| 欄位     | 組件                    | 放置位置   |
| :------- | :---------------------- | :--------- |
| 日期     | `DateField.tsx`         | `_shared/` |
| 時間     | `TimeField.tsx`         | `_shared/` |
| 日期範圍 | `DateRangeField.tsx`    | `course/`  |
| 時間範圍 | `TimeRangeField.tsx`    | `lesson/`  |
| 學年     | `AcademicYearField.tsx` | `course/`  |

---

### Phase 3：Enum 欄位 + 工廠（Day 3-4）

1. **Enum 工具**（`_enum/`）

   - `factory.ts` — `createEnumField()` 工廠函數
   - `labels.ts` — 中文標籤對照

2. **狀態欄位**（按 Model 分組）

| 欄位     | 組件                         | 放置位置   |
| :------- | :--------------------------- | :--------- |
| 合作狀態 | `PartnershipStatusField.tsx` | `school/`  |
| 課程狀態 | `CourseStatusField.tsx`      | `course/`  |
| 課程學期 | `CourseTermField.tsx`        | `course/`  |
| 收費模式 | `ChargingModelField.tsx`     | `course/`  |
| 課堂狀態 | `LessonStatusField.tsx`      | `lesson/`  |
| 課堂類型 | `LessonTypeField.tsx`        | `lesson/`  |
| 發票狀態 | `InvoiceStatusField.tsx`     | `invoice/` |
| 付款方式 | `PaymentMethodField.tsx`     | `invoice/` |

---

### Phase 4：複合欄位 + 整合（Day 4-5）

1. **複合欄位**

| 欄位       | 組件                     | 放置位置   |
| :--------- | :----------------------- | :--------- |
| 聯絡人     | `ContactField.tsx`       | `invoice/` |
| 學校聯絡人 | `SchoolContactField.tsx` | `school/`  |
| 地址       | `AddressField.tsx`       | `school/`  |

2. **整合現有表單**
   - `school-service/components/` 整合
   - `user/components/` 整合

---

### Phase 5：測試與文檔（Day 5）

1. **單元測試**

   - 每個 `_shared/` 欄位的 edit/readonly/compact 模式
   - Enum 工廠函數
   - 複合欄位

2. **文檔**
   - 更新 `DEVELOPMENT-GUIDE.md`
   - 更新 `docs/03-Knowledge-Base/`

---

## 技術規格

### FieldProps 接口

```typescript
// src/features/_core/components/fields/types.ts

export type FieldMode = "edit" | "readonly" | "compact";

export interface BaseFieldProps {
  mode?: FieldMode;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  label?: string;
  placeholder?: string;
  className?: string;
  id?: string;
}

export interface FieldProps<T> extends BaseFieldProps {
  value: T;
  onChange?: (value: T) => void;
}

// 用於 nullable 欄位
export interface NullableFieldProps<T> extends BaseFieldProps {
  value: T | null;
  onChange?: (value: T | null) => void;
}
```

### FIELD_STYLES 常數

```typescript
// src/features/_core/components/fields/styles.ts

export const FIELD_STYLES = {
  // 輸入框
  input: {
    base: "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500",
    error: "border-red-500 focus:border-red-500 focus:ring-red-500",
    disabled: "bg-gray-100 cursor-not-allowed",
  },

  // 標籤
  label: {
    base: "block text-sm font-medium text-gray-700 mb-1",
    required: "after:content-['*'] after:ml-0.5 after:text-red-500",
  },

  // 錯誤訊息
  error: "mt-1 text-sm text-red-500",

  // Readonly 模式
  readonly: {
    base: "text-sm text-gray-900",
    empty: "text-gray-400 italic",
  },

  // Compact 模式
  compact: {
    base: "text-sm text-gray-700 truncate",
  },
} as const;
```

### 欄位組件範例

```typescript
// src/features/_core/components/fields/base/PhoneField.tsx
"use client";

import { memo, useCallback } from "react";
import { cn } from "@/lib/utils";
import { FIELD_STYLES } from "../styles";
import type { FieldProps } from "../types";

export interface PhoneFieldProps extends FieldProps<string> {
  /** 顯示國碼前綴 */
  showCountryCode?: boolean;
}

export const PhoneField = memo(function PhoneField({
  value,
  onChange,
  mode = "edit",
  error,
  disabled,
  required,
  label,
  placeholder = "電話號碼",
  className,
  id,
  showCountryCode = false,
}: PhoneFieldProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      // 只允許數字和 + 符號
      const cleaned = e.target.value.replace(/[^\d+]/g, "");
      onChange?.(cleaned);
    },
    [onChange]
  );

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
          {value || "未填寫"}
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
      <input
        id={id}
        type="tel"
        inputMode="tel"
        value={value}
        onChange={handleChange}
        disabled={disabled}
        placeholder={placeholder}
        className={cn(
          FIELD_STYLES.input.base,
          error && FIELD_STYLES.input.error,
          disabled && FIELD_STYLES.input.disabled
        )}
      />
      {error && <p className={FIELD_STYLES.error}>{error}</p>}
    </div>
  );
});
```

### Enum 欄位工廠

```typescript
// src/features/_core/components/fields/enum/createEnumField.tsx

import { memo } from "react";
import { cn } from "@/lib/utils";
import { FIELD_STYLES } from "../styles";
import type { FieldProps } from "../types";

interface EnumOption<T extends string> {
  value: T;
  label: string;
  color?: string; // Badge 顏色
}

export function createEnumField<T extends string>(
  displayName: string,
  options: EnumOption<T>[]
) {
  const EnumField = memo(function EnumField({
    value,
    onChange,
    mode = "edit",
    error,
    disabled,
    required,
    label,
    className,
    id,
  }: FieldProps<T>) {
    const selectedOption = options.find((opt) => opt.value === value);

    // Readonly / Compact 模式
    if (mode === "readonly" || mode === "compact") {
      return (
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
            selectedOption?.color || "bg-gray-100 text-gray-800",
            className
          )}
        >
          {selectedOption?.label || value}
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
          onChange={(e) => onChange?.(e.target.value as T)}
          disabled={disabled}
          className={cn(
            FIELD_STYLES.input.base,
            error && FIELD_STYLES.input.error,
            disabled && FIELD_STYLES.input.disabled
          )}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className={FIELD_STYLES.error}>{error}</p>}
      </div>
    );
  });

  EnumField.displayName = displayName;
  return EnumField;
}
```

---

## 遷移策略

### 漸進式遷移

1. **新表單**：直接使用原子化欄位
2. **現有表單**：逐步替換，一個欄位一個 PR

### 向後相容

- 保留現有 props 接口
- 使用 adapter 包裝舊組件

---

## 風險與緩解

| 風險       | 緩解措施               |
| :--------- | :--------------------- |
| 過度設計   | 只做 3+ 次使用的欄位   |
| 樣式衝突   | 使用 FIELD_STYLES 統一 |
| Props 過多 | 使用 composition 拆分  |
| 測試不足   | 每個欄位配單元測試     |
