# 開發檢查清單 (Development Checklist)

> **最後更新**：2026-02-02

## 概述

本清單配合「API 整合與 RBAC 權限控制」文檔，用於檢查系統整合進度與品質控制。

---

## 📋 Phase 1: 基礎建設檢查

### 1.1 核心工具與配置

- [x] **API Client Wrapper** (`lib/api-client.ts`) ✅

  - [x] 實作 `api.get<T>(url)` 方法
  - [x] 實作 `api.post<T>(url, data)` 方法
  - [x] 實作 `api.put<T>(url, data)` 方法
  - [x] 實作 `api.patch<T>(url, data)` 方法
  - [x] 實作 `api.delete<T>(url)` 方法
  - [x] 實作 `api.upload<T>(url, formData)` 方法
  - [x] 統一錯誤處理（網絡錯誤、HTTP 錯誤、JSON 解析錯誤）
  - [x] 返回類型安全的 `ApiResult<T>`
  - [ ] 測試：成功情境、404、500、網絡斷線

- [x] **Toast 通知系統** (`lib/toast.ts`) ✅

  - [x] 安裝 `sonner`：`pnpm add sonner`
  - [x] 實作 `toast.success()`, `toast.error()`, `toast.info()`, `toast.warning()`, `toast.loading()`
  - [x] 建立 `components/ui/Toaster.tsx`
  - [x] 整合到 `app/(private)/layout.tsx`（在最外層，SessionProvider 之後）
  - [ ] 測試：在不同頁面觸發 toast，確認顯示正常

- [x] **SWR 配置** (`lib/swr-config.ts`) ✅

  - [x] 安裝 `swr`：`pnpm add swr`
  - [x] 定義全局 SWR 配置（revalidateOnFocus, errorRetryCount 等）
  - [x] 建立 `context/SWRProvider.tsx`
  - [x] 整合到 `app/(private)/layout.tsx`（SessionProvider 之後，其他 Provider 之前）
  - [ ] 測試：確認 SWR devtools 可用（開發環境）

- [x] **Zod 驗證 Schema** (`lib/validations/`) ✅
  - [x] 安裝：`pnpm add zod @hookform/resolvers`
  - [x] 建立 `lib/validations/index.ts`（統一導出）
  - [x] 建立 `lib/validations/user.ts`
    - [x] `userInfoSchema`（稱呼、姓名、電話、電郵、性別等）
    - [x] `userAddressSchema`（地域、地區、詳細地址）
    - [x] `userBankSchema`（銀行、戶口號碼、FPS 等）
    - [x] `userChildSchema`（中英文名、出生年份、學校、性別）
    - [x] `changePasswordSchema`（舊密碼、新密碼、確認密碼）
  - [x] 建立 `lib/validations/tutor-document.ts`
    - [x] `tutorDocumentSchema`（文件類型、名稱、日期等）
  - [ ] 測試：用 `safeParse()` 驗證正確與錯誤的資料

### 1.2 自訂 Hooks

- [x] **useFormSubmit Hook** (`hooks/useFormSubmit.ts`) ✅

  - [x] 實作 `useFormSubmit<TData, TResult>`
    - [x] 防重複提交（`isSubmitting` state）
    - [x] 錯誤處理（`onError` callback）
    - [x] 成功處理（`onSuccess` callback）
    - [x] 自動顯示 Toast（可選）
  - [x] 實作 `useAsyncSubmit<TResult>`（更靈活的版本）
  - [ ] 測試：提交成功、提交失敗、連續點擊（應被防止）

- [x] **usePermission Hook** (`hooks/usePermission.ts`) ✅

  - [x] 從 `useSession()` 取得 `user.role`
  - [x] 提供 `hasPermission(permission)` 函式（`can()`）
  - [x] 提供 `hasAnyPermission(permissions[])` 函式（`canAny()`）
  - [x] 提供 `hasAllPermissions(permissions[])` 函式（`canAll()`）
  - [x] 提供 `isRoleAtLeast(minRole)` 函式（`isAtLeast()`）
  - [x] 提供便利函式：`isAdmin`, `isStaffOrAdmin`, `isTutor`
  - [x] 返回 `roleLabel`（中文角色名稱）
  - [x] 處理 loading state（session 未載入時）
  - [ ] 測試：不同角色登入，檢查權限判斷正確性

