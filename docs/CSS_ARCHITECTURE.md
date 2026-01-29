# CSS 架構文檔

## 概述

本項目使用 **多 CSS 文件架構**，通過 Next.js 路由組（Route Groups）實現不同路由使用獨立的樣式系統。

## 架構設計

### 路由組結構

```
app/
├── (public)/              # 公開頁面路由組
│   ├── layout.tsx        # 公開頁面佈局
│   ├── globals.css       # 公開頁面專用樣式
│   └── page.tsx          # 首頁
│
├── dashboard/            # Dashboard 路由組
│   ├── layout.tsx        # Dashboard 佈局
│   ├── globals.css       # Dashboard 專用樣式（TailAdmin Pro）
│   └── ...               # Dashboard 頁面
│
└── ...
```

## CSS 文件詳解

### 1. (public)/globals.css

**用途**: 公開頁面（登錄、註冊、落地頁等）

**特點**:

- 基於 shadcn/ui 設計系統
- 使用 Geist 字體系列
- 輕量級配置，快速加載
- 支持亮色/暗色模式

**核心配置**:

```css
@import "tailwindcss";

@custom-variant dark (&:is(.dark *));

@theme inline {
  /* shadcn/ui 色彩系統 */
  --color-primary: ...
  --color-background: ...
}

:root {
  /* CSS 變量定義 */
}

@layer base {
  /* 基礎樣式 */
}
```

**引入方式**:

```tsx
// app/(public)/layout.tsx
import "./globals.css";
```

### 2. dashboard/globals.css

**用途**: Dashboard 管理界面

**特點**:

- 基於 TailAdmin Pro 設計系統
- 使用 Outfit 字體
- 完整的企業級主題配置
- 包含所有第三方組件樣式

**核心配置**:

```css
@import "tailwindcss";

@custom-variant dark (&:is(.dark *));

@theme {
  /* TailAdmin Pro 完整主題系統 */
  --font-outfit: Outfit, sans-serif;

  /* 自定義斷點 */
  --breakpoint-2xsm: 375px;
  --breakpoint-xsm: 425px;
  --breakpoint-3xl: 2000px;

  /* 品牌色系統 */
  --color-brand-500: #465fff;
  --color-gray-900: #101828;
  /* ... 更多顏色 */
}

/* 自定義工具類 */
@utility menu-item {
  ...;
}
@utility custom-scrollbar {
  ...;
}

/* 第三方組件樣式 */
.apexcharts-tooltip {
  ...;
}
.fc-calendar {
  ...;
}
.flatpickr-calendar {
  ...;
}
```

**引入方式**:

```tsx
// app/dashboard/layout.tsx
import "./globals.css";
import "swiper/swiper-bundle.css";
import "simplebar-react/dist/simplebar.min.css";
```

## 兩套系統對比

| 特性             | (public)/globals.css    | dashboard/globals.css                                             |
| ---------------- | ----------------------- | ----------------------------------------------------------------- |
| **設計系統**     | shadcn/ui               | TailAdmin Pro                                                     |
| **字體**         | Geist Sans + Geist Mono | Outfit                                                            |
| **文件大小**     | ~125 行                 | ~916 行                                                           |
| **顏色變量**     | 基礎（~20 個）          | 完整（~100+ 個）                                                  |
| **自定義工具類** | 無                      | 豐富（menu-item, scrollbar 等）                                   |
| **第三方樣式**   | 無                      | ApexCharts, FullCalendar, Flatpickr, Swiper, JVectorMap, Prism.js |
| **斷點**         | Tailwind 默認           | 自定義（2xsm, xsm, 3xl）                                          |
| **適用場景**     | 營銷頁面、登錄頁        | 管理後台、數據儀表板                                              |

## TailwindCSS 4 新特性

本項目使用 TailwindCSS 4 的最新語法：

### 1. 單行引入

```css
@import "tailwindcss";
```

替代舊版的：

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 2. @theme 配置

```css
@theme {
  --color-brand-500: #465fff;
}
```

直接在 CSS 中定義主題變量

### 3. @custom-variant

