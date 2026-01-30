# 📄 報價詳情 - Quotations Detail

> **路徑**: `/dashboard/school/quotations/[id]`  
> **優先級**: P1  
> **角色**: ADMIN (編輯), SCHOOL_ADMIN (唯讀)

---

## 📋 頁面概述

顯示報價單的完整資料，包含學校資訊、報價項目明細、狀態變更歷史。支援編輯、發送、接受/拒絕操作。

---

## 🎨 頁面結構

```
┌─────────────────────────────────────────────────────────────┐
│ 📄 報價詳情                                   [編輯] [刪除] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 報價編號：Q2024-003                                  │   │
│  │ 狀態：🟢 已接受                                      │   │
│  │ 建立日期：2024-11-10                                 │   │
│  │ 發送日期：2024-11-12                                 │   │
│  │ 有效期至：2024-12-12                                 │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 📍 學校資料                                          │   │
│  │ ──────────────────────────────────────────────────  │   │
│  │ 學校名稱：聖保羅小學                                 │   │
│  │ 地址：香港中環堅道33號                               │   │
│  │ 電話：2523-1234                                      │   │
│  │                                                      │   │
│  │ 聯絡人：王老師（體育科主任）                         │   │
│  │ 手提：9123 4567                                      │   │
│  │ 電郵：wang@stpaul.edu.hk                            │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 📋 查詢資料                                          │   │
│  │ ──────────────────────────────────────────────────  │   │
│  │ 查詢日期：2024-11-10                                 │   │
│  │ 希望開始：2024-12-01                                 │   │
│  │ 預計學生：20 人                                      │   │
│  │ 希望時間：每週一 14:00-15:30                        │   │
│  │                                                      │   │
│  │ 查詢內容：                                           │   │
│  │ 希望為小三至小五學生開設跳繩訓練班，                 │   │
│  │ 每週一次，為期一個學期...                           │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 💰 報價項目                                          │   │
│  │ ──────────────────────────────────────────────────  │   │
│  │ ┌────────────────────────────────────────────────┐  │   │
│  │ │ 項目 1                                         │  │   │
│  │ │ ────────────────────────────────────────────  │  │   │
│  │ │ 課程名稱：跳繩恆常班（上學期）                 │  │   │
│  │ │ 課程類型：恆常班                               │  │   │
│  │ │                                                │  │   │
│  │ │ 收費模式：學生每節課堂收費                     │  │   │
│  │ │ 單價：HK$ 50 / 人 / 堂                        │  │   │
│  │ │ 數量：12 堂                                    │  │   │
│  │ │ 預計學生：20 人                                │  │   │
│  │ │                                                │  │   │
│  │ │ 課程安排：                                     │  │   │
│  │ │ • 每週 1 堂，每堂 90 分鐘                     │  │   │
│  │ │ • 所需導師：2 人                              │  │   │
│  │ │                                                │  │   │
│  │ │ 小計：HK$ 12,000                              │  │   │
│  │ └────────────────────────────────────────────────┘  │   │
│  │                                                      │   │
│  │ ┌────────────────────────────────────────────────┐  │   │
│  │ │ 項目 2                                         │  │   │
│  │ │ ────────────────────────────────────────────  │  │   │
│  │ │ 課程名稱：速度跳訓練                           │  │   │
│  │ │ 課程類型：短期班                               │  │   │
│  │ │ ...                                            │  │   │
│  │ │ 小計：HK$ 6,000                               │  │   │
│  │ └────────────────────────────────────────────────┘  │   │
│  │                                                      │   │
│  │ ──────────────────────────────────────────────────  │   │
│  │ 總金額：HK$ 18,000                                  │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 📝 備註                                              │   │
│  │ 包括跳繩訓練、花式教學、比賽準備...                  │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 📜 狀態變更歷史                                      │   │
│  │ ──────────────────────────────────────────────────  │   │
│  │ 🟢 2024-11-15 14:30  已接受                          │   │
│  │    回應渠道：電話確認                                 │   │
│  │    備註：王老師確認接受報價                          │   │
│  │                                                      │   │
│  │ 🔵 2024-11-12 10:00  已發送                          │   │
│  │    發送方式：電郵                                    │   │
│  │                                                      │   │
│  │ ⚪ 2024-11-10 16:00  草稿建立                        │   │
│  │    建立者：Admin User                                │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 🎯 操作                                              │   │
│  │                                                      │   │
│  │ 狀態：已接受                                         │   │
│  │ [ 🔄 轉換為課程 ]                                   │   │
│  │                                                      │   │
│  │ 其他操作：                                           │   │
│  │ [ 📄 下載 PDF ] [ 📧 重新發送 ] [ 📋 複製報價 ]     │   │
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
| `Modal`   | `components/ui/modal/`          | 確認彈窗 |
| `Tooltip` | `components/ui/tooltip/`        | 提示訊息 |

### 需開發組件

| 組件                   | 說明           |
| ---------------------- | -------------- |
| `QuotationStatusBadge` | 報價狀態標籤   |
| `QuotationInfoCard`    | 報價資訊卡片   |
| `QuotationItemCard`    | 報價項目卡片   |
| `StatusTimeline`       | 狀態變更時間線 |

---

## 📊 資料結構

### 報價詳情資料

```typescript
interface QuotationDetail {
  id: string;
  quotationNumber: string;
  status: QuotationStatus;

