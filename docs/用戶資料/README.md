# 用戶資料模組

> **最後更新**：2026-02-02

## 概述

用戶資料模組負責展示和管理用戶的個人資訊，包括基本資料、地址、銀行資料、學員資料及導師相關文件。

**頁面路徑**: `/dashboard/profile`

**檔案位置**: `app/(private)/dashboard/(user)/profile/page.tsx`

---

## 實作狀態

| 功能         | 狀態      | 說明                      |
| ------------ | --------- | ------------------------- |
| UI 組件      | ✅ 已完成 | 6 卡片 + 5 Modal          |
| API 整合     | ✅ 已完成 | SWR Hooks + API Routes    |
| 權限控制     | ✅ 已完成 | RBAC + PermissionGate     |
| 認證系統     | ✅ 已完成 | NextAuth + OTP + 密碼重設 |
| 導師文件上傳 | ⏳ 待實作 | FileUploadArea 組件待整合 |

---

## 組件清單

### 展示卡片

| 組件               | 說明               |
| ------------------ | ------------------ |
| `UserMetaCard`     | 用戶頭像與角色展示 |
| `UserInfoCard`     | 個人基本資料       |
| `UserAddressCard`  | 地址資訊           |
| `UserBankCard`     | 收款資料           |
| `UserChildrenCard` | 學員資料列表       |
| `UserTutorCard`    | 導師文件管理       |

### 編輯 Modal

| 組件                      | 說明         |
| ------------------------- | ------------ |
| `UserInfoEditModal`       | 編輯個人資料 |
| `UserAddressEditModal`    | 編輯地址     |
| `UserBankEditModal`       | 編輯銀行資料 |
| `UserChildEditModal`      | 編輯學員資料 |
| `UserChangePasswordModal` | 修改密碼     |

**組件路徑**: `components/feature/user/profile/`

---

## API 端點

### 用戶資料

| 端點                 | 方法                   | 說明         |
| -------------------- | ---------------------- | ------------ |
| `/api/user/profile`  | GET, PATCH             | 個人資料     |
| `/api/user/address`  | GET, PUT, DELETE       | 地址         |
| `/api/user/bank`     | GET, PUT, DELETE       | 銀行收款資料 |
| `/api/user/children` | GET, POST, PUT, DELETE | 學員資料     |

### 導師文件

| 端點                       | 方法                   | 說明     |
| -------------------------- | ---------------------- | -------- |
| `/api/user/tutor/document` | GET, POST, PUT, DELETE | 導師文件 |

### 認證

| 端點                              | 說明            |
| --------------------------------- | --------------- |
| `/api/auth/[...nextauth]`         | NextAuth 主入口 |
| `/api/auth/register`              | 註冊            |
| `/api/auth/otp/send`              | 發送 OTP        |
| `/api/auth/otp/verify`            | 驗證 OTP        |
| `/api/auth/change-password`       | 修改密碼        |
| `/api/auth/reset-password/send`   | 發送重設碼      |
| `/api/auth/reset-password/verify` | 驗證重設碼      |
| `/api/auth/reset-password/reset`  | 重設密碼        |

---

## SWR Hooks

**檔案**: `hooks/useUserProfile.ts`

| Hook                | 用途            |
| ------------------- | --------------- |
| `useUserProfile`    | GET 用戶資料    |
| `useUpdateProfile`  | PATCH 用戶資料  |
| `useUserAddress`    | GET 地址        |
| `useUpdateAddress`  | PUT 地址        |
| `useDeleteAddress`  | DELETE 地址     |
| `useUserBank`       | GET 銀行資料    |
| `useUpdateBank`     | PUT 銀行資料    |
| `useDeleteBank`     | DELETE 銀行資料 |
| `useUserChildren`   | GET 學員列表    |
| `useCreateChild`    | POST 新增學員   |
| `useUpdateChild`    | PUT 更新學員    |
| `useDeleteChild`    | DELETE 刪除學員 |
| `useChangePassword` | POST 修改密碼   |

---

## Prisma 資料模型

**Schema 檔案**: `prisma/schema/user.prisma`, `prisma/schema/tutor.prisma`

```
User (用戶)
├── UserAddress (地址) [1:1]
├── UserBankAccount (銀行帳戶) [1:1]
├── UserChild (學員) [1:N]
└── TutorProfile (導師資料) [1:1]
    └── TutorDocument (導師文件) [1:N]
```

### User 主要欄位

| 欄位           | 類型     | 說明                  |
| -------------- | -------- | --------------------- |
| `memberNumber` | String?  | 會員編號（YYMMTXXXX） |
| `phone`        | String   | 電話號碼（唯一）      |
| `email`        | String?  | 電郵地址              |
| `passwordHash` | String?  | bcrypt 加密密碼       |
| `role`         | UserRole | 角色                  |
| `nameChinese`  | String?  | 中文姓名              |
| `nameEnglish`  | String?  | 英文姓名              |
| `nickname`     | String?  | 暱稱                  |

### Enums

```prisma
enum UserRole { USER, TUTOR, ADMIN, STAFF, STUDENT, PARENT }
enum Gender { MALE, FEMALE }
enum DocumentStatus { VALID, EXPIRED, EXPIRING_SOON, PENDING, NOT_SUBMITTED }
enum DocumentType { IDENTITY_DOCUMENT, SEXUAL_CONVICTION_CHECK, FIRST_AID_CERTIFICATE, COACHING_CERTIFICATE, OTHER_CERTIFICATE }
```

---

## 檔案結構

```
lib/
├── client/
│   ├── api.ts                     # API Client Wrapper
│   ├── toast.ts                   # Toast 通知
│   └── swr-config.ts              # SWR 配置
├── auth/                          # NextAuth 設定
├── rbac/                          # RBAC 權限模組
├── validations/                   # Zod Schema
├── server/rate-limit.ts           # Rate Limiting
├── services/member-number.ts      # 會員編號生成
└── constants/hk-address-data.ts   # 香港十八區資料

hooks/
├── useFormSubmit.ts               # 表單提交 Hook
├── usePermission.ts               # 權限 Hook
└── useUserProfile.ts              # 用戶資料 SWR Hooks

context/
└── SWRProvider.tsx                # SWR Provider

components/
├── auth/                          # 認證表單組件
│   ├── SignInForm.tsx
│   ├── SignUpForm.tsx
│   ├── OtpForm.tsx
│   ├── ResetPasswordForm.tsx
│   ├── signup/                    # 註冊子組件
│   └── reset-password/            # 重設密碼子組件
└── feature/user/profile/          # 用戶資料組件
    ├── ProfilePageContent.tsx     # 頁面客戶端組件
    ├── User*Card.tsx              # 展示卡片 (6 個)
    ├── User*EditModal.tsx         # 編輯 Modal (4 個)
    ├── UserChangePasswordModal.tsx
    └── tutor-documents/           # 導師文件子組件
```

---

## 相關文檔

- [API_INTEGRATION.md](./API_INTEGRATION.md) - API 整合與 RBAC 權限控制
- [AUTH_FORMS_SUMMARY.md](./AUTH_FORMS_SUMMARY.md) - 認證表單總結
- [TUTOR_DOCUMENTS.md](./TUTOR_DOCUMENTS.md) - 導師文件管理系統
- [DEVELOPMENT_CHECKLIST.md](./DEVELOPMENT_CHECKLIST.md) - 開發檢查清單