```css
@custom-variant dark (&:is(.dark *));
```

自定義變體選擇器

### 4. @utility

```css
@utility menu-item {
  @apply flex items-center gap-3;
}
```

創建可重用的工具類

## 添加新樣式的最佳實踐

### 在 (public) 中添加樣式

```css
/* app/(public)/globals.css */

/* 1. 在 @theme inline 中添加變量 */
@theme inline {
  --color-custom: #ff0000;
}

/* 2. 在 @layer base 中添加基礎樣式 */
@layer base {
  .custom-class {
    @apply bg-custom;
  }
}
```

### 在 dashboard 中添加樣式

```css
/* app/dashboard/globals.css */

/* 1. 在 @theme 中添加變量 */
@theme {
  --color-custom: #ff0000;
}

/* 2. 使用 @utility 創建工具類 */
@utility custom-button {
  @apply px-4 py-2 rounded-lg bg-brand-500;
}

/* 3. 在 @layer utilities 中添加工具類 */
@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}
```

## 引入第三方 CSS

### Dashboard 中引入新組件樣式

```tsx
// app/dashboard/layout.tsx
import "./globals.css";
import "swiper/swiper-bundle.css";
import "simplebar-react/dist/simplebar.min.css";
import "flatpickr/dist/flatpickr.css"; // ✅ 已引入
import "新組件/style.css"; // 添加新組件
```

或在 CSS 中引入：

```css
/* app/dashboard/globals.css */
@import "tailwindcss";
@import "flatpickr/dist/flatpickr.css";
@import "新組件/style.css";
```

## 性能優化

### 代碼分割優勢

✅ **按需加載**: 公開頁面不加載 Dashboard 的大量樣式  
✅ **減少首屏加載**: (public) 樣式僅 ~125 行  
✅ **緩存優化**: 兩套樣式獨立緩存

### 構建優化

```json
// package.json
{
  "scripts": {
    "build": "next build",
    "analyze": "ANALYZE=true next build"
  }
}
```

## 維護指南

### 更新 (public) 樣式

1. 僅修改 `app/(public)/globals.css`
2. 不影響 Dashboard 樣式
3. 適合快速迭代營銷頁面

### 更新 Dashboard 樣式

1. 修改 `app/dashboard/globals.css`
2. 可以安全添加第三方組件樣式
3. 不影響公開頁面性能

### 添加新路由組

```bash
# 創建新路由組
mkdir -p app/(admin)

# 複製樣式模板
cp app/dashboard/globals.css app/(admin)/globals.css
cp app/dashboard/layout.tsx app/(admin)/layout.tsx

# 修改引入路徑
# app/(admin)/layout.tsx
import "./globals.css";
```

## 故障排除

### 樣式未生效

1. **檢查引入路徑**: 確保 `import "./globals.css"` 在正確的 layout.tsx 中
2. **檢查路由組**: 確認頁面在正確的路由組目錄下
3. **清除緩存**: `rm -rf .next && pnpm dev`

### 樣式衝突

1. **檢查 CSS 優先級**: 使用 `!important` 或提高選擇器權重
2. **使用 @layer**: 將樣式放在正確的層級中
3. **檢查變量名**: 確保兩個 CSS 文件中的變量名不衝突

### 第三方組件樣式問題

1. **確認引入順序**: 第三方 CSS 應在 `globals.css` 之後引入
2. **檢查暗色模式**: 確保第三方組件支持暗色模式
3. **自定義覆蓋**: 在 `globals.css` 底部添加覆蓋樣式

## 相關文件

- `package.json` - 依賴配置
- `tailwind.config.ts` - TailwindCSS 配置（如存在）
- `postcss.config.mjs` - PostCSS 配置
- `TAILADMIN_MIGRATION.md` - TailAdmin Pro 遷移文檔

## 技術棧

- **Next.js**: 15.5.11
- **React**: 19.1.1
- **TailwindCSS**: 4.1.13
- **PostCSS**: 8.x
- **設計系統**: shadcn/ui + TailAdmin Pro

---

**最後更新**: 2026-01-29  
**維護者**: Development Team
