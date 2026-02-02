# TASK-007: Prisma Schema 模組化拆分

## 目標

將 `prisma/schema/school.prisma` (607 行) 拆分成模組化結構。

## 目標結構

```
prisma/schema/
├── _shared/
│   └── enums.prisma         # 跨模組共用 enums（如有）
├── auth/
│   └── (現有檔案保持不變)
├── user/
│   └── (現有檔案保持不變)
├── tutor/
│   └── (現有檔案保持不變)
└── school/
    ├── _enums.prisma        # School 模組專用 enums (14 個)
    ├── school.prisma        # School, SchoolContact
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

## 現有 Models 清單

| Model | 目標檔案 |
|-------|----------|
| 14 個 Enums | `school/_enums.prisma` |
| School | `school/school.prisma` |
| SchoolContact | `school/school.prisma` |
| SchoolQuotation | `school/quotation/quotation.prisma` |
| SchoolQuotationItem | `school/quotation/quotation-item.prisma` |
| SchoolCourse | `school/course/course.prisma` |
| SchoolLesson | `school/lesson/lesson.prisma` |
| SchoolTutorLesson | `school/lesson/tutor-lesson.prisma` |
| SchoolInvoice | `school/invoice/invoice.prisma` |
| SchoolInvoiceCourse | `school/invoice/invoice-course.prisma` |
| SchoolReceipt | `school/invoice/receipt.prisma` |

## 驗收標準

- [ ] `npx prisma format` 通過
- [ ] `npx prisma validate` 通過
- [ ] `npx prisma generate` 成功
- [ ] 無需新 migration（僅重組織檔案）
- [ ] 開發環境正常運行
