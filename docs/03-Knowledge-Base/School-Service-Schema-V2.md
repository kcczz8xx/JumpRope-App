# 到校服務模組 Schema V2.0

> **Migration**: `20260203070424_init`  
> **更新日期**: 2026-02-03

## 概述

本次更新重構了到校服務模組的 Prisma Schema，優化收費邏輯、發票期次管理和時間表管理。

---

## 目錄結構

```
prisma/schema/school/
├── _enums.prisma              # 列舉定義
├── school.prisma              # School, SchoolContact
├── quotation/
│   ├── quotation.prisma       # SchoolQuotation
│   └── quotation-item.prisma  # SchoolQuotationItem
├── course/
│   ├── course.prisma          # SchoolCourse
│   ├── fee-structure.prisma   # SchoolCourseFeeStructure ⭐ 新增
│   └── schedule.prisma        # SchoolCourseSchedule ⭐ 新增
├── lesson/
│   ├── lesson.prisma          # SchoolLesson
│   ├── lesson-fee-item.prisma # SchoolLessonFeeItem ⭐ 新增
│   └── tutor-lesson.prisma    # SchoolTutorLesson
└── invoice/
    ├── invoice.prisma         # SchoolInvoice
    ├── invoicing-period.prisma# InvoicingPeriod ⭐ 新增
    ├── invoice-item.prisma    # SchoolInvoiceItem ⭐ 新增
    └── receipt.prisma         # SchoolReceipt
```

---

## 新增 Enums

### `InvoicingPeriodStatus`
發票期次狀態，用於批次結算管理。

| 值 | 說明 |
|:---|:-----|
| `OPEN` | 開放中（可新增課堂） |
| `CLOSED` | 已關閉（無法新增課堂） |
| `INVOICED` | 已開立發票 |
| `PAID` | 已付款 |
| `CANCELLED` | 已取消 |

### `FeeItemDirection`
費用計算方向，區分收入與支出。

| 值 | 說明 |
|:---|:-----|
| `REVENUE` | 收入（向學校收費） |
| `EXPENSE` | 支出（支付導師薪資） |

---

## 新增 Models

### `SchoolCourseFeeStructure`
課程收費方案，支援多種收費模式混合（導師費 + 學生費 + 特別活動費）。

| 欄位 | 類型 | 說明 |
|:-----|:-----|:-----|
| `feeType` | String | 收費項目類型（TUTOR_FEE, STUDENT_FEE, SPECIAL_EVENT, EQUIPMENT, VENUE_RENTAL） |
| `direction` | FeeItemDirection | 計算方向（收入/支出） |
| `calculationMode` | ChargingModel | 收費計算模式 |
| `unitPrice` | Decimal | 收費標準 |
| `unitType` | String | 計算單位（TUTOR_COUNT, STUDENT_COUNT, LESSON_COUNT, HOUR_COUNT） |
| `isActive` | Boolean | 是否啟用 |

### `SchoolCourseSchedule`
課程時間表，支援分學期調整，用於自動生成課堂記錄。

| 欄位 | 類型 | 說明 |
|:-----|:-----|:-----|
| `weekday` | Int | 星期（1-7） |
| `startTime` | String | 開始時間（HH:mm） |
| `endTime` | String | 結束時間（HH:mm） |
| `effectiveFrom` | DateTime | 有效開始日期 |
| `effectiveTo` | DateTime? | 有效結束日期 |
| `courseTerm` | CourseTerm? | 學期標記 |
| `autoGenerateLessons` | Boolean | 是否自動生成課堂 |

### `SchoolLessonFeeItem`
課堂費用明細，每堂課可有多種費用項目。

| 欄位 | 類型 | 說明 |
|:-----|:-----|:-----|
| `feeStructureId` | String? | 對應的課程收費方案 ID |
| `feeType` | String | 費用類型 |
| `direction` | FeeItemDirection | 計算方向 |
| `calculationMode` | ChargingModel | 計算模式 |
| `unitPrice` | Decimal | 單價 |
| `quantity` | Int | 數量 |
| `subtotal` | Decimal | 小計（自動計算） |
| `calculationFormula` | String? | 計算公式追蹤 |

### `InvoicingPeriod`
發票期次，用於批次結算（月結、季結）。

| 欄位 | 類型 | 說明 |
|:-----|:-----|:-----|
| `periodName` | String | 期次名稱（2024年10月、2024年Q1） |
| `academicYear` | String? | 學年 |
| `periodType` | String | 期次類型（MONTHLY, QUARTERLY, CUSTOM） |
| `periodStart` | DateTime | 期次開始日期 |
| `periodEnd` | DateTime | 期次結束日期 |
| `status` | InvoicingPeriodStatus | 期次狀態 |
| `totalLessons` | Int? | 課堂總數 |
| `totalRevenue` | Decimal? | 收入總額 |
| `totalExpense` | Decimal? | 支出總額 |

