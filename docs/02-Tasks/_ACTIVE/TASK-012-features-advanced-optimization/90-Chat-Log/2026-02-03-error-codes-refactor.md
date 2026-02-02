# Error-Codes 模組化拆分

**日期**: 2026-02-03  
**Commits**: `c63627d`, `0965b6a`

---

## 📊 變更摘要

### Commit 1: 錯誤碼遷移 (`c63627d`)

| 項目 | 數量 |
|------|------|
| 新增錯誤碼 | 13 個 |
| failure → failureFromCode | 68 處 |
| Queries 重構 | 5 個函式 |
| 修改檔案 | 27 個 |

### Commit 2: 模組化拆分 (`0965b6a`)

| 項目 | 數量 |
|------|------|
| 新建檔案 | 12 個 |
| 刪除檔案 | 1 個 |
| 檔案大小 | 10.3KB → 2.5KB max |

---

## 🏗️ 新結構

```
src/features/_core/error-codes/
├── index.ts           ← 統一導出（向後兼容）
├── types.ts           ← ErrorDefinition 介面
└── categories/
    ├── auth.ts        (13 codes)
    ├── otp.ts         (6)
    ├── validation.ts  (10)
    ├── permission.ts  (4)
    ├── rate-limit.ts  (2)
    ├── resource.ts    (4)
    ├── database.ts    (3)
    ├── external.ts    (3)
    ├── business.ts    (3)
    └── index.ts
```

---

## ✅ 改進清單

### ActionContext 增強

```typescript
interface ActionContext {
  ipAddress: string;   // 新增
  userAgent: string;   // 新增
}
```

### 新增錯誤碼

**AUTH** (8 個):
- `EMAIL_REGISTERED`, `PHONE_NOT_VERIFIED`, `INVALID_PASSWORD`
- `INVALID_RESET_TOKEN`, `RESET_TOKEN_EXPIRED`, `EMAIL_NOT_VERIFIED`
- `PHONE_IN_USE`, `EMAIL_IN_USE`

**OTP** (1 個):
- `NOT_FOUND`

**VALIDATION** (4 個):
- `MISSING_EMAIL`, `EMAIL_RESET_NOT_AVAILABLE`
- `PHONE_REQUIRED`, `NO_UPDATE_DATA`, `FILE_TOO_LARGE`

### 新增輔助函式

```typescript
failureFromCode<T extends ErrorCategory>(
  category: T,
  code: ErrorCode<T>,
  details?: Record<string, unknown>
)
```

---

## 📁 修改檔案列表

### 核心模組

- `src/lib/patterns/types.ts`
- `src/lib/patterns/server-action.ts`
- `src/features/_core/audit.ts`
- `src/features/_core/error-codes/*` (12 檔案)

### Auth Feature

- `src/features/auth/actions/otp.ts`
- `src/features/auth/actions/register.ts`
- `src/features/auth/actions/password.ts`

### User Feature

- `src/features/user/actions/profile.ts`
- `src/features/user/actions/children.ts`
- `src/features/user/actions/address.ts`
- `src/features/user/actions/bank.ts`
- `src/features/user/actions/documents.ts`
- `src/features/user/queries/profile.ts`
- `src/features/user/queries/index.ts`
- `src/features/user/server.ts`

### School-Service Feature

- `src/features/school-service/actions/school.ts`
- `src/features/school-service/actions/course.ts`
- `src/features/school-service/actions/batch.ts`
- `src/features/school-service/queries/course.ts`
- `src/features/school-service/queries/school.ts`
- `src/features/school-service/queries/index.ts`
- `src/features/school-service/index.ts`
- `src/features/school-service/server.ts`
- `src/features/school-service/components/course/SchoolFormStep.tsx`

### App Routes

- `src/app/(private)/dashboard/school/courses/new/page.tsx`

---

## ⚠️ Breaking Changes

### Query 函式重命名

| 舊名稱 | 新名稱 |
|--------|--------|
| `getProfile` | `getProfileAction` |
| `getSchools` | `getSchoolsAction` |
| `getSchoolById` | `getSchoolByIdAction` |
| `getCourses` | `getCoursesAction` |
| `getCourseById` | `getCourseByIdAction` |

---

## ✨ 使用方式

```typescript
// ✅ 舊用法（仍可用）
import { ERROR_CODES, failureFromCode } from '@/features/_core/error-codes';

// ✅ 新用法（推薦）
import { AUTH_ERRORS, failureFromCode } from '@/features/_core/error-codes';

// 使用範例
return failureFromCode("RATE_LIMIT", "EXCEEDED");
return failureFromCode("AUTH", "PHONE_REGISTERED");
```

---

## 🔍 驗證結果

```bash
pnpm type-check  # ✅ 通過
pnpm lint        # ✅ 通過
```
