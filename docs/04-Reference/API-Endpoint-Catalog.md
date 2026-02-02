# 🔐 角色權限矩陣

> 本文檔定義學校服務系統的角色與權限設計

---

## 👥 角色定義

| 角色       | 代碼           | 說明         | 主要職責                  |
| ---------- | -------------- | ------------ | ------------------------- |
| 管理員     | `ADMIN`        | 系統管理員   | 全系統權限，管理所有學校  |
| 學校負責人 | `SCHOOL_ADMIN` | 學校管理人員 | 唯讀自己學校的資料        |
| 導師       | `TUTOR`        | 任教導師     | 簽到/簽退、查看自己的課堂 |
| 財務       | `FINANCE`      | 財務人員     | 發票/收款管理             |

---

## 🚪 入口分流

```typescript
// dashboard/page.tsx
function redirectByRole(role: UserRole): string {
  switch (role) {
    case "ADMIN":
      return "/dashboard/school/overview";
    case "SCHOOL_ADMIN":
      return "/dashboard/school/overview";
    case "TUTOR":
      return "/dashboard/school/my-lessons";
    case "FINANCE":
      return "/dashboard/school/finance";
    default:
      return "/error/unauthorized";
  }
}
```

---

## 📊 頁面權限矩陣

### 完整權限表

| 頁面                        |    ADMIN    | SCHOOL_ADMIN |    TUTOR    |   FINANCE   |
| --------------------------- | :---------: | :----------: | :---------: | :---------: |
| **overview**                |   ✅ 全部   | ✅ 自己學校  |     ❌      | ✅ 財務數據 |
| **my-lessons**              | 👁️ 查看所有 | 👁️ 學校課堂  | ✅ 自己課堂 |     ❌      |
| **finance**                 |     ✅      |      ❌      |     ❌      |     ✅      |
| **quotations**              |   ✅ CRUD   | 👁️ 自己學校  |     ❌      |     ❌      |
| **quotations/new**          |     ✅      |      ❌      |     ❌      |     ❌      |
| **quotations/[id]**         |   ✅ 編輯   |   👁️ 唯讀    |     ❌      |     ❌      |
| **quotations/[id]/convert** |     ✅      |      ❌      |     ❌      |     ❌      |
| **courses**                 |   ✅ CRUD   | 👁️ 自己學校  | 👁️ 任教課程 |     ❌      |
| **courses/new**             |     ✅      |      ❌      |     ❌      |     ❌      |
| **courses/[id]**            |   ✅ 編輯   |   👁️ 唯讀    |   👁️ 唯讀   |     ❌      |
| **schedule**                |   ✅ 編輯   |      ❌      | 👁️ 自己排班 |     ❌      |
| **invoices**                |   ✅ CRUD   | 👁️ 自己學校  |     ❌      |   ✅ CRUD   |
| **invoices/generate**       |     ✅      |      ❌      |     ❌      |     ✅      |
| **invoices/[id]**           |     ✅      |   👁️ 唯讀    |     ❌      |     ✅      |
| **invoices/[id]/payment**   |     ✅      |      ❌      |     ❌      |     ✅      |

### 圖例說明

- ✅ = 完整權限（增刪改查）
- 👁️ = 唯讀權限
- ❌ = 無權限
- CRUD = Create, Read, Update, Delete

---

## 🔍 資料過濾規則

### ADMIN（管理員）

```typescript
// 無需過濾，可存取所有資料
const schools = await prisma.school.findMany();
const quotations = await prisma.schoolQuotation.findMany();
```

### SCHOOL_ADMIN（學校負責人）

```typescript
// 只能存取自己學校的資料
const userSchoolId = session.user.schoolId;

const quotations = await prisma.schoolQuotation.findMany({
  where: { schoolId: userSchoolId },
});

const courses = await prisma.schoolCourse.findMany({
  where: { schoolId: userSchoolId },
});

const invoices = await prisma.schoolInvoice.findMany({
  where: { schoolId: userSchoolId },
});
```

### TUTOR（導師）

```typescript
// 只能存取自己任教的課程/課堂
const userId = session.user.id;

const myLessons = await prisma.schoolTutorLesson.findMany({
  where: { userId },
  include: {
    lesson: {
      include: {
        course: {
          include: { school: true },
        },
      },
    },
  },
});

// 課程列表：只顯示有任教的課程
const myCourses = await prisma.schoolCourse.findMany({
  where: {
    lessons: {
      some: {
        tutorLessons: {
          some: { userId },
        },
      },
    },
  },
});
```

### FINANCE（財務）

```typescript
// 可存取所有發票和收款資料，但不能存取課程詳情
const invoices = await prisma.schoolInvoice.findMany({
  include: {
    school: { select: { id: true, schoolName: true } },
    receipts: true,
  },
});

// 財務報表資料
const financeSummary = await prisma.schoolInvoice.aggregate({
  _sum: { invoiceAmount: true, paidAmount: true },
});
```

---

## 🛡️ API 權限檢查

### 權限檢查 Middleware

