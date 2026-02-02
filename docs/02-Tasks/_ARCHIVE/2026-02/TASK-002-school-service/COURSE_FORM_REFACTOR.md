# 📝 課程表單重構文檔

> **重構日期**: 2026-01-30  
> **狀態**: ✅ 已完成

---

## 📋 重構概述

將課程新增表單從原本的「課程為中心」改為「學校為中心」的三步驟流程，支持一次性創建學校資料、聯絡人資料和多個課程。

### 原有流程（已棄用）

```
步驟 1：基本資料（課程資料）
步驟 2：收費設定
步驟 3：確認建立
```

### 新流程

```
步驟 1：學校資料（學校基本資料 + 聯絡人資料）
步驟 2：課程資料（可新增多個課程）
步驟 3：總結（學校 + 聯絡人 + 所有課程）
```

---

## 🎯 核心改動

### 1. 資料結構調整

#### 新增類型定義 (`types/course.ts`)

```typescript
// 學校基本資料
export interface SchoolBasicData {
  schoolId?: string; // 可選，選擇現有學校時使用
  schoolName: string; // 學校中文名稱
  schoolNameEn: string; // 學校英文名稱
  address: string; // 學校地址
  phone: string; // 學校電話
  email: string; // 學校電郵
  website: string; // 學校網站
  partnershipStartDate: string; // 合作開始日期
  partnershipEndDate: string | null; // 合作結束日期
  partnershipStartYear?: string; // 合作學年（自動計算）
  confirmationChannel: string; // 確認渠道
  remarks: string; // 備註
}

// 聯絡人資料
export interface SchoolContactData {
  nameChinese: string; // 中文姓名
  nameEnglish: string; // 英文姓名
  position: string; // 職位
  phone: string; // 電話
  mobile: string; // 手提電話
  email: string; // 電郵
  isPrimary: boolean; // 是否主要聯絡人
}

// 課程項目資料
export interface CourseItemData {
  id: string; // 唯一識別碼
  courseName: string; // 課程名稱
  courseType: CourseType; // 課程類型
  courseTerm: CourseTerm; // 學期
  startDate: string; // 開始日期
  endDate: string | null; // 結束日期
  requiredTutors: number; // 所需導師
  maxStudents: number | null; // 最大學生數
  courseDescription: string | null; // 課程描述
  chargingModel: ChargingModel; // 收費模式
  studentPerLessonFee: number | null;
  studentHourlyFee: number | null;
  studentFullCourseFee: number | null;
  teamActivityFee: number | null;
  tutorPerLessonFee: number | null;
  tutorHourlyFee: number | null;
}

// 整合表單資料
export interface NewCourseFormData {
  school: SchoolBasicData;
  contact: SchoolContactData;
  academicYear: string;
  courses: CourseItemData[];
}
```

#### 新增工具函數

```typescript
// 根據開始和結束日期自動計算合作學年
export function calculateAcademicYear(
  startDate: string,
  endDate: string | null
): string {
  if (!startDate) return "";

  const start = new Date(startDate);
  const startYear = start.getFullYear();
  const startMonth = start.getMonth() + 1;

  // 9月或之後算下一學年
  if (startMonth >= 9) {
    return `${startYear}-${startYear + 1}`;
  } else {
    return `${startYear - 1}-${startYear}`;
  }
}

// 計算單個課程的預計收入
export function calculateCourseItemRevenue(
  course: CourseItemData,
  estimatedLessons: number = 12
): number;

// 計算單個課程的預計成本
export function calculateCourseItemCost(
  course: CourseItemData,
  estimatedLessons: number = 12
): number;
```

---

## 🧩 新建組件

### 1. SchoolFormStep.tsx

**步驟 1：學校資料**

#### 功能特點

- ✅ 支持從現有學校選擇或新增學校
- ✅ 學校基本資料表單（中英文名稱、地址、聯絡方式）
- ✅ 合作日期設定（開始/結束）
- ✅ **合作學年自動計算**（根據開始日期自動判斷學年）
- ✅ 確認渠道記錄
- ✅ 聯絡人資料表單
- ✅ 支持從報價單帶入資料（通過 `quotationId` prop）
- ✅ 學校選擇器支持清空功能（`allowClear={true}`）

#### 欄位驗證

**學校資料**

- 學校名稱（中文）- 必填
- 學校地址 - 必填
- 合作開始日期 - 必填
- 合作結束日期 - 可選，但不能早於開始日期
- 確認渠道 - 必填

**聯絡人資料**

- 姓名（中文）- 必填
- 手提電話 - 必填
- 電郵 - 必填

#### Props

