# TASK-004 會話交接文檔

## 當前狀態：✅ Build 成功，待手動測試

---

## 已完成項目

### 1. 共用表單組件（6 個）

```
src/components/shared/forms/
├── PasswordField.tsx       # 密碼欄位 + 顯示/隱藏切換
├── FormError.tsx           # 錯誤訊息顯示（支援 className）
├── SubmitButton.tsx        # 提交按鈕 + loading 狀態
├── LoginMethodToggle.tsx   # 泛用切換組件
├── OtpInput.tsx            # OTP 6 位數字輸入（ref 暴露 focus/clear）
├── ResendCountdown.tsx     # 包含 useCountdown hook
└── index.ts                # 公開 API
```

### 2. 重構的組件

| 組件 | 使用的共用組件 |
|:-----|:---------------|
| SignInForm | PasswordField, FormError, SubmitButton, LoginMethodToggle |
| SignUpFormStep | PasswordField ×2, SubmitButton |
| SignUpOtpStep | SubmitButton |
| ResetPasswordOtpStep | OtpInput, SubmitButton, useCountdown |
| OtpForm | OtpInput, FormError, SubmitButton, useCountdown |
| UserInfoEditModal | OtpInput, FormError, useCountdown |
| ResetPasswordForm | FormError |
| NewCourseForm | FormError |

### 3. 關鍵修復

**DATABASE_URL client-side import 問題**：
- **原因**：`@/features/user/index.ts` 同時導出 actions 和 server-only 的 queries
- **修復**：建立 `@/features/user/server.ts` 專門導出 server-only 的 queries

```typescript
// src/features/user/server.ts
import "server-only";
export { getProfile, getAddress, getBankAccount, getChildren, getTutorDocuments } from "./queries";

// src/features/user/index.ts 已移除 queries 導出
```

---

## Next Steps

1. **手動測試** — `pnpm dev` 測試以下功能：
   - 登入（手機/電郵）
   - 註冊（OTP 驗證）
   - 重設密碼（OTP 驗證）
   - 個人資料編輯（電話/電郵 OTP 驗證）

2. **歸檔任務** — 測試通過後移動到 `_ARCHIVE/2026-02/`

---

## 現有警告（非關鍵）

以下是 build 時的 lint 警告，可選擇性修復：

- `ResetPasswordOtpStep.tsx` — `phone`, `error` 未使用
- `NewCourseForm.tsx` — `useTransition` 未使用
- `UserInfoEditModal.tsx` — `phoneVerified` 未使用
- `UserTutorCard.tsx` — `startTransition` 未使用
- 多處 `error` 變量未使用

---

## 重要文件參考

- **進度文檔**：`docs/02-Tasks/_ACTIVE/TASK-004-component-architecture-refactor/03-Implementation-Progress.md`
- **會話記錄**：`docs/02-Tasks/_ACTIVE/TASK-004-component-architecture-refactor/90-Chat-Log/`
- **共用組件**：`src/components/shared/forms/`

---

## Build 狀態

```bash
# 清理後重新 build 成功
rm -rf .next && pnpm build  # ✅ Exit code: 0
```
