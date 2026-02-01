# 🗄️ 資料庫邏輯功能文檔

> 本文檔詳細說明學校服務模組的資料庫設計邏輯、實體關係與業務規則

---

## 📋 目錄

1. [模組概述](#模組概述)
2. [實體關係圖](#實體關係圖)
3. [枚舉定義](#枚舉定義)
4. [核心實體](#核心實體)
5. [關聯邏輯](#關聯邏輯)
6. [業務流程對應](#業務流程對應)
7. [資料完整性規則](#資料完整性規則)
8. [索引策略](#索引策略)

---

## 模組概述

學校服務模組（School Outreach Service）是一套完整的 B2B 到校服務管理系統，涵蓋從**查詢接洽**到**收款結算**的完整業務流程。

### 核心功能領域

| 領域         | 說明                 | 主要實體                                                |
| ------------ | -------------------- | ------------------------------------------------------- |
| **客戶管理** | 學校資料與聯絡人管理 | `School`, `SchoolContact`                               |
| **報價管理** | 報價單建立與追蹤     | `SchoolQuotation`, `SchoolQuotationItem`                |
| **課程管理** | 課程設定與課堂排程   | `SchoolCourse`, `SchoolLesson`                          |
| **人員管理** | 導師分配與出勤記錄   | `SchoolTutorLesson`                                     |
| **財務管理** | 發票開立與收款記錄   | `SchoolInvoice`, `SchoolInvoiceCourse`, `SchoolReceipt` |

---

## 實體關係圖

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              School（學校）                              │
│  - 核心實體，所有業務資料的根節點                                         │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
         ┌───────────┬───────────┼───────────┬───────────┐
         │           │           │           │           │
         ▼           ▼           ▼           ▼           ▼
   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
   │ Contact  │ │Quotation │ │  Course  │ │ Invoice  │ │ Receipt  │
   │ 聯絡人   │ │  報價單  │ │   課程   │ │   發票   │ │   收據   │
   └──────────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └──────────┘
                     │            │            │              ▲
                     ▼            │            │              │
              ┌───────────┐       │      ┌─────┴─────┐        │
              │ QuotItem  │       │      │InvCourse  │        │
              │ 報價項目  │       │      │發票-課程  │────────┘
              └───────────┘       │      └───────────┘    (1:1)
                                  │            │
                                  ▼            │
                            ┌──────────┐       │
                            │  Lesson  │◄──────┘
                            │   課堂   │
                            └────┬─────┘
                                 │
                                 ▼
                          ┌────────────┐
                          │TutorLesson │
                          │ 導師任教   │
                          └────────────┘
                                 │
                                 ▼
                            ┌────────┐
                            │  User  │
                            │  用戶  │
                            └────────┘
```

---

## 枚舉定義

### 合作狀態 `PartnershipStatus`

追蹤學校從初次接觸到合作終止的完整生命週期。

| 值               | 中文       | 說明         | 觸發條件           |
| ---------------- | ---------- | ------------ | ------------------ |
| `INQUIRY`        | 查詢中     | 初始狀態     | 建立學校記錄時     |
| `QUOTATION_SENT` | 已發送報價 | 報價已發送   | 發送報價單時       |
| `NEGOTIATING`    | 洽談中     | 雙方協商中   | 手動標記           |
| `CONFIRMED`      | 已確認合作 | 確認合作意向 | 接受報價或口頭確認 |
| `ACTIVE`         | 合作中     | 有進行中課程 | 課程開始時         |
| `SUSPENDED`      | 暫停合作   | 暫時停止     | 手動標記           |
| `TERMINATED`     | 已終止     | 合作結束     | 手動標記           |

**狀態流轉：**

```
INQUIRY → QUOTATION_SENT → NEGOTIATING → CONFIRMED → ACTIVE
                                                        ↓
                                              SUSPENDED ↔ ACTIVE
                                                        ↓
                                                   TERMINATED
```

### 報價狀態 `QuotationStatus`

| 值         | 中文   | 說明           |
| ---------- | ------ | -------------- |
| `DRAFT`    | 草稿   | 尚未發送       |
| `SENT`     | 已發送 | 已發送給學校   |
| `ACCEPTED` | 已接受 | 學校接受報價   |
| `REJECTED` | 已拒絕 | 學校拒絕報價   |
| `EXPIRED`  | 已過期 | 超過有效期     |
| `REVISED`  | 已修訂 | 報價已修改重發 |

### 收費模式 `ChargingModel`

支援多種靈活的收費方式，可組合使用。

| 值                    | 中文             | 計算邏輯               |
| --------------------- | ---------------- | ---------------------- |
| `STUDENT_PER_LESSON`  | 學生每節課堂收費 | 單價 × 學生數 × 課堂數 |
| `TUTOR_PER_LESSON`    | 導師每堂節數收費 | 固定每堂收費           |
| `STUDENT_HOURLY`      | 學生課堂時數收費 | 單價 × 學生數 × 時數   |
| `TUTOR_HOURLY`        | 導師時薪節數收費 | 時薪 × 時數            |
| `STUDENT_FULL_COURSE` | 學生全期課程收費 | 固定全期費用           |
| `TEAM_ACTIVITY`       | 帶隊活動收費     | 活動固定費用           |

### 課堂類型 `LessonType`

| 值               | 中文     | 說明           |
| ---------------- | -------- | -------------- |
| `REGULAR`        | 恆常課堂 | 正常排程課堂   |
| `MAKEUP`         | 補堂     | 補回取消的課堂 |
| `EXTRA_PRACTICE` | 加操     | 額外練習課堂   |

### 課堂狀態 `LessonStatus`

| 值            | 中文   | 說明       |
| ------------- | ------ | ---------- |
| `SCHEDULED`   | 已排程 | 課堂已建立 |
| `IN_PROGRESS` | 進行中 | 課堂進行中 |
| `COMPLETED`   | 已完成 | 課堂已結束 |
| `CANCELLED`   | 已取消 | 課堂取消   |
| `POSTPONED`   | 已延期 | 課堂延後   |

### 發票狀態 `InvoiceStatus`

| 值                 | 中文   | 說明           |
| ------------------ | ------ | -------------- |
| `DRAFT`            | 草稿   | 尚未發送       |
| `PENDING_APPROVAL` | 待審核 | 等待內部審核   |
| `PENDING_SEND`     | 待發送 | 審核通過待發送 |
| `SENT`             | 已發送 | 已發送給學校   |
| `OVERDUE`          | 已逾期 | 超過付款期限   |
| `PAID`             | 已付款 | 已收到款項     |
| `CANCELLED`        | 已取消 | 發票取消       |
| `VOID`             | 作廢   | 發票作廢       |

### 付款狀態 `PaymentStatus`

| 值         | 中文     | 說明         |
| ---------- | -------- | ------------ |
| `PENDING`  | 待付款   | 尚未付款     |
| `PARTIAL`  | 部分付款 | 已收部分款項 |
| `PAID`     | 已付款   | 已全額付款   |
| `REFUNDED` | 已退款   | 款項已退回   |

### 付款方式 `PaymentMethod`

| 值              | 中文         |
| --------------- | ------------ |
| `CASH`          | 現金         |
| `CHEQUE`        | 支票         |
| `BANK_TRANSFER` | 銀行轉帳     |
| `FPS`           | 轉數快       |
| `PAYME`         | PayMe        |
| `ALIPAY_HK`     | 支付寶香港   |
| `WECHAT_PAY_HK` | 微信支付香港 |
| `CREDIT_CARD`   | 信用卡       |
| `AUTOPAY`       | 自動轉帳     |
| `OTHER`         | 其他         |

### 導師角色 `TutorRole`

| 值                   | 中文     | 說明         |
| -------------------- | -------- | ------------ |
| `HEAD_COACH`         | 主教     | 主要負責教學 |
| `ASSISTANT_COACH`    | 副教     | 協助主教     |
| `TEACHING_ASSISTANT` | 助教     | 輔助工作     |
| `SUBSTITUTE`         | 代課     | 臨時代課     |
| `STAFF`              | 工作人員 | 非教學人員   |
| `NOT_APPLICABLE`     | 不適用   | 特殊情況     |

### 出勤狀態 `AttendanceStatus`

| 值            | 中文   | 說明           |
| ------------- | ------ | -------------- |
| `SCHEDULED`   | 已排班 | 已分配但未簽到 |
| `CONFIRMED`   | 已確認 | 導師確認出席   |
| `CHECKED_IN`  | 已簽到 | 已到場簽到     |
| `COMPLETED`   | 已完成 | 課堂結束簽退   |
| `ABSENT`      | 缺席   | 未出席         |
| `LATE`        | 遲到   | 遲到簽到       |
| `EARLY_LEAVE` | 早退   | 提前離開       |

### 薪資計算模式 `SalaryCalculationMode`

| 值              | 中文     | 計算方式        |
| --------------- | -------- | --------------- |
| `PER_LESSON`    | 按堂     | 每堂固定薪資    |
| `HOURLY`        | 按小時   | 時薪 × 工作時數 |
| `MONTHLY_FIXED` | 固定月薪 | 每月固定金額    |

### 課程學期 `CourseTerm`

| 值            | 中文         | 說明        |
| ------------- | ------------ | ----------- |
| `FULL_YEAR`   | 全期不分學期 | 全年課程    |
| `FIRST_TERM`  | 上學期       | 9 月至 1 月 |
| `SECOND_TERM` | 下學期       | 2 月至 7 月 |
| `SUMMER`      | 暑期         | 7 月至 8 月 |

### 課程狀態 `CourseStatus`

| 值          | 中文   | 說明       |
| ----------- | ------ | ---------- |
| `DRAFT`     | 草稿   | 尚未啟用   |
| `SCHEDULED` | 已排程 | 課堂已排定 |
| `ACTIVE`    | 進行中 | 課程進行中 |
| `COMPLETED` | 已完成 | 課程結束   |
| `CANCELLED` | 已取消 | 課程取消   |
| `SUSPENDED` | 已暫停 | 暫時停止   |

---

## 核心實體

### School（學校）

**用途：** 儲存合作學校的基本資料與合作狀態

**關鍵欄位邏輯：**

| 欄位                   | 邏輯說明                       |
| ---------------------- | ------------------------------ |
| `schoolCode`           | 唯一識別碼，可選填             |
| `partnershipStatus`    | 追蹤合作生命週期               |
| `partnershipStartYear` | 學年格式如 `2024-2025`         |
| `confirmationChannel`  | 記錄確認方式（電話/電郵/會議） |
| `deletedAt`            | 軟刪除標記                     |

**關聯：**

- 一對多：`SchoolContact`, `SchoolQuotation`, `SchoolCourse`, `SchoolInvoice`, `SchoolReceipt`

---

### SchoolContact（學校聯絡人）

**用途：** 支援一間學校有多位聯絡人

**關鍵欄位邏輯：**

| 欄位         | 邏輯說明                     |
| ------------ | ---------------------------- |
| `isPrimary`  | 標記主要聯絡人，用於預設選擇 |
| `salutation` | 稱謂（先生/女士/校長等）     |

**唯一約束：**

- `@@unique([schoolId, email])` - 同一學校不可有重複電郵的聯絡人

---

### SchoolQuotation（報價單）

**用途：** 記錄報價資訊與學校回應

**關鍵欄位邏輯：**

| 欄位              | 邏輯說明                           |
| ----------------- | ---------------------------------- |
| `quotationNumber` | 自動生成，格式 `Q{年份}-{流水號}`  |
| `validUntil`      | 報價有效期，過期自動標記 `EXPIRED` |
| `totalAmount`     | 自動計算所有項目小計總和           |
| `sentBy`          | 關聯發送人員 `User`                |

**業務規則：**

1. 報價單必須有至少一個項目才能發送
2. 已發送的報價單不能刪除項目
3. 報價非必要流程，可直接建立課程

---

### SchoolQuotationItem（報價項目）

**用途：** 一份報價可包含多個課程方案

**關鍵欄位邏輯：**

| 欄位              | 邏輯說明               |
| ----------------- | ---------------------- |
| `chargingModel`   | 決定收費計算方式       |
| `totalPrice`      | `unitPrice × quantity` |
| `lessonsPerWeek`  | 建議每週堂數           |
| `durationMinutes` | 每堂時長（分鐘）       |

---

### SchoolCourse（到校課程）

**用途：** 實際執行的課程設定

**關鍵欄位邏輯：**

| 欄位             | 邏輯說明                       |
| ---------------- | ------------------------------ |
| `chargingModels` | 陣列類型，支援多種收費模式組合 |
| `academicYear`   | 學年格式如 `2024-2025`         |
| `courseTerm`     | 學期類型                       |
| `requiredTutors` | 每堂所需導師人數               |

**收費欄位對應：**

| 收費模式              | 對應欄位               |
| --------------------- | ---------------------- |
| `STUDENT_PER_LESSON`  | `studentPerLessonFee`  |
| `STUDENT_HOURLY`      | `studentHourlyFee`     |
| `STUDENT_FULL_COURSE` | `studentFullCourseFee` |
| `TEAM_ACTIVITY`       | `teamActivityFee`      |
| `TUTOR_PER_LESSON`    | `tutorPerLessonFee`    |
| `TUTOR_HOURLY`        | `tutorHourlyFee`       |

---

### SchoolLesson（到校課堂）

**用途：** 單次課堂記錄

**關鍵欄位邏輯：**

| 欄位                    | 邏輯說明       |
| ----------------------- | -------------- |
| `lessonDate`            | 上課日期       |
| `startTime` / `endTime` | HH:mm 格式     |
| `weekday`               | 1-7，1=Monday  |
| `invoiceStatus`         | 追蹤是否已開票 |
| `paymentStatus`         | 追蹤付款狀態   |
| `feeLesson`             | 本課堂收費金額 |

**發票關聯：**

- `invoiceId` 可選，課堂可個別或批次開票

---

### SchoolInvoice（到校發票）

**用途：** 向學校開立的發票

**關鍵欄位邏輯：**

| 欄位                                                                               | 邏輯說明                         |
| ---------------------------------------------------------------------------------- | -------------------------------- |
| `invoiceNumber`                                                                    | 自動生成，唯一                   |
| `invoiceToken`                                                                     | 用於外部查詢的 Token             |
| `paymentTermsDays`                                                                 | 付款期限天數，預設 30 天         |
| `dueDate`                                                                          | `invoiceDate + paymentTermsDays` |
| `courseItems` / `onsiteServiceItems` / `equipmentSalesItems` / `otherServiceItems` | JSON 格式明細                    |

**收件人資料：**

- 可與 `SchoolContact` 不同，支援自訂收件人

---

### SchoolInvoiceCourse（發票-課程關聯）

**用途：** 多對多關聯表，一張發票可包含多個課程

**關鍵欄位邏輯：**

| 欄位     | 邏輯說明                                 |
| -------- | ---------------------------------------- |
| `amount` | 此課程在發票中的金額（可能只計部分課堂） |

**唯一約束：**

- `@@unique([invoiceId, courseId])` - 同一發票不可重複加入同一課程

---

### SchoolReceipt（收據/收款記錄）

**用途：** 記錄付款確認與收據資訊

**關鍵欄位邏輯：**

| 欄位                       | 邏輯說明                         |
| -------------------------- | -------------------------------- |
| `receiptNumber`            | 自動生成，唯一                   |
| `invoiceId`                | 一對一關聯，一張發票對應一張收據 |
| `actualReceivedAmount`     | 實際收款金額                     |
| `paymentTransactionNumber` | 交易編號/支票號碼                |

---

### SchoolTutorLesson（導師任教記錄）

**用途：** 記錄導師的課堂分配與出勤

**關鍵欄位邏輯：**

| 欄位                    | 邏輯說明               |
| ----------------------- | ---------------------- |
| `tutorRole`             | 導師在該課堂的角色     |
| `attendanceStatus`      | 出勤狀態追蹤           |
| `checkInImage`          | 簽到相片 URL           |
| `geoLocation`           | 簽到地理位置（經緯度） |
| `workingMinutes`        | 實際工作分鐘數         |
| `salaryCalculationMode` | 薪資計算方式           |
| `totalSalary`           | 該課堂總薪資           |

**冗餘欄位：**

- `courseId`, `lessonDate`, `startTime`, `endTime`, `lessonLocation` - 方便查詢排班

**唯一約束：**

- `@@unique([lessonId, userId])` - 防止同一課堂重複分配同一導師

---

## 關聯邏輯

### 一對多關聯

| 父實體            | 子實體                | 說明                     |
| ----------------- | --------------------- | ------------------------ |
| `School`          | `SchoolContact`       | 一間學校多位聯絡人       |
| `School`          | `SchoolQuotation`     | 一間學校多份報價         |
| `School`          | `SchoolCourse`        | 一間學校多個課程         |
| `School`          | `SchoolInvoice`       | 一間學校多張發票         |
| `School`          | `SchoolReceipt`       | 一間學校多張收據         |
| `SchoolQuotation` | `SchoolQuotationItem` | 一份報價多個項目         |
| `SchoolCourse`    | `SchoolLesson`        | 一個課程多堂課           |
| `SchoolLesson`    | `SchoolTutorLesson`   | 一堂課多位導師           |
| `SchoolInvoice`   | `SchoolLesson`        | 一張發票可直接關聯多堂課 |

### 多對多關聯

| 實體 A          | 實體 B         | 中間表                | 說明             |
| --------------- | -------------- | --------------------- | ---------------- |
| `SchoolInvoice` | `SchoolCourse` | `SchoolInvoiceCourse` | 發票與課程多對多 |

### 一對一關聯

| 實體 A          | 實體 B          | 說明                 |
| --------------- | --------------- | -------------------- |
| `SchoolInvoice` | `SchoolReceipt` | 一張發票對應一張收據 |

### 外部關聯

| 本模組實體                 | 外部實體 | 說明       |
| -------------------------- | -------- | ---------- |
| `SchoolQuotation.sentBy`   | `User`   | 報價發送人 |
| `SchoolTutorLesson.userId` | `User`   | 任教導師   |

---

## 業務流程對應

### 階段 1：查詢接洽

**資料操作：**

```
School (INSERT) → 新增學校
SchoolContact (INSERT) → 新增聯絡人
SchoolQuotation (INSERT, status=DRAFT) → 建立報價草稿
```

### 階段 2：報價提案

**資料操作：**

```
SchoolQuotationItem (INSERT) → 新增報價項目
SchoolQuotation (UPDATE, status=SENT) → 發送報價
School (UPDATE, partnershipStatus=QUOTATION_SENT) → 更新合作狀態
```

### 階段 3：確認合作

**情境 A - 接受報價：**

```
SchoolQuotation (UPDATE, status=ACCEPTED) → 標記接受
School (UPDATE, partnershipStatus=CONFIRMED) → 確認合作
```

**情境 B - 無報價直接確認：**

```
School (UPDATE, partnershipStatus=CONFIRMED) → 確認合作
SchoolCourse (INSERT) → 直接建立課程
```

### 階段 4：建立課程

**資料操作：**

```
SchoolCourse (INSERT) → 建立課程
School (UPDATE, partnershipStatus=ACTIVE) → 標記合作中
```

### 階段 5：執行課堂

**5A 排定課堂：**

```
SchoolLesson (INSERT, 批次) → 批次生成課堂
```

**5B 分配導師：**

```
SchoolTutorLesson (INSERT) → 建立導師任教記錄
```

**5C 導師簽到：**

```
SchoolTutorLesson (UPDATE) → 更新出勤狀態、簽到時間
SchoolLesson (UPDATE, lessonStatus=COMPLETED) → 標記課堂完成
```

### 階段 6：開立發票

**資料操作：**

```
SchoolInvoice (INSERT) → 建立發票
SchoolInvoiceCourse (INSERT) → 關聯課程
SchoolLesson (UPDATE, invoiceStatus=INVOICED) → 標記已開票
```

### 階段 7：收款記錄

**資料操作：**

```
SchoolReceipt (INSERT) → 建立收據
SchoolInvoice (UPDATE, status=PAID) → 標記已付款
SchoolLesson (UPDATE, paymentStatus=PAID) → 標記已收款
```

---

## 資料完整性規則

### 級聯刪除 (onDelete: Cascade)

以下關聯設定為級聯刪除，刪除父記錄時自動刪除子記錄：

| 父實體            | 子實體                                                                               |
| ----------------- | ------------------------------------------------------------------------------------ |
| `School`          | `SchoolContact`, `SchoolQuotation`, `SchoolCourse`, `SchoolInvoice`, `SchoolReceipt` |
| `SchoolQuotation` | `SchoolQuotationItem`                                                                |
| `SchoolCourse`    | `SchoolLesson`                                                                       |
| `SchoolLesson`    | `SchoolTutorLesson`                                                                  |
| `SchoolInvoice`   | `SchoolInvoiceCourse`                                                                |

### 軟刪除

以下實體支援軟刪除（`deletedAt` 欄位）：

- `School`
- `SchoolContact`
- `SchoolQuotation`
- `SchoolCourse`
- `SchoolLesson`
- `SchoolInvoice`
- `SchoolReceipt`
- `SchoolTutorLesson`

### 唯一約束

| 實體                  | 約束                    | 說明                   |
| --------------------- | ----------------------- | ---------------------- |
| `School`              | `schoolCode`            | 學校編號唯一           |
| `SchoolContact`       | `[schoolId, email]`     | 同校不可重複電郵       |
| `SchoolQuotation`     | `quotationNumber`       | 報價編號唯一           |
| `SchoolInvoice`       | `invoiceNumber`         | 發票編號唯一           |
| `SchoolInvoice`       | `invoiceToken`          | 發票 Token 唯一        |
| `SchoolReceipt`       | `receiptNumber`         | 收據編號唯一           |
| `SchoolReceipt`       | `invoiceId`             | 一張發票只能有一張收據 |
| `SchoolInvoiceCourse` | `[invoiceId, courseId]` | 同發票不可重複課程     |
| `SchoolTutorLesson`   | `[lessonId, userId]`    | 同課堂不可重複導師     |

---

## 索引策略

### 查詢優化索引

| 實體                | 索引欄位                                                                            | 用途           |
| ------------------- | ----------------------------------------------------------------------------------- | -------------- |
| `School`            | `partnershipStatus`                                                                 | 按合作狀態篩選 |
| `School`            | `schoolName`                                                                        | 學校名稱搜尋   |
| `SchoolContact`     | `schoolId`                                                                          | 查詢學校聯絡人 |
| `SchoolContact`     | `isPrimary`                                                                         | 查詢主要聯絡人 |
| `SchoolQuotation`   | `schoolId`, `status`, `quotationNumber`                                             | 報價查詢       |
| `SchoolCourse`      | `schoolId`, `academicYear`, `courseType`, `status`                                  | 課程查詢       |
| `SchoolLesson`      | `courseId`, `lessonDate`, `lessonStatus`, `invoiceStatus`, `invoiceId`              | 課堂查詢       |
| `SchoolInvoice`     | `schoolId`, `status`, `invoiceNumber`, `invoiceDate`                                | 發票查詢       |
| `SchoolReceipt`     | `schoolId`, `invoiceId`, `paymentStatus`, `receiptNumber`                           | 收據查詢       |
| `SchoolTutorLesson` | `lessonId`, `userId`, `courseId`, `attendanceStatus`, `paymentStatus`, `lessonDate` | 導師排班查詢   |

---

## 編號生成規則

| 類型     | 格式                         | 範例              |
| -------- | ---------------------------- | ----------------- |
| 報價編號 | `Q{年份}-{流水號}`           | `Q2026-001`       |
| 發票編號 | `INV-{年份}-{月份}-{流水號}` | `INV-2026-01-001` |
| 收據編號 | `REC-{年份}-{月份}-{流水號}` | `REC-2026-01-001` |

---

## 常用查詢模式

### 取得學校完整資料

```typescript
const school = await prisma.school.findUnique({
  where: { id: schoolId },
  include: {
    contacts: { where: { deletedAt: null } },
    courses: {
      where: { deletedAt: null },
      include: {
        lessons: { where: { deletedAt: null } },
      },
    },
    invoices: { where: { deletedAt: null } },
  },
});
```

### 查詢導師某日課堂

```typescript
const tutorLessons = await prisma.schoolTutorLesson.findMany({
  where: {
    userId: tutorId,
    lessonDate: targetDate,
    deletedAt: null,
  },
  include: {
    lesson: {
      include: {
        course: {
          include: { school: true },
        },
      },
    },
  },
  orderBy: { startTime: "asc" },
});
```

### 檢查導師時間衝突

```typescript
const conflicts = await prisma.schoolTutorLesson.findMany({
  where: {
    userId: tutorId,
    lessonDate: targetDate,
    deletedAt: null,
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
```

### 取得可開票課堂

```typescript
const invoiceableLessons = await prisma.schoolLesson.findMany({
  where: {
    courseId,
    lessonStatus: "COMPLETED",
    invoiceStatus: "NOT_INVOICED",
    deletedAt: null,
  },
  orderBy: { lessonDate: "asc" },
});
```

---

## 版本記錄

| 版本 | 日期       | 說明     |
| ---- | ---------- | -------- |
| 1.0  | 2026-02-01 | 初版建立 |
