# Features 模組結構規範

本文件定義 `src/features/` 目錄下所有功能模組的標準結構。

## 標準目錄結構

```
features/[feature-name]/
├── actions/              # Server Actions（按功能拆檔）
│   ├── _helpers.ts       # 共用輔助函式（_ 前綴避免導出）
│   ├── [action-name].ts  # 獨立 action 檔案
│   └── index.ts          # 統一導出
├── queries/              # 資料查詢（Server-only）
│   ├── [query-name].ts
│   └── index.ts
├── schemas/              # Zod 驗證（按 action 對應）
│   ├── [schema-name].ts
│   └── index.ts
├── components/           # UI 元件
│   └── [ComponentName].tsx
├── hooks/                # 自訂 Hooks（optional）
├── types.ts              # 共用型別（optional）
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

### queries/

- 只做資料讀取（無副作用）
- 命名：`[entity].ts`（例：`profile.ts`、`children.ts`）
- 所有 queries 必須透過 `server.ts` 導出

### components/

- 按功能分子目錄（form/、list/、detail/）— 如元件數量多
- 每個元件 < **200 行**（超過請拆 sub-components）

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

## Import 規則

```typescript
// ✅ 正確：透過功能的公開 API import
import { LoginForm, loginAction } from "@/features/auth";

// ✅ 正確：Server-only imports（僅限 Server Components）
import { getProfile } from "@/features/user/server";

// ❌ 錯誤：直接 import 功能內部檔案
import { LoginForm } from "@/features/auth/components/LoginForm";

// ❌ 錯誤：在 Client Component import server.ts
("use client");
import { getProfile } from "@/features/user/server"; // 會報錯

// ✅ 功能內部可用相對路徑
// 在 actions/profile.ts 內
import { getClientIP } from "./_helpers";
import { updateProfileSchema } from "../schemas/profile";
```

## 依賴流向（單向）

```
app/ → features/ → lib/
                 → components/ui/
```

- `features/` **可以** import `@/lib/*` 和 `@/components/ui/*`
- `features/` 之間 **不應** 互相 import
- 如需共用邏輯，提取到 `@/lib/`

## 遷移指南

### 從 safeAction 遷移到 createAction

#### Before（舊模式）

```typescript
"use server";

import { safeAction, success, failure, requireUser } from "@/lib/actions";
import { someSchema } from "../schemas/some";

export const someAction = safeAction(someSchema, async (input) => {
  const auth = await requireUser();
  if (!auth.success) return auth;

  // 業務邏輯...
  return success({ message: "成功" });
});
```

#### After（新模式）

```typescript
"use server";

import { createAction, success, failure } from "@/lib/patterns";
import { someSchema, type SomeInput } from "../schemas/some";

export const someAction = createAction<SomeInput, { message: string }>(
  async (input, ctx) => {
    if (!ctx.session?.user) {
      return failure("UNAUTHORIZED", "請先登入");
    }

    // 業務邏輯...
    return success({ message: "成功" });
  },
  {
    schema: someSchema,
    requireAuth: true,
    audit: true,
    auditAction: "SOME_ACTION",
    auditResource: "some",
  }
);
```

#### 遷移步驟

1. **更新 import**

   - `@/lib/actions` → `@/lib/patterns`
   - 移除 `safeAction`, `requireUser`
   - 加入 `createAction`

2. **更新函式簽名**

   - `safeAction(schema, handler)` → `createAction<Input, Output>(handler, options)`
   - 定義明確的泛型類型

3. **更新認證檢查**

   - 移除 `requireUser()` 調用
   - 使用 `ctx.session?.user` 檢查
   - 或設定 `requireAuth: true`（自動檢查）

4. **加入審計日誌**（可選）

   - 設定 `audit: true`
   - 定義 `auditAction` 和 `auditResource`

5. **驗證 build**
   - `pnpm build`

### 從扁平式遷移到分層式

1. **建立子目錄**

```bash
mkdir -p src/features/[name]/actions
mkdir -p src/features/[name]/schemas
mkdir -p src/features/[name]/queries
```

2. **拆分 actions.ts**

- 識別邏輯域（例：profile、address、bank）
- 每個域建立獨立檔案
- 共用函式移至 `_helpers.ts`

3. **建立子目錄 index.ts**

- 統一導出所有子模組

4. **更新主 index.ts**

- 從子目錄 index 導入
- 保持對外 API 不變

5. **建立 server.ts**

- 加入 `import "server-only"`
- 導出所有 queries

6. **刪除舊檔案**

- 確認 build 通過後刪除

## 檢查清單

新建或修改 feature 時，確認：

- [ ] 有 `index.ts` 控制公開 API
- [ ] 有 `server.ts` 分離 server-only exports
- [ ] 每個 action 檔案 < 150 行
- [ ] 每個 component < 200 行
- [ ] 無跨 feature import
- [ ] Schemas 同時導出 schema 和 type
