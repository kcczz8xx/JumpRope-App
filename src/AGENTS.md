# Source Code Guidelines

當處理 `src/` 目錄下的檔案時，遵循以下規範：

## Feature-First 架構

每個功能模組必須包含 `index.ts` 作為公開 API：

```typescript
// src/features/auth/index.ts
export { LoginForm } from "./components/LoginForm";
export { loginAction } from "./actions";
export { loginSchema } from "./schema";
export type { LoginInput } from "./types";
```

## Import 規則

```typescript
// ✅ 正確：透過功能的公開 API
import { LoginForm } from "@/features/auth";

// ❌ 錯誤：直接 import 內部檔案
import { LoginForm } from "@/features/auth/components/LoginForm";
```

## 依賴流向（單向）

```
app/ → features/ → lib/
       ↓
       components/ui/
```

- `features/` 可以 import `lib/` 和 `components/ui/`
- `features/` 之間**不應**互相 import
- 如需共用邏輯，提取到 `lib/`

## Server Actions 規範

```typescript
"use server";

import { z } from "zod";
import { schema } from "./schema";

export async function action(input: z.infer<typeof schema>) {
  // 1. 驗證輸入（必須）
  const validated = schema.parse(input);
  // 2. 執行業務邏輯
  // 3. 返回結果
}
```

## 元件放置原則

| 類型 | 位置 |
|:-----|:-----|
| 功能專屬元件 | `src/features/[name]/components/` |
| 路由專屬元件 | `src/app/[route]/_components/` |
| 全域共用元件 | `src/components/` |

## 安全性

- Server Actions 必須有 `"use server"` 標記
- 所有 user input 必須通過 Zod 驗證
- 使用 `auth()` 檢查權限
- 不要在 Client Components 暴露敏感邏輯
