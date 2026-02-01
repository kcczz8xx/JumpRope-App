# 用戶資料模組 - 開發指引

> **最後更新**：2026-02-02

## 概述

本文件為用戶資料模組的開發指引，涵蓋**註冊、登入、資料更新**等功能的實作規劃。

### 核心設計原則

| 項目         | 決策                               |
| ------------ | ---------------------------------- |
| **認證框架** | NextAuth.js                        |
| **登入方式** | 電話號碼/會員編號 + 密碼（無 OTP） |
| **註冊驗證** | 電話 OTP 為主，電郵驗證為後備      |
| **預設角色** | USER（用戶）                       |

---

## 現狀分析

### ✅ 已完成

| 項目              | 說明                                             |
| ----------------- | ------------------------------------------------ |
| **Prisma Schema** | `user.prisma`、`tutor.prisma` 已定義完整資料模型 |
| **UI 組件**       | 6 個展示卡片 + 4 個編輯 Modal                    |
| **Auth 表單**     | 詳見 `AUTH_FORMS_SUMMARY.md`                     |
| **NextAuth.js**   | Credentials Provider 已整合                      |
| **電話驗證**      | `libphonenumber-js` 格式驗證                     |
| **密碼加密**      | bcrypt 加密存儲                                  |
| **OTP API**       | 發送/驗證 API 已完成                             |
| **密碼重設**      | 密碼重設功能已完成                               |

### ⚠️ 待實作

| 項目          | 說明                 |
| ------------- | -------------------- |
| **用戶 CRUD** | Server Actions       |
| **SMS 服務**  | 實際簡訊發送整合     |
| **電郵服務**  | Resend/SendGrid 整合 |

---

## 資料模型

### User Model 欄位

**完整 Schema 參見**：`prisma/schema/user.prisma`

主要欄位：

| 欄位           | 類型      | 說明                                          |
| -------------- | --------- | --------------------------------------------- |
| `memberNumber` | String?   | 會員編號（YYMMTXXXX 格式，可用於登入）        |
| `phone`        | String    | 電話號碼（主要登入帳號，唯一）                |
| `email`        | String?   | 電郵（後備驗證）                              |
| `passwordHash` | String?   | bcrypt 加密後的密碼                           |
| `role`         | UserRole  | 角色（USER/TUTOR/ADMIN/STAFF/STUDENT/PARENT） |
| `deletedAt`    | DateTime? | 軟刪除時間戳                                  |

### 欄位與表單對照

| Prisma 欄位    | 表單欄位 | 組件                    | 說明                 |
| -------------- | -------- | ----------------------- | -------------------- |
| `phone`        | 電話號碼 | SignUpForm / SignInForm | **登入帳號（唯一）** |
| `memberNumber` | 會員編號 | SignInForm              | **可選登入方式**     |
| `passwordHash` | 密碼     | SignUpForm / SignInForm | bcrypt 加密          |
| `email`        | 電郵地址 | SignUpForm              | 後備驗證用           |
| `nickname`     | 暱稱     | UserInfoEditModal       | 平時稱呼             |
| `nameChinese`  | 中文姓名 | UserInfoEditModal       |                      |
| `nameEnglish`  | 英文姓名 | UserInfoEditModal       |                      |

---

## 認證流程

### 註冊流程

```
┌─────────────────────────────────────────────────────────────┐
│                        註冊流程                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. 輸入電話號碼 + 密碼                                      │
│           ↓                                                 │
│  2. 發送 OTP 到電話                                         │
│           ↓                                                 │
│     ┌─────────────────┐                                     │
│     │  OTP 驗證成功？  │                                     │
│     └────────┬────────┘                                     │
│         是 ↓     ↓ 否（3次失敗）                             │
│     建立帳號    切換電郵驗證                                  │
│                    ↓                                        │
│              發送驗證連結到電郵                               │
│                    ↓                                        │
│              點擊連結驗證                                    │
│                    ↓                                        │
│              建立帳號                                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 登入流程（無 OTP）

```
┌─────────────────────────────────────────────────────────────┐
│                        登入流程                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  用戶選擇登入方式：                                          │
│                                                             │
│  ┌──────────────────┐    ┌──────────────────┐              │
│  │  電話號碼 + 密碼  │ 或 │  會員編號 + 密碼  │              │
│  └────────┬─────────┘    └────────┬─────────┘              │
│           │                       │                         │
│           └───────────┬───────────┘                         │
│                       ↓                                     │
│              驗證密碼（bcrypt compare）                       │
│                       ↓                                     │
│              建立 Session                                    │
│                       ↓                                     │
│              導向 Dashboard                                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 實作計劃

### Phase 0: 認證基礎建設 ✅

**已完成檔案**：

| 檔案                                  | 說明                                 |
| ------------------------------------- | ------------------------------------ |
| `lib/auth/options.ts`                 | NextAuth v5 設定（`NextAuthConfig`） |
| `lib/auth/types.ts`                   | Session/JWT 類型擴展                 |
| `lib/auth/index.ts`                   | Auth 導出                            |
| `lib/rate-limit.ts`                   | Rate Limiting 實作                   |
| `lib/member-number.ts`                | 會員編號生成器（`YYMMTXXXX` 格式）   |
| `app/api/auth/[...nextauth]/route.ts` | NextAuth 路由                        |

---

### Phase 1: 註冊功能 ✅

**已完成檔案**：

