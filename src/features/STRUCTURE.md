# Features 模組結構規範

本文件定義 `src/features/` 目錄下所有功能模組的標準結構。

## 標準目錄結構

```
features/[feature-name]/
├── actions/              # Server Actions（按功能拆檔）
│   ├── _helpers.ts       # 共用輔助函式（_ 前綴避免導出）
│   ├── [action-name].ts  # 獨立 action 檔案
│   └── index.ts          # 統一導出
├── queries/              # 資料查詢（Server-only，可選）
│   ├── [query-name].ts
│   └── index.ts
├── schemas/              # Zod 驗證（按 action 對應）
│   ├── [schema-name].ts
│   └── index.ts
├── components/           # UI 元件
│   ├── [domain]/         # 按功能域分子目錄（如 profile/, course/）
│   └── [ComponentName].tsx
├── hooks/                # 自訂 Hooks（可選）
├── types.ts              # 共用型別（可選）
├── server.ts             # Server-only exports（必須）
└── index.ts              # Client-accessible exports（必須）
```

## 檔案拆分原則

### actions/

- 按「實體 + 操作」命名：`profile.ts`、`address.ts`、`children.ts`
- 每個檔案 < **150 行**
- 共用輔助函式放 `_helpers.ts`（`_` 前綴避免被 index 導出）
- **使用 `createAction` wrapper**（推薦）

#### createAction Wrapper（推薦）

```typescript
"use server";

import { createAction, success, failure } from "@/lib/patterns";
import { someSchema, type SomeInput } from "../schemas/some";

export const someAction = createAction<SomeInput, { message: string }>(
  async (input, ctx) => {
    // ctx.session 自動提供認證資訊
    if (!ctx.session?.user) {
      return failure("UNAUTHORIZED", "請先登入");
    }

    // 業務邏輯...

    return success({ message: "操作成功" });
  },
  {
    schema: someSchema, // 自動 Zod 驗證
    requireAuth: true, // 自動認證檢查
    audit: true, // 自動審計日誌
    auditAction: "SOME_ACTION",
    auditResource: "some",
  }
);
```

#### ActionResult 類型

```typescript
type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string } };
```

#### 常見錯誤碼

| 錯誤碼             | 說明       | 觸發場景                         |
| :----------------- | :--------- | :------------------------------- |
| `UNAUTHORIZED`     | 未登入     | `requireAuth: true` 但無 session |
| `FORBIDDEN`        | 無權限     | 角色/所有權檢查失敗              |
| `VALIDATION_ERROR` | 驗證失敗   | Zod schema 驗證不通過            |
| `NOT_FOUND`        | 資源不存在 | 查詢返回 null                    |
| `RATE_LIMITED`     | 請求過頻   | 超出速率限制                     |
| `INTERNAL_ERROR`   | 內部錯誤   | 未預期的例外                     |

> 📖 完整錯誤碼定義請參考 `@/features/_core/error-codes`

#### createAction 選項

| 選項              | 類型                                  | 說明             |
| :---------------- | :------------------------------------ | :--------------- |
| `schema`          | `ZodSchema`                           | 輸入驗證 Schema  |
| `requireAuth`     | `boolean`                             | 是否需要登入     |
| `requiredRole`    | `UserRole \| UserRole[]`              | 要求特定角色     |
| `ownershipCheck`  | `(input, userId) => Promise<boolean>` | 所有權檢查       |
| `rateLimitKey`    | `string \| (input) => string`         | 速率限制 key     |
| `rateLimitConfig` | `{ max, window }`                     | 速率限制配置     |
| `audit`           | `boolean`                             | 是否記錄審計日誌 |
| `auditAction`     | `string`                              | 審計動作名稱     |
| `auditResource`   | `string`                              | 審計資源類型     |
| `auditResourceId` | `(input) => string \| undefined`      | 資源 ID          |

### schemas/

- 與 actions 對應：`profile.ts` → `profile.ts`
- 用 Zod `.infer` 生成 TypeScript 型別
- 同時導出 schema 和 type：

```typescript
// schemas/profile.ts
export const updateProfileSchema = z.object({ ... });
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
```

#### 表單驗證規範

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

**前端表單標準模式**（使用 React Hook Form）：

```typescript
"use client";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { someSchema, type SomeInput } from "../../schemas";

export default function SomeForm() {
  const { control, handleSubmit, formState: { errors }, setError } = useForm<SomeInput>({
    resolver: zodResolver(someSchema),
    defaultValues: { ... },
  });

  const onSubmit = (data: SomeInput) => {
    startTransition(async () => {
      const result = await someAction(data);
      if (!result.success) {
        setError("root", { message: result.error.message });
      }
    });
  };

  return <form onSubmit={handleSubmit(onSubmit)}>...</form>;
}
```

