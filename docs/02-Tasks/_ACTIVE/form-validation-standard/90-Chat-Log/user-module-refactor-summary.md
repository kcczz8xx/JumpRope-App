# User 模組表單驗證重構總結

**日期**：2026-02-03  
**任務**：按 Form-Validation-Guide.md 規範重構 user 模組的 Modal 表單

---

## 1. 重構概覽

| Modal | 重構前 | 重構後 | 狀態 |
|:------|:-------|:-------|:-----|
| `UserAddressEditModal` | 無驗證 | Zod safeParse | ✅ 完成 |
| `UserBankEditModal` | 無驗證 | Zod safeParse | ✅ 完成 |
| `UserChildEditModal` | 無驗證 | Zod safeParse | ✅ 完成 |
| `UserChangePasswordModal` | RHF + zodResolver | 已符合規範 | ✅ 無需變更 |
| `UserInfoEditModal` | 複雜 OTP 流程 | 待評估 | ⏸️ 暫不處理 |

---

## 2. 重構模式

### safeParse 模式（用於簡單 Modal）

```typescript
import { updateAddressSchema } from "../../schemas";

const handleSave = () => {
  const result = updateAddressSchema.safeParse(formData);

  if (!result.success) {
    const newErrors: Record<string, string> = {};
    result.error.issues.forEach((issue) => {
      const field = issue.path[0] as string;
      newErrors[field] = issue.message;
    });
    setErrors(newErrors);
    return;
  }

  setErrors({});
  onSave(result.data);
};
```

### React Hook Form 模式（用於複雜表單）

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { changePasswordSchema } from "@/lib/validations/user";

const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm<ChangePasswordFormData>({
  resolver: zodResolver(changePasswordSchema),
});
```

---

## 3. 修改的檔案

### UserAddressEditModal.tsx

- 導入 `updateAddressSchema` 和 `FormError`
- 添加 `errors` 狀態
- 使用 `safeParse` 進行驗證
- 在欄位旁顯示錯誤訊息
- 移除手動 disabled 邏輯

### UserBankEditModal.tsx

- 導入 `updateBankSchema` 和 `FormError`
- 添加 `errors` 狀態和 `handleSave` 驗證函數
- 在欄位旁顯示錯誤訊息（bankName, accountNumber, accountHolderName）

### UserChildEditModal.tsx

- 導入 `updateChildSchema` 和 `FormError`
- 添加 `errors` 狀態和驗證邏輯
- 在 school 欄位旁顯示錯誤訊息

---

## 4. 現有 Schemas 使用情況

| Schema 檔案 | 已使用於 |
|:------------|:---------|
| `profile.ts` | - |
| `address.ts` | UserAddressEditModal ✅ |
| `bank.ts` | UserBankEditModal ✅ |
| `children.ts` | UserChildEditModal ✅ |
| `documents.ts` | - |

---

## 5. 未處理項目

### UserInfoEditModal

- 行數：437 行
- 複雜度：高（OTP 驗證流程、多步驟）
- 建議：需要更仔細的重構規劃，可能需要拆分元件

### TutorDocumentEditModal

- 位置：`tutor-documents/TutorDocumentEditModal.tsx`
- 建議：後續處理

---

## 6. 驗證

- ✅ TypeScript 編譯通過（`pnpm type-check`）
- ✅ 遵循 Form-Validation-Guide.md 規範
