# 用戶資料模組 - 技術總結

> **生成日期**：2026-02-02

## 模組概述

用戶資料模組是 `/dashboard/profile` 頁面的核心功能，負責用戶個人資訊的展示與編輯，整合 SWR 資料獲取、RBAC 權限控制、Zod 驗證等技術。

---

## 技術架構

```
┌─────────────────────────────────────────────────────────────┐
│                    Profile Page (Server)                     │
│        app/(private)/dashboard/(user)/profile/page.tsx       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│               ProfilePageContent (Client)                    │
│   components/feature/user/profile/ProfilePageContent.tsx     │
│                                                              │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│   │UserInfoCard │  │UserAddress  │  │ UserBankCard│        │
│   │             │  │    Card     │  │             │        │
│   └─────────────┘  └─────────────┘  └─────────────┘        │
│   ┌─────────────┐  ┌─────────────┐                          │
│   │UserChildren │  │UserTutorCard│                          │
│   │    Card     │  │             │                          │
│   └─────────────┘  └─────────────┘                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      SWR Hooks Layer                         │
│                 hooks/useUserProfile.ts                      │
│                                                              │
│  useUserProfile() │ useUserAddress() │ useUserBank()        │
│  useUpdateProfile │ useUpdateAddress │ useUpdateBank        │
│  useUserChildren  │ useCreateChild   │ useChangePassword    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Layer                               │
│                                                              │
│  /api/user/profile  │ /api/user/address │ /api/user/bank    │
│  /api/user/children │ /api/auth/change-password             │
└─────────────────────────────────────────────────────────────┘
```

---

## 核心檔案清單

### 1. Client 工具 (`lib/client/`)

| 檔案 | 導出 | 用途 |
|------|------|------|
| `api.ts` | `api`, `apiGet`, `apiPost`, `apiPut`, `apiPatch`, `apiDelete`, `apiUpload` | API 請求封裝 |
| `toast.ts` | `toast` | Toast 通知（基於 sonner） |
| `swr-config.ts` | `swrConfig` | SWR 全局配置 |
| `index.ts` | 統一導出 | `import { api, toast } from "@/lib/client"` |

**ApiResult 類型**：
```typescript
type ApiResult<T> = { data: T; error: null } | { data: null; error: string };
```

### 2. RBAC 權限 (`lib/rbac/`)

| 檔案 | 導出 | 用途 |
|------|------|------|
| `types.ts` | `UserRole` | 角色類型定義 |
| `permissions.ts` | `Permission`, `PERMISSIONS`, `hasPermission`, `isRoleAtLeast`, `isAdmin`, `isStaffOrAdmin`, `isTutor` | 權限定義與檢查函式 |
| `check-permission.ts` | `checkAuth`, `checkPermission`, `checkOwnership`, `checkPermissionWithOwnership` | Server-side 權限檢查 |

**角色層級**：
```typescript
ADMIN: 100 → STAFF: 80 → TUTOR: 60 → PARENT: 40 → STUDENT: 30 → USER: 20
```

**權限列表**：
```typescript
type Permission =
  | "USER_PROFILE_READ_OWN" | "USER_PROFILE_UPDATE_OWN"
  | "USER_PROFILE_READ_ANY" | "USER_PROFILE_UPDATE_ANY"
  | "CHILD_READ_OWN" | "CHILD_CREATE" | "CHILD_UPDATE_OWN" | "CHILD_DELETE_OWN"
  | "TUTOR_DOCUMENT_READ_OWN" | "TUTOR_DOCUMENT_CREATE" | "TUTOR_DOCUMENT_UPDATE_OWN"
  | ... // 其他權限
```

### 3. Zod 驗證 (`lib/validations/`)

| Schema | 欄位 |
|--------|------|
| `userInfoSchema` | `nickname?`, `email?`, `phone?`, `whatsappEnabled?` |
| `userAddressSchema` | `region?`, `district`, `address` |
| `userBankSchema` | `bankName`, `accountNumber`, `accountHolderName`, `fpsId?`, `fpsEnabled?`, `notes?` |
| `userChildSchema` | `nickname`, `nameChinese?`, `nameEnglish?`, `gender?`, `dateOfBirth?`, `school?`, `grade?`, `medicalNotes?` |
| `changePasswordSchema` | `currentPassword`, `newPassword`, `confirmPassword`（含密碼強度驗證） |

### 4. Hooks

#### `hooks/useUserProfile.ts`

