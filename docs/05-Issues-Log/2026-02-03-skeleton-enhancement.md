# Loading 系統優化

**日期**：2026-02-03  
**狀態**：✅ 已完成

## LoadingOverlay 延遲顯示

避免快速載入時的閃爍問題，只有當載入超過 `delay` 時間（預設 200ms）才顯示：

```tsx
<LoadingOverlay
  isLoading={isLoading}
  delay={200} // 預設 200ms，可自訂
/>
```

**邏輯**：

1. 當 `isLoading` 變為 `true` 時，啟動計時器
2. 超過 `delay` 時間後才顯示 overlay
3. 如果在 `delay` 時間內 `isLoading` 變為 `false`，不顯示 overlay
4. 顯示時帶有 fade-in 動畫

## Skeleton 優化內容

### 1. Shimmer 動畫效果

原本只有 `pulse` 動畫，現在新增更流暢的 `shimmer` 波光效果：

```tsx
type AnimationType = "pulse" | "shimmer" | "none";

// Shimmer 使用 CSS gradient 移動效果
animation === "shimmer" &&
  "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-linear-to-r before:from-transparent before:via-white/60 before:to-transparent";
```

### 2. 無障礙屬性

所有 Skeleton 組件加入 ARIA 屬性：

```tsx
<div
  role="status"
  aria-busy="true"
  aria-label="載入中"
  // ...
/>
```

### 3. 新增變體組件

| 組件                | 用途         |
| :------------------ | :----------- |
| `SkeletonHeading`   | 標題骨架     |
| `SkeletonButton`    | 按鈕骨架     |
| `SkeletonInput`     | 輸入框骨架   |
| `SkeletonBadge`     | 標籤骨架     |
| `SkeletonListItem`  | 列表項目骨架 |
| `SkeletonForm`      | 表單骨架     |
| `SkeletonStatsCard` | 統計卡片骨架 |
| `SkeletonContainer` | 條件渲染容器 |

### 4. SkeletonContainer 用法

```tsx
<SkeletonContainer isLoading={isLoading} skeleton={<SkeletonCard />}>
  <ActualContent />
</SkeletonContainer>
```

## 修改檔案

| 檔案                                             | 變更                                    |
| :----------------------------------------------- | :-------------------------------------- |
| `src/components/ui/Skeleton.tsx`                 | 新增 shimmer 動畫、更多變體、無障礙屬性 |
| `src/app/(private)/globals.css`                  | 新增 shimmer keyframe 動畫              |
| `src/app/(private)/dashboard/loading.tsx`        | 使用 `SkeletonStatsCard`                |
| `src/app/(private)/dashboard/school/loading.tsx` | 使用新的 Skeleton 變體                  |

## 使用範例

```tsx
// 基本用法（預設 shimmer 動畫）
<Skeleton className="h-10 w-full" />

// 使用 pulse 動畫
<Skeleton animation="pulse" className="h-10 w-full" />

// 統計卡片
<SkeletonStatsCard />

// 表單
<SkeletonForm fields={4} />

// 條件渲染
<SkeletonContainer
  isLoading={isLoading}
  skeleton={<SkeletonTable rows={5} />}
>
  <DataTable data={data} />
</SkeletonContainer>
```

## 頁面級別 Skeleton 組件

新增用於構建路由 `loading.tsx` 的組件：

| 組件                 | 用途                         |
| :------------------- | :--------------------------- |
| `SkeletonPageHeader` | 頁面標題 + 麵包屑 + 操作按鈕 |
| `SkeletonDataGrid`   | 資料欄位網格                 |
| `SkeletonSection`    | 帶標題的區塊                 |

### 路由級別 Loading 策略

每個路由使用專屬的 `loading.tsx`，組合 Skeleton 組件模擬真實佈局：

```tsx
// dashboard/loading.tsx
import { SkeletonStatsCard, SkeletonTable } from "@/components/ui/Skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonStatsCard key={i} />
        ))}
      </div>
      <SkeletonTable rows={5} columns={5} />
    </div>
  );
}
```

**優點**：

- 統一 UX 體驗
- 無需為每個頁面單獨設計 skeleton
- 簡潔的 spinner + 文字提示
