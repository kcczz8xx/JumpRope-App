# Single Source Architecture - Enum & Options 統一設計

## 設計原則

> **每個定義只出現在一個地方，避免多邊維護**

### 核心問題

目前架構中，一個 Enum（如 `CourseStatus`）需要在多處維護：

```
❌ 當前問題架構
├── Prisma Schema      → enum CourseStatus { DRAFT, ACTIVE... }
├── TS Enum            → enum CourseStatus { DRAFT = "DRAFT"... }
├── Zod 常數           → COURSE_STATUSES = ["DRAFT"...] as const
├── UI Labels          → { DRAFT: "草稿", ACTIVE: "進行中"... }
└── Field Options      → [{ value: "DRAFT", label: "草稿", color: "gray" }...]
```

**新增一個狀態需要改 5 個地方！**

---

## 新架構：Single Source of Truth

### 方案：Prisma → 自動生成 → 統一消費

```
✅ 新架構
Prisma Schema（唯一來源）
    ↓ prisma generate
Generated Enums（@prisma/client）
    ↓ 手動定義一次
Enum Config（含 label + color）← 唯一定義點
    ↓ 自動消費
├── Zod Schema（自動推導）
├── UI Field（自動渲染）
└── Labels/Colors（自動取得）
```

---

## 具體實現

### 1. Prisma Schema（已有）

```prisma
// prisma/schema/school/_enums.prisma
enum CourseStatus {
  DRAFT      // 草稿
  SCHEDULED  // 已排程
  ACTIVE     // 進行中
  COMPLETED  // 已完成
  CANCELLED  // 已取消
  SUSPENDED  // 已暫停
}
```

### 2. Enum Config（唯一定義點）

```typescript
// src/features/_core/schemas/enums/course-status.config.ts
import { CourseStatus } from "@prisma/client";
import type { EnumConfig } from "../types";

/**
 * CourseStatus 的完整定義
 * 這是 Single Source of Truth
 */
export const COURSE_STATUS_CONFIG: EnumConfig<CourseStatus> = {
  // 值來自 Prisma，確保同步
  values: Object.values(CourseStatus),

  // 每個值的完整配置
  options: [
    { value: CourseStatus.DRAFT, label: "草稿", color: "gray" },
    { value: CourseStatus.SCHEDULED, label: "已排程", color: "blue" },
    { value: CourseStatus.ACTIVE, label: "進行中", color: "green" },
    { value: CourseStatus.COMPLETED, label: "已完成", color: "purple" },
    { value: CourseStatus.CANCELLED, label: "已取消", color: "red" },
    { value: CourseStatus.SUSPENDED, label: "已暫停", color: "yellow" },
  ],

  // 預設值
  default: CourseStatus.DRAFT,
};
```

### 3. 統一類型定義

```typescript
// src/features/_core/schemas/enums/types.ts
import type { BadgeColor } from "../../components/fields/styles";

export interface EnumOption<T extends string> {
  value: T;
  label: string;
  color: BadgeColor;
  description?: string; // 可選：hover 提示
  disabled?: boolean; // 可選：禁用選項
}

export interface EnumConfig<T extends string> {
  values: T[];
  options: EnumOption<T>[];
  default?: T;
}

// 工具函數類型
export type GetLabel<T extends string> = (value: T) => string;
export type GetColor<T extends string> = (value: T) => BadgeColor;
export type GetOptions<T extends string> = () => EnumOption<T>[];
```

### 4. 自動生成工具函數

```typescript
// src/features/_core/schemas/enums/utils.ts
import { z } from "zod";
import type { EnumConfig, EnumOption } from "./types";

/**
 * 從 EnumConfig 創建所有需要的工具
 */
export function createEnumHelpers<T extends string>(config: EnumConfig<T>) {
  // Zod Schema（自動從 config 推導）
  const schema = z.enum(config.values as [T, ...T[]]);

  // 可選 Schema
  const optionalSchema = schema.optional();

  // 取得標籤
  const getLabel = (value: T): string => {
    return config.options.find((opt) => opt.value === value)?.label ?? value;
  };

  // 取得顏色
  const getColor = (value: T): string => {
    return config.options.find((opt) => opt.value === value)?.color ?? "gray";
  };

  // 取得所有選項（用於 select/dropdown）
  const getOptions = (): EnumOption<T>[] => {
    return config.options;
  };

  // 取得預設值
  const getDefault = (): T | undefined => {
    return config.default;
  };

  return {
    schema,
    optionalSchema,
    getLabel,
    getColor,
    getOptions,
    getDefault,
    values: config.values,
  };
}
```

