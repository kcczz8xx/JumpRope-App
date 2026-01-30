# 📊 資料模型文檔

> 本文檔定義學校服務系統的資料庫結構與 Prisma Schema

---

## 📁 模型總覽

| 模型                  | 說明          | 主要關聯                            |
| --------------------- | ------------- | ----------------------------------- |
| `School`              | 學校          | Contact, Quotation, Course, Invoice |
| `SchoolContact`       | 學校聯絡人    | School                              |
| `SchoolQuotation`     | 報價單        | School, QuotationItem               |
| `SchoolQuotationItem` | 報價項目      | Quotation                           |
| `SchoolCourse`        | 課程          | School, Lesson, InvoiceCourse       |
| `SchoolLesson`        | 課堂          | Course, TutorLesson                 |
| `SchoolTutorLesson`   | 導師任教記錄  | Lesson, User                        |
| `SchoolInvoice`       | 發票          | School, InvoiceCourse, Receipt      |
| `SchoolInvoiceCourse` | 發票-課程關聯 | Invoice, Course                     |
| `SchoolReceipt`       | 收據          | Invoice                             |

---

## 📐 ER 關係圖

```
┌─────────────────┐
│     School      │
│─────────────────│
│ id              │
│ schoolName      │
│ partnershipStatus│
└────────┬────────┘
         │
    ┌────┴────┬────────────┬────────────┐
    │         │            │            │
    ▼         ▼            ▼            ▼
┌────────┐ ┌────────┐ ┌─────────┐ ┌─────────┐
│Contact │ │Quotation│ │ Course  │ │ Invoice │
└────────┘ └────┬───┘ └────┬────┘ └────┬────┘
                │          │           │
                ▼          │           ▼
          ┌──────────┐     │     ┌─────────┐
          │QuotItem  │     │     │ Receipt │
          └──────────┘     │     └─────────┘
                           │
                           ▼
                     ┌──────────┐
                     │  Lesson  │
                     └────┬─────┘
                          │
                          ▼
                    ┌───────────┐
                    │TutorLesson│
                    └───────────┘
```

---

## 🏫 School（學校）

```prisma
model School {
  id                     String    @id @default(cuid())

  // 基本資料
  schoolName             String    @map("school_name")
  schoolNameEnglish      String?   @map("school_name_english")
  schoolType             SchoolType @default(PRIMARY) @map("school_type")
  district               String?
  address                String?
  phone                  String?
  fax                    String?
  email                  String?
  website                String?

  // 合作狀態
  partnershipStatus      PartnershipStatus @default(INQUIRY) @map("partnership_status")
  partnershipStartDate   DateTime? @map("partnership_start_date")
  partnershipStartYear   String?   @map("partnership_start_year")  // e.g., "2024-2025"
  confirmationChannel    String?   @map("confirmation_channel")

  // 系統欄位
  createdAt              DateTime  @default(now()) @map("created_at")
  updatedAt              DateTime  @updatedAt @map("updated_at")
  deletedAt              DateTime? @map("deleted_at")

  // 關聯
  contacts               SchoolContact[]
  quotations             SchoolQuotation[]
  courses                SchoolCourse[]
  invoices               SchoolInvoice[]
  receipts               SchoolReceipt[]

  @@map("schools")
}

enum SchoolType {
  PRIMARY           // 小學
  SECONDARY         // 中學
  KINDERGARTEN      // 幼稚園
  SPECIAL           // 特殊學校
  INTERNATIONAL     // 國際學校
  OTHER             // 其他
}

enum PartnershipStatus {
  INQUIRY           // 查詢中
  QUOTATION_SENT    // 已發報價
  CONFIRMED         // 已確認合作
  INACTIVE          // 不活躍
  TERMINATED        // 已終止
}
```

### 欄位說明

| 欄位                   | 類型     | 必填 | 說明                           |
| ---------------------- | -------- | ---- | ------------------------------ |
| `schoolName`           | String   | ✅   | 學校中文名稱                   |
| `schoolNameEnglish`    | String   | -    | 學校英文名稱                   |
| `schoolType`           | Enum     | ✅   | 學校類型                       |
| `district`             | String   | -    | 所屬地區                       |
| `partnershipStatus`    | Enum     | ✅   | 合作狀態                       |
| `partnershipStartDate` | DateTime | -    | 開始合作日期                   |
| `partnershipStartYear` | String   | -    | 開始合作學年（如 "2024-2025"） |

---

## 👤 SchoolContact（學校聯絡人）

