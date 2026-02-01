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
  schoolName             String                    // 學校名稱（中文）
  schoolNameEn           String?                   // 學校名稱（英文）
  schoolCode             String?   @unique         // 學校編號（可選）

  // 聯絡資料
  address                String                    // 學校地址
  phone                  String?                   // 學校電話
  fax                    String?                   // 傳真
  email                  String?                   // 學校電郵
  website                String?                   // 學校網站

  // 合作狀態
  partnershipStatus      PartnershipStatus @default(INQUIRY)
  partnershipStartDate   DateTime?                 // 合作開始日期
  partnershipEndDate     DateTime?                 // 合作結束日期
  partnershipStartYear   String?                   // 合作開始學年（例如：2024-2025）
  partnershipEndYear     String?                   // 合作結束學年
  confirmationChannel    String?                   // 合作確認渠道（電話/電郵/會議）

  // 備註
  remarks                String?   @db.Text

  // 系統欄位
  createdAt              DateTime  @default(now())
  updatedAt              DateTime  @updatedAt
  deletedAt              DateTime?                 // Soft delete

  // 關聯
  contacts               SchoolContact[]
  quotations             SchoolQuotation[]
  courses                SchoolCourse[]
  invoices               SchoolInvoice[]
  receipts               SchoolReceipt[]

  @@index([partnershipStatus])
  @@index([schoolName])
  @@map("schools")
}

enum PartnershipStatus {
  INQUIRY           // 查詢中
  QUOTATION_SENT    // 已發送報價
  NEGOTIATING       // 洽談中
  CONFIRMED         // 已確認合作
  ACTIVE            // 合作中
  SUSPENDED         // 暫停合作
  TERMINATED        // 已終止
}
```

### 欄位說明

| 欄位                   | 類型     | 必填 | 說明                           |
| ---------------------- | -------- | ---- | ------------------------------ |
| `schoolName`           | String   | ✅   | 學校中文名稱                   |
| `schoolNameEn`         | String   | -    | 學校英文名稱                   |
| `schoolCode`           | String   | -    | 學校編號（唯一）               |
| `address`              | String   | ✅   | 學校地址                       |
| `partnershipStatus`    | Enum     | ✅   | 合作狀態                       |
| `partnershipStartDate` | DateTime | -    | 合作開始日期                   |
| `partnershipEndDate`   | DateTime | -    | 合作結束日期                   |
| `partnershipStartYear` | String   | -    | 合作開始學年（如 "2024-2025"） |
| `partnershipEndYear`   | String   | -    | 合作結束學年                   |
| `confirmationChannel`  | String   | -    | 確認渠道（電話/電郵/會議）     |
| `remarks`              | Text     | -    | 備註                           |

---

## 👤 SchoolContact（學校聯絡人）

```prisma
model SchoolContact {
  id                String    @id @default(cuid())
  schoolId          String
  school            School    @relation(fields: [schoolId], references: [id], onDelete: Cascade)

  // 聯絡人資料
  salutation        String?                   // 稱謂（先生/女士/校長等）
  nameChinese       String                    // 中文姓名
  nameEnglish       String?                   // 英文姓名
  position          String?                   // 職位
  department        String?                   // 部門

  // 聯絡方式
  phone             String?                   // 電話
  mobile            String?                   // 手提電話
  email             String?                   // 電郵

  // 主要聯絡人標記
  isPrimary         Boolean   @default(false)

  // 備註
  remarks           String?   @db.Text

  // 系統欄位
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  deletedAt         DateTime?

  @@unique([schoolId, email])  // 同一學校不可有重複電郵的聯絡人
  @@index([schoolId])
  @@index([isPrimary])
  @@map("school_contacts")
}
```

---

## 📄 SchoolQuotation（報價單）

```prisma
model SchoolQuotation {
  id                    String    @id @default(cuid())
  schoolId              String
  school                School    @relation(fields: [schoolId], references: [id], onDelete: Cascade)

  // 報價編號
  quotationNumber       String    @unique           // 自動生成（例如：Q2024-001）

  // 報價狀態
  status                QuotationStatus @default(DRAFT)

  // 查詢需求記錄
  inquiryDate           DateTime?                   // 查詢日期
  desiredStartDate      DateTime?                   // 希望開始日期
  estimatedStudentCount Int?                        // 預計學生人數
  desiredSchedule       String?   @db.Text          // 希望上課時間（文字描述）
  inquiryRemarks        String?   @db.Text          // 查詢內容備註

  // 報價資料
  quotationDate         DateTime  @default(now())   // 報價日期
  validUntil            DateTime?                   // 報價有效期至
  totalAmount           Decimal?  @db.Decimal(10, 2) // 報價總金額

  // 發送記錄
  sentDate              DateTime?                   // 發送日期
  sentBy                String?                     // 發送人員 ID
  sentByUser            User?     @relation("QuotationSentBy", fields: [sentBy], references: [id])

  // 回應記錄
  respondedDate         DateTime?                   // 回應日期
  rejectionReason       String?   @db.Text          // 拒絕原因

  // 備註
  remarks               String?   @db.Text

  // 關聯
  items                 SchoolQuotationItem[]       // 報價項目

  // 系統欄位
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
  deletedAt             DateTime?

  @@index([schoolId])
  @@index([status])
  @@index([quotationNumber])
  @@map("school_quotations")
}

