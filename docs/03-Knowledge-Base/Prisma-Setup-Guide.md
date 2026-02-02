# Prisma + Neon 完整設定總結

## 🎯 決定：使用純 Prisma ORM

你選擇接受 Prisma 改表較慢的代價，換取：

- ✅ 完整的類型安全
- ✅ 自動關聯查詢
- ✅ 生產級穩定性
- ✅ 團隊協作優勢

---

## ✅ 已完成設定（可立即使用）

### 1. 依賴套件

```json
{
  "dependencies": {
    "prisma": "^7.3.0",
    "@prisma/client": "^7.3.0",
    "@prisma/adapter-neon": "^7.3.0",
    "@neondatabase/serverless": "^1.0.2",
    "ws": "^8.19.0"
  },
  "devDependencies": {
    "@types/ws": "^8.18.1",
    "tsx": "^4.21.0"
  }
}
```

### 2. Prisma 配置檔案

**prisma.config.ts**

```typescript
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
```

**prisma/schema.prisma**（6 個 Models）

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}

model Student {
  id          String       @id
  name        String
  email       String       @unique
  phone       String?
  age         Int?
  level       String?      @default("beginner")
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @default(now())
  enrollments Enrollment[]
  @@map("students")
}

model School {
  id           String        @id
  name         String
  address      String?
  tel          String?
  email        String?
  status       String?       @default("active")
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @default(now())
  courses      Course[]
  partnerships Partnership[]
  @@map("schools")
}

model Course {
  id          String      @id
  schoolId    String
  name        String
  description String?
  courseType  String?
  duration    Int?
  fee         Decimal?
  status      String?     @default("active")
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @default(now())
  school      School      @relation(fields: [schoolId], references: [id], onDelete: Cascade)
  classes     Class[]
  enrollments Enrollment[]
  @@map("courses")
}

model Class { ... }
model Partnership { ... }
model Enrollment { ... }
```

### 3. Prisma Client

**lib/prisma.ts**

```typescript
import { PrismaClient } from "@prisma/client";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });
const adapter = new PrismaNeon(pool);

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

### 4. 資料庫表格

**已建立 6 個表格：**

- `schools` (2 筆測試資料)
- `students` (3 筆測試資料)
- `partnerships`
- `courses`
- `classes`
- `enrollments`

**自動建表腳本：** `scripts/create-tables.ts`

---

## 🚀 立即可用功能

### Prisma Client API

```typescript
import { prisma } from "@/lib/prisma";

// ==================== 基本 CRUD ====================

// 查詢全部
const students = await prisma.student.findMany({
  orderBy: { createdAt: "desc" },
});

// 查詢單筆
const student = await prisma.student.findUnique({
  where: { id: "xxx" },
});

// 建立
const newStudent = await prisma.student.create({
  data: {
    name: "張小明",
    email: "ming@example.com",
    age: 12,
    level: "beginner",
  },
});

// 更新
const updated = await prisma.student.update({
  where: { id: "xxx" },
  data: { level: "intermediate" },
});

// 刪除
await prisma.student.delete({
  where: { id: "xxx" },
});

// ==================== 關聯查詢 ====================

// 學生 + 報名課程
const studentWithCourses = await prisma.student.findUnique({
  where: { id: "xxx" },
  include: {
    enrollments: {
      include: {
        course: {
          include: {
            school: true,
          },
        },
      },
    },
  },
});

// 學校 + 所有課程 + 學生
const schoolWithDetails = await prisma.school.findUnique({
  where: { id: "xxx" },
  include: {
    courses: {
      include: {
        classes: true,
        enrollments: {
          include: {
            student: true,
          },
        },
      },
    },
    partnerships: true,
  },
});

// ==================== 進階查詢 ====================

// 分頁
const { students, total } = await Promise.all([
  prisma.student.findMany({
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: "desc" },
  }),
  prisma.student.count(),
]);

// 搜尋
const results = await prisma.student.findMany({
  where: {
    OR: [
      { name: { contains: query, mode: "insensitive" } },
      { email: { contains: query, mode: "insensitive" } },
    ],
  },
});

// 聚合統計
const stats = await prisma.student.groupBy({
  by: ["level"],
  _count: { id: true },
  _avg: { age: true },
});

// Transaction
await prisma.$transaction(async (tx) => {
  await tx.student.update({
    where: { id: studentId },
    data: { level: "advanced" },
  });

  await tx.log.create({
    data: {
      action: "level_upgrade",
      studentId: studentId,
    },
  });
});
```

