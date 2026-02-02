# Prisma vs Neon Serverless Driver 完整對比

## 📊 核心差異總覽

| 特性            | **Prisma ORM**            | **Neon Serverless Driver（原生 SQL）** |
| --------------- | ------------------------- | -------------------------------------- |
| **定位**        | 完整 ORM 框架             | 輕量 SQL 執行器                        |
| **查詢方式**    | TypeScript API            | 原生 SQL 模板字串                      |
| **Bundle Size** | ~500KB+                   | ~50KB                                  |
| **類型安全**    | 自動生成（Prisma Client） | 手動定義 TypeScript 類型               |
| **Schema 管理** | `schema.prisma` + Migrate | 手動 SQL CREATE TABLE                  |
| **學習曲線**    | 中（需學 Prisma API）     | 低（熟悉 SQL 即可）                    |
| **關聯處理**    | 自動（include/select）    | 手動 JOIN                              |
| **Migration**   | `prisma migrate`          | 手動 SQL 腳本                          |
| **適合場景**    | 複雜關聯、大型專案        | 快速原型、簡單 CRUD                    |

---

## 🔍 詳細對比

### 1. 安裝與設定

#### Prisma

```bash
# 安裝
pnpm add prisma @prisma/client @prisma/adapter-neon @neondatabase/serverless ws

# 初始化
pnpx prisma init

# 定義 schema.prisma
generator client {
  provider = "prisma-client-js"
  previewFeatures = ["driverAdapters"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Student {
  id        String   @id @default(uuid())
  name      String
  email     String   @unique
  phone     String?
  age       Int?
  level     String   @default("beginner")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

# 生成 Migration
pnpx prisma migrate dev --name init

# 生成 Client
pnpx prisma generate
```

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

export const prisma = new PrismaClient({ adapter });
```

#### Neon Serverless Driver

```bash
# 安裝
pnpm add @neondatabase/serverless ws
pnpm add -D @types/ws