- [x] **useUserProfile Hooks** (`hooks/useUserProfile.ts`) ✅
  - [x] `useUserProfile()` - GET `/api/user/profile`
  - [x] `useUpdateProfile()` - PATCH `/api/user/profile`
  - [x] `useUserAddress()` - GET `/api/user/address`
  - [x] `useUpdateAddress()` - PUT `/api/user/address`
  - [x] `useDeleteAddress()` - DELETE `/api/user/address`
  - [x] `useUserBank()` - GET `/api/user/bank`
  - [x] `useUpdateBank()` - PUT `/api/user/bank`
  - [x] `useDeleteBank()` - DELETE `/api/user/bank`
  - [x] `useUserChildren()` - GET `/api/user/children`
  - [x] `useCreateChild()` - POST `/api/user/children`
  - [x] `useUpdateChild()` - PUT `/api/user/children`
  - [x] `useDeleteChild()` - DELETE `/api/user/children`
  - [x] `useChangePassword()` - POST `/api/auth/change-password`

---

## 📋 Phase 2: RBAC 權限系統

### 2.1 權限定義與檢查

- [x] **RBAC 類型與常數** (`lib/rbac/`) ✅

  - [x] `lib/rbac/index.ts`（統一導出）
  - [x] `lib/rbac/types.ts`
    - [x] 定義 `UserRole` 類型（與 Prisma Enum 一致）
    - [x] 定義 `Permission` 類型（所有權限的聯合類型）
  - [x] `lib/rbac/permissions.ts`
    - [x] 定義 `ROLE_HIERARCHY`（角色層級數字）
    - [x] 定義 `ROLE_LABELS`（中文標籤）
    - [x] 定義 `PERMISSIONS`（權限映射表）
    - [x] 實作 `hasPermission(role, permission)`
    - [x] 實作 `hasAnyPermission(role, permissions[])`
    - [x] 實作 `hasAllPermissions(role, permissions[])`
    - [x] 實作 `isRoleAtLeast(role, minRole)`
    - [x] 實作便利函式：`isAdmin(role)`, `isStaffOrAdmin(role)`, `isTutor(role)`
  - [ ] 測試：每個角色的權限組合正確

- [x] **Server-side 權限檢查** (`lib/rbac/check-permission.ts`) ✅
  - [x] 實作 `checkPermission(permission)`
    - [x] 使用 `auth()` 取得 session
    - [x] 檢查是否登入（未登入拋出錯誤）
    - [x] 檢查權限（權限不足拋出錯誤）
    - [x] 返回 AuthResult（供後續使用）
  - [x] 實作 `checkOwnership()`、`checkPermissionWithOwnership()`
    - [x] 檢查資源是否屬於當前用戶
    - [x] ADMIN 可跳過檢查
  - [ ] 測試：API Route 中測試各種角色與權限組合

### 2.2 前端權限組件

- [x] **PermissionGate 組件** (`components/auth/PermissionGate.tsx`) ✅
  - [x] 支援單一權限：`<PermissionGate permission="...">`
  - [x] 支援多權限（任一）：`<PermissionGate permissions={[...]} requireAll={false}>`
  - [x] 支援多權限（全部）：`<PermissionGate permissions={[...]} requireAll={true}>`
  - [x] 支援角色：`<PermissionGate role="STAFF">` 或 `roles={[...]}`
  - [x] 支援自訂 fallback：`<PermissionGate fallback={<NoAccess />}>`
  - [x] 處理 loading state（session 未載入時顯示 skeleton）
  - [x] 額外組件：`RequireAuth`, `RequireRole`, `RequireAdmin`, `RequireStaff`
  - [ ] 測試：不同權限組合、不同角色登入

### 2.3 Middleware 路由保護

