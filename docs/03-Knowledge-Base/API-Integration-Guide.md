# API 整合與 RBAC 權限控制

> **最後更新**：2026-02-02

## 概述

本文檔說明用戶資料模組的 API 整合層與 RBAC（Role-Based Access Control）權限控制系統。

---

## 目錄結構

```
lib/
├── client/
│   ├── api.ts                 # API Client Wrapper
│   ├── toast.ts               # Toast 通知工具
│   ├── swr-config.ts          # SWR 配置
│   └── index.ts               # 統一導出
├── rbac/                      # RBAC 權限模組
│   ├── index.ts
│   ├── types.ts               # UserRole 類型
│   ├── permissions.ts         # 權限常數與檢查函式
│   └── check-permission.ts    # Server-side 權限檢查
├── validations/               # Zod 驗證 Schema
│   ├── index.ts
│   ├── user.ts                # 用戶資料驗證
│   └── tutor-document.ts      # 導師文件驗證
└── server/
    └── rate-limit.ts          # Rate Limiting

hooks/
├── useFormSubmit.ts           # 表單提交 Hook（防重複）
├── usePermission.ts           # Client-side 權限 Hook
└── useUserProfile.ts          # SWR-based 用戶資料 Hooks

context/
└── SWRProvider.tsx            # SWR 全局 Provider

components/
├── ui/Toaster.tsx             # Toast 組件（sonner）
└── auth/PermissionGate.tsx    # 權限 Gate 組件
```

---

## 1. API Client Wrapper

**檔案**: `lib/client/api.ts`

統一處理 API 請求、錯誤處理、類型安全。

### 類型定義

```typescript
type ApiResult<T> = { data: T; error: null } | { data: null; error: string };
```

### 使用方式

```typescript
import { api } from "@/lib/client";

// GET 請求
const result = await api.get<UserProfile>("/api/user/profile");
if (result.error) {
  console.error(result.error);
} else {
  console.log(result.data);
}

// POST 請求
const result = await api.post<User>("/api/user", { name: "John" });

// PUT / PATCH / DELETE
await api.put<Address>("/api/user/address", addressData);
await api.patch<UserProfile>("/api/user/profile", { nickname: "小明" });
await api.delete<void>("/api/user/address");

// 檔案上傳
const formData = new FormData();
formData.append("file", file);
await api.upload<Document>("/api/upload", formData);
```

---

## 2. Toast 通知系統

**檔案**: `lib/client/toast.ts`, `components/ui/Toaster.tsx`

基於 `sonner` 的 Toast 通知系統。

### 使用方式

```typescript
import { toast } from "@/lib/client";

toast.success("儲存成功");
toast.error("操作失敗");
toast.info("提示訊息");
toast.warning("警告");
toast.loading("處理中...");
```

### Layout 整合

`Toaster` 組件已整合到 `app/(private)/layout.tsx`。

---

## 3. Zod 驗證 Schema

**檔案**: `lib/validations/user.ts`

前後端共用的表單驗證。

### Schema 列表

| Schema                 | 用途         |
| ---------------------- | ------------ |
| `userInfoSchema`       | 用戶基本資料 |
| `userAddressSchema`    | 地址         |
| `userBankSchema`       | 銀行收款資料 |
| `userChildSchema`      | 學員資料     |
| `changePasswordSchema` | 修改密碼     |

### 使用方式

```typescript
import { userInfoSchema, type UserInfoFormData } from "@/lib/validations";

// 驗證
const result = userInfoSchema.safeParse(formData);
if (!result.success) {
  console.error(result.error.flatten());
}

// 類型推斷
const data: UserInfoFormData = result.data;
```

---

## 4. 表單提交 Hook

**檔案**: `hooks/useFormSubmit.ts`

統一處理表單提交、防重複提交、錯誤處理。

### useFormSubmit

```typescript
import { useFormSubmit } from "@/hooks/useFormSubmit";

const { isSubmitting, submit, reset } = useFormSubmit<FormData, Result>({
  onSubmit: async (data) => {
    return api.post<Result>("/api/endpoint", data);
  },
  onSuccess: (result) => {
    console.log("成功", result);
  },
  onError: (error) => {
    console.error("失敗", error);
  },
  successMessage: "儲存成功",
  showSuccessToast: true,
  showErrorToast: true,
});

// 提交
const success = await submit(formData);
```

### useAsyncSubmit

更靈活的異步操作 Hook：

```typescript
import { useAsyncSubmit } from "@/hooks/useFormSubmit";

const { isLoading, execute } = useAsyncSubmit<Result>({
  onSuccess: (result) => console.log(result),
  successMessage: "操作成功",
});

const result = await execute(() => api.delete<Result>("/api/resource"));
```