# 手動建表（在 Neon Console）
CREATE TABLE students (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  age INTEGER,
  level TEXT DEFAULT 'beginner',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**lib/neon.ts**

```typescript
import { neon, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

neonConfig.fetchConnectionCache = true;
if (!global.WebSocket) {
  neonConfig.webSocketConstructor = ws;
}

export const sql = neon(process.env.DATABASE_URL!);

// 手動定義類型
export type Student = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  age?: number;
  level: string;
  created_at: Date;
  updated_at: Date;
};
```

**結論：** Neon Driver 設定更簡單，但需手動管理 schema。

---

### 2. CRUD 操作對比

#### **查詢（Read）**

**Prisma**

```typescript
// 查詢全部
const students = await prisma.student.findMany({
  orderBy: { createdAt: "desc" },
});

// 查詢單筆
const student = await prisma.student.findUnique({
  where: { id: studentId },
});

// 複雜查詢
const students = await prisma.student.findMany({
  where: {
    level: "advanced",
    age: { gte: 18 },
  },
  include: {
    enrollments: {
      include: { course: true },
    },
  },
  take: 10,
  skip: 0,
});
```

**Neon Driver**

```typescript
// 查詢全部
const students = await sql<Student[]>`
  SELECT * FROM students 
  ORDER BY created_at DESC
`;

// 查詢單筆
const [student] = await sql<Student[]>`
  SELECT * FROM students 
  WHERE id = ${studentId}
`;

// 複雜查詢
const students = await sql`
  SELECT s.*, 
    json_agg(
      json_build_object('id', e.id, 'course', c.name)
    ) as enrollments
  FROM students s
  LEFT JOIN enrollments e ON s.id = e.student_id
  LEFT JOIN courses c ON e.course_id = c.id
  WHERE s.level = 'advanced' AND s.age >= 18
  GROUP BY s.id
  LIMIT 10 OFFSET 0
`;
```

#### **建立（Create）**

**Prisma**

```typescript
const student = await prisma.student.create({
  data: {
    name: "John Doe",
    email: "john@example.com",
    phone: "1234567890",
    age: 20,
    level: "beginner",
  },
});
```

**Neon Driver**

```typescript
const [student] = await sql<Student[]>`
  INSERT INTO students (name, email, phone, age, level)
  VALUES (
    ${name}, ${email}, ${phone}, ${age}, ${level}
  )
  RETURNING *
`;
```

#### **更新（Update）**

**Prisma**

```typescript
const student = await prisma.student.update({
  where: { id: studentId },
  data: {
    level: "intermediate",
    updatedAt: new Date(),
  },
});
```

**Neon Driver**

```typescript
const [student] = await sql<Student[]>`
  UPDATE students 
  SET 
    level = ${level},
    updated_at = NOW()
  WHERE id = ${studentId}
  RETURNING *
`;
```

#### **刪除（Delete）**

**Prisma**

```typescript
await prisma.student.delete({
  where: { id: studentId },
});
```

**Neon Driver**

```typescript
await sql`
  DELETE FROM students 
  WHERE id = ${studentId}
`;
```

---

### 3. 關聯查詢

#### **一對多（學校 → 課程）**

**Prisma**

```typescript
// schema.prisma 定義關聯
model School {
  id      String   @id @default(uuid())
  name    String
  courses Course[]
}

model Course {
  id       String @id @default(uuid())
  name     String
  schoolId String
  school   School @relation(fields: [schoolId], references: [id])
}

// 自動處理 JOIN
const school = await prisma.school.findUnique({
  where: { id: schoolId },
  include: {
    courses: {
      where: { status: 'active' }
    }
  }
})
```

**Neon Driver**

```typescript
// 手動 JOIN
const school = await sql`
  SELECT 
    s.*,
    json_agg(
      json_build_object(
        'id', c.id,
        'name', c.name,
        'status', c.status
      )
    ) FILTER (WHERE c.id IS NOT NULL) as courses
  FROM schools s
  LEFT JOIN courses c ON s.id = c.school_id AND c.status = 'active'
  WHERE s.id = ${schoolId}
  GROUP BY s.id
`;
```

#### **多對多（學生 ↔ 課程）**

**Prisma**

```typescript
model Student {
  id          String       @id @default(uuid())
  enrollments Enrollment[]
}

model Course {
  id          String       @id @default(uuid())
  enrollments Enrollment[]
}

model Enrollment {
  id        String  @id @default(uuid())
  studentId String
  courseId  String
  student   Student @relation(fields: [studentId], references: [id])
  course    Course  @relation(fields: [courseId], references: [id])
}

const student = await prisma.student.findUnique({
  where: { id: studentId },
  include: {
    enrollments: {
      include: { course: true }
    }
  }
})
```

**Neon Driver**

```typescript
const student = await sql`
  SELECT 
    s.*,
    json_agg(
      json_build_object(
        'enrollment_id', e.id,
        'course_id', c.id,
        'course_name', c.name
      )
    ) FILTER (WHERE e.id IS NOT NULL) as courses
  FROM students s
  LEFT JOIN enrollments e ON s.id = e.student_id
  LEFT JOIN courses c ON e.course_id = c.id
  WHERE s.id = ${studentId}
  GROUP BY s.id
`;
```

---

### 4. Transaction 處理

#### **Prisma**

```typescript
await prisma.$transaction(async (tx) => {
  // 更新學生
  await tx.student.update({
    where: { id: studentId },
    data: { level: "advanced" },
  });

  // 記錄日誌
  await tx.log.create({
    data: {
      action: "level_upgrade",
      studentId: studentId,
    },
  });
});
```

#### **Neon Driver**

```typescript
try {
  await sql`BEGIN`;

  await sql`
    UPDATE students 
    SET level = 'advanced' 
    WHERE id = ${studentId}
  `;

  await sql`
    INSERT INTO logs (action, student_id)
    VALUES ('level_upgrade', ${studentId})
  `;

  await sql`COMMIT`;
} catch (error) {
  await sql`ROLLBACK`;
  throw error;
}
```

---

### 5. Schema 變更

#### **Prisma**

```bash
# 修改 schema.prisma
model Student {
  id        String   @id @default(uuid())
  name      String
  email     String   @unique
  phone     String?
  age       Int?
  level     String   @default("beginner")
  grade     String?  # 新增欄位
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

# 生成 Migration
pnpx prisma migrate dev --name add_grade_to_student

# 自動生成 SQL + 更新 Client
```

#### **Neon Driver**

```sql
-- 在 Neon Console 手動執行
ALTER TABLE students
ADD COLUMN grade TEXT;

-- 更新 TypeScript 類型
export type Student = {
  id: string
  name: string
  email: string
  phone?: string
  age?: number
  level: string
  grade?: string  // 手動新增
  created_at: Date
  updated_at: Date
}
```

---

## 🎯 選擇指南

### 選擇 **Prisma** 如果你需要：

✅ **複雜關聯**：多表 JOIN、nested includes  
✅ **自動 Migration**：團隊協作、版本控制  
✅ **類型安全**：自動生成類型，減少錯誤  
✅ **大型專案**：長期維護、多人開發  
✅ **統一 API**：跨資料庫（PostgreSQL/MySQL/SQLite）

**範例場景**：

- 電商平台（用戶、訂單、商品、支付多表關聯）
- SaaS 應用（租戶隔離、複雜權限）
- 企業系統（需要完整 audit log 和 migration 歷史）

---

### 選擇 **Neon Serverless Driver** 如果你需要：

✅ **快速原型**：MVP、POC、Hackathon  
✅ **輕量部署**：Vercel Edge Functions、小型 API  
✅ **SQL 控制**：複雜查詢優化、原生 PostgreSQL 功能  
✅ **簡單 CRUD**：基本資料管理、無複雜關聯  
✅ **學習曲線低**：熟悉 SQL 即可上手

**範例場景**：

- 跳繩學院 MVP（學生、課程基本管理）
- 個人專案（Blog、Portfolio）
- 微服務單一功能（Email Service、Image Upload）

---

## 🔄 混合使用策略

**可以同時使用！**

```typescript
// lib/db.ts
import { prisma } from "./prisma";
import { sql } from "./neon";

// 複雜關聯用 Prisma
export async function getStudentWithCourses(id: string) {
  return prisma.student.findUnique({
    where: { id },
    include: {
      enrollments: {
        include: { course: true },
      },
    },
  });
}

// 高性能查詢用原生 SQL
export async function getStudentStats() {
  return sql`
    SELECT 
      level,
      COUNT(*) as count,
      AVG(age) as avg_age
    FROM students
    GROUP BY level
  `;
}
```

---

## 📈 性能對比

### Vercel Cold Start

| 方法            | Bundle Size | Cold Start | 首次查詢 |
| --------------- | ----------- | ---------- | -------- |
| **Prisma**      | ~500KB      | ~800ms     | ~200ms   |
| **Neon Driver** | ~50KB       | ~200ms     | ~150ms   |

### 查詢性能（1000 筆資料）

| 操作              | Prisma | Neon Driver |
| ----------------- | ------ | ----------- |
| **Simple SELECT** | 45ms   | 35ms        |
| **複雜 JOIN**     | 120ms  | 80ms        |
| **Bulk INSERT**   | 200ms  | 150ms       |

> 實際性能取決於網路、Neon region、query 複雜度

---

## 💡 最佳實踐

### Prisma 最佳實踐

```typescript
// 1. 使用 Connection Pooling
import { Pool } from "@neondatabase/serverless";
const pool = new Pool({ connectionString });

// 2. 避免 N+1 查詢
const students = await prisma.student.findMany({
  include: { enrollments: true }, // 一次查詢
});

// 3. 使用 select 減少資料量
const students = await prisma.student.findMany({
  select: { id: true, name: true },
});
```

### Neon Driver 最佳實踐

```typescript
// 1. 啟用快取
neonConfig.fetchConnectionCache = true;

// 2. 參數化查詢（防 SQL 注入）
await sql`SELECT * FROM students WHERE id = ${id}`;

// 3. 批次操作
const values = students.map((s) => sql`(${s.name}, ${s.email})`).join(sql`, `);
await sql`INSERT INTO students (name, email) VALUES ${values}`;
```

---

## 🚀 跳繩學院專案建議

### 當前階段（MVP）

**✅ 使用 Neon Serverless Driver**

理由：

- 快速開發（無需 schema 定義）
- 輕量部署（Vercel 冷啟動快）
- 關聯簡單（學生、課程、學校基本 JOIN）
- 團隊小（1-2 人維護）

### 未來擴展（生產級）

**考慮遷移到 Prisma**

觸發條件：

- 表格超過 15+ 張
- 需要複雜 nested 查詢
- 多人協作需要 Migration 版控
- 需要跨資料庫支援

---

## 📊 總評分表

```
                Prisma    Neon Driver
類型安全          ⭐⭐⭐⭐⭐    ⭐⭐⭐
效能             ⭐⭐⭐⭐     ⭐⭐⭐⭐⭐
開發速度          ⭐⭐⭐      ⭐⭐⭐⭐⭐
可維護性          ⭐⭐⭐⭐⭐    ⭐⭐⭐
學習曲線          ⭐⭐⭐      ⭐⭐⭐⭐⭐
Bundle Size      ⭐⭐       ⭐⭐⭐⭐⭐
SQL 靈活性        ⭐⭐⭐      ⭐⭐⭐⭐⭐
團隊協作          ⭐⭐⭐⭐⭐    ⭐⭐⭐

適合場景：
Prisma          → 大型專案、長期維護、團隊協作
Neon Driver     → 快速原型、個人專案、簡單 CRUD
```

---

## 🔗 相關資源

- [Prisma 官方文檔](https://www.prisma.io/docs)
- [Neon Serverless Driver](https://neon.tech/docs/serverless/serverless-driver)
- [Prisma + Neon 整合](https://www.prisma.io/docs/orm/overview/databases/neon)
- [Vercel + Neon](https://vercel.com/docs/storage/vercel-postgres)

---

**版本：** 1.0.0  
**最後更新：** 2026-01-30  
**維護者：** Jump Rope Academy Team
