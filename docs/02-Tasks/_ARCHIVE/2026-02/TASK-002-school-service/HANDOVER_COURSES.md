# 🔄 課程模組工作交接文檔

> **建立日期**: 2025-01-30  
> **狀態**: 基礎架構已完成，待整合與測試

---

## 📋 工作摘要

本次工作主要完成了「新增課程」相關頁面的設計與實作，包括：

- 新增課程頁面（多步驟表單）
- 批次新增課程頁面
- 課程模板管理頁面
- 課程列表頁面

---

## 📁 新增文件清單

### 頁面文件

| 路徑                                                        | 說明             |
| ----------------------------------------------------------- | ---------------- |
| `app/(private)/dashboard/school/courses/page.tsx`           | 課程列表頁面     |
| `app/(private)/dashboard/school/courses/new/page.tsx`       | 新增課程頁面     |
| `app/(private)/dashboard/school/courses/batch/page.tsx`     | 批次新增課程頁面 |
| `app/(private)/dashboard/school/courses/templates/page.tsx` | 課程模板管理頁面 |

### API 路由

| 路徑                                                    | 方法             | 說明               |
| ------------------------------------------------------- | ---------------- | ------------------ |
| `app/api/school-service/schools/route.ts`               | GET              | 取得學校列表       |
| `app/api/school-service/courses/route.ts`               | GET, POST        | 課程 CRUD          |
| `app/api/school-service/courses/batch/route.ts`         | POST             | 批次建立課程       |
| `app/api/school-service/course-templates/route.ts`      | GET, POST        | 模板列表/建立      |
| `app/api/school-service/course-templates/[id]/route.ts` | GET, PUT, DELETE | 模板詳情/編輯/刪除 |

### 組件

```
components/school-service/
├── types/
│   └── course.ts              # 類型定義、枚舉、工具函數
├── common/
│   ├── index.ts
│   ├── StepIndicator.tsx      # 步驟指示器
│   ├── FormCard.tsx           # 表單卡片容器
│   ├── FormField.tsx          # 表單欄位包裝
│   └── AmountInput.tsx        # 金額輸入組件
└── course/
    ├── index.ts
    ├── NewCourseForm.tsx      # 新增課程主表單
    ├── CourseFormStep1.tsx    # 基本資料步驟
    ├── CourseFormStep2.tsx    # 收費設定步驟
    ├── CourseFormStep3.tsx    # 預覽確認步驟
    ├── BatchCreateForm.tsx    # 批次建立表單
    ├── TemplateCard.tsx       # 模板卡片
    └── TemplateFormModal.tsx  # 模板表單彈窗
```

### 文檔

| 路徑                                       | 說明                 |
| ------------------------------------------ | -------------------- |
| `docs/學校服務/pages/COURSES_BATCH.md`     | 批次新增課程頁面規格 |
| `docs/學校服務/pages/COURSES_TEMPLATES.md` | 課程模板管理頁面規格 |

---

## 🔧 技術細節

### 類型定義（course.ts）

已根據 Prisma Schema (`prisma/schema/school.prisma`) 定義以下類型：

```typescript
// 枚舉（與 Prisma Schema 一致）
- CourseType: REGULAR_CLASS, INTENSIVE, TRIAL_CLASS, HOLIDAY_CAMP, COMPETITION_PREP, AFTER_SCHOOL, INTEREST_CLASS
- CourseTerm: FULL_YEAR, FIRST_TERM, SECOND_TERM, SUMMER
- ChargingModel: STUDENT_PER_LESSON, TUTOR_PER_LESSON, STUDENT_HOURLY, TUTOR_HOURLY, STUDENT_FULL_COURSE, TEAM_ACTIVITY
- SalaryCalculationMode: PER_LESSON, HOURLY, MONTHLY_FIXED
- CourseStatus: DRAFT, SCHEDULED, ACTIVE, COMPLETED, CANCELLED, SUSPENDED

// 表單資料介面
- CourseBasicData: 課程基本資料
- CourseChargingData: 收費設定
- CourseFormData: 完整表單資料
- CoursePreview: 預覽資料（含財務預估）
```

### 現有組件複用

使用了以下現有組件：

- `components/form/Select.tsx` - 下拉選單
- `components/form/input/InputField.tsx` - 文字輸入
- `components/form/input/TextArea.tsx` - 多行文字
- `components/form/date-picker.tsx` - 日期選擇器
- `components/ui/button/Button.tsx` - 按鈕
- `components/common/PageBreadCrumb.tsx` - 頁面麵包屑

---

## ⚠️ 待處理事項

### 1. Prisma Client 生成

API 路由中的 Prisma 查詢會報錯，因為 `School` 和 `SchoolCourse` 模型尚未生成到 Prisma Client。

**解決方案**：

```bash
pnpm prisma generate
```