---

## 5. RBAC 權限控制

### 5.1 角色定義

**檔案**: `lib/rbac/types.ts`

```typescript
type UserRole = "ADMIN" | "STAFF" | "TUTOR" | "PARENT" | "STUDENT" | "USER";
```

### 5.2 角色層級

**檔案**: `lib/rbac/permissions.ts`

```typescript
const ROLE_HIERARCHY: Record<UserRole, number> = {
  ADMIN: 100,
  STAFF: 80,
  TUTOR: 60,
  PARENT: 40,
  STUDENT: 30,
  USER: 20,
};

const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "管理員",
  STAFF: "職員",
  TUTOR: "導師",
  PARENT: "家長",
  STUDENT: "學員",
  USER: "用戶",
};
```

### 5.3 權限定義

```typescript
type Permission =
  | "USER_PROFILE_READ_OWN"
  | "USER_PROFILE_UPDATE_OWN"
  | "USER_PROFILE_READ_ANY"
  | "USER_PROFILE_UPDATE_ANY"
  | "TUTOR_DOCUMENT_READ_OWN"
  | "TUTOR_DOCUMENT_CREATE"
  | "TUTOR_DOCUMENT_UPDATE_OWN"
  | "TUTOR_DOCUMENT_DELETE_OWN"
  | "TUTOR_DOCUMENT_READ_ANY"
  | "TUTOR_DOCUMENT_APPROVE"
  | "CHILD_READ_OWN"
  | "CHILD_CREATE"
  | "CHILD_UPDATE_OWN"
  | "CHILD_DELETE_OWN"
  | "CHILD_READ_ANY"
  | "COURSE_READ"
  | "COURSE_CREATE"
  | "COURSE_UPDATE"
  | "COURSE_DELETE"
  | "LESSON_READ_OWN"
  | "LESSON_READ_ANY"
  | "LESSON_CREATE"
  | "LESSON_UPDATE"
  | "QUOTATION_READ"
  | "QUOTATION_CREATE"
  | "INVOICE_READ"
  | "INVOICE_CREATE"
  | "ADMIN_DASHBOARD"
  | "STAFF_DASHBOARD"
  | "USER_MANAGEMENT";
```

### 5.4 權限映射

```typescript
const PERMISSIONS: Record<Permission, UserRole[]> = {
  USER_PROFILE_READ_OWN: [
    "USER",
    "TUTOR",
    "PARENT",
    "STUDENT",
    "STAFF",
    "ADMIN",
  ],
  USER_PROFILE_UPDATE_OWN: ["USER", "TUTOR", "PARENT", "STUDENT"],
  USER_PROFILE_READ_ANY: ["STAFF", "ADMIN"],
  USER_PROFILE_UPDATE_ANY: ["ADMIN"],

  TUTOR_DOCUMENT_READ_OWN: ["TUTOR"],
  TUTOR_DOCUMENT_CREATE: ["TUTOR"],
  TUTOR_DOCUMENT_APPROVE: ["STAFF", "ADMIN"],
  // ... 其他權限
};
```

### 5.5 權限檢查函式

```typescript
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  isRoleAtLeast,
  isAdmin,
  isStaffOrAdmin,
  isTutor,
} from "@/lib/rbac/permissions";

// 檢查單一權限
if (hasPermission(user.role, "USER_PROFILE_UPDATE_OWN")) {
  // 允許編輯
}

// 檢查任一權限
if (hasAnyPermission(user.role, ["COURSE_CREATE", "COURSE_UPDATE"])) {
  // 允許操作
}

// 檢查角色層級
if (isRoleAtLeast(user.role, "STAFF")) {
  // 職員或以上
}
```

### 5.6 Client-side Hook

**檔案**: `hooks/usePermission.ts`

```typescript
import { usePermission } from "@/hooks/usePermission";

function MyComponent() {
  const {
    role,
    roleLabel,
    isLoading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isRoleAtLeast,
    isAdmin,
    isStaffOrAdmin,
    isTutor,
  } = usePermission();

  if (isLoading) return <Loading />;

  if (!hasPermission("COURSE_CREATE")) {
    return <AccessDenied />;
  }

  return <CourseForm />;
}
```

### 5.7 PermissionGate 組件

**檔案**: `components/auth/PermissionGate.tsx`

聲明式權限控制：