**多步驟表單簡化模式**（直接使用 safeParse）：

```typescript
import { signUpFormSchema } from "../../schemas";

const validateForm = (): boolean => {
  const result = signUpFormSchema.safeParse(formData);
  if (!result.success) {
    setError(result.error.issues[0]?.message || "驗證失敗");
    return false;
  }
  return true;
};
```

**Schema 命名規範**：

| 檔案     | 命名模式            | 範例                                           |
| :------- | :------------------ | :--------------------------------------------- |
| 登入     | `signin.ts`         | `signInSchema`, `SignInInput`                  |
| 註冊     | `signup.ts`         | `signUpFormSchema`, `signUpOtpSchema`          |
| 密碼重設 | `reset-password.ts` | `resetPasswordRequestSchema`                   |
| 共用     | `common.ts`         | `phoneSchema`, `emailSchema`, `passwordSchema` |

> 📖 詳細指南：`docs/03-Knowledge-Base/Form-Validation-Guide.md`

### queries/

- 只做資料讀取（無副作用）
- 命名：`[entity].ts`（例：`profile.ts`、`children.ts`）
- 所有 queries 必須透過 `server.ts` 導出
- 明確 `select` 欄位，避免 `select *`

```typescript
// queries/profile.ts
import { prisma } from "@/lib/db";

export async function getProfile(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      // ❌ 不要用 include 全部 relations
    },
  });
}

// 帶 caching（可選）
import { unstable_cache } from "next/cache";

export const getCachedProfile = unstable_cache(
  async (userId: string) => getProfile(userId),
  ["profile"],
  { revalidate: 60, tags: ["profile"] }
);
```

### components/

#### 目錄結構原則

| 元件數量 | 結構方式             | 範例                                                 |
| :------- | :------------------- | :--------------------------------------------------- |
| ≤5 個    | 平鋪於 `components/` | `components/LoginForm.tsx`                           |
| 6-15 個  | 按功能域分子目錄     | `components/profile/`, `components/course/`          |
| >15 個   | 分子目錄 + 再分類    | `components/course/form/`, `components/course/list/` |

#### 命名規範

```
components/
├── [domain]/              # 功能域（如 profile, course）
│   ├── index.ts           # 統一導出該域元件
│   ├── [ComponentName].tsx
│   └── [sub-domain]/      # 可選：進一步分類
│       ├── index.ts
│       └── [ComponentName].tsx
├── common/                # 跨域共用元件（可選）
│   └── FormField.tsx
└── types/                 # 共用型別定義（可選）
    └── course.ts
```

#### 元件分類

| 類型         | 命名慣例                     | 職責                   |
| :----------- | :--------------------------- | :--------------------- |
| Page Content | `*PageContent.tsx`           | 頁面主體，組合多個元件 |
| Form         | `*Form.tsx`, `*FormStep.tsx` | 表單及表單步驟         |
| List         | `*List.tsx`, `*Table.tsx`    | 列表展示               |
| Card         | `*Card.tsx`, `*Cards.tsx`    | 卡片展示               |
| Modal        | `*Modal.tsx`, `*Dialog.tsx`  | 彈窗                   |
| Detail       | `*Detail.tsx`, `*Info.tsx`   | 詳情展示               |

#### 元件大小限制

- 每個元件 < **200 行**（超過請拆分）
- 拆分策略：
  1. **邏輯拆分**：將 hooks、helpers 移至獨立檔案
  2. **視圖拆分**：將子區塊拆為獨立元件
  3. **步驟拆分**：多步驟表單每步一個元件

#### 子目錄 index.ts

```typescript
// components/profile/index.ts
export { default as ProfileForm } from "./ProfileForm";
export { default as ProfileCard } from "./ProfileCard";
export { default as AvatarUpload } from "./AvatarUpload";
```

#### Client vs Server Components

| 類型             | 標記           | 適用場景                     |
| :--------------- | :------------- | :--------------------------- |
| Server Component | 無標記（預設） | 純展示、無狀態、直接存取資料 |
| Client Component | `"use client"` | 互動、hooks、瀏覽器 API      |

**原則**：

- 預設使用 Server Component
- 僅在需要互動時加 `"use client"`
- Client Component 不能直接 import server-only 模組
- **Action 傳遞**：Server Actions 需透過 props 傳給 Client Components

```tsx
// ❌ 錯誤：Client Component 直接 import action
"use client";
import { someAction } from "../actions"; // 若 action 用了 next/headers 會報錯

// ✅ 正確：透過 props 傳遞
interface Props {
  submitAction: (data: FormData) => Promise<ActionResult>;
}
export default function MyForm({ submitAction }: Props) { ... }
```

## 必要檔案

### index.ts（Client-accessible）

