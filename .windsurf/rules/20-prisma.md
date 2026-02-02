<activation_mode>glob</activation_mode>
<glob_pattern>prisma/**/\*.prisma, prisma/**/_.ts, src/lib/db/\*\*/_.ts</glob_pattern>

<prisma_rules>

# Prisma ORM 規則

當編輯 Prisma schema 或資料庫相關代碼時啟用。

</prisma_rules>

<schema_conventions>

## Schema 命名規範

```prisma
// ✅ Model 用 PascalCase
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  // 關聯
  profile   Profile?
  posts     Post[]

  @@map("users")  // 資料表用 snake_case
}

// ✅ Enum 用 PascalCase
enum UserRole {
  ADMIN
  USER
  GUEST
}
```

### 命名規則

| 類型    | 命名風格           | 範例                       |
| :------ | :----------------- | :------------------------- |
| Model   | PascalCase         | `User`, `SchoolService`    |
| 欄位    | camelCase          | `firstName`, `createdAt`   |
| 資料表  | snake_case (@@map) | `users`, `school_services` |
| Enum    | PascalCase         | `UserRole`, `OrderStatus`  |
| Enum 值 | UPPER_SNAKE        | `ADMIN`, `IN_PROGRESS`     |

</schema_conventions>

<relations>

## 關聯設定

### 雙向關聯（必須）

```prisma
model User {
  id       String    @id @default(cuid())
  profile  Profile?  // 一對一
  posts    Post[]    // 一對多
}

model Profile {
  id     String @id @default(cuid())
  userId String @unique @map("user_id")
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("profiles")
}

model Post {
  id       String @id @default(cuid())
  authorId String @map("author_id")
  author   User   @relation(fields: [authorId], references: [id], onDelete: Cascade)

  @@map("posts")
}
```

### onDelete 策略

- `Cascade`: 父記錄刪除時一併刪除子記錄
- `SetNull`: 父記錄刪除時設為 null（需 optional 關聯）
- `Restrict`: 有子記錄時禁止刪除父記錄

</relations>

<migrations>

## Migration 指令

```bash
# 建立新 migration
pnpm prisma:migrate add_user_role

# 部署 migrations（生產環境）
pnpm prisma:deploy

# 快速同步（開發用，不建議生產）
pnpm prisma:push

# 重置資料庫（⚠️ 會刪除所有資料）
pnpm prisma:wipe
```

### Migration 注意事項

- 使用 `POSTGRES_URL_NON_POOLING` 執行 migrations
- 避免直接修改已部署的 migration 檔案
- 破壞性變更需分多步驟執行

</migrations>

<client_usage>

## Prisma Client 使用

### Import 路徑

```typescript
// ✅ 正確：使用封裝好的 client
import { prisma } from "@/lib/db";

// ❌ 錯誤：直接 import
import { PrismaClient } from "@prisma/client";
```

### 查詢最佳實踐

```typescript
// ✅ 使用 select 減少資料傳輸
const user = await prisma.user.findUnique({
  where: { id },
  select: {
    id: true,
    name: true,
    email: true,
  },
});

// ✅ 使用 include 載入關聯
const userWithPosts = await prisma.user.findUnique({
  where: { id },
  include: {
    posts: { take: 10, orderBy: { createdAt: "desc" } },
  },
});

// ✅ 使用 transaction 確保資料一致性
await prisma.$transaction([
  prisma.account.update({ ... }),
  prisma.log.create({ ... }),
]);
```

</client_usage>

<seeding>

## Seed 資料

```bash
# 執行 seed
pnpm prisma:seed

# seed 檔案位置
prisma/seed.ts
```

Seed 腳本應該是冪等的（可重複執行不出錯）。

</seeding>
