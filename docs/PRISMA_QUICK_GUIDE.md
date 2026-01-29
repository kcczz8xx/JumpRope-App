# Prisma 快速操作指南

## 🎯 你現在的系統

✅ **只使用 Prisma ORM**（已移除 Neon Driver）

```typescript
// 唯一的資料庫操作方式
import { prisma } from "@/lib/prisma";
```

---

## 📝 日常 CRUD 操作

### 1. 查詢（Read）

```typescript
import { prisma } from "@/lib/prisma";

// 查詢全部學生
const students = await prisma.student.findMany();

// 查詢全部 + 排序
const students = await prisma.student.findMany({
  orderBy: { createdAt: "desc" },
});

// 查詢單一學生
const student = await prisma.student.findUnique({
  where: { id: "xxx" },
});

// 查詢 + 關聯（學生 + 報名課程）
const student = await prisma.student.findUnique({
  where: { id: "xxx" },
  include: {
    enrollments: {
      include: { course: true },
    },
  },
});

// 搜尋
const students = await prisma.student.findMany({
  where: {
    name: { contains: "張", mode: "insensitive" },
  },
});

// 分頁
const students = await prisma.student.findMany({
  skip: 0, // (page - 1) * limit
  take: 10, // limit
  orderBy: { createdAt: "desc" },
});
```

### 2. 建立（Create）

```typescript
// 建立單一學生
const student = await prisma.student.create({
  data: {
    name: "張小明",
    email: "ming@example.com",
    age: 12,
    level: "beginner",
  },
});

// 建立 + 關聯
const enrollment = await prisma.enrollment.create({
  data: {
    studentId: "student_id",
    courseId: "course_id",
    status: "active",
  },
});

// 建立多筆
const students = await prisma.student.createMany({
  data: [
    { name: "張小明", email: "ming@example.com" },
    { name: "李小華", email: "hua@example.com" },
  ],
});
```

### 3. 更新（Update）

```typescript
// 更新單一學生
const student = await prisma.student.update({
  where: { id: "xxx" },
  data: {
    level: "intermediate",
    age: 13,
  },
});

// 更新多筆
const result = await prisma.student.updateMany({
  where: { level: "beginner" },
  data: { status: "active" },
});

// Upsert（有就更新，沒有就建立）
const student = await prisma.student.upsert({
  where: { email: "ming@example.com" },
  update: { age: 13 },
  create: { name: "張小明", email: "ming@example.com" },
});
```

### 4. 刪除（Delete）

```typescript
// 刪除單一學生
await prisma.student.delete({
  where: { id: "xxx" },
});

// 刪除多筆
await prisma.student.deleteMany({
  where: { level: "beginner" },
});

// 刪除全部（⚠️ 危險）
await prisma.student.deleteMany();
```

---

## 🔧 改表流程（3 步驟）

### 情境：新增學生的「等級」欄位

**Step 1：修改 `prisma/schema.prisma`**

```prisma
model Student {
  id        String   @id
  name      String
  email     String   @unique
  grade     String?  // 新增這行
  createdAt DateTime @default(now())
  updatedAt DateTime @default(now())

  enrollments Enrollment[]
  @@map("students")
}
```

**Step 2：推送到資料庫**

```bash
pnpx prisma db push
```

**Step 3：重新生成 Prisma Client**

```bash
pnpx prisma generate
```

**完成！現在可以使用新欄位：**

```typescript
const student = await prisma.student.create({
  data: {
    name: "張小明",
    email: "ming@example.com",
    grade: "A+", // 使用新欄位
  },
});
```

**⏱️ 總耗時：2-3 分鐘**

---

## 📊 新增表格流程

### 情境：新增「課程評分」表

**Step 1：在 `prisma/schema.prisma` 新增 Model**