enum QuotationStatus {
  DRAFT             // 草稿
  SENT              // 已發送
  ACCEPTED          // 已接受
  REJECTED          // 已拒絕
  EXPIRED           // 已過期
  REVISED           // 已修訂
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
  quotationId         String
  quotation           SchoolQuotation @relation(fields: [quotationId], references: [id], onDelete: Cascade)

  // 課程資料
  courseName          String                    // 課程名稱
  courseType          String                    // 課程類型
  description         String?   @db.Text        // 課程描述

  // 收費資料
  chargingModel       ChargingModel             // 收費模式
  unitPrice           Decimal   @db.Decimal(10, 2) // 單價
  quantity            Int                       // 數量（堂數/小時數等）
  totalPrice          Decimal   @db.Decimal(10, 2) // 小計

  // 課程安排
  lessonsPerWeek      Int?                      // 每週堂數
  durationMinutes     Int?                      // 每堂時長（分鐘）
  estimatedStudents   Int?                      // 預計學生人數
  requiredTutors      Int?                      // 所需導師人數

  // 備註
  remarks             String?   @db.Text

  // 系統欄位
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt

  @@index([quotationId])
  @@map("school_quotation_items")
}

enum ChargingModel {
  STUDENT_PER_LESSON    // 學生每節課堂收費
  TUTOR_PER_LESSON      // 導師每堂節數收費
  STUDENT_HOURLY        // 學生課堂時數收費
  TUTOR_HOURLY          // 導師時薪節數收費
  STUDENT_FULL_COURSE   // 學生全期課程收費
  TEAM_ACTIVITY         // 帶隊活動收費
}
```

---

## 📚 SchoolCourse（課程）

```prisma
model SchoolCourse {
  id                    String    @id @default(cuid())
  schoolId              String
  school                School    @relation(fields: [schoolId], references: [id], onDelete: Cascade)

  // 課程基本資料
  courseName            String                    // 課程名稱
  courseCode            String?                   // 課程編號（可選）
  courseType            String                    // 課程類型
  description           String?   @db.Text        // 課程描述

  // 學期設定
  courseTerm            CourseTerm @default(FULL_YEAR) // 學期類型
  academicYear          String                    // 學年（例如：2024-2025）
  startDate             DateTime?                 // 課程開始日期
  endDate               DateTime?                 // 課程結束日期

  // 人數設定
  requiredTutors        Int       @default(1)     // 所需導師人數
  maxStudents           Int?                      // 最大學生人數

  // 收費模式（多選）
  chargingModels        ChargingModel[] @default([])

  // 學生收費（依 chargingModel 而定）
  studentPerLessonFee   Decimal?  @db.Decimal(10, 2) // 學生每堂收費
  studentHourlyFee      Decimal?  @db.Decimal(10, 2) // 學生時薪收費
  studentFullCourseFee  Decimal?  @db.Decimal(10, 2) // 學生全期收費
  teamActivityFee       Decimal?  @db.Decimal(10, 2) // 帶隊活動收費

  // 導師薪資（依 chargingModel 而定）
  tutorPerLessonFee     Decimal?  @db.Decimal(10, 2) // 導師每堂收費
  tutorHourlyFee        Decimal?  @db.Decimal(10, 2) // 導師時薪

  // 付款模式
  paymentMode           String?                   // 付款模式（例如：月結30天、即時付款）

  // 課程狀態
  status                CourseStatus @default(DRAFT)

  // 備註
  remarks               String?   @db.Text

  // 關聯
  lessons               SchoolLesson[]
  invoiceCourses        SchoolInvoiceCourse[]     // 多對多關聯

  // 系統欄位
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
  deletedAt             DateTime?

  @@index([schoolId])
  @@index([academicYear])
  @@index([courseType])
  @@index([status])
  @@map("school_courses")
}

