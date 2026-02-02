# 💳 發票列表 - Invoices

> **路徑**: `/dashboard/school/invoices`  
> **優先級**: P0  
> **角色**: ADMIN (CRUD), FINANCE (CRUD), SCHOOL_ADMIN (唯讀)

---

## 📋 頁面概述

發票管理列表頁，顯示所有發票狀態、金額，支援快速操作（催款、記錄收款）。

---

## 🎨 頁面結構

```
┌─────────────────────────────────────────────────────────────┐
│ 💳 發票管理                                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 狀態: [全部▼] [待發送] [已發送] [已逾期] [已付款]  │   │
│  │ 學校: [全部學校________▼]       [➕ 生成發票]       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ ┌─────────┬────────────┬──────────┬─────────┬───────┬────────┐
│  │ │ 發票編號│ 學校       │ 金額     │ 到期日  │ 狀態  │ 操作   │
│  │ ├─────────┼────────────┼──────────┼─────────┼───────┼────────┤
│  │ │INV-001  │ 聖保羅小學 │ $12,000  │已逾期3天│🔴逾期 │[催款]  │
│  │ │INV-002  │ 培正中學   │ $8,500   │ 12/05   │🔵已發送│[記錄]  │
│  │ │INV-003  │ 協恩中學   │ $6,000   │ 12/10   │🔵已發送│[查看]  │
│  │ │INV-004  │ 聖保羅小學 │ $4,500   │ -       │🟢已付款│[收據]  │
│  │ └─────────┴────────────┴──────────┴─────────┴───────┴────────┘
│  │                                                          │
│  │ 顯示 1-10 / 共 45 張                    [<] 1 2 3 ... [>]│
│  └──────────────────────────────────────────────────────────┘
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 📊 統計摘要                                          │   │
│  │ ├─ 本月開票：10 張，HK$ 95,000                       │   │
│  │ ├─ 已收款：6 張，HK$ 52,000                          │   │
│  │ └─ 待收款：4 張，HK$ 43,000                          │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧩 使用組件

### TailAdmin 組件

| 組件           | 路徑                                  | 用途     |
| -------------- | ------------------------------------- | -------- |
| `InvoiceList`  | `components/invoice/InvoiceList.tsx`  | 參考結構 |
| `InvoiceTable` | `components/invoice/InvoiceTable.tsx` | 參考結構 |
| `DataTables`   | `components/tables/DataTables/`       | 表格     |
| `Badge`        | `components/ui/badge/Badge.tsx`       | 狀態標籤 |
| `Pagination`   | `components/ui/pagination/`           | 分頁     |
| `MultiSelect`  | `components/form/MultiSelect.tsx`     | 學校篩選 |

### 需開發組件

| 組件                 | 說明         |
| -------------------- | ------------ |
| `InvoiceStatusBadge` | 發票狀態標籤 |
| `QuickPaymentModal`  | 快速收款彈窗 |
| `InvoiceSummaryCard` | 統計摘要卡片 |

---

## 📊 資料結構

### 發票列表資料

```typescript
interface InvoiceListItem {
  id: string;
  invoiceNumber: string;

  school: {
    id: string;
    schoolName: string;
  };

  invoiceDate: Date;
  dueDate?: Date;

  invoiceAmount: number;
  paidAmount: number;

  status: InvoiceDocStatus;