### `SchoolInvoiceItem`
發票項目明細，取代舊的 `SchoolInvoiceCourse`。

| 欄位 | 類型 | 說明 |
|:-----|:-----|:-----|
| `itemType` | String | 項目類型（LESSON, EQUIPMENT, OTHER_SERVICE, ADJUSTMENT） |
| `lessonId` | String? | 課堂 ID（課堂項目） |
| `courseId` | String? | 課程 ID（課程級別項目） |
| `description` | String | 項目描述 |
| `unitPrice` | Decimal | 單價 |
| `quantity` | Int | 數量 |
| `subtotal` | Decimal | 小計 |

---

## 修改 Models

### `School`
新增 `invoicingPeriods` 關聯。

### `SchoolQuotation`
新增版本控制：
- `version` — 版本號
- `parentId` — 父報價單 ID
- `parent` / `revisions` — 自關聯

### `SchoolCourse`
**移除欄位**：
- `chargingModels`
- `studentPerLessonFee`, `studentHourlyFee`, `studentFullCourseFee`, `teamActivityFee`
- `tutorPerLessonFee`, `tutorHourlyFee`

**新增欄位**：
- `dataCompleteness` — 資料完整度 JSON
- `pendingDataFields` — 待補充欄位列表
- `dataCompletionDeadline` — 資料補充截止日

**新增關聯**：
- `feeStructures` → `SchoolCourseFeeStructure[]`
- `schedules` → `SchoolCourseSchedule[]`
- `invoiceItems` → `SchoolInvoiceItem[]`

### `SchoolLesson`
**移除欄位**：
- `feeMode`, `feePerMode`, `feeLesson`
- `invoiceId`, `invoice`
- `paymentStatus`

**新增欄位**：
- `tutorCount` — 導師人數
- `totalRevenue` — 向學校收費總額
- `totalExpense` — 支付導師總額
- `cancellationReason`, `cancelledAt`, `cancelledBy` — 取消資訊
- `postponedToDate`, `postponedLessonId`, `postponedLesson`, `originalLesson` — 延期關聯

**新增關聯**：
- `feeItems` → `SchoolLessonFeeItem[]`
- `invoiceItems` → `SchoolInvoiceItem[]`

### `SchoolTutorLesson`
**移除欄位**：
- `lessonDate`, `startTime`, `endTime`, `lessonLocation`, `lessonPlanId`

### `SchoolInvoice`
**移除欄位**：
- `invoiceProgress`
- `courseItems`, `onsiteServiceItems`, `equipmentSalesItems`, `otherServiceItems`（JSON）
- `courses`, `lessons`（舊關聯）

**新增欄位**：
- `periodId` — 發票期次 ID

**新增關聯**：
- `period` → `InvoicingPeriod?`
- `items` → `SchoolInvoiceItem[]`

---

## 刪除 Model

### `SchoolInvoiceCourse`
已由 `SchoolInvoiceItem` 取代，提供更靈活的項目明細管理。

---

## 業務流程對應

```
階段1：報價
School (INQUIRY) → SchoolQuotation (DRAFT) → SchoolQuotationItem

階段2：確認合作
School (CONFIRMED/ACTIVE) → SchoolCourse (DRAFT/SCHEDULED)
  - 資料可延遲補充（pendingDataFields、dataCompletionDeadline）

階段3：課堂執行與費用計算
SchoolCourseSchedule 定義上課時間
  ↓ 自動生成
SchoolLesson 記錄
  ↓ 根據 SchoolCourseFeeStructure
SchoolLessonFeeItem（費用明細）
  ↓ 計算
totalRevenue（向學校收費）+ totalExpense（支付導師）

階段4：期末結算與發票
InvoicingPeriod 定義結算期次
  ↓ 查詢該期間 COMPLETED 且 NOT_INVOICED 的課堂
SchoolInvoice + SchoolInvoiceItem
  ↓ 更新課堂 invoiceStatus = INVOICED
SchoolReceipt（收到付款後）
```

---

## 索引策略

| Model | 索引欄位 |
|:------|:---------|
| School | `partnershipStatus`, `schoolName` |
| SchoolQuotation | `schoolId`, `status`, `quotationNumber`, `parentId` |
| SchoolCourse | `schoolId`, `academicYear`, `courseType`, `status` |
| SchoolCourseFeeStructure | `courseId`, `feeType`, `isActive` |
| SchoolCourseSchedule | `courseId`, `[effectiveFrom, effectiveTo]` |
| SchoolLesson | `courseId`, `lessonDate`, `lessonStatus`, `invoiceStatus` |
| SchoolLessonFeeItem | `lessonId`, `feeType`, `direction` |
| InvoicingPeriod | `schoolId`, `status`, `[periodStart, periodEnd]` |
| SchoolInvoice | `schoolId`, `periodId`, `status`, `invoiceNumber`, `invoiceDate` |
| SchoolInvoiceItem | `invoiceId`, `lessonId`, `courseId`, `itemType` |