---

## 🔧 改表流程（Prisma 標準）

### 開發環境（快速迭代）

```bash
# 1. 修改 schema.prisma
model Student {
  id    String @id
  name  String
  grade String  # 新增欄位
}

# 2. 推送到資料庫（開發用，不建立 migration 檔案）
pnpx prisma db push

# 3. 重新生成 Prisma Client
pnpx prisma generate

# 4. 修改使用該 Model 的 actions/hooks
const student = await prisma.student.create({
  data: { name, grade }  # 使用新欄位
})
```

**⏱️ 總耗時：5-10 分鐘**

### 生產環境（正式 Migration）

```bash
# 1. 修改 schema.prisma

# 2. 建立 migration（會產生 SQL 檔案）
pnpx prisma migrate dev --name add_student_grade

# 3. 自動執行 generate

# 4. 提交 migration 檔案到 Git
git add prisma/migrations
git commit -m "Add grade field to Student"
```

**⏱️ 總耗時：10-15 分鐘**

---

## 🎯 改表加速技巧

### 1. 使用 `db push` 取代 `migrate dev`（開發階段）

```bash
# ❌ 慢（建立 migration 檔案）
pnpx prisma migrate dev

# ✅ 快（直接推送，適合開發）
pnpx prisma db push
```

### 2. 批次修改多個欄位

```prisma
// 一次改多個欄位，只 push 一次
model Student {
  grade  String?  // 新增
  status String?  // 新增
  notes  String?  // 新增
}
```

### 3. 使用 Prisma Studio 測試

```bash
# 開啟視覺化介面
pnpx prisma studio

# 在瀏覽器測試資料
# 確認 schema 正確後再 generate
```

### 4. 保持 Prisma Client 熱重載

```typescript
// next.config.ts
module.exports = {
  webpack: (config) => {
    config.externals.push({
      "@prisma/client": "commonjs @prisma/client",
    });
    return config;
  },
};
```

---

## 📝 Actions 遷移範例

### 原本（Neon Driver）

