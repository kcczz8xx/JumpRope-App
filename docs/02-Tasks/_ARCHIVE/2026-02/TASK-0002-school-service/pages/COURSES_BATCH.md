# 📦 批次新增課程 - Courses Batch Create

> **路徑**: `/dashboard/school/courses/batch`  
> **優先級**: P2  
> **角色**: ADMIN

---

## 📋 頁面概述

批次新增多個課程的功能頁面。適用於學年初一次性為多間學校建立課程，或從現有課程複製到新學年。

---

## 🎨 頁面結構

```
┌─────────────────────────────────────────────────────────────┐
│ 📦 批次新增課程                                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 建立方式                                             │   │
│  │ ○ 手動批次新增   ○ 從現有課程複製   ○ 從模板建立    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 【手動批次新增模式】                                  │   │
│  │                                                      │   │
│  │ 目標學年 *                                           │   │
│  │ [2025-2026_____▼]                                   │   │
│  │                                                      │   │
│  │ ┌────────────────────────────────────────────────┐  │   │
│  │ │ 課程 1                                    [✕]  │  │   │
│  │ │ 學校：[搜尋學校...▼] 課程名稱：[________]     │  │   │
│  │ │ 類型：[恆常班▼] 學期：[全年▼]                 │  │   │
│  │ │ 收費模式：[學生每節▼] 金額：[HK$____]         │  │   │
│  │ └────────────────────────────────────────────────┘  │   │
│  │                                                      │   │
│  │ ┌────────────────────────────────────────────────┐  │   │
│  │ │ 課程 2                                    [✕]  │  │   │
│  │ │ ...                                            │  │   │
│  │ └────────────────────────────────────────────────┘  │   │
│  │                                                      │   │
│  │ [+ 新增課程]                                         │   │
│  │                                                      │   │
│  │                       [ 取消 ] [ 批次建立 N 個課程 ] │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 建立模式

### 模式 A：手動批次新增

直接輸入多個課程的資料，一次性建立。

```typescript
interface BatchCourseItem {
  schoolId: string;
  courseName: string;
  courseType: CourseType;
  courseTerm: CourseTerm;
  chargingModel: ChargingModel;
  feeAmount: number;
  tutorPerLessonFee: number;
  requiredTutors: number;
}

interface BatchCreateRequest {
  academicYear: string;
  courses: BatchCourseItem[];
}
```

### 模式 B：從現有課程複製

選擇來源學年，勾選要複製的課程，自動複製到目標學年。

```
┌──────────────────────────────────────────────────────────┐
│ 【從現有課程複製模式】                                    │
│                                                          │
│ 來源學年 *              目標學年 *                       │
│ [2024-2025_▼]           [2025-2026_▼]                   │
│                                                          │
│ 可複製課程列表：                                         │
│ ┌────────────────────────────────────────────────────┐  │
│ │ ☑ 聖保羅小學 - 跳繩恆常班（全年）                   │  │
│ │ ☑ 聖保羅小學 - 跳繩進階班（上學期）                 │  │
│ │ ☐ 培正小學 - 跳繩興趣班（下學期）                   │  │
│ │ ☑ 喇沙小學 - 比賽培訓班（全年）                     │  │
│ └────────────────────────────────────────────────────┘  │
│                                                          │
│ 複製選項：                                               │
│ ☑ 保留原有收費設定                                      │
│ ☑ 保留導師薪資設定                                      │
│ ☐ 複製課堂時間表                                        │
│                                                          │
│ 已選擇 3 個課程                                          │
│                       [ 取消 ] [ 複製選中課程 ]          │
└──────────────────────────────────────────────────────────┘
```

### 模式 C：從模板建立

使用預設的課程模板快速建立課程。

```
┌──────────────────────────────────────────────────────────┐
│ 【從模板建立模式】                                        │
│                                                          │
│ 選擇模板：                                               │
│ ┌────────────────────────────────────────────────────┐  │
│ │ 📋 恆常班標準模板                                   │  │
│ │    類型：恆常班 | 學期：全年 | 導師：2人            │  │
│ │    收費：學生每節 $50 | 導師每堂 $300               │  │
│ │                                          [使用此模板]│  │
│ ├────────────────────────────────────────────────────┤  │
│ │ 📋 興趣班標準模板                                   │  │
│ │    類型：興趣班 | 學期：上學期 | 導師：1人          │  │
│ │    收費：學生每節 $80 | 導師每堂 $350               │  │
│ │                                          [使用此模板]│  │
│ ├────────────────────────────────────────────────────┤  │
│ │ 📋 比賽培訓模板                                     │  │
│ │    類型：比賽訓練 | 學期：全年 | 導師：3人          │  │
│ │    收費：固定每堂 $800 | 導師每堂 $400              │  │
│ │                                          [使用此模板]│  │
│ └────────────────────────────────────────────────────┘  │
│                                                          │
│ 應用到學校：                                             │
│ ☑ 聖保羅小學                                            │
│ ☑ 培正小學                                              │
│ ☐ 喇沙小學                                              │
│                                                          │
│ 目標學年：[2025-2026_▼]                                 │
│                                                          │
│                       [ 取消 ] [ 批次建立課程 ]          │
└──────────────────────────────────────────────────────────┘
```

---

## 📊 資料結構

### 批次建立請求

```typescript
interface BatchCreateCoursesRequest {
  mode: "manual" | "copy" | "template";
  academicYear: string;