| 檔案                                          | 說明                                           |
| --------------------------------------------- | ---------------------------------------------- |
| `app/api/auth/register/route.ts`              | 註冊 API（含 Rate Limiting、自動生成會員編號） |
| `app/api/auth/otp/send/route.ts`              | 發送 OTP                                       |
| `app/api/auth/otp/verify/route.ts`            | 驗證 OTP                                       |
| `app/api/auth/reset-password/send/route.ts`   | 發送重設碼                                     |
| `app/api/auth/reset-password/verify/route.ts` | 驗證重設碼                                     |
| `app/api/auth/reset-password/reset/route.ts`  | 重設密碼                                       |
| `app/api/auth/change-password/route.ts`       | 修改密碼                                       |

**會員編號格式**：`YYMMTXXXX`

- `YY`: 年份後兩位
- `MM`: 月份
- `T`: 類別（1=用戶自行註冊, 2=學生, 3=自定）
- `XXXX`: 四位數序號

---

### Phase 2: 用戶資料 CRUD ✅

**已完成檔案**：

| 檔案                                   | 說明                                |
| -------------------------------------- | ----------------------------------- |
| `app/api/user/profile/route.ts`        | 個人資料 API（GET/PUT）             |
| `app/api/user/address/route.ts`        | 地址 API（GET/PUT）                 |
| `app/api/user/bank/route.ts`           | 銀行資料 API（GET/PUT）             |
| `app/api/user/tutor/document/route.ts` | 導師文件 API（GET/POST/PUT/DELETE） |

---

### Phase 3: 權限控制 ✅

**已完成檔案**：

| 檔案                            | 說明               |
| ------------------------------- | ------------------ |
| `middleware.ts`                 | Dashboard 路由保護 |
| `context/PermissionContext.tsx` | 權限 Context       |

---

## 環境變數

```env
# .env.local

# NextAuth (v5)
AUTH_SECRET=your-secret-key-here

# Database
DATABASE_URL=postgresql://...

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 檔案結構

**完整檔案結構參見**：`README.md`

```
app/api/auth/                    # 認證 API (8 個檔案)
├── [...nextauth]/route.ts       # NextAuth 主入口
├── register/route.ts            # 註冊 API
├── change-password/route.ts     # 修改密碼 API
├── otp/send/route.ts            # 發送 OTP
├── otp/verify/route.ts          # 驗證 OTP
├── reset-password/send/route.ts # 發送重設碼
├── reset-password/verify/route.ts # 驗證重設碼
└── reset-password/reset/route.ts  # 重設密碼

app/api/user/                    # 用戶資料 API (4 個檔案)
├── profile/route.ts             # 個人資料 (GET/PUT)
├── address/route.ts             # 地址 (GET/PUT)
├── bank/route.ts                # 銀行資料 (GET/PUT)
└── tutor/document/route.ts      # 導師文件 (GET/POST/PUT/DELETE)

components/auth/                 # 認證表單 (13 個檔案)
├── SignInForm.tsx
├── SignUpForm.tsx
├── OtpForm.tsx
├── ResetPasswordForm.tsx
├── signup/                      # 註冊子組件 (4 個)
└── reset-password/              # 重設密碼子組件 (5 個)

components/feature/user/profile/ # 用戶資料組件 (16 個檔案)
├── *Card.tsx                    # 展示卡片 (6 個)
├── *EditModal.tsx               # 編輯 Modal (5 個)
└── tutor-documents/             # 導師文件子組件 (5 個)

lib/
├── auth/                        # NextAuth 設定
├── rate-limit.ts                # Rate Limiting
└── member-number.ts             # 會員編號生成
```

---

## 開發順序

| 順序 | 任務               | 狀態 | 說明                                  |
| ---- | ------------------ | ---- | ------------------------------------- |
| 1    | 安裝 NextAuth.js   | ✅   | `pnpm add next-auth@beta bcryptjs`    |
| 2    | 新增 Prisma Schema | ✅   | `passwordHash`, `nickname` 欄位       |
| 3    | 執行 Migration     | ✅   | `pnpm prisma migrate dev`             |
| 4    | 建立 NextAuth 設定 | ✅   | `lib/auth/options.ts`                 |
| 5    | 建立 API Route     | ✅   | `app/api/auth/[...nextauth]/route.ts` |
| 6    | 實作註冊 API       | ✅   | `app/api/auth/register/route.ts`      |
| 7    | 實作 OTP API       | ✅   | `app/api/auth/otp/send` + `verify`    |
| 8    | 改造 SignInForm    | ✅   | 電話/會員編號 + 密碼 + 格式驗證       |
| 9    | 改造 SignUpForm    | ✅   | 電話 + 密碼 + OTP 驗證 + 格式驗證     |
| 10   | 密碼重設/修改 API  | ✅   | reset-password + change-password      |
| 11   | Middleware         | ✅   | 保護 Dashboard 路由                   |
| 12   | 用戶資料 CRUD API  | ✅   | profile/address/bank/tutor API        |
| 13   | 整合到 Modal       | ⏳   | 連接 API 到 Modal 組件                |

---

## 注意事項

**認證表單相關注意事項參見**：`AUTH_FORMS_SUMMARY.md`

1. **敏感資料**：身份證號碼顯示時遮蔽（如 `A123****(4)`）
2. **Mock 數據**：Profile 頁面目前使用 `mockUserData`，需替換為真實 API

---

## 相關文件

- `docs/用戶資料/README.md` - 組件規格文檔
- `docs/用戶資料/AUTH_FORMS_SUMMARY.md` - 認證表單總結
- `docs/用戶資料/HANDOVER.md` - 交接文檔
- `prisma/schema/user.prisma` - 用戶 Schema
- `prisma/schema/tutor.prisma` - 導師 Schema
