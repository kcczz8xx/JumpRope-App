# Prisma Schema 模組化結構

## 概述

專案採用模組化 Schema 設計，將原本 4 個大檔案拆分成 21 個獨立檔案，提升可維護性。

## 目錄結構

```
prisma/
├── schema.prisma                     # 主配置（generator + datasource）
├── migrations/                       # 資料庫遷移檔案
└── schema/
    ├── auth/                         # 認證模組
    │   ├── _enums.prisma             # OtpPurpose
    │   ├── otp.prisma                # Otp
    │   └── password-reset.prisma     # PasswordResetToken
    │
    ├── user/                         # 用戶模組
    │   ├── _enums.prisma             # Gender, UserRole
    │   ├── user.prisma               # User
    │   ├── address.prisma            # UserAddress
    │   ├── bank-account.prisma       # UserBankAccount
    │   └── child.prisma              # UserChild
    │
    ├── tutor/                        # 導師模組
    │   ├── _enums.prisma             # DocumentStatus, DocumentType
    │   ├── profile.prisma            # TutorProfile
    │   └── document.prisma           # TutorDocument
    │
    └── school/                       # 到校服務模組
        ├── _enums.prisma             # 14 個 Enums
        ├── school.prisma             # School + SchoolContact
        ├── quotation/
        │   ├── quotation.prisma      # SchoolQuotation
        │   └── quotation-item.prisma # SchoolQuotationItem
        ├── course/
        │   └── course.prisma         # SchoolCourse
        ├── lesson/
        │   ├── lesson.prisma         # SchoolLesson
        │   └── tutor-lesson.prisma   # SchoolTutorLesson
        └── invoice/
            ├── invoice.prisma        # SchoolInvoice
            ├── invoice-course.prisma # SchoolInvoiceCourse
            └── receipt.prisma        # SchoolReceipt
```

## Models 對照表

### Auth 模組

| Model              | 檔案位置                     |
| ------------------ | ---------------------------- |
| Otp                | `auth/otp.prisma`            |
| PasswordResetToken | `auth/password-reset.prisma` |

### User 模組

| Model           | 檔案位置                   |
| --------------- | -------------------------- |
| User            | `user/user.prisma`         |
| UserAddress     | `user/address.prisma`      |
| UserBankAccount | `user/bank-account.prisma` |
| UserChild       | `user/child.prisma`        |

### Tutor 模組

| Model         | 檔案位置                |
| ------------- | ----------------------- |
| TutorProfile  | `tutor/profile.prisma`  |
| TutorDocument | `tutor/document.prisma` |

### School 模組

| Model               | 檔案位置                                 |
| ------------------- | ---------------------------------------- |
| School              | `school/school.prisma`                   |
| SchoolContact       | `school/school.prisma`                   |
| SchoolQuotation     | `school/quotation/quotation.prisma`      |
| SchoolQuotationItem | `school/quotation/quotation-item.prisma` |
| SchoolCourse        | `school/course/course.prisma`            |
| SchoolLesson        | `school/lesson/lesson.prisma`            |
| SchoolTutorLesson   | `school/lesson/tutor-lesson.prisma`      |
| SchoolInvoice       | `school/invoice/invoice.prisma`          |
| SchoolInvoiceCourse | `school/invoice/invoice-course.prisma`   |
| SchoolReceipt       | `school/invoice/receipt.prisma`          |

## Enums 清單

### Auth 模組 (`auth/_enums.prisma`)

| Enum       | 用途     |
| ---------- | -------- |
| OtpPurpose | OTP 用途 |

### User 模組 (`user/_enums.prisma`)

| Enum     | 用途     |
| -------- | -------- |
| Gender   | 性別     |
| UserRole | 用戶角色 |

### Tutor 模組 (`tutor/_enums.prisma`)

| Enum           | 用途     |
| -------------- | -------- |
| DocumentStatus | 文件狀態 |
| DocumentType   | 文件類型 |

### School 模組 (`school/_enums.prisma`)

| Enum                  | 用途         |
| --------------------- | ------------ |
| PartnershipStatus     | 合作狀態     |
| QuotationStatus       | 報價狀態     |
| ChargingModel         | 收費模式     |
| LessonType            | 課堂類型     |
| LessonStatus          | 課堂狀態     |
| InvoiceStatus         | 發票狀態     |
| PaymentStatus         | 付款狀態     |
| PaymentMethod         | 付款方式     |
| TutorRole             | 導師角色     |
| AttendanceStatus      | 出勤狀態     |
| SalaryCalculationMode | 薪資計算模式 |
| CourseTerm            | 課程學期     |
| CourseStatus          | 課程狀態     |

## 常用指令

```bash
# 格式化所有 schema 檔案
npx prisma format

# 驗證 schema 語法
npx prisma validate

# 重新生成 Prisma Client
npx prisma generate

# 檢查 migration 狀態
npx prisma migrate status

# 建立新 migration
npx prisma migrate dev --name <name>
```

## 修改 Schema 流程

1. 編輯對應的 `.prisma` 檔案
2. 執行 `npx prisma format` 格式化
3. 執行 `npx prisma validate` 驗證語法
4. 如需資料庫變更：`npx prisma migrate dev --name <name>`
5. 執行 `npx prisma generate` 更新 Client

## 新增 Model 指南

- 放在對應業務模組資料夾
- 如需新 Enum，優先放在 `_enums.prisma`
- Model 名稱使用 **PascalCase**
- Table 名稱使用 **snake_case**（透過 `@@map()`）
- 記得在相關 Model 中宣告雙向關聯

## 注意事項

- ⚠️ 避免跨資料夾重複定義 Enum
- ⚠️ 關聯欄位必須在兩端都宣告
- ⚠️ 新增索引需考慮查詢效能
- ⚠️ 使用 `@db.Text` 處理長文字欄位