  // 計算屬性
  pendingAmount: number;
  daysOverdue?: number;
}
```

### 查詢參數

```typescript
interface InvoiceListParams {
  status?: InvoiceDocStatus | "all";
  schoolIds?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  pageSize?: number;
}
```

### API 查詢

```typescript
// API: GET /api/invoices
async function getInvoices(params: InvoiceListParams, session: Session) {
  const { status, schoolIds, page = 1, pageSize = 10 } = params;

  let where: Prisma.SchoolInvoiceWhereInput = {
    deletedAt: null,
    ...(status && status !== "all" && { status }),
    ...(schoolIds?.length && { schoolId: { in: schoolIds } }),
  };

  // SCHOOL_ADMIN 只能查看自己學校
  if (session.user.role === "SCHOOL_ADMIN") {
    where.schoolId = session.user.schoolId;
  }

  const [invoices, total] = await Promise.all([
    prisma.schoolInvoice.findMany({
      where,
      include: {
        school: { select: { id: true, schoolName: true } },
      },
      orderBy: { invoiceDate: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.schoolInvoice.count({ where }),
  ]);

  // 計算逾期天數
  const now = new Date();
  const invoicesWithCalc = invoices.map((inv) => ({
    ...inv,
    pendingAmount: Number(inv.invoiceAmount) - Number(inv.paidAmount),
    daysOverdue:
      inv.dueDate && inv.status !== "PAID" && inv.dueDate < now
        ? Math.floor(
            (now.getTime() - inv.dueDate.getTime()) / (1000 * 60 * 60 * 24)
          )
        : undefined,
  }));

  return {
    data: invoicesWithCalc,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}
```

---

## 🎯 核心功能

### 1. 發票狀態標籤

```tsx
function InvoiceStatusBadge({
  status,
  dueDate,
  paidAmount,
  invoiceAmount,
}: {
  status: InvoiceDocStatus;
  dueDate?: Date;
  paidAmount: number;
  invoiceAmount: number;
}) {
  // 計算實際顯示狀態
  const getDisplayStatus = () => {
    if (status === "PAID") return { color: "green", text: "已付款" };
    if (status === "CANCELLED") return { color: "gray", text: "已取消" };
    if (status === "DRAFT") return { color: "gray", text: "草稿" };

    // 檢查是否逾期
    if (dueDate && new Date() > dueDate) {
      const days = Math.floor(
        (new Date().getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      return { color: "red", text: `已逾期 ${days} 天` };
    }

    // 檢查是否部分付款
    if (paidAmount > 0 && paidAmount < invoiceAmount) {
      return { color: "orange", text: "部分付款" };
    }

    return { color: "blue", text: "已發送" };
  };

  const { color, text } = getDisplayStatus();

  return (
    <Badge variant="light" color={color}>
      {text}
    </Badge>
  );
}
```

### 2. 快速收款 Modal

```tsx
interface QuickPaymentModalProps {
  invoice: InvoiceListItem;
  onClose: () => void;
  onSuccess: () => void;
}

export function QuickPaymentModal({
  invoice,
  onClose,
  onSuccess,
}: QuickPaymentModalProps) {
  const [formData, setFormData] = useState({
    paymentDate: new Date(),
    amount: invoice.pendingAmount,
    method: "FPS" as PaymentMethod,
    transactionNumber: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      await fetch(`/api/invoices/${invoice.id}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error("記錄收款失敗:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} className="max-w-md">
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">記錄收款</h3>

        {/* 發票資訊 */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg dark:bg-gray-800">
          <p className="text-sm text-gray-500">發票編號</p>
          <p className="font-medium">{invoice.invoiceNumber}</p>
          <p className="text-sm text-gray-500 mt-2">待收金額</p>
          <p className="font-medium text-lg">
            HK$ {invoice.pendingAmount.toLocaleString()}
          </p>
        </div>

        {/* 表單 */}
        <div className="space-y-4">
          <div>
            <Label>付款日期 *</Label>
            <DatePicker
              value={formData.paymentDate}
              onChange={(date) =>
                setFormData((prev) => ({ ...prev, paymentDate: date }))
              }
            />
          </div>

          <div>
            <Label>收款金額 (HK$) *</Label>
            <Input
              type="number"
              value={formData.amount}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  amount: Number(e.target.value),
                }))
              }
            />
          </div>

          <div>
            <Label>付款方式 *</Label>
            <Select
              value={formData.method}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, method: value }))
              }
              options={[
                { value: "FPS", label: "轉數快 (FPS)" },
                { value: "CHEQUE", label: "支票" },
                { value: "BANK_TRANSFER", label: "銀行轉帳" },
                { value: "CASH", label: "現金" },
              ]}
            />
          </div>

          <div>
            <Label>交易編號</Label>
            <Input
              value={formData.transactionNumber}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  transactionNumber: e.target.value,
                }))
              }
              placeholder="如：FPS202412051430"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1">
            取消
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? "處理中..." : "確認收款"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
```

### 3. 行操作

```typescript
function getRowActions(
  invoice: InvoiceListItem,
  role: UserRole,
  handlers: {
    onView: () => void;
    onRecordPayment: () => void;
    onSendReminder: () => void;
    onDownloadPdf: () => void;
    onViewReceipt: () => void;
  }
) {
  const actions = [];

  // 查看 - 所有人
  actions.push({
    label: "查看",
    onClick: handlers.onView,
  });

  // 唯讀角色到此為止
  if (role === "SCHOOL_ADMIN") {
    return actions;
  }

  // 下載 PDF
  if (invoice.status !== "DRAFT") {
    actions.push({
      label: "下載 PDF",
      onClick: handlers.onDownloadPdf,
    });
  }

  // 記錄收款 - 未付清
  if (["SENT", "OVERDUE", "PARTIAL"].includes(invoice.status)) {
    actions.push({
      label: "記錄收款",
      onClick: handlers.onRecordPayment,
      highlight: true,
    });
  }

  // 催款 - 已逾期
  if (invoice.daysOverdue && invoice.daysOverdue > 0) {
    actions.push({
      label: "發送催款",
      onClick: handlers.onSendReminder,
    });
  }

  // 查看收據 - 已付款
  if (invoice.status === "PAID") {
    actions.push({
      label: "查看收據",
      onClick: handlers.onViewReceipt,
    });
  }

  return actions;
}
```

---

## 💻 程式碼範例

### 頁面結構

```tsx
// app/(private)/dashboard/school/invoices/page.tsx
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import Link from "next/link";
import { PageBreadCrumb } from "@/components/common/PageBreadCrumb";
import { InvoiceStatusBadge } from "./components/InvoiceStatusBadge";
import { QuickPaymentModal } from "./components/QuickPaymentModal";
import { InvoiceSummaryCard } from "./components/InvoiceSummaryCard";
import { TableDropdown } from "@/components/common/TableDropdown";
import { Pagination } from "@/components/ui/pagination";

export default function InvoicesPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [status, setStatus] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [paymentModal, setPaymentModal] = useState<InvoiceListItem | null>(
    null
  );

  const canEdit = ["ADMIN", "FINANCE"].includes(session?.user?.role || "");

  const queryString = new URLSearchParams({
    ...(status !== "all" && { status }),
    page: page.toString(),
  }).toString();

  const { data, isLoading, mutate } = useSWR(
    `/api/invoices?${queryString}`,
    fetcher
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageBreadCrumb title="發票管理" />

        {canEdit && (
          <Link href="/dashboard/school/invoices/generate">
            <Button variant="primary">
              <PlusIcon className="h-4 w-4 mr-2" />
              生成發票
            </Button>
          </Link>
        )}
      </div>

      {/* 篩選器 */}
      <div className="flex flex-wrap gap-4">
        <div className="flex gap-2">
          {[
            { value: "all", label: "全部" },
            { value: "DRAFT", label: "草稿" },
            { value: "SENT", label: "已發送" },
            { value: "OVERDUE", label: "已逾期" },
            { value: "PAID", label: "已付款" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                setStatus(opt.value);
                setPage(1);
              }}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm transition-colors",
                status === opt.value
                  ? "bg-primary-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 表格 */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                發票編號
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
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                狀態
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">
                操作
              </th>
            </tr>
          </thead>
          <tbody>
            {data?.data.map((invoice: InvoiceListItem) => (
              <tr
                key={invoice.id}
                className={cn(
                  "border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50",
                  invoice.daysOverdue &&
                    invoice.daysOverdue > 0 &&
                    "bg-red-50 dark:bg-red-900/10"
                )}
              >
                <td className="px-4 py-3 text-sm font-medium">
                  {invoice.invoiceNumber}
                </td>
                <td className="px-4 py-3 text-sm">
                  {invoice.school.schoolName}
                </td>
                <td className="px-4 py-3 text-sm text-right font-medium">
                  HK$ {invoice.invoiceAmount.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {invoice.dueDate
                    ? format(invoice.dueDate, "yyyy/MM/dd")
                    : "-"}
                </td>
                <td className="px-4 py-3">
                  <InvoiceStatusBadge
                    status={invoice.status}
                    dueDate={invoice.dueDate}
                    paidAmount={invoice.paidAmount}
                    invoiceAmount={invoice.invoiceAmount}
                  />
                </td>
                <td className="px-4 py-3 text-right">
                  <TableDropdown
                    items={getRowActions(invoice, session?.user?.role, {
                      onView: () =>
                        router.push(`/dashboard/school/invoices/${invoice.id}`),
                      onRecordPayment: () => setPaymentModal(invoice),
                      onSendReminder: () => handleSendReminder(invoice.id),
                      onDownloadPdf: () => handleDownloadPdf(invoice.id),
                      onViewReceipt: () =>
                        router.push(
                          `/dashboard/school/invoices/${invoice.id}?tab=receipt`
                        ),
                    })}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* 分頁 */}
        {data?.pagination && (
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              顯示 {(data.pagination.page - 1) * data.pagination.pageSize + 1}-
              {Math.min(
                data.pagination.page * data.pagination.pageSize,
                data.pagination.total
              )}{" "}
              / 共 {data.pagination.total} 張
            </span>
            <Pagination
              currentPage={data.pagination.page}
              totalPages={data.pagination.totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      {/* 統計摘要 */}
      <InvoiceSummaryCard />

      {/* 快速收款 Modal */}
      {paymentModal && (
        <QuickPaymentModal
          invoice={paymentModal}
          onClose={() => setPaymentModal(null)}
          onSuccess={() => mutate()}
        />
      )}
    </div>
  );
}
```

---

## ✅ 驗收標準

- [ ] ADMIN/FINANCE 可查看所有發票
- [ ] SCHOOL_ADMIN 只能查看自己學校的發票
- [ ] 狀態篩選正確運作
- [ ] 逾期發票紅色高亮顯示
- [ ] 可快速記錄收款
- [ ] 可發送催款提醒
- [ ] 分頁功能正常
- [ ] 統計摘要顯示正確
