# 💵 記錄收款 - Invoices Payment

> **路徑**: `/dashboard/school/invoices/[id]/payment`  
> **優先級**: P1  
> **角色**: ADMIN, FINANCE

---

## 📋 頁面概述

記錄學校付款的表單頁面。支援全額收款、部分收款、多種付款方式，並自動生成收據。

---

## 🎨 頁面結構

```
┌─────────────────────────────────────────────────────────────┐
│ 💵 記錄收款                                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────┐ ┌──────────────────────────┐   │
│  │ 📄 發票資料（唯讀）      │ │ 💰 收款表單              │   │
│  │                          │ │                          │   │
│  │ 發票編號：               │ │ ┌──────────────────────┐ │   │
│  │ INV-2024-09-001          │ │ │ 付款確認日期 *       │ │   │
│  │                          │ │ │ [2024-10-15_______]  │ │   │
│  │ 學校：聖保羅小學         │ │ │                      │ │   │
│  │                          │ │ │ 實際收款金額 *       │ │   │
│  │ 發票日期：2024-09-30     │ │ │ HK$ [3,900_______]   │ │   │
│  │ 到期日：2024-10-30       │ │ │                      │ │   │
│  │                          │ │ │ 發票金額：HK$ 3,900  │ │   │
│  │ 發票金額：HK$ 3,900      │ │ │ 已收款：HK$ 0        │ │   │
│  │ 已收款：HK$ 0            │ │ │ 待收款：HK$ 3,900    │ │   │
│  │ 待收款：HK$ 3,900        │ │ │                      │ │   │
│  │                          │ │ │ 收款類型：           │ │   │
│  │ 狀態：🔵 已發送          │ │ │ ◉ 全額收款           │ │   │
│  │                          │ │ │ ○ 部分收款           │ │   │
│  └──────────────────────────┘ │ │                      │ │   │
│                               │ │ 付款方式 *           │ │   │
│                               │ │ [轉數快 (FPS)____▼]  │ │   │
│                               │ │                      │ │   │
│                               │ │ 交易編號             │ │   │
│                               │ │ [FPS202410151430__]  │ │   │
│                               │ │                      │ │   │
│                               │ │ 付款憑證（可選）     │ │   │
│                               │ │ [ 📎 上傳圖片 ]      │ │   │
│                               │ │                      │ │   │
│                               │ │ 備註                 │ │   │
│                               │ │ [已收款，謝謝______] │ │   │
│                               │ │                      │ │   │
│                               │ │                      │ │   │
│                               │ │ [ 取消 ] [ 確認收款 ]│ │   │
│                               │ └──────────────────────┘ │   │
│                               └──────────────────────────┘   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 📜 收款記錄（如有部分收款）                          │   │
│  │                                                      │   │
│  │ ┌────────────────────────────────────────────────┐  │   │
│  │ │ #1  2024-10-05                                 │  │   │
│  │ │ HK$ 2,000  |  FPS  |  FPS202410051200         │  │   │
│  │ │ 狀態：已確認                                   │  │   │
│  │ └────────────────────────────────────────────────┘  │   │
│  │                                                      │   │
│  │ 累計已收：HK$ 2,000                                 │   │
│  │ 本次收款：HK$ 1,900                                 │   │
│  │ ────────────────────────────────────────────────   │   │
│  │ 總計收款：HK$ 3,900 ✓                              │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧩 使用組件

### TailAdmin 組件

| 組件         | 路徑                              | 用途     |
| ------------ | --------------------------------- | -------- |
| `Input`      | `components/form/input/`          | 表單輸入 |
| `DatePicker` | `components/form/date-picker.tsx` | 日期選擇 |
| `Select`     | `components/form/Select.tsx`      | 付款方式 |
| `Button`     | `components/ui/button/`           | 操作按鈕 |
| `Modal`      | `components/ui/modal/`            | 確認彈窗 |

### 需開發組件

| 組件             | 說明                 |
| ---------------- | -------------------- |
| `AmountInput`    | 金額輸入（帶格式化） |
| `FileUpload`     | 檔案上傳（付款憑證） |
| `PaymentSummary` | 收款摘要卡片         |

---

## 📊 資料結構

### 表單資料

```typescript
interface PaymentFormData {
  // 必填欄位
  paymentConfirmedDate: Date;
  actualReceivedAmount: number;
  paymentMethod: PaymentMethod;

