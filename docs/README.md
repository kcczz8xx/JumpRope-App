# 跳繩學院專案文件

## 📚 專案架構

本專案使用 **Neon Serverless Driver** 作為資料庫連接方式，專為 Vercel 部署優化。

---

## 🎯 技術棧

| 技術                       | 用途                     |
| -------------------------- | ------------------------ |
| **Next.js 15+**            | React 框架（App Router） |
| **Neon Serverless Driver** | PostgreSQL 資料庫連接    |
| **TypeScript**             | 類型安全                 |
| **Tailwind CSS**           | 樣式框架                 |
| **Server Actions**         | 後端邏輯                 |

---

## 📁 專案結構

```
jumprope-app/
├── app/                          # Next.js App Router
│   ├── (private)/                # 需要認證的頁面
│   │   ├── dashboard/
│   │   ├── students/             # 學生管理
│   │   ├── schools/              # 學校管理
│   │   ├── partnerships/         # 合作關係管理
│   │   ├── courses/              # 課程管理
│   │   └── classes/              # 課堂管理
│   └── (public)/                 # 公開頁面
│       └── page.tsx
├── lib/                          # 工具函數
│   ├── neon.ts                   # Neon 資料庫連接
│   └── actions/                  # Server Actions
│       ├── students/
│       ├── schools/
│       ├── partnerships/
│       ├── courses/
│       └── classes/
├── components/                   # React 組件
│   ├── students/
│   ├── schools/
│   ├── partnerships/
│   ├── courses/
│   └── classes/
├── context/                      # React Context
├── hooks/                        # Custom Hooks
├── docs/                         # 專案文件
│   ├── README.md                 # 本文件
│   └── NEON_SERVERLESS_DRIVER_GUIDE.md
├── .env.example                  # 環境變數範本
└── package.json
```

---

## 🚀 快速開始

### 1. 安裝依賴

```bash
pnpm install
```

### 2. 安裝 Neon Serverless Driver

```bash
pnpm add @neondatabase/serverless
```

### 3. 設定環境變數

```bash
# 連接 Vercel 專案
vercel link

# 拉取環境變數
vercel env pull .env.development.local
```

這會自動建立包含 Neon 資料庫連線的 `.env.development.local` 檔案。

### 4. 建立資料庫表