### 5. 使用範例

```typescript
// src/features/_core/schemas/enums/index.ts
import { CourseStatus } from "@prisma/client";
import { COURSE_STATUS_CONFIG } from "./course-status.config";
import { createEnumHelpers } from "./utils";

// 一次性創建所有工具
export const CourseStatusHelpers = createEnumHelpers(COURSE_STATUS_CONFIG);

// 導出常用的
export const {
  schema: courseStatusSchema,
  optionalSchema: courseStatusOptionalSchema,
  getLabel: getCourseStatusLabel,
  getColor: getCourseStatusColor,
  getOptions: getCourseStatusOptions,
} = CourseStatusHelpers;

// 重新導出 Prisma Enum
export { CourseStatus } from "@prisma/client";
```

---

## UI 組件整合

### 方案 A：通用 EnumField（推薦）

```typescript
// src/features/_core/components/fields/_enum/EnumField.tsx
import type { EnumConfig } from "../../schemas/enums/types";

interface EnumFieldProps<T extends string> {
  config: EnumConfig<T>;
  value: T;
  onChange?: (value: T) => void;
  mode?: "edit" | "readonly" | "compact";
  // ... 其他 FieldProps
}

export function EnumField<T extends string>({
  config,
  value,
  onChange,
  mode = "edit",
  ...props
}: EnumFieldProps<T>) {
  // 從 config 自動取得 options
  const options = config.options;
  // ...
}
```

**使用方式：**

```tsx
import { COURSE_STATUS_CONFIG } from "@/features/_core/schemas/enums";
import { EnumField } from "@/features/_core";

<EnumField
  config={COURSE_STATUS_CONFIG}
  value={status}
  onChange={setStatus}
  label="課程狀態"
/>;
```

### 方案 B：預建組件（當前方式）

保留 `CourseStatusField`，但內部使用 config：

```typescript
// src/features/_core/components/fields/course/CourseStatusField.tsx
import { COURSE_STATUS_CONFIG } from "../../schemas/enums";
import { EnumField } from "../_enum/EnumField";

export const CourseStatusField = (props) => (
  <EnumField config={COURSE_STATUS_CONFIG} {...props} />
);
```

---

## 第三方庫考量

### react-select / react-hook-form 整合

```typescript
// 如果使用 react-select
import Select from "react-select";

function EnumSelect<T extends string>({ config, value, onChange }) {
  const options = config.options.map((opt) => ({
    value: opt.value,
    label: opt.label,
    // react-select 支援自定義渲染
    color: opt.color,
  }));

  return (
    <Select
      options={options}
      value={options.find((opt) => opt.value === value)}
      onChange={(selected) => onChange?.(selected?.value)}
      // 可自定義樣式
      styles={{
        option: (base, state) => ({
          ...base,
          backgroundColor: state.data.color,
        }),
      }}
    />
  );
}
```

### Headless UI（shadcn/ui 風格）

```typescript
// 使用 shadcn/ui 的 Select
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function EnumSelect<T extends string>({ config, value, onChange }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="請選擇" />
      </SelectTrigger>
      <SelectContent>
        {config.options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            <span className={`badge-${opt.color}`}>{opt.label}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
```

---

## 最終目錄結構

