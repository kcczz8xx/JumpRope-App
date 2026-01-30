# 💰 財務儀表板 - Finance

> **路徑**: `/dashboard/school/finance`  
> **優先級**: P1  
> **角色**: FINANCE, ADMIN

---

## 📋 頁面概述

財務人員專用儀表板，提供收款概覽、待處理發票、收款記錄和報表下載功能。

---

## 🎨 頁面結構

```
┌─────────────────────────────────────────────────────────────┐
│ 💰 財務儀表板                                    [月份篩選] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│  │ 💰 本月收款 │ │ ⏰ 待收款   │ │ ⚠️ 已逾期   │ │ 📊 年度累計 │
│  │ HK$80,000   │ │ HK$45,000   │ │ HK$12,000   │ │ HK$960,000 │
│  │             │ │  4張發票    │ │  2張發票    │ │             │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ ⚠️ 待處理發票                                 [全部] │   │
│  │ ┌──────┬─────────┬─────────┬─────────┬─────────┐     │   │
│  │ │ 編號 │ 學校    │ 金額    │ 到期日  │ 操作    │     │   │
│  │ ├──────┼─────────┼─────────┼─────────┼─────────┤     │   │
│  │ │INV-01│ 聖保羅  │ $12,000 │ 已逾期3天│ [催款] │     │   │
│  │ │INV-02│ 培正    │ $8,500  │ 5天後   │ [記錄] │     │   │
│  │ └──────┴─────────┴─────────┴─────────┴─────────┘     │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────────┐ ┌─────────────────────────┐   │
│  │ 📝 最近收款記錄          │ │ 📊 報表下載             │   │
│  │ ─────────────────────── │ │ ┌─────────────────────┐ │   │
│  │ 今天 15:30               │ │ │ 📄 本月收入報表 CSV │ │   │
│  │ 培正中學 FPS $6,000      │ │ └─────────────────────┘ │   │
│  │                          │ │ ┌─────────────────────┐ │   │
│  │ 昨天 10:15               │ │ │ 📄 年度財務總結 PDF │ │   │
│  │ 聖保羅 支票 $12,000      │ │ └─────────────────────┘ │   │
│  │                          │ │ ┌─────────────────────┐ │   │
│  │ [ 查看全部 ]             │ │ │ 📄 逾期發票清單     │ │   │
│  └──────────────────────────┘ │ └─────────────────────┘ │   │
│                               └─────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧩 使用組件

### TailAdmin 組件

| 組件             | 路徑                                    | 用途               |
| ---------------- | --------------------------------------- | ------------------ |
| `InvoiceMetrics` | `components/invoice/InvoiceMetrics.tsx` | 財務指標（可參考） |
| `InvoiceTable`   | `components/invoice/InvoiceTable.tsx`   | 發票表格（可參考） |
| `CardWithIcon`   | `components/cards/card-with-icon/`      | 指標卡片           |
| `BasicTables`    | `components/tables/BasicTables/`        | 發票表格           |
| `Badge`          | `components/ui/badge/Badge.tsx`         | 狀態標籤           |

---

## 📊 指標定義

### 本月已收款

```typescript
const monthlyReceived = await prisma.schoolReceipt.aggregate({
  where: {
    paymentConfirmedDate: {
      gte: startOfMonth(new Date()),
      lte: endOfMonth(new Date()),
    },
    paymentStatus: "CONFIRMED",
  },
  _sum: { actualReceivedAmount: true },
});
```

### 待收款

```typescript
const pendingInvoices = await prisma.schoolInvoice.findMany({
  where: {
    status: { in: ["SENT"] },
    OR: [{ dueDate: null }, { dueDate: { gte: new Date() } }],
  },
  select: {
    id: true,
    invoiceAmount: true,
    paidAmount: true,
  },
});

const pendingAmount = pendingInvoices.reduce(
  (sum, inv) => sum + (inv.invoiceAmount - inv.paidAmount),
  0
);
```

### 已逾期

```typescript
const overdueInvoices = await prisma.schoolInvoice.findMany({
  where: {
    status: { in: ["SENT", "OVERDUE"] },
    dueDate: { lt: new Date() },
  },
  select: {
    id: true,
    invoiceAmount: true,
    paidAmount: true,
    dueDate: true,
  },
});

const overdueAmount = overdueInvoices.reduce(
  (sum, inv) => sum + (inv.invoiceAmount - inv.paidAmount),
  0
);
```

---

## 🎯 核心功能

### 1. 快速記錄收款

```typescript
// 從發票表格直接記錄收款
interface QuickPaymentData {
  invoiceId: string;
  paymentDate: Date;
  amount: number;
  method: PaymentMethod;
  transactionNumber?: string;
}

async function recordQuickPayment(data: QuickPaymentData) {
  const invoice = await prisma.schoolInvoice.findUnique({
    where: { id: data.invoiceId },
  });

  if (!invoice) throw new Error("發票不存在");

  // 生成收據編號
  const receiptNumber = await generateReceiptNumber();

  await prisma.$transaction([
    // 建立收據
    prisma.schoolReceipt.create({
      data: {
        schoolId: invoice.schoolId,
        invoiceId: data.invoiceId,
        receiptNumber,
        paymentConfirmedDate: data.paymentDate,
        actualReceivedAmount: data.amount,
        paymentMethod: data.method,
        paymentStatus: "CONFIRMED",
        paymentTransactionNumber: data.transactionNumber,
      },
    }),
    // 更新發票
    prisma.schoolInvoice.update({
      where: { id: data.invoiceId },
      data: {
        paidAmount: { increment: data.amount },
        status:
          data.amount >= invoice.invoiceAmount - invoice.paidAmount
            ? "PAID"
            : "PARTIAL",
      },
    }),
  ]);
}
```

### 2. 催款功能

```typescript
interface ReminderData {
  invoiceId: string;
  method: "email" | "whatsapp";
}

