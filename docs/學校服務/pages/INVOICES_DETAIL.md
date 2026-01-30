# 📄 發票詳情 - Invoices Detail

> **路徑**: `/dashboard/school/invoices/[id]`  
> **優先級**: P1  
> **角色**: ADMIN (編輯), FINANCE (編輯), SCHOOL_ADMIN (唯讀)

---

## 📋 頁面概述

顯示發票的完整資料，包含學校資訊、發票項目、收款狀態。支援編輯、發送、記錄收款、下載 PDF 等操作。

---

## 🎨 頁面結構

```
┌─────────────────────────────────────────────────────────────┐
│ 💳 發票詳情                                   [編輯] [刪除] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 發票編號：INV-2024-09-001                            │   │
│  │ 狀態：🔵 已發送                                      │   │
│  │ 發票日期：2024-09-30                                 │   │
│  │ 付款期限：30 天                                      │   │
│  │ 到期日：2024-10-30                                   │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 📍 學校資料                                          │   │
│  │ ──────────────────────────────────────────────────  │   │
│  │ 學校名稱：聖保羅小學                                 │   │
│  │ 地址：香港中環堅道33號                               │   │
│  │ 電話：2523-1234                                      │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 📬 收件人資料                                        │   │
│  │ ──────────────────────────────────────────────────  │   │
│  │ 收件人：王老師（體育科主任）                         │   │
│  │ 電郵：wang@stpaul.edu.hk                            │   │
│  │ 郵寄地址：香港中環堅道33號                           │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 💰 發票項目                                          │   │
│  │ ──────────────────────────────────────────────────  │   │
│  │ ┌────────────────────────────────────────────────┐  │   │
│  │ │ 課程：跳繩恆常班（上學期）                     │  │   │
│  │ │ 期間：2024年9月                                │  │   │
│  │ │ 課堂數：4 堂                                   │  │   │
│  │ │ 明細：                                         │  │   │
│  │ │ • 09/09 14:00 - 20 人 - HK$ 1,000            │  │   │
│  │ │ • 09/16 14:00 - 20 人 - HK$ 1,000            │  │   │
│  │ │ • 09/23 14:00 - 18 人 - HK$ 900              │  │   │
│  │ │ • 09/30 14:00 - 20 人 - HK$ 1,000            │  │   │
│  │ │                                                │  │   │
│  │ │ 小計：HK$ 3,900                               │  │   │
│  │ └────────────────────────────────────────────────┘  │   │
│  │                                                      │   │
│  │ ──────────────────────────────────────────────────  │   │
│  │ 發票金額：HK$ 3,900                                 │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 💵 收款資料                                          │   │
│  │ ──────────────────────────────────────────────────  │   │
│  │ 狀態：待收款                                         │   │
│  │                                                      │   │
│  │ [ 📝 記錄收款 ]                                     │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 📜 操作歷史                                          │   │
│  │ ──────────────────────────────────────────────────  │   │
│  │ 📤 2024-10-01 10:00  發票已發送                      │   │
│  │    發送方式：電郵                                    │   │
│  │    收件人：wang@stpaul.edu.hk                       │   │
│  │                                                      │   │
│  │ 📝 2024-09-30 16:00  發票已建立                      │   │
│  │    建立者：Admin User                                │   │
│  │    課堂數：4 堂                                      │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 🎯 操作                                              │   │
│  │                                                      │   │
│  │ [ 📄 下載 PDF ] [ 📧 重新發送 ] [ 💬 發送催款 ]     │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧩 使用組件

### TailAdmin 組件

| 組件      | 路徑                            | 用途     |
| --------- | ------------------------------- | -------- |
| `Badge`   | `components/ui/badge/Badge.tsx` | 狀態標籤 |
| `Button`  | `components/ui/button/`         | 操作按鈕 |
| `Modal`   | `components/ui/modal/`          | 收款彈窗 |
| `Tooltip` | `components/ui/tooltip/`        | 提示訊息 |

### 需開發組件

| 組件                 | 說明         |
| -------------------- | ------------ |
| `InvoiceStatusBadge` | 發票狀態標籤 |
| `InvoiceInfoCard`    | 發票資訊卡片 |
| `InvoiceItemCard`    | 發票項目卡片 |
| `PaymentRecordCard`  | 收款記錄卡片 |

---

## 📊 資料結構

### 發票詳情資料

```typescript
interface InvoiceDetail {
  id: string;
  invoiceNumber: string;
  status: InvoiceStatus;