enum CourseTerm {
  FULL_YEAR             // 全期不分學期
  FIRST_TERM            // 上學期
  SECOND_TERM           // 下學期
  SUMMER                // 暑期
}

enum CourseStatus {
  DRAFT                 // 草稿
  SCHEDULED             // 已排程
  ACTIVE                // 進行中
  COMPLETED             // 已完成
  CANCELLED             // 已取消
  SUSPENDED             // 已暫停
}
```

---

## 🗓️ SchoolLesson（課堂）

```prisma
model SchoolLesson {
  id                  String    @id @default(cuid())
  courseId            String
  course              SchoolCourse @relation(fields: [courseId], references: [id], onDelete: Cascade)

  // 課堂基本資料
  lessonDate          DateTime                  // 上課日期
  startTime           String                    // 開始時間（HH:mm 格式）
  endTime             String                    // 結束時間（HH:mm 格式）
  weekday             Int                       // 星期（1-7，1=Monday）

  // 課堂類型
  lessonType          LessonType @default(REGULAR) // 恆常/補堂/加操
  lessonTerm          CourseTerm?               // 所屬學期（若課程分學期）

  // 學生資料
  studentCount        Int?                      // 實際學生人數

  // 課堂狀態
  lessonStatus        LessonStatus @default(SCHEDULED)

  // 收費資料（用於生成 Invoice）
  feeMode             String?                   // 收費模式
  feePerMode          Decimal?  @db.Decimal(10, 2) // 單價
  feeLesson           Decimal?  @db.Decimal(10, 2) // 本課堂收費金額

  // 發票狀態
  invoiceStatus       String?   @default("NOT_INVOICED") // 發票狀態
  invoiceId           String?                   // 關聯的發票 ID
  invoice             SchoolInvoice? @relation(fields: [invoiceId], references: [id])

  // 付款狀態
  paymentStatus       PaymentStatus @default(PENDING)

  // 備註
  remarks             String?   @db.Text

  // 關聯
  tutorLessons        SchoolTutorLesson[]       // 導師任教記錄

  // 系統欄位
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
  deletedAt           DateTime?

  @@index([courseId])
  @@index([lessonDate])
  @@index([lessonStatus])
  @@index([invoiceStatus])
  @@index([invoiceId])
  @@map("school_lessons")
}

enum LessonType {
  REGULAR             // 恆常課堂
  MAKEUP              // 補堂
  EXTRA_PRACTICE      // 加操
}

enum LessonStatus {
  SCHEDULED           // 已排程
  IN_PROGRESS         // 進行中
  COMPLETED           // 已完成
  CANCELLED           // 已取消
  POSTPONED           // 已延期
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
  id                    String    @id @default(cuid())

  // 關聯
  lessonId              String
  lesson                SchoolLesson @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  userId                String                    // 關聯到 User.id
  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  courseId              String                    // 冗餘欄位，方便查詢