- [ ] **更新 Middleware** (`middleware.ts`)
  - [ ] 基礎驗證：未登入重導向 `/auth/signin`
  - [ ] 保護 `/dashboard/admin` - 只允許 ADMIN
  - [ ] 保護 `/dashboard/staff` - 允許 STAFF, ADMIN
  - [ ] 保護 `/dashboard/tutor` - 允許 TUTOR, STAFF, ADMIN
  - [ ] 保護 `/dashboard/school` - 允許 STAFF, ADMIN
  - [ ] 測試：不同角色訪問受保護路由，確認重導向正確

---

## 📋 Phase 3: API Route 權限檢查

### 3.1 用戶資料 API

- [x] **`/api/user/profile`** (`app/api/user/profile/route.ts`) ✅

  - [x] `GET` 方法
    - [x] 使用 `checkPermission('USER_PROFILE_READ_OWN')`
    - [x] 一般用戶只能讀取自己的資料
    - [ ] STAFF/ADMIN 可讀取任何用戶（需傳 `userId` query parameter）
    - [ ] 測試：USER 讀取自己、USER 嘗試讀取別人（應失敗）、ADMIN 讀取任何人
  - [x] `PATCH` 方法
    - [x] 使用 `checkPermission('USER_PROFILE_UPDATE_OWN')`
    - [ ] 驗證 request body（使用 `userInfoSchema.safeParse()`）
    - [x] 一般用戶只能更新自己
    - [ ] ADMIN 可更新任何用戶
    - [ ] 測試：成功更新、驗證失敗、權限不足

- [x] **`/api/user/address`** (`app/api/user/address/route.ts`) ✅

  - [x] `GET` - 權限檢查 `USER_PROFILE_READ_OWN`
  - [x] `PUT` - 權限檢查 `USER_PROFILE_UPDATE_OWN`
  - [x] `DELETE` - 權限檢查 + 確認用戶有地址資料才刪除
  - [ ] 測試：CRUD 操作 + 權限檢查

- [x] **`/api/user/bank`** (`app/api/user/bank/route.ts`) ✅
  - [x] `GET` - 權限檢查 `USER_PROFILE_READ_OWN`
  - [x] `PUT` - 權限檢查 `USER_PROFILE_UPDATE_OWN`
  - [x] `DELETE` - 權限檢查 + 確認用戶有資料才刪除
  - [ ] 測試：敏感資料不外洩（前端遮蔽部分資料）

### 3.2 導師文件 API

- [x] **`/api/user/tutor/document`** (`app/api/user/tutor/document/route.ts`) ✅
  - [x] `GET` - 列出所有文件
    - [x] 權限：`TUTOR_DOCUMENT_READ_OWN`（自己）或 `TUTOR_DOCUMENT_READ_ANY`（STAFF/ADMIN）
    - [ ] 測試：TUTOR 讀自己、STAFF 讀任何人
  - [x] `POST` - 上傳新文件
    - [x] 權限：`TUTOR_DOCUMENT_CREATE`
    - [x] 驗證 FormData（`tutorDocumentSchema`）
    - [x] 檔案驗證（類型、大小）
    - [x] 上傳到 Vercel Blob
    - [x] 儲存 `documentUrl` 到資料庫
    - [ ] 測試：成功上傳、檔案過大、格式錯誤
  - [x] `PUT` - 更新現有文件
    - [x] 權限：`TUTOR_DOCUMENT_UPDATE_OWN`（自己）或 `TUTOR_DOCUMENT_APPROVE`（審核）
    - [x] 如果有新檔案，刪除舊檔案
    - [ ] 測試：更新 metadata、更新檔案
  - [x] `DELETE` - 刪除文件
    - [x] 權限：`TUTOR_DOCUMENT_DELETE_OWN`
    - [x] 從 Vercel Blob 刪除檔案
    - [x] 從資料庫刪除記錄
    - [ ] 測試：成功刪除、檔案不存在

---

## 📋 Phase 4: Modal 組件整合

### 4.1 用戶資料 Modal

