# API Route 實作

## 檔案位置

`@/app/api/school-service/courses/batch-with-school/route.ts`

## API 端點

```
POST /api/school-service/courses/batch-with-school
```

## 功能說明

此 API 負責批次建立學校、聯絡人和課程資料，使用 Prisma Transaction 確保資料一致性。

## 請求格式

### Request Body

```typescript
{
  school: {
    schoolId?: string;              // 可選，更新現有學校時提供
    schoolName: string;
    schoolNameEn?: string;
    address: string;
    phone?: string;
    email?: string;
    website?: string;
    partnershipStartDate: string;   // ISO 8601 格式
    partnershipEndDate?: string;
    partnershipStartYear: string;   // 例如："2026-2028"
    confirmationChannel: string;
    remarks?: string;
  },
  contact: {
    nameChinese: string;
    nameEnglish?: string;
    position?: string;
    phone?: string;
    mobile?: string;
    email?: string;
    isPrimary: boolean;
  },
  academicYear: string;             // 例如："2026-2027"
  courses: [
    {
      courseName: string;
      courseType: string;
      courseTerm: "FULL_YEAR" | "FIRST_TERM" | "SECOND_TERM" | "SUMMER";
      startDate?: string;
      endDate?: string;
      requiredTutors: number;
      maxStudents?: number;
      courseDescription?: string;
      chargingModel: string[];      // ChargingModel enum 陣列
      studentPerLessonFee?: number;
      studentHourlyFee?: number;
      studentFullCourseFee?: number;
      teamActivityFee?: number;
      tutorPerLessonFee?: number;
      tutorHourlyFee?: number;
    }
  ]
}
```

### 請求範例

```json
{
  "school": {
    "schoolName": "測試小學",
    "schoolNameEn": "Test Primary School",
    "address": "九龍測試道123號",
    "phone": "21234567",
    "email": "info@testschool.edu.hk",
    "website": "https://www.testschool.edu.hk",
    "partnershipStartDate": "2026-01-01",
    "partnershipEndDate": "2028-01-02",
    "partnershipStartYear": "2026-2028",
    "confirmationChannel": "電郵",
    "remarks": "這是一條測試備註"
  },
  "contact": {
    "nameChinese": "陳大文",
    "nameEnglish": "Chan Tai Man",
    "position": "體育科主任",
    "phone": "21234567",
    "mobile": "91234567",
    "email": "chan@testschool.edu.hk",
    "isPrimary": true
  },
  "academicYear": "2026-2027",
  "courses": [
    {
      "courseName": "跳繩恆常班（上學期）",
      "courseType": "興趣班",
      "courseTerm": "FIRST_TERM",
      "requiredTutors": 2,
      "maxStudents": 30,
      "courseDescription": "適合小三至小五學生，教授基本跳繩技巧及花式跳繩",
      "chargingModel": ["STUDENT_PER_LESSON", "TUTOR_PER_LESSON"],
      "studentPerLessonFee": 50,
      "tutorPerLessonFee": 800
    }
  ]
}
```

## 回應格式

### 成功回應 (200)

```json
{
  "schoolId": "cml13k3vs000041caeff9vomt",
  "coursesCount": 1
}
```

### 錯誤回應 (400)

```json
{
  "message": "無效的請求數據"
}
```

### 錯誤回應 (500)

```json
{
  "message": "建立失敗",
  "error": "詳細錯誤訊息"
}
```