  // 可選欄位
  paymentType: "FULL" | "PARTIAL";
  paymentTransactionNumber?: string;
  paymentProofImage?: File;
  notes?: string;

  // 銀行資訊（銀行轉帳時）
  bankName?: string;
  bankAccountNumber?: string;

  // 支票資訊（支票時）
  chequeNumber?: string;
  chequeBank?: string;
  chequeDate?: Date;
}

enum PaymentMethod {
  FPS = "FPS", // 轉數快
  BANK_TRANSFER = "BANK_TRANSFER", // 銀行轉帳
  CHEQUE = "CHEQUE", // 支票
  CASH = "CASH", // 現金
  CREDIT_CARD = "CREDIT_CARD", // 信用卡
  OTHER = "OTHER", // 其他
}
```

### 付款方式欄位對應

```typescript
const paymentMethodFields = {
  FPS: ["paymentTransactionNumber"],
  BANK_TRANSFER: ["bankName", "bankAccountNumber", "paymentTransactionNumber"],
  CHEQUE: ["chequeNumber", "chequeBank", "chequeDate"],
  CASH: [],
  CREDIT_CARD: ["paymentTransactionNumber"],
  OTHER: ["notes"],
};
```

---

## 🔄 收款邏輯

### 1. 全額收款

```typescript
// API: POST /api/invoices/[id]/payment
async function recordFullPayment(invoiceId: string, data: PaymentFormData) {
  const invoice = await prisma.schoolInvoice.findUnique({
    where: { id: invoiceId },
    include: { receipts: true },
  });

  if (!invoice) throw new Error("Invoice not found");

  // 計算已收款總額
  const paidAmount = invoice.receipts.reduce(
    (sum, r) => sum + r.actualReceivedAmount,
    0
  );

  const remainingAmount = invoice.invoiceAmount - paidAmount;

  // 驗證金額
  if (data.actualReceivedAmount !== remainingAmount) {
    throw new Error(`全額收款金額應為 HK$ ${remainingAmount}`);
  }

  // 生成收據編號
  const receiptNumber = await generateReceiptNumber(invoice.schoolId);

  // 建立收據
  const receipt = await prisma.schoolReceipt.create({
    data: {
      schoolId: invoice.schoolId,
      invoiceId: invoice.id,
      receiptNumber,
      paymentConfirmedDate: data.paymentConfirmedDate,
      actualReceivedAmount: data.actualReceivedAmount,
      paymentMethod: data.paymentMethod,
      paymentStatus: "CONFIRMED",
      paymentTransactionNumber: data.paymentTransactionNumber,
      paymentProofImage: data.paymentProofImage,
      notes: data.notes,
      // 其他欄位...
    },
  });

  // 更新發票狀態
  await prisma.schoolInvoice.update({
    where: { id: invoiceId },
    data: {
      status: "PAID",
      paidAmount: invoice.invoiceAmount,
    },
  });

  // 更新課堂付款狀態
  await updateLessonPaymentStatus(invoiceId, "PAID");

  return receipt;
}
```

### 2. 部分收款

```typescript
async function recordPartialPayment(invoiceId: string, data: PaymentFormData) {
  const invoice = await prisma.schoolInvoice.findUnique({
    where: { id: invoiceId },
    include: { receipts: true },
  });

  if (!invoice) throw new Error("Invoice not found");

  // 計算已收款總額
  const paidAmount = invoice.receipts.reduce(
    (sum, r) => sum + r.actualReceivedAmount,
    0
  );

  const remainingAmount = invoice.invoiceAmount - paidAmount;

  // 驗證金額
  if (data.actualReceivedAmount <= 0) {
    throw new Error("收款金額必須大於 0");
  }

  if (data.actualReceivedAmount > remainingAmount) {
    throw new Error(`收款金額不能超過待收款金額 HK$ ${remainingAmount}`);
  }

  // 生成收據編號
  const receiptNumber = await generateReceiptNumber(invoice.schoolId);

  // 建立收據
  const receipt = await prisma.schoolReceipt.create({
    data: {
      schoolId: invoice.schoolId,
      invoiceId: invoice.id,
      receiptNumber,
      paymentConfirmedDate: data.paymentConfirmedDate,
      actualReceivedAmount: data.actualReceivedAmount,
      paymentMethod: data.paymentMethod,
      paymentStatus: "CONFIRMED",
      paymentTransactionNumber: data.paymentTransactionNumber,
      notes: data.notes,
      // 其他欄位...
    },
  });

  const newPaidAmount = paidAmount + data.actualReceivedAmount;

  // 更新發票狀態
  if (newPaidAmount >= invoice.invoiceAmount) {
    // 全額收齊
    await prisma.schoolInvoice.update({
      where: { id: invoiceId },
      data: {
        status: "PAID",
        paidAmount: invoice.invoiceAmount,
      },
    });

    await updateLessonPaymentStatus(invoiceId, "PAID");
  } else {
    // 仍有待收款
    await prisma.schoolInvoice.update({
      where: { id: invoiceId },
      data: {
        status: "PARTIAL",
        paidAmount: newPaidAmount,
      },
    });
  }

  return receipt;
}
```

### 3. 更新課堂付款狀態

```typescript
async function updateLessonPaymentStatus(
  invoiceId: string,
  status: "PAID" | "PARTIAL"
) {
  // 透過 SchoolInvoiceCourse 找到關聯的課程
  const invoiceCourses = await prisma.schoolInvoiceCourse.findMany({
    where: { invoiceId },
    select: { courseId: true },
  });

  const courseIds = invoiceCourses.map((ic) => ic.courseId);

  // 更新課堂的付款狀態
  await prisma.schoolLesson.updateMany({
    where: {
      courseId: { in: courseIds },
      invoiceStatus: "INVOICED",
      // 需要更精確地關聯到此發票的課堂
    },
    data: {
      paymentStatus: status,
    },
  });
}
```

---

## 📝 收據編號生成

### 編號規則

```
格式：REC-YYYY-MM-XXXXX

