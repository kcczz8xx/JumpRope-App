# 📊 管理儀表板 - 實現總結

> **路徑**: `/dashboard/school`  
> **實現日期**: 2026-01-30  
> **狀態**: ✅ 已完成

---

## 📁 檔案結構

```
app/(private)/dashboard/school/(overview)/
├── page.tsx                    # 主頁面
├── components/
│   ├── MetricCards.tsx         # 指標卡片組件
│   ├── ActivityTimeline.tsx    # 動態時間線組件
│   └── QuickActions.tsx        # 快速操作組件
└── lib/
    └── data.ts                 # 數據獲取層（含 mock 數據）
```

---

## 🧩 組件說明

### 1. MetricCards

顯示 4 個關鍵指標卡片：

| 指標       | 數據來源                     | 連結目標                                    |
| ---------- | ---------------------------- | ------------------------------------------- |
| 本月總收入 | `SchoolReceipt` 彙總         | `/dashboard/school/invoices?status=paid`    |
| 活躍課程   | `SchoolCourse` 計數          | `/dashboard/school/courses?status=active`   |
| 待發送報價 | `SchoolQuotation` DRAFT      | `/dashboard/school/quotations?status=draft` |
| 待收款金額 | `SchoolInvoice` SENT/OVERDUE | `/dashboard/school/invoices?status=pending` |

### 2. ActivityTimeline

顯示最近 7 天的動態，支援以下類型：

- `QUOTATION_ACCEPTED` - 報價被接受 🟢
- `QUOTATION_SENT` - 報價已發送 🔵
- `LESSON_COMPLETED` - 課堂已完成 ✅
- `INVOICE_PAID` - 發票已收款 🟡

### 3. QuickActions

根據角色顯示不同操作按鈕：

**ADMIN 角色**:

- 新增報價、新增課程、生成發票、導師排班

**SCHOOL_ADMIN 角色**:

- 查看報價、查看課程、查看發票、查看課堂

---

## 📦 依賴

| 套件       | 版本  | 用途       |
| ---------- | ----- | ---------- |
| `date-fns` | 4.1.0 | 時間格式化 |

---

## 🔧 配置選項

```typescript
// lib/data.ts
const USE_MOCK_DATA = process.env.USE_MOCK_DATA === "true" || true;
```

- `USE_MOCK_DATA = true`: 使用 mock 數據（開發模式）
- `USE_MOCK_DATA = false`: 使用真實 Prisma 查詢

---

## 📱 響應式設計

| 斷點               | 指標卡片 | 主內容區 |
| ------------------ | -------- | -------- |
| < 640px (mobile)   | 1 列     | 1 列     |
| 640px - 1024px     | 2 列     | 1 列     |
| > 1024px (desktop) | 4 列     | 2:1 比例 |

---

## ⚠️ 待辦事項

- [ ] 整合 NextAuth session 獲取用戶角色
- [ ] 執行 `npx prisma generate` 生成 Prisma Client
- [ ] 切換 `USE_MOCK_DATA = false` 使用真實數據
- [ ] 添加日期篩選功能
- [ ] 實現自動刷新（SWR）

---

## 📝 使用方式

1. 確保已安裝依賴：`pnpm install`
2. 啟動開發服務器：`pnpm dev`
3. 訪問：`http://localhost:3000/dashboard/school`