  // 日期
  invoiceDate: Date;
  paymentTermsDays: number;
  dueDate: Date;

  // 金額
  invoiceAmount: number;
  paidAmount: number | null;

  // 收件人資料
  recipientNameChinese: string;
  recipientNameEnglish: string | null;
  contactPosition: string | null;
  contactEmail: string | null;
  mailingAddress: string | null;

  // 學校資料
  school: {
    id: string;
    schoolName: string;
    schoolNameEnglish: string | null;
    address: string | null;
    phone: string | null;
    email: string | null;
  };

  // 發票項目（按課程分組）
  courses: Array<{
    id: string;
    course: {
      id: string;
      courseName: string;
      chargingModel: ChargingModel;
    };
    amount: number;

    // 課堂明細
    lessons: Array<{
      id: string;
      lessonDate: Date;
      startTime: string;
      studentCount: number;
      feeLesson: number;
    }>;
  }>;

  // 收款記錄
  receipts: Array<{
    id: string;
    receiptNumber: string;
    paymentConfirmedDate: Date;
    actualReceivedAmount: number;
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    paymentTransactionNumber: string | null;
  }>;

  // 系統欄位
  createdAt: Date;
  updatedAt: Date;
  createdBy: {
    id: string;
    name: string;
  };
}
```

### API 查詢

```typescript
// API: GET /api/invoices/[id]
async function getInvoiceDetail(id: string, session: Session) {
  // 權限檢查
  const canView = await checkPermission(session, "invoice:read");
  if (!canView) throw new Error("Unauthorized");

  const invoice = await prisma.schoolInvoice.findUnique({
    where: { id },
    include: {
      school: {
        select: {
          id: true,
          schoolName: true,
          schoolNameEnglish: true,
          address: true,
          phone: true,
          email: true,
        },
      },
      courses: {
        include: {
          course: {
            select: {
              id: true,
              courseName: true,
              chargingModel: true,
            },
          },
          // 需要額外查詢關聯的課堂
        },
      },
      receipts: {
        where: { deletedAt: null },
        orderBy: { paymentConfirmedDate: "desc" },
      },
      createdByUser: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!invoice) throw new Error("Invoice not found");

  // SCHOOL_ADMIN 只能查看自己學校
  if (session.user.role === "SCHOOL_ADMIN") {
    if (invoice.school.id !== session.user.schoolId) {
      throw new Error("Forbidden");
    }
  }

  // 查詢每個課程的課堂明細
  for (const invoiceCourse of invoice.courses) {
    const lessons = await prisma.schoolLesson.findMany({
      where: {
        courseId: invoiceCourse.courseId,
        invoiceStatus: "INVOICED",
        // 需要關聯到此發票（透過課堂的 invoice 關係）
      },
      select: {
        id: true,
        lessonDate: true,
        startTime: true,
        studentCount: true,
        feeLesson: true,
      },
      orderBy: { lessonDate: "asc" },
    });

    invoiceCourse.lessons = lessons;
  }

  return invoice;
}
```

---

## 🔄 狀態變更邏輯

### 狀態流轉

```
DRAFT（草稿）
    ↓ [發送發票]
SENT（已發送）
    ↓
    ├─ [記錄收款] → PAID（已付款）
    ├─ [部分收款] → PARTIAL（部分付款）
    └─ [過期未付] → OVERDUE（已逾期）
```

### 1. 發送發票

```typescript
// API: POST /api/invoices/[id]/send
async function sendInvoice(
  id: string,
  data: {
    method: "email" | "download";
    recipients?: string[];
  }
) {
  const invoice = await prisma.schoolInvoice.update({
    where: { id },
    data: {
      status: "SENT",
      sentDate: new Date(),
    },
  });

  // 發送電郵
  if (data.method === "email") {
    await sendInvoiceEmail(invoice, data.recipients);
  }

  // 生成 PDF
  const pdfUrl = await generateInvoicePDF(invoice);

  return { invoice, pdfUrl };
}
```

### 2. 記錄收款

跳轉到 `/invoices/[id]/payment` 頁面

### 3. 自動逾期檢查

```typescript
async function checkOverdueInvoices() {
  const now = new Date();

  const overdueInvoices = await prisma.schoolInvoice.updateMany({
    where: {
      status: "SENT",
      dueDate: {
        lt: now,
      },
    },
    data: {
      status: "OVERDUE",
    },
  });

  return overdueInvoices.count;
}

// 定時任務：每天執行一次
```

---

## 📝 編輯功能

### 可編輯欄位（僅草稿狀態）

```typescript
interface EditableInvoice {
  invoiceDate: Date;
  paymentTermsDays: number;

  // 收件人資料
  recipientNameChinese: string;
  recipientNameEnglish?: string;
  contactPosition?: string;
  contactEmail?: string;
  mailingAddress?: string;

  // 備註
  notes?: string;

  // 課程項目（僅能調整金額，不能改課堂）
  courses: Array<{
    courseId: string;
    amount: number;
  }>;
}
```

### API 更新

```typescript
// API: PUT /api/invoices/[id]
async function updateInvoice(id: string, data: EditableInvoice) {
  // 只能編輯草稿
  const existing = await prisma.schoolInvoice.findUnique({
    where: { id },
  });

  if (existing.status !== "DRAFT") {
    throw new Error("只能編輯草稿狀態的發票");
  }

  // 更新發票
  const invoice = await prisma.schoolInvoice.update({
    where: { id },
    data: {
      invoiceDate: data.invoiceDate,
      paymentTermsDays: data.paymentTermsDays,
      dueDate: addDays(data.invoiceDate, data.paymentTermsDays),
      recipientNameChinese: data.recipientNameChinese,
      recipientNameEnglish: data.recipientNameEnglish,
      contactPosition: data.contactPosition,
      contactEmail: data.contactEmail,
      mailingAddress: data.mailingAddress,
      notes: data.notes,
    },
  });

  // 更新課程金額
  for (const course of data.courses) {
    await prisma.schoolInvoiceCourse.update({
      where: {
        invoiceId_courseId: {
          invoiceId: id,
          courseId: course.courseId,
        },
      },
      data: {
        amount: course.amount,
      },
    });
  }

  // 重新計算總金額
  const totalAmount = data.courses.reduce((sum, c) => sum + c.amount, 0);
  await prisma.schoolInvoice.update({
    where: { id },
    data: { invoiceAmount: totalAmount },
  });

  return invoice;
}
```

---

## 📧 催款功能

### 催款邏輯

```typescript
// API: POST /api/invoices/[id]/remind
async function sendPaymentReminder(id: string) {
  const invoice = await prisma.schoolInvoice.findUnique({
    where: { id },
    include: {
      school: true,
      receipts: true,
    },
  });

  if (!invoice) throw new Error("Invoice not found");
  if (invoice.status === "PAID") {
    throw new Error("發票已付款，無需催款");
  }

  // 記錄催款次數
  const reminderCount = await prisma.invoiceReminder.count({
    where: { invoiceId: id },
  });

  // 建立催款記錄
  await prisma.invoiceReminder.create({
    data: {
      invoiceId: id,
      reminderDate: new Date(),
      reminderMethod: "email",
      reminderCount: reminderCount + 1,
    },
  });

  // 發送催款電郵
  await sendReminderEmail(invoice);

  return { success: true, reminderCount: reminderCount + 1 };
}
```

### 催款電郵模板

```html
主旨：【付款提醒】發票 INV-2024-09-001 尊敬的王老師： 您好！
這是一封友善的付款提醒。 發票編號：INV-2024-09-001 發票日期：2024-09-30
發票金額：HK$ 3,900 到期日：2024-10-30 目前狀態：已逾期 3 天
請儘快安排付款。如有任何疑問，歡迎與我們聯絡。 謝謝！ 香港跳繩學院
```

---

## 📥 PDF 生成

### PDF 內容結構

```
┌─────────────────────────────────────┐
│         香港跳繩學院                │
│         INVOICE                     │
│                                     │
│  發票編號：INV-2024-09-001          │
│  發票日期：2024-09-30               │
│  付款期限：30 天                    │
│  到期日：2024-10-30                 │
├─────────────────────────────────────┤
│  致：聖保羅小學                     │
│     王老師（體育科主任）            │
│     香港中環堅道33號                │
├─────────────────────────────────────┤
│  發票項目：                         │
│                                     │
│  課程：跳繩恆常班（上學期）         │
│  期間：2024年9月                    │
│                                     │
│  課堂明細：                         │
│  09/09 14:00  20人  HK$ 1,000      │
│  09/16 14:00  20人  HK$ 1,000      │
│  09/23 14:00  18人  HK$   900      │
│  09/30 14:00  20人  HK$ 1,000      │
│                    ─────────────   │
│  小計：            HK$ 3,900       │
├─────────────────────────────────────┤
│  發票金額：        HK$ 3,900       │
├─────────────────────────────────────┤
│  付款方式：                         │
│  轉數快 (FPS)：9123-4567           │
│  銀行轉帳：HSBC 123-456789-001     │
│  支票抬頭：香港跳繩學院有限公司     │
└─────────────────────────────────────┘
```

### 實作參考

```typescript
import { jsPDF } from "jspdf";

async function generateInvoicePDF(invoice: InvoiceDetail) {
  const doc = new jsPDF();

  // 標題
  doc.setFontSize(20);
  doc.text("香港跳繩學院", 105, 20, { align: "center" });
  doc.setFontSize(16);
  doc.text("INVOICE", 105, 30, { align: "center" });

  // 發票資訊
  doc.setFontSize(12);
  doc.text(`發票編號：${invoice.invoiceNumber}`, 20, 45);
  doc.text(`發票日期：${formatDate(invoice.invoiceDate)}`, 20, 52);
  doc.text(`到期日：${formatDate(invoice.dueDate)}`, 20, 59);

  // 學校資訊
  doc.text(`致：${invoice.school.schoolName}`, 20, 72);
  doc.text(`   ${invoice.recipientNameChinese}`, 20, 79);
  if (invoice.mailingAddress) {
    doc.text(`   ${invoice.mailingAddress}`, 20, 86);
  }

  // 發票項目
  let y = 100;
  invoice.courses.forEach((invoiceCourse) => {
    doc.text(`課程：${invoiceCourse.course.courseName}`, 20, y);
    y += 7;

    doc.text("課堂明細：", 20, y);
    y += 7;

    invoiceCourse.lessons.forEach((lesson) => {
      const text = `${formatDate(lesson.lessonDate)} ${lesson.startTime}  ${
        lesson.studentCount
      }人  HK$ ${lesson.feeLesson.toLocaleString()}`;
      doc.text(text, 25, y);
      y += 7;
    });

    doc.text(`小計：HK$ ${invoiceCourse.amount.toLocaleString()}`, 20, y);
    y += 10;
  });

  // 總計
  doc.setFontSize(14);
  doc.text(
    `發票金額：HK$ ${invoice.invoiceAmount.toLocaleString()}`,
    20,
    y + 10
  );

  // 儲存
  const filename = `Invoice_${invoice.invoiceNumber}.pdf`;
  doc.save(filename);

  return filename;
}
```

---

## 🔐 權限控制

### 按鈕顯示邏輯

```typescript
function getAvailableActions(invoice: InvoiceDetail, userRole: UserRole) {
  const actions = {
    edit: false,
    delete: false,
    send: false,
    recordPayment: false,
    download: true, // 所有人都可下載
    resend: false,
    remind: false,
  };

  // SCHOOL_ADMIN 只能查看，不能操作
  if (userRole === "SCHOOL_ADMIN") {
    return actions;
  }

  // ADMIN 和 FINANCE 可操作
  if (userRole === "ADMIN" || userRole === "FINANCE") {
    switch (invoice.status) {
      case "DRAFT":
        actions.edit = true;
        actions.delete = true;
        actions.send = true;
        break;

      case "SENT":
        actions.recordPayment = true;
        actions.resend = true;
        break;

      case "OVERDUE":
        actions.recordPayment = true;
        actions.remind = true;
        break;

      case "PARTIAL":
        actions.recordPayment = true;
        break;

      case "PAID":
        // 已付款，無操作
        break;
    }
  }

  return actions;
}
```

---

## 🎨 UX 重點

### 1. 狀態視覺化

```typescript
const statusConfig = {
  DRAFT: {
    color: "gray",
    icon: "📝",
    label: "草稿",
  },
  SENT: {
    color: "blue",
    icon: "📤",
    label: "已發送",
  },
  OVERDUE: {
    color: "red",
    icon: "⚠️",
    label: "已逾期",
  },
  PARTIAL: {
    color: "orange",
    icon: "💰",
    label: "部分付款",
  },
  PAID: {
    color: "green",
    icon: "✅",
    label: "已付款",
  },
};
```

### 2. 逾期警告

```typescript
function getDaysOverdue(dueDate: Date): number {
  const now = new Date();
  const diffTime = now.getTime() - dueDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
}

// 顯示：「已逾期 3 天」
```

### 3. 課堂明細摺疊

預設顯示課程小計，點擊「查看明細」展開課堂列表：

```
課程：跳繩恆常班（上學期）
期間：2024年9月
課堂數：4 堂
小計：HK$ 3,900

[ 🔽 查看課堂明細 ]

// 展開後顯示：
• 09/09 14:00 - 20 人 - HK$ 1,000
• 09/16 14:00 - 20 人 - HK$ 1,000
• 09/23 14:00 - 18 人 - HK$ 900
• 09/30 14:00 - 20 人 - HK$ 1,000
```

### 4. 收款狀態提示

```
┌────────────────────────────────────────────┐
│ ⚠️ 此發票已逾期 3 天                       │
│ 請儘快記錄收款或發送付款提醒。             │
│ [ 📝 記錄收款 ] [ 💬 發送催款 ]           │
└────────────────────────────────────────────┘
```

---

## 🧪 測試案例

### 1. 查看權限測試

```typescript
// ADMIN 和 FINANCE 可查看所有發票
// SCHOOL_ADMIN 只能查看自己學校
// TUTOR 無權限
```

### 2. 狀態變更測試

```typescript
// 草稿 → 發送 → 記錄收款 → 已付款
// 已發送 → 逾期（自動）→ 記錄收款 → 已付款
// 已發送 → 部分收款 → 記錄剩餘 → 已付款
```

### 3. 編輯限制測試

```typescript
// 只有草稿可編輯
// 其他狀態顯示「無法編輯」提示
```

---

## 📌 開發注意事項

1. **自動逾期**：頁面載入時檢查 `dueDate`，自動更新逾期狀態
2. **權限按鈕**：根據用戶角色和發票狀態動態顯示操作按鈕
3. **課堂關聯**：顯示發票包含的課堂明細，支援點擊跳轉到課堂頁面
4. **收款記錄**：顯示所有收款記錄（含部分收款）
5. **PDF 下載**：支援離線下載和電郵發送
6. **催款記錄**：顯示催款次數和最後催款日期
7. **金額驗證**：`invoiceAmount` 應等於所有 `courses.amount` 的總和
8. **刪除保護**：已發送的發票不可刪除，只能 Soft Delete

---

## 🔗 相關頁面

- **上一步**：[發票列表](./INVOICES.md)
- **下一步**：[記錄收款](./INVOICES_PAYMENT.md)
- **相關**：[生成發票](./INVOICES_GENERATE.md)