  // 日期
  inquiryDate: Date | null;
  quotationDate: Date;
  sentDate: Date | null;
  respondedDate: Date | null;
  validUntil: Date | null;

  // 查詢資料
  desiredStartDate: Date | null;
  estimatedStudentCount: number | null;
  desiredSchedule: string | null;
  inquiryNotes: string | null;

  // 報價資料
  totalAmount: number | null;
  notes: string | null;

  // 回應資料
  responseChannel: string | null;
  rejectionReason: string | null;

  // 學校資料
  school: {
    id: string;
    schoolName: string;
    schoolNameEnglish: string | null;
    address: string | null;
    phone: string | null;
    email: string | null;
  };

  // 聯絡人資料
  contacts: Array<{
    id: string;
    nameChinese: string;
    nameEnglish: string | null;
    position: string | null;
    mobile: string | null;
    email: string | null;
    isPrimary: boolean;
  }>;

  // 報價項目
  items: Array<{
    id: string;
    courseName: string;
    courseType: CourseType;
    chargingModel: ChargingModel;
    unitPrice: number;
    quantity: number;
    totalPrice: number;

    // 課程安排
    weeklyLessons: number | null;
    lessonDuration: number | null;
    estimatedStudents: number | null;
    requiredTutors: number | null;

    notes: string | null;
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
// API: GET /api/quotations/[id]
async function getQuotationDetail(id: string, session: Session) {
  // 權限檢查
  const canView = await checkPermission(session, "quotation:read");
  if (!canView) throw new Error("Unauthorized");

  const quotation = await prisma.schoolQuotation.findUnique({
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
      items: {
        where: { deletedAt: null },
        orderBy: { createdAt: "asc" },
      },
      contacts: {
        where: { deletedAt: null },
        orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
      },
      createdByUser: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!quotation) throw new Error("Quotation not found");

  // SCHOOL_ADMIN 只能查看自己學校
  if (session.user.role === "SCHOOL_ADMIN") {
    if (quotation.school.id !== session.user.schoolId) {
      throw new Error("Forbidden");
    }
  }

  return quotation;
}
```

---

## 🔄 狀態變更邏輯

### 狀態流轉

```
DRAFT（草稿）
    ↓ [發送報價]
SENT（已發送）
    ↓
    ├─ [標記接受] → ACCEPTED（已接受）→ 可轉換為課程
    ├─ [標記拒絕] → REJECTED（已拒絕）
    └─ [過期] → EXPIRED（已過期）
```

### 1. 發送報價

```typescript
// API: POST /api/quotations/[id]/send
async function sendQuotation(
  id: string,
  data: {
    method: "email" | "whatsapp" | "download";
    recipients?: string[]; // 電郵地址
  }
) {
  const quotation = await prisma.schoolQuotation.update({
    where: { id },
    data: {
      status: "SENT",
      sentDate: new Date(),
    },
  });

  // 發送電郵/WhatsApp
  if (data.method === "email") {
    await sendQuotationEmail(quotation, data.recipients);
  }

  // 生成 PDF
  const pdfUrl = await generateQuotationPDF(quotation);

  return { quotation, pdfUrl };
}
```

### 2. 標記接受

```typescript
// API: POST /api/quotations/[id]/accept
async function acceptQuotation(
  id: string,
  data: {
    respondedDate: Date;
    responseChannel: string; // 電話/電郵/會議
    notes?: string;
  }
) {
  // 更新報價狀態
  const quotation = await prisma.schoolQuotation.update({
    where: { id },
    data: {
      status: "ACCEPTED",
      respondedDate: data.respondedDate,
      responseChannel: data.responseChannel,
    },
  });

  // 更新學校合作狀態
  await prisma.school.update({
    where: { id: quotation.schoolId },
    data: {
      partnershipStatus: "CONFIRMED",
      partnershipStartDate: data.respondedDate,
      confirmationChannel: data.responseChannel,
    },
  });

  return quotation;
}
```

### 3. 標記拒絕

```typescript
// API: POST /api/quotations/[id]/reject
async function rejectQuotation(
  id: string,
  data: {
    respondedDate: Date;
    rejectionReason: string;
  }
) {
  const quotation = await prisma.schoolQuotation.update({
    where: { id },
    data: {
      status: "REJECTED",
      respondedDate: data.respondedDate,
      rejectionReason: data.rejectionReason,
    },
  });

  return quotation;
}
```

---

## 📝 編輯功能

### 可編輯欄位（僅草稿狀態）

```typescript
interface EditableQuotation {
  // 查詢資料
  inquiryDate?: Date;
  desiredStartDate?: Date;
  estimatedStudentCount?: number;
  desiredSchedule?: string;
  inquiryNotes?: string;

  // 報價資料
  quotationDate: Date;
  validUntil?: Date;
  notes?: string;

  // 報價項目
  items: Array<{
    id?: string; // 有 id = 更新，無 id = 新增
    courseName: string;
    courseType: CourseType;
    chargingModel: ChargingModel;
    unitPrice: number;
    quantity: number;
    weeklyLessons?: number;
    lessonDuration?: number;
    estimatedStudents?: number;
    requiredTutors?: number;
    notes?: string;
  }>;
}
```

### API 更新

```typescript
// API: PUT /api/quotations/[id]
async function updateQuotation(id: string, data: EditableQuotation) {
  // 只能編輯草稿
  const existing = await prisma.schoolQuotation.findUnique({
    where: { id },
  });

  if (existing.status !== "DRAFT") {
    throw new Error("只能編輯草稿狀態的報價");
  }

  // 更新報價
  const quotation = await prisma.schoolQuotation.update({
    where: { id },
    data: {
      inquiryDate: data.inquiryDate,
      desiredStartDate: data.desiredStartDate,
      estimatedStudentCount: data.estimatedStudentCount,
      desiredSchedule: data.desiredSchedule,
      inquiryNotes: data.inquiryNotes,
      quotationDate: data.quotationDate,
      validUntil: data.validUntil,
      notes: data.notes,
    },
  });

  // 更新項目（刪除舊的，建立新的）
  await prisma.schoolQuotationItem.deleteMany({
    where: { quotationId: id },
  });

  await prisma.schoolQuotationItem.createMany({
    data: data.items.map((item) => ({
      quotationId: id,
      ...item,
      totalPrice: item.unitPrice * item.quantity,
    })),
  });

  // 重新計算總金額
  const totalAmount = data.items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  await prisma.schoolQuotation.update({
    where: { id },
    data: { totalAmount },
  });

  return quotation;
}
```

---

## 🔐 權限控制

### 按鈕顯示邏輯

```typescript
function getAvailableActions(quotation: QuotationDetail, userRole: UserRole) {
  const actions = {
    edit: false,
    delete: false,
    send: false,
    accept: false,
    reject: false,
    convert: false,
    download: true, // 所有人都可下載
    resend: false,
    duplicate: false,
  };

  // 只有 ADMIN 可操作
  if (userRole !== "ADMIN") {
    return actions;
  }

  switch (quotation.status) {
    case "DRAFT":
      actions.edit = true;
      actions.delete = true;
      actions.send = true;
      actions.duplicate = true;
      break;

    case "SENT":
      actions.accept = true;
      actions.reject = true;
      actions.resend = true;
      actions.duplicate = true;
      break;

    case "ACCEPTED":
      actions.convert = true;
      actions.duplicate = true;
      break;

    case "REJECTED":
    case "EXPIRED":
      actions.duplicate = true;
      break;
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
  ACCEPTED: {
    color: "green",
    icon: "✅",
    label: "已接受",
  },
  REJECTED: {
    color: "red",
    icon: "❌",
    label: "已拒絕",
  },
  EXPIRED: {
    color: "orange",
    icon: "⏰",
    label: "已過期",
  },
};
```

### 2. 金額格式化

```typescript
function formatCurrency(amount: number): string {
  return `HK$ ${amount.toLocaleString("en-HK")}`;
}

// 範例：12000 → "HK$ 12,000"
```

### 3. 日期顯示

```typescript
function formatDate(date: Date | null): string {
  if (!date) return "-";
  return date.toLocaleDateString("zh-HK", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

// 範例：2024-11-10 → "2024/11/10"
```

### 4. 報價過期提示

```typescript
function checkExpired(quotation: QuotationDetail): boolean {
  if (!quotation.validUntil) return false;
  if (quotation.status !== "SENT") return false;

  const now = new Date();
  const expired = now > quotation.validUntil;

  if (expired) {
    // 自動更新狀態為 EXPIRED
    updateQuotationStatus(quotation.id, "EXPIRED");
  }

  return expired;
}
```

### 5. 轉換為課程提示

已接受的報價在頂部顯示醒目提示：

```
┌────────────────────────────────────────────┐
│ ✅ 此報價已被接受                          │
│ 請點擊「轉換為課程」建立正式課程記錄。     │
│ [ 🔄 轉換為課程 ]                         │
└────────────────────────────────────────────┘
```

---

## 📥 PDF 生成

### PDF 內容結構

```
┌─────────────────────────────────────┐
│         香港跳繩學院                │
│         QUOTATION                   │
│                                     │
│  報價編號：Q2024-003                │
│  日期：2024-11-10                   │
│  有效期至：2024-12-12               │
├─────────────────────────────────────┤
│  致：聖保羅小學                     │
│     王老師（體育科主任）            │
├─────────────────────────────────────┤
│  報價項目：                         │
│  1. 跳繩恆常班（上學期）            │
│     數量：12 堂                     │
│     單價：HK$ 50 x 20 人           │
│     小計：HK$ 12,000               │
├─────────────────────────────────────┤
│  總計：HK$ 18,000                  │
├─────────────────────────────────────┤
│  備註：...                         │
└─────────────────────────────────────┘
```

### 實作參考

```typescript
import { jsPDF } from "jspdf";

async function generateQuotationPDF(quotation: QuotationDetail) {
  const doc = new jsPDF();

  // 標題
  doc.setFontSize(20);
  doc.text("香港跳繩學院", 105, 20, { align: "center" });
  doc.setFontSize(16);
  doc.text("QUOTATION", 105, 30, { align: "center" });

  // 報價資訊
  doc.setFontSize(12);
  doc.text(`報價編號：${quotation.quotationNumber}`, 20, 45);
  doc.text(`日期：${formatDate(quotation.quotationDate)}`, 20, 52);

  // 學校資訊
  doc.text(`致：${quotation.school.schoolName}`, 20, 65);

  // 報價項目
  let y = 80;
  quotation.items.forEach((item, index) => {
    doc.text(`${index + 1}. ${item.courseName}`, 20, y);
    doc.text(`   HK$ ${item.totalPrice.toLocaleString()}`, 20, y + 7);
    y += 15;
  });

  // 總計
  doc.text(`總計：HK$ ${quotation.totalAmount.toLocaleString()}`, 20, y + 10);

  // 儲存
  const filename = `Quotation_${quotation.quotationNumber}.pdf`;
  doc.save(filename);

  return filename;
}
```

---

## 🧪 測試案例

### 1. 查看權限測試

```typescript
// ADMIN 可查看所有報價
// SCHOOL_ADMIN 只能查看自己學校
// 其他角色無權限
```

### 2. 狀態變更測試

```typescript
// 草稿 → 發送 → 接受 → 轉換
// 草稿 → 發送 → 拒絕
// 發送 → 過期（自動）
```

### 3. 編輯限制測試

```typescript
// 只有草稿可編輯
// 其他狀態顯示「無法編輯」提示
```

---

## 📌 開發注意事項

1. **即時狀態更新**：頁面載入時檢查 `validUntil`，自動更新過期狀態
2. **權限按鈕**：根據用戶角色和報價狀態動態顯示操作按鈕
3. **金額驗證**：報價項目的 `totalPrice` 應等於 `unitPrice * quantity`
4. **聯絡人顯示**：優先顯示 `isPrimary = true` 的聯絡人
5. **轉換提示**：已接受的報價顯示醒目的轉換按鈕
6. **PDF 下載**：支援離線下載和電郵發送
7. **複製報價**：點擊「複製報價」建立新草稿，自動填入相同內容
8. **刪除保護**：已發送/已接受的報價不可刪除，只能 Soft Delete

---

## 🔗 相關頁面

- **上一步**：[報價列表](./QUOTATIONS.md)
- **下一步**：[轉換為課程](./QUOTATIONS_CONVERT.md)
- **相關**：[新增報價](./QUOTATIONS_NEW.md)