控制對外公開的 API，可被 Client Components 和 Server Components 使用：

```typescript
/**
 * [Feature Name] Feature - Public API
 *
 * ✅ 允許 import：Client Components、Server Components、頁面
 * ❌ 禁止 import：其他 features（用 Dependency Injection）
 *
 * Server-only exports 請用：
 * import { ... } from '@/features/[name]/server'
 */

// ===== Components =====
export { default as ProfilePageContent } from "./components/profile/ProfilePageContent";

// ===== Server Actions =====
export {
  updateProfileAction,
  updateAddressAction,
  deleteAddressAction,
} from "./actions";

// ===== Schemas & Types =====
export { updateProfileSchema, updateAddressSchema } from "./schemas";

export type { UpdateProfileInput, UpdateAddressInput } from "./schemas";

// ⚠️ 禁止導出 queries（應該放 server.ts）
```

### server.ts（Server-only）

只能在 Server Components、API Routes、Server Actions 中使用：

```typescript
/**
 * [Feature Name] Feature - Server-only exports
 * 僅供 Server Components 使用
 */

import "server-only";

export { getProfile, getAddress, getChildren } from "./queries";
```

## 子目錄 index.ts 範例

### actions/index.ts

```typescript
/**
 * [Feature Name] Actions - Index
 * 統一導出所有 Actions
 */

export { updateProfileAction } from "./profile";
export { updateAddressAction, deleteAddressAction } from "./address";
export {
  createChildAction,
  updateChildAction,
  deleteChildAction,
} from "./children";
```

### schemas/index.ts

```typescript
/**
 * [Feature Name] Schemas - Index
 * 統一導出所有 Schemas
 */

export * from "./profile";
export * from "./address";
export * from "./children";
```

### queries/index.ts

```typescript
/**
 * [Feature Name] Queries - Index
 * 統一導出所有 Queries
 */

export { getProfile } from "./profile";
export { getAddress } from "./address";
export { getChildren } from "./children";
```

## 功能內部 Import

```typescript
// 在 actions/profile.ts 內
import { getClientIP } from "./_helpers";
import { updateProfileSchema } from "../schemas/profile";

// 在 components/profile/ProfileForm.tsx 內
import { updateProfileAction } from "../../actions";
```

> 📖 對外 Import 規則請參考 [AGENTS.md](./AGENTS.md)

## 跨 Feature 通訊

Features 之間**不應直接 import**，需要共用時有三種方式：

### 1. 提取到 `_core/`（推薦）

```typescript
// ✅ 共用錯誤碼、常數、工具
import { failureFromCode } from "@/features/_core/error-codes";
import { PERMISSION } from "@/features/_core/permission";
```

### 2. 提取到 `lib/`

```typescript
// ✅ 通用工具、服務
import { formatDate } from "@/lib/utils";
import { sendEmail } from "@/lib/services/email";
```

### 3. 上層協調（Dependency Injection）

```tsx
// app/dashboard/page.tsx (Server Component)
import { getUserAction } from "@/features/user";
import { getSchoolsAction } from "@/features/school-service";

export default async function DashboardPage() {
  // 在上層組合多個 feature 的資料
  const [userResult, schoolsResult] = await Promise.all([
    getUserAction(),
    getSchoolsAction(),
  ]);

  return <Dashboard user={userResult.data} schools={schoolsResult.data} />;
}
```

## 效能最佳實踐

### Prisma 查詢優化

```typescript
// ✅ 明確指定 select
await prisma.user.findUnique({
  where: { id },
  select: { id: true, name: true }, // 只拿需要的
});

// ❌ 避免拿全部欄位
await prisma.user.findUnique({ where: { id } });
```

### Schema 重用

```typescript
// schemas/common.ts
export const phoneSchema = z.string().regex(/^\d{8}$/, "電話號碼格式不正確");
export const emailSchema = z.string().email("電郵格式不正確");

// schemas/profile.ts
import { phoneSchema, emailSchema } from "./common";

export const updateProfileSchema = z.object({
  phone: phoneSchema.optional(),
  email: emailSchema.optional(),
});
```

### 避免 N+1 查詢

```typescript
// ❌ N+1 問題
const schools = await prisma.school.findMany();
for (const school of schools) {
  const courses = await prisma.course.findMany({
    where: { schoolId: school.id },
  });
}

// ✅ 使用 include 一次拿完
const schools = await prisma.school.findMany({
  include: { courses: true },
});
```

## 檢查清單

新建或修改 feature 時，確認：

- [ ] 有 `index.ts` 控制公開 API
- [ ] 有 `server.ts` 分離 server-only exports
- [ ] 每個 action 檔案 < 150 行
- [ ] 每個 component < 200 行
- [ ] 無跨 feature import
- [ ] Schemas 同時導出 schema 和 type