```tsx
import { PermissionGate } from "@/components/auth/PermissionGate";

// 單一權限
<PermissionGate permission="COURSE_CREATE">
  <CreateCourseButton />
</PermissionGate>

// 多權限（任一）
<PermissionGate permissions={["COURSE_CREATE", "COURSE_UPDATE"]} requireAll={false}>
  <CourseActions />
</PermissionGate>

// 多權限（全部）
<PermissionGate permissions={["ADMIN_DASHBOARD", "USER_MANAGEMENT"]} requireAll={true}>
  <AdminPanel />
</PermissionGate>

// 角色層級
<PermissionGate minRole="STAFF">
  <StaffContent />
</PermissionGate>

// 自定義 Fallback
<PermissionGate permission="ADMIN_DASHBOARD" fallback={<NoAccess />}>
  <AdminContent />
</PermissionGate>
```

### 5.8 Middleware 路由保護

**檔案**: `middleware.ts`

根據角色保護特定路由：

| 路由                | 允許角色            |
| ------------------- | ------------------- |
| `/dashboard/admin`  | ADMIN               |
| `/dashboard/staff`  | STAFF, ADMIN        |
| `/dashboard/tutor`  | TUTOR, STAFF, ADMIN |
| `/dashboard/school` | STAFF, ADMIN        |

---

## 6. SWR 整合

### 6.1 SWR Provider

**檔案**: `context/SWRProvider.tsx`

已整合到 `app/(private)/layout.tsx`。

### 6.2 SWR 配置

**檔案**: `lib/client/swr-config.ts`

```typescript
const swrConfig: SWRConfiguration = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  shouldRetryOnError: true,
  errorRetryCount: 3,
  dedupingInterval: 2000,
};
```

### 6.3 用戶資料 Hooks

**檔案**: `hooks/useUserProfile.ts`

| Hook                | 用途         | API 端點                       |
| ------------------- | ------------ | ------------------------------ |
| `useUserProfile`    | 獲取用戶資料 | GET /api/user/profile          |
| `useUpdateProfile`  | 更新用戶資料 | PATCH /api/user/profile        |
| `useUserAddress`    | 獲取地址     | GET /api/user/address          |
| `useUpdateAddress`  | 更新地址     | PUT /api/user/address          |
| `useDeleteAddress`  | 刪除地址     | DELETE /api/user/address       |
| `useUserBank`       | 獲取銀行資料 | GET /api/user/bank             |
| `useUpdateBank`     | 更新銀行資料 | PUT /api/user/bank             |
| `useDeleteBank`     | 刪除銀行資料 | DELETE /api/user/bank          |
| `useUserChildren`   | 獲取學員列表 | GET /api/user/children         |
| `useCreateChild`    | 新增學員     | POST /api/user/children        |
| `useUpdateChild`    | 更新學員     | PUT /api/user/children         |
| `useDeleteChild`    | 刪除學員     | DELETE /api/user/children      |
| `useChangePassword` | 修改密碼     | POST /api/auth/change-password |

### 使用範例

```typescript
import { useUserProfile, useUpdateProfile } from "@/hooks/useUserProfile";

function ProfilePage() {
  const { profile, isLoading, isError, mutate } = useUserProfile();
  const { isSubmitting, submit } = useUpdateProfile(() => {
    // onSuccess callback
    closeModal();
  });

  if (isLoading) return <Loading />;
  if (isError) return <Error />;

  const handleSave = async (data: UserInfoFormData) => {
    await submit(data);
  };

  return <ProfileForm data={profile} onSave={handleSave} />;
}
```

---

## 7. 依賴套件

| 套件                  | 版本   | 用途           |
| --------------------- | ------ | -------------- |
| `swr`                 | 2.4.0  | 資料獲取與快取 |
| `sonner`              | 2.0.7  | Toast 通知     |
| `react-hook-form`     | 7.71.1 | 表單管理       |
| `@hookform/resolvers` | 5.2.2  | Zod 整合       |
| `zod`                 | 4.3.6  | Schema 驗證    |

---

## 8. Layout Provider 順序

`app/(private)/layout.tsx` 中的 Provider 嵌套順序：

```tsx
<SessionProvider>
  <SWRProvider>
    <AuthProvider>
      <TenantProvider>
        <PermissionProvider>
          <ThemeProvider>
            <TenantThemeProvider>
              <SidebarProvider>{children}</SidebarProvider>
            </TenantThemeProvider>
          </ThemeProvider>
        </PermissionProvider>
      </TenantProvider>
    </AuthProvider>
  </SWRProvider>
  <Toaster />
</SessionProvider>
```

---

## 9. 待辦事項

- [ ] 導師文件上傳組件整合
- [ ] 文件預覽/下載功能
- [ ] 文件狀態自動更新（Cron Job）
