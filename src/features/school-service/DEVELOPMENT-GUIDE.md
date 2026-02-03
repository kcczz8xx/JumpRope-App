# School Service 開發指南

本文檔定義 `school-service` 功能模組的開發流程，供 Vibe Coding 時參照。

## 模組架構

```
src/features/school-service/
├── actions/              # Server Actions
│   ├── _helpers.ts       # 共用輔助函式
│   ├── [action].ts       # 獨立 action 檔案
│   └── index.ts          # 統一導出
├── queries/              # 資料查詢（Server-only）
│   └── index.ts
├── schemas/              # Zod 驗證 ⭐ Single Source of Truth
│   ├── common.ts         # Enums、常數、基礎 schemas
│   ├── [entity].ts       # 實體 schemas
│   └── index.ts
├── components/           # UI 元件
│   ├── [domain]/         # 按功能域分子目錄
│   └── types.ts          # UI Labels、Helper functions（從 schemas 導入）
├── hooks/                # 自訂 Hooks（可選）
├── server.ts             # Server-only exports
└── index.ts              # Public API
```

## 開發流程

### 1️⃣ 新增/修改 Schema

**位置**: `schemas/`

**步驟**:

1. 若涉及新 enum/常數 → 先在 `schemas/common.ts` 定義
2. 建立/修改對應 schema 檔案
3. 同時導出 schema 和 infer type
4. 在 `schemas/index.ts` 導出

```typescript
// schemas/[entity].ts
import { z } from "zod";
import { COURSE_TERMS, requiredStringSchema } from "./common";

export const createEntitySchema = z.object({
  name: requiredStringSchema("名稱"),
  term: z.enum(COURSE_TERMS),
});

export type CreateEntityInput = z.infer<typeof createEntitySchema>;
```

### 2️⃣ 新增 Server Action

**位置**: `actions/`

**步驟**:

1. 建立 `actions/[entity].ts`
2. 使用 `createAction` wrapper
3. 在 `actions/index.ts` 導出
4. 在 `index.ts` 公開 API 導出

```typescript
// actions/[entity].ts
"use server";

import { createAction, success, failure } from "@/lib/patterns";
import { createEntitySchema, type CreateEntityInput } from "../schemas";

export const createEntityAction = createAction<
  CreateEntityInput,
  { id: string }
>(
  async (input, ctx) => {
    // 業務邏輯
    return success({ id: "..." });
  },
  {
    schema: createEntitySchema,
    requireAuth: true,
  }
);
```

### 3️⃣ 新增 Query

**位置**: `queries/`

**步驟**:

1. 建立 query 函式
2. 在 `queries/index.ts` 導出
3. 在 `server.ts` 公開（Server-only）

```typescript
// queries/[entity].ts
import { prisma } from "@/lib/db";

export async function getEntityById(id: string) {
  return prisma.entity.findUnique({
    where: { id },
    select: { id: true, name: true }, // 明確 select
  });
}
```

### 4️⃣ 新增 UI 元件

**位置**: `components/`

**步驟**:

1. 決定放置位置（平鋪 or 子目錄）
2. 從 `../schemas` 或 `./types` 導入型別
3. 若需要 Server Action → 透過 props 傳遞

```typescript
// components/[domain]/EntityForm.tsx
"use client";

import { CourseTerm, COURSE_TERM_LABELS } from "../types";
import type { ActionResult } from "@/lib/patterns";

interface Props {
  submitAction: (data: FormData) => Promise<ActionResult>;
}

export default function EntityForm({ submitAction }: Props) {
  // ...
}
```

### 5️⃣ 更新 Public API

**步驟**:

1. `index.ts` — 導出 components、actions、schemas（Client-accessible）
2. `server.ts` — 導出 queries（Server-only）

## 檔案大小限制

| 類型        | 限制     | 超過時         |
| :---------- | :------- | :------------- |
| Action 檔案 | < 150 行 | 拆分為多個檔案 |
| Component   | < 200 行 | 拆分子元件     |
| Schema 檔案 | < 100 行 | 按實體拆分     |

## 型別定義原則

| 型別類型  | 位置                  | 說明                   |
| :-------- | :-------------------- | :--------------------- |
| Enums     | `schemas/common.ts`   | 運行時可用             |
| Zod Types | `schemas/[entity].ts` | 用 `z.infer` 生成      |
| UI Types  | `components/types.ts` | 純 UI 相關             |
| Labels    | `components/types.ts` | `Record<Enum, string>` |