## 完整實作

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CourseTerm, ChargingModel } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    // 1. 解析請求資料
    const body = await request.json();
    const { school, contact, academicYear, courses } = body;

    // 2. 驗證必要欄位
    if (!school || !contact || !courses || !Array.isArray(courses)) {
      return NextResponse.json({ message: "無效的請求數據" }, { status: 400 });
    }

    // 3. 使用 Transaction 處理
    const result = await prisma.$transaction(async (tx) => {
      // 3.1 處理學校
      let schoolId = school.schoolId;

      if (schoolId) {
        // 更新現有學校
        await tx.school.update({
          where: { id: schoolId },
          data: {
            schoolName: school.schoolName,
            schoolNameEn: school.schoolNameEn,
            address: school.address,
            phone: school.phone,
            email: school.email,
            website: school.website,
            partnershipStartDate: school.partnershipStartDate
              ? new Date(school.partnershipStartDate)
              : undefined,
            partnershipEndDate: school.partnershipEndDate
              ? new Date(school.partnershipEndDate)
              : null,
            partnershipStartYear: school.partnershipStartYear,
            confirmationChannel: school.confirmationChannel,
            remarks: school.remarks,
          },
        });
      } else {
        // 創建新學校
        const newSchool = await tx.school.create({
          data: {
            schoolName: school.schoolName,
            schoolNameEn: school.schoolNameEn,
            address: school.address,
            phone: school.phone,
            email: school.email,
            website: school.website,
            partnershipStartDate: school.partnershipStartDate
              ? new Date(school.partnershipStartDate)
              : null,
            partnershipEndDate: school.partnershipEndDate
              ? new Date(school.partnershipEndDate)
              : null,
            partnershipStartYear: school.partnershipStartYear,
            confirmationChannel: school.confirmationChannel,
            remarks: school.remarks,
            partnershipStatus: "CONFIRMED",
          },
        });
        schoolId = newSchool.id;
      }

      // 3.2 處理聯絡人
      const existingContact = await tx.schoolContact.findFirst({
        where: {
          schoolId: schoolId,
          email: contact.email,
        },
      });

      if (existingContact) {
        // 更新現有聯絡人
        await tx.schoolContact.update({
          where: { id: existingContact.id },
          data: {
            nameChinese: contact.nameChinese,
            nameEnglish: contact.nameEnglish,
            position: contact.position,
            phone: contact.phone,
            mobile: contact.mobile,
            isPrimary: contact.isPrimary,
          },
        });
      } else {
        // 創建新聯絡人
        await tx.schoolContact.create({
          data: {
            schoolId: schoolId,
            nameChinese: contact.nameChinese,
            nameEnglish: contact.nameEnglish,
            position: contact.position,
            phone: contact.phone,
            mobile: contact.mobile,
            email: contact.email,
            isPrimary: contact.isPrimary,
          },
        });
      }

      // 3.3 批次創建課程
      const createdCourses = [];
      for (const course of courses) {
        const createdCourse = await tx.schoolCourse.create({
          data: {
            schoolId: schoolId,
            courseName: course.courseName,
            courseType: course.courseType,
            courseTerm: course.courseTerm as CourseTerm,
            academicYear: academicYear,
            startDate: course.startDate ? new Date(course.startDate) : null,
            endDate: course.endDate ? new Date(course.endDate) : null,
            requiredTutors: course.requiredTutors || 1,
            maxStudents: course.maxStudents,
            description: course.courseDescription,
            chargingModels: course.chargingModel as ChargingModel[],
            studentPerLessonFee: course.studentPerLessonFee,
            studentHourlyFee: course.studentHourlyFee,
            studentFullCourseFee: course.studentFullCourseFee,
            teamActivityFee: course.teamActivityFee,
            tutorPerLessonFee: course.tutorPerLessonFee,
            tutorHourlyFee: course.tutorHourlyFee,
            status: "DRAFT",
          },
        });
        createdCourses.push(createdCourse);
      }

      return {
        schoolId,
        coursesCount: createdCourses.length,
      };
    });

    // 4. 返回成功結果
    return NextResponse.json(result);
  } catch (error) {
    // 5. 錯誤處理
    console.error("Failed to batch create with school:", error);
    return NextResponse.json(
      {
        message: "建立失敗",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
```

## 核心邏輯詳解

### 1. 請求驗證

```typescript
if (!school || !contact || !courses || !Array.isArray(courses)) {
  return NextResponse.json({ message: "無效的請求數據" }, { status: 400 });
}
```

**驗證項目：**

- `school` 物件存在
- `contact` 物件存在
- `courses` 陣列存在且為陣列類型

### 2. Transaction 處理

```typescript
const result = await prisma.$transaction(async (tx) => {
  // 所有資料庫操作
});
```

**優點：**

- 確保原子性：全部成功或全部失敗
- 避免資料不一致
- 自動回滾錯誤操作

**Transaction 流程：**

```
開始 Transaction
  ↓
處理學校 (新增/更新)
  ↓
處理聯絡人 (新增/更新)
  ↓
批次建立課程
  ↓
提交 Transaction
```

### 3. 學校處理邏輯

```typescript
let schoolId = school.schoolId;

if (schoolId) {
  // 更新現有學校
  await tx.school.update({
    where: { id: schoolId },
    data: {
      /* 更新資料 */
    },
  });
} else {
  // 創建新學校
  const newSchool = await tx.school.create({
    data: {
      /* 新增資料 */
    },
  });
  schoolId = newSchool.id;
}
```

**決策邏輯：**

- 如果提供 `schoolId` → 更新現有學校
- 如果沒有 `schoolId` → 創建新學校
- 新學校的 `partnershipStatus` 預設為 `CONFIRMED`

### 4. 聯絡人處理邏輯

```typescript
const existingContact = await tx.schoolContact.findFirst({
  where: {
    schoolId: schoolId,
    email: contact.email,
  },
});

if (existingContact) {
  // 更新現有聯絡人
  await tx.schoolContact.update({
    /* ... */
  });
} else {
  // 創建新聯絡人
  await tx.schoolContact.create({
    /* ... */
  });
}
```

**決策邏輯：**

- 根據 `schoolId` + `email` 查詢是否已存在
- 存在 → 更新資料
- 不存在 → 創建新聯絡人

**注意事項：**

- 使用 `email` 作為唯一識別（同一學校不可有重複 email）
- Schema 中有 `@@unique([schoolId, email])` 約束

### 5. 課程批次建立

```typescript
const createdCourses = [];
for (const course of courses) {
  const createdCourse = await tx.schoolCourse.create({
    data: {
      schoolId: schoolId,
      courseName: course.courseName,
      // ... 其他欄位
      chargingModels: course.chargingModel as ChargingModel[],
      status: "DRAFT",
    },
  });
  createdCourses.push(createdCourse);
}
```

**處理要點：**

- 使用 `for...of` 循環逐一建立
- 所有課程的 `status` 預設為 `DRAFT`
- `chargingModel` (前端) → `chargingModels` (資料庫)
- 收集所有建立的課程以計算數量

## 資料類型轉換

### 1. 日期轉換

```typescript
// 前端：字串格式 "2026-01-01"
partnershipStartDate: "2026-01-01";

// 後端：轉換為 Date 物件
partnershipStartDate: new Date("2026-01-01");

// 資料庫：DateTime 類型
```

**處理方式：**

```typescript
partnershipStartDate: school.partnershipStartDate
  ? new Date(school.partnershipStartDate)
  : null;
```

### 2. Enum 轉換

```typescript
// 前端：字串
courseTerm: "FIRST_TERM";

// 後端：轉換為 Prisma Enum
courseTerm: course.courseTerm as CourseTerm;

// 資料庫：Enum 類型
```

### 3. 陣列轉換

```typescript
// 前端：字串陣列
chargingModel: ["STUDENT_PER_LESSON", "TUTOR_PER_LESSON"];

// 後端：轉換為 Prisma Enum 陣列
chargingModels: course.chargingModel as ChargingModel[];

// 資料庫：Enum[] 類型
```

## 錯誤處理

### 1. Try-Catch 包裹

```typescript
try {
  // 所有邏輯
} catch (error) {
  console.error("Failed to batch create with school:", error);
  return NextResponse.json(
    {
      message: "建立失敗",
      error: error instanceof Error ? error.message : "Unknown error",
    },
    { status: 500 }
  );
}
```

### 2. Transaction 自動回滾

```typescript
await prisma.$transaction(async (tx) => {
  // 如果任何操作失敗，整個 transaction 會自動回滾
});
```

### 3. 錯誤訊息記錄

```typescript
console.error("Failed to batch create with school:", error);
```

**用途：**

- 開發階段除錯
- 生產環境日誌記錄
- 追蹤錯誤來源

## 效能考量

### 1. Transaction 使用

**優點：**

- 資料一致性
- 自動回滾

**缺點：**

- 鎖定資料庫資源
- 可能影響並發效能

**建議：**

- Transaction 內的操作盡量簡潔
- 避免在 Transaction 內執行耗時操作

### 2. 批次建立優化

**目前實作：**

```typescript
for (const course of courses) {
  await tx.schoolCourse.create({ ... });
}
```

**優化方案（未來）：**

```typescript
await tx.schoolCourse.createMany({
  data: courses.map(course => ({ ... })),
});
```

**注意：** `createMany` 不返回建立的記錄，需要權衡。

## 安全性考量

### 1. 輸入驗證

```typescript
// ✅ 驗證必要欄位
if (!school || !contact || !courses || !Array.isArray(courses)) {
  return NextResponse.json({ message: "無效的請求數據" }, { status: 400 });
}
```

**建議增強：**

- 使用 Zod 或 Yup 進行 schema 驗證
- 驗證欄位格式（email、電話等）
- 驗證數值範圍

### 2. SQL Injection 防護

Prisma 自動處理參數化查詢，無需額外處理。

### 3. 權限檢查

**未來擴展：**

```typescript
// 檢查使用者是否有建立課程的權限
const session = await getServerSession();
if (!session || !hasPermission(session.user, "course:create")) {
  return NextResponse.json({ message: "無權限" }, { status: 403 });
}
```

## 測試建議

### 1. 單元測試

```typescript
describe("POST /api/school-service/courses/batch-with-school", () => {
  it("should create new school and courses", async () => {
    const response = await POST(mockRequest);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty("schoolId");
    expect(data.coursesCount).toBe(1);
  });

  it("should return 400 for invalid data", async () => {
    const response = await POST(invalidRequest);
    expect(response.status).toBe(400);
  });
});
```

### 2. 整合測試

```typescript
describe('Batch create integration', () => {
  it('should create school, contact and courses in transaction', async () => {
    // 發送請求
    const response = await fetch('/api/...', { ... });

    // 驗證資料庫
    const school = await prisma.school.findUnique({ ... });
    const contacts = await prisma.schoolContact.findMany({ ... });
    const courses = await prisma.schoolCourse.findMany({ ... });

    expect(school).toBeDefined();
    expect(contacts).toHaveLength(1);
    expect(courses).toHaveLength(1);
  });
});
```

## 日誌記錄

### 開發環境

```typescript
console.log("Creating school:", school.schoolName);
console.log("Creating courses:", courses.length);
```

### 生產環境建議

```typescript
import { logger } from "@/lib/logger";

logger.info("Batch create started", {
  schoolName: school.schoolName,
  coursesCount: courses.length,
});

logger.error("Batch create failed", {
  error: error.message,
  schoolName: school.schoolName,
});
```

## 下一步

閱讀 **[07\_資料庫操作.md](./07_資料庫操作.md)** 了解 Prisma 資料庫操作的詳細說明。