```typescript
interface SchoolFormStepProps {
  schoolData: SchoolBasicData;
  contactData: SchoolContactData;
  onSchoolChange: (data: Partial<SchoolBasicData>) => void;
  onContactChange: (data: Partial<SchoolContactData>) => void;
  errors: Record<string, string>;
  schools: School[];
  isLoadingSchools?: boolean;
  quotationId?: string; // 從報價單帶入時使用
}
```

---

### 2. CoursesFormStep.tsx

**步驟 2：課程資料**

#### 功能特點

- ✅ **支持新增多個課程**（都屬於當前學校）
- ✅ 每個課程包含完整的課程資料和收費設定
- ✅ 動態顯示收費欄位（根據收費模式自動切換）
- ✅ 支持移除課程（至少保留一個）
- ✅ 新增課程按鈕（虛線邊框樣式）
- ✅ 每個課程獨立驗證

#### 課程欄位

**基本資料**

- 課程名稱 - 必填
- 課程類型 - 必填
- 學期 - 必填
- 開始日期 - 必填
- 結束日期 - 可選
- 所需導師 - 必填（至少 1 人）
- 最大學生數 - 可選
- 課程描述 - 可選

**收費設定**

- 收費模式 - 必填
- 收費金額 - 根據收費模式動態顯示對應欄位
- 導師薪資 - 必填

#### 收費模式對應欄位

| 收費模式              | 顯示欄位           |
| --------------------- | ------------------ |
| `STUDENT_PER_LESSON`  | 每堂每位學生收費   |
| `TUTOR_PER_LESSON`    | 每堂導師收費       |
| `STUDENT_HOURLY`      | 每小時每位學生收費 |
| `TUTOR_HOURLY`        | 導師時薪收費       |
| `STUDENT_FULL_COURSE` | 學生全期課程收費   |
| `TEAM_ACTIVITY`       | 帶隊活動收費       |

#### Props

```typescript
interface CoursesFormStepProps {
  courses: CourseItemData[];
  onCoursesChange: (courses: CourseItemData[]) => void;
  errors: Record<string, string>;
}
```

---

### 3. SummaryFormStep.tsx

**步驟 3：總結**

#### 功能特點

- ✅ 顯示學校資料總結
- ✅ 顯示聯絡人資料總結
- ✅ 顯示所有課程的詳細資料
- ✅ 每個課程顯示預計收入、成本、利潤
- ✅ **財務總結**（所有課程的總收入、總成本、總利潤）
- ✅ 利潤顏色編碼（正數綠色、負數紅色）
- ✅ 下一步操作提示

#### 顯示內容

**學校資料區塊**

- 學校名稱（中英文）
- 地址、電話、電郵、網站
- 合作開始/結束日期
- 合作學年
- 確認渠道

**聯絡人資料區塊**

- 姓名（中英文）
- 職位
- 電話、手提電話
- 電郵

**課程資料區塊**（每個課程）

- 課程名稱、類型、學期
- 開始/結束日期
- 所需導師、最大學生數
- 收費模式
- 導師薪資
- **財務預估**（收入、成本、利潤）

**財務總結區塊**

- 總預計收入（綠色）
- 總預計成本（紅色）
- 總預計利潤（大字體、粗體、顏色編碼）
- 基於 12 堂課計算

#### Props

```typescript
interface SummaryFormStepProps {
  formData: NewCourseFormData;
}
```

---

## 🔄 主表單重構 (NewCourseForm.tsx)

### 狀態管理

```typescript
const [formData, setFormData] = useState<NewCourseFormData>(
  getDefaultNewCourseFormData()
);

// 分離的狀態更新函數
const handleSchoolChange = (updates: Partial<SchoolBasicData>) => { ... }
const handleContactChange = (updates: Partial<SchoolContactData>) => { ... }
const handleCoursesChange = (courses: CourseItemData[]) => { ... }
```

### 驗證邏輯

#### 步驟 1 驗證（學校資料）

```typescript
const validateStep1 = (): boolean => {
  // 驗證學校資料
  - 學校名稱
  - 學校地址
  - 合作開始日期
  - 合作結束日期（不能早於開始日期）
  - 確認渠道

  // 驗證聯絡人資料
  - 聯絡人姓名
  - 手提電話
  - 電郵
}
```

#### 步驟 2 驗證（課程資料）

```typescript
const validateStep2 = (): boolean => {
  // 至少要有一個課程
  if (courses.length === 0) return false;

  // 驗證每個課程
  courses.forEach((course, index) => {
    - 課程名稱
    - 開始日期
    - 結束日期（不能早於開始日期）
    - 所需導師（至少 1 人）
    - 收費金額（根據收費模式）
    - 導師薪資
  });
}
```