在 [Neon SQL Editor](https://console.neon.tech) 執行 SQL 建立資料表。

參考：`docs/NEON_SERVERLESS_DRIVER_GUIDE.md` 的 Step 3。

### 5. 啟動開發伺服器

```bash
pnpm dev
```

訪問 `http://localhost:3000`

---

## 📖 核心概念

### Neon Serverless Driver

使用 Neon 官方的 `@neondatabase/serverless` driver：

```typescript
// lib/neon.ts
import { neon } from "@neondatabase/serverless";

export const sql = neon(process.env.DATABASE_URL!);
```

### Server Actions

所有資料庫操作都透過 Server Actions：

```typescript
// lib/actions/students/student.actions.ts
"use server";

import { sql } from "@/lib/neon";

export async function getStudents() {
  const students = await sql`
    SELECT * FROM students 
    ORDER BY created_at DESC
  `;

  return { success: true, data: students };
}
```

### 頁面組件

使用 Client Component 調用 Server Actions：

```typescript
// app/(private)/students/page.tsx
"use client";

import { getStudents } from "@/lib/actions/students/student.actions";

export default function StudentsPage() {
  // ... 使用 Server Actions
}
```

---

## 🗄️ 資料庫架構

### 核心資料表

| 表名           | 說明         |
| -------------- | ------------ |
| `schools`      | 學校基本資料 |
| `students`     | 學生資料     |
| `tutors`       | 導師資料     |
| `partnerships` | 合作關係     |
| `courses`      | 課程         |
| `classes`      | 課堂         |
| `attendances`  | 出席記錄     |

### 關聯關係

```
schools (學校)
  ├─→ partnerships (合作關係)
  └─→ courses (課程)
        └─→ classes (課堂)
              └─→ attendances (出席記錄)
                    ├─→ students (學生)
                    └─→ tutors (導師)
```

---

## 🔧 開發指南

### 新增功能模組

1. **建立資料表**（Neon SQL Editor）
2. **定義類型**（`lib/neon.ts`）
3. **建立 Server Actions**（`lib/actions/[module]/`）
4. **建立 UI 組件**（`components/[module]/`）
5. **建立頁面**（`app/(private)/[module]/`）

### 命名規範

| 類型       | 規範             | 範例                  |
| ---------- | ---------------- | --------------------- |
| **檔案**   | kebab-case       | `student-form.tsx`    |
| **組件**   | PascalCase       | `StudentForm`         |
| **函數**   | camelCase        | `getStudents`         |
| **常數**   | UPPER_SNAKE_CASE | `MAX_STUDENTS`        |
| **資料表** | snake_case       | `student_enrollments` |

---

## 🚢 部署到 Vercel

### 1. 推送代碼到 GitHub

```bash
git add .
git commit -m "Initial commit"
git push
```

### 2. 在 Vercel 建立專案

1. 前往 [Vercel Dashboard](https://vercel.com/dashboard)
2. Import GitHub repository
3. Vercel 會自動偵測 Next.js 專案並部署

### 3. 連接 Neon

1. 在 Vercel 專案中，前往 Storage 標籤
2. 連接 Neon 資料庫
3. Vercel 會自動設定環境變數

### 4. 執行資料庫遷移

在 Neon SQL Editor 執行建表 SQL。

---

## 📚 文件索引

| 文件                                   | 說明                            |
| -------------------------------------- | ------------------------------- |
| `docs/README.md`                       | 專案概述（本文件）              |
| `docs/NEON_SERVERLESS_DRIVER_GUIDE.md` | Neon Serverless Driver 完整指南 |
| `.env.example`                         | 環境變數範本                    |

---

## 🔒 環境變數

### 必需變數

| 變數名                | 說明            | 取得方式                          |
| --------------------- | --------------- | --------------------------------- |
| `DATABASE_URL`        | Neon 資料庫連線 | `vercel env pull` 或 Neon Console |
| `NEXT_PUBLIC_APP_URL` | 應用程式 URL    | 手動設定                          |

### 本地開發

```env
# .env.development.local
DATABASE_URL="postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 生產環境

在 Vercel Dashboard 設定：

```env
DATABASE_URL="postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require"
NEXT_PUBLIC_APP_URL="https://your-app.vercel.app"
```

---

## 🐛 常見問題

### Q: 如何連接本地資料庫？

**A:** 使用 `vercel env pull .env.development.local` 拉取 Neon 資料庫連線，無需本地資料庫。

### Q: 如何查看資料庫資料？

**A:** 使用 [Neon SQL Editor](https://console.neon.tech) 或 Neon Console 查看。

### Q: 如何執行資料庫遷移？

**A:** 直接在 Neon SQL Editor 執行 SQL 語句。

### Q: TypeScript 類型如何定義？

**A:** 在 `lib/neon.ts` 中手動定義類型。

---

## 📞 資源連結

- [Next.js 文件](https://nextjs.org/docs)
- [Neon 文件](https://neon.tech/docs)
- [Neon Serverless Driver](https://neon.tech/docs/serverless/serverless-driver)
- [Vercel 文件](https://vercel.com/docs)
- [TypeScript 文件](https://www.typescriptlang.org/docs/)

---

## 🎉 開始開發

現在你可以開始開發了！參考 `docs/NEON_SERVERLESS_DRIVER_GUIDE.md` 獲取詳細的開發指南。

**建議開發順序：**

1. 學生管理（Students）- 基礎 CRUD
2. 學校管理（Schools）- 基礎資料
3. 合作關係（Partnerships）- 可選關聯
4. 課程管理（Courses）- 複雜欄位
5. 課堂管理（Classes）- 時間排程
6. 出席記錄（Attendances）- 多對多關聯

---

**版本：** 1.0.0  
**最後更新：** 2026-01-30  
**維護者：** Jump Rope Academy Team
