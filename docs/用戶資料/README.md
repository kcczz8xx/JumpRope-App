# 用戶資料模組開發文檔

> **最後更新**：2026-02-02

## 概述

用戶資料模組負責展示和管理用戶的個人資訊，包括基本資料、地址、銀行資料、學員資料及導師相關文件。

## 頁面路徑

```
/dashboard/profile
```

**檔案位置**: `app/(private)/dashboard/(user)/profile/page.tsx`

---

## 組件架構

### 組件清單

| 組件名稱           | 檔案路徑                                               | 狀態      | 說明               |
| ------------------ | ------------------------------------------------------ | --------- | ------------------ |
| `UserMetaCard`     | `components/feature/user/profile/UserMetaCard.tsx`     | ✅ 已完成 | 用戶頭像與角色展示 |
| `UserInfoCard`     | `components/feature/user/profile/UserInfoCard.tsx`     | ✅ 已完成 | 個人基本資料       |
| `UserAddressCard`  | `components/feature/user/profile/UserAddressCard.tsx`  | ✅ 已完成 | 地址資訊           |
| `UserBankCard`     | `components/feature/user/profile/UserBankCard.tsx`     | ✅ 已完成 | 收款資料           |
| `UserChildrenCard` | `components/feature/user/profile/UserChildrenCard.tsx` | ✅ 已完成 | 學員資料列表       |
| `UserTutorCard`    | `components/feature/user/profile/UserTutorCard.tsx`    | ✅ 已完成 | 導師文件管理       |

---

## 組件詳細規格

### 1. UserMetaCard

**用途**: 顯示用戶頭像（以姓名首字母生成）及角色標籤

**Props**:

```typescript
interface UserMetaCardProps {
  name?: string; // 用戶姓名，預設 "用戶"
  role?: string; // 角色名稱，預設 "繩院用戶"
}
```

---

### 2. UserInfoCard

**用途**: 顯示用戶個人基本資料，包含編輯按鈕

**Props**:

```typescript
interface UserInfoCardProps {
  title?: string; // 稱呼（先生/女士/小姐）
  nameChinese?: string; // 中文全名
  nameEnglish?: string; // 英文全名
  identityCardNumber?: string; // 身份證號碼
  gender?: "男" | "女" | ""; // 性別
  email?: string; // 電郵地址
  phone?: string; // 電話號碼
  whatsappEnabled?: boolean; // 是否啟用 WhatsApp
  memberNumber?: string; // 會員編號
}
```

---

### 3. UserAddressCard

**用途**: 顯示用戶地址資訊

**Props**:

```typescript
interface UserAddressCardProps {
  district?: string; // 地區
  address?: string; // 詳細地址
}
```

---

### 4. UserBankCard

**用途**: 顯示用戶收款銀行資料

**Props**:

```typescript
interface UserBankCardProps {
  bankName?: string; // 所屬銀行
  accountNumber?: string; // 戶口號碼
  accountHolderName?: string; // 戶口持有人姓名
  fpsId?: string; // 轉數快 ID
  fpsEnabled?: boolean; // 轉數快是否啟用
  notes?: string; // 備註
}
```

---

### 5. UserChildrenCard

**用途**: 顯示用戶名下的學員資料列表

**Props**:

```typescript
interface ChildInfo {
  id: string;
  memberNumber?: string; // 會員編號
  nameChinese: string; // 中文名（必填）
  nameEnglish?: string; // 英文名
  birthYear?: number; // 出生年份
  school?: string; // 就讀學校
  gender?: "男" | "女"; // 性別
}

interface UserChildrenCardProps {
  children: ChildInfo[];
}
```

---

### 6. UserTutorCard

**用途**: 導師專用，管理必要文件、教練證書及其他證書

**文件狀態類型**:

```typescript
type DocumentStatus =
  | "valid" // 有效
  | "expired" // 已過期
  | "expiring_soon" // 即將過期（30天內）
  | "pending" // 審核中
  | "not_submitted"; // 未提交
```

**Props**:

```typescript
interface UserTutorCardProps {
  sexualConvictionCheck?: SexualConvictionCheck; // 性罪行定罪紀錄查核
  firstAidCertificate?: FirstAidCertificate; // 急救證書
  coachingCertificates?: CoachingCertificate[]; // 教練證書列表
  identityDocument?: IdentityDocument; // 身份證明文件
  otherCertificates?: OtherCertificate[]; // 其他證書列表
  bankInfo?: BankInfo; // 銀行資料狀態
  onAddSexualConvictionCheck?: () => void;
  onAddFirstAidCertificate?: () => void;
  onAddIdentityDocument?: () => void;
  onAddBankInfo?: () => void;
  onAddCoachingCertificate?: () => void;
  onAddOtherCertificate?: () => void;
}
```

