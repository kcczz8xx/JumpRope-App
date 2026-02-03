# Feature Module 開發指南

本文檔定義 `src/features/` 目錄下所有功能模組的開發流程，供 Vibe Coding 時參照。

> 📖 結構規範請參考 [STRUCTURE.md](./STRUCTURE.md)

---

## 模組架構

```
src/features/[feature-name]/
├── actions/              # Server Actions
│   ├── _helpers.ts       # 共用輔助函式（_ 前綴避免導出）
│   ├── [entity].ts       # 獨立 action 檔案
│   └── index.ts          # 統一導出
├── queries/              # 資料查詢（Server-only）
│   ├── [entity].ts
│   └── index.ts
├── schemas/              # Zod 驗證 ⭐ Single Source of Truth
│   ├── common.ts         # Enums、常數、基礎 schemas
│   ├── [entity].ts       # 實體 schemas
│   └── index.ts
├── components/           # UI 元件
│   ├── [domain]/         # 按功能域分子目錄
│   ├── types.ts          # UI Labels、Helper functions
│   └── index.ts
├── hooks/                # 自訂 Hooks（可選）
├── server.ts             # Server-only exports（必須）
└── index.ts              # Public API（必須）
```

---

## 開發流程

### 1️⃣ Schema 優先

**位置**: `schemas/`

**原則**: Schema 是型別的 Single Source of Truth

```typescript
// schemas/common.ts — 共用 enums/常數
export enum Status {
  DRAFT = "DRAFT",
  ACTIVE = "ACTIVE",
}

export const STATUSES = ["DRAFT", "ACTIVE"] as const;

// schemas/[entity].ts — 實體 schema
import { z } from "zod";
import { STATUSES } from "./common";

export const createEntitySchema = z.object({
  name: z.string().min(1, "請輸入名稱"),
  status: z.enum(STATUSES).default("DRAFT"),
});

export type CreateEntityInput = z.infer<typeof createEntitySchema>;

// schemas/index.ts — 統一導出
export * from "./common";
export * from "./entity";
```

### 2️⃣ Server Action

**位置**: `actions/`

**原則**: 使用 `createAction` wrapper，自動處理驗證、認證、審計

```typescript
// actions/[entity].ts
"use server";

import { createAction, success, failure } from "@/lib/patterns";
import { createEntitySchema, type CreateEntityInput } from "../schemas";

export const createEntityAction = createAction<CreateEntityInput, { id: string }>(
  async (input, ctx) => {
    // ctx.session 自動提供
    const entity = await prisma.entity.create({ data: input });
    return success({ id: entity.id });
  },
  {
    schema: createEntitySchema,
    requireAuth: true,
    audit: true,
    auditAction: "CREATE_ENTITY",
  }
);

// actions/index.ts
export { createEntityAction, updateEntityAction } from "./entity";
```

### 3️⃣ Query（Server-only）

**位置**: `queries/`

**原則**: 透過 `server.ts` 導出，只能在 Server Components 使用

```typescript
// queries/[entity].ts
import { prisma } from "@/lib/db";

export async function getEntityById(id: string) {
  return prisma.entity.findUnique({
    where: { id },
    select: { id: true, name: true, status: true },
  });
}

export async function listEntities(filters?: EntityFilters) {
  return prisma.entity.findMany({
    where: filters,
    orderBy: { createdAt: "desc" },
  });
}

// queries/index.ts
export { getEntityById, listEntities } from "./entity";
```

### 4️⃣ UI 元件

**位置**: `components/`

**原則**: 
- 從 schemas 導入型別
- Server Actions 透過 props 傳遞
- UI Labels 放在 `types.ts`

```typescript
// components/types.ts — UI 專用
import { Status } from "../schemas/common";

// Re-export for convenience
export { Status } from "../schemas/common";

// UI Labels
export const STATUS_LABELS: Record<Status, string> = {
  [Status.DRAFT]: "草稿",
  [Status.ACTIVE]: "啟用",
};

// Helper functions
export function getDefaultFormData(): EntityFormData {
  return { name: "", status: Status.DRAFT };
}

// components/[domain]/EntityForm.tsx
"use client";

import { Status, STATUS_LABELS } from "../types";
import type { ActionResult } from "@/lib/patterns";

interface Props {
  submitAction: (data: FormData) => Promise<ActionResult>;
}

export default function EntityForm({ submitAction }: Props) {
  // ...
}
```

### 5️⃣ Public API

**原則**: 控制對外公開的介面

