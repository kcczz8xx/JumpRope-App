# Feature Module Guidelines

**Scope**: All feature modules (`src/features/**`).

## 模組標準結構

### 小型 Feature（單一檔案模式）

```
[feature]/
├── components/     # 該功能專用 UI 元件
├── hooks/          # 該功能專用 Hooks
├── actions.ts      # Server Actions
├── queries.ts      # 資料查詢函式
├── schema.ts       # Zod 驗證規則
├── types.ts        # TypeScript 型別
└── index.ts        # 公開 API（必須）
```

### 大型 Feature（子目錄模式）— 標準

當單一檔案超過 **10KB** 或包含 **3+ 個邏輯域** 時，應拆分為子目錄：

```
[feature]/
├── components/
├── hooks/
├── actions/              # Actions 子目錄
│   ├── _helpers.ts       # 共用輔助函式（_ 前綴避免導出）
│   ├── profile.ts
│   ├── address.ts
│   └── index.ts          # 統一導出
├── schemas/              # Schemas 子目錄
│   ├── profile.ts
│   ├── address.ts
│   └── index.ts
├── queries/              # Queries 子目錄
│   ├── profile.ts
│   └── index.ts
├── types.ts
├── server.ts             # Server-only exports（必須）
└── index.ts              # Client-accessible exports（必須）
```

> 📖 詳細規範請參考 [STRUCTURE.md](./STRUCTURE.md)

## 核心規則

1. **Public API** — 每個 feature 必須透過 `index.ts` 導出公開介面
2. **Server-only** — 每個 feature 必須有 `server.ts` 分離 server-only exports
3. **封裝性** — Feature A 不能直接 import Feature B 的內部檔案
4. **Colocation** — 該功能專用的 components、hooks、actions 都放在此目錄
5. **大小閾值** — 單一 actions/schema 檔案超過 10KB 應考慮拆分

## Import 規則

```typescript
// ✅ 正確：透過功能的公開 API
import { LoginForm, loginAction } from "@/features/auth";

// ❌ 錯誤：直接 import 功能內部檔案
import { LoginForm } from "@/features/auth/components/LoginForm";

// ✅ 功能內部可用相對路徑（單一檔案模式）
import { loginAction } from "../actions";

// ✅ 功能內部可用相對路徑（子目錄模式）
import { loginSchema } from "../schemas/login";
```

## 依賴流向（單向）

```
features/ → lib/
features/ → components/ui/
```

- **可以** import `@/lib/*` 和 `@/components/ui/*`
- **不應** 跨 feature import（如需共用，提取到 `lib/`）

## index.ts 模板

### 單一檔案模式

```typescript
// src/features/[name]/index.ts
export { ComponentA } from "./components/ComponentA";
export { someAction, otherAction } from "./actions";
export { someQuery } from "./queries";
export { schema } from "./schema";
export type { TypeA, TypeB } from "./types";
```

### 子目錄模式

```typescript
// src/features/[name]/index.ts
export { ComponentA } from "./components/ComponentA";
export { someAction, otherAction } from "./actions"; // 從 actions/index.ts 導入
export { someQuery } from "./queries"; // 從 queries/index.ts 導入
export * from "./schemas"; // 重新導出所有 schemas
export type { TypeA, TypeB } from "./types";
```

## 子目錄 index.ts 範例

```typescript
// src/features/user/actions/index.ts
export { updateProfileAction } from "./profile";
export { updateAddressAction, deleteAddressAction } from "./address";
export { updateBankAction, deleteBankAction } from "./bank";
```
