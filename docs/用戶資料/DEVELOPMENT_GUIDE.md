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

| 項目              | 說明                                                       |
| ----------------- | ---------------------------------------------------------- |
| **Prisma Schema** | `user.prisma`、`tutor.prisma` 已定義完整資料模型           |
| **UI 組件**       | 6 個展示卡片 + 4 個編輯 Modal                              |
| **Auth 表單**     | `SignInForm`、`SignUpForm`、`OtpForm`、`ResetPasswordForm` |
| **NextAuth.js**   | Credentials Provider 已整合                                |
| **電話驗證**      | `libphonenumber-js` 格式驗證                               |
| **密碼加密**      | bcrypt 加密存儲                                            |
| **OTP API**       | 發送/驗證 API 已完成                                       |

### ⚠️ 待實作

| 項目          | 說明                 |
| ------------- | -------------------- |
| **用戶 CRUD** | Server Actions       |
| **SMS 服務**  | 實際簡訊發送整合     |
| **電郵服務**  | Resend/SendGrid 整合 |

---

## 資料模型

### User Model 欄位（已更新）

```prisma
model User {
  id           String  @id @default(cuid())
  memberNumber String? @unique  // 會員編號（可用於登入）

  // 基本資料
  phone        String  @unique  // 電話號碼（主要登入帳號）
  email        String? @unique  // 電郵（後備驗證）
  nameChinese  String?          // 中文姓名
  nameEnglish  String?          // 英文姓名
  nickname     String?          // 暱稱（稱呼）
  title        String?          // 稱呼（先生/女士/小姐）
  gender       Gender?          // 性別

  // 認證
  passwordHash String?          // 加密後的密碼

  // 角色（預設 USER）
  role         UserRole @default(USER)

  // 關聯
  address      UserAddress?
  bankAccount  UserBankAccount?
  children     UserChild[]
  tutorProfile TutorProfile?
}
```

### 新增欄位說明

| 欄位           | 類型    | 說明                |
| -------------- | ------- | ------------------- |
| `nickname`     | String? | 暱稱，平時稱呼      |
| `passwordHash` | String? | bcrypt 加密後的密碼 |

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

### Phase 0: 認證基礎建設

#### 0.1 安裝依賴

```bash
pnpm add next-auth @auth/prisma-adapter bcryptjs
pnpm add -D @types/bcryptjs
```

#### 0.2 新增 Prisma Schema

在 `user.prisma` 新增 NextAuth 所需 Model：

```prisma
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
  @@map("verification_tokens")
}
```

#### 0.3 NextAuth 設定

```typescript
// lib/auth/options.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        identifier: { label: "電話號碼或會員編號", type: "text" },
        password: { label: "密碼", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) {
          throw new Error("請輸入帳號和密碼");
        }

        // 查找用戶（電話號碼或會員編號）
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { phone: credentials.identifier },
              { memberNumber: credentials.identifier },
            ],
          },
        });

        if (!user || !user.passwordHash) {
          throw new Error("帳號或密碼錯誤");
        }

        // 驗證密碼
        const isValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isValid) {
          throw new Error("帳號或密碼錯誤");
        }

        return {
          id: user.id,
          phone: user.phone,
          email: user.email,
          name: user.nickname || user.nameChinese,
          role: user.role,
          memberNumber: user.memberNumber,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.memberNumber = user.memberNumber;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.memberNumber = token.memberNumber as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/signin",
    error: "/signin",
  },
};
```

#### 0.4 API Route

```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth/options";

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

---

### Phase 1: 註冊功能

#### 1.1 註冊 API

```typescript
// app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  const { phone, password, email } = await request.json();

  // 檢查電話是否已註冊
  const existingUser = await prisma.user.findUnique({
    where: { phone },
  });

  if (existingUser) {
    return NextResponse.json({ error: "此電話號碼已註冊" }, { status: 400 });
  }

  // 加密密碼
  const passwordHash = await bcrypt.hash(password, 12);

  // 建立用戶（預設 USER）
  const user = await prisma.user.create({
    data: {
      phone,
      email,
      passwordHash,
      role: "USER",
    },
  });

  return NextResponse.json({
    success: true,
    userId: user.id,
  });
}
```

#### 1.2 OTP 服務（電話驗證）

```typescript
// lib/services/otp.ts
import { prisma } from "@/lib/prisma";

export async function sendPhoneOtp(phone: string): Promise<boolean> {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = new Date(Date.now() + 5 * 60 * 1000); // 5 分鐘

  await prisma.verificationToken.upsert({
    where: { identifier_token: { identifier: phone, token: code } },
    update: { token: code, expires },
    create: { identifier: phone, token: code, expires },
  });

  // TODO: 整合 SMS 服務（Twilio / 本地 Gateway）
  console.log(`[DEV] OTP for ${phone}: ${code}`);

  return true;
}

export async function verifyPhoneOtp(
  phone: string,
  code: string
): Promise<boolean> {
  const token = await prisma.verificationToken.findFirst({
    where: {
      identifier: phone,
      token: code,
      expires: { gt: new Date() },
    },
  });

  if (!token) return false;

  // 刪除已使用的 token
  await prisma.verificationToken.delete({
    where: { identifier_token: { identifier: phone, token: code } },
  });

  return true;
}
```

#### 1.3 電郵驗證（後備方案）

```typescript
// lib/services/email-verification.ts
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function sendEmailVerification(email: string): Promise<boolean> {
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 小時

  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
    },
  });

  // TODO: 整合郵件服務（Resend / SendGrid）
  const verifyUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}&email=${email}`;
  console.log(`[DEV] Verify email: ${verifyUrl}`);

  return true;
}
```