- [x] **UserInfoEditModal** (`components/feature/user/profile/UserInfoEditModal.tsx`) ✅

  - [x] 整合 `react-hook-form` + `zodResolver(userInfoSchema)`
  - [x] Card 組件使用 `useUpdateProfile()` Hook
  - [x] 顯示 loading state（`isSubmitting`）
  - [x] 成功後關閉 Modal + 顯示 Toast
  - [x] 錯誤處理 + 顯示錯誤訊息
  - [ ] 測試：成功編輯、驗證錯誤、API 錯誤

- [x] **UserAddressEditModal** (`components/feature/user/profile/UserAddressEditModal.tsx`) ✅

  - [x] Card 組件使用 `useUpdateAddress()` Hook
  - [x] 香港十八區選單（Region → District）
  - [ ] 測試：成功編輯、選單互動

- [x] **UserBankEditModal** (`components/feature/user/profile/UserBankEditModal.tsx`) ✅

  - [x] Card 組件使用 `useUpdateBank()` Hook
  - [x] FPS 啟用/停用切換
  - [ ] 測試：成功編輯

- [x] **UserChildEditModal** (`components/feature/user/profile/UserChildEditModal.tsx`) ✅

  - [x] 支援編輯模式（僅可修改學校欄位）
  - [x] 整合 SWR Hooks

- [x] **UserChangePasswordModal** (`components/feature/user/profile/UserChangePasswordModal.tsx`) ✅
  - [x] 整合 `changePasswordSchema`
  - [x] 呼叫 `/api/auth/change-password`
  - [x] 驗證舊密碼正確性
  - [x] 新密碼強度提示
  - [ ] 測試：成功修改、舊密碼錯誤、新密碼過弱

### 4.2 Card 組件整合

- [x] **UserInfoCard** (`components/feature/user/profile/UserInfoCard.tsx`) ✅

  - [x] 使用 `useUpdateProfile()` Hook
  - [x] 開啟 `UserInfoEditModal`
  - [x] 編輯成功後自動更新顯示（透過 SWR `mutate`）
  - [ ] 測試：資料正確顯示、編輯流程順暢

- [x] **UserAddressCard** (`components/feature/user/profile/UserAddressCard.tsx`) ✅

  - [x] 使用 `useUpdateAddress()` + `useDeleteAddress()` Hook
  - [x] 整合編輯與刪除功能
  - [ ] 測試：無地址時顯示空狀態、編輯後更新

- [x] **UserBankCard** (`components/feature/user/profile/UserBankCard.tsx`) ✅

  - [x] 使用 `useUpdateBank()` + `useDeleteBank()` Hook
  - [ ] 遮蔽敏感資料（戶口號碼顯示部分）
  - [ ] 測試：安全性檢查

- [x] **UserChildrenCard** (`components/feature/user/profile/UserChildrenCard.tsx`) ✅
  - [x] 使用 `useUserChildren()` Hook
  - [x] 列表顯示所有學員
  - [x] 編輯功能整合 SWR（僅限學校欄位）

### 4.3 ProfilePageContent 整合 ✅

- [x] **ProfilePageContent** (`components/feature/user/profile/ProfilePageContent.tsx`) - 新建
  - [x] 使用 `useUserProfile()`, `useUserAddress()`, `useUserBank()` 獲取資料
  - [x] 接收伺服器端 `initialData` 作為初始值
  - [x] SWR 資料更新時自動切換顯示

---

## 📋 Phase 5: 導師文件管理

### 5.1 文件上傳組件

- [ ] **FileUploadArea** (`components/feature/user/profile/tutor-documents/FileUploadArea.tsx`)

  - [ ] 拖放上傳功能
  - [ ] 點擊選擇檔案
  - [ ] 前端驗證（檔案類型、大小）
  - [ ] 上傳進度顯示（Progress Bar）
  - [ ] 錯誤提示（格式錯誤、檔案過大）
  - [ ] 測試：拖放上傳、點擊上傳、多檔上傳（應限制）

