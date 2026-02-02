# Jumprope App

跳繩教學管理平台 - 基於 Next.js 15 App Router 的全端應用

## 快速開始

### 安裝依賴

```bash
pnpm install
```

### 環境變量

```bash
cp .env.example .env
```

在 `.env` 中配置：

- `DATABASE_URL` — 資料庫連線 URL
- `POSTGRES_URL_NON_POOLING` — 直連 URL（用於 migrations）
- `NEXT_PUBLIC_APP_URL`

### 啓動開發環境

```bash
pnpm dev
```

訪問 `http://localhost:3000` 查看頁面。

## 常用命令

| 命令                 | 說明                |
| :------------------- | :------------------ |
| `pnpm dev`           | 啓動本地開發服務器  |
| `pnpm build`         | 生成生產構建        |
| `pnpm start`         | 運行生產服務器      |
| `pnpm lint`          | ESLint 檢查         |
| `pnpm type-check`    | TypeScript 類型檢查 |
| `pnpm test`          | Jest 單次測試       |
| `pnpm test:watch`    | Jest 監看模式       |
| `pnpm test:coverage` | 生成測試覆蓋率報告  |

### Prisma 指令

| 命令                         | 說明                           |
| :--------------------------- | :----------------------------- |
| `pnpm prisma:migrate <name>` | 建立新 migration               |
| `pnpm prisma:deploy`         | 部署 migrations + 產生 Client  |
| `pnpm prisma:push`           | 直接推送 schema（prototyping） |
| `pnpm prisma:studio`         | 開啟 Prisma Studio GUI         |
| `pnpm prisma:seed`           | 執行 seed 腳本                 |
| `pnpm prisma:wipe`           | 重置資料庫（⚠️ 會刪除資料）    |

## 📁 專案結構

```
jumprope-app/
├── prisma/              # 資料庫 Schema
├── public/              # 靜態資源
├── src/                 # 原始碼目錄
│   ├── app/             # Next.js App Router (路由定義)
│   │   ├── (private)/   # 需登入頁面
│   │   ├── (public)/    # 公開頁面
│   │   └── api/         # API Routes
│   ├── components/      # 全域共用元件
│   │   ├── layout/      # Layout 元件
│   │   ├── tailadmin/   # TailAdmin 模板元件
│   │   └── ui/          # 基礎 UI 元件
│   ├── features/        # 功能模組 (Feature-First)
│   │   ├── auth/        # 認證模組
│   │   ├── user/        # 用戶模組
│   │   └── school-service/  # 學校服務模組
│   ├── lib/             # 全域工具與設定
│   │   ├── auth/        # NextAuth 設定
│   │   ├── db/          # Prisma 客戶端
│   │   ├── providers/   # Context Providers
│   │   ├── utils/       # 工具函式
│   │   └── validations/ # 共用驗證
│   ├── hooks/           # 全域共用 Hooks
│   ├── icons/           # SVG 圖標元件
│   └── config/          # 配置檔案
└── ...設定檔
```

## 🧩 架構原則

### Feature-First 開發

每個功能模組 (`src/features/*`) 應包含：

- `components/` — UI 元件
- `index.ts` — 公開 API（控制哪些可被外部 import）

### Import 規則

```typescript
// ✅ 正確：透過功能的公開 API
import { SignInForm } from "@/features/auth";
import { ProfilePageContent } from "@/features/user";

// ❌ 錯誤：直接 import 功能內部檔案
import SignInForm from "@/features/auth/components/SignInForm";
```

### 路徑別名

| 別名             | 指向               |
| :--------------- | :----------------- |
| `@/*`            | `src/*`            |
| `@/features/*`   | `src/features/*`   |
| `@/components/*` | `src/components/*` |
| `@/lib/*`        | `src/lib/*`        |

## 技術棧

- **框架**：Next.js 15（App Router）
- **語言**：TypeScript 5（嚴格模式）
- **樣式**：Tailwind CSS v4
- **資料層**：Prisma ORM
- **認證**：NextAuth.js v5
- **測試**：Jest + Testing Library
- **Lint**：ESLint（`eslint-config-next`）