**Tab 分類**:

- **必要文件**: 性罪行定罪紀錄查核、急救證書、身份證明文件、銀行資料
- **教練證書**: 各級教練證書
- **其他證書**: 體適能、心理學等額外證書

---

## 當前實作狀態

### ✅ 已完成

1. **UI 組件開發** - 所有 6 個卡片組件已完成
2. **響應式設計** - 支援桌面與移動端
3. **深色模式** - 所有組件支援 dark mode
4. **Mock 數據** - 頁面已配置完整測試數據

### ⏳ 使用 Mock 數據

目前頁面使用 `mockUserData` 靜態數據，尚未接入真實 API。

---

## Prisma Schema 設計

**檔案位置**:

- `prisma/schema/user.prisma` - 用戶相關 Models
- `prisma/schema/tutor.prisma` - 導師相關 Models

### 資料模型關係圖

```
User (用戶) [user.prisma]
├── UserAddress (地址) [1:1]
├── UserBankAccount (銀行帳戶) [1:1]
├── UserChild (學員) [1:N]
└── TutorProfile (導師資料) [1:1] [tutor.prisma]
    └── TutorDocument (導師文件) [1:N]
```

### Models 對應組件

| Model             | 對應組件                       | 說明               |
| ----------------- | ------------------------------ | ------------------ |
| `User`            | `UserMetaCard`, `UserInfoCard` | 用戶基本資料       |
| `UserAddress`     | `UserAddressCard`              | 地址資訊           |
| `UserBankAccount` | `UserBankCard`                 | 銀行收款資料       |
| `UserChild`       | `UserChildrenCard`             | 學員資料           |
| `TutorProfile`    | `UserTutorCard`                | 導師資料           |
| `TutorDocument`   | `UserTutorCard`                | 導師文件（證書等） |

### Enums

```prisma
enum Gender {
  MALE    // 男
  FEMALE  // 女
}

enum UserRole {
  USER     // 用戶
  TUTOR    // 導師
  ADMIN    // 管理員
  STAFF    // 職員
}

enum DocumentStatus {
  VALID          // 有效
  EXPIRED        // 已過期
  EXPIRING_SOON  // 即將過期（30天內）
  PENDING        // 審核中
  NOT_SUBMITTED  // 未提交
}

enum DocumentType {
  SEXUAL_CONVICTION_CHECK  // 性罪行定罪紀錄查核
  FIRST_AID_CERTIFICATE    // 急救證書
  IDENTITY_DOCUMENT        // 身份證明文件
  COACHING_CERTIFICATE     // 教練證書
  OTHER_CERTIFICATE        // 其他證書
}
```

### User Model 欄位

| 欄位                 | 類型       | 說明                       |
| -------------------- | ---------- | -------------------------- |
| `memberNumber`       | `String?`  | 會員編號 (e.g. 2024010001) |
| `title`              | `String?`  | 稱呼（先生/女士/小姐）     |
| `phone`              | `String`   | 電話號碼（必填，唯一）     |
| `email`              | `String?`  | 電郵地址                   |
| `nameChinese`        | `String?`  | 中文姓名                   |
| `nameEnglish`        | `String?`  | 英文姓名                   |
| `nickname`           | `String?`  | 暱稱（平時稱呼）           |
| `gender`             | `Gender?`  | 性別                       |
| `passwordHash`       | `String?`  | bcrypt 加密後的密碼        |
| `identityCardNumber` | `String?`  | 身份證號碼                 |
| `whatsappEnabled`    | `Boolean`  | 是否啟用 WhatsApp          |
| `role`               | `UserRole` | 用戶角色                   |

### TutorDocument Model 欄位

| 欄位              | 類型             | 說明                        |
| ----------------- | ---------------- | --------------------------- |
| `documentType`    | `DocumentType`   | 文件類型                    |
| `name`            | `String`         | 文件名稱                    |
| `status`          | `DocumentStatus` | 文件狀態                    |
| `referenceNumber` | `String?`        | 參考編號                    |
| `certificateType` | `String?`        | 證書類型                    |
| `issuingBody`     | `String?`        | 簽發機構                    |
| `issueDate`       | `DateTime?`      | 簽發日期                    |
| `expiryDate`      | `DateTime?`      | 到期日期（null = 永久有效） |
| `documentUrl`     | `String?`        | 文件 URL                    |

