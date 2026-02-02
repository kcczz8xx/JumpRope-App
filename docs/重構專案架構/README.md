# JumpRope-App 文件結構重構指南

## 需求概述

將現有的 **Layer-based（分層式）** 結構轉型為 **Feature-First + Colocation（功能優先 + 就近放置）** 的架構，減少開發時的 context switching，提升程式碼可維護性和開發效率。

---

## 技術分析

**現況掃描**：

- 專案版本：Next.js 15.5.2、React 19、TypeScript 5、Prisma 7.3
- 現有架構：技術分層（`app/`, `components/`, `lib/`, `utils/`, `layout/`）
- 路由結構：已使用 Route Groups `(public)`, `(private)`
- 問題點：邏輯分散、`utils` 重複、Layout 位置不當、根目錄混雜
- 現有功能模組：`components/feature/` 已有 `school-service/`、`user/` 兩個功能模組
- Tailwind 版本：**v4**（使用 CSS-based 配置，無 `tailwind.config.js`）

**最佳實踐參考**：

- **Feature-Sliced Design**：業務邏輯按功能劃分，單向依賴流動，模組邊界清晰 [feature-sliced](https://feature-sliced.design/vi/blog/nextjs-app-router-guide)
- **Colocation Pattern**：將元件、邏輯、型別放在路由資料夾內，減少全域污染 [next-colocation-template.vercel](https://next-colocation-template.vercel.app)
- **src/ 目錄**：Next.js 官方支援 `src/` 目錄，將原始碼與設定檔分離 [nextjs](https://nextjs.org/docs/pages/api-reference/file-conventions/src-folder)
- **Next.js 15 規範**：優先使用 Server Components、Server Actions 取代傳統 API Routes [janhesters](https://janhesters.com/blog/how-to-set-up-nextjs-15-for-production-in-2025)

---

## 現有結構分析

### 根目錄結構

```
jumprope-app/
├── app/                    # Next.js App Router
│   ├── (private)/          # 需登入的頁面
│   ├── (public)/           # 公開頁面
│   └── api/                # API Routes
├── components/             # UI 元件
│   ├── auth/               # 認證元件 → 遷移到 features/auth/
│   ├── feature/            # 功能元件 → 遷移到 features/
│   │   ├── school-service/
│   │   └── user/
│   ├── tailadmin/          # UI 模板元件 (302 items)
│   └── ui/                 # 基礎 UI 元件
├── config/                 # 配置檔案
├── context/                # Context Providers (4 個)
├── hooks/                  # 全域 Hooks (6 個)
├── icons/                  # 圖標 (64 items)
├── layout/                 # Layout 元件 → 遷移到 components/layout/
│   └── private/
├── lib/                    # 工具與服務
│   ├── auth/               # NextAuth 配置
│   ├── client/             # 客戶端工具
│   ├── constants/          # 常量
│   ├── db/                 # Prisma 客戶端
│   ├── mock-data/          # Mock 資料
│   ├── rbac/               # 權限控制
│   ├── server/             # 伺服器工具
│   ├── services/           # 服務層
│   ├── utils/              # 工具函式
│   └── validations/        # Zod 驗證
├── prisma/                 # Prisma Schema
├── public/                 # 靜態資源
├── utils/                  # 重複的 cn() → 合併到 lib/utils/
└── ...設定檔
```

### 重複代碼分析

| 檔案   | 位置              | 說明       |
| :----- | :---------------- | :--------- |
| `cn()` | `utils/index.ts`  | 重複，刪除 |
| `cn()` | `lib/utils/cn.ts` | 保留       |

### Import 路徑使用統計

- `@/utils` → 1 處使用
- `@/layout` → 4 處使用
- `@/context` → 11 處使用

---

## 實施方案

### 階段一：準備工作（預估：15 分鐘）

**目標**：建立備份、確認環境、理解現有結構

#### 1.1 建立重構分支

```bash
git checkout main
git pull origin main
git checkout -b refactor/feature-first-structure
```

#### 1.2 確認測試可正常運行

```bash
pnpm install
pnpm build  # 確保編譯無誤
pnpm test   # 確保測試通過
pnpm dev    # 確認開發環境正常
```

#### 1.3 建立結構規劃文件

建立 `REFACTOR_PLAN.md`，記錄遷移進度：

```markdown
# 重構進度追蹤

## 階段二：引入 src 目錄

- [ ] 移動 app/
- [ ] 移動 components/
- [ ] 移動 lib/
- [ ] 移動其他資料夾
- [ ] 更新設定檔

## 階段三：清理與合併

- [ ] 合併 utils
- [ ] 搬移 layout
- [ ] 搬移 context 到 lib/providers/

## 階段四：建立 features 結構

- [ ] 規劃功能模組
- [ ] 試行第一個 feature
```

---

### 階段二：引入 src/ 目錄（預估：30 分鐘）

**目標**：將原始碼搬入 `src/`，讓根目錄只保留設定檔

#### 2.1 建立 src 目錄結構

```bash
mkdir src
```

#### 2.2 移動核心資料夾

```bash
# 移動路由與元件
mv app src/
mv components src/
mv lib src/
mv hooks src/
mv layout src/components/layout  # 同時修正 layout 位置

# 移動工具類
mv utils src/utils-temp  # 暫存，等待與 lib/utils 合併
mv context src/context-temp  # 暫存，稍後搬到 lib/providers/
mv config src/  # 配置檔案
```

**⚠️ 不要移動的資料夾**：

- `prisma/` (Prisma CLI 預設在根目錄尋找)
- `public/` (Next.js 靜態資源必須在根目錄)
- `docs/`, `scripts/` (專案文件，保留根目錄)
- `config/` (已有 `sidebar-nav.tsx` 集中配置，移入 `src/config/`)

**icons/ 處理**：

`icons/` 目錄包含 64 個圖標檔案，需先檢查內容類型：

```bash
# 檢查 icons/ 的內容類型
ls icons/ | head -5

# 決策流程：
# 1. 如果是 .svg, .png, .jpg 等靜態檔案 → 移入 public/icons/
# 2. 如果是 .tsx 元件檔案（例如 LogoIcon.tsx）→ 移入 src/icons/
```

**選項 1：靜態資源**

```bash
mv icons public/icons
# 使用方式：<Image src="/icons/logo.svg" />
```

**選項 2：React 元件**（本專案為此類型）

```bash
mv icons src/icons
# 使用方式：import { LogoIcon } from '@/icons'
```

#### 2.3 更新設定檔

**tsconfig.json**：

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/features/*": ["./src/features/*"]
    }
    // ...其他設定保持不變
  }
}
```

**Tailwind CSS v4 配置**：

此專案使用 Tailwind CSS v4，配置方式與 v3 不同：

- ❌ 不需要 `tailwind.config.js` 或 `tailwind.config.ts`
- ✅ 配置在 CSS 檔案內使用 `@theme` 指令
- ✅ `postcss.config.mjs` 使用 `@tailwindcss/postcss`

遷移後通常**不需要**額外配置：

```css
/* src/app/(private)/globals.css */
@import "tailwindcss";

/* Tailwind v4 會自動根據 tsconfig.json 的 include 掃描檔案 */
/* 只要 src/features/ 在 TypeScript 的掃描範圍內，不需要額外的 @source */
/* 如果樣式沒載入，再加上以下設定： */
/* @source "../../features/**/*.{ts,tsx}"; */
```

**排查步驟**（如樣式失效）：

1. 確認 `globals.css` 有被正確 import 到 `layout.tsx`
2. 檢查 `tsconfig.json` 的 `include` 是否涵蓋 `src/`
3. 必要時才加 `@source` 指令

**jest.config.js**：

```js
module.exports = {
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  // ...其他設定
};
```

**components.json** (Shadcn UI)：

```json
{
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

#### 2.4 驗證遷移

```bash
rm -rf .next  # 清除快取
pnpm dev      # 確認開發環境啟動
pnpm build    # 確認生產建置成功
pnpm test     # 確認測試通過
```

**常見問題排查**：

- ❌ 如果出現 `Module not found`：檢查 `tsconfig.json` 的 `paths`
- ❌ 如果樣式失效：檢查 Tailwind 的 `content` 路徑
- ❌ 如果測試失敗：檢查 Jest 的 `moduleNameMapper`

---

### 階段三：清理與合併（預估：45 分鐘）

**目標**：消除冗餘、統一工具庫、改善檔案組織

#### 3.1 合併 utils 資料夾

```bash
# 1. 檢查根目錄 utils 的內容
ls -la src/utils-temp/

# 2. 比對 lib/utils 的內容
ls -la src/lib/utils/

# 3. 將 utils-temp 的檔案合併到 lib/utils
cp -r src/utils-temp/* src/lib/utils/

# 4. 刪除 utils-temp
rm -rf src/utils-temp
```

**程式碼調整範例**：

如果原本的 import 是：

```typescript
import { formatDate } from "@/utils/date";
```

改為：

```typescript
import { formatDate } from "@/lib/utils/date";
```

**批量替換指令**：

```bash
# macOS
find src -type f \( -name "*.ts" -o -name "*.tsx" \) | xargs sed -i '' 's|@/utils/|@/lib/utils/|g'

# Linux
find src -type f \( -name "*.ts" -o -name "*.tsx" \) | xargs sed -i 's|@/utils/|@/lib/utils/|g'
```

**Windows (PowerShell)**：

```powershell
Get-ChildItem -Path src -Include *.ts,*.tsx -Recurse | ForEach-Object {
  (Get-Content $_.FullName) -replace '@/utils/', '@/lib/utils/' | Set-Content $_.FullName
}
```

**或使用 VS Code 全域替換**：

- `Ctrl+Shift+H` 開啟全域替換
- 搜尋：`@/utils/`
- 替換：`@/lib/utils/`

#### 3.2 整理 layout 資料夾

現在 `layout/` 已在 `src/components/layout/`，確保內容合理：

```bash
# 檢查內容
ls -la src/components/layout/

# 典型的 Layout 元件應該包含：
# - DashboardLayout.tsx
# - Sidebar.tsx
# - Header.tsx
# - Footer.tsx
```

**更新 import**：

```typescript
// 舊的 (錯誤)
import DashboardLayout from "@/layout/DashboardLayout";

// 新的 (正確)
import DashboardLayout from "@/components/layout/DashboardLayout";
```

#### 3.3 處理 context 資料夾

**⚠️ 重要**：此專案的 Context 均有實際用途，全部保留並搬移。

現有 Context 檔案：

- `SWRProvider.tsx` - SWR 快取配置（必要）
- `SessionProvider.tsx` - NextAuth Session（必要）
- `SidebarContext.tsx` - Sidebar 展開狀態 + localStorage 持久化（必要）
- `ThemeContext.tsx` - 主題切換（必要）

**搬移到 `src/lib/providers/`**：

```bash
mkdir -p src/lib/providers
mv src/context-temp/*.tsx src/lib/providers/
rm -rf src/context-temp
```

**更新 import 路徑**：

```typescript
// 舊的
import { SidebarProvider } from "@/context/SidebarContext";

// 新的
import { SidebarProvider } from "@/lib/providers/SidebarContext";
```

#### 3.4 處理 TailAdmin 元件（預估：30 分鐘）

**現況**：`components/tailadmin/` 有 302 個 UI 模板元件

**檢查使用頻率**：

```bash
grep -r "tailadmin" src/app --include="*.tsx" | wc -l
```

**決策流程**：

1. **如果大量使用**（>20 處）：保留在 `src/components/tailadmin/`
2. **如果僅特定頁面使用**：移到對應的 `app/[route]/_components/`
3. **如果大部分未使用**：建立 `_archive` 資料夾存放

```bash
# 選項 1：保留不變
# src/components/tailadmin/ 維持現狀

# 選項 2：移到路由內
mv src/components/tailadmin/Dashboard* src/app/(private)/dashboard/_components/

# 選項 3：封存未使用
mkdir -p src/components/_archive
mv src/components/tailadmin src/components/_archive/
```

---

### 階段四：建立 features 結構（預估：2 小時）

**目標**：將功能模組化，建立第一個範例

#### 4.1 規劃功能模組

根據你的專案，識別核心功能。典型的 JumpRope-App 可能包含：

```
src/features/
├── auth/              # 登入註冊（從 components/auth/ 遷移）
├── user/              # 用戶資料（從 components/feature/user/ 遷移）
├── school-service/    # 學校服務（從 components/feature/school-service/ 遷移）
├── courses/           # 課程管理
├── schedule/          # 課表排程
└── payments/          # 付款管理
```

**現有模組遷移對照**：

| 現有位置                             | 遷移目標                   |
| :----------------------------------- | :------------------------- |
| `components/auth/`                   | `features/auth/`           |
| `components/feature/user/`           | `features/user/`           |
| `components/feature/school-service/` | `features/school-service/` |

#### 4.2 建立 features 基礎結構

```bash
mkdir -p src/features
cd src/features
mkdir -p auth courses students instructors schedule attendance payments
```

#### 4.3 定義 Feature 標準結構

每個 feature 資料夾應包含：

```
features/[feature-name]/
├── components/        # 該功能專用的 UI 元件
├── hooks/            # 該功能專用的 React Hooks
├── actions.ts        # Server Actions (資料變更)
├── queries.ts        # 資料查詢函式
├── schema.ts         # Zod 驗證規則
├── types.ts          # TypeScript 型別定義
├── utils.ts          # 該功能專用工具函式
└── index.ts          # 公開 API (控制哪些可被外部 import)
```

#### 4.4 範例：重構 Auth 模組

**步驟 1：建立結構**

```bash
mkdir -p src/features/auth/{components,hooks}
touch src/features/auth/{actions.ts,queries.ts,schema.ts,types.ts,index.ts}
```

**步驟 2：搬移現有程式碼**

```bash
# 假設你原本有 components/auth/ 和 lib/auth/
# 搬移現有 auth 元件
mv src/components/auth/*.tsx src/features/auth/components/
mv src/components/auth/reset-password src/features/auth/components/
mv src/components/auth/signup src/features/auth/components/

# 注意：lib/auth/ 包含 NextAuth 核心配置，保持原位
# - lib/auth/options.ts (NextAuth 配置)
# - lib/auth/index.ts (auth() 匯出)
# - lib/auth/types.ts (Session 型別擴展)

# 在 features/auth/ 建立驗證 Schema（如需要）
# Schema 可以從 lib/validations/user.ts 引用

# 測試檔案也要一起搬移
find src/components/auth -name "*.test.ts*" -o -name "*.spec.ts*"
```

**步驟 3：定義公開 API** (`src/features/auth/index.ts`)

```typescript
// 只 export 需要被外部使用的內容
export { LoginForm } from "./components/LoginForm";
export { RegisterForm } from "./components/RegisterForm";
export { loginAction, registerAction } from "./actions";
export { loginSchema, registerSchema } from "./schema";
export type { LoginInput, RegisterInput } from "./types";
```

**步驟 4：重寫 Server Actions** (`src/features/auth/actions.ts`)

```typescript
"use server";

import { signIn } from "@/lib/auth/config";
import { loginSchema } from "./schema";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export async function loginAction(input: z.infer<typeof loginSchema>) {
  try {
    // 1. 驗證輸入
    const validated = loginSchema.parse(input);

    // 2. 呼叫 NextAuth
    const result = await signIn("credentials", {
      email: validated.email,
      password: validated.password,
      redirect: false,
    });

    if (!result?.ok) {
      return { success: false, error: "Invalid credentials" };
    }

    // 3. 重新驗證路由
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    return { success: false, error: "Something went wrong" };
  }
}
```

**步驟 5：更新頁面使用方式** (`src/app/(public)/login/page.tsx`)

```typescript
import { LoginForm } from "@/features/auth"; // 從 feature 的公開 API import

export default function LoginPage() {
  return (
    <div className="container">
      <h1>登入</h1>
      <LoginForm />
    </div>
  );
}
```

**步驟 6：更新 LoginForm 元件** (`src/features/auth/components/LoginForm.tsx`)

```typescript
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginAction } from "../actions"; // 相對路徑，不走公開 API
import { loginSchema } from "../schema";
import { z } from "zod";

type LoginInput = z.infer<typeof loginSchema>;

export function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    const result = await loginAction(data);
    if (result.success) {
      window.location.href = "/dashboard";
    } else {
      alert(result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("email")} placeholder="Email" />
      {errors.email && <span>{errors.email.message}</span>}

      <input {...register("password")} type="password" placeholder="Password" />
      {errors.password && <span>{errors.password.message}</span>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "登入中..." : "登入"}
      </button>
    </form>
  );
}
```

#### 4.5 處理共用元件

**原則**：

- 🔵 **功能專屬元件**：放在 `features/[name]/components/`
- 🟢 **路由專屬元件**：放在 `app/[route]/_components/`（使用 `_` 前綴避免成為路由）
- 🟡 **全域共用元件**：保留在 `src/components/`

**範例**：

```
src/
├── components/
│   ├── ui/              # Shadcn UI 基礎元件 (Button, Input, Dialog)
│   └── layout/          # Layout 元件 (Sidebar, Header)
├── features/
│   └── courses/
│       └── components/  # 課程專屬元件 (CourseCard, CourseList)
└── app/
    └── (private)/
        └── dashboard/
            └── _components/  # 僅 Dashboard 頁面使用的元件
```

---

### 階段五：測試與驗證（預估：30 分鐘）

**目標**：確保重構後功能正常

#### 5.1 TypeScript 編譯檢查

```bash
pnpm build
```

**常見錯誤修正**：

```typescript
// ❌ 錯誤：import 了 feature 內部檔案
import { hashPassword } from "@/features/auth/utils";

// ✅ 正確：透過公開 API import
import { hashPassword } from "@/features/auth";
```

#### 5.2 執行測試套件

```bash
pnpm test
pnpm test:coverage  # 檢查覆蓋率
```

如果測試失敗，更新測試檔案的 import 路徑。

#### 5.3 開發環境功能測試

```bash
pnpm dev
```

**測試清單**：

- [ ] 首頁載入正常
- [ ] 登入功能正常
- [ ] Dashboard 顯示正常
- [ ] API Routes 正常
- [ ] 樣式正確載入
- [ ] 圖片資源正常顯示

#### 5.4 ESLint 檢查

```bash
pnpm lint
```

修正所有警告和錯誤。

---

### 階段六：更新文檔與提交（預估：20 分鐘）

**目標**：記錄變更、提交程式碼

#### 6.1 更新 README.md

```markdown
# Jumprope App

## 📁 專案結構
```

.
├── prisma/ # 資料庫 Schema
├── public/ # 靜態資源
├── src/ # 原始碼目錄
│ ├── app/ # Next.js App Router (路由定義)
│ ├── components/ # 全域共用元件
│ │ ├── ui/ # 基礎 UI 元件
│ │ └── layout/ # Layout 元件
│ ├── features/ # 功能模組 (Feature-First)
│ │ ├── auth/ # 認證模組
│ │ ├── courses/ # 課程模組
│ │ └── ...
│ ├── lib/ # 全域工具與設定
│ │ ├── auth/ # NextAuth 設定
│ │ ├── db/ # Prisma 客戶端
│ │ ├── utils/ # 工具函式
│ │ └── providers/ # Context Providers
│ └── hooks/ # 全域共用 Hooks
└── ...設定檔

````

## 🧩 架構原則

### Feature-First 開發
每個功能模組 (`src/features/*`) 應包含：
- `components/` - UI 元件
- `actions.ts` - Server Actions
- `queries.ts` - 資料查詢
- `schema.ts` - Zod 驗證
- `types.ts` - TypeScript 型別
- `index.ts` - 公開 API

### Import 規則
```typescript
// ✅ 正確：透過功能的公開 API
import { LoginForm, loginAction } from '@/features/auth'

// ❌ 錯誤：直接 import 功能內部檔案
import { LoginForm } from '@/features/auth/components/LoginForm'
````

### Server vs Client

- 預設使用 Server Components
- 需要互動性才加 `'use client'`
- Client Components 放在 `features/*/components/` 內

````

#### 6.2 建立 CHANGELOG.md

```markdown
# Changelog

## [Unreleased] - 2026-02-02

### Changed
- 🏗️ 重構專案結構為 Feature-First 架構
- 📁 引入 `src/` 目錄，將原始碼與設定檔分離
- 🗂️ 建立 `features/` 目錄，實現功能模組化
- 🧹 合併 `utils/` 至 `lib/utils/`，消除冗餘
- 📦 移動 `layout/` 至 `components/layout/`
- 🔧 更新 `tsconfig.json`, `tailwind.config`, `jest.config` 的路徑設定

### Added
- 📝 建立 `features/auth/` 模組範例
- 📚 更新 README 的架構說明

### Removed
- 🗑️ 移除根目錄的 `utils/` 資料夾
- 🗑️ 移動 `context/` 到 `lib/providers/`
````

#### 6.3 提交變更

```bash
# 檢查變更
git status
git diff

# 分階段提交
git add src/ tsconfig.json tailwind.config.js jest.config.js
git commit -m "refactor: 引入 src/ 目錄並更新設定檔"

git add README.md CHANGELOG.md
git commit -m "docs: 更新專案結構文檔"

# 推送到遠端
git push origin refactor/feature-first-structure
```

#### 6.4 建立 Pull Request

**PR 標題**：`♻️ 重構：Feature-First 架構 + src/ 目錄`

**PR 描述範本**：

```markdown
## 📋 變更概述

將專案從 Layer-based 架構重構為 Feature-First 架構，提升程式碼組織性與開發效率。

## 🎯 主要變更

- [x] 引入 `src/` 目錄
- [x] 建立 `features/` 模組系統
- [x] 合併冗餘的 `utils/` 資料夾
- [x] 重新組織 Layout 元件
- [x] 更新所有設定檔路徑

## ✅ 測試結果

- [x] `pnpm build` 成功
- [x] `pnpm test` 全部通過
- [x] `pnpm lint` 無錯誤
- [x] 開發環境手動測試通過

## 📚 文檔更新

- [x] 更新 README.md
- [x] 建立 CHANGELOG.md

## 🚨 影響範圍

這是結構性變更，但**不影響任何功能**。所有 import 路徑已更新。

## 🔗 相關 Issue

Closes #XXX (如有)
```

---

## 緊急回滾方案

如果重構過程中遇到無法解決的問題：

```bash
# 1. 放棄所有未提交的變更
git reset --hard HEAD

# 2. 刪除重構分支（如已推送）
git checkout main
git branch -D refactor/feature-first-structure

# 3. 清除 Next.js 快取
rm -rf .next node_modules/.cache

# 4. 重新安裝（如有必要）
pnpm install
pnpm dev
```

**預防措施**：

- 每完成一個階段就提交一次 commit
- 使用 `git tag before-features` 標記重要節點
- 在本地環境完成所有驗證再推送到遠端

---

## 常見錯誤速查表

| 錯誤訊息                                    | 原因                   | 解決方案                                  |
| :------------------------------------------ | :--------------------- | :---------------------------------------- |
| `Module not found: Can't resolve '@/utils'` | 舊的 import 路徑未更新 | 全域搜尋替換 `@/utils` → `@/lib/utils`    |
| `Cannot find module '@/layout/...'`         | Layout 路徑錯誤        | 改為 `@/components/layout/`               |
| `Parsing error: Cannot find module 'next'`  | 快取問題               | 刪除 `.next` 和 `node_modules/.cache`     |
| `Class ... does not exist` (Tailwind)       | CSS 掃描路徑問題       | 檢查 `tsconfig.json` 的 `include`         |
| `SidebarProvider is not defined`            | Context import 錯誤    | 改為 `@/lib/providers/SidebarContext`     |
| `prisma generate` 失敗                      | Prisma 資料夾位置      | 確認 `prisma/` 在根目錄（不要移入 `src`） |

---

## 注意事項

### ⚠️ 風險與緩解方案

| 風險                        | 緩解方案                                               |
| :-------------------------- | :----------------------------------------------------- |
| Import 路徑遺漏導致編譯失敗 | 使用 TypeScript 嚴格模式、執行 `pnpm build` 檢查       |
| 測試失敗                    | 更新 Jest 的 `moduleNameMapper`、逐一修正測試檔案      |
| Vercel 部署失敗             | 確保 `package.json` 的 build script 正確、檢查環境變數 |
| 團隊成員不熟悉新結構        | 更新 README、舉辦內部分享會                            |

### 💡 優化建議

1. **逐步遷移**：不必一次重構所有功能，可以先建立 1-2 個範例 feature，其他功能按需遷移
2. **使用 ESLint Plugin**：安裝 `eslint-plugin-boundaries` 強制執行模組邊界
3. **建立程式碼範本**：使用 Plop.js 或類似工具自動生成 feature 結構
4. **持續文檔更新**：每個 feature 的 README 說明用途和 API

### 🔒 安全性考量

- ✅ Server Actions 必須加 `'use server'` 標記
- ✅ 所有 user input 必須通過 Zod 驗證
- ✅ 不要在 Client Components 暴露敏感邏輯
- ✅ 使用 NextAuth 的 `auth()` 檢查權限

---

## 時間預估

| 階段                |      時間       |
| :------------------ | :-------------: |
| 準備工作            |     15 分鐘     |
| 引入 src/           |     30 分鐘     |
| 清理與合併          |     45 分鐘     |
| 處理 TailAdmin 元件 |     30 分鐘     |
| 建立 features       |     2 小時      |
| 測試與驗證          |     30 分鐘     |
| 文檔與提交          |     20 分鐘     |
| **總計**            | **約 4.5 小時** |

---

## 後續建議

### 短期（1-2 週內）

- [ ] 重構第二個 feature（例如 `courses`）
- [ ] 建立 `features/README.md` 說明模組開發規範
- [ ] 設定 Husky pre-commit hook 檢查 import 規則

### 中期（1 個月內）

- [ ] 將所有主要功能遷移到 `features/`
- [ ] 評估是否引入 Turborepo（如專案持續擴大）
- [ ] 設定 Storybook 展示元件庫

### 長期（3 個月內）

- [ ] 建立設計系統文檔
- [ ] 實施自動化測試覆蓋率目標（80%+）
- [ ] 考慮 Monorepo 架構（如需分離前後端）

---

## 參考資源

- [Next.js 官方：src 目錄](https://nextjs.org/docs/app/getting-started/project-structure#src-directory) [nextjs](https://nextjs.org/docs/pages/api-reference/file-conventions/src-folder)
- [Feature-Sliced Design](https://feature-sliced.design) [feature-sliced](https://feature-sliced.design/vi/blog/nextjs-app-router-guide)
- [Next.js Colocation Template](https://next-colocation-template.vercel.app) [next-colocation-template.vercel](https://next-colocation-template.vercel.app)
- [Next.js 15 生產環境設定](https://janhesters.com/blog/how-to-set-up-nextjs-15-for-production-in-2025) [janhesters](https://janhesters.com/blog/how-to-set-up-nextjs-15-for-production-in-2025)

---

**版本**：v1.1 | **更新**：2026-02-02 | **專案**：JumpRope-App

### 更新記錄

- **v1.1** - 根據實際專案結構分析更新：
  - 修正 Tailwind v4 配置說明
  - 補充 TailAdmin 處理方案
  - 新增回滾方案與錯誤速查表
  - 調整 Context 處理策略（全部保留）
- **v1.0** - 初始版本