| Hook | 功能 | API |
|------|------|-----|
| `useUserProfile()` | 獲取用戶資料 | GET /api/user/profile |
| `useUpdateProfile(onSuccess?)` | 更新用戶資料 | PATCH /api/user/profile |
| `useUserAddress()` | 獲取地址 | GET /api/user/address |
| `useUpdateAddress(onSuccess?)` | 更新地址 | PUT /api/user/address |
| `useDeleteAddress(onSuccess?)` | 刪除地址 | DELETE /api/user/address |
| `useUserBank()` | 獲取銀行資料 | GET /api/user/bank |
| `useUpdateBank(onSuccess?)` | 更新銀行資料 | PUT /api/user/bank |
| `useDeleteBank(onSuccess?)` | 刪除銀行資料 | DELETE /api/user/bank |
| `useUserChildren()` | 獲取學員列表 | GET /api/user/children |
| `useCreateChild(onSuccess?)` | 新增學員 | POST /api/user/children |
| `useUpdateChild(onSuccess?)` | 更新學員 | PUT /api/user/children |
| `useDeleteChild(onSuccess?)` | 刪除學員 | DELETE /api/user/children |
| `useChangePassword(onSuccess?)` | 修改密碼 | POST /api/auth/change-password |

#### `hooks/useFormSubmit.ts`

| Hook | 返回值 | 用途 |
|------|--------|------|
| `useFormSubmit<TData, TResult>()` | `{ isSubmitting, submit, reset }` | 表單提交（防重複、自動 Toast） |
| `useAsyncSubmit<TResult>()` | `{ isLoading, execute }` | 異步操作封裝 |

#### `hooks/usePermission.ts`

| 返回值 | 類型 | 用途 |
|--------|------|------|
| `role` | `UserRole \| null` | 當前用戶角色 |
| `roleLabel` | `string` | 角色中文名稱 |
| `can(permission)` | `(Permission) => boolean` | 檢查權限 |
| `canAny(permissions)` | `(Permission[]) => boolean` | 檢查任一權限 |
| `canAll(permissions)` | `(Permission[]) => boolean` | 檢查全部權限 |
| `isAtLeast(role)` | `(UserRole) => boolean` | 檢查角色層級 |
| `isAdmin` | `boolean` | 是否為管理員 |
| `isStaffOrAdmin` | `boolean` | 是否為職員或管理員 |
| `isTutor` | `boolean` | 是否為導師 |

---

## API 端點詳情

### 用戶資料 API

| 端點 | 方法 | 權限 | 說明 |
|------|------|------|------|
| `/api/user/profile` | GET | `USER_PROFILE_READ_OWN` | 獲取個人資料 |
| `/api/user/profile` | PATCH | `USER_PROFILE_UPDATE_OWN` | 更新個人資料 |
| `/api/user/address` | GET | `USER_PROFILE_READ_OWN` | 獲取地址 |
| `/api/user/address` | PUT | `USER_PROFILE_UPDATE_OWN` | 更新地址 |
| `/api/user/address` | DELETE | `USER_PROFILE_UPDATE_OWN` | 刪除地址 |
| `/api/user/bank` | GET | `USER_PROFILE_READ_OWN` | 獲取銀行資料 |
| `/api/user/bank` | PUT | `USER_PROFILE_UPDATE_OWN` | 更新銀行資料 |
| `/api/user/bank` | DELETE | `USER_PROFILE_UPDATE_OWN` | 刪除銀行資料 |
| `/api/user/children` | GET | `CHILD_READ_OWN` | 獲取學員列表 |
| `/api/user/children` | POST | `CHILD_CREATE` | 新增學員 |
| `/api/user/children` | PUT | `CHILD_UPDATE_OWN` | 更新學員 |
| `/api/user/children` | DELETE | `CHILD_DELETE_OWN` | 刪除學員 |

### 認證 API

| 端點 | 方法 | 說明 |
|------|------|------|
| `/api/auth/[...nextauth]` | * | NextAuth.js 主入口 |
| `/api/auth/register` | POST | 註冊新用戶 |
| `/api/auth/otp/send` | POST | 發送 OTP 驗證碼 |
| `/api/auth/otp/verify` | POST | 驗證 OTP |
| `/api/auth/change-password` | POST | 修改密碼 |
| `/api/auth/reset-password/send` | POST | 發送重設碼 |
| `/api/auth/reset-password/verify` | POST | 驗證重設碼 |
| `/api/auth/reset-password/reset` | POST | 重設密碼 |

