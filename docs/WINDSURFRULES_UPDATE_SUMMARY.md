# .windsurfrules 更新總結

> 更新日期：2026-02-02
> 參考來源：[How To Set Up Next.js 15 For Production In 2025](https://janhesters.com/blog/how-to-set-up-nextjs-15-for-production-in-2025)

---

## 📋 更新概覽

根據 Jan Hesters 的 Next.js 15 生產環境指南，結合 `docs/重構專案架構/README.md` 的重構計劃，預先設計好 `.windsurfrules` 規則。

---

## ✅ 新增項目

### 1. 環境變量補充

```diff
+ `POSTGRES_URL_NON_POOLING` — 直連 URL（用於 migrations，避免 dangling databases）
```

**原因**：Vercel 使用 connection pooling，但 `prisma migrate` 需要直連才能正常執行。

### 2. 指令補充

```diff
+ `pnpm type-check` — 執行 TypeScript 類型檢查（`tsc -b`）
```

**Prisma 輔助指令**：
- `prisma:migrate` — 建立新 migration
- `prisma:deploy` — 部署 migrations
- `prisma:push` — 推送 schema（prototyping）
- `prisma:studio` — 開啟 GUI
- `prisma:seed` — 填充資料
- `prisma:wipe` — 重置資料庫

### 3. Feature-First + src/ 目錄結構

```
jumprope-app/
├── prisma/              # ⚠️ 必須在根目錄
├── public/              # ⚠️ 必須在根目錄
└── src/
    ├── app/
    ├── features/        # 🎯 功能模組
    ├── components/
    ├── lib/
    │   └── providers/   # Context 搬移至此
    └── hooks/
```

### 4. Feature 標準結構

每個功能模組必須包含 `index.ts` 作為公開 API：

```typescript
// src/features/auth/index.ts
export { LoginForm } from "./components/LoginForm";
export { loginAction } from "./actions";
export { loginSchema } from "./schema";
export type { LoginInput } from "./types";
```

### 5. Import 規則

```typescript
// ✅ 正確：透過功能的公開 API
import { LoginForm, loginAction } from "@/features/auth";

// ❌ 錯誤：直接 import 內部檔案
import { LoginForm } from "@/features/auth/components/LoginForm";
```

### 6. Server Actions 規範

```typescript
"use server";

export async function loginAction(input: LoginInput) {
  // 1. Zod 驗證輸入（必須）
  // 2. 執行業務邏輯
  // 3. revalidatePath（如需要）
  // 4. 返回結果
}
```

### 7. 依賴流向（單向）

```
app/ → features/ → lib/
       ↓
       components/ui/
```

### 8. 安全性規範

- ✅ Server Actions 必須加 `"use server"`
- ✅ 所有 user input 必須通過 Zod 驗證
- ✅ 不要在 Client Components 暴露敏感邏輯
- ✅ 使用 `auth()` 檢查權限

### 9. 常見錯誤速查

| 錯誤訊息 | 解決方案 |
|:---------|:---------|
| `Module not found: '@/utils'` | 改為 `@/lib/utils` |
| `Cannot find module '@/layout'` | 改為 `@/components/layout` |
| `Cannot find module '@/context'` | 改為 `@/lib/providers` |
| Tailwind 樣式失效 | 檢查 `tsconfig.json` 的 `include` |
| Prisma 找不到 schema | 確認 `prisma/` 在根目錄 |

---

## 🔄 修改項目

| 項目 | 舊值 | 新值 |
|:-----|:-----|:-----|
| 架構模式 | Layer-based | Feature-First + Colocation |
| 路徑 alias | `@/` → repo root | `@/` → `src/` |
| Context 位置 | `context/` | `lib/providers/` |
| Layout 位置 | `layout/` | `components/layout/` |
| 代碼格式 | 雙引號 | 單引號 |
| Tailwind 版本 | 未指定 | v4（CSS-based 配置） |

---

## 📁 路徑變更對照表

重構後需要批量替換的 import 路徑：

| 現有路徑 | 重構後路徑 |
|:---------|:-----------|
| `@/utils` | `@/lib/utils` |
| `@/layout` | `@/components/layout` |
| `@/context` | `@/lib/providers` |
| `@/components/auth` | `@/features/auth` |
| `@/components/feature/user` | `@/features/user` |
| `@/components/feature/school-service` | `@/features/school-service` |

---

## 📌 文章中有但專案未採用

| 工具 | 用途 | 備註 |
|:-----|:-----|:-----|
| **Vitest** | 單元測試 | 比 Jest 快，但專案已用 Jest |
| **Playwright** | E2E 測試 | 可考慮日後加入 |
| **Commitlint** | Git hook | 強制 Conventional Commits |
| **Prettier** | 代碼格式化 | 可搭配 `prettier-plugin-tailwindcss` |
| **eslint-plugin-unicorn** | 更嚴格 ESLint 規則 | 可選 |

---

## 📚 參考資源

- [Jan Hesters - Next.js 15 生產環境設定](https://janhesters.com/blog/how-to-set-up-nextjs-15-for-production-in-2025)
- [Feature-Sliced Design](https://feature-sliced.design)
- [Next.js Colocation Template](https://next-colocation-template.vercel.app)
- [Next.js 官方 - src 目錄](https://nextjs.org/docs/app/getting-started/project-structure#src-directory)

---

**狀態**：✅ 規則已更新，待重構時套用