  // 導師角色
  tutorRole             TutorRole @default(HEAD_COACH)

  // 出勤狀態
  attendanceStatus      AttendanceStatus @default(SCHEDULED)
  notificationStatus    String?                   // 通知狀態（已通知/未通知）

  // 簽到資料
  checkInImage          String?                   // 簽到相片 URL
  geoLocation           String?                   // 簽到地理位置（經緯度）
  checkInTime           DateTime?                 // 簽到時間
  checkOutTime          DateTime?                 // 簽退時間
  workingMinutes        Int?                      // 實際工作分鐘數

  // 薪資計算
  salaryCalculationMode SalaryCalculationMode?    // 薪資計算方式
  baseLessonSalary      Decimal?  @db.Decimal(10, 2) // 基本課堂薪資
  salaryDetails         Json?                     // 薪資明細（JSON）
  totalSalary           Decimal?  @db.Decimal(10, 2) // 總薪資

  // 付款狀態
  paymentStatus         PaymentStatus @default(PENDING)
  paymentId             String?                   // 關聯到薪資發放記錄

  // 課堂資料（冗餘，方便查詢）
  lessonDate            DateTime?                 // 上課日期
  startTime             String?                   // 開始時間
  endTime               String?                   // 結束時間
  lessonLocation        String?                   // 上課地點（學校名稱）

  // 教案
  lessonPlanId          String?                   // 教案 ID

  // 備註
  attendanceRemarks     String?   @db.Text

  // 系統欄位
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
  deletedAt             DateTime?

  @@unique([lessonId, userId])  // 防止同一課堂重複分配同一導師
  @@index([lessonId])
  @@index([userId])
  @@index([courseId])
  @@index([attendanceStatus])
  @@index([paymentStatus])
  @@index([lessonDate])
  @@map("school_tutor_lessons")
}

enum TutorRole {
  HEAD_COACH          // 主教
  ASSISTANT_COACH     // 副教
  TEACHING_ASSISTANT  // 助教
  SUBSTITUTE          // 代課
  STAFF               // 工作人員
  NOT_APPLICABLE      // 不適用
}

enum AttendanceStatus {
  SCHEDULED           // 已排班
  CONFIRMED           // 已確認
  CHECKED_IN          // 已簽到
  COMPLETED           // 已完成
  ABSENT              // 缺席
  LATE                // 遲到
  EARLY_LEAVE         // 早退
}

enum SalaryCalculationMode {
  PER_LESSON          // 按堂
  HOURLY              // 按小時
  MONTHLY_FIXED       // 固定月薪
}
```

---

## 💰 SchoolInvoice（發票）

```prisma
model SchoolInvoice {
  id                    String    @id @default(cuid())
  schoolId              String
  school                School    @relation(fields: [schoolId], references: [id], onDelete: Cascade)

  // 發票編號
  invoiceNumber         String    @unique           // 發票編號（自動生成）
  invoiceToken          String?   @unique           // 發票 Token（用於查詢）

  // 發票類型
  invoiceType           String?                     // 發票類型（課程/設備/其他服務）

  // 發票日期
  invoiceDate           DateTime  @default(now())   // 發票日期

  // 付款條款
  paymentTermsDays      Int       @default(30)      // 付款期限（天數）
  dueDate               DateTime?                   // 到期日

  // 發票狀態
  status                InvoiceStatus @default(DRAFT)
  invoiceProgress       String?                     // 發票進度（舊欄位保留）

  // 金額
  invoiceAmount         Decimal   @db.Decimal(10, 2) // 發票總金額

  // 發送記錄
  sentDate              DateTime?                   // 發送日期

  // 收件人資料（可與 SchoolContact 不同）
  salutation            String?                     // 稱謂
  recipientNameChinese  String?                     // 收件人中文姓名
  recipientNameEnglish  String?                     // 收件人英文姓名
  contactPosition       String?                     // 職位
  contactPhone          String?                     // 聯絡電話
  contactEmail          String?                     // 聯絡電郵
  schoolPhone           String?                     // 學校電話
  schoolFax             String?                     // 學校傳真
  mailingAddress        String?   @db.Text          // 郵寄地址

  // 項目明細（JSON 格式）
  courseItems           Json?                       // 課程項目
  onsiteServiceItems    Json?                       // 到校服務項目
  equipmentSalesItems   Json?                       // 設備銷售項目
  otherServiceItems     Json?                       // 其他服務項目

  // 備註
  invoiceRemarks        String?   @db.Text

  // 關聯
  courses               SchoolInvoiceCourse[]       // 多對多關聯到課程
  receipt               SchoolReceipt?              // 一對一關聯收據
  lessons               SchoolLesson[]              // 直接關聯的課堂

  // 系統欄位
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
  deletedAt             DateTime?

  @@index([schoolId])
  @@index([status])
  @@index([invoiceNumber])
  @@index([invoiceDate])
  @@map("school_invoices")
}