```prisma
model SchoolContact {
  id                String    @id @default(cuid())
  schoolId          String    @map("school_id")

  // 聯絡人資料
  nameChinese       String    @map("name_chinese")
  nameEnglish       String?   @map("name_english")
  position          String?
  phone             String?
  mobile            String?
  email             String?
  isPrimary         Boolean   @default(false) @map("is_primary")

  // 系統欄位
  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")
  deletedAt         DateTime? @map("deleted_at")

  // 關聯
  school            School    @relation(fields: [schoolId], references: [id])

  @@map("school_contacts")
}
```

---

## 📄 SchoolQuotation（報價單）

```prisma
model SchoolQuotation {
  id                  String    @id @default(cuid())
  schoolId            String    @map("school_id")

  // 報價資料
  quotationNumber     String    @unique @map("quotation_number")  // Q2024-001
  quotationDate       DateTime  @map("quotation_date")
  validUntil          DateTime? @map("valid_until")
  status              QuotationStatus @default(DRAFT)
  totalAmount         Decimal?  @map("total_amount") @db.Decimal(10, 2)

  // 查詢記錄
  inquiryDate         DateTime? @map("inquiry_date")
  inquiryNotes        String?   @map("inquiry_notes") @db.Text
  expectedStartDate   DateTime? @map("expected_start_date")
  expectedStudentCount Int?     @map("expected_student_count")
  preferredSchedule   String?   @map("preferred_schedule")  // 文字描述

  // 發送記錄
  sentDate            DateTime? @map("sent_date")
  sentTo              String?   @map("sent_to")
  sentMethod          String?   @map("sent_method")  // email, whatsapp, etc.

  // 回應記錄
  respondedDate       DateTime? @map("responded_date")
  rejectionReason     String?   @map("rejection_reason") @db.Text

  // 系統欄位
  createdAt           DateTime  @default(now()) @map("created_at")
  updatedAt           DateTime  @updatedAt @map("updated_at")
  deletedAt           DateTime? @map("deleted_at")
  createdBy           String?   @map("created_by")

  // 關聯
  school              School    @relation(fields: [schoolId], references: [id])
  items               SchoolQuotationItem[]

  @@map("school_quotations")
}

enum QuotationStatus {
  DRAFT             // 草稿
  SENT              // 已發送
  ACCEPTED          // 已接受
  REJECTED          // 已拒絕
  EXPIRED           // 已過期
}
```

### 狀態流轉

```
DRAFT → SENT → ACCEPTED
              └→ REJECTED
              └→ EXPIRED (自動：超過 validUntil)
```

---

## 📋 SchoolQuotationItem（報價項目）

```prisma
model SchoolQuotationItem {
  id                  String    @id @default(cuid())
  quotationId         String    @map("quotation_id")

  // 項目資料
  courseName          String    @map("course_name")
  courseType          CourseType @map("course_type")
  description         String?   @db.Text

  // 收費設定
  chargingModel       ChargingModel @map("charging_model")
  unitPrice           Decimal   @map("unit_price") @db.Decimal(10, 2)
  quantity            Int
  totalPrice          Decimal   @map("total_price") @db.Decimal(10, 2)

  // 課程安排（建議）
  lessonsPerWeek      Int?      @map("lessons_per_week")
  lessonDuration      Int?      @map("lesson_duration")  // 分鐘
  expectedStudents    Int?      @map("expected_students")
  requiredTutors      Int?      @map("required_tutors")

  // 系統欄位
  sortOrder           Int       @default(0) @map("sort_order")
  createdAt           DateTime  @default(now()) @map("created_at")
  updatedAt           DateTime  @updatedAt @map("updated_at")

  // 關聯
  quotation           SchoolQuotation @relation(fields: [quotationId], references: [id])

  @@map("school_quotation_items")
}

enum CourseType {
  REGULAR_CLASS       // 恆常班
  INTEREST_CLASS      // 興趣班
  TRAINING_TEAM       // 訓練隊
  WORKSHOP            // 工作坊
  COMPETITION         // 比賽培訓
  SUMMER_COURSE       // 暑期班
  OTHER               // 其他
}

enum ChargingModel {
  STUDENT_PER_LESSON    // 學生每堂收費
  STUDENT_PER_TERM      // 學生每學期收費
  FIXED_PER_LESSON      // 固定每堂收費
  FIXED_PER_TERM        // 固定每學期收費
  PACKAGE               // 套餐收費
}
```

---

## 📚 SchoolCourse（課程）