### 導師文件 API

| 端點 | 方法 | 權限 | 說明 |
|------|------|------|------|
| `/api/user/tutor/document` | GET | `TUTOR_DOCUMENT_READ_OWN` | 獲取文件列表 |
| `/api/user/tutor/document` | POST | `TUTOR_DOCUMENT_CREATE` | 上傳新文件 |
| `/api/user/tutor/document` | PUT | `TUTOR_DOCUMENT_UPDATE_OWN` | 更新文件 |
| `/api/user/tutor/document` | DELETE | `TUTOR_DOCUMENT_DELETE_OWN` | 刪除文件 |

---

## 組件清單

### 展示卡片 (`components/feature/user/profile/`)

| 組件 | 說明 | 使用的 Hooks |
|------|------|--------------|
| `UserMetaCard` | 頭像與角色展示 | - |
| `UserInfoCard` | 個人基本資料 | `useUpdateProfile` |
| `UserAddressCard` | 地址資訊 | `useUpdateAddress`, `useDeleteAddress` |
| `UserBankCard` | 收款資料 | `useUpdateBank`, `useDeleteBank` |
| `UserChildrenCard` | 學員列表 | `useUserChildren`, `useUpdateChild` |
| `UserTutorCard` | 導師文件管理 | - |

### 編輯 Modal

| 組件 | 說明 | 驗證 Schema |
|------|------|-------------|
| `UserInfoEditModal` | 編輯個人資料 | `userInfoSchema` |
| `UserAddressEditModal` | 編輯地址（香港十八區） | `userAddressSchema` |
| `UserBankEditModal` | 編輯銀行資料 | `userBankSchema` |
| `UserChildEditModal` | 編輯學員資料（僅學校欄位） | `userChildSchema` |
| `UserChangePasswordModal` | 修改密碼 | `changePasswordSchema` |

---

## 使用範例

### SWR Hook 使用

```typescript
import { useUserProfile, useUpdateProfile } from "@/hooks/useUserProfile";

function ProfileCard() {
  const { profile, isLoading, isError, mutate } = useUserProfile();
  const { isSubmitting, submit } = useUpdateProfile(() => {
    // onSuccess: 關閉 Modal
    closeModal();
  });

  if (isLoading) return <Skeleton />;
  if (isError) return <ErrorMessage />;

  const handleSave = async (data: UserInfoFormData) => {
    const success = await submit(data);
    // success 為 true 表示成功，SWR 會自動 mutate
  };

  return <UserInfoCard data={profile} onSave={handleSave} />;
}
```

### 權限檢查使用

```typescript
import { usePermission } from "@/hooks/usePermission";
import { PermissionGate } from "@/components/auth/PermissionGate";

function MyComponent() {
  const { can, isAdmin, isLoading } = usePermission();

  if (isLoading) return <Loading />;

  return (
    <div>
      {can("CHILD_READ_OWN") && <UserChildrenCard />}
      
      <PermissionGate permission="ADMIN_DASHBOARD">
        <AdminPanel />
      </PermissionGate>
    </div>
  );
}
```

### Server-side 權限檢查

```typescript
import { checkPermission, forbiddenResponse } from "@/lib/rbac";

export async function GET() {
  const auth = await checkPermission("USER_PROFILE_READ_OWN");
  
  if (!auth.authorized) {
    return forbiddenResponse(auth.error);
  }

  // auth.userId 可用於查詢
  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
  });

  return NextResponse.json({ user });
}
```

---

## 待實作功能

| 功能 | 優先級 | 說明 |
|------|--------|------|
| 導師文件上傳 | 高 | FileUploadArea 組件整合 |
| 文件預覽/下載 | 中 | PDF/圖片預覽功能 |
| 文件狀態自動更新 | 低 | Cron Job 檢查到期日期 |

---

## 相關文檔

- [README.md](./README.md) - 模組總覽
- [API_INTEGRATION.md](./API_INTEGRATION.md) - API 整合與 RBAC 詳細說明
- [AUTH_FORMS_SUMMARY.md](./AUTH_FORMS_SUMMARY.md) - 認證表單總結
- [TUTOR_DOCUMENTS.md](./TUTOR_DOCUMENTS.md) - 導師文件系統
- [DEVELOPMENT_CHECKLIST.md](./DEVELOPMENT_CHECKLIST.md) - 開發檢查清單
