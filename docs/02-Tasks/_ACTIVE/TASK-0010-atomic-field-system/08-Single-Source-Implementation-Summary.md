# Single Source Architecture - 實作總結

**完成日期**：2026-02-03

---

## 概述

實作了 **Single Source of Truth** 架構，統一管理所有 Enum 的配置。

### 核心原則

```
Prisma Schema（唯一來源）
    ↓
Enum Config（唯一定義點：value + label + color）
    ↓
├── Zod Schema（自動生成）
├── getLabel()（自動取得）
├── getColor()（自動取得）
└── getOptions()（自動取得）
```

---

## 已建立檔案

### 基礎架構

| 檔案 | 用途 |
|:-----|:-----|
| `configs/enums/types.ts` | `EnumConfig`, `EnumOption`, `EnumHelpers` 類型定義 |
| `configs/enums/utils.ts` | `createEnumHelpers()` 工廠函數 |
| `configs/enums/index.ts` | 統一導出 |
| `configs/index.ts` | configs 入口 |

### Enum Config 檔案（12 個）

| Config | Prisma Enum | 選項數量 |
|:-------|:------------|:--------:|
| `course-status.config.ts` | `CourseStatus` | 6 |
| `course-term.config.ts` | `CourseTerm` | 4 |
| `lesson-status.config.ts` | `LessonStatus` | 5 |
| `lesson-type.config.ts` | `LessonType` | 3 |
| `invoice-status.config.ts` | `InvoiceStatus` | 8 |
| `payment-method.config.ts` | `PaymentMethod` | 10 |
| `payment-status.config.ts` | `PaymentStatus` | 4 |
| `partnership-status.config.ts` | `PartnershipStatus` | 7 |
| `charging-model.config.ts` | `ChargingModel` | 6 |
| `tutor-role.config.ts` | `TutorRole` | 6 |
| `user-role.config.ts` | `UserRole` | 6 |
| `gender.config.ts` | `Gender` | 2 |

---

## 目錄結構

```
src/features/_core/
├── configs/
│   ├── enums/
│   │   ├── types.ts
│   │   ├── utils.ts
│   │   ├── course-status.config.ts
│   │   ├── course-term.config.ts
│   │   ├── lesson-status.config.ts
│   │   ├── lesson-type.config.ts
│   │   ├── invoice-status.config.ts
│   │   ├── payment-method.config.ts
│   │   ├── payment-status.config.ts
│   │   ├── partnership-status.config.ts
│   │   ├── charging-model.config.ts
│   │   ├── tutor-role.config.ts
│   │   ├── user-role.config.ts
│   │   ├── gender.config.ts
│   │   └── index.ts
│   └── index.ts
│
├── components/fields/    # 原子化欄位（已有）
├── schemas/              # Zod Schema（已有）
└── ...
```

---

## 使用方式

### 1. 取得 Label/Color

```typescript
import {
  getCourseStatusLabel,
  getCourseStatusColor,
  CourseStatus,
} from "@/features/_core/configs/enums";

const label = getCourseStatusLabel(CourseStatus.ACTIVE); // "進行中"
const color = getCourseStatusColor(CourseStatus.ACTIVE); // "green"
```

### 2. 取得 Select Options

```typescript
import { getCourseStatusOptions } from "@/features/_core/configs/enums";

const options = getCourseStatusOptions();
// [
//   { value: "DRAFT", label: "草稿", color: "gray" },
//   { value: "SCHEDULED", label: "已排程", color: "blue" },
//   ...
// ]
```

### 3. Zod Schema 驗證

```typescript
import { courseStatusSchema } from "@/features/_core/configs/enums";

const result = courseStatusSchema.safeParse("ACTIVE");
// { success: true, data: "ACTIVE" }
```

### 4. 使用 Helpers 物件

```typescript
import { CourseStatusHelpers } from "@/features/_core/configs/enums";

CourseStatusHelpers.getLabel("DRAFT");     // "草稿"
CourseStatusHelpers.getColor("ACTIVE");    // "green"
CourseStatusHelpers.getOptions();          // [...全部選項]
CourseStatusHelpers.schema.parse("DRAFT"); // Zod 驗證
```

### 5. 直接使用 Config

```typescript
import { COURSE_STATUS_CONFIG } from "@/features/_core/configs/enums";

// 用於 EnumField 組件
<EnumField config={COURSE_STATUS_CONFIG} value={status} onChange={setStatus} />
```

---

## 改動流程

### 新增 Enum 值

1. **改 Prisma Schema**
   ```prisma
   enum CourseStatus {
     // ...existing
     ARCHIVED  // 新增
   }
   ```

2. **改對應 Config**
   ```typescript
   // course-status.config.ts
   options: [
     // ...existing
     { value: CourseStatus.ARCHIVED, label: "已歸檔", color: "purple" },
   ],
   ```

3. **完成**（Field 自動反映）

### 修改 Label/Color

1. **只改 Config**（不改 Prisma）
   ```typescript
   // 舊
   { value: CourseStatus.DRAFT, label: "草稿", color: "gray" }
   // 新
   { value: CourseStatus.DRAFT, label: "待審核", color: "yellow" }
   ```

2. **完成**（Field 自動反映）

---

## 驗證結果

```bash
pnpm type-check
# ✅ 通過
```

---

## 待完成（可選）

| 項目 | 優先級 | 說明 |
|:-----|:------:|:-----|
| 一致性測試 | P1 | `sync.test.ts` 檢查 Prisma ↔ Config 同步 |
| 非 Enum 欄位 Config | P2 | `phone.config.ts`, `email.config.ts` 等 |
| 更新現有 Field 組件 | P2 | 改用 Config 消費 |
| 刪除舊重複定義 | P3 | `school-service/schemas/common.ts` 中的 Enum |

---

## 相關文檔

- `06-Refactoring-Recommendations.md` - 重構建議
- `07-Single-Source-Architecture.md` - 架構設計