```prisma
model SchoolCourse {
  id                    String    @id @default(cuid())
  schoolId              String    @map("school_id")

  // 課程資料
  courseName            String    @map("course_name")
  courseType            CourseType @map("course_type")
  courseTerm            CourseTerm @map("course_term")
  academicYear          String    @map("academic_year")  // "2024-2025"

  // 日期設定
  startDate             DateTime  @map("start_date")
  endDate               DateTime? @map("end_date")

  // 人數設定
  requiredTutors        Int       @default(1) @map("required_tutors")
  maxStudents           Int?      @map("max_students")

  // 收費設定
  chargingModel         ChargingModel @map("charging_model")
  studentPerLessonFee   Decimal?  @map("student_per_lesson_fee") @db.Decimal(10, 2)
  studentPerTermFee     Decimal?  @map("student_per_term_fee") @db.Decimal(10, 2)
  fixedPerLessonFee     Decimal?  @map("fixed_per_lesson_fee") @db.Decimal(10, 2)
  fixedPerTermFee       Decimal?  @map("fixed_per_term_fee") @db.Decimal(10, 2)

  // 導師薪資設定
  tutorPerLessonFee     Decimal?  @map("tutor_per_lesson_fee") @db.Decimal(10, 2)

  // 狀態
  status                CourseStatus @default(DRAFT)

  // 系統欄位
  createdAt             DateTime  @default(now()) @map("created_at")
  updatedAt             DateTime  @updatedAt @map("updated_at")
  deletedAt             DateTime? @map("deleted_at")

  // 關聯
  school                School    @relation(fields: [schoolId], references: [id])
  lessons               SchoolLesson[]
  invoiceCourses        SchoolInvoiceCourse[]

  @@map("school_courses")
}

enum CourseTerm {
  FIRST_TERM            // 上學期
  SECOND_TERM           // 下學期
  FULL_YEAR             // 全年
  SUMMER                // 暑假
  SPECIAL               // 特別
}

enum CourseStatus {
  DRAFT                 // 草稿
  ACTIVE                // 進行中
  COMPLETED             // 已完成
  CANCELLED             // 已取消
}
```

---

## 🗓️ SchoolLesson（課堂）

```prisma
model SchoolLesson {
  id                  String    @id @default(cuid())
  courseId            String    @map("course_id")

  // 時間設定
  lessonDate          DateTime  @map("lesson_date")
  startTime           String    @map("start_time")  // "14:00"
  endTime             String    @map("end_time")    // "15:30"
  weekday             Int                            // 1-7 (一至日)

  // 課堂資料
  lessonType          LessonType @default(REGULAR) @map("lesson_type")
  lessonTerm          CourseTerm @map("lesson_term")
  lessonNumber        Int?      @map("lesson_number")  // 第幾堂

  // 執行狀態
  lessonStatus        LessonStatus @default(SCHEDULED) @map("lesson_status")
  studentCount        Int?      @map("student_count")  // 實際人數
  notes               String?   @db.Text

  // 收費計算
  feeLesson           Decimal?  @map("fee_lesson") @db.Decimal(10, 2)  // 該堂收費

  // 開票狀態
  invoiceStatus       InvoiceStatus @default(NOT_INVOICED) @map("invoice_status")
  paymentStatus       PaymentStatus @default(UNPAID) @map("payment_status")

  // 系統欄位
  createdAt           DateTime  @default(now()) @map("created_at")
  updatedAt           DateTime  @updatedAt @map("updated_at")
  deletedAt           DateTime? @map("deleted_at")

  // 關聯
  course              SchoolCourse @relation(fields: [courseId], references: [id])
  tutorLessons        SchoolTutorLesson[]

  @@map("school_lessons")
}

enum LessonType {
  REGULAR             // 正常課堂
  MAKEUP              // 補堂
  EXTRA               // 加操
  TRIAL               // 試堂
}

enum LessonStatus {
  SCHEDULED           // 已排程
  COMPLETED           // 已完成
  CANCELLED           // 已取消
}

enum InvoiceStatus {
  NOT_INVOICED        // 未開票
  INVOICED            // 已開票
  PAID                // 已收款
}

enum PaymentStatus {
  UNPAID              // 未付款
  PARTIAL             // 部分付款
  PAID                // 已付款
}
```

---

## 👨‍🏫 SchoolTutorLesson（導師任教記錄）

