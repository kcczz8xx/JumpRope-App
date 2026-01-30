# 📚 香港跳繩學院到校服務系統 - 開發文檔

> **版本**: MVP v1.0  
> **最後更新**: 2026-01-30  
> **總頁數**: 14 頁

---

## 📁 文檔目錄

| 文檔                                   | 說明                       |
| -------------------------------------- | -------------------------- |
| [COMPONENTS.md](./COMPONENTS.md)       | TailAdmin 組件對應表       |
| [DATA_MODELS.md](./DATA_MODELS.md)     | 資料庫模型與 Prisma Schema |
| [BUSINESS_FLOW.md](./BUSINESS_FLOW.md) | 完整業務流程（7 階段）     |
| [PERMISSIONS.md](./PERMISSIONS.md)     | 角色權限矩陣               |

### 頁面開發文檔

| 頁面          | 文檔                                                         | 優先級 |
| ------------- | ------------------------------------------------------------ | ------ |
| 管理儀表板    | [pages/OVERVIEW.md](./pages/OVERVIEW.md)                     | P0     |
| 我的課堂      | [pages/MY_LESSONS.md](./pages/MY_LESSONS.md)                 | P0     |
| 財務儀表板    | [pages/FINANCE.md](./pages/FINANCE.md)                       | P1     |
| 報價列表      | [pages/QUOTATIONS.md](./pages/QUOTATIONS.md)                 | P0     |
| 新增報價      | [pages/QUOTATIONS_NEW.md](./pages/QUOTATIONS_NEW.md)         | P0     |
| 報價詳情      | [pages/QUOTATIONS_DETAIL.md](./pages/QUOTATIONS_DETAIL.md)   | P1     |
| 轉換為課程    | [pages/QUOTATIONS_CONVERT.md](./pages/QUOTATIONS_CONVERT.md) | P0     |
| 課程列表      | [pages/COURSES.md](./pages/COURSES.md)                       | P0     |
| 課程詳情+排課 | [pages/COURSES_DETAIL.md](./pages/COURSES_DETAIL.md)         | P0     |
| 新增課程      | [pages/COURSES_NEW.md](./pages/COURSES_NEW.md)               | P1     |
| 導師排班      | [pages/SCHEDULE.md](./pages/SCHEDULE.md)                     | P1     |
| 發票列表      | [pages/INVOICES.md](./pages/INVOICES.md)                     | P0     |
| 生成發票      | [pages/INVOICES_GENERATE.md](./pages/INVOICES_GENERATE.md)   | P0     |
| 發票詳情      | [pages/INVOICES_DETAIL.md](./pages/INVOICES_DETAIL.md)       | P1     |
| 記錄收款      | [pages/INVOICES_PAYMENT.md](./pages/INVOICES_PAYMENT.md)     | P1     |

---

## 🎯 業務流程總覽

### 標準流程（有報價）

```
階段 1：查詢接洽    →  quotations/new
    ↓
階段 2：報價提案    →  quotations/[id]
    ↓
階段 3：確認合作    →  quotations/[id]
    ↓
階段 4：建立課程    →  quotations/[id]/convert
    ↓
階段 5：執行課堂    →  courses/[id] + my-lessons
    ↓
階段 6：開立發票    →  invoices/generate
    ↓
階段 7：收款記錄    →  invoices/[id]/payment
```

### 快速流程（無報價）⭐ 新增

```
口頭確認合作
    ↓
直接建立課程    →  courses/new
    ↓
執行課堂        →  courses/[id] + my-lessons
    ↓
開立發票        →  invoices/generate
    ↓
收款記錄        →  invoices/[id]/payment
```

**說明：** 階段 1-3 為可選流程，可直接從「新增課程」開始

---

## 📁 URL 架構