---

## ROADMAP

### Phase 1: 資料層整合

- [x] 建立 User Prisma Schema
- [x] 執行 Migration
- [x] NextAuth.js 整合
- [x] OTP API 實作
- [x] 電話格式驗證（`libphonenumber-js`）
- [x] 建立 API Route (`/api/user/profile`, `/api/user/address`, `/api/user/bank`)
- [x] 建立導師文件 API (`/api/user/tutor/document`)

### Phase 2: 編輯功能

- [x] UserInfoEditModal 編輯 Modal
- [x] UserAddressEditModal 編輯 Modal
- [x] UserBankEditModal 編輯 Modal
- [x] UserChildEditModal 新增/編輯/刪除功能
- [x] 整合 Modal 到 Card 組件
- [x] API Route 已實作（取代 Server Actions）
- [ ] 整合 SWR Hooks 到 Modal 組件

### Phase 3: 導師文件管理

- [ ] 文件上傳功能
- [ ] 文件預覽/下載功能
- [ ] 文件狀態自動更新（過期提醒）
- [ ] 新增證書 Modal

### Phase 4: 權限控制 ✅

- [x] RBAC 權限模組（`lib/rbac/`）
- [x] `usePermission` Hook
- [x] `PermissionGate` 組件
- [x] Middleware 路由保護
- [ ] 整合權限檢查到 UI 組件

### Phase 5: API 整合層 ✅

- [x] API Client Wrapper（`lib/api-client.ts`）
- [x] Toast 通知系統（sonner）
- [x] Zod 驗證 Schema（`lib/validations/`）
- [x] SWR Provider 與配置
- [x] `useFormSubmit` 防重複提交 Hook
- [x] `useUserProfile` 系列 SWR Hooks

> 📖 詳細文檔請參閱 [API_INTEGRATION.md](./API_INTEGRATION.md)

---

## 編輯表單組件

### Modal 組件清單

| 組件名稱                  | 檔案路徑                                                      | 狀態      | 說明          |
| ------------------------- | ------------------------------------------------------------- | --------- | ------------- |
| `UserInfoEditModal`       | `components/feature/user/profile/UserInfoEditModal.tsx`       | ✅ 已完成 | 編輯個人資料  |
| `UserAddressEditModal`    | `components/feature/user/profile/UserAddressEditModal.tsx`    | ✅ 已完成 | 編輯地址      |
| `UserBankEditModal`       | `components/feature/user/profile/UserBankEditModal.tsx`       | ✅ 已完成 | 編輯銀行資料  |
| `UserChildEditModal`      | `components/feature/user/profile/UserChildEditModal.tsx`      | ✅ 已完成 | 新增/編輯學員 |
| `UserChangePasswordModal` | `components/feature/user/profile/UserChangePasswordModal.tsx` | ✅ 已完成 | 修改密碼      |

### UserInfoEditModal

```typescript
interface UserInfoFormData {
  title: string;
  nameChinese: string;
  nameEnglish: string;
  identityCardNumber: string;
  gender: "MALE" | "FEMALE" | "";
  email: string;
  phone: string;
  whatsappEnabled: boolean;
}

interface UserInfoEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: UserInfoFormData) => void;
  initialData?: Partial<UserInfoFormData>;
  isLoading?: boolean;
}
```

### UserAddressEditModal

採用香港十八區層級式選單（Region -> District）

```typescript
interface UserAddressFormData {
  region?: string; // 地域（HK/KLN/NT）
  district: string; // 十八區
  address: string; // 詳細地址
}

interface UserAddressEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: UserAddressFormData) => void;
  initialData?: Partial<UserAddressFormData>;
  isLoading?: boolean;
}
```

**香港十八區資料**: `lib/constants/hk-address-data.ts`

| 地域        | 地區                                                                 |
| ----------- | -------------------------------------------------------------------- |
| 香港島 (HK) | 中西區、東區、南區、灣仔區                                           |
| 九龍 (KLN)  | 九龍城區、觀塘區、深水埗區、黃大仙區、油尖旺區                       |
| 新界 (NT)   | 離島區、葵青區、北區、西貢區、沙田區、大埔區、荃灣區、屯門區、元朗區 |

### UserBankEditModal

