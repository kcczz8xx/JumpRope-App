# 會話交接文檔

> **日期**：2026-02-02
> **狀態**：Phase 3 + Phase 4 完成（整體 69%）

---

## 當前任務概述

正在執行「開發檢查清單」(`docs/用戶資料/DEVELOPMENT_CHECKLIST.md`)。

---

## 本次會話完成的工作

### 1. UserChangePasswordModal 整合

| 檔案                                                          | 變更                                                       |
| ------------------------------------------------------------- | ---------------------------------------------------------- |
| `hooks/useUserProfile.ts`                                     | 新增 `useChangePassword()` Hook                            |
| `components/feature/user/profile/UserChangePasswordModal.tsx` | 重構使用 react-hook-form + zodResolver + useChangePassword |
| `app/api/auth/change-password/route.ts`                       | 整合 `checkAuth` 權限檢查                                  |

### 2. /api/user/tutor/document 權限整合

| 檔案                                   | 變更                                       |
| -------------------------------------- | ------------------------------------------ |
| `app/api/user/tutor/document/route.ts` | GET/POST/PUT/DELETE 整合 `checkPermission` |

權限映射：

- GET: `TUTOR_DOCUMENT_READ_OWN` / `TUTOR_DOCUMENT_READ_ANY`（STAFF/ADMIN 可讀取任意用戶）
- POST: `TUTOR_DOCUMENT_CREATE`
- PUT: `TUTOR_DOCUMENT_UPDATE_OWN`
- DELETE: `TUTOR_DOCUMENT_DELETE_OWN`

### 3. UserChildrenCard SWR 整合

| 檔案                                                     | 變更                                                                                 |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `app/api/user/children/route.ts`                         | **新建** - 學員資料 CRUD API                                                         |
| `hooks/useUserProfile.ts`                                | 新增 `useUserChildren()`, `useCreateChild()`, `useUpdateChild()`, `useDeleteChild()` |
| `components/feature/user/profile/UserChildrenCard.tsx`   | 重構使用 SWR Hooks                                                                   |
| `components/feature/user/profile/ProfilePageContent.tsx` | 更新 children prop + 加入權限判斷                                                    |

### 3. API 權限檢查整合

| API                         | 權限                                                                                             |
| --------------------------- | ------------------------------------------------------------------------------------------------ |
| `/api/user/profile`         | GET: `USER_PROFILE_READ_OWN`, PATCH: `USER_PROFILE_UPDATE_OWN`                                   |
| `/api/user/address`         | GET/PUT/DELETE: `USER_PROFILE_READ_OWN` / `USER_PROFILE_UPDATE_OWN`                              |
| `/api/user/bank`            | GET/PUT/DELETE: `USER_PROFILE_READ_OWN` / `USER_PROFILE_UPDATE_OWN`                              |
| `/api/user/children`        | GET: `CHILD_READ_OWN`, POST: `CHILD_CREATE`, PUT: `CHILD_UPDATE_OWN`, DELETE: `CHILD_DELETE_OWN` |
| `/api/auth/change-password` | POST: `checkAuth`（只需登入）                                                                    |

### 4. 學員資料顯示邏輯修復

`ProfilePageContent.tsx` 加入權限判斷：

- 使用 `usePermission` hook
- `can("CHILD_READ_OWN")` 判斷是否顯示 `UserChildrenCard`
- 只有 `PARENT` 和 `USER` 角色才能看到學員資料

---

## 已完成的工作總覽

### Phase 1-2: 基礎建設與 RBAC（~88%）

- `lib/api-client.ts` - API Client Wrapper
- `lib/toast.ts` - Toast 通知系統
- `lib/swr-config.ts` + `context/SWRProvider.tsx` - SWR 配置
- `lib/validations/user.ts` - Zod Schema
- `hooks/useFormSubmit.ts` - 防重複提交 Hook
- `hooks/usePermission.ts` - 權限 Hook
- `hooks/useUserProfile.ts` - 用戶資料 SWR Hooks
- `lib/rbac/` - RBAC 權限系統
- `components/auth/PermissionGate.tsx` - 權限 Gate 組件

### Phase 3: API 權限檢查（100%） ✅