```
src/features/_core/
├── configs/                      # ⭐ Single Source of Truth
│   ├── enums/                    # Enum 配置
│   │   ├── types.ts              # EnumConfig interface
│   │   ├── utils.ts              # createEnumHelpers
│   │   ├── course-status.config.ts
│   │   ├── course-term.config.ts
│   │   ├── lesson-status.config.ts
│   │   ├── lesson-type.config.ts
│   │   ├── invoice-status.config.ts
│   │   ├── payment-method.config.ts
│   │   ├── partnership-status.config.ts
│   │   ├── __tests__/
│   │   │   └── sync.test.ts      # 一致性測試
│   │   └── index.ts
│   │
│   └── fields/                   # 非 Enum 欄位配置
│       ├── types.ts
│       ├── phone.config.ts
│       ├── email.config.ts
│       ├── currency.config.ts
│       └── index.ts
│
├── schemas/
│   └── _shared/                  # Zod Schema（消費 configs）
│
└── components/fields/
    ├── _enum/
    │   ├── EnumField.tsx         # 通用 Enum 組件
    │   └── EnumBadge.tsx         # Badge 顯示組件
    │
    └── ...（其他組件保持不變）
```

---

## 延伸設計

### 1. 非 Enum 欄位也要「單一來源」

```typescript
// src/features/_core/configs/fields/phone.config.ts
import { z } from "zod";

export const PHONE_CONFIG = {
  // 單一來源：格式規則
  pattern: /^(\+852|852)?[2-9]\d{7}$/,

  // UI 層參考
  placeholder: "2XXX XXXX",
  hint: "香港電話格式：8位數字",
  maxLength: 12,

  // Zod Schema
  schema: z
    .string()
    .regex(/^(\+852|852)?[2-9]\d{7}$/, "請輸入有效的香港電話號碼")
    .refine((val) => val.length >= 8, "電話號碼太短"),
} as const;
```

### 2. Enum 變化歷史追蹤

```typescript
// src/features/_core/configs/enums/course-status.config.ts
import { CourseStatus } from "@prisma/client";
import type { EnumConfig } from "./types";

/**
 * CourseStatus Enum Config
 *
 * ⚠️ 變更歷史
 * - 2026-02-03：初始版本（DRAFT, SCHEDULED, ACTIVE, COMPLETED, CANCELLED, SUSPENDED）
 * - [待更新]
 */
export const COURSE_STATUS_CONFIG: EnumConfig<CourseStatus> = {
  values: Object.values(CourseStatus),
  options: [
    { value: CourseStatus.DRAFT, label: "草稿", color: "gray" },
    // ...
  ],
  default: CourseStatus.DRAFT,
};
```

### 3. 自動化一致性測試

```typescript
// src/features/_core/configs/enums/__tests__/sync.test.ts
import { CourseStatus } from "@prisma/client";
import { COURSE_STATUS_CONFIG } from "../course-status.config";

describe("Enum Config Sync Check", () => {
  test("CourseStatus - Config values should match Prisma", () => {
    const prismaValues = Object.values(CourseStatus);
    const configValues = COURSE_STATUS_CONFIG.values;

    expect(configValues.sort()).toEqual(prismaValues.sort());
  });

  test("CourseStatus - All values should have labels", () => {
    COURSE_STATUS_CONFIG.values.forEach((value) => {
      const hasLabel = COURSE_STATUS_CONFIG.options.some(
        (opt) => opt.value === value
      );
      expect(hasLabel).toBe(true);
    });
  });
});
```

---

## 遷移步驟

### Step 1：建立新架構

1. 建立 `schemas/enums/types.ts`
2. 建立 `schemas/enums/utils.ts`
3. 建立第一個 config：`course-status.config.ts`

### Step 2：更新 UI 組件

1. 建立通用 `EnumField.tsx`
2. 更新現有 `CourseStatusField` 使用新架構

### Step 3：刪除舊代碼

1. 刪除 `school-service/schemas/common.ts` 中的 Enum
2. 刪除 `_enum/labels.ts` 中的重複定義
3. 更新所有 import

---

## 優點總結

| 特性         |    舊架構    |     新架構     |
| :----------- | :----------: | :------------: |
| 新增 Enum 值 |   改 5 處    |    改 1 處     |
| 維護 Label   |     分散     |      集中      |
| 類型安全     |      ⚠️      | ✅ Prisma 同步 |
| 靈活度       | 高（但混亂） |  高（有約束）  |
