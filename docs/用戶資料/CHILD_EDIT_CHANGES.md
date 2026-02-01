# 學員資料編輯功能變更

## 變更日期
2026-02-02

## 變更摘要

將學員資料編輯功能從「新增/編輯」模式改為「僅編輯」模式，並限制可編輯欄位。

## 變更內容

### UserChildEditModal.tsx

| 項目 | 變更前 | 變更後 |
|------|--------|--------|
| 模式 | 支援 `create` 和 `edit` 兩種模式 | 僅支援編輯模式 |
| 中文名 | 可編輯 | **只讀**（顯示灰色背景） |
| 英文名 | 可編輯 | **只讀** |
| 性別 | 可選擇下拉選單 | **只讀** |
| 出生年份 | 可選擇下拉選單 | **只讀** |
| 就讀學校 | 可編輯 | **可編輯**（唯一可修改欄位） |
| 刪除按鈕 | 有 | **移除** |

### UserChildrenCard.tsx

| 項目 | 變更前 | 變更後 |
|------|--------|--------|
| 新增學員按鈕 | 有 | **移除** |
| 空狀態 | 顯示新增按鈕 | 僅顯示「暫無學員資料」 |
| 點擊學員卡片 | 打開編輯 Modal | 打開編輯 Modal（僅可改學校） |

## 技術變更

### 移除的 Props

```typescript
// UserChildEditModal - 移除
interface UserChildEditModalProps {
  mode: "create" | "edit";  // 移除
  onDelete?: (id: string) => void;  // 移除
}
```

### 移除的 Hooks

```typescript
// UserChildrenCard - 不再使用
import { useCreateChild, useDeleteChild } from "@/hooks/useUserProfile";
```

### 資料同步修復

原本 Modal 使用 `useState` 初始化時資料不會更新，現在使用 `useEffect` 同步：

```typescript
useEffect(() => {
  if (isOpen && initialData) {
    setSchool(initialData.school || "");
  }
}, [isOpen, initialData]);
```

## UI 變更

- 只讀欄位顯示灰色背景 (`bg-gray-100 dark:bg-gray-800`)
- 只讀欄位有 `cursor-not-allowed` 樣式
- 空值顯示 "—" 而非空白
- 移除刪除按鈕，底部按鈕改為靠右對齊

## 後續待辦

- [ ] 出生日期改用 Date Picker 組件（年月日選擇）