## 表單邏輯管理

當表單有複雜的特定邏輯時，根據邏輯類型放置在不同位置：

### 邏輯分類與放置原則

| 邏輯類型          | 位置                          | 範例                               |
| :---------------- | :---------------------------- | :--------------------------------- |
| **驗證邏輯**      | `schemas/`                    | 日期範圍檢查、條件必填、跨欄位驗證 |
| **UI 狀態邏輯**   | `hooks/`                      | 表單步驟控制、欄位連動顯示/隱藏    |
| **資料轉換**      | `components/[form]/_utils.ts` | 表單資料 ↔ API 格式轉換            |
| **業務規則**      | `actions/_helpers.ts`         | 價格計算、權限檢查、資料關聯       |
| **預設值/初始化** | `components/types.ts`         | `getDefaultSchoolData()` 等        |

### 範例：複雜表單結構

```
components/new-course/
├── NewCourseForm.tsx           # 主表單元件（協調者）
├── _utils.ts                   # 表單專用工具函式
├── _constants.ts               # 表單專用常數
├── steps/                      # 多步驟表單
│   ├── Step1SchoolInfo.tsx
│   ├── Step2CourseInfo.tsx
│   └── Step3Review.tsx
└── fields/                     # 可重用欄位元件
    ├── ChargingModelField.tsx
    └── DateRangeField.tsx
```

### 1. 驗證邏輯（Schemas）

**放在 `schemas/` — 前後端共用**

```typescript
// schemas/new-course.ts
export const newCourseCourseItemSchema = z
  .object({
    chargingModel: z.array(z.enum(CHARGING_MODELS)).min(1, "請選擇收費模式"),
    studentPerLessonFee: z.number().nullable(),
    // ...
  })
  // ✅ 跨欄位驗證：根據 chargingModel 驗證對應金額
  .superRefine((data, ctx) => {
    if (
      data.chargingModel.includes("STUDENT_PER_LESSON") &&
      !data.studentPerLessonFee
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "請輸入收費金額",
        path: ["studentPerLessonFee"],
      });
    }
  });
```

### 2. UI 狀態邏輯（Hooks）

**放在 `hooks/` — 可跨元件重用**

```typescript
// hooks/useNewCourseForm.ts
"use client";

import { useState, useCallback } from "react";
import type { NewCourseFormData } from "../components/types";

export function useNewCourseForm(initialData?: Partial<NewCourseFormData>) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<NewCourseFormData>(() => ({
    ...getDefaultNewCourseFormData(),
    ...initialData,
  }));

  // 步驟導航
  const goNext = useCallback(() => setStep((s) => Math.min(s + 1, 3)), []);
  const goBack = useCallback(() => setStep((s) => Math.max(s - 1, 1)), []);

  // 欄位更新
  const updateSchool = useCallback((data: Partial<SchoolBasicData>) => {
    setFormData((prev) => ({ ...prev, school: { ...prev.school, ...data } }));
  }, []);

  // 條件邏輯：根據收費模式顯示對應欄位
  const getVisibleFeeFields = useCallback((chargingModels: ChargingModel[]) => {
    return {
      showStudentPerLesson: chargingModels.includes(
        ChargingModel.STUDENT_PER_LESSON
      ),
      showTutorPerLesson: chargingModels.includes(
        ChargingModel.TUTOR_PER_LESSON
      ),
      // ...
    };
  }, []);

  return {
    step,
    formData,
    goNext,
    goBack,
    updateSchool,
    getVisibleFeeFields,
  };
}
```

### 3. 資料轉換（\_utils.ts）

**放在元件目錄 — 表單專用**

