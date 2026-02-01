# 用戶資料模組 - 開發交接文檔

> **最後更新**：2026-02-02

## 當前進度摘要

### ✅ 已完成項目

#### 1. Prisma Schema 設計

- **user.prisma**: `User`, `UserAddress`, `UserBankAccount`, `UserChild`
- **tutor.prisma**: `TutorProfile`, `TutorDocument`（已從 user.prisma 分拆）
- `UserAddress` 新增 `region` 欄位支援香港十八區
- `User` 新增 `passwordHash`, `nickname` 欄位

#### 2. UI 組件（展示卡片）

所有組件位於 `components/feature/user/profile/`：

- `UserMetaCard.tsx` - 用戶頭像與角色
- `UserInfoCard.tsx` - 個人基本資料（已整合 Modal）
- `UserAddressCard.tsx` - 地址（已整合 Modal，支援十八區）
- `UserBankCard.tsx` - 銀行資料（已整合 Modal）
- `UserChildrenCard.tsx` - 學員列表（已整合 Modal，支援新增/編輯/刪除）
- `UserTutorCard.tsx` - 導師文件管理

#### 3. 編輯表單 Modal

- `UserInfoEditModal.tsx`
- `UserAddressEditModal.tsx` - 層級式選單（Region -> District）
- `UserBankEditModal.tsx`
- `UserChildEditModal.tsx` - 支援 create/edit 模式

#### 4. 常數檔案

- `lib/constants/hk-address-data.ts` - 香港十八區資料

#### 5. 認證系統

- **NextAuth.js** 已整合（Credentials Provider）
- **電話格式驗證**：`libphonenumber-js`
- **密碼加密**：bcrypt
- **OTP API**：`/api/auth/otp/send` + `/api/auth/otp/verify`
- **註冊 API**：`/api/auth/register`

---

## 待處理項目（ROADMAP）

### Phase 1: 資料層整合

- [x] 建立 User Prisma Schema
- [x] 執行 Migration
- [x] NextAuth.js 整合
- [x] OTP API 實作
- [ ] **建立 API Route (`/api/user/profile`)**
- [ ] **實作 Server Actions 取得/更新用戶資料**

### Phase 2: 編輯功能

- [x] 所有編輯 Modal 已完成
- [x] Modal 已整合到 Card 組件
- [ ] **實作 Server Actions 更新資料**

### Phase 3: 導師文件管理

- [ ] 文件上傳功能
- [ ] 文件預覽/下載功能
- [ ] 文件狀態自動更新（過期提醒）
- [ ] 新增證書 Modal

### Phase 4: 權限控制

- [ ] 根據用戶角色顯示/隱藏組件
- [ ] 導師專屬區塊權限判斷

---

## Migration 狀態

所有 Migration 已執行完成，包括：

- `add_region_to_user_address`
- `add_password_and_nickname_to_user`

---

## 關鍵檔案位置

```
prisma/schema/
├── user.prisma                    # 用戶相關 Schema
└── tutor.prisma                   # 導師相關 Schema

lib/constants/
└── hk-address-data.ts             # 香港十八區資料

components/feature/user/profile/
├── UserMetaCard.tsx
├── UserInfoCard.tsx
├── UserAddressCard.tsx
├── UserBankCard.tsx
├── UserChildrenCard.tsx
├── UserTutorCard.tsx
├── UserInfoEditModal.tsx
├── UserAddressEditModal.tsx
├── UserBankEditModal.tsx
└── UserChildEditModal.tsx

app/(private)/dashboard/(user)/profile/
└── page.tsx                       # 使用 Mock 數據

docs/用戶資料/
└── README.md                      # 完整開發文檔
```

---

## 注意事項

1. **Mock 數據**: Profile 頁面目前使用 `mockUserData`，需要替換為真實 API
2. **Card 組件 Props**: 所有 Card 組件已支援 `onSave` callback，待接入 Server Actions
3. **地址表單**: 採用層級式選單，先選地域再選十八區
4. **導師 Schema**: 已分拆到 `tutor.prisma`，與 `User` 透過 `TutorProfile.userId` 關聯
5. **電話驗證**: 使用 `libphonenumber-js` 的 `isValidPhoneNumber()` 函數
6. **認證表單**: 詳見 `docs/用戶資料/AUTH_FORMS_SUMMARY.md`
