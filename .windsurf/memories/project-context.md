# JumpRope App 專案知識庫

本文件記錄專案特定決策、常見模式和團隊偏好，避免重複解釋。

---

## 專案特定決策

### 為什麼選擇 Neon 而不是 Docker PostgreSQL？

- **Serverless 架構**: Neon 提供 serverless PostgreSQL，無需管理容器
- **連接池內建**: 透過 `DATABASE_URL` (pooling) 和 `POSTGRES_URL_NON_POOLING` (migrations) 分離
- **Vercel 整合**: 與 Vercel 部署無縫配合
- **開發便利**: 本地開發直連雲端資料庫，無需本地安裝

### 為什麼用 Tailwind CSS v4？

- **CSS-based 配置**: 不再需要 `tailwind.config.js`，直接用 CSS 變數
- **更快的編譯**: 新引擎提升編譯速度
- **更好的 CSS 整合**: 原生 CSS 變數支援

### 為什麼採用 Feature-First 架構？

- **可擴展性**: 每個功能模組獨立，易於維護
- **協作友好**: 開發者可專注特定功能
- **重構安全**: 更新功能時所有相關檔案在一處
- **依賴控制**: 透過 `index.ts` 控制公開 API

---

## 常見模式

### Server Actions 標準模板

```typescript
"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { schema } from "./schema";

export async function action(input: Input) {
  // 1. 驗證權限
  const session = await auth();
  if (!session?.user) return { success: false, error: "未授權" };

  // 2. 驗證輸入
  const validated = schema.safeParse(input);
  if (!validated.success) return { success: false, error: validated.error.flatten() };

  // 3. 執行邏輯
  try {
    const result = await prisma.model.create({ data: validated.data });
    revalidatePath("/path");
    return { success: true, data: result };
  } catch (e) {
    return { success: false, error: "操作失敗" };
  }
}
```

### Modal 表單資料同步

```tsx
// 使用受控組件 + useEffect 重置
useEffect(() => {
  if (isOpen) {
    setFieldValue(initialData.field || "");
  }
}, [isOpen, initialData]);

<Input value={fieldValue} onChange={(e) => setFieldValue(e.target.value)} />
```

### Prisma Migration 流程

```bash
# 1. 修改 schema.prisma
# 2. 建立 migration
pnpm prisma:migrate add_feature_name

# 3. 檢查生成的 SQL
# 4. 部署（生產）
pnpm prisma:deploy
```

### 新增 Feature 模組

```bash
# 1. 建立目錄結構
mkdir -p src/features/new-feature/{components,hooks,__tests__}

# 2. 建立核心檔案
touch src/features/new-feature/{index,types,schema,actions,queries}.ts

# 3. 設定 index.ts 公開 API
# 4. 在 app/ 路由中使用
```

---

## 團隊偏好

### UI 框架選擇

- ✅ **Shadcn/ui**: 優先使用，可自訂性高
- ✅ **TailAdmin**: 現有 Dashboard 模板元件
- ❌ **Material-UI**: 不使用（bundle 太大）

### 資料獲取

- ✅ **Server Components + 直接 await**: 優先
- ✅ **Server Actions**: 表單提交和資料變更
- ⚠️ **SWR**: Client-side 需要時使用
- ❌ **API Routes (CRUD)**: 盡量避免，改用 Server Actions

### 元件設計

- ✅ **Server Components by default**: 預設
- ✅ **Client Components 放葉端**: 最小化
- ✅ **功能模組化**: 透過 index.ts 控制暴露

### 測試策略

- 提供測試指引文檔，不自動生成測試腳本
- 由用戶自行執行測試

---

## 已知問題與解決方案

| 問題 | 解決方案 |
|:-----|:---------|
| `Module not found: '@/utils'` | 改為 `@/lib/utils` |
| `Cannot find module '@/layout'` | 改為 `@/components/layout` |
| `Cannot find module '@/context'` | 改為 `@/lib/providers` |
| Tailwind 樣式失效 | 檢查 `tsconfig.json` 的 `include` 是否涵蓋 `src/` |
| Prisma 找不到 schema | 確認 `prisma/` 在根目錄 |
| Migration 失敗 | 使用 `POSTGRES_URL_NON_POOLING` 直連 URL |

---

## 專案里程碑

### 已完成

- [x] Feature-First 架構重構
- [x] Sidebar 狀態持久化
- [x] Loading 系統（LoadingOverlay, Skeleton）
- [x] OTP 驗證流程

### 進行中

- [ ] 學校服務模組完善
- [ ] 用戶資料管理

### 待優化

- [ ] 移除測試用 console.log
- [ ] 加入 Error Boundary
- [ ] Prefetch 關鍵路由
