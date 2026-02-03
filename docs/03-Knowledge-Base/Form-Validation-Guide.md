# 表單驗證最佳實踐指南

## 核心原則

**Single Source of Truth**：前後端共用同一份 Zod Schema

```
┌─────────────────────────────────┐
│  Zod Schema (schemas/*.ts)     │
└─────────────────────────────────┘
         ↓                ↓
   【前端驗證】       【後端驗證】
   React Hook Form    Server Action
   + zodResolver      + schema.safeParse()
```

**優勢**：
- ✅ 前後端驗證邏輯一致
- ✅ TypeScript 型別自動推導
- ✅ 驗證邏輯集中管理
- ✅ 錯誤訊息統一格式

---

## 目錄結構

```
features/auth/
├── schemas/
│   ├── common.ts        # 共用 schema（phone, email, password）
│   ├── signin.ts        # 登入表單 schema
│   ├── signup.ts        # 註冊表單 schema
│   ├── reset-password.ts # 密碼重設 schema
│   └── index.ts         # 統一導出
├── components/
│   ├── signin/
│   │   └── SignInForm.tsx  # 使用 React Hook Form
│   └── signup/
│       └── SignUpForm.tsx  # 多步驟表單
└── actions/
    └── signin.ts        # 使用 createAction + schema
```

---

## Schema 定義規範

### common.ts - 共用 Schema

```typescript
import { z } from "zod";
import { isValidPhoneNumber } from "libphonenumber-js";

export const phoneSchema = z
  .string()
  .min(1, "請輸入電話號碼")
  .refine((val) => isValidPhoneNumber(val), "請輸入有效的電話號碼格式");

export const passwordSchema = z
  .string()
  .min(1, "請輸入密碼")
  .min(8, "密碼至少需要 8 個字元");

export const emailSchema = z
  .string()
  .min(1, "請輸入電郵地址")
  .email("請輸入有效的電郵格式");

export const otpSchema = z
  .string()
  .length(6, "請輸入 6 位驗證碼")
  .regex(/^\d{6}$/, "驗證碼必須為 6 位數字");
```

### 功能 Schema

```typescript
// signin.ts
import { z } from "zod";
import { phoneSchema, passwordSchema } from "./common";

export const signInSchema = z
  .object({
    loginMethod: z.enum(["phone", "memberNumber"]),
    identifier: z.string().min(1, "請輸入電話號碼或會員編號"),
    password: passwordSchema,
    rememberMe: z.boolean(),
  })
  .superRefine((data, ctx) => {
    // 條件驗證
    if (data.loginMethod === "phone") {
      const result = phoneSchema.safeParse(data.identifier);
      if (!result.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: result.error.issues[0]?.message || "電話號碼格式錯誤",
          path: ["identifier"],
        });
      }
    }
  });

export type SignInInput = z.infer<typeof signInSchema>;
```

---

## 前端表單實作

### 模式 1：React Hook Form（推薦）

適用於：簡單表單、需要即時驗證反饋

```typescript
"use client";

import { useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema, type SignInInput } from "../../schemas";

export default function SignInForm() {
  const [isPending, startTransition] = useTransition();

  const {
    control,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      loginMethod: "phone",
      identifier: "",
      password: "",
      rememberMe: false,
    },
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
      {errors.root && <FormError message={errors.root.message} />}
      
      <Controller
        name="identifier"
        control={control}
        render={({ field }) => (
          <input {...field} placeholder="電話號碼" />
        )}
      />
      {errors.identifier && <p>{errors.identifier.message}</p>}
      
      <button type="submit" disabled={isPending}>
        {isPending ? "登入中..." : "登入"}
      </button>
    </form>
  );
}
```

### 模式 2：safeParse（多步驟表單）

適用於：多步驟表單、需要保留 useState 管理

```typescript
"use client";

import { signUpFormSchema } from "../../schemas";

export default function SignUpForm() {
  const [formData, setFormData] = useState({ ... });
  const [error, setError] = useState("");

  const validateForm = (): boolean => {
    const result = signUpFormSchema.safeParse(formData);
    if (!result.success) {
      setError(result.error.issues[0]?.message || "驗證失敗");
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    // 繼續處理...
  };
}
```

---

## Server Action 整合

### 使用 createAction + schema

```typescript
"use server";

import { createAction, success, failure } from "@/lib/patterns";
import { signInSchema, type SignInInput } from "../schemas";

export const signInAction = createAction<SignInInput, void>(
  async (input, ctx) => {
    // input 已經過 schema 驗證
    const result = await signIn("credentials", {
      identifier: input.identifier,
      password: input.password,
      redirect: false,
    });

    if (result?.error) {
      return failure("UNAUTHORIZED", "電話號碼或密碼錯誤");
    }

    return success();
  },
  {
    schema: signInSchema,  // 自動驗證
    requireAuth: false,
    rateLimitKey: (input) => `signin:${input.identifier}`,
    rateLimitConfig: { max: 5, window: 60 },
  }
);
```

---

## 命名規範

| 類型 | 檔案命名 | Schema 命名 | Type 命名 |
|:-----|:---------|:------------|:----------|
| 共用 | `common.ts` | `phoneSchema` | - |
| 登入 | `signin.ts` | `signInSchema` | `SignInInput` |
| 註冊 | `signup.ts` | `signUpFormSchema` | `SignUpFormInput` |
| 密碼重設 | `reset-password.ts` | `resetPasswordNewSchema` | `ResetPasswordNewInput` |

---

## 錯誤訊息規範

- 使用**繁體中文**
- 簡潔明確
- 提供具體指引

| ❌ 不好 | ✅ 好 |
|:--------|:------|
| Invalid | 請輸入有效的電話號碼格式 |
| Required | 請輸入密碼 |
| Too short | 密碼至少需要 8 個字元 |

---

## 進階技巧

### 條件驗證

```typescript
export const schema = z.object({
  type: z.enum(["phone", "email"]),
  identifier: z.string(),
}).superRefine((data, ctx) => {
  if (data.type === "phone") {
    const result = phoneSchema.safeParse(data.identifier);
    if (!result.success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "電話號碼格式錯誤",
        path: ["identifier"],
      });
    }
  }
});
```

### 密碼確認

```typescript
export const schema = z.object({
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "兩次輸入的密碼不一致",
  path: ["confirmPassword"],
});
```

---

## 相關文檔

- `src/features/STRUCTURE.md` - Feature 模組結構規範
- `src/lib/patterns/server-action.ts` - createAction 實作
- `src/features/auth/schemas/` - 範例 schemas
