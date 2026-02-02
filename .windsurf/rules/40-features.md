<activation_mode>model_decision</activation_mode>
<description>當用戶要建立、修改、或討論 feature module 架構時啟用</description>

<feature_first_rules>

# Feature-First 架構規則

本專案採用 Feature-First + Colocation 模式組織程式碼。

</feature_first_rules>

<structure>

## Feature 標準結構

```
src/features/
├── auth/                 # 認證模組
├── user/                 # 用戶模組
├── school-service/       # 學校服務模組
└── [feature]/            # 每個功能標準結構
    ├── components/       # 該功能專用 UI 元件
    │   ├── LoginForm.tsx
    │   └── index.ts
    ├── hooks/            # 該功能專用 Hooks
    │   └── useAuth.ts
    ├── actions.ts        # Server Actions
    ├── queries.ts        # 資料查詢函式
    ├── schema.ts         # Zod 驗證規則
    ├── types.ts          # TypeScript 型別
    └── index.ts          # 🎯 公開 API（控制 export）
```

</structure>

<public_api>

## 公開 API (index.ts)

每個 feature **必須**有 `index.ts` 控制對外暴露：

```typescript
// src/features/auth/index.ts

// Components
export { LoginForm } from "./components/LoginForm";
export { RegisterForm } from "./components/RegisterForm";

// Actions
export { loginAction, registerAction, logoutAction } from "./actions";

// Hooks
export { useAuth } from "./hooks/useAuth";

// Schema
export { loginSchema, registerSchema } from "./schema";

// Types
export type { LoginInput, RegisterInput, AuthUser } from "./types";
```

</public_api>

<import_rules>

## Import 規則

### ✅ 正確方式

```typescript
// 從 feature 的公開 API import
import { LoginForm, loginAction } from "@/features/auth";
import { UserCard, useUserProfile } from "@/features/user";

// feature 內部用相對路徑
// src/features/auth/components/LoginForm.tsx
import { loginAction } from "../actions";
import { loginSchema } from "../schema";
import type { LoginInput } from "../types";
```

### ❌ 錯誤方式

```typescript
// 直接 import feature 內部檔案
import { LoginForm } from "@/features/auth/components/LoginForm";

// 跨 feature import（應該提取到 lib/）
import { formatUser } from "@/features/user/utils";
```

</import_rules>

<dependency_flow>

## 依賴流向（單向）

```
app/
 ↓
features/  →  components/ui/
 ↓
lib/
```

### 規則

- `app/` 可以 import `features/`、`components/`、`lib/`
- `features/` 可以 import `lib/`、`components/ui/`
- `features/` 之間**不應**互相 import
- 共用邏輯提取到 `lib/`

</dependency_flow>

<component_placement>

## 元件放置原則

| 類型         | 位置                              | 範例                    |
| :----------- | :-------------------------------- | :---------------------- |
| 功能專屬元件 | `src/features/[name]/components/` | `LoginForm`, `UserCard` |
| 路由專屬元件 | `src/app/[route]/_components/`    | `DashboardStats`        |
| 全域共用元件 | `src/components/ui/`              | `Button`, `Modal`       |
| Layout 元件  | `src/components/layout/`          | `Sidebar`, `Header`     |

</component_placement>

<creating_feature>

## 新增 Feature 步驟

1. **建立目錄**: `src/features/[name]/`

2. **建立核心檔案**:

   ```bash
   src/features/[name]/
   ├── index.ts      # 公開 API（必須）
   ├── types.ts      # 型別定義
   ├── schema.ts     # Zod 驗證
   ├── actions.ts    # Server Actions
   └── queries.ts    # 資料查詢
   ```

3. **建立元件**:

   ```bash
   src/features/[name]/components/
   ├── FeatureForm.tsx
   ├── FeatureList.tsx
   └── index.ts
   ```

4. **設定 index.ts**:

   ```typescript
   // 只匯出需要對外使用的
   export { FeatureForm, FeatureList } from "./components";
   export { createFeatureAction } from "./actions";
   export { featureSchema } from "./schema";
   export type { Feature, CreateFeatureInput } from "./types";
   ```

5. **在頁面使用**:
   ```typescript
   // src/app/(private)/dashboard/feature/page.tsx
   import { FeatureList, createFeatureAction } from "@/features/[name]";
   ```

</creating_feature>