---

### Phase 2: 用戶資料 CRUD

#### 2.1 Server Actions

```typescript
// app/actions/user.ts
"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { revalidatePath } from "next/cache";

export async function updateUserInfo(data: {
  title?: string;
  nameChinese?: string;
  nameEnglish?: string;
  nickname?: string;
  gender?: "MALE" | "FEMALE";
  email?: string;
  identityCardNumber?: string;
  whatsappEnabled?: boolean;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      title: data.title,
      nameChinese: data.nameChinese,
      nameEnglish: data.nameEnglish,
      nickname: data.nickname,
      gender: data.gender || null,
      email: data.email,
      identityCardNumber: data.identityCardNumber,
      whatsappEnabled: data.whatsappEnabled,
    },
  });

  revalidatePath("/dashboard/profile");
}

export async function updateUserAddress(data: {
  region?: string;
  district: string;
  address: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.userAddress.upsert({
    where: { userId: session.user.id },
    update: data,
    create: { userId: session.user.id, ...data },
  });

  revalidatePath("/dashboard/profile");
}

export async function updateUserBank(data: {
  bankName?: string;
  accountNumber?: string;
  accountHolderName?: string;
  fpsId?: string;
  fpsEnabled?: boolean;
  notes?: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.userBankAccount.upsert({
    where: { userId: session.user.id },
    update: data,
    create: { userId: session.user.id, ...data },
  });

  revalidatePath("/dashboard/profile");
}
```

---

### Phase 3: 權限控制

#### 3.1 Middleware

```typescript
// middleware.ts
export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/dashboard/:path*"],
};
```

#### 3.2 角色權限

```typescript
// lib/auth/permissions.ts
import { UserRole } from "@prisma/client";

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  USER: ["profile:read", "profile:update", "children:manage"],
  TUTOR: ["profile:read", "profile:update", "tutor:manage", "documents:upload"],
  STAFF: ["users:read", "courses:manage"],
  ADMIN: ["*"],
};

export function hasPermission(role: UserRole, permission: string): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  return permissions.includes("*") || permissions.includes(permission);
}
```

---

## 環境變數

```env
# .env.local

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# SMS Service (選用)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# Email Service (選用)
RESEND_API_KEY=

# Database
DATABASE_URL=
```

---

## 檔案結構（預計新增）

```
app/
├── api/
│   └── auth/
│       ├── [...nextauth]/route.ts   # NextAuth 主入口
│       ├── register/route.ts        # 註冊 API
│       └── otp/
│           ├── send/route.ts        # 發送 OTP
│           └── verify/route.ts      # 驗證 OTP
├── actions/
│   └── user.ts                      # Server Actions
└── (public)/
    ├── signin/page.tsx              # 登入頁（電話/會員編號 + 密碼）
    ├── signup/page.tsx              # 註冊頁
    └── verify-email/page.tsx        # 電郵驗證頁

lib/
├── auth/
│   ├── options.ts                   # NextAuth 設定
│   └── permissions.ts               # 權限定義
└── services/
    ├── otp.ts                       # OTP 服務
    └── email-verification.ts        # 電郵驗證服務

prisma/schema/
└── user.prisma                      # 新增 Account, Session, VerificationToken
```

---

## 開發順序

| 順序 | 任務                | 狀態 | 說明                                  |
| ---- | ------------------- | ---- | ------------------------------------- |
| 1    | 安裝 NextAuth.js    | ✅   | `pnpm add next-auth@beta bcryptjs`    |
| 2    | 新增 Prisma Schema  | ✅   | `passwordHash`, `nickname` 欄位       |
| 3    | 執行 Migration      | ✅   | `pnpm prisma migrate dev`             |
| 4    | 建立 NextAuth 設定  | ✅   | `lib/auth/options.ts`                 |
| 5    | 建立 API Route      | ✅   | `app/api/auth/[...nextauth]/route.ts` |
| 6    | 實作註冊 API        | ✅   | `app/api/auth/register/route.ts`      |
| 7    | 實作 OTP API        | ✅   | `app/api/auth/otp/send` + `verify`    |
| 8    | 改造 SignInForm     | ✅   | 電話/會員編號 + 密碼 + 格式驗證       |
| 9    | 改造 SignUpForm     | ✅   | 電話 + 密碼 + OTP 驗證 + 格式驗證     |
| 10   | 實作 Server Actions | ⏳   | 用戶資料 CRUD                         |
| 11   | 整合到 Modal        | ⏳   | 連接 Server Actions                   |
| 12   | 建立 Middleware     | ⏳   | 保護 Dashboard 路由                   |

---

## 注意事項

1. **密碼安全**：使用 bcrypt（cost factor 12）加密
2. **電話格式驗證**：使用 `libphonenumber-js` 的 `isValidPhoneNumber()` 函數
3. **PhoneInput 組件**：預設香港區號 `+852`，支援國際格式
4. **OTP 限制**：60 秒倒計時、3 次失敗後切換電郵驗證
5. **電郵後備**：OTP 驗證失敗 3 次後自動切換
6. **Session**：JWT 策略，已整合 NextAuth.js
7. **敏感資料**：身份證號碼顯示時遮蔽（如 `A123****(4)`）

---

## 相關文件

- `docs/用戶資料/README.md` - 組件規格文檔
- `docs/用戶資料/AUTH_FORMS_SUMMARY.md` - 認證表單總結
- `docs/用戶資料/HANDOVER.md` - 交接文檔
- `prisma/schema/user.prisma` - 用戶 Schema
- `prisma/schema/tutor.prisma` - 導師 Schema
