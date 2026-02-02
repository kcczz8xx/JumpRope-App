# SearchableSelect 清除功能優化

## 修改日期

2026-01-30

## 修改文件

- `/components/form/select/SearchableSelect.tsx`

## 修改內容

### 1. allowClear 預設值改為 true

**位置**: Line 28

**修改前**:

```tsx
allowClear = false,
```

**修改後**:

```tsx
allowClear = true,
```

**影響**: 所有使用 SearchableSelect 組件的地方，預設都會顯示清除按鈕 (X)

---

### 2. 刪除輸入時自動清空選項

**位置**: Line 69-78

**修改前**:

```tsx
const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setSearchTerm(e.target.value);
  setIsOpen(true);
};
```

**修改後**:

```tsx
const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
  setSearchTerm(value);
  setIsOpen(true);

  if (value === "") {
    setSelectedValue("");
    onChange("");
  }
};
```

**影響**: 當用戶手動刪除輸入框中的所有文字時，會自動清空已選擇的值並觸發 `onChange("")`

---

## 功能說明

### 清空選項的方式

1. **點擊清除按鈕 (X)**

   - 位於輸入框右側
   - 只在有選擇值且未開啟下拉選單時顯示
   - 點擊後清空選項並顯示 placeholder

2. **手動刪除輸入框文字**
   - 當用戶刪除輸入框中的所有文字時
   - 自動清空已選擇的值
   - 顯示 placeholder

### 使用者體驗

- **有選項時**: 顯示選項文字 + 清除按鈕 (X)
- **清空後**: 顯示 placeholder（如「搜尋...」）
- **設計風格**: 採用 tomselect 風格的簡潔設計

---

## 技術細節

### Props 變更

```tsx
interface SearchableSelectProps {
  allowClear?: boolean; // 預設值從 false 改為 true
  // ... 其他 props
}
```

### 狀態管理

- `selectedValue`: 儲存當前選擇的值
- `searchTerm`: 儲存搜尋輸入的文字
- 當 `searchTerm` 變為空字串時，自動清空 `selectedValue`

### 事件處理

- `handleClear`: 點擊清除按鈕時觸發
- `handleInputChange`: 輸入框內容變更時觸發，新增空值檢查邏輯

---

## 向後兼容性

### 不影響現有功能

- 如果之前明確設定 `allowClear={false}`，仍然不會顯示清除按鈕
- 所有其他功能（搜尋、選擇、新增選項等）保持不變

### 建議檢查項目

- 檢查所有使用 SearchableSelect 的地方
- 確認清除功能符合業務邏輯需求
- 測試清空後的表單驗證行為

---

## 相關組件

使用 SearchableSelect 的組件可能包括：

- 課程表單 (CoursesFormStep.tsx)
- 學校表單 (SchoolFormStep.tsx)
- 其他需要可搜尋下拉選單的表單

建議測試這些組件的清除功能是否正常運作。
