# 認證閃爍問題修復

## 問題描述

未登入時訪問 `/dashboard/*` 路由，會先短暫顯示 dashboard UI（sidebar、header 等），然後才跳轉到登入頁。

## 根本原因

原本的 `dashboard/layout.tsx` 是 **Client Component**，使用 `useSession()` 在 client-side 檢查認證狀態：

```tsx
// ❌ 問題代碼
"use client";

export default function DashboardLayout({ children }) {
  const { isLoading } = usePermission(); // Client-side 檢查

  return (
    <div>
      <LoadingOverlay isLoading={isLoading} />
      <AppSidebar /> {/* 這些 UI 會先渲染！ */}
      <AppHeader />
      {children}
    </div>
  );
}
```

**執行順序**：

1. Server 渲染 HTML 結構（含 sidebar、header）
2. 瀏覽器下載並執行 JS
3. `useSession()` 發現未登入
4. 跳轉到登入頁

→ 步驟 1~3 期間用戶看到 dashboard UI

## 解決方案

將認證檢查移到 **Server Component** 層：

```tsx
// ✅ 修復後
// dashboard/layout.tsx (Server Component)
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardShell from "./_components/DashboardShell";

export default async function DashboardLayout({ children }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/signin"); // Server-side redirect，不送任何 HTML
  }

  return <DashboardShell>{children}</DashboardShell>;
}
```

```tsx
// dashboard/_components/DashboardShell.tsx (Client Component)
"use client";

export default function DashboardShell({ children }) {
  // 只處理 UI 邏輯，不做認證
  return (
    <div>
      <AppSidebar />
      <AppHeader />
      {children}
    </div>
  );
}
```

**執行順序**：

1. Server 執行 `auth()` 檢查
2. 未登入 → `redirect("/signin")`，**不渲染任何 HTML**
3. 瀏覽器直接收到 302 重定向

→ 用戶完全看不到 dashboard UI

## 修改的檔案

| 檔案                                               | 變更                              |
| :------------------------------------------------- | :-------------------------------- |
| `src/lib/auth/options.ts`                          | 加入 `authorized` callback        |
| `middleware.ts`                                    | 簡化邏輯，移除重複的認證檢查      |
| `src/app/(private)/dashboard/layout.tsx`           | 改為 Server Component             |
| `src/components/layout/private/DashboardShell.tsx` | 新增 Client Component（全域組件） |

## 核心原則

> **認證檢查必須在 Server Component 層執行，才能保證在 HTML 渲染前攔截。**

這是 Next.js App Router 的設計模式：

- **Server Component**：處理認證、資料獲取
- **Client Component**：處理互動、UI 狀態

## 相關文件

- [Next.js Authentication](https://nextjs.org/docs/app/building-your-application/authentication)
- [NextAuth.js v5 Middleware](https://authjs.dev/getting-started/session-management/protecting)