  // 手動批次新增
  courses?: BatchCourseItem[];

  // 從現有課程複製
  sourceCourseIds?: string[];
  copyOptions?: {
    keepFeeSettings: boolean;
    keepTutorSalary: boolean;
    copySchedule: boolean;
  };

  // 從模板建立
  templateId?: string;
  schoolIds?: string[];
}
```

### 批次建立結果

```typescript
interface BatchCreateResult {
  success: boolean;
  totalRequested: number;
  totalCreated: number;
  results: {
    schoolName: string;
    courseName: string;
    success: boolean;
    courseId?: string;
    error?: string;
  }[];
}
```

---

## 🔄 API 定義

### 批次建立課程

```typescript
// POST /api/school-service/courses/batch
async function batchCreateCourses(request: BatchCreateCoursesRequest) {
  const results: BatchCreateResult["results"] = [];

  if (request.mode === "manual") {
    for (const course of request.courses || []) {
      try {
        const created = await prisma.schoolCourse.create({
          data: {
            schoolId: course.schoolId,
            courseName: course.courseName,
            courseType: course.courseType,
            courseTerm: course.courseTerm,
            academicYear: request.academicYear,
            chargingModel: course.chargingModel,
            // ... 其他欄位
            status: "DRAFT",
          },
        });
        results.push({
          schoolName: created.school.schoolName,
          courseName: created.courseName,
          success: true,
          courseId: created.id,
        });
      } catch (error) {
        results.push({
          schoolName: course.schoolId,
          courseName: course.courseName,
          success: false,
          error: error.message,
        });
      }
    }
  }

  if (request.mode === "copy") {
    for (const courseId of request.sourceCourseIds || []) {
      const source = await prisma.schoolCourse.findUnique({
        where: { id: courseId },
        include: { school: true, lessons: true },
      });

      if (!source) continue;

      try {
        const created = await prisma.schoolCourse.create({
          data: {
            schoolId: source.schoolId,
            courseName: source.courseName,
            courseType: source.courseType,
            courseTerm: source.courseTerm,
            academicYear: request.academicYear,
            chargingModel: source.chargingModel,
            studentPerLessonFee: request.copyOptions?.keepFeeSettings
              ? source.studentPerLessonFee
              : null,
            tutorPerLessonFee: request.copyOptions?.keepTutorSalary
              ? source.tutorPerLessonFee
              : null,
            status: "DRAFT",
          },
        });

        results.push({
          schoolName: source.school.schoolName,
          courseName: created.courseName,
          success: true,
          courseId: created.id,
        });
      } catch (error) {
        results.push({
          schoolName: source.school.schoolName,
          courseName: source.courseName,
          success: false,
          error: error.message,
        });
      }
    }
  }

  return {
    success: results.every((r) => r.success),
    totalRequested: results.length,
    totalCreated: results.filter((r) => r.success).length,
    results,
  };
}
```

---

## 🎯 結果頁面

```
┌──────────────────────────────────────────────────────────┐
│ ✅ 批次建立完成                                          │
│                                                          │
│ 總共建立：8 / 10 個課程                                  │
│                                                          │
│ ┌────────────────────────────────────────────────────┐  │
│ │ ✅ 聖保羅小學 - 跳繩恆常班（全年）        [查看課程]  │  │
│ │ ✅ 聖保羅小學 - 跳繩進階班（上學期）      [查看課程]  │  │
│ │ ❌ 培正小學 - 跳繩興趣班 - 錯誤：學校不存在          │  │
│ │ ✅ 喇沙小學 - 比賽培訓班（全年）          [查看課程]  │  │
│ │ ...                                                  │  │
│ └────────────────────────────────────────────────────┘  │
│                                                          │
│               [ 返回課程列表 ] [ 繼續批次建立 ]          │
└──────────────────────────────────────────────────────────┘
```

---

## ✅ 驗證規則

1. **必填欄位**：學校、課程名稱、課程類型、學期、收費模式
2. **學年格式**：必須為 "YYYY-YYYY" 格式
3. **金額驗證**：必須為正數
4. **重複檢查**：同一學校同一學年不可有相同名稱的課程

---

## 📌 開發注意事項

1. **事務處理**：批次建立應使用資料庫事務，確保原子性
2. **錯誤處理**：單個課程建立失敗不應影響其他課程
3. **進度顯示**：批次建立時顯示進度條
4. **大量資料**：考慮分批處理，避免請求超時
5. **權限檢查**：確認用戶對所有目標學校有建立課程的權限

---

## 🔗 相關頁面

- **相關**：[新增課程](./COURSES_NEW.md)（單個課程新增）
- **相關**：[課程模板](./COURSES_TEMPLATES.md)（模板管理）
- **相關**：[課程列表](./COURSES.md)
