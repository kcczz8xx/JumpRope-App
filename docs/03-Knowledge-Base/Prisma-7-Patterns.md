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

## 🔧 改表流程（2 步驟）

### 情境：新增學生的「班級」欄位

**Step 1：修改對應的 Schema 文件**

你的系統使用多文件架構，Models 按類別分類：

- `prisma/schema/student.prisma` - 學生相關
- `prisma/schema/school.prisma` - 學校相關

修改 `prisma/schema/student.prisma`：

```prisma
model Student {
  id          String       @id @default(dbgenerated("(gen_random_uuid())::text"))
  name        String
  email       String       @unique
  phone       String?
  age         Int?
  level       String?      @default("beginner")
  grade       String?      // 新增這行
  createdAt   DateTime     @default(now()) @map("created_at") @db.Timestamp(6)
  updatedAt   DateTime     @default(now()) @map("updated_at") @db.Timestamp(6)

  enrollments Enrollment[]

  @@map("students")
}
```

**Step 2：推送到資料庫（自動生成 Client）**

```bash
pnpx prisma db push
```

> 💡 `db push` 會自動執行 `prisma generate`，無需額外命令

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

**⏱️ 總耗時：1-2 分鐘**

---

## 📊 新增表格流程

### 情境：新增「課程評分」表

**Step 1：選擇對應的 Schema 文件新增 Model**

根據 Model 類別選擇文件：

- 學生相關 → `prisma/schema/student.prisma`
- 學校/課程相關 → `prisma/schema/school.prisma`
- 新類別 → 創建新文件（如 `prisma/schema/rating.prisma`）

在 `prisma/schema/school.prisma` 新增：

```prisma
model CourseRating {
  id        String   @id @default(dbgenerated("(gen_random_uuid())::text"))
  courseId  String   @map("course_id")
  studentId String   @map("student_id")
  rating    Int
  comment   String?
  createdAt DateTime @default(now()) @map("created_at") @db.Timestamp(6)
  updatedAt DateTime @default(now()) @map("updated_at") @db.Timestamp(6)

  course  Course  @relation(fields: [courseId], references: [id], onDelete: Cascade)
  student Student @relation(fields: [studentId], references: [id], onDelete: Cascade)

  @@map("course_ratings")
}
```

同時在 `Course` model 中新增關聯：

```prisma
model Course {
  // ... 原有欄位
  ratings CourseRating[]  // 新增這行
}
```

在 `prisma/schema/student.prisma` 的 `Student` model 中新增：

```prisma
model Student {
  // ... 原有欄位
  ratings CourseRating[]  // 新增這行
}
```

**Step 2：推送到資料庫**

```bash
pnpx prisma db push
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

**Step 1：從對應的 Schema 文件移除 Model**

1. 從 `prisma/schema/school.prisma` 刪除整個 `CourseRating` model
2. 從 `Course` model 移除 `ratings CourseRating[]` 關聯
3. 從 `prisma/schema/student.prisma` 的 `Student` model 移除 `ratings CourseRating[]` 關聯

**Step 2：推送到資料庫**

```bash
pnpx prisma db push
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

# 推送 schema 變更到資料庫（自動生成 Client）
pnpx prisma db push

# 單獨生成 Prisma Client（通常不需要，db push 會自動執行）
pnpx prisma generate

# 開啟 Prisma Studio（視覺化管理資料）
pnpx prisma studio

# 格式化所有 .prisma 文件
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

在 `prisma/schema/student.prisma` 新增：

```prisma
model Grade {
  id        String   @id @default(dbgenerated("(gen_random_uuid())::text"))
  studentId String   @map("student_id")
  subject   String
  score     Int
  createdAt DateTime @default(now()) @map("created_at") @db.Timestamp(6)
  updatedAt DateTime @default(now()) @map("updated_at") @db.Timestamp(6)

  student Student @relation(fields: [studentId], references: [id], onDelete: Cascade)

  @@map("grades")
}

model Student {
  // ... 原有欄位
  grades Grade[]  // 新增這行
}
```

**2. 推送到資料庫**

