# School Service Schemas

本目錄定義 `school-service` 功能模組的所有 Zod 驗證 schemas。

## 架構原則

**Single Source of Truth** — 所有 enums、常數、型別定義集中在 `common.ts`，其他檔案從此導入。

```
schemas/
├── common.ts       # ⭐ Enums、常數、基礎 schemas（Single Source of Truth）
├── school.ts       # 學校相關 schemas
├── contact.ts      # 聯絡人相關 schemas
├── course.ts       # 課程相關 schemas
├── batch.ts        # 批量建立 schemas
├── new-course.ts   # 新增課程表單 schemas
└── index.ts        # 統一導出
```

## 檔案說明

### `common.ts`

**核心定義檔案**，包含：

| 類別 | 內容 |
|:-----|:-----|
| Enums | `CourseTerm`, `ChargingModel`, `CourseStatus`, `SalaryCalculationMode`, `LessonType`, `LessonStatus` |
| 常數 | `COURSE_TERMS`, `CHARGING_MODELS`, `COURSE_STATUSES`, `LESSON_TYPES`, `LESSON_STATUSES`, `DEFAULT_COURSE_TYPES` |
| 基礎 Schemas | `requiredStringSchema`, `optionalStringSchema`, `optionalEmailSchema`, `dateRangeSchema` 等 |
| Types | `CourseType`, `CourseTermType`, `ChargingModelType` 等 |

### 其他 Schema 檔案

- **`school.ts`** — `createSchoolSchema`, `updateSchoolSchema`
- **`contact.ts`** — `schoolContactSchema`
- **`course.ts`** — `createCourseSchema`, `updateCourseSchema`
- **`batch.ts`** — `batchCreateWithSchoolSchema`（批量建立學校+課程）
- **`new-course.ts`** — 多步驟表單 schemas（`newCourseStep1Schema`, `newCourseStep2Schema`）

## Import 規則

```typescript
// ✅ 從 index.ts 導入（推薦）
import { 
  CourseTerm, 
  ChargingModel, 
  createSchoolSchema,
  type CreateSchoolInput 
} from "@/features/school-service/schemas";

// ✅ 從 feature 公開 API 導入（對外使用）
import { createSchoolSchema } from "@/features/school-service";

// ❌ 避免直接導入內部檔案
import { CourseTerm } from "@/features/school-service/schemas/common";
```

## 與 `components/types.ts` 的關係

`components/types.ts` 從本目錄的 `common.ts` 導入並 re-export 所有 enums 和常數，並額外提供：

- **UI Labels** — `COURSE_TERM_LABELS`, `CHARGING_MODEL_LABELS`, `LESSON_TYPE_LABELS` 等
- **Helper Functions** — `getDefaultSchoolData()`, `getDefaultCourseItem()` 等
- **純 UI Types** — `SchoolBasicData`, `CourseItemData`, `LessonWithDetails` 等

## 新增 Schema 檢查清單

- [ ] 從 `common.ts` 導入共用 enums/常數
- [ ] 導出 schema 和 infer type
- [ ] 在 `index.ts` 中導出
- [ ] 命名遵循 `[entity][Action]Schema` 格式（如 `createSchoolSchema`）