async function sendPaymentReminder(data: ReminderData) {
  const invoice = await prisma.schoolInvoice.findUnique({
    where: { id: data.invoiceId },
    include: {
      school: {
        include: {
          contacts: { where: { isPrimary: true } },
        },
      },
    },
  });

  // 發送提醒（根據方式）
  if (data.method === "email") {
    await sendEmail({
      to: invoice.contactEmail || invoice.school.contacts[0]?.email,
      template: "payment-reminder",
      data: {
        invoiceNumber: invoice.invoiceNumber,
        amount: invoice.invoiceAmount - invoice.paidAmount,
        dueDate: invoice.dueDate,
      },
    });
  }

  // 記錄催款歷史（可擴展）
}
```

### 3. 報表下載

```typescript
// 本月收入報表 CSV
async function generateMonthlyReportCSV() {
  const receipts = await prisma.schoolReceipt.findMany({
    where: {
      paymentConfirmedDate: {
        gte: startOfMonth(new Date()),
        lte: endOfMonth(new Date()),
      },
      paymentStatus: "CONFIRMED",
    },
    include: {
      school: true,
      invoice: true,
    },
    orderBy: { paymentConfirmedDate: "desc" },
  });

  const csvData = [
    ["日期", "學校", "發票編號", "收據編號", "付款方式", "金額"],
    ...receipts.map((r) => [
      format(r.paymentConfirmedDate, "yyyy-MM-dd"),
      r.school.schoolName,
      r.invoice.invoiceNumber,
      r.receiptNumber,
      paymentMethodLabels[r.paymentMethod],
      r.actualReceivedAmount.toString(),
    ]),
  ];

  return convertToCSV(csvData);
}
```

---

## 💻 程式碼範例

### 頁面結構

```tsx
// app/(private)/dashboard/school/finance/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function FinancePage() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/login");
  }

  if (!["ADMIN", "FINANCE"].includes(session.user.role)) {
    redirect("/dashboard/school/overview");
  }

  const [metrics, pendingInvoices, recentReceipts] = await Promise.all([
    getFinanceMetrics(),
    getPendingInvoices(),
    getRecentReceipts(10),
  ]);

  return (
    <div className="space-y-6">
      <PageBreadCrumb title="財務儀表板" />

      {/* 指標卡片 */}
      <FinanceMetricCards metrics={metrics} />

      {/* 待處理發票 */}
      <PendingInvoicesTable invoices={pendingInvoices} />

      {/* 底部區域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 最近收款 */}
        <RecentReceiptsTimeline receipts={recentReceipts} />

        {/* 報表下載 */}
        <ReportDownloadPanel />
      </div>
    </div>
  );
}
```

### PendingInvoicesTable 組件

```tsx
"use client";

interface PendingInvoicesTableProps {
  invoices: InvoiceWithSchool[];
}

export function PendingInvoicesTable({ invoices }: PendingInvoicesTableProps) {
  const [paymentModal, setPaymentModal] = useState<string | null>(null);

  const getStatusDisplay = (invoice: InvoiceWithSchool) => {
    if (!invoice.dueDate) return { text: "無到期日", color: "gray" };

    const daysUntilDue = differenceInDays(invoice.dueDate, new Date());

    if (daysUntilDue < 0) {
      return { text: `已逾期 ${Math.abs(daysUntilDue)} 天`, color: "red" };
    } else if (daysUntilDue <= 7) {
      return { text: `${daysUntilDue} 天後到期`, color: "orange" };
    } else {
      return { text: `${daysUntilDue} 天後到期`, color: "gray" };
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
        <h3 className="text-lg font-semibold">待處理發票</h3>
        <Link href="/dashboard/school/invoices?status=pending">
          <Button variant="ghost" size="sm">
            查看全部
          </Button>
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800">
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                編號
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                學校
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">
                金額
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                到期日
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">
                操作
              </th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => {
              const status = getStatusDisplay(invoice);
              const pendingAmount = invoice.invoiceAmount - invoice.paidAmount;

              return (
                <tr
                  key={invoice.id}
                  className={cn(
                    "border-b border-gray-100 dark:border-gray-800",
                    status.color === "red" && "bg-red-50 dark:bg-red-900/10"
                  )}
                >
                  <td className="px-4 py-3 text-sm font-medium">
                    {invoice.invoiceNumber}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {invoice.school.schoolName}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-medium">
                    HK$ {pendingAmount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <Badge variant="light" color={status.color as any}>
                      {status.text}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      {status.color === "red" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSendReminder(invoice.id)}
                        >
                          催款
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => setPaymentModal(invoice.id)}
                      >
                        記錄收款
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 快速收款 Modal */}
      {paymentModal && (
        <QuickPaymentModal
          invoiceId={paymentModal}
          onClose={() => setPaymentModal(null)}
        />
      )}
    </div>
  );
}
```

---

## ✅ 驗收標準

- [ ] 財務指標正確計算
- [ ] 待處理發票按逾期天數排序
- [ ] 逾期發票紅色高亮顯示
- [ ] 可快速記錄收款
- [ ] 催款功能可發送提醒
- [ ] 報表可正確下載
- [ ] 只有 ADMIN 和 FINANCE 可存取