```prisma
model CourseRating {
  id        String   @id @default(dbgenerated("(gen_random_uuid())::text"))
  courseId  String   @map("course_id")
  studentId String   @map("student_id")
  rating    Int
  comment   String?
  createdAt DateTime @default(now()) @map("created_at")

  course  Course  @relation(fields: [courseId], references: [id], onDelete: Cascade)
  student Student @relation(fields: [studentId], references: [id], onDelete: Cascade)

  @@map("course_ratings")
}

// 同時更新關聯的 Model
model Course {
  // ... 原有欄位
  ratings CourseRating[]  // 新增這行
}

model Student {
  // ... 原有欄位
  ratings CourseRating[]  // 新增這行
}
```

**Step 2：推送並生成**

```bash
pnpx prisma db push
pnpx prisma generate
```

**完成！開始使用：**

```typescript
const rating = await prisma.courseRating.create({
  data: {
    courseId: "xxx",
    studentId: "yyy",
    rating: 5,
    comment: "課程很棒！",
  },
});
```

---

## 🗑️ 刪除表格流程

### 情境：刪除「課程評分」表

**Step 1：從 `prisma/schema.prisma` 移除 Model**

```prisma
// 刪除整個 CourseRating model
// 同時移除 Course 和 Student 中的 ratings 關聯
```

**Step 2：推送並生成**

```bash
pnpx prisma db push
pnpx prisma generate
```

**完成！表格已從資料庫刪除**

---

## 🚀 Server Actions 範本

### 完整 CRUD Actions

```typescript
// lib/actions/students/student.actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ==================== 查詢 ====================

export async function getStudents() {
  try {
    const students = await prisma.student.findMany({
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: students };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "查詢失敗",
    };
  }
}

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
    return {
      success: false,
      error: error instanceof Error ? error.message : "查詢失敗",
    };
  }
}

// ==================== 建立 ====================

export async function createStudent(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string | undefined;
    const age = formData.get("age")
      ? parseInt(formData.get("age") as string)
      : undefined;
    const level = (formData.get("level") as string) || "beginner";

    if (!name || !email) {
      return { success: false, error: "姓名和電子郵件為必填" };
    }

    const student = await prisma.student.create({
      data: { name, email, phone, age, level },
    });

    revalidatePath("/students");
    return { success: true, data: student };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "建立失敗",
    };
  }
}

// ==================== 更新 ====================

export async function updateStudent(id: string, formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string | undefined;
    const age = formData.get("age")
      ? parseInt(formData.get("age") as string)
      : undefined;
    const level = formData.get("level") as string;

    const student = await prisma.student.update({
      where: { id },
      data: { name, email, phone, age, level },
    });

    revalidatePath("/students");
    revalidatePath(`/students/${id}`);
    return { success: true, data: student };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "更新失敗",
    };
  }
}

// ==================== 刪除 ====================

export async function deleteStudent(id: string) {
  try {
    await prisma.student.delete({
      where: { id },
    });

    revalidatePath("/students");
    return { success: true, data: { id } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "刪除失敗",
    };
  }
}
```

---

## 🛠️ 常用命令

```bash
# ==================== 開發常用 ====================

# 推送 schema 變更到資料庫（快速，開發用）
pnpx prisma db push

# 生成 Prisma Client（使用新 schema）
pnpx prisma generate

# 開啟 Prisma Studio（視覺化管理資料）
pnpx prisma studio

# 格式化 schema.prisma
pnpx prisma format

# ==================== 資料庫管理 ====================

# 從資料庫拉取 schema（已有表格時使用）
pnpx prisma db pull

# 驗證 schema 語法
pnpx prisma validate

# ==================== 開發伺服器 ====================

# 啟動 Next.js 開發伺服器
pnpm dev
```

---

## 📋 完整工作流程範例

### 情境：新增「學生成績」功能

**1. 修改 Schema**