```typescript
// lib/permissions.ts
export type Permission =
  | "quotation:read"
  | "quotation:create"
  | "quotation:update"
  | "quotation:delete"
  | "course:read"
  | "course:create"
  | "course:update"
  | "course:delete"
  | "lesson:read"
  | "lesson:create"
  | "lesson:checkin"
  | "invoice:read"
  | "invoice:create"
  | "invoice:payment"
  | "schedule:read"
  | "schedule:assign";

export const rolePermissions: Record<UserRole, Permission[]> = {
  ADMIN: [
    "quotation:read",
    "quotation:create",
    "quotation:update",
    "quotation:delete",
    "course:read",
    "course:create",
    "course:update",
    "course:delete",
    "lesson:read",
    "lesson:create",
    "lesson:checkin",
    "invoice:read",
    "invoice:create",
    "invoice:payment",
    "schedule:read",
    "schedule:assign",
  ],
  SCHOOL_ADMIN: [
    "quotation:read",
    "course:read",
    "lesson:read",
    "invoice:read",
  ],
  TUTOR: ["course:read", "lesson:read", "lesson:checkin", "schedule:read"],
  FINANCE: ["invoice:read", "invoice:create", "invoice:payment"],
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return rolePermissions[role]?.includes(permission) ?? false;
}
```

### API Route 範例

```typescript
// app/api/quotations/route.ts
import { getServerSession } from "next-auth";
import { hasPermission } from "@/lib/permissions";

export async function POST(request: Request) {
  const session = await getServerSession();

  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasPermission(session.user.role, "quotation:create")) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  // 處理創建報價...
}
```

---

## 🖥️ 前端權限控制

### PermissionAwareComponent

```typescript
// components/ui/PermissionAwareComponent.tsx
interface PermissionAwareComponentProps {
  requiredPermissions?: Permission[];
  requiredRoles?: UserRole[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function PermissionAwareComponent({
  requiredPermissions = [],
  requiredRoles = [],
  fallback = null,
  children,
}: PermissionAwareComponentProps) {
  const { user } = useSession();

  if (!user) return fallback;

  // 檢查角色
  if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
    return fallback;
  }

  // 檢查權限
  const hasAllPermissions = requiredPermissions.every((permission) =>
    hasPermission(user.role, permission)
  );

  if (!hasAllPermissions) return fallback;

  return <>{children}</>;
}
```

### 使用範例

```tsx
// 只有 ADMIN 可見的按鈕
<PermissionAwareComponent requiredRoles={['ADMIN']}>
  <Button onClick={handleDelete}>刪除報價</Button>
</PermissionAwareComponent>

// 需要特定權限的元素
<PermissionAwareComponent requiredPermissions={['invoice:create']}>
  <Link href="/dashboard/school/invoices/generate">
    生成發票
  </Link>
</PermissionAwareComponent>

// 多角色可見
<PermissionAwareComponent requiredRoles={['ADMIN', 'FINANCE']}>
  <FinanceSummaryCard />
</PermissionAwareComponent>
```

---

## 📄 頁面級權限保護

### Server Component 範例

```typescript
// app/(private)/dashboard/school/quotations/new/page.tsx
import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";

export default async function NewQuotationPage() {
  const session = await getServerSession();

  // 檢查登入
  if (!session?.user) {
    redirect("/login");
  }

  // 檢查權限 - 非授權角色返回 404
  if (session.user.role !== "ADMIN") {
    notFound();
  }

  return <NewQuotationForm />;
}
```

### 權限檢查原則

**重要：當用戶角色不符合頁面要求時，應使用 `notFound()` 返回 404 頁面，而非 redirect 或顯示錯誤訊息。**

理由：

- 安全性：不透露頁面存在性
- 用戶體驗：避免非授權用戶看到無法訪問的內容
- 一致性：統一的錯誤處理方式

### Client Component 範例

```typescript
// components/school/QuotationActions.tsx
"use client";

import { useSession } from "next-auth/react";

export function QuotationActions({ quotationId }: { quotationId: string }) {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <div className="flex gap-2">
      <Button onClick={handleView}>查看</Button>

      {isAdmin && (
        <>
          <Button onClick={handleEdit}>編輯</Button>
          <Button onClick={handleDelete} variant="danger">
            刪除
          </Button>
        </>
      )}
    </div>
  );
}
```

---

## 🔒 特殊權限場景

### 1. 導師只能簽到自己的課堂

```typescript
// API: POST /api/lessons/[id]/checkin
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession();
  const lessonId = params.id;

  // 檢查該導師是否被分配到這堂課
  const tutorLesson = await prisma.schoolTutorLesson.findFirst({
    where: {
      lessonId,
      userId: session.user.id,
    },
  });

  if (!tutorLesson) {
    return Response.json({ error: "您未被分配到此課堂" }, { status: 403 });
  }

  // 執行簽到...
}
```

### 2. SCHOOL_ADMIN 只能查看自己學校的資料

```typescript
// API: GET /api/quotations/[id]
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession();

  const quotation = await prisma.schoolQuotation.findUnique({
    where: { id: params.id },
    include: { school: true },
  });

  if (!quotation) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  // SCHOOL_ADMIN 只能查看自己學校
  if (
    session.user.role === "SCHOOL_ADMIN" &&
    quotation.schoolId !== session.user.schoolId
  ) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  return Response.json(quotation);
}
```

### 3. 發票只能由 ADMIN 或 FINANCE 生成

```typescript
// API: POST /api/invoices/generate
export async function POST(request: Request) {
  const session = await getServerSession();

  if (!["ADMIN", "FINANCE"].includes(session.user.role)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  // 生成發票...
}
```

---

## 📋 權限檢查清單

### 新增功能時的檢查項目

- [ ] 定義該功能所需的權限
- [ ] 在 `rolePermissions` 中配置
- [ ] API Route 加入權限檢查
- [ ] 前端按鈕/連結使用 `PermissionAwareComponent` 包裝
- [ ] 列表頁面加入資料過濾（根據角色）
- [ ] 詳情頁面加入存取檢查
- [ ] 測試各角色的存取情況
