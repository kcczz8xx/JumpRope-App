# 用戶資料模組 - 開發交接文檔

> **最後更新**：2026-02-02

## 當前進度摘要

### ✅ 已完成項目

#### 1. Prisma Schema 設計

- **user.prisma**: `User`, `UserAddress`, `UserBankAccount`, `UserChild`
- **tutor.prisma**: `TutorProfile`, `TutorDocument`（已從 user.prisma 分拆）
- `UserAddress` 新增 `region` 欄位支援香港十八區
- `User` 新增 `passwordHash`, `nickname` 欄位

#### 2. UI 組件

**詳細組件清單參見**：`docs/用戶資料/README.md`

所有組件位於 `components/feature/user/profile/`，包含：

- 6 個展示卡片（`*Card.tsx`）
- 5 個編輯 Modal（`*EditModal.tsx` + `UserChangePasswordModal.tsx`）
- `tutor-documents/` 子目錄（導師文件管理組件）

#### 4. 常數檔案

- `lib/constants/hk-address-data.ts` - 香港十八區資料

#### 5. 認證系統

- **NextAuth.js** 已整合（Credentials Provider）
- **電話格式驗證**：`libphonenumber-js`
- **密碼加密**：bcrypt
- **OTP API**：`/api/auth/otp/send` + `/api/auth/otp/verify`
- **註冊 API**：`/api/auth/register`
- **密碼重設 API**：`/api/auth/reset-password/*`（send/verify/reset）
- **修改密碼 API**：`/api/auth/change-password`
- **Rate Limiting**：`lib/rate-limit.ts`（防止暴力破解）
- **Middleware**：`middleware.ts`（Dashboard 路由保護）

---

## 待處理項目（ROADMAP）

### Phase 1: 資料層整合

- [x] 建立 User Prisma Schema
- [x] 執行 Migration
- [x] NextAuth.js 整合
- [x] OTP API 實作
- [x] 密碼重設 API 實作
- [x] Rate Limiting 安全強化
- [x] Middleware 路由保護
- [x] 建立 API Route (`/api/user/profile`, `/api/user/address`, `/api/user/bank`)
- [x] 建立導師文件 API (`/api/user/tutor/document`)

### Phase 2: 編輯功能

- [x] 所有編輯 Modal 已完成
- [x] Modal 已整合到 Card 組件
- [x] API Route 已實作（取代 Server Actions）
- [ ] 整合 API 到 Modal 組件

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

**完整檔案結構參見**：`docs/用戶資料/README.md`

```
app/api/auth/           # 認證 API (8 個檔案)
app/api/user/           # 用戶資料 API (4 個檔案)
components/auth/        # 認證表單 (13 個檔案)
components/feature/user/profile/  # 用戶資料組件 (16 個檔案)
lib/auth/               # NextAuth 設定
lib/rate-limit.ts       # Rate Limiting
lib/member-number.ts    # 會員編號生成
prisma/schema/          # Prisma Schema
```

---

## 注意事項

1. **Mock 數據**: Profile 頁面目前使用 `mockUserData`，需要替換為真實 API
2. **Card 組件 Props**: 所有 Card 組件已支援 `onSave` callback，待接入 Server Actions
3. **地址表單**: 採用層級式選單，先選地域再選十八區
4. **導師 Schema**: 已分拆到 `tutor.prisma`，與 `User` 透過 `TutorProfile.userId` 關聯
5. **電話驗證**: 使用 `libphonenumber-js` 的 `isValidPhoneNumber()` 函數
6. **認證表單**: 詳見 `docs/用戶資料/AUTH_FORMS_SUMMARY.md`