enum InvoiceStatus {
  DRAFT                 // 草稿
  PENDING_APPROVAL      // 待審核
  PENDING_SEND          // 待發送
  SENT                  // 已發送
  OVERDUE               // 已逾期
  PAID                  // 已付款
  CANCELLED             // 已取消
  VOID                  // 作廢
}
```

---

## 🔗 SchoolInvoiceCourse（發票-課程關聯）

```prisma
model SchoolInvoiceCourse {
  id                  String    @id @default(cuid())
  invoiceId           String
  invoice             SchoolInvoice @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  courseId            String
  course              SchoolCourse  @relation(fields: [courseId], references: [id], onDelete: Cascade)

  // 此課程在發票中的金額（可能只計部分課堂）
  amount              Decimal   @db.Decimal(10, 2)

  // 備註
  remarks             String?   @db.Text

  // 系統欄位
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt

  @@unique([invoiceId, courseId])  // 同一發票不可重複加入同一課程
  @@index([invoiceId])
  @@index([courseId])
  @@map("school_invoice_courses")
}
```

---

## 🧾 SchoolReceipt（收據）

```prisma
model SchoolReceipt {
  id                       String    @id @default(cuid())
  schoolId                 String
  school                   School    @relation(fields: [schoolId], references: [id], onDelete: Cascade)
  invoiceId                String    @unique  // 一張發票對應一張收據
  invoice                  SchoolInvoice @relation(fields: [invoiceId], references: [id], onDelete: Cascade)

  // 收據編號
  receiptNumber            String    @unique           // 收據編號（自動生成）
  paymentNumber            String?                     // 付款編號

  // 收據進度
  receiptProgress          String?                     // 收據進度

  // 付款資料
  paymentConfirmedDate     DateTime?                   // 付款確認日期
  actualReceivedAmount     Decimal?  @db.Decimal(10, 2) // 實際收款金額
  paymentMethod            PaymentMethod?              // 付款方式
  paymentStatus            PaymentStatus @default(PENDING) // 付款狀態
  paymentTransactionNumber String?                     // 交易編號/支票號碼

  // 備註
  receiptRemarks           String?   @db.Text

  // 系統欄位
  createdAt                DateTime  @default(now())
  updatedAt                DateTime  @updatedAt
  deletedAt                DateTime?

  @@index([schoolId])
  @@index([invoiceId])
  @@index([paymentStatus])
  @@index([receiptNumber])
  @@map("school_receipts")
}

enum PaymentMethod {
  CASH                    // 現金
  CHEQUE                  // 支票
  BANK_TRANSFER           // 銀行轉帳
  FPS                     // 轉數快
  PAYME                   // PayMe
  ALIPAY_HK               // 支付寶香港
  WECHAT_PAY_HK           // 微信支付香港
  CREDIT_CARD             // 信用卡
  AUTOPAY                 // 自動轉帳
  OTHER                   // 其他
}

enum PaymentStatus {
  PENDING                 // 待付款
  PARTIAL                 // 部分付款
  PAID                    // 已付款
  REFUNDED                // 已退款
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
