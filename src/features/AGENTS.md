# Feature Module Guidelines

**Scope**: All feature modules (`src/features/**`).

## 模組標準結構

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

## 核心規則

1. **Public API** — 每個 feature 必須透過 `index.ts` 導出公開介面
2. **封裝性** — Feature A 不能直接 import Feature B 的內部檔案
3. **Colocation** — 該功能專用的 components、hooks、actions 都放在此目錄

## Import 規則

```typescript
// ✅ 正確：透過功能的公開 API
import { LoginForm, loginAction } from "@/features/auth";

// ❌ 錯誤：直接 import 功能內部檔案
import { LoginForm } from "@/features/auth/components/LoginForm";

// ✅ 功能內部可用相對路徑
import { loginAction } from "../actions";
```

## 依賴流向（單向）

```
features/ → lib/
features/ → components/ui/
```

- **可以** import `@/lib/*` 和 `@/components/ui/*`
- **不應** 跨 feature import（如需共用，提取到 `lib/`）

## index.ts 模板

```typescript
// src/features/[name]/index.ts
export { ComponentA } from "./components/ComponentA";
export { ComponentB } from "./components/ComponentB";
export { someAction, otherAction } from "./actions";
export { someQuery } from "./queries";
export { schema } from "./schema";
export type { TypeA, TypeB } from "./types";
```