### 2. 課程模板 API（Mock 資料）

目前 `course-templates` API 使用內存中的 Mock 資料，需要：

1. 在 Prisma Schema 中新增 `CourseTemplate` 模型
2. 執行遷移
3. 更新 API 使用 Prisma 查詢

### 3. 課程詳情頁面

尚未建立 `/dashboard/school/courses/[id]` 課程詳情頁面，課程列表的「查看詳情」連結會 404。

### 4. 表單驗證

目前使用簡單的 JavaScript 驗證，可考慮整合：

- Zod schema（如 `COURSES_NEW.md` 文檔所述）
- react-hook-form

---

## 📊 架構圖

```
pages/
├── /dashboard/school/courses              # 課程列表
│   ├── /new                               # 新增課程（3步驟表單）
│   ├── /batch                             # 批次新增課程
│   ├── /templates                         # 模板管理
│   └── /[id]                              # 課程詳情（待建立）
│
api/
├── /school-service/schools                # 學校列表 API
├── /school-service/courses                # 課程 CRUD API
│   └── /batch                             # 批次建立 API
└── /school-service/course-templates       # 模板 API
    └── /[id]                              # 模板詳情 API
```

---

## 📚 相關文檔

- `docs/學校服務/DATA_MODELS.md` - 資料模型定義
- `docs/學校服務/BUSINESS_FLOW.md` - 業務流程
- `docs/學校服務/COMPONENTS.md` - 組件清單
- `docs/學校服務/pages/COURSES_NEW.md` - 新增課程規格（原有）
- `docs/學校服務/pages/COURSES_BATCH.md` - 批次新增規格（新增）
- `docs/學校服務/pages/COURSES_TEMPLATES.md` - 模板管理規格（新增）

---

## 🚀 下一步建議

1. **運行 Prisma Generate** - 解決類型錯誤
2. **建立課程詳情頁面** - `/dashboard/school/courses/[id]`
3. **整合課程模板到資料庫** - 新增 Prisma 模型
4. **新增課堂排程功能** - 課程建立後的排課
5. **整合導師分配功能** - 課堂的導師管理

---

## 📝 組件使用說明

### StepIndicator 步驟指示器

```tsx
import StepIndicator from "@/components/school-service/common/StepIndicator";

<StepIndicator
  steps={[{ label: "基本資料" }, { label: "收費設定" }, { label: "確認建立" }]}
  currentStep={1} // 0-indexed
  onStepClick={(step) => setCurrentStep(step)} // 可選，點擊已完成步驟跳轉
/>;
```

### FormCard 表單卡片

```tsx
import FormCard from "@/components/school-service/common/FormCard";

<FormCard title="步驟 1：課程基本資料" description="填寫課程的基本信息">
  {/* 表單內容 */}
</FormCard>;
```

### FormField 表單欄位

```tsx
import FormField from "@/components/school-service/common/FormField";

<FormField
  label="課程名稱"
  required
  error={errors.courseName}
  hint="請輸入課程的完整名稱"
>
  <Input ... />
</FormField>
```

### AmountInput 金額輸入

```tsx
import AmountInput from "@/components/school-service/common/AmountInput";

<AmountInput
  value={feeAmount} // number | null
  onChange={(v) => setFee(v)} // (value: number | null) => void
  placeholder="50"
  prefix="HK$" // 預設 "HK$"
  suffix="/堂" // 可選
  error={!!errors.fee}
/>;
```

---

## 📡 API 響應格式

### GET /api/school-service/courses

```json
[
  {
    "id": "course_123",
    "courseName": "跳繩恆常班",
    "courseType": "REGULAR_CLASS",
    "courseTerm": "FULL_YEAR",
    "academicYear": "2024-2025",
    "chargingModel": "STUDENT_PER_LESSON",
    "status": "ACTIVE",
    "requiredTutors": 2,
    "maxStudents": 30,
    "startDate": "2024-09-01",
    "endDate": "2025-06-30",
    "school": {
      "id": "school_456",
      "schoolName": "聖保羅小學"
    },
    "_count": {
      "lessons": 24
    }
  }
]
```

### POST /api/school-service/courses

**Request:**

```json
{
  "schoolId": "school_456",
  "courseName": "跳繩恆常班",
  "courseType": "REGULAR_CLASS",
  "courseTerm": "FULL_YEAR",
  "academicYear": "2024-2025",
  "startDate": "2024-09-01",
  "endDate": "2025-06-30",
  "requiredTutors": 2,
  "maxStudents": 30,
  "chargingModel": "STUDENT_PER_LESSON",
  "studentPerLessonFee": 50,
  "tutorPerLessonFee": 300
}
```

**Response (201):**

```json
{
  "id": "course_789",
  "courseName": "跳繩恆常班",
  ...
}
```

