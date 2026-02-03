# src/features 重構建議

## 當前問題分析

### 1. Schema 重複定義

| 問題 | 位置 | 說明 |
|:-----|:-----|:-----|
| `phoneSchema` | `auth/schemas/common.ts` + `_core/schemas/_shared/phone.schema.ts` | 兩處定義電話驗證，實現不同 |
| `emailSchema` | `auth/schemas/common.ts` + `_core/schemas/_shared/email.schema.ts` | 兩處定義電郵驗證 |
| `z.string().email()` | 多處直接使用 | `auth/otp.ts`, `school-service/contact.ts`, `user/profile.ts` 等 |
| `dateRangeSchema` | `school-service/schemas/common.ts` + `_core/schemas/_shared/date.schema.ts` | 兩處定義日期範圍驗證 |

### 2. Enum 重複定義

| Enum | 位置 | 說明 |
|:-----|:-----|:-----|
| `CourseTerm` | `school-service/schemas/common.ts` | TS enum + 常數陣列 |
| `CourseStatus` | `school-service/schemas/common.ts` | TS enum + 常數陣列 |
| `LessonType` | `school-service/schemas/common.ts` | TS enum + 常數陣列 |
| `LessonStatus` | `school-service/schemas/common.ts` | TS enum + 常數陣列 |

**問題**：
- 同時維護 `enum CourseStatus {}` 和 `COURSE_STATUSES as const`
- `_core/components/fields/_enum/labels.ts` 又重新定義了這些 Enum 的標籤

### 3. 聯絡人相關重複

| 組件/Schema | 位置 | 說明 |
|:-----|:-----|:-----|
| `schoolContactSchema` | `school-service/schemas/contact.ts` | Zod schema |
| `SchoolContactField` | `_core/components/fields/school/` | UI 組件 |
| `ContactField` | `_core/components/fields/invoice/` | 另一個聯絡人 UI |

**問題**：Schema 和 UI 組件分散在不同位置，需要同步維護。

---

## 重構建議

### 方案 A：集中到 `_core`（推薦）

將所有共用 Schema 集中到 `_core/schemas/`，其他 feature 只定義業務專用的 Schema。

```
_core/
├── schemas/
│   ├── _shared/           # 基礎欄位 Schema（已有）
│   │   ├── phone.schema.ts
│   │   ├── email.schema.ts
│   │   ├── name.schema.ts
│   │   ├── currency.schema.ts
│   │   └── date.schema.ts
│   │
│   ├── enums/             # 新增：所有 Enum 的 Single Source of Truth
│   │   ├── course.ts      # CourseTerm, CourseStatus, ChargingModel
│   │   ├── lesson.ts      # LessonType, LessonStatus
│   │   ├── invoice.ts     # InvoiceStatus, PaymentMethod
│   │   ├── school.ts      # PartnershipStatus
│   │   └── index.ts
│   │
│   └── composite/         # 新增：複合 Schema
│       ├── contact.ts     # schoolContactSchema, invoiceContactSchema
│       ├── address.ts     # addressSchema
│       └── index.ts
│
└── components/fields/     # UI 組件（已有）
```

### 方案 B：保持分散但統一 Import

每個 feature 保留自己的 Schema，但強制從 `_core` 導入基礎 Schema。

```typescript
// school-service/schemas/contact.ts
import { phoneSchema, emailSchema, chineseNameSchema } from "@/features/_core/schemas";

export const schoolContactSchema = z.object({
  nameChinese: chineseNameSchema,
  phone: phoneSchema.optional(),
  email: emailSchema.optional(),
  // ...
});
```

---

## 具體重構步驟（方案 A）

### Phase 1：統一 Enum（優先級高）

1. **建立 `_core/schemas/enums/`**
   - 將 `school-service/schemas/common.ts` 中的 Enum 移到這裡
   - 同時提供 TypeScript enum 和 Zod-friendly 常數陣列

2. **更新 `_core/components/fields/_enum/labels.ts`**
   - 從 `_core/schemas/enums/` 導入 Enum
   - 確保標籤和 Enum 值一致

3. **更新 `school-service/schemas/common.ts`**
   - 改為從 `_core` 導入 Enum

### Phase 2：統一基礎 Schema

1. **刪除 `auth/schemas/common.ts` 中的重複定義**
   - `phoneSchema` → 使用 `_core/schemas/_shared/phone.schema.ts`
   - `emailSchema` → 使用 `_core/schemas/_shared/email.schema.ts`

2. **更新所有直接使用 `z.string().email()` 的地方**
   - 改為使用 `emailSchema` 或 `emailOptionalSchema`

3. **刪除 `school-service/schemas/common.ts` 中的重複 Schema**
   - `dateRangeSchema` → 使用 `_core/schemas/_shared/date.schema.ts`

### Phase 3：統一複合 Schema

1. **建立 `_core/schemas/composite/`**
   - 移入 `schoolContactSchema`、`addressSchema`

2. **確保 UI 組件和 Schema 對應**
   - `SchoolContactField` ↔ `schoolContactSchema`
   - `ContactField` ↔ `contactSchema`
   - `AddressField` ↔ `addressSchema`

---

## 重構後的 Import 範例

```typescript
// ✅ 基礎 Schema
import { 
  phoneSchema, 
  emailSchema, 
  dateRangeSchema 
} from "@/features/_core/schemas";

// ✅ Enum
import { 
  CourseStatus, 
  COURSE_STATUSES 
} from "@/features/_core/schemas/enums";

// ✅ 複合 Schema
import { 
  schoolContactSchema, 
  addressSchema 
} from "@/features/_core/schemas/composite";

// ✅ UI 組件
import { 
  PhoneField, 
  CourseStatusField, 
  SchoolContactField 
} from "@/features/_core";
```

---

## 優先級排序

| 優先級 | 任務 | 影響範圍 | 預估工作量 |
|:------:|:-----|:---------|:----------:|
| 🔴 高 | 統一 Enum 定義 | 多處重複 | 2-3 小時 |
| 🟡 中 | 統一基礎 Schema | 5+ 檔案 | 1-2 小時 |
| 🟢 低 | 統一複合 Schema | 2-3 檔案 | 1 小時 |

---

## 注意事項

1. **向後兼容**：重構時保留舊的導出（deprecated），給時間遷移
2. **類型檢查**：每次修改後運行 `pnpm type-check`
3. **測試**：確保現有功能不受影響
4. **文檔**：更新 `DEVELOPMENT-GUIDE.md` 和 `STRUCTURE.md`
