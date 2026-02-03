# Sidebar 子選單未自動展開問題修復

**日期**：2026-02-03  
**狀態**：✅ 已修復

## 問題描述

訪問 `/dashboard/school` 時，左側 Sidebar 的「學校服務」子選單應該自動展開，但實際上沒有展開。

## 根因分析

**檔案**：`src/components/layout/private/AppSidebar.tsx`

```tsx
// 修復前 (Line 62-81)
useEffect(() => {
  // ... 邏輯依賴 navItems, supportItems, othersItems
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [pathname]); // ❌ 缺少必要依賴
```

**問題**：

1. `useEffect` 依賴陣列只有 `pathname`
2. 邏輯實際依賴 `navItems`、`supportItems`、`othersItems`
3. 這些陣列由 `usePermission()` 權限過濾產生，**可能是異步載入**
4. 當 Effect 首次執行時，`navItems` 可能為空陣列
5. 之後 `navItems` 更新（權限載入完成），但 Effect 不會重新執行

## 解決方案

結合以下兩個技術解決：

### 1. 加入 `isLoading` 依賴

當權限還在載入時跳過邏輯，載入完成後再執行：

```tsx
const { can, isLoading } = usePermission();

useEffect(() => {
  // 權限還在載入中，先不處理
  if (isLoading) return;
  // ... 展開邏輯
}, [pathname, isLoading, navItems, supportItems, othersItems]);
```

### 2. 使用 Functional Update 避免無限迴圈

由於 `navItems` 等陣列在每次 render 都會產生新引用，需要比較新舊狀態避免重複更新：

```tsx
setOpenSubmenu((prev) => {
  if (matchedSubmenu === null && prev === null) return prev;
  if (
    matchedSubmenu &&
    prev &&
    matchedSubmenu.type === prev.type &&
    matchedSubmenu.index === prev.index
  ) {
    return prev; // 狀態相同，不更新
  }
  return matchedSubmenu;
});
```

## 修改檔案

| 檔案                                               | 變更                                             |
| :------------------------------------------------- | :----------------------------------------------- |
| `src/components/layout/private/AppSidebar.tsx`     | 加入 isLoading 檢查 + functional update 避免迴圈 |
| `src/components/layout/private/DashboardShell.tsx` | 整合 LoadingOverlay 顯示權限載入狀態             |

## 驗證方式

1. 登入具有 `STAFF_DASHBOARD` 權限的帳號
2. **頁面重新載入** `/dashboard/school` — 選單應自動展開
3. **頁面間導航** — 選單應正確切換
4. **手動點擊** — 展開/收合應正常運作
5. **Console** — 無 `Maximum update depth exceeded` 錯誤

## 相關知識

- `usePermission()` 的 `isLoading` 表示 NextAuth session 是否還在載入
- `useMemo` 的結果在依賴改變時會產生新引用，即使值相同
- Functional update (`setState(prev => ...)`) 返回 `prev` 時不會觸發 re-render
- 依賴陣列包含物件/陣列時要特別注意引用穩定性