```typescript
// components/new-course/_utils.ts

import type { NewCourseFormData } from "../types";
import type { BatchCreateWithSchoolInput } from "../../schemas";

/**
 * 將表單資料轉換為 API 格式
 */
export function transformFormToApi(
  formData: NewCourseFormData
): BatchCreateWithSchoolInput {
  return {
    school: {
      schoolName: formData.school.schoolName,
      // 轉換日期格式、處理 null 值等
      partnershipStartDate: formData.school.partnershipStartDate || undefined,
      partnershipEndDate: formData.school.partnershipEndDate || undefined,
    },
    contact: {
      nameChinese: formData.contact.nameChinese,
      // ...
    },
    courses: formData.courses.map((course) => ({
      courseName: course.courseName,
      // 移除前端專用欄位（如 id）
      // 轉換 enum 值
    })),
  };
}

/**
 * 將 API 回應轉換為表單資料（編輯時使用）
 */
export function transformApiToForm(
  apiData: SchoolWithCourses
): NewCourseFormData {
  // ...
}

/**
 * 計算課程總費用（業務邏輯輔助）
 */
export function calculateTotalFee(course: CourseItemData): number {
  // ...
}
```

### 4. 業務規則（Actions）

**放在 `actions/_helpers.ts` — 後端專用**

```typescript
// actions/_helpers.ts
import { prisma } from "@/lib/db";

/**
 * 檢查學校名稱是否重複
 */
export async function checkSchoolNameUnique(
  name: string,
  excludeId?: string
): Promise<boolean> {
  const existing = await prisma.school.findFirst({
    where: {
      schoolName: name,
      ...(excludeId && { id: { not: excludeId } }),
    },
  });
  return !existing;
}

/**
 * 計算導師薪資
 */
export function calculateTutorSalary(
  mode: SalaryCalculationMode,
  lessons: number,
  hours: number,
  rates: TutorRates
): number {
  switch (mode) {
    case SalaryCalculationMode.PER_LESSON:
      return lessons * rates.perLesson;
    case SalaryCalculationMode.HOURLY:
      return hours * rates.hourly;
    default:
      return rates.monthlyFixed;
  }
}
```

### 5. 欄位連動範例

```typescript
// components/new-course/fields/ChargingModelField.tsx
"use client";

import { ChargingModel, CHARGING_MODEL_LABELS } from "../../types";

interface Props {
  value: ChargingModel[];
  onChange: (value: ChargingModel[]) => void;
  visibleFeeFields: ReturnType<typeof useNewCourseForm>["getVisibleFeeFields"];
}

export default function ChargingModelField({ value, onChange, visibleFeeFields }: Props) {
  const visible = visibleFeeFields(value);

  return (
    <>
      {/* 收費模式多選 */}
      <CheckboxGroup value={value} onChange={onChange}>
        {Object.entries(CHARGING_MODEL_LABELS).map(([key, label]) => (
          <Checkbox key={key} value={key}>{label}</Checkbox>
        ))}
      </CheckboxGroup>

      {/* 條件顯示對應金額欄位 */}
      {visible.showStudentPerLesson && <NumberInput label="學生每節收費" ... />}
      {visible.showTutorPerLesson && <NumberInput label="導師每節收費" ... />}
    </>
  );
}
```

### 邏輯放置決策樹

```
需要前後端共用驗證？
  ├─ 是 → schemas/（Zod schema + refine/superRefine）
  └─ 否 → 繼續判斷 ↓

需要跨元件重用？
  ├─ 是 → hooks/useXxxForm.ts
  └─ 否 → 繼續判斷 ↓

只在特定表單使用？
  ├─ 是 → components/[form]/_utils.ts
  └─ 否 → 繼續判斷 ↓

需要資料庫操作？
  ├─ 是 → actions/_helpers.ts
  └─ 否 → 放在元件內部
```

## Import 規則

```typescript
// ✅ 功能內部：相對路徑
import { CourseTerm } from "../schemas/common";
import { createSchoolSchema } from "../schemas";

// ✅ 對外使用：透過公開 API
import { createSchoolAction, createSchoolSchema } from "@/features/school-service";

// ❌ 禁止：直接 import 內部檔案
import { ... } from "@/features/school-service/actions/school";
```

## Checklist

### 新功能開發

- [ ] Schema 定義在 `schemas/`
- [ ] Enum/常數定義在 `schemas/common.ts`
- [ ] Action 使用 `createAction` wrapper
- [ ] Query 透過 `server.ts` 導出
- [ ] Component 從 schemas 導入型別
- [ ] 在 `index.ts` / `server.ts` 更新 exports
- [ ] Type-check 通過

### 代碼審查

- [ ] 無重複型別定義
- [ ] 無跨 feature import
- [ ] 檔案大小在限制內
- [ ] Zod 驗證完整
