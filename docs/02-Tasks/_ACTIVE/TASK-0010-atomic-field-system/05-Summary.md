# 原子化欄位系統 - 總結文檔

## 概述

本任務建立了一套可重用的原子化表單欄位組件系統，放置於 `src/features/_core/components/fields/`，支援三種顯示模式（edit/readonly/compact），並搭配 Zod Schema 進行驗證。

---

## 統計

| 項目 | 數量 |
|:-----|:----:|
| **組件總數** | 24 個 |
| **Zod Schema** | 5 個 |
| **單元測試** | 42 個 |
| **目錄數** | 6 個 |

---

## 目錄結構

```
src/features/_core/
├── components/
│   └── fields/
│       ├── index.ts           # 公開 API
│       ├── types.ts           # FieldMode, FieldProps, etc.
│       ├── styles.ts          # FIELD_STYLES（含 dark mode）
│       │
│       ├── _shared/           # 8 個基礎組件
│       │   ├── PhoneField.tsx
│       │   ├── EmailField.tsx
│       │   ├── ChineseNameField.tsx
│       │   ├── EnglishNameField.tsx
│       │   ├── CurrencyField.tsx
│       │   ├── RemarksField.tsx
│       │   ├── DateField.tsx
│       │   └── TimeField.tsx
│       │
│       ├── _enum/             # Enum 工廠
│       │   ├── factory.tsx    # createEnumField()
│       │   └── labels.ts      # 中文標籤 + 顏色對照
│       │
│       ├── school/            # 3 個組件
│       │   ├── PartnershipStatusField.tsx
│       │   ├── SchoolContactField.tsx
│       │   └── AddressField.tsx
│       │
│       ├── course/            # 5 個組件
│       │   ├── CourseStatusField.tsx
│       │   ├── CourseTermField.tsx
│       │   ├── ChargingModelField.tsx
│       │   ├── DateRangeField.tsx
│       │   └── AcademicYearField.tsx
│       │
│       ├── lesson/            # 3 個組件
│       │   ├── LessonStatusField.tsx
│       │   ├── LessonTypeField.tsx
│       │   └── TimeRangeField.tsx
│       │
│       ├── invoice/           # 3 個組件
│       │   ├── InvoiceStatusField.tsx
│       │   ├── PaymentMethodField.tsx
│       │   └── ContactField.tsx
│       │
│       └── __tests__/         # 單元測試
│           ├── PhoneField.test.tsx
│           ├── createEnumField.test.tsx
│           └── ContactField.test.tsx
│
└── schemas/
    ├── index.ts               # 統一導出
    └── _shared/
        ├── index.ts
        ├── phone.schema.ts
        ├── email.schema.ts
        ├── name.schema.ts
        ├── currency.schema.ts
        └── date.schema.ts
```

---

## 組件清單

### 基礎欄位（_shared/）

| 組件 | 用途 | 特殊 Props |
|:-----|:-----|:-----------|
| `PhoneField` | 電話號碼 | `showCountryCode`, `countryCode` |
| `EmailField` | 電郵地址 | - |
| `ChineseNameField` | 中文姓名 | - |
| `EnglishNameField` | 英文姓名 | - |
| `CurrencyField` | 金額 | `currencySymbol`, `decimalPlaces` |
| `RemarksField` | 備註 | `maxLength`, `rows`, `showCount` |
| `DateField` | 日期選擇 | `min`, `max` |
| `TimeField` | 時間選擇 | `step`, `min`, `max` |

### 日期範圍欄位

| 組件 | 放置位置 | 用途 |
|:-----|:---------|:-----|
| `DateRangeField` | `course/` | 課程日期範圍 |
| `TimeRangeField` | `lesson/` | 上課時間範圍 |
| `AcademicYearField` | `course/` | 學年選擇 |

### Enum 欄位

| 組件 | 放置位置 | Enum |
|:-----|:---------|:-----|
| `CourseStatusField` | `course/` | CourseStatus |
| `CourseTermField` | `course/` | CourseTerm |
| `ChargingModelField` | `course/` | ChargingModel |
| `LessonStatusField` | `lesson/` | LessonStatus |
| `LessonTypeField` | `lesson/` | LessonType |
| `InvoiceStatusField` | `invoice/` | InvoiceStatus |
| `PaymentMethodField` | `invoice/` | PaymentMethod |
| `PartnershipStatusField` | `school/` | PartnershipStatus |

### 複合欄位

| 組件 | 放置位置 | 包含欄位 |
|:-----|:---------|:---------|
| `ContactField` | `invoice/` | name, phone, email |
| `SchoolContactField` | `school/` | salutation, nameChinese, nameEnglish, position, phone, email |
| `AddressField` | `school/` | line1, line2, district, region |

---

## 使用方式

### 基本 Import

```typescript
// 組件
import { 
  PhoneField, 
  EmailField, 
  DateRangeField,
  CourseStatusField,
  ContactField,
  AddressField,
  FIELD_STYLES,
  type FieldProps,
  type FieldMode,
} from "@/features/_core";

// Schemas
import { 
  phoneSchema, 
  emailSchema,
  dateRangeSchema,
} from "@/features/_core/schemas";
```

### 顯示模式

```tsx
// Edit 模式（預設）— 可編輯輸入
<PhoneField
  value={phone}
  onChange={setPhone}
  label="電話號碼"
  required
  error={errors.phone?.message}
/>

// Readonly 模式 — 純顯示
<PhoneField value={phone} mode="readonly" label="電話號碼" />

// Compact 模式 — 精簡顯示（用於列表）
<PhoneField value={phone} mode="compact" />
```

### 搭配 react-hook-form

```tsx
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PhoneField } from "@/features/_core";
import { phoneSchema } from "@/features/_core/schemas";

const schema = z.object({ phone: phoneSchema });

function MyForm() {
  const { control, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  return (
    <Controller
      name="phone"
      control={control}
      render={({ field }) => (
        <PhoneField
          {...field}
          label="電話號碼"
          required
          error={errors.phone?.message}
        />
      )}
    />
  );
}
```

### 自訂 Enum 欄位

```typescript
import { createEnumField, type EnumOption } from "@/features/_core";

const MY_OPTIONS: EnumOption<string>[] = [
  { value: "PENDING", label: "待處理", color: "yellow" },
  { value: "APPROVED", label: "已批准", color: "green" },
];

export const MyStatusField = createEnumField("MyStatusField", MY_OPTIONS);
```

---

## Zod Schema 清單

| Schema | 用途 |
|:-------|:-----|
| `phoneSchema` / `phoneOptionalSchema` | 香港電話格式 |
| `phoneInternationalSchema` | 國際電話格式 |
| `emailSchema` / `emailOptionalSchema` | 電郵格式 |
| `chineseNameSchema` / `englishNameSchema` | 姓名格式 |
| `currencySchema` / `currencyNumberSchema` | 金額格式 |
| `dateSchema` / `timeSchema` | 日期/時間格式 |
| `dateRangeSchema` / `timeRangeSchema` | 範圍驗證 |
| `academicYearSchema` | 學年格式（YYYY-YYYY） |

---

## 驗證通過

```bash
pnpm type-check  # ✅ 通過
pnpm test        # ✅ 42 個測試全部通過
```

---

## Demo 頁面

訪問 `/demo` 可查看所有組件的即時展示，支援 Edit/Readonly/Compact 三種模式切換。

---

## 後續工作

1. **整合**：將欄位組件整合到 `school-service/components/`
2. **整合**：將欄位組件整合到 `user/components/`
3. **可選**：抽取最佳實踐到 `docs/03-Knowledge-Base/`