```
app/(private)/dashboard/school/
├── overview/page.tsx              # 📊 管理儀表板
├── my-lessons/page.tsx            # 👨‍🏫 我的課堂
├── finance/page.tsx               # 💰 財務儀表板
├── quotations/
│   ├── page.tsx                   # 📋 報價列表
│   ├── new/page.tsx               # ➕ 新增報價
│   └── [id]/
│       ├── page.tsx               # 📄 報價詳情
│       └── convert/page.tsx       # 🔄 轉換為課程
├── courses/
│   ├── page.tsx                   # 📚 課程列表
│   ├── new/page.tsx               # ➕ 新增課程
│   └── [id]/page.tsx              # 📝 課程詳情 + 排課
├── schedule/page.tsx              # 🗓️ 導師排班
└── invoices/
    ├── page.tsx                   # 💳 發票列表
    ├── generate/page.tsx          # 📝 生成發票
    └── [id]/
        ├── page.tsx               # 📄 發票詳情
        └── payment/page.tsx       # 💵 記錄收款
```

---

## 🔐 角色說明

| 角色       | 代碼           | 主要入口             | 說明                   |
| ---------- | -------------- | -------------------- | ---------------------- |
| 管理員     | `ADMIN`        | `/school/overview`   | 全系統權限             |
| 學校負責人 | `SCHOOL_ADMIN` | `/school/overview`   | 唯讀自己學校           |
| 導師       | `TUTOR`        | `/school/my-lessons` | 簽到/簽退/查看任教課程 |
| 財務       | `FINANCE`      | `/school/finance`    | 發票/收款管理          |

---

## 🚀 開發順序建議

### Phase 1 - 核心流程 (Week 1-2)

1. 資料模型建立 (Prisma Schema)
2. `quotations/new` - 新增報價
3. `quotations/page` - 報價列表
4. `quotations/[id]/convert` - 轉換為課程

### Phase 2 - 課程管理 (Week 3-4)

5. `courses/page` - 課程列表
6. `courses/[id]` - 課程詳情 + 批次排課
7. `my-lessons` - 導師課堂視圖

### Phase 3 - 財務模組 (Week 5-6)

8. `invoices/generate` - 生成發票
9. `invoices/page` - 發票列表
10. `invoices/[id]/payment` - 記錄收款

### Phase 4 - 儀表板 (Week 7)

11. `overview` - 管理儀表板
12. `finance` - 財務儀表板
13. `schedule` - 導師排班

---

## 📦 共用組件清單

詳見 [COMPONENTS.md](./COMPONENTS.md)

### 核心 UI 組件

- `Modal` - 彈窗
- `Badge` - 狀態標籤
- `Button` - 按鈕
- `Table` - 表格
- `Card` - 卡片
- `Form` - 表單元素

### 業務組件（需開發）

- `SchoolSelector` - 學校選擇器
- `CourseCard` - 課程卡片
- `LessonCard` - 課堂卡片
- `StatusBadge` - 狀態標籤
- `DateRangePicker` - 日期範圍選擇
- `TutorSelector` - 導師選擇器

---

## 📊 資料流概覽

```
School（學校）
  │
  ├─→ SchoolContact（聯絡人）
  │
  ├─→ SchoolQuotation（報價）
  │         │
  │         ├─→ SchoolQuotationItem（報價項目）
  │         │
  │         └──[轉換]──→ SchoolCourse（課程）
  │                              │
  │                              ├─→ SchoolLesson（課堂）
  │                              │       │
  │                              │       └─→ SchoolTutorLesson（導師任教）
  │                              │
  │                              └─→ SchoolInvoiceCourse（發票-課程關聯）
  │
  └─→ SchoolInvoice（發票）
          │
          └─→ SchoolReceipt（收據）
```

---

## ⚠️ 開發注意事項

1. **所有資料採用 Soft Delete** - 使用 `deletedAt` 欄位
2. **狀態機設計** - 報價/課程/發票都有狀態流轉
3. **權限檢查** - 每頁都需要 `PermissionAwareComponent` 包裝
4. **響應式設計** - 導師頁面優先手機視圖
5. **即時計算** - 金額/統計資料即時更新
