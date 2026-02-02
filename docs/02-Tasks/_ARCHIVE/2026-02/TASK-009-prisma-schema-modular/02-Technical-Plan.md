# 技術計劃

## 階段一：準備工作

1. 建立 feature branch：`refactor/prisma-schema-modular`
2. 備份現有 schema
3. 建立新資料夾結構

## 階段二：拆分 School 模組

### 2.1 提取 Enums → `school/_enums.prisma`
- PartnershipStatus
- QuotationStatus
- ChargingModel
- LessonType
- LessonStatus
- InvoiceStatus
- PaymentStatus
- PaymentMethod
- TutorRole
- AttendanceStatus
- SalaryCalculationMode
- CourseTerm
- CourseStatus
- InvoicingPeriodStatus (如有)
- FeeItemDirection (如有)

### 2.2 拆分 Models

| 原位置 | 目標 |
|--------|------|
| School, SchoolContact | `school/school.prisma` |
| SchoolQuotation | `school/quotation/quotation.prisma` |
| SchoolQuotationItem | `school/quotation/quotation-item.prisma` |
| SchoolCourse | `school/course/course.prisma` |
| SchoolLesson | `school/lesson/lesson.prisma` |
| SchoolTutorLesson | `school/lesson/tutor-lesson.prisma` |
| SchoolInvoice | `school/invoice/invoice.prisma` |
| SchoolInvoiceCourse | `school/invoice/invoice-course.prisma` |
| SchoolReceipt | `school/invoice/receipt.prisma` |

## 階段三：驗證與測試

```bash
npx prisma format
npx prisma validate
npx prisma generate
npx prisma migrate status  # 應顯示無需新 migration
```

## 階段四：更新文件

- 更新 README.md
- 建立 `docs/03-Knowledge-Base/Prisma-Schema-Guide.md`

## 階段五：Commit & PR

分批 commit，每個模組獨立 commit。
