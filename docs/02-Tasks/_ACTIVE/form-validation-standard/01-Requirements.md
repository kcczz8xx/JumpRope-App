# 表單驗證規範化 - 需求文檔

## 背景

目前表單驗證存在以下問題：

1. **手動驗證邏輯散落各處**
   ```typescript
   if (!identifier) {
     setError("請輸入電話號碼");
     return setIsLoading(false);
   }
   ```

2. **前後端驗證邏輯分離** — 需要在 Server Action 重複寫

3. **無型別推導** — `formData` 是 object，非 TypeScript 型別

4. **useState 管理多個欄位繁瑣**
   ```typescript
   const [phone, setPhone] = useState("");
   const [password, setPassword] = useState("");
   ```

## 目標

建立統一的表單驗證規範：

```
┌─────────────────────────────────────────┐
│  Single Source of Truth: Zod Schema    │
└─────────────────────────────────────────┘
              ↓
    ┌─────────┴─────────┐
    ↓                   ↓
【前端驗證】        【後端驗證】
React Hook Form    Server Action
+ zodResolver      + schema.safeParse()
```

## 驗收標準

### 必要條件

- [ ] 安裝 `react-hook-form` 和 `@hookform/resolvers`
- [ ] 建立 `features/auth/schemas/` 目錄
- [ ] 遷移 3 個表單：SignInForm、SignUpForm、ResetPasswordForm
- [ ] 前後端使用同一份 Zod Schema
- [ ] `pnpm type-check` 通過
- [ ] `pnpm lint` 通過

### 品質指標

- [ ] 程式碼量減少 30%+
- [ ] 完整 TypeScript 型別推導
- [ ] 錯誤訊息統一為繁體中文
- [ ] 表單驗證邏輯集中於 schemas/

## 不在範圍內

- 非 auth 功能的表單（user profile、school-service 等）
- UI 樣式調整
- 新功能開發
