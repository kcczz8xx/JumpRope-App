# 表單驗證規範化 - 技術方案

## 目錄結構

```
features/auth/
├── schemas/                 # ✅ 新增
│   ├── common.ts           # 共用 schema（phone, password, email）
│   ├── signin.ts           # SignIn schema + type
│   ├── signup.ts           # SignUp schema + type
│   ├── reset-password.ts   # ResetPassword schema + type
│   └── index.ts            # 統一導出
├── actions/
│   ├── signin.ts           # 更新：加入 schema 驗證
│   ├── register.ts         # 更新：加入 schema 驗證
│   └── password.ts         # 更新：加入 schema 驗證
└── components/
    ├── signin/
    │   └── SignInForm.tsx  # 重構：使用 React Hook Form
    ├── signup/
    │   └── SignUpForm.tsx  # 重構：使用 React Hook Form
    └── reset-password/
        └── ResetPasswordForm.tsx  # 重構
```

## Schema 標準模板

```typescript
// schemas/signin.ts
import { z } from "zod";
import { phoneSchema, passwordSchema } from "./common";

export const signInSchema = z.object({
  loginMethod: z.enum(["phone", "memberNumber"]),
  identifier: z.string().min(1, "請輸入電話號碼或會員編號"),
  password: passwordSchema,
  rememberMe: z.boolean().optional(),
}).superRefine((data, ctx) => {
  // 條件驗證邏輯
});

export type SignInInput = z.infer<typeof signInSchema>;
```

## 前端表單模板

```typescript
// components/signin/SignInForm.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema, type SignInInput } from "../../schemas/signin";

export default function SignInForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = (data: SignInInput) => {
    startTransition(async () => {
      const result = await signInAction(data);
      if (!result.success) {
        setError("root", { message: result.error.message });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* 表單欄位 */}
    </form>
  );
}
```

## Server Action 模板

```typescript
// actions/signin.ts
"use server";

import { createAction, success, failure } from "@/lib/patterns";
import { signInSchema, type SignInInput } from "../schemas/signin";

export const signInAction = createAction<SignInInput, void>(
  async (input, ctx) => {
    // 業務邏輯...
    return success();
  },
  {
    schema: signInSchema,  // ✅ 自動驗證
    requireAuth: false,
    rateLimitKey: (input) => `signin:${input.identifier}`,
  }
);
```

## 實施步驟

### Phase 1: 基礎設施（Day 1）

1. 安裝依賴
   ```bash
   pnpm add react-hook-form @hookform/resolvers
   ```

2. 建立 `features/auth/schemas/` 目錄

3. 建立 `common.ts` 共用 schema
   - `phoneSchema`
   - `passwordSchema`
   - `emailSchema`

4. 確認 `createAction` 支援 schema 選項

### Phase 2: 遷移表單（Day 2-3）

**優先順序**：
1. SignInForm（最簡單）
2. SignUpForm（多步驟）
3. ResetPasswordForm

**每個表單遷移 Checklist**：
- [ ] 建立對應 schema 檔案
- [ ] 更新 component 使用 React Hook Form
- [ ] 更新 Server Action 加入 schema 驗證
- [ ] 測試前端驗證
- [ ] 測試後端驗證
- [ ] 確認錯誤訊息正確顯示

### Phase 3: 文檔更新（Day 4）

1. 更新 `src/features/STRUCTURE.md`
   - 新增「表單驗證規範」章節

2. 建立 `docs/03-Knowledge-Base/Form-Validation-Guide.md`
   - 完整指南和範例

## 風險與對策

| 風險 | 對策 |
|:-----|:-----|
| 多步驟表單複雜 | SignUpForm 可保留部分 useState，逐步遷移 |
| 現有 UI 元件不兼容 | 建立 adapter 或修改 Input 元件支援 register |
| createAction 不支援 schema | 確認或擴展現有實作 |

## 測試要點

- 前端驗證即時反饋
- 後端驗證阻擋無效請求
- 錯誤訊息正確顯示
- 型別推導正確