```prisma
model SchoolTutorLesson {
  id                  String    @id @default(cuid())
  lessonId            String    @map("lesson_id")
  userId              String    @map("user_id")
  courseId            String    @map("course_id")  // 冗餘，方便查詢

  // 角色設定
  tutorRole           TutorRole @default(ASSISTANT) @map("tutor_role")

  // 簽到資料
  attendanceStatus    AttendanceStatus @default(SCHEDULED) @map("attendance_status")
  checkInTime         DateTime? @map("check_in_time")
  checkOutTime        DateTime? @map("check_out_time")
  checkInImage        String?   @map("check_in_image")
  geoLocation         String?   @map("geo_location")  // "22.3193,114.1694"
  workingMinutes      Int?      @map("working_minutes")

  // 課堂時間（冗餘，方便排班查詢）
  lessonDate          DateTime  @map("lesson_date")
  startTime           String    @map("start_time")
  endTime             String    @map("end_time")

  // 薪資計算
  salaryCalculationMode SalaryMode @default(PER_LESSON) @map("salary_calculation_mode")
  salaryAmount        Decimal?  @map("salary_amount") @db.Decimal(10, 2)

  // 系統欄位
  createdAt           DateTime  @default(now()) @map("created_at")
  updatedAt           DateTime  @updatedAt @map("updated_at")

  // 關聯
  lesson              SchoolLesson @relation(fields: [lessonId], references: [id])
  user                User      @relation(fields: [userId], references: [id])

  @@unique([lessonId, userId])
  @@map("school_tutor_lessons")
}

enum TutorRole {
  HEAD_COACH          // 主教
  ASSISTANT           // 助教
  TRAINEE             // 實習
}

enum AttendanceStatus {
  SCHEDULED           // 已排程
  CHECKED_IN          // 已簽到
  COMPLETED           // 已完成（簽退）
  ABSENT              // 缺席
  LATE                // 遲到
}

enum SalaryMode {
  PER_LESSON          // 每堂計薪
  PER_HOUR            // 每小時計薪
  FIXED               // 固定薪資
}
```

---

## 💰 SchoolInvoice（發票）

```prisma
model SchoolInvoice {
  id                    String    @id @default(cuid())
  schoolId              String    @map("school_id")

  // 發票資料
  invoiceNumber         String    @unique @map("invoice_number")  // INV-2024-001
  invoiceDate           DateTime  @map("invoice_date")
  dueDate               DateTime? @map("due_date")
  paymentTermsDays      Int       @default(30) @map("payment_terms_days")

  // 金額
  invoiceAmount         Decimal   @map("invoice_amount") @db.Decimal(10, 2)
  paidAmount            Decimal   @default(0) @map("paid_amount") @db.Decimal(10, 2)

  // 狀態
  status                InvoiceDocStatus @default(DRAFT)

  // 收件人資料
  recipientNameChinese  String?   @map("recipient_name_chinese")
  recipientNameEnglish  String?   @map("recipient_name_english")
  contactPosition       String?   @map("contact_position")
  contactEmail          String?   @map("contact_email")
  mailingAddress        String?   @map("mailing_address") @db.Text

  // 發送記錄
  sentDate              DateTime? @map("sent_date")
  sentMethod            String?   @map("sent_method")

  // 備註
  notes                 String?   @db.Text

  // 系統欄位
  createdAt             DateTime  @default(now()) @map("created_at")
  updatedAt             DateTime  @updatedAt @map("updated_at")
  deletedAt             DateTime? @map("deleted_at")
  createdBy             String?   @map("created_by")

  // 關聯
  school                School    @relation(fields: [schoolId], references: [id])
  invoiceCourses        SchoolInvoiceCourse[]
  receipts              SchoolReceipt[]

  @@map("school_invoices")
}

enum InvoiceDocStatus {
  DRAFT                 // 草稿
  SENT                  // 已發送
  PAID                  // 已付款
  PARTIAL               // 部分付款
  OVERDUE               // 已逾期
  CANCELLED             // 已取消
}
```

---

## 🔗 SchoolInvoiceCourse（發票-課程關聯）

```prisma
model SchoolInvoiceCourse {
  id                  String    @id @default(cuid())
  invoiceId           String    @map("invoice_id")
  courseId            String    @map("course_id")

  // 課堂範圍
  lessonDateStart     DateTime? @map("lesson_date_start")
  lessonDateEnd       DateTime? @map("lesson_date_end")
  lessonCount         Int?      @map("lesson_count")

  // 金額
  amount              Decimal   @db.Decimal(10, 2)
  description         String?

  // 系統欄位
  createdAt           DateTime  @default(now()) @map("created_at")

  // 關聯
  invoice             SchoolInvoice @relation(fields: [invoiceId], references: [id])
  course              SchoolCourse  @relation(fields: [courseId], references: [id])

  @@map("school_invoice_courses")
}
```