### POST /api/school-service/courses/batch

**Request:**

```json
{
  "mode": "manual",
  "academicYear": "2025-2026",
  "courses": [
    {
      "schoolId": "school_1",
      "courseName": "跳繩恆常班",
      "courseType": "REGULAR_CLASS",
      "courseTerm": "FULL_YEAR",
      "chargingModel": "STUDENT_PER_LESSON",
      "feeAmount": 50,
      "tutorPerLessonFee": 300,
      "requiredTutors": 2
    }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "totalRequested": 3,
  "totalCreated": 3,
  "results": [
    {
      "schoolName": "聖保羅小學",
      "courseName": "跳繩恆常班",
      "success": true,
      "courseId": "course_123"
    },
    {
      "schoolName": "培正小學",
      "courseName": "跳繩興趣班",
      "success": false,
      "error": "學校不存在"
    }
  ]
}
```

---

## 🎨 UI 設計模式

### 表單步驟流程

```
步驟 1 (基本資料) → 步驟 2 (收費設定) → 步驟 3 (預覽確認)
     ↓                    ↓                    ↓
  validateStep1()    validateStep2()      handleSubmit()
     ↓                    ↓                    ↓
  通過則進入下一步    通過則進入預覽      API 建立課程
```

### 驗證邏輯位置

- **客戶端驗證**: `NewCourseForm.tsx` 中的 `validateStep1()` 和 `validateStep2()`
- **伺服器端驗證**: `api/school-service/courses/route.ts` 中的 POST handler

### 財務預估計算

位於 `types/course.ts`:

```typescript
// 預估收入計算（基於 12 堂課）
calculateEstimatedRevenue(formData, (estimatedLessons = 12));

// 預估成本計算
calculateEstimatedCost(formData, (estimatedLessons = 12));

// 預估利潤 = 收入 - 成本
```

---

## 🐛 已知問題與解決方案

### 1. Prisma 類型錯誤

**問題**: `Property 'school' does not exist on type 'PrismaClient'`

**原因**: Prisma Client 未包含 `school.prisma` 中定義的模型

**解決方案**:

```bash
pnpm prisma generate
```

### 2. 課程模板使用內存存儲

**問題**: API 重啟後模板資料會遺失

**解決方案**: 需要在 Prisma Schema 新增 `CourseTemplate` 模型：

```prisma
// prisma/schema/school.prisma 新增

model CourseTemplate {
  id                    String        @id @default(cuid())
  templateName          String
  description           String?       @db.Text
  isDefault             Boolean       @default(false)
  courseName            String
  courseType            CourseType
  courseTerm            CourseTerm
  requiredTutors        Int           @default(1)
  maxStudents           Int?
  chargingModel         ChargingModel
  studentPerLessonFee   Decimal?      @db.Decimal(10, 2)
  studentHourlyFee      Decimal?      @db.Decimal(10, 2)
  studentFullCourseFee  Decimal?      @db.Decimal(10, 2)
  teamActivityFee       Decimal?      @db.Decimal(10, 2)
  tutorPerLessonFee     Decimal?      @db.Decimal(10, 2)
  tutorHourlyFee        Decimal?      @db.Decimal(10, 2)
  usageCount            Int           @default(0)
  createdAt             DateTime      @default(now())
  updatedAt             DateTime      @updatedAt
  createdBy             String?

  @@map("course_templates")
}
```

### 3. 日期選擇器值同步

**問題**: `DatePicker` 使用 flatpickr，值更新可能不即時

**解決方案**: 確保 `onChange` callback 正確處理日期格式：

```typescript
onChange={(dates) => {
  if (dates[0]) {
    const dateStr = dates[0].toISOString().split("T")[0];
    onChange({ startDate: dateStr });
  }
}}
```

---

## 🔗 依賴關係圖

```
NewCourseForm
├── StepIndicator (common)
├── CourseFormStep1
│   ├── FormCard (common)
│   ├── FormField (common)
│   ├── Select (form)
│   ├── Input (form/input)
│   ├── TextArea (form/input)
│   └── DatePicker (form)
├── CourseFormStep2
│   ├── FormCard (common)
│   ├── FormField (common)
│   ├── Select (form)
│   └── AmountInput (common)
├── CourseFormStep3
│   └── FormCard (common)
└── Button (ui/button)
```

---

## 📌 開發環境設定

### 必要的環境變數

確保 `.env` 中有以下設定：

```env
DATABASE_URL="postgresql://..."
```

### 啟動開發服務器

```bash
pnpm dev
```

### 訪問頁面

- 課程列表: http://localhost:3000/dashboard/school/courses
- 新增課程: http://localhost:3000/dashboard/school/courses/new
- 批次新增: http://localhost:3000/dashboard/school/courses/batch
- 模板管理: http://localhost:3000/dashboard/school/courses/templates
