# 認證表單改造總結

> **最後更新**：2026-02-02

## 概述

已完成四個認證表單的改造，支援電話號碼登入、OTP 驗證、密碼重設等功能，並整合 NextAuth.js 認證框架。

### 實作狀態

| 項目             | 狀態      | 說明                     |
| ---------------- | --------- | ------------------------ |
| NextAuth.js 整合 | ✅ 已完成 | Credentials Provider     |
| 電話格式驗證     | ✅ 已完成 | 使用 `libphonenumber-js` |
| OTP 發送 API     | ✅ 已完成 | `/api/auth/otp/send`     |
| 註冊 API         | ✅ 已完成 | `/api/auth/register`     |
| 密碼重設 API     | ✅ 已完成 | OTP + Token 機制         |

---

## 改造內容

### 1. SignInForm（登入表單）

**檔案位置**：`components/auth/SignInForm.tsx`

**功能特點**：

- 支援**電話號碼**或**會員編號**切換登入
- 使用 `PhoneInput` 組件（香港區號預設）
- **電話格式驗證**（`libphonenumber-js`）
- 密碼輸入（顯示/隱藏切換）
- 保持登入狀態選項
- 忘記密碼連結

**表單欄位**：
| 欄位 | 類型 | 必填 | 驗證 |
|------|------|------|------|
| 電話號碼 | PhoneInput | ✅ | `isValidPhoneNumber()` |
| 會員編號 | text | ✅ | 格式如 `M00001` |
| 密碼 | password | ✅ | 支援顯示/隱藏 |

---

### 2. SignUpForm（註冊表單）

**檔案位置**：`components/auth/SignUpForm.tsx`（主組件）

**分拆子組件**：

```
components/auth/signup/
├── types.ts            # 類型定義和常量
├── SignUpFormStep.tsx  # 表單步驟組件
├── SignUpOtpStep.tsx   # OTP 驗證步驟組件
└── SignUpEmailFallback.tsx  # 電郵後備驗證組件
```

**引用方式**：`import SignUpForm from "@/components/auth/SignUpForm"`

**功能特點**：

- **稱呼**（必填，SearchableSelect：先生/女士/小姐）
- **暱稱**（必填，平時稱呼）
- 電話號碼（作為登入帳號）+ **格式驗證**
- **電郵地址**（必填，用於後備驗證）
- 密碼 + 確認密碼（並排顯示）
- OTP 驗證流程（6 位數驗證碼）
- 電郵後備驗證（OTP 失敗 3 次後切換）
- 60 秒倒計時重發機制
- 服務條款同意勾選

**表單欄位順序**：
| 順序 | 欄位 | 類型 | 必填 | 驗證 |
|------|------|------|------|------|
| 1 | 稱呼 | SearchableSelect | ✅ | 必選 |
| 2 | 暱稱 | text | ✅ | 必填 |
| 3 | 電話號碼 | PhoneInput | ✅ | `isValidPhoneNumber()` |
| 4 | 電郵地址 | email | ✅ | 格式驗證 |
| 5 | 密碼 | password | ✅ | 至少 8 個字元 |
| 6 | 確認密碼 | password | ✅ | 需與密碼一致 |

**註冊流程**：

```
輸入資料 → 發送 OTP → 驗證 OTP → 完成註冊
                ↓ (失敗 3 次)
           電郵驗證後備
```

---

### 3. OtpForm（OTP 驗證表單）

**檔案位置**：`components/auth/OtpForm.tsx`

**功能特點**：

- 可作為獨立組件使用
- 支援 props 傳入回調函數
- 只允許數字輸入
- 支援貼上驗證碼
- 自動跳轉下一格
- 60 秒倒計時重發

**Props 介面**：

```typescript
interface OtpFormProps {
  phone?: string; // 顯示的電話號碼
  onVerify?: (otp: string) => Promise<boolean>; // 驗證回調
  onResend?: () => Promise<void>; // 重發回調
  onBack?: () => void; // 返回回調
  backUrl?: string; // 返回連結
  backLabel?: string; // 返回按鈕文字
}
```

---

### 4. ResetPasswordForm（重設密碼表單）

**檔案位置**：`components/auth/ResetPasswordForm.tsx`（主組件）

**分拆子組件**：