範例：
REC-2024-10-00001
REC-2024-10-00002
```

### 實作

```typescript
async function generateReceiptNumber(schoolId: string): Promise<string> {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");

  const prefix = `REC-${year}-${month}-`;

  // 查詢本月最後一個收據編號
  const lastReceipt = await prisma.schoolReceipt.findFirst({
    where: {
      receiptNumber: {
        startsWith: prefix,
      },
    },
    orderBy: {
      receiptNumber: "desc",
    },
  });

  let sequence = 1;
  if (lastReceipt) {
    const lastSequence = parseInt(lastReceipt.receiptNumber.split("-")[3]);
    sequence = lastSequence + 1;
  }

  const receiptNumber = `${prefix}${String(sequence).padStart(5, "0")}`;

  return receiptNumber;
}
```

---

## 📤 付款憑證上傳

### 檔案處理

```typescript
async function uploadPaymentProof(file: File): Promise<string> {
  // 驗證檔案類型
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "application/pdf",
  ];
  if (!allowedTypes.includes(file.type)) {
    throw new Error("只支援 JPG, PNG, PDF 格式");
  }

  // 驗證檔案大小（最大 5MB）
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error("檔案大小不能超過 5MB");
  }

  // 上傳到儲存空間（S3 / Cloudinary / Local）
  const uploadResult = await uploadToStorage(file);

  return uploadResult.url;
}
```

---

## 🎨 動態欄位顯示

### 根據付款方式顯示不同欄位

```typescript
function PaymentForm() {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("FPS");

  return (
    <form>
      {/* 固定欄位 */}
      <DatePicker name="paymentConfirmedDate" required />
      <AmountInput name="actualReceivedAmount" required />
      <Select
        name="paymentMethod"
        value={paymentMethod}
        onChange={setPaymentMethod}
        required
      />

      {/* 動態欄位 */}
      {paymentMethod === "FPS" && (
        <Input
          name="paymentTransactionNumber"
          label="FPS 交易編號"
          placeholder="FPS202410151430"
        />
      )}

      {paymentMethod === "BANK_TRANSFER" && (
        <>
          <Input name="bankName" label="銀行名稱" />
          <Input name="bankAccountNumber" label="帳戶號碼" />
          <Input name="paymentTransactionNumber" label="交易編號" />
        </>
      )}

      {paymentMethod === "CHEQUE" && (
        <>
          <Input name="chequeNumber" label="支票號碼" required />
          <Input name="chequeBank" label="支票銀行" />
          <DatePicker name="chequeDate" label="支票日期" />
        </>
      )}

      {/* 共用欄位 */}
      <FileUpload name="paymentProofImage" label="付款憑證" />
      <Textarea name="notes" label="備註" />

      <Button type="submit">確認收款</Button>
    </form>
  );
}
```

---

## ✅ 表單驗證

### 客戶端驗證

```typescript
const paymentSchema = z
  .object({
    paymentConfirmedDate: z.date(),
    actualReceivedAmount: z.number().positive("金額必須大於 0"),
    paymentMethod: z.enum([
      "FPS",
      "BANK_TRANSFER",
      "CHEQUE",
      "CASH",
      "CREDIT_CARD",
      "OTHER",
    ]),
    paymentType: z.enum(["FULL", "PARTIAL"]),

    // 條件驗證
    paymentTransactionNumber: z.string().optional(),
    bankName: z.string().optional(),
    chequeNumber: z.string().optional(),

    notes: z.string().optional(),
  })
  .refine(
    (data) => {
      // FPS 必須有交易編號
      if (data.paymentMethod === "FPS" && !data.paymentTransactionNumber) {
        return false;
      }
      return true;
    },
    {
      message: "FPS 付款必須填寫交易編號",
      path: ["paymentTransactionNumber"],
    }
  );
