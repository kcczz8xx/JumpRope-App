# Session Summary - 2026-02-03

## 本次會話完成項目

### Phase 2.0：ActionResult 格式統一 ✅

將所有 `{ ok: true/false }` 統一為 `{ success: true/false }` 格式。

**修改的檔案（26 個）：**

| 類別 | 檔案 |
|:-----|:-----|
| 類型定義 | `lib/actions/types.ts`, `hooks/useUserActions.ts` |
| Guards | `lib/actions/guards.ts` |
| Auth Feature | `actions/password.ts`, `components/SignUpForm.tsx`, `components/ResetPasswordForm.tsx` |
| User Feature | `actions/` (5), `queries/` (5), `components/` (2) |
| School-Service | `actions/` (3), `queries/` (2), `components/` (2) |
| App | `dashboard/school/courses/new/page.tsx` |

### Phase 2.1-2.3：Auth Actions 遷移到 createAction ✅

**遷移的 Actions（7 個）：**

| 檔案 | Actions | 審計日誌 |
|:-----|:-----|:-----|
| `otp.ts` | `sendOtpAction`, `verifyOtpAction` | OTP_SEND, OTP_VERIFY |
| `register.ts` | `registerAction` | USER_REGISTER |
| `password.ts` | 4 個 actions | PASSWORD_CHANGE, PASSWORD_RESET_* |

**技術決策：**

1. **速率限制保留 Upstash Redis** — 在 handler 內部手動調用 `rateLimit()`
2. **移除 `"use server"` 從 `server-action.ts`** — `createAction` 是 factory 函式
3. **輔助函式移到 `types.ts`** — `success()` 和 `failure()` 是純函式

### 架構變更

```
lib/patterns/
├── types.ts          # ActionResult 類型 + success/failure 輔助函式
├── server-action.ts  # createAction wrapper（無 "use server"）
└── index.ts          # 公開 API
```

---

## 下一步（Phase 2 繼續）

### 待遷移的 Actions

```
features/school-service/actions/
├── school.ts   — createSchoolAction, updateSchoolAction, deleteSchoolAction
├── course.ts   — createCourseAction, deleteCourseAction
└── batch.ts    — batchCreateWithSchoolAction
```

### 遷移模式（參考 otp.ts）

```typescript
"use server";

import { createAction, success, failure } from "@/lib/patterns";
import { schema } from "../schemas/xxx";
import type { z } from "zod";

type Input = z.infer<typeof schema>;

export const xxxAction = createAction<Input, { message: string }>(
  async (input, ctx) => {
    // 速率限制（如需要）
    // 業務邏輯
    return success({ ... });
  },
  {
    schema: schema,
    requireAuth: true,  // 如需要
    audit: true,
    auditAction: "XXX_ACTION",
    auditResource: "xxx",
  }
);
```

---

## IDE Lint 錯誤說明

`rateLimitLog` 錯誤是 IDE 的 TypeScript 服務器問題（build 已成功）。

**解決方法：**
```bash
pnpm prisma generate
```
或重啟 IDE。

---

## 相關文件

- `03-Implementation-Progress.md` — 進度追蹤
- `04-Decisions.md` — 決策記錄（已更新）
