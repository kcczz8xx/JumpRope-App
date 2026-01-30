# Jumprope App

## 項目概述

本項目是基於 Next.js App Router 的全端應用，前端頁面與後端 API 路由統一在同一代碼庫中管理，並通過 Prisma 與數據庫交互。

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

- `DATABASE_URL`
- `NEXT_PUBLIC_APP_URL`

### 啓動開發環境

```bash
pnpm dev
```

訪問 `http://localhost:3000` 查看頁面。

## 常用命令（全部使用 pnpm）

- `pnpm dev` — 啓動本地開發服務器
- `pnpm build` — 生成生產構建
- `pnpm start` — 運行生產服務器
- `pnpm lint` — ESLint 檢查
- `pnpm test` — Jest 單次測試
- `pnpm test:watch` — Jest 監看模式
- `pnpm test:coverage` — 生成測試覆蓋率報告

## 目錄結構與路由/API

- `app/`：App Router 路由目錄，包含路由分組如 `(public)`、`(private)`

  - `app/api/`：API Route Handlers
  - `components/`：可復用 UI 組件（測試在 `components/__tests__/`）
  - `layout/`：通用佈局包裝
  - `context/`、`hooks/`、`lib/`、`utils/`：共享狀態、Hook、邏輯與工具
  - `prisma/`：數據庫 Schema 與遷移（schema 在 `prisma/schema/`）
  - `public/`、`icons/`：靜態資源
  - `docs/`、`scripts/`：項目文檔與腳本

  ## 技術棧與依賴

  - Next.js（App Router）
  - TypeScript（嚴格模式）
  - Tailwind CSS
  - Prisma
  - Jest + Testing Library
  - ESLint（`eslint-config-next`）