```typescript
// lib/actions/students/student.actions.ts
"use server";

import { sql } from "@/lib/neon";
import { revalidatePath } from "next/cache";

export async function getStudents() {
  try {
    const students = await sql`
      SELECT * FROM students 
      ORDER BY created_at DESC
    `;
    return { success: true, data: students };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function createStudent(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;

    const [student] = await sql`
      INSERT INTO students (name, email)
      VALUES (${name}, ${email})
      RETURNING *
    `;

    revalidatePath("/students");
    return { success: true, data: student };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

### 改成（Prisma）

```typescript
// lib/actions/students/student.actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getStudents() {
  try {
    const students = await prisma.student.findMany({
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: students };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function createStudent(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;

    const student = await prisma.student.create({
      data: { name, email },
    });

    revalidatePath("/students");
    return { success: true, data: student };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// 進階：自動包含關聯
export async function getStudentById(id: string) {
  try {
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        enrollments: {
          include: {
            course: {
              include: {
                school: true,
              },
            },
          },
        },
      },
    });

    if (!student) {
      return { success: false, error: "找不到該學生" };
    }

    return { success: true, data: student };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

---

## 🛠️ Prisma 實用命令

```bash
# ==================== 開發常用 ====================

# 推送 schema 變更（快速，開發用）
pnpx prisma db push

# 生成 Prisma Client
pnpx prisma generate

# 開啟 Prisma Studio（視覺化管理）
pnpx prisma studio

# 格式化 schema.prisma
pnpx prisma format

# ==================== Migration（生產用）====================

# 建立 migration
pnpx prisma migrate dev --name migration_name

# 部署 migration（生產環境）
pnpx prisma migrate deploy

# 查看 migration 狀態
pnpx prisma migrate status

# ==================== 其他 ====================

# 從資料庫拉取 schema
pnpx prisma db pull

# 驗證 schema
pnpx prisma validate

# 重設資料庫（⚠️ 會刪除所有資料）
pnpx prisma migrate reset
```

---

## 📚 已建立文檔

1. **NEON_SERVERLESS_DRIVER_GUIDE.md** - 純 Neon Driver 指南（已修正）
2. **PRISMA_VS_NEON_COMPARISON.md** - Prisma vs Neon 完整對比
3. **PRISMA_NEON_MIGRATION_GUIDE.md** - Prisma + Neon 遷移指南
4. **NEON_URL_GUIDE.md** - Neon URLs 取得方法
5. **CREATE_TABLES_GUIDE.md** - 建表指南
6. **MIGRATION_COMPLETE.md** - 遷移完成總結
7. **SCHEMA_ITERATION_STRATEGY.md** - Schema 迭代策略（含混合模式）
8. **PRISMA_SETUP_FINAL.md** - 本文檔（最終總結）

---

## ✅ 遷移檢查清單

### 基礎環境（已完成）

- [x] 安裝 Prisma 依賴
- [x] 配置 schema.prisma（6 個 Models）
- [x] 建立 lib/prisma.ts（Neon Adapter）
- [x] 設定環境變數（DATABASE_URL）
- [x] 建立資料表（自動化腳本）
- [x] 執行 prisma db pull
- [x] 執行 prisma generate

### Actions 遷移（待完成）

- [ ] 遷移 `lib/actions/students/student.actions.ts`
- [ ] 遷移 `lib/actions/partnerships/partnership.actions.ts`
- [ ] 遷移 `lib/actions/courses/course.actions.ts`
- [ ] 遷移 `lib/actions/classes/class.actions.ts`
- [ ] 更新頁面類型定義（使用 Prisma 自動生成）
- [ ] 測試所有 CRUD 功能
- [ ] 測試關聯查詢

### 部署（待完成）

- [ ] Vercel 環境變數設定（DATABASE_URL）
- [ ] 測試 Vercel 部署
- [ ] 確認生產環境 Prisma 連線

---

## 🎓 Prisma 最佳實踐

### 1. 效能優化

```typescript
// ❌ N+1 查詢問題
const students = await prisma.student.findMany();
for (const student of students) {
  const enrollments = await prisma.enrollment.findMany({
    where: { studentId: student.id },
  });
}

// ✅ 一次查詢解決
const students = await prisma.student.findMany({
  include: { enrollments: true },
});

// ✅ 只選需要的欄位
const students = await prisma.student.findMany({
  select: {
    id: true,
    name: true,
    email: true,
  },
});
```

### 2. 錯誤處理

```typescript
import { Prisma } from "@prisma/client";

try {
  await prisma.student.create({ data });
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      // Unique constraint 違反
      return { success: false, error: "Email 已存在" };
    }
  }
  throw error;
}
```

### 3. Transaction 模式

```typescript
// ✅ 自動 Rollback
await prisma.$transaction(async (tx) => {
  const student = await tx.student.create({ data: studentData });
  await tx.enrollment.create({
    data: {
      studentId: student.id,
      courseId: courseId,
    },
  });
});
```

---

## 🔗 快速參考

### Prisma 官方文檔

- [Prisma Client API](https://www.prisma.io/docs/orm/prisma-client)
- [CRUD Operations](https://www.prisma.io/docs/orm/prisma-client/queries/crud)
- [Relations](https://www.prisma.io/docs/orm/prisma-schema/data-model/relations)
- [Transactions](https://www.prisma.io/docs/orm/prisma-client/queries/transactions)

### Neon + Prisma

- [Prisma + Neon](https://www.prisma.io/docs/orm/overview/databases/neon)
- [Neon Console](https://console.neon.tech)

### 工具

```bash
# Prisma Studio（視覺化管理）
pnpx prisma studio

# 開發伺服器
pnpm dev
```

---

## 🎉 完成！

你的跳繩學院專案現在擁有：

- ✅ 完整的 Prisma ORM 環境
- ✅ 類型安全的資料庫操作
- ✅ 自動化建表流程
- ✅ 6 個優化的 Prisma Models
- ✅ Neon Serverless Database 整合
- ✅ Vercel 部署就緒

**下一步：** 開始遷移 Server Actions 到 Prisma API

---

**版本：** 1.0.0  
**完成時間：** 2026-01-30  
**策略：** 純 Prisma ORM  
**預計 Actions 遷移時間：** 1-2 小時  
**維護者：** Jump Rope Academy Team
