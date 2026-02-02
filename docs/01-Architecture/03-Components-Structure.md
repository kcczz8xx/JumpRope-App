# lib/ 目錄重構文檔

## 重構日期
2026-02-02

## 重構原因
原本的 `lib/` 目錄結構混亂，文件分散在根層級，缺乏清晰分類：
- 客戶端/伺服器端代碼混雜
- 業務邏輯與工具代碼混雜
- 缺乏統一導出入口

## 新目錄結構

```
lib/
├── auth/               # 認證相關（保持不變）
│   ├── index.ts
│   ├── options.ts
│   └── types.ts
│
├── rbac/               # 權限控制（保持不變）
│   ├── index.ts
│   ├── check-permission.ts
│   ├── permissions.ts
│   └── types.ts
│
├── validations/        # 驗證 schemas（保持不變）
│   ├── index.ts
│   ├── user.ts
│   └── tutor-document.ts
│
├── constants/          # 常量數據（保持不變）
│   └── hk-address-data.ts
│
├── mock-data/          # Mock 數據（保持不變）
│   └── school-service/
│
├── db/                 # 🆕 資料庫層
│   ├── index.ts        # 導出 prisma
│   └── prisma.ts       # Prisma 客戶端
│
├── server/             # 🆕 伺服器端專用工具
│   ├── index.ts
│   └── rate-limit.ts   # 速率限制
│
├── client/             # 🆕 客戶端專用工具
│   ├── index.ts
│   ├── api.ts          # API 客戶端 wrapper
│   ├── swr-config.ts   # SWR 配置
│   └── toast.ts        # Toast 通知
│
├── services/           # 🆕 業務邏輯服務
│   ├── index.ts
│   ├── user.ts         # 用戶資料服務
│   └── member-number.ts # 會員編號生成
│
└── utils/              # 🆕 通用工具
    ├── index.ts
    └── cn.ts           # Tailwind cn 函式
```

## Import 路徑變更對照表

| 舊路徑 | 新路徑 |
|--------|--------|
| `@/lib/prisma` | `@/lib/db` |
| `@/lib/rate-limit` | `@/lib/server` |
| `@/lib/api-client` | `@/lib/client` |
| `@/lib/swr-config` | `@/lib/client` |
| `@/lib/toast` | `@/lib/client` |
| `@/lib/user` | `@/lib/services` |
| `@/lib/member-number` | `@/lib/services` |
| `@/lib/utils` | `@/lib/utils` （改為目錄） |

## 使用範例

### 資料庫操作（伺服器端）
```typescript
import { prisma } from "@/lib/db";

const user = await prisma.user.findUnique({ where: { id } });
```

### 伺服器端工具
```typescript
import { rateLimit, getClientIP, RATE_LIMIT_CONFIGS } from "@/lib/server";

const result = rateLimit(`otp:${ip}`, RATE_LIMIT_CONFIGS.OTP_SEND);
```

### 客戶端工具
```typescript
import { api, toast, swrConfig, type ApiResult } from "@/lib/client";

const result = await api.get<User>("/api/user/profile");
toast.success("操作成功");
```

### 業務邏輯
```typescript
import { getUserProfile, generateMemberNumber, MemberType } from "@/lib/services";

const profile = await getUserProfile(userId);
const memberNumber = await generateMemberNumber(MemberType.SELF_REGISTERED);
```

### 通用工具
```typescript
import { cn } from "@/lib/utils";

<div className={cn("base-class", isActive && "active-class")} />
```

## 設計原則

1. **清晰分層**：按用途（db/server/client/services/utils）分類
2. **統一導出**：每個目錄都有 `index.ts` 統一導出
3. **客戶端/伺服器端分離**：避免意外引入不兼容的代碼
4. **業務邏輯集中**：`services/` 放置所有業務邏輯

## 已刪除的舊文件

- `lib/prisma.ts` → 移至 `lib/db/prisma.ts`
- `lib/api-client.ts` → 移至 `lib/client/api.ts`
- `lib/rate-limit.ts` → 移至 `lib/server/rate-limit.ts`
- `lib/swr-config.ts` → 移至 `lib/client/swr-config.ts`
- `lib/toast.ts` → 移至 `lib/client/toast.ts`
- `lib/user.ts` → 移至 `lib/services/user.ts`
- `lib/member-number.ts` → 移至 `lib/services/member-number.ts`
- `lib/utils.ts` → 移至 `lib/utils/cn.ts`