- [ ] **TutorDocumentEditModal** (`components/feature/user/profile/tutor-documents/TutorDocumentEditModal.tsx`)
  - [ ] 支援 `mode: 'create' | 'edit'`
  - [ ] 整合 `tutorDocumentSchema` 驗證
  - [ ] CREATE：上傳檔案 + metadata
  - [ ] EDIT：更新 metadata（可選擇更新檔案）
  - [ ] 日期選擇器（簽發日期、到期日期）
  - [ ] 「永久有效」選項（到期日期為 null）
  - [ ] 測試：新增文件、編輯 metadata、替換檔案

### 5.2 文件列表與預覽

- [ ] **DocumentTable** (`components/feature/user/profile/tutor-documents/DocumentTable.tsx`)

  - [ ] 列出所有文件（按 Tab 分類）
  - [ ] 狀態標籤（VALID / EXPIRED / EXPIRING_SOON / PENDING）
  - [ ] 編輯按鈕（開啟 `TutorDocumentEditModal`）
  - [ ] 刪除按鈕（確認對話框）
  - [ ] 預覽/下載按鈕
  - [ ] 測試：不同狀態顯示、操作按鈕

- [ ] **FilePreview 組件**（新建）
  - [ ] PDF：iframe 預覽
  - [ ] 圖片：Lightbox 放大
  - [ ] 下載按鈕
  - [ ] 測試：不同檔案類型

### 5.3 文件狀態自動更新

- [ ] **Cron Job / Background Task**
  - [ ] 選擇方案：Vercel Cron Jobs 或 Inngest
  - [ ] 每日檢查所有 `TutorDocument.expiryDate`
  - [ ] 更新 `status` 欄位
    - [ ] 已過期：`EXPIRED`
    - [ ] 30 天內到期：`EXPIRING_SOON`
    - [ ] 有效：`VALID`
  - [ ] （可選）發送提醒通知
  - [ ] 測試：手動觸發、檢查資料庫更新正確

---

## 📋 Phase 6: 測試與品質控制

### 6.1 單元測試

- [ ] **API Client 測試**

  - [ ] 成功請求
  - [ ] HTTP 錯誤（404, 500）
  - [ ] 網絡錯誤
  - [ ] 超時處理

- [ ] **權限函式測試**

  - [ ] `hasPermission()` - 各角色與權限組合
  - [ ] `isRoleAtLeast()` - 層級比較
  - [ ] `checkPermission()` - 未登入、權限不足

- [ ] **Zod Schema 測試**
  - [ ] 正確資料通過驗證
  - [ ] 錯誤資料返回正確錯誤訊息

### 6.2 整合測試

- [ ] **API Route 測試**

  - [ ] 使用 Postman / Thunder Client 測試所有端點
  - [ ] 測試不同角色的權限
  - [ ] 測試資料驗證（正確與錯誤資料）
  - [ ] 測試錯誤處理（500 錯誤、資料庫錯誤）

- [ ] **前端整合測試**
  - [ ] 登入不同角色帳號
  - [ ] 測試所有 Modal 的編輯、新增、刪除流程
  - [ ] 測試權限控制（應該看不到的按鈕是否隱藏）
  - [ ] 測試 Toast 通知顯示正確

### 6.3 E2E 測試（可選）

- [ ] 使用 Playwright / Cypress
- [ ] 測試完整用戶流程
  - [ ] 登入 → 編輯資料 → 上傳文件 → 登出
  - [ ] 不同角色訪問受限頁面

---

## 📋 Phase 7: 效能與安全性

### 7.1 效能優化

- [ ] **SWR 快取策略**

  - [ ] 設定合理的 `dedupingInterval`
  - [ ] 重要資料設定 `revalidateOnMount`
  - [ ] 不常變動的資料設定較長的 cache time

- [ ] **圖片優化**

  - [ ] 使用 Next.js `<Image>` 組件
  - [ ] 壓縮上傳的圖片（client-side 或 server-side）
  - [ ] 設定 CDN（Vercel 自動處理）

