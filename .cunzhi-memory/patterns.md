# 常用模式和最佳實踐

- ## Modal 表單資料同步模式

當 Modal 需要在開啟時載入最新資料：

1. **使用受控組件** — Input 使用 `value` 而非 `defaultValue`
2. **useEffect 重置** — 在 `isOpen` 變為 true 時重置所有表單 state
3. **父組件維護最新資料** — 父組件的 state 在 API 成功後更新，再傳給 Modal 的 `initialData`

```tsx
// Modal 內部
useEffect(() => {
  if (isOpen) {
    setFieldValue(initialData.field || "");
    // ... 重置其他欄位
  }
}, [isOpen, initialData]);

// Input 使用 value（受控）
<Input value={fieldValue} onChange={(e) => setFieldValue(e.target.value)} />
```

**注意：** TailAdmin 的 `Input` 組件需要擴展 `value` prop 才能作為受控組件使用。