```
components/auth/reset-password/
├── types.ts                      # 類型定義
├── ResetPasswordRequestStep.tsx  # 輸入電話/電郵步驟
├── ResetPasswordOtpStep.tsx      # OTP 驗證步驟
├── ResetPasswordNewStep.tsx      # 設定新密碼步驟
└── ResetPasswordSuccessStep.tsx  # 成功頁面
```

**功能特點**：

- 支援**電話號碼**或**電郵地址**切換
- 電話：OTP 驗證 → 設定新密碼
- 電郵：發送重設連結
- 密碼強度驗證（至少 8 字元）
- 成功頁面提示

**重設流程（電話）**：

```
輸入電話 → 發送 OTP → 驗證 OTP → 設定新密碼 → 完成
```

**重設流程（電郵）**：

```
輸入電郵 → 發送重設連結 → 點擊連結 → 設定新密碼
```

---

## 共用組件

| 組件         | 路徑                                                   | 說明         |
| ------------ | ------------------------------------------------------ | ------------ |
| `PhoneInput` | `components/tailadmin/form/group-input/PhoneInput.tsx` | 國際電話輸入 |
| `Input`      | `components/tailadmin/form/input/InputField.tsx`       | 文字輸入框   |
| `Label`      | `components/tailadmin/form/Label.tsx`                  | 表單標籤     |
| `Button`     | `components/tailadmin/ui/button/Button.tsx`            | 按鈕         |
| `Checkbox`   | `components/tailadmin/form/input/Checkbox.tsx`         | 勾選框       |
| `Select`     | `components/tailadmin/form/select/Select.tsx`          | 下拉選擇     |

---

## API 整合狀態

### ✅ 已完成

| API           | 路徑                                  | 說明                 |
| ------------- | ------------------------------------- | -------------------- |
| NextAuth 設定 | `lib/auth/options.ts`                 | Credentials Provider |
| NextAuth 路由 | `app/api/auth/[...nextauth]/route.ts` | 登入/登出            |
| 用戶註冊      | `app/api/auth/register/route.ts`      | 建立帳號             |
| 發送 OTP      | `app/api/auth/otp/send/route.ts`      | 電話驗證             |
| 驗證 OTP      | `app/api/auth/otp/verify/route.ts`    | 驗證碼確認           |

### ✅ 密碼重設 API（已完成）

| API        | 路徑                                          | 說明                   |
| ---------- | --------------------------------------------- | ---------------------- |
| 發送重設碼 | `app/api/auth/reset-password/send/route.ts`   | 電話 OTP / 電郵連結    |
| 驗證重設碼 | `app/api/auth/reset-password/verify/route.ts` | 驗證後發放 Reset Token |
| 重設密碼   | `app/api/auth/reset-password/reset/route.ts`  | Token 驗證 + 密碼更新  |

### ✅ 修改密碼 API（已完成）

| API      | 路徑                                    | 說明                   |
| -------- | --------------------------------------- | ---------------------- |
| 修改密碼 | `app/api/auth/change-password/route.ts` | 驗證舊密碼後設定新密碼 |

**對應組件**：`components/feature/user/profile/UserChangePasswordModal.tsx`

---

## 資料對照

| Prisma 欄位    | 表單欄位 | 組件                    |
| -------------- | -------- | ----------------------- |
| `phone`        | 電話號碼 | SignUpForm / SignInForm |
| `memberNumber` | 會員編號 | SignInForm              |
| `passwordHash` | 密碼     | SignUpForm / SignInForm |
| `email`        | 電郵地址 | SignUpForm              |
| `nickname`     | 暱稱     | SignUpForm              |
| `title`        | 稱呼     | SignUpForm              |

---

## 注意事項

1. **密碼安全**：前端驗證至少 8 字元，後端使用 bcrypt（cost factor 12）加密
2. **電話格式驗證**：使用 `libphonenumber-js` 的 `isValidPhoneNumber()` 函數
3. **PhoneInput 組件**：預設香港區號 `+852`，支援國際格式
4. **OTP 限制**：60 秒倒計時、3 次失敗後切換電郵驗證
5. **電郵後備**：OTP 驗證失敗 3 次後自動切換
6. **Session**：JWT 策略，已整合 NextAuth.js