```typescript
interface UserBankFormData {
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  fpsId: string;
  fpsEnabled: boolean;
  notes: string;
}

interface UserBankEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: UserBankFormData) => void;
  initialData?: Partial<UserBankFormData>;
  isLoading?: boolean;
}
```

### UserChildEditModal

```typescript
interface UserChildFormData {
  id?: string;
  nameChinese: string;
  nameEnglish: string;
  birthYear: string;
  school: string;
  gender: "MALE" | "FEMALE" | "";
}

interface UserChildEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: UserChildFormData) => void;
  onDelete?: (id: string) => void;
  initialData?: Partial<UserChildFormData>;
  isLoading?: boolean;
  mode: "create" | "edit";
}
```

---

## 相關檔案

```
prisma/schema/
├── user.prisma                    # 用戶相關 Schema
└── tutor.prisma                   # 導師相關 Schema

lib/
├── api-client.ts                  # API Client Wrapper
├── toast.ts                       # Toast 通知工具
├── swr-config.ts                  # SWR 全局配置
├── auth/
│   ├── options.ts                 # NextAuth 設定
│   └── index.ts                   # Auth 導出
├── rbac/                          # RBAC 權限模組
│   ├── index.ts
│   ├── types.ts                   # UserRole 類型
│   ├── permissions.ts             # 權限常數
│   └── check-permission.ts        # Server-side 權限檢查
├── validations/                   # Zod 驗證 Schema
│   ├── index.ts
│   ├── user.ts
│   └── tutor-document.ts
└── constants/
    └── hk-address-data.ts         # 香港十八區資料常數

hooks/
├── useFormSubmit.ts               # 表單提交 Hook
├── usePermission.ts               # Client-side 權限 Hook
└── useUserProfile.ts              # SWR-based 用戶資料 Hooks

context/
└── SWRProvider.tsx                # SWR 全局 Provider

components/auth/
├── SignInForm.tsx                 # 登入表單
├── SignUpForm.tsx                 # 註冊表單
├── OtpForm.tsx                    # OTP 驗證表單
├── ResetPasswordForm.tsx          # 重設密碼表單
├── signup/                        # 註冊子組件
│   ├── types.ts
│   ├── SignUpFormStep.tsx
│   ├── SignUpOtpStep.tsx
│   └── SignUpEmailFallback.tsx
└── reset-password/                # 重設密碼子組件
    ├── types.ts
    ├── ResetPasswordRequestStep.tsx
    ├── ResetPasswordOtpStep.tsx
    ├── ResetPasswordNewStep.tsx
    └── ResetPasswordSuccessStep.tsx

components/feature/user/profile/
├── UserMetaCard.tsx               # 用戶頭像卡片
├── UserInfoCard.tsx               # 個人資料卡片
├── UserAddressCard.tsx            # 地址卡片
├── UserBankCard.tsx               # 銀行資料卡片
├── UserChildrenCard.tsx           # 學員列表卡片
├── UserTutorCard.tsx              # 導師文件卡片
├── UserInfoEditModal.tsx          # 編輯個人資料 Modal
├── UserAddressEditModal.tsx       # 編輯地址 Modal（香港十八區）
├── UserBankEditModal.tsx          # 編輯銀行資料 Modal
├── UserChildEditModal.tsx         # 新增/編輯學員 Modal
├── UserChangePasswordModal.tsx    # 修改密碼 Modal
└── tutor-documents/               # 導師文件子組件
    ├── index.ts
    ├── types.ts
    ├── FileUploadArea.tsx
    ├── DocumentTable.tsx
    └── TutorDocumentEditModal.tsx

app/api/auth/
├── [...nextauth]/route.ts         # NextAuth 路由
├── register/route.ts              # 註冊 API
├── change-password/route.ts       # 修改密碼 API
├── otp/
│   ├── send/route.ts              # 發送 OTP
│   └── verify/route.ts            # 驗證 OTP
└── reset-password/
    ├── send/route.ts              # 發送重設碼
    ├── verify/route.ts            # 驗證重設碼
    └── reset/route.ts             # 重設密碼

app/api/user/
├── profile/route.ts               # 個人資料 API (GET/PUT)
├── address/route.ts               # 地址 API (GET/PUT)
├── bank/route.ts                  # 銀行資料 API (GET/PUT)
└── tutor/
    └── document/route.ts          # 導師文件 API (GET/POST/PUT/DELETE)

app/(private)/dashboard/(user)/profile/
└── page.tsx
```