```prisma
// prisma/schema.prisma
model Grade {
  id        String   @id @default(dbgenerated("(gen_random_uuid())::text"))
  studentId String   @map("student_id")
  subject   String
  score     Int
  createdAt DateTime @default(now()) @map("created_at")

  student Student @relation(fields: [studentId], references: [id], onDelete: Cascade)

  @@map("grades")
}

model Student {
  // ... 原有欄位
  grades Grade[]  // 新增
}
```

**2. 推送並生成**

```bash
pnpx prisma db push
pnpx prisma generate
```

**3. 建立 Actions**

```typescript
// lib/actions/grades/grade.actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createGrade(
  studentId: string,
  subject: string,
  score: number
) {
  try {
    const grade = await prisma.grade.create({
      data: { studentId, subject, score },
    });

    revalidatePath(`/students/${studentId}`);
    return { success: true, data: grade };
  } catch (error) {
    return { success: false, error: "建立成績失敗" };
  }
}

export async function getStudentGrades(studentId: string) {
  try {
    const grades = await prisma.grade.findMany({
      where: { studentId },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: grades };
  } catch (error) {
    return { success: false, error: "查詢成績失敗" };
  }
}
```

**4. 在頁面使用**

```typescript
// app/(private)/students/[id]/page.tsx
import { getStudentGrades } from "@/lib/actions/grades/grade.actions";

export default async function StudentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { data: grades } = await getStudentGrades(params.id);

  return (
    <div>
      <h1>學生成績</h1>
      {grades?.map((grade) => (
        <div key={grade.id}>
          {grade.subject}: {grade.score} 分
        </div>
      ))}
    </div>
  );
}
```

**5. 測試**

```bash
# 啟動開發伺服器
pnpm dev

# 開啟 Prisma Studio 查看資料
pnpx prisma studio
```

**完成！⏱️ 總耗時：10-15 分鐘**

---

## 🎯 你的當前 Models

```
✅ Student      - 學生
✅ School       - 學校
✅ Course       - 課程
✅ Class        - 課堂
✅ Partnership  - 合作關係
✅ Enrollment   - 報名（學生 ↔ 課程）
```

**查看完整 Schema：** `prisma/schema.prisma`

---

## ⚡ 快速參考

### 改表 = 3 個命令

```bash
# 1. 修改 prisma/schema.prisma
# 2. pnpx prisma db push
# 3. pnpx prisma generate
```

### 新表 = 同樣 3 個命令

```bash
# 1. 在 schema.prisma 加 model
# 2. pnpx prisma db push
# 3. pnpx prisma generate
```

### 刪表 = 同樣 3 個命令

```bash
# 1. 從 schema.prisma 移除 model
# 2. pnpx prisma db push
# 3. pnpx prisma generate
```

---

## 🚨 常見問題

### Q: 改 schema 後忘記 generate？

**現象：** TypeScript 報錯找不到新欄位

**解決：**

```bash
pnpx prisma generate
```

### Q: 資料庫和 schema 不同步？

**解決：**

```bash
# 從資料庫拉取最新 schema
pnpx prisma db pull

# 重新生成
pnpx prisma generate
```

### Q: 想重設資料庫？

**解決（⚠️ 會刪除所有資料）：**

```bash
pnpx prisma migrate reset
```

### Q: 想視覺化管理資料？

**解決：**

```bash
pnpx prisma studio
# 開啟 http://localhost:5555
```

---

## 📚 相關文檔

- **完整設定：** `docs/PRISMA_SETUP_FINAL.md`
- **Prisma 官方：** https://www.prisma.io/docs
- **Neon Console：** https://console.neon.tech

---

## ✅ 總結

你現在使用 **100% Prisma ORM**：

```typescript
import { prisma } from "@/lib/prisma";

// 所有操作都用 prisma.*
const data = await prisma.student.findMany();
```

**改表流程：**

1. 改 `schema.prisma`
2. `pnpx prisma db push`
3. `pnpx prisma generate`

**就這麼簡單！** 🎉

---

**最後更新：** 2026-01-30  
**系統：** 純 Prisma ORM  
**環境：** ✅ 可立即使用