```

### 伺服器端驗證

```typescript
async function validatePayment(invoiceId: string, data: PaymentFormData) {
  const invoice = await prisma.schoolInvoice.findUnique({
    where: { id: invoiceId },
    include: { receipts: true },
  });

  if (!invoice) {
    throw new Error("發票不存在");
  }

  if (invoice.status === "PAID") {
    throw new Error("發票已全額收款");
  }

  // 計算待收款金額
  const paidAmount = invoice.receipts.reduce(
    (sum, r) => sum + r.actualReceivedAmount,
    0
  );
  const remainingAmount = invoice.invoiceAmount - paidAmount;

  if (data.actualReceivedAmount > remainingAmount) {
    throw new Error(`收款金額不能超過待收款金額 HK$ ${remainingAmount}`);
  }

  // 全額收款驗證
  if (
    data.paymentType === "FULL" &&
    data.actualReceivedAmount !== remainingAmount
  ) {
    throw new Error(`全額收款金額應為 HK$ ${remainingAmount}`);
  }

  return true;
}
```

---

## 📄 收據生成

### 自動生成收據

收款成功後，自動生成收據 PDF：

```typescript
async function generateReceiptPDF(receipt: SchoolReceipt) {
  const doc = new jsPDF();

  // 標題
  doc.setFontSize(20);
  doc.text("香港跳繩學院", 105, 20, { align: "center" });
  doc.setFontSize(16);
  doc.text("RECEIPT / 收據", 105, 30, { align: "center" });

  // 收據資訊
  doc.setFontSize(12);
  doc.text(`收據編號：${receipt.receiptNumber}`, 20, 45);
  doc.text(`日期：${formatDate(receipt.paymentConfirmedDate)}`, 20, 52);

  // 學校資訊
  const school = await prisma.school.findUnique({
    where: { id: receipt.schoolId },
  });
  doc.text(`收款自：${school.schoolName}`, 20, 65);

  // 發票資訊
  const invoice = await prisma.schoolInvoice.findUnique({
    where: { id: receipt.invoiceId },
  });
  doc.text(`發票編號：${invoice.invoiceNumber}`, 20, 78);

  // 收款資訊
  doc.setFontSize(14);
  doc.text(
    `收款金額：HK$ ${receipt.actualReceivedAmount.toLocaleString()}`,
    20,
    95
  );
  doc.setFontSize(12);
  doc.text(
    `付款方式：${getPaymentMethodLabel(receipt.paymentMethod)}`,
    20,
    105
  );

  if (receipt.paymentTransactionNumber) {
    doc.text(`交易編號：${receipt.paymentTransactionNumber}`, 20, 112);
  }

  // 備註
  if (receipt.notes) {
    doc.text(`備註：${receipt.notes}`, 20, 125);
  }

  // 儲存
  const filename = `Receipt_${receipt.receiptNumber}.pdf`;
  doc.save(filename);

  return filename;
}
```

---

## 🎯 UX 重點

### 1. 即時計算

```typescript
function PaymentAmountInput({ invoice, receipts }) {
  const paidAmount = receipts.reduce(
    (sum, r) => sum + r.actualReceivedAmount,
    0
  );
  const remainingAmount = invoice.invoiceAmount - paidAmount;

  const [amount, setAmount] = useState(remainingAmount);
  const [paymentType, setPaymentType] = useState<"FULL" | "PARTIAL">("FULL");

  return (
    <div>
      <div className="summary">
        <p>發票金額：HK$ {invoice.invoiceAmount.toLocaleString()}</p>
        <p>已收款：HK$ {paidAmount.toLocaleString()}</p>
        <p>待收款：HK$ {remainingAmount.toLocaleString()}</p>
      </div>

      <RadioGroup value={paymentType} onChange={setPaymentType}>
        <Radio value="FULL">
          全額收款 (HK$ {remainingAmount.toLocaleString()})
        </Radio>
        <Radio value="PARTIAL">部分收款</Radio>
      </RadioGroup>

      <AmountInput
        value={amount}
        onChange={setAmount}
        disabled={paymentType === "FULL"}
        max={remainingAmount}
      />
    </div>
  );
}
```

### 2. 確認彈窗

提交前顯示確認彈窗：

```
┌────────────────────────────────────────┐
│ 確認收款資訊                           │
├────────────────────────────────────────┤
│ 發票編號：INV-2024-09-001              │
│ 學校：聖保羅小學                       │
│                                        │
│ 收款日期：2024-10-15                   │
│ 收款金額：HK$ 3,900                    │
│ 付款方式：轉數快 (FPS)                 │
│ 交易編號：FPS202410151430              │
│                                        │
│ 此操作將生成收據並更新發票狀態為已付款。│
│                                        │
│ [ 取消 ] [ 確認收款 ]                 │
└────────────────────────────────────────┘
```

### 3. 成功提示

```
┌────────────────────────────────────────┐
│ ✅ 收款記錄成功                        │
├────────────────────────────────────────┤
│ 收據編號：REC-2024-10-00001            │
│ 收款金額：HK$ 3,900                    │
│                                        │
│ [ 📄 下載收據 ] [ 📧 發送收據 ]       │
│ [ 返回發票列表 ]                       │
└────────────────────────────────────────┘
```

---

## 🧪 測試案例

### 1. 全額收款

```typescript
// 待收款 = 發票金額 - 已收款
// 輸入金額 = 待收款 → 成功
// 輸入金額 < 待收款 → 錯誤
// 輸入金額 > 待收款 → 錯誤
```

### 2. 部分收款

```typescript
// 第一次：收 HK$ 2,000 → 狀態變更為 PARTIAL
// 第二次：收 HK$ 1,900 → 狀態變更為 PAID
```

### 3. 付款方式驗證

```typescript
// FPS：必須有交易編號
// 支票：必須有支票號碼
// 現金：無額外必填欄位
```

---

## 📌 開發注意事項

1. **金額驗證**：收款金額不能超過待收款金額
2. **重複收款**：允許多次部分收款，直到全額收齊
3. **收據編號**：自動生成，不可重複
4. **付款憑證**：支援圖片和 PDF，限制檔案大小
5. **自動更新**：收款後自動更新發票和課堂狀態
6. **收據下載**：收款成功後提供收據下載連結
7. **電郵通知**：可選擇發送收據給學校聯絡人
8. **交易記錄**：所有收款記錄不可刪除（稽核需求）

---

## 🔗 相關頁面

- **上一步**：[發票詳情](./INVOICES_DETAIL.md)
- **相關**：[發票列表](./INVOICES.md)
- **相關**：[財務儀表板](./FINANCE.md)
