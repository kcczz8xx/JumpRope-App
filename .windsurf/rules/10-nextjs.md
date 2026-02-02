<activation_mode>model_decision</activation_mode>
<description>當處理 Next.js App Router、路由、頁面、layouts、Server/Client Components 時啟用</description>

<nextjs_rules>

# Next.js 15 App Router 規則

</nextjs_rules>

<server_vs_client>

## Server Components vs Client Components

### 預設使用 Server Components

```tsx
// ✅ Server Component（預設，無需標記）
async function UserProfile({ userId }: { userId: string }) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  return <div>{user?.name}</div>;
}
```

### 只在必要時使用 Client Components

需要 `"use client"` 的情況：

- 使用 React hooks（useState, useEffect 等）
- 事件處理（onClick, onChange 等）
- 瀏覽器 API（localStorage, window 等）
- 第三方 Client-only 套件

```tsx
// ✅ Client Component（明確需要互動）
"use client";

import { useState } from "react";

function LikeButton() {
  const [liked, setLiked] = useState(false);
  return <button onClick={() => setLiked(!liked)}>Like</button>;
}
```

### 組件樹優化

- Client Components 放在組件樹**葉端**
- 將互動邏輯抽離到小型 Client Components
- 保持 Layout 為 Server Component

</server_vs_client>

<data_fetching>

## 資料獲取

### Server Components 直接 await

```tsx
// ✅ 在 Server Component 直接 fetch
async function ProductList() {
  const products = await prisma.product.findMany();
  return (
    <ul>
      {products.map((p) => (
        <li key={p.id}>{p.name}</li>
      ))}
    </ul>
  );
}
```

### Client-side 使用 SWR

```tsx
"use client";
import useSWR from "swr";

function UserDashboard() {
  const { data, error, isLoading } = useSWR("/api/user/stats");
  // ...
}
```

### 優先使用 Server Actions

- 表單提交 → Server Actions
- 資料變更 → Server Actions
- 不需要 API Route 的 CRUD 操作 → Server Actions

</data_fetching>

<routing>

## 路由結構

```
src/app/
├── (public)/           # 公開路由群組（無需登入）
│   ├── login/
│   └── register/
├── (private)/          # 需驗證路由群組
│   └── dashboard/
│       ├── _components/  # 路由專屬元件（_ 前綴）
│       ├── page.tsx
│       ├── layout.tsx
│       ├── loading.tsx
│       └── error.tsx
└── api/                # API Routes（盡量少用）
```

### 路由專屬元件

- 使用 `_components/` 目錄
- `_` 前綴讓 Next.js 忽略此資料夾作為路由

</routing>

<error_handling>

## 錯誤處理

### error.tsx（錯誤邊界）

```tsx
"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div>
      <h2>發生錯誤</h2>
      <button onClick={() => reset()}>重試</button>
    </div>
  );
}
```

### loading.tsx（載入狀態）

```tsx
export default function Loading() {
  return <LoadingOverlay />;
}
```

### not-found.tsx（404）

```tsx
export default function NotFound() {
  return <div>頁面不存在</div>;
}
```

</error_handling>

<performance>

## 性能優化

- **動態導入**: 大型元件用 `next/dynamic`
- **圖片優化**: 使用 `next/image`
- **字體優化**: 使用 `next/font`
- **Metadata**: 使用 `generateMetadata()` 處理 SEO

```tsx
import dynamic from "next/dynamic";

const HeavyChart = dynamic(() => import("./HeavyChart"), {
  loading: () => <Skeleton />,
});
```

</performance>