- [ ] **檔案上傳優化**
  - [ ] 限制並發上傳數量（3-5 個）
  - [ ] 大檔案分塊上傳（如果需要）
  - [ ] 上傳失敗自動重試（最多 3 次）

### 7.2 安全性檢查

- [ ] **API 安全**

  - [ ] 所有 API Route 都有權限檢查
  - [ ] 敏感資料加密儲存（passwordHash 已用 bcrypt）
  - [ ] 防止 SQL Injection（Prisma 已處理）
  - [ ] Rate Limiting 已啟用（`lib/rate-limit.ts`）

- [ ] **檔案上傳安全**

  - [ ] MIME type 白名單驗證
  - [ ] 檔案大小限制（前後端雙重檢查）
  - [ ] 檔案名 sanitization（已實作）
  - [ ] 病毒掃描（可選，使用 ClamAV 或第三方服務）

- [ ] **前端安全**
  - [ ] XSS 防護（React 自動處理）
  - [ ] CSRF 防護（NextAuth 已處理）
  - [ ] 敏感資料遮蔽（身份證、銀行戶口號碼）

---

## 📋 Phase 8: 文檔與部署

### 8.1 文檔更新

- [ ] 更新 `README.md`

  - [ ] 標記所有項目為 ✅ 已完成
  - [ ] 更新依賴套件版本
  - [ ] 更新環境變數說明

- [ ] 更新 `DEVELOPMENT_GUIDE.md`

  - [ ] 標記開發順序表所有項目為 ✅
  - [ ] 新增 API 整合說明
  - [ ] 新增權限控制說明

- [ ] 建立 API 文檔（可選）
  - [ ] 使用 Swagger / OpenAPI
  - [ ] 或建立簡單的 Markdown 文檔

### 8.2 環境變數檢查

- [ ] `.env.local` 包含所有必要變數

  - [ ] `AUTH_SECRET`
  - [ ] `DATABASE_URL`
  - [ ] `NEXT_PUBLIC_APP_URL`
  - [ ] `BLOB_READ_WRITE_TOKEN`
  - [ ] （預留）`SMTP_*` 變數
  - [ ] （預留）`SMS_*` 變數

- [ ] Vercel 環境變數設定
  - [ ] Production 環境
  - [ ] Preview 環境（可選）

### 8.3 部署前檢查

- [ ] **資料庫**

  - [ ] Production Migration 已執行
  - [ ] 資料庫備份策略已設定
  - [ ] 索引優化（phone, memberNumber, email）

- [ ] **Vercel 設定**

  - [ ] Build 成功
  - [ ] 環境變數正確
  - [ ] Cron Jobs 設定（文件狀態更新）

- [ ] **監控與日誌**
  - [ ] 設定 Sentry（錯誤追蹤）
  - [ ] 設定 Vercel Analytics（流量監控）
  - [ ] 設定 Prisma Insights（資料庫效能）

---

## 📊 進度追蹤

### 總覽

| Phase                 | 狀態    |
| --------------------- | ------- |
| Phase 1: 基礎建設     | ✅ 完成 |
| Phase 2: RBAC 權限    | ✅ 完成 |
| Phase 3: API 權限檢查 | ✅ 完成 |
| Phase 4: Modal 整合   | ✅ 完成 |
| Phase 5: 文件管理     | ⏳ 待做 |
| Phase 6-8: 測試/部署  | ⏳ 待做 |

### 下一步建議

1. **Phase 5**：導師文件管理（文件上傳、預覽、狀態更新）
2. **Phase 6**：測試（API 測試、前端整合測試）
3. **Phase 7-8**：效能優化與部署準備

---

## 📝 注意事項

1. **逐步推進**：不要一次做太多，每個 Phase 確認無誤才進入下一個
2. **測試先行**：每個功能完成後立即測試，不要累積到最後
3. **文檔同步**：程式碼改動時同步更新文檔
4. **版本控制**：重要節點建立 Git Tag（如 `v1.0-api-integration-complete`）
5. **備份資料**：測試 DELETE 功能前先備份資料庫