- `/api/user/profile` - GET/PATCH 使用 `checkPermission`
- `/api/user/address` - GET/PUT/DELETE 使用 `checkPermission`
- `/api/user/bank` - GET/PUT/DELETE 使用 `checkPermission`
- `/api/user/children` - GET/POST/PUT/DELETE 使用 `checkPermission`
- `/api/user/tutor/document` - GET/POST/PUT/DELETE 使用 `checkPermission`
- `/api/auth/change-password` - POST 使用 `checkAuth`

### Phase 4: SWR 整合（100%） ✅

- **已完成的修改：**
  | 檔案 | 變更 |
  | -------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
  | `components/feature/user/profile/UserInfoCard.tsx` | 重構使用 `useUpdateProfile()` |
  | `components/feature/user/profile/UserAddressCard.tsx` | 重構使用 `useUpdateAddress()` + `useDeleteAddress()` |
  | `components/feature/user/profile/UserBankCard.tsx` | 重構使用 `useUpdateBank()` + `useDeleteBank()` |
  | `components/feature/user/profile/UserChildrenCard.tsx` | 重構使用 `useUserChildren()` + `useCreateChild()` + `useUpdateChild()` + `useDeleteChild()` |
  | `components/feature/user/profile/UserChangePasswordModal.tsx` | 重構使用 react-hook-form + zodResolver + `useChangePassword()` |
  | `components/feature/user/profile/ProfilePageContent.tsx` | 客戶端組件整合 SWR |
  | `app/(private)/dashboard/(user)/profile/page.tsx` | 使用 `ProfilePageContent` |
  | `app/api/user/children/route.ts` | **新建** - 學員資料 CRUD API |
  | `hooks/useUserProfile.ts` | 新增學員資料 Hooks + `useChangePassword()` |

**生成的文檔：**

- `docs/用戶資料/DEVELOPMENT_CHECKLIST.md` - 開發檢查清單（已更新進度）
- `docs/用戶資料/PHASE4_SWR_INTEGRATION.md` - Phase 4 技術文檔
- `docs/用戶資料/PROFILE_API_FIX.md` - Profile API 修復總結

---

## 待完成的工作

### Phase 5: 導師文件管理（0%）

- 文件上傳組件（FileUploadArea）
- 文件編輯 Modal（TutorDocumentEditModal）
- 文件列表與預覽（DocumentTable）
- 文件狀態自動更新（Cron Job）

---

## 關鍵檔案路徑

```
hooks/useUserProfile.ts          # 用戶資料 SWR Hooks（已完成）
lib/rbac/check-permission.ts     # Server-side 權限檢查（已完成）
lib/validations/user.ts          # Zod Schema（已完成）

components/feature/user/profile/
├── ProfilePageContent.tsx       # 客戶端組件（新建）
├── UserInfoCard.tsx             # 已整合 SWR
├── UserAddressCard.tsx          # 已整合 SWR
├── UserBankCard.tsx             # 已整合 SWR
├── UserChildrenCard.tsx         # 已整合 SWR
└── UserChildEditModal.tsx       # 已整合 SWR

docs/用戶資料/
├── DEVELOPMENT_CHECKLIST.md     # 開發檢查清單（主要參考）
├── PHASE4_SWR_INTEGRATION.md    # Phase 4 技術文檔
├── API_INTEGRATION.md           # API 整合說明
└── README.md                    # 模組總覽
```

---

## 整體進度

| Phase                 | 進度    |
| --------------------- | ------- |
| Phase 1: 基礎建設     | 89%     |
| Phase 2: RBAC 權限    | 88%     |
| Phase 3: API 權限檢查 | 100% ✅ |
| Phase 4: Modal 整合   | 100% ✅ |
| Phase 5-8             | 0%      |
| **總計**              | **69%** |

---

## 用戶偏好

- 使用繁體中文回答
- 輸出完整代碼，不要省略
- 不生成測試腳本
- 不編譯/運行，用戶自己執行
- 結束前使用 `深談.zhi` 工具詢問

---

## 下一步建議

用戶可選擇：

1. 開始 Phase 5：導師文件管理
2. 開始 Phase 6：測試
3. 開始 Phase 1-2 剩餘項目：Middleware 路由保護
