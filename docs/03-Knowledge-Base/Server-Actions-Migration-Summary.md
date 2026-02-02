# Server Actions 遷移總結

> **完成日期**：2026-02-02  
> **任務編號**：TASK-0005  
> **歸檔位置**：`docs/02-Tasks/_ARCHIVE/2026-02/TASK-0005-server-actions-migration/`

---

## 概述

將現有 API Routes 遷移至 Next.js 15 Server Actions，建立統一的 Action 基礎設施，提升代碼可維護性與類型安全。

---

## 架構設計

### 基礎設施 (`src/lib/actions/`)

```
src/lib/actions/
├── types.ts        # ActionResult<T>, ActionErrorCode, success(), failure()
├── safe-action.ts  # safeAction() wrapper + Zod 驗證
├── guards.ts       # requireUser(), requirePermission(), requireRole()
└── index.ts        # 統一導出
```

### ActionResult 類型

```typescript
type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: ActionErrorCode; message: string; fieldErrors?: Record<string, string[]> } };
```

### 權限守衛

```typescript
// 基本認證
const auth = await requireUser();
if (!auth.ok) return auth;

// 權限檢查
const perm = await requirePermission("school:read");
if (!perm.ok) return perm;

// 角色檢查
const role = await requireRole(["ADMIN", "MANAGER"]);
if (!role.ok) return role;
```

---

## 遷移統計

### 模組分佈

| 模組 | Actions | Queries | Schemas | Components 更新 |
|------|---------|---------|---------|-----------------|
| Auth | 7 | - | 7 | 2 |
| User | 11 | 5 | 9 | 2 |
| School Service | 6 | 4 | 6 | 3 |
| **Total** | **24** | **9** | **22** | **7** |

### Actions 清單

#### Auth 模組

| Action | 用途 |
|--------|------|
| `registerAction` | 用戶註冊 |
| `sendOtpAction` | 發送 OTP |
| `verifyOtpAction` | 驗證 OTP |
| `changePasswordAction` | 修改密碼 |
| `sendResetPasswordOtpAction` | 發送重設密碼 OTP |
| `verifyResetPasswordOtpAction` | 驗證重設密碼 OTP |
| `resetPasswordAction` | 重設密碼 |

#### User 模組

| Action | 用途 |
|--------|------|
| `updateProfileAction` | 更新個人資料 |
| `updateAddressAction` | 更新地址 |
| `updateBankAccountAction` | 更新銀行帳戶 |
| `addChildAction` | 新增子女 |
| `updateChildAction` | 更新子女資料 |
| `deleteChildAction` | 刪除子女 |
| `uploadTutorDocumentAction` | 上傳導師文件 |
| `deleteTutorDocumentAction` | 刪除導師文件 |
| `sendContactOtpAction` | 發送聯絡資料 OTP |
| `verifyContactOtpAction` | 驗證聯絡資料 OTP |
| `confirmContactUpdateAction` | 確認聯絡資料更新 |

#### School Service 模組

| Action | 用途 |
|--------|------|
| `createSchoolAction` | 建立學校 |
| `updateSchoolAction` | 更新學校 |
| `deleteSchoolAction` | 刪除學校 |
| `createCourseAction` | 建立課程 |
| `deleteCourseAction` | 刪除課程 |
| `batchCreateWithSchoolAction` | 批量建立學校+課程 |

---

## Client 端調用模式

### 使用 useTransition

```typescript
"use client";

import { useTransition } from "react";
import { someAction } from "@/features/module";

function Component() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (data: FormData) => {
    startTransition(async () => {
      const result = await someAction(data);
      if (!result.ok) {
        setError(result.error.message);
        return;
      }
      // 成功處理
    });
  };

  return (
    <button onClick={handleSubmit} disabled={isPending}>
      {isPending ? "處理中..." : "提交"}
    </button>
  );
}
```

### Server Component 直接調用

```typescript
// page.tsx (Server Component)
import { getSchools } from "@/features/school-service";

export default async function Page() {
  const result = await getSchools();
  const schools = result.ok ? result.data : [];

  return <ClientComponent schools={schools} />;
}
```

---

## 廢棄的 API Routes

以下 API Routes 已標記 `@deprecated`，建議逐步移除：

```
src/app/api/
├── auth/
│   ├── change-password/route.ts
│   ├── otp/send/route.ts
│   ├── otp/verify/route.ts
│   ├── register/route.ts
│   └── reset-password/
│       ├── reset/route.ts
│       ├── send/route.ts
│       └── verify/route.ts
├── user/
│   ├── address/route.ts
│   ├── bank/route.ts
│   ├── children/route.ts
│   ├── profile/route.ts
│   └── tutor/document/route.ts
└── school-service/
    ├── courses/route.ts
    ├── courses/batch-with-school/route.ts
    ├── schools/route.ts
    └── schools/[id]/route.ts
```

---

## 後續建議

### 短期

- [ ] 移除已廢棄的 API Routes（確認無外部依賴後）
- [ ] 修復 ESLint 配置問題

### 中期

- [ ] 加入 Rate Limiting 支援到 `guards.ts`
- [ ] 補充單元測試（`actions.test.ts`）
- [ ] 實作 i18n 錯誤訊息

### 長期

- [ ] 建立 Action hooks generator（type-safe client hooks）
- [ ] 加入效能監控（追蹤 action 執行時間）

---

## 參考資源

- [Next.js Server Actions 文檔](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Zod 文檔](https://zod.dev/)
- Feature 結構：`src/features/[module]/actions.ts`
- 基礎設施：`src/lib/actions/`