```typescript
// index.ts — Client-accessible
export { EntityForm } from "./components";
export { createEntityAction, updateEntityAction } from "./actions";
export { createEntitySchema, type CreateEntityInput } from "./schemas";

// server.ts — Server-only
import "server-only";
export { getEntityById, listEntities } from "./queries";
```

---

## 表單邏輯管理

### 邏輯分類與放置原則

| 邏輯類型 | 位置 | 範例 |
|:-----|:-----|:-----|
| **驗證邏輯** | `schemas/` | 跨欄位驗證、條件必填 |
| **UI 狀態邏輯** | `hooks/` | 步驟控制、欄位連動 |
| **資料轉換** | `components/[form]/_utils.ts` | 表單 ↔ API 格式 |
| **業務規則** | `actions/_helpers.ts` | 價格計算、唯一性檢查 |
| **預設值** | `components/types.ts` | `getDefaultFormData()` |

### 複雜表單結構

```
components/[form-name]/
├── [FormName]Form.tsx      # 主表單元件（協調者）
├── _utils.ts               # 表單專用工具
├── _constants.ts           # 表單專用常數
├── steps/                  # 多步驟表單
│   ├── Step1.tsx
│   └── Step2.tsx
└── fields/                 # 可重用欄位元件
    └── CustomField.tsx
```

### 邏輯放置決策樹

```
需要前後端共用驗證？
  ├─ 是 → schemas/（Zod refine/superRefine）
  └─ 否 ↓

需要跨元件重用？
  ├─ 是 → hooks/useXxxForm.ts
  └─ 否 ↓

只在特定表單使用？
  ├─ 是 → components/[form]/_utils.ts
  └─ 否 ↓

需要資料庫操作？
  ├─ 是 → actions/_helpers.ts
  └─ 否 → 放在元件內部
```

---

## 檔案大小限制

| 類型 | 限制 | 超過時 |
|:-----|:-----|:-----|
| Action 檔案 | < 150 行 | 按實體拆分 |
| Component | < 200 行 | 拆子元件 |
| Schema 檔案 | < 100 行 | 按實體拆分 |
| Hook | < 100 行 | 拆分邏輯 |

---

## Import 規則

```typescript
// ✅ 功能內部：相對路徑
import { Status } from "../schemas/common";
import { createEntitySchema } from "../schemas";
import { STATUS_LABELS } from "./types";

// ✅ 對外使用：透過公開 API
import { EntityForm, createEntityAction } from "@/features/[feature-name]";
import { getEntityById } from "@/features/[feature-name]/server";

// ✅ 跨 feature 共用：透過 _core 或 lib
import { failureFromCode } from "@/features/_core/error-codes";
import { formatDate } from "@/lib/utils";

// ❌ 禁止：直接 import 內部檔案
import { ... } from "@/features/[feature-name]/actions/entity";

// ❌ 禁止：跨 feature 直接 import
import { ... } from "@/features/other-feature/components/...";
```

---

## Checklist

### 新建 Feature Module

- [ ] 建立目錄結構（actions/, schemas/, components/, queries/）
- [ ] 建立 `index.ts`（Public API）
- [ ] 建立 `server.ts`（Server-only exports）
- [ ] 在 `AGENTS.md` 更新模組清單

### 新增功能

- [ ] Schema 定義在 `schemas/`
- [ ] Enum/常數定義在 `schemas/common.ts`
- [ ] Action 使用 `createAction` wrapper
- [ ] Query 透過 `server.ts` 導出
- [ ] Component 從 schemas 導入型別
- [ ] 更新 `index.ts` / `server.ts` exports

### 代碼審查

- [ ] 無重複型別定義
- [ ] 無跨 feature import
- [ ] 檔案大小在限制內
- [ ] Zod 驗證完整
- [ ] Type-check 通過

---

## 範例模組

參考 `school-service` 模組作為完整實作範例：

```
src/features/school-service/
├── actions/
│   ├── _helpers.ts
│   ├── school.ts
│   ├── course.ts
│   └── index.ts
├── queries/
│   └── index.ts
├── schemas/
│   ├── common.ts       # ⭐ Enums、常數的 Single Source of Truth
│   ├── school.ts
│   ├── course.ts
│   ├── contact.ts
│   ├── batch.ts
│   ├── new-course.ts
│   └── index.ts
├── components/
│   ├── new-course/     # 複雜表單範例
│   ├── school/
│   ├── course/
│   ├── types.ts        # UI Labels + Helper functions
│   └── index.ts
├── hooks/
│   └── useNewCourseForm.ts
├── server.ts
├── index.ts
└── DEVELOPMENT-GUIDE.md  # 模組專屬補充說明
```