### 提交流程

```typescript
const handleSubmit = async () => {
  // 1. 計算合作學年
  const academicYearCalculated = calculateAcademicYear(
    school.partnershipStartDate,
    school.partnershipEndDate
  );

  // 2. 調用新的 API
  const response = await fetch(
    "/api/school-service/courses/batch-with-school",
    {
      method: "POST",
      body: JSON.stringify({
        school: {
          ...school,
          partnershipStartYear: academicYearCalculated,
        },
        contact,
        academicYear,
        courses: courses.map((course) => ({
          ...course,
          academicYear,
        })),
      }),
    }
  );

  // 3. 成功後跳轉到課程列表（帶學校 ID 篩選）
  router.push(`/dashboard/school/courses?schoolId=${result.schoolId}`);
};
```

---

## 🎨 UI/UX 改進

### 1. 學校選擇器

- ✅ 支持清空選擇（`allowClear={true}`）
- ✅ 搜尋功能
- ✅ 選擇現有學校時自動填入學校名稱

### 2. 合作學年自動計算

- ✅ 根據開始日期自動判斷學年
- ✅ 9 月或之後算下一學年
- ✅ 顯示為只讀欄位
- ✅ 提示文字：「根據開始和結束日期自動計算」

### 3. 課程列表

- ✅ 每個課程獨立卡片樣式
- ✅ 灰色背景區分
- ✅ 課程編號顯示
- ✅ 移除按鈕（至少保留一個）
- ✅ 新增課程按鈕（虛線邊框）

### 4. 財務預估

- ✅ 每個課程顯示預計收入、成本、利潤
- ✅ 總結頁面顯示總財務預估
- ✅ 顏色編碼：
  - 收入：綠色
  - 成本：紅色
  - 利潤：正數綠色、負數紅色

### 5. 表單驗證

- ✅ 即時錯誤提示
- ✅ 欄位級別錯誤顯示
- ✅ 紅色邊框標記錯誤欄位
- ✅ 錯誤訊息顯示在欄位下方

---

## 📡 API 需求

### 新增 API 端點

**路徑**: `/api/school-service/courses/batch-with-school`

**方法**: `POST`

**請求格式**:

```json
{
  "school": {
    "schoolId": "school_123",  // 可選，選擇現有學校時提供
    "schoolName": "聖保羅小學",
    "schoolNameEn": "St. Paul's Primary School",
    "address": "香港九龍...",
    "phone": "2123 4567",
    "email": "info@school.edu.hk",
    "website": "https://www.school.edu.hk",
    "partnershipStartDate": "2024-09-01",
    "partnershipEndDate": "2025-06-30",
    "partnershipStartYear": "2024-2025",
    "confirmationChannel": "電話確認",
    "remarks": "備註..."
  },
  "contact": {
    "nameChinese": "陳老師",
    "nameEnglish": "Mr. Chan",
    "position": "體育科主任",
    "phone": "2123 4567",
    "mobile": "9123 4567",
    "email": "teacher@school.edu.hk",
    "isPrimary": true
  },
  "academicYear": "2024-2025",
  "courses": [
    {
      "id": "uuid-1",
      "courseName": "跳繩恆常班（上學期）",
      "courseType": "REGULAR_CLASS",
      "courseTerm": "FIRST_TERM",
      "startDate": "2024-09-01",
      "endDate": "2025-01-17",
      "requiredTutors": 2,
      "maxStudents": 30,
      "courseDescription": "適合小三至小五學生...",
      "chargingModel": "STUDENT_PER_LESSON",
      "studentPerLessonFee": 50,
      "tutorPerLessonFee": 300,
      "academicYear": "2024-2025"
    },
    {
      "id": "uuid-2",
      "courseName": "跳繩興趣班",
      "courseType": "INTEREST_CLASS",
      ...
    }
  ]
}
```

**響應格式**:

```json
{
  "success": true,
  "schoolId": "school_123",
  "contactId": "contact_456",
  "courses": [
    {
      "id": "course_789",
      "courseName": "跳繩恆常班（上學期）",
      "success": true
    },
    {
      "id": "course_790",
      "courseName": "跳繩興趣班",
      "success": true
    }
  ],
  "message": "成功創建學校和 2 個課程"
}
```

**處理邏輯**:

1. 檢查 `school.schoolId` 是否存在
   - 存在：更新現有學校資料
   - 不存在：創建新學校
2. 創建或更新聯絡人資料
3. 批次創建所有課程
4. 返回結果

---

## 🔧 技術細節

### 檔案結構

