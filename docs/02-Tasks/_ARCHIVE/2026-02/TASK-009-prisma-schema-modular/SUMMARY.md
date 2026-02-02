# TASK-007 完成總結：Prisma Schema 模組化拆分

## 任務概述

將 4 個大型 Prisma schema 檔案拆分成 21 個模組化檔案。

## 完成狀態：✅ 成功

| 驗證項目              | 結果             |
| --------------------- | ---------------- |
| `npx prisma format`   | ✅ 通過          |
| `npx prisma validate` | ✅ Schema 有效   |
| `npx prisma generate` | ✅ Client 已生成 |

## 變更清單

### 新建檔案（21 個）

```
prisma/schema/
├── auth/                      # 認證模組（3 個檔案）
│   ├── _enums.prisma          # OtpPurpose
│   ├── otp.prisma             # Otp
│   └── password-reset.prisma  # PasswordResetToken
│
├── user/                      # 用戶模組（5 個檔案）
│   ├── _enums.prisma          # Gender, UserRole
│   ├── user.prisma            # User
│   ├── address.prisma         # UserAddress
│   ├── bank-account.prisma    # UserBankAccount
│   └── child.prisma           # UserChild
│
├── tutor/                     # 導師模組（3 個檔案）
│   ├── _enums.prisma          # DocumentStatus, DocumentType
│   ├── profile.prisma         # TutorProfile
│   └── document.prisma        # TutorDocument
│
└── school/                    # 到校服務模組（10 個檔案）
    ├── _enums.prisma          # 14 個 Enums
    ├── school.prisma          # School + SchoolContact
    ├── quotation/
    │   ├── quotation.prisma
    │   └── quotation-item.prisma
    ├── course/
    │   └── course.prisma
    ├── lesson/
    │   ├── lesson.prisma
    │   └── tutor-lesson.prisma
    └── invoice/
        ├── invoice.prisma
        ├── invoice-course.prisma
        └── receipt.prisma
```

### 刪除檔案（4 個）

- `prisma/schema/auth.prisma`（48 行）
- `prisma/schema/user.prisma`（129 行）
- `prisma/schema/tutor.prisma`（101 行）
- `prisma/schema/school.prisma`（607 行）

### 新增/更新文件

- `docs/03-Knowledge-Base/Prisma-Schema-Structure.md`

## 無破壞性變更

- ✅ 無資料庫 Schema 變更（不需要新 migration）
- ✅ 無 API 介面變更
- ✅ 僅重新組織檔案結構

## Models 對照表

| Model               | 新位置                                   |
| ------------------- | ---------------------------------------- |
| 14 個 Enums         | `school/_enums.prisma`                   |
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

## Git Commit 建議

```bash
# 單一 commit（簡單）
git add prisma/schema/
git commit -m "refactor(prisma): modularize school schema into 10 files"

# 或分批 commit（詳細）
git add prisma/schema/school/_enums.prisma
git commit -m "refactor(prisma): extract school module enums"

git add prisma/schema/school/school.prisma
git commit -m "refactor(prisma): split school basic models"

git add prisma/schema/school/quotation/
git commit -m "refactor(prisma): split quotation module"

git add prisma/schema/school/course/
git commit -m "refactor(prisma): split course module"

git add prisma/schema/school/lesson/
git commit -m "refactor(prisma): split lesson module"

git add prisma/schema/school/invoice/
git commit -m "refactor(prisma): split invoice module"

# 最後提交文件
git add docs/
git commit -m "docs: add prisma schema structure documentation"
```

## 後續建議

1. **考慮拆分其他模組**：`user.prisma`（3.4KB）、`tutor.prisma`（3KB）
2. **建立 CI 檢查**：在 PR 中自動執行 `prisma validate`
3. **更新團隊文件**：通知團隊成員新的 Schema 結構