```bash
pnpx prisma db push
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

### 多文件 Schema 架構

```
prisma/
├── schema.prisma              # 基礎配置（generator + datasource）
└── schema/
    ├── user.prisma            # 用戶相關
    │   ├── User              - 用戶（電話註冊）
    │   ├── UserRole          - 用戶角色（STUDENT/TUTOR/ADMIN/STAFF）
    │   └── TutorProfile      - 導師資料
    │
    └── school.prisma          # 到校服務模組
        │
        │  # Enums
        ├── PartnershipStatus  - 合作狀態
        ├── QuotationStatus    - 報價狀態
        ├── CourseType         - 課程類型
        ├── CourseStatus       - 課程狀態（NEW）
        ├── ChargingModel      - 收費模式
        ├── LessonType         - 課堂類型
        ├── LessonStatus       - 課堂狀態
        ├── InvoiceStatus      - 發票狀態（含 PENDING_APPROVAL/VOID）
        ├── PaymentStatus      - 付款狀態
        ├── PaymentMethod      - 付款方式
        ├── TutorRole          - 導師角色
        ├── AttendanceStatus   - 出勤狀態
        ├── SalaryCalculationMode - 薪資計算模式
        └── CourseTerm         - 學期
        │
        │  # Models
        ├── School             - 合作學校
        ├── SchoolContact      - 學校聯絡人（@@unique: schoolId + email）
        ├── SchoolQuotation    - 報價單（sentByUser → User）
        ├── SchoolQuotationItem - 報價項目
        ├── SchoolCourse       - 到校課程（含 status 欄位）
        ├── SchoolLesson       - 到校課堂（invoice → SchoolInvoice）
        ├── SchoolInvoice      - 發票（lessons[] 支援個別課堂出發票）
        ├── SchoolInvoiceCourse - 發票-課程關聯
        ├── SchoolReceipt      - 收據
        └── SchoolTutorLesson  - 導師任教記錄（@@unique: lessonId + userId）
```

### 關聯圖

```
User ─────────────────────────────────────────────────────────┐
  │                                                           │
  ├── TutorProfile（一對一）                                   │
  ├── SchoolTutorLesson[]（任教記錄）                          │
  └── SchoolQuotation[]（發送的報價單，@relation: QuotationSentBy）
                                                              │
School ───────────────────────────────────────────────────────┤
  │                                                           │
  ├── SchoolContact[]（聯絡人）                                │
  ├── SchoolQuotation[] ─── SchoolQuotationItem[]             │
  ├── SchoolCourse[] ─┬─ SchoolLesson[] ─── SchoolTutorLesson[]
  │                   │        │
  │                   │        └── SchoolInvoice（可選，個別課堂出發票）
  │                   │
  │                   └── SchoolInvoiceCourse[]（多對多）
  │                              │
  ├── SchoolInvoice[] ──────────┴─── SchoolReceipt（一對一）
  └── SchoolReceipt[]
```

### 重要約束

| Model                 | 唯一約束                          | 說明                     |
| --------------------- | --------------------------------- | ------------------------ |
| `SchoolContact`       | `@@unique([schoolId, email])`     | 同一學校不可有重複電郵   |
| `SchoolTutorLesson`   | `@@unique([lessonId, userId])`    | 防止同一課堂重複分配導師 |
| `SchoolInvoiceCourse` | `@@unique([invoiceId, courseId])` | 同一發票不可重複加入課程 |

**查看 Schema：**

- 用戶相關：`prisma/schema/user.prisma`
- 到校服務：`prisma/schema/school.prisma`
- 基礎配置：`prisma/schema.prisma`

---

## ⚡ 快速參考

### 改表 = 2 步驟

```bash
# 1. 修改對應的 .prisma 文件（student.prisma 或 school.prisma）
# 2. pnpx prisma db push
```

### 新表 = 2 步驟

```bash
# 1. 在對應的 .prisma 文件加 model（或創建新文件）
# 2. pnpx prisma db push
```

### 刪表 = 2 步驟

```bash
# 1. 從對應的 .prisma 文件移除 model
# 2. pnpx prisma db push
```

> 💡 **提示：** `db push` 會自動執行 `generate`，無需手動運行

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

1. 改對應的 `.prisma` 文件（`student.prisma` 或 `school.prisma`）
2. `pnpx prisma db push`

**就這麼簡單！** 🎉

**多文件優勢：**

- ✅ 按類別分類，結構清晰
- ✅ 多人協作不衝突
- ✅ 易於維護和查找

---

**最後更新：** 2026-01-30  
**系統：** 純 Prisma ORM  
**環境：** ✅ 可立即使用