---

## 🧾 SchoolReceipt（收據）

```prisma
model SchoolReceipt {
  id                      String    @id @default(cuid())
  schoolId                String    @map("school_id")
  invoiceId               String    @map("invoice_id")

  // 收據資料
  receiptNumber           String    @unique @map("receipt_number")  // REC-2024-001

  // 付款資料
  paymentConfirmedDate    DateTime  @map("payment_confirmed_date")
  actualReceivedAmount    Decimal   @map("actual_received_amount") @db.Decimal(10, 2)
  paymentMethod           PaymentMethod @map("payment_method")
  paymentStatus           ReceiptPaymentStatus @default(PENDING) @map("payment_status")

  // 交易資料
  paymentTransactionNumber String?  @map("payment_transaction_number")
  chequeNumber            String?   @map("cheque_number")
  bankName                String?   @map("bank_name")

  // 憑證
  paymentProofImage       String?   @map("payment_proof_image")

  // 備註
  notes                   String?   @db.Text

  // 系統欄位
  createdAt               DateTime  @default(now()) @map("created_at")
  updatedAt               DateTime  @updatedAt @map("updated_at")
  deletedAt               DateTime? @map("deleted_at")
  createdBy               String?   @map("created_by")

  // 關聯
  school                  School    @relation(fields: [schoolId], references: [id])
  invoice                 SchoolInvoice @relation(fields: [invoiceId], references: [id])

  @@map("school_receipts")
}

enum PaymentMethod {
  FPS                     // 轉數快
  CHEQUE                  // 支票
  BANK_TRANSFER           // 銀行轉帳
  CASH                    // 現金
  OTHER                   // 其他
}

enum ReceiptPaymentStatus {
  PENDING                 // 待確認
  CONFIRMED               // 已確認
  BOUNCED                 // 退票
}
```

---

## 📊 常用查詢範例

### 取得學校的所有課程與課堂統計

```typescript
const schoolWithCourses = await prisma.school.findUnique({
  where: { id: schoolId },
  include: {
    courses: {
      include: {
        lessons: {
          select: {
            id: true,
            lessonStatus: true,
          },
        },
        _count: {
          select: { lessons: true },
        },
      },
    },
  },
});
```

### 取得導師的課堂（按日期篩選）

```typescript
const tutorLessons = await prisma.schoolTutorLesson.findMany({
  where: {
    userId: tutorId,
    lessonDate: {
      gte: startDate,
      lte: endDate,
    },
  },
  include: {
    lesson: {
      include: {
        course: {
          include: {
            school: true,
          },
        },
      },
    },
  },
  orderBy: [{ lessonDate: "asc" }, { startTime: "asc" }],
});
```

### 取得可開票的課堂

```typescript
const invoiceableLessons = await prisma.schoolLesson.findMany({
  where: {
    courseId: courseId,
    lessonStatus: "COMPLETED",
    invoiceStatus: "NOT_INVOICED",
    lessonDate: {
      gte: startDate,
      lte: endDate,
    },
  },
  orderBy: { lessonDate: "asc" },
});
```

### 檢查導師時間衝突

```typescript
const conflictLessons = await prisma.schoolTutorLesson.findMany({
  where: {
    userId: tutorId,
    lessonDate: targetDate,
    OR: [
      {
        AND: [
          { startTime: { lte: newStartTime } },
          { endTime: { gt: newStartTime } },
        ],
      },
      {
        AND: [
          { startTime: { lt: newEndTime } },
          { endTime: { gte: newEndTime } },
        ],
      },
    ],
  },
});

const hasConflict = conflictLessons.length > 0;
```

---

## 🔢 編號生成規則

| 類型     | 格式                         | 範例            |
| -------- | ---------------------------- | --------------- |
| 報價編號 | `Q{年份}-{流水號}`           | Q2024-001       |
| 發票編號 | `INV-{年份}-{月份}-{流水號}` | INV-2024-09-001 |
| 收據編號 | `REC-{年份}-{月份}-{流水號}` | REC-2024-09-001 |

### 生成函數範例

```typescript
async function generateQuotationNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `Q${year}-`;

  const lastQuotation = await prisma.schoolQuotation.findFirst({
    where: {
      quotationNumber: { startsWith: prefix },
    },
    orderBy: { quotationNumber: "desc" },
  });

  const nextNumber = lastQuotation
    ? parseInt(lastQuotation.quotationNumber.split("-")[1]) + 1
    : 1;

  return `${prefix}${nextNumber.toString().padStart(3, "0")}`;
}
```
