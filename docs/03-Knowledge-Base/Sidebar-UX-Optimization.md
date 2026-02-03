# Sidebar UI/UX 優化總結

## 修復與優化項目

### 1. 子選單開關失效修復

**問題**：點擊子選單按鈕後，選單會立即關閉或無法正常展開。

**原因**：`AppSidebar.tsx` 中的 `useEffect` 會在每次 render 時強制將 `openSubmenu` 設為匹配的子選單或 `null`，覆蓋用戶的手動操作。

**修復方案**：使用 `useRef` 追蹤 pathname 變化，只在**首次載入**或**路徑變化**時才自動展開子選單。

```typescript
// 使用 null 作為初始值，區分「首次載入」和「後續渲染」
const prevPathnameRef = React.useRef<string | null>(null);

useEffect(() => {
  const isFirstMount = prevPathnameRef.current === null;
  const isPathnameChanged = prevPathnameRef.current !== pathname;
  prevPathnameRef.current = pathname;

  // 只在首次載入或路徑變化時才自動展開，不干擾用戶手動操作
  if (!isFirstMount && !isPathnameChanged) return;
  // ...
}, [pathname, ...]);
```

**檔案**：`src/components/layout/private/AppSidebar.tsx`

---

### 2. 子選單平滑展開/收起動畫

**問題**：子選單使用 `block/hidden` 硬切換，沒有過渡動畫。

**修復方案**：使用 `scrollHeight` 計算實際高度，配合 CSS `transition-[height]` 實現平滑動畫。

```typescript
const contentRef = useRef<HTMLUListElement>(null);
const [height, setHeight] = useState<number>(0);

useEffect(() => {
  if (contentRef.current) {
    setHeight(isOpen ? contentRef.current.scrollHeight : 0);
  }
}, [isOpen, subItems]);

return (
  <div
    className="overflow-hidden transition-[height] duration-300 ease-in-out"
    style={{ height }}
  >
    <ul ref={contentRef}>...</ul>
  </div>
);
```

**檔案**：`src/components/layout/private/sidebar/NavSubMenu.tsx`

---

### 3. Sidebar 展開狀態持久化

**問題**：刷新頁面後 Sidebar 展開狀態會重置。

**修復方案**：使用 `localStorage` 保存展開狀態。

```typescript
const STORAGE_KEY = "sidebar-expanded";

// 讀取
useEffect(() => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored !== null) {
    setIsExpanded(stored === "true");
  }
  setIsInitialized(true);
}, []);

// 保存
const toggleSidebar = useCallback(() => {
  setIsExpanded((prev) => {
    const next = !prev;
    localStorage.setItem(STORAGE_KEY, String(next));
    return next;
  });
}, []);
```

**檔案**：`src/lib/providers/SidebarContext.tsx`

---

### 4. 初始化閃爍防護

**問題**：localStorage 讀取前可能出現狀態不一致的閃爍。

**修復方案**：添加 `isInitialized` 狀態，在初始化完成前不渲染 Sidebar。

```typescript
// SidebarContext
const [isInitialized, setIsInitialized] = useState(false);

// AppSidebar
if (!isInitialized) {
  return null;
}
```

**檔案**：

- `src/lib/providers/SidebarContext.tsx`
- `src/components/layout/private/AppSidebar.tsx`

---

### 5. Context 清理

**移除未使用的狀態**：

- `activeItem` / `setActiveItem`
- `openSubmenu` / `toggleSubmenu`（AppSidebar 自行管理）

**優化**：使用 `useCallback` 包裝 callback 函式，減少不必要的 re-render。

---

### 6. DashboardShell 統一初始化處理

**問題**：初始化檢查分散在多個組件，難以維護。

**修復方案**：將 `isInitialized` 檢查統一放在 `DashboardShell`，在初始化前顯示 LoadingOverlay。

```typescript
// DashboardShell.tsx
const { isExpanded, isHovered, isMobileOpen, isInitialized } = useSidebar();

// 等待 Sidebar 初始化完成，顯示 Loading
if (!isInitialized) {
  return <LoadingOverlay isLoading={true} />;
}
```

**檔案**：`src/components/layout/private/DashboardShell.tsx`

---

## 修改檔案清單

| 檔案                                                   | 修改內容                       |
| :----------------------------------------------------- | :----------------------------- |
| `src/components/layout/private/AppSidebar.tsx`         | 修復子選單開關邏輯             |
| `src/components/layout/private/sidebar/NavSubMenu.tsx` | 添加平滑高度動畫               |
| `src/lib/providers/SidebarContext.tsx`                 | 持久化、清理冗餘狀態、性能優化 |
| `src/components/layout/private/DashboardShell.tsx`     | 統一處理 isInitialized         |

---

## 架構說明

```
DashboardShell (統一初始化檢查)
├── AppSidebar (根據 Sidebar 狀態調整寬度)
├── AppHeader (自動跟隨 mainContentMargin)
├── Content
└── AppFooter (自動跟隨 mainContentMargin)
```

Header 和 Footer 位於 `mainContentMargin` 控制的容器內，會自動跟隨 Sidebar 展開/收起調整位置。

---

---

### 7. 滾動條彈跳畫面修復

**問題**：頁面載入或切換路由時，滾動條出現/消失導致內容區域寬度變化，造成佈局跳動。

**修復方案**：使用 `simplebar-react` 第三方庫管理滾動條，提供統一的滾動條樣式。

```typescript
// DashboardShell.tsx
import SimpleBar from "simplebar-react";

<SimpleBar
  className="flex-1 overflow-y-auto"
  style={{ maxHeight: "calc(100vh - 72px)" }}
>
  <ErrorBoundary>
    <div className={`grow ${getRouteSpecificStyles()}`}>{children}</div>
  </ErrorBoundary>
  <AppFooter />
</SimpleBar>;
```

**補充**：同時在 `globals.css` 添加 `scrollbar-gutter: stable` 作為 fallback。

**檔案**：

- `src/components/layout/private/DashboardShell.tsx`
- `src/app/(private)/globals.css`

---

## 測試驗證

1. ✅ 子選單可正常點擊開關
2. ✅ 子選單展開/收起有平滑動畫
3. ✅ 刷新頁面後 Sidebar 狀態保持
4. ✅ 無初始化閃爍
5. ✅ Header/Footer 自動跟隨 Sidebar 調整
6. ✅ 無滾動條彈跳