```
components/school-service/
├── types/
│   └── course.ts                    # ✅ 更新：新增類型定義
├── common/
│   ├── StepIndicator.tsx
│   ├── FormCard.tsx
│   ├── FormField.tsx
│   └── AmountInput.tsx
└── course/
    ├── NewCourseForm.tsx            # ✅ 重構：主表單
    ├── SchoolFormStep.tsx           # ✅ 新增：步驟 1
    ├── CoursesFormStep.tsx          # ✅ 新增：步驟 2
    ├── SummaryFormStep.tsx          # ✅ 新增：步驟 3
    ├── CourseFormStep1.tsx          # ⚠️ 已棄用
    ├── CourseFormStep2.tsx          # ⚠️ 已棄用
    ├── CourseFormStep3.tsx          # ⚠️ 已棄用
    ├── BatchCreateForm.tsx
    └── TemplateFormModal.tsx
```

### 依賴組件

- `SearchableSelect` - 下拉搜尋選擇器（已啟用 `allowClear`）
- `Input` - 文字輸入框
- `TextArea` - 多行文字輸入
- `DatePicker` - 日期選擇器
- `FormField` - 表單欄位包裝器
- `FormCard` - 表單卡片容器
- `AmountInput` - 金額輸入組件
- `StepIndicator` - 步驟指示器
- `Button` - 按鈕組件

---

## ✅ 測試檢查清單

### 步驟 1：學校資料

- [ ] 從現有學校選擇
- [ ] 清空學校選擇
- [ ] 新增學校（填寫完整資料）
- [ ] 合作學年自動計算（9 月前/9 月後）
- [ ] 日期驗證（結束日期不能早於開始日期）
- [ ] 必填欄位驗證
- [ ] 聯絡人資料驗證

### 步驟 2：課程資料

- [ ] 新增課程
- [ ] 移除課程（至少保留一個）
- [ ] 切換收費模式（顯示對應欄位）
- [ ] 每個課程獨立驗證
- [ ] 日期驗證
- [ ] 必填欄位驗證

### 步驟 3：總結

- [ ] 顯示學校資料
- [ ] 顯示聯絡人資料
- [ ] 顯示所有課程
- [ ] 財務預估計算正確
- [ ] 顏色編碼正確

### 提交流程

- [ ] 驗證通過才能提交
- [ ] 提交時計算合作學年
- [ ] API 調用成功
- [ ] 成功後跳轉到課程列表
- [ ] 錯誤處理顯示

---

## 🐛 已知問題與解決方案

### 1. ~~SearchableSelect 無法清空~~

**問題**: 選錯後無法清空選擇

**解決方案**: ✅ 已修復

- 在 `SchoolFormStep.tsx` 中啟用 `allowClear={true}`
- `SearchableSelect` 組件已支持清空功能

### 2. Input 組件 value 屬性問題

**問題**: TypeScript 錯誤 - `value` 屬性不存在

**解決方案**: ✅ 已修復

- 改用 `defaultValue` 屬性
- 適用於只讀欄位（如合作學年）

---

## 📚 相關文檔

- [業務流程文檔](./BUSINESS_FLOW.md) - 階段 3 和階段 4
- [資料模型文檔](./DATA_MODELS.md) - School, SchoolContact, SchoolCourse
- [組件清單](./COMPONENTS.md) - 表單組件使用說明
- [課程交接文檔](./HANDOVER_COURSES.md) - 原有課程模組說明

---

## 🎯 下一步建議

1. **實作 API 端點**

   - 創建 `/api/school-service/courses/batch-with-school`
   - 處理學校創建/更新邏輯
   - 處理聯絡人創建
   - 批次創建課程

2. **從報價單轉換**

   - 實作從報價單帶入資料的邏輯
   - 自動填充學校和聯絡人資料
   - 自動填充課程資料

3. **優化用戶體驗**

   - 添加保存草稿功能
   - 添加返回上一步時保留資料
   - 添加表單自動保存

4. **測試與驗證**
   - 單元測試
   - 整合測試
   - E2E 測試

---

## 📝 更新日誌

### 2026-01-30

- ✅ 完成表單邏輯重構
- ✅ 創建 `SchoolFormStep.tsx`
- ✅ 創建 `CoursesFormStep.tsx`
- ✅ 創建 `SummaryFormStep.tsx`
- ✅ 重構 `NewCourseForm.tsx`
- ✅ 更新類型定義 `types/course.ts`
- ✅ 修復 `SearchableSelect` 清空功能
- ✅ 修復 Input 組件 value 屬性問題
- ✅ 創建重構文檔

---

**文檔版本**: 1.0  
**最後更新**: 2026-01-30  
**維護者**: AI Assistant
