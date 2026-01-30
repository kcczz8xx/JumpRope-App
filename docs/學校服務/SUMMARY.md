# 📋 學校服務系統 - 文檔完成總結

> **專案**: 香港跳繩學院到校服務系統  
> **版本**: MVP v1.0  
> **完成日期**: 2026-01-30  
> **文檔狀態**: ✅ 已完成

---

## 🎯 專案概述

本次工作完成了香港跳繩學院到校服務系統的完整開發文檔，涵蓋 **15 個頁面**的詳細設計規格，包括業務流程、資料模型、權限設計和組件對應表。

---

## 📊 完成統計

### 文檔數量

| 類型     | 數量      | 狀態   |
| -------- | --------- | ------ |
| 核心文檔 | 4 份      | ✅     |
| 頁面文檔 | 15 份     | ✅     |
| **總計** | **19 份** | **✅** |

### 頁面覆蓋率

```
核心頁面 (7/7)   ██████████ 100%
子頁面   (8/8)   ██████████ 100%
───────────────────────────────
總計     (15/15) ██████████ 100%
```

---

## 📁 文檔結構

```
docs/學校服務/
├── README.md                      # 📚 主文檔（目錄索引）
├── SUMMARY.md                     # 📋 本文檔（總結）
├── COMPONENTS.md                  # 🧩 組件對應表
├── DATA_MODELS.md                 # 📊 資料模型
├── BUSINESS_FLOW.md               # 🔄 業務流程
├── PERMISSIONS.md                 # 🔐 權限矩陣
└── pages/                         # 📄 頁面文檔
    ├── OVERVIEW.md                # 管理儀表板
    ├── MY_LESSONS.md              # 我的課堂
    ├── FINANCE.md                 # 財務儀表板
    ├── QUOTATIONS.md              # 報價列表
    ├── QUOTATIONS_NEW.md          # 新增報價
    ├── QUOTATIONS_DETAIL.md       # 報價詳情 ⭐
    ├── QUOTATIONS_CONVERT.md      # 轉換為課程
    ├── COURSES.md                 # 課程列表
    ├── COURSES_NEW.md             # 新增課程 ⭐
    ├── COURSES_DETAIL.md          # 課程詳情+排課
    ├── SCHEDULE.md                # 導師排班
    ├── INVOICES.md                # 發票列表
    ├── INVOICES_GENERATE.md       # 生成發票
    ├── INVOICES_DETAIL.md         # 發票詳情 ⭐
    └── INVOICES_PAYMENT.md        # 記錄收款 ⭐

⭐ = 本次新增的文檔
```

---

## 🆕 本次新增內容

### 1. 報價詳情 (`QUOTATIONS_DETAIL.md`)

**功能**：顯示報價完整資料，支援編輯、發送、接受/拒絕操作

**核心內容**：

- 📋 報價資料展示（學校、聯絡人、報價項目）
- 🔄 狀態變更邏輯（草稿 → 已發送 → 已接受/已拒絕）
- 📄 PDF 生成功能
- 📜 狀態變更歷史時間線
- 🔐 權限控制（ADMIN 可編輯，SCHOOL_ADMIN 唯讀）
- 🔄 轉換為課程功能（已接受的報價）

**關鍵 API**：

- `GET /api/quotations/[id]` - 查詢報價詳情
- `POST /api/quotations/[id]/send` - 發送報價
- `POST /api/quotations/[id]/accept` - 標記接受
- `POST /api/quotations/[id]/reject` - 標記拒絕
- `PUT /api/quotations/[id]` - 更新報價（僅草稿）

---

### 2. 發票詳情 (`INVOICES_DETAIL.md`)

**功能**：顯示發票完整資料，支援催款、記錄收款操作

**核心內容**：

- 💳 發票資料展示（學校、收件人、發票項目）
- 📋 課堂明細摺疊展開
- ⏰ 自動逾期檢查和警告
- 💬 催款功能和電郵模板
- 📄 PDF 生成和下載
- 💵 收款記錄顯示
- 🔐 權限控制（ADMIN/FINANCE 可操作）

**關鍵 API**：

- `GET /api/invoices/[id]` - 查詢發票詳情
- `POST /api/invoices/[id]/send` - 發送發票
- `POST /api/invoices/[id]/remind` - 發送催款
- `PUT /api/invoices/[id]` - 更新發票（僅草稿）

**特色功能**：

- 自動計算逾期天數
- 課堂明細支援點擊查看
- 催款記錄追蹤

---

### 3. 記錄收款 (`INVOICES_PAYMENT.md`)

**功能**：記錄學校付款，支援全額/部分收款

**核心內容**：

- 💰 全額/部分收款表單
- 💳 多種付款方式（FPS、銀行轉帳、支票、現金、信用卡）
- 📸 付款憑證上傳（圖片/PDF）
- 🧾 自動生成收據編號（`REC-YYYY-MM-XXXXX`）
- 📊 即時計算待收款金額
- 🎯 動態欄位顯示（根據付款方式）
- ✅ 表單驗證（客戶端 + 伺服器端）

**關鍵 API**：

- `POST /api/invoices/[id]/payment` - 記錄收款
- 自動更新發票狀態（SENT → PARTIAL/PAID）
- 自動更新課堂付款狀態

**收據編號生成規則**：

```
格式：REC-YYYY-MM-XXXXX
範例：REC-2024-10-00001
```

**付款方式對應欄位**：

- FPS：交易編號
- 銀行轉帳：銀行名稱、帳戶號碼、交易編號
- 支票：支票號碼、支票銀行、支票日期
- 現金：無額外欄位
- 信用卡：交易編號

---

### 4. 新增課程 (`COURSES_NEW.md`)

**功能**：手動建立課程（不經報價流程）

**核心內容**：

- 📝 多步驟表單（基本資料 → 收費設定 → 預覽確認）
- 🏫 學校選擇器
- 📅 學年學期設定
- 💰 5 種收費模式
  1. 學生每節課堂收費
  2. 固定每節課堂收費
  3. 學生每個月收費
  4. 固定每個月收費
  5. 整個課程固定收費
- 💵 導師薪資計算（每堂/每月/整個課程）
- 📊 預計收入/成本/利潤計算
- 🎨 動態欄位顯示

**關鍵 API**：

- `POST /api/courses` - 建立課程

**收費模式說明**：

```
學生每節課堂：20人 x $50 x 12堂 = $12,000
固定每節課堂：$800 x 12堂 = $9,600
學生每個月：20人 x $200 x 4月 = $16,000
固定每個月：$3,000 x 4月 = $12,000
整個課程：$10,000（固定）
```

---

## 📚 核心文檔

### 1. COMPONENTS.md - 組件對應表

**內容**：

- 🎨 TailAdmin 現有組件清單（UI、表單、表格、卡片、日曆等）
- 🆕 需開發的業務組件清單（SchoolSelector、CourseCard、LessonCard 等）
- 📋 組件使用範例和屬性定義

**關鍵組件**：

- `Modal`, `Badge`, `Button`, `Table`, `Card`
- `SchoolSelector`, `QuotationStatusBadge`, `CourseCard`
- `InvoiceStatusBadge`, `PaymentRecordCard`

---

### 2. DATA_MODELS.md - 資料模型

**內容**：

- 📊 10 個核心資料表的 Prisma Schema
- 🔗 ER 關係圖
- 📝 欄位說明和驗證規則
- 🔐 Enum 定義（狀態、類型等）

**核心資料表**：

```
School → SchoolContact
       → SchoolQuotation → SchoolQuotationItem
       → SchoolCourse → SchoolLesson → SchoolTutorLesson
       → SchoolInvoice → SchoolInvoiceCourse
                      → SchoolReceipt
```

---

### 3. BUSINESS_FLOW.md - 業務流程

**內容**：

- 🔄 7 個業務階段的完整流程
- 📊 每階段的操作步驟
- 💾 資料表變化（SQL 範例）
- 🎯 頁面對應關係

**7 個業務階段**：

```
1. 查詢接洽 → quotations/new
2. 報價提案 → quotations/[id]
3. 確認合作 → quotations/[id]
4. 建立課程 → quotations/[id]/convert
5. 執行課堂 → courses/[id] + my-lessons
6. 開立發票 → invoices/generate
7. 收款記錄 → invoices/[id]/payment
```

---

### 4. PERMISSIONS.md - 權限矩陣

**內容**：

- 👥 4 種用戶角色定義
- 🔐 完整的頁面權限矩陣（15x4）
- 🚪 入口分流邏輯
- 🛡️ API 權限檢查範例

**角色**：

- ADMIN（管理員）：全系統權限
- SCHOOL_ADMIN（學校負責人）：唯讀自己學校
- TUTOR（導師）：簽到/簽退、查看任教課程
- FINANCE（財務）：發票/收款管理

---

## 🎯 頁面文檔特色

每個頁面文檔都包含以下標準章節：

### 📋 基本資訊

- 路徑（URL）
- 優先級（P0/P1）
- 角色權限

### 🎨 設計規格

- 頁面結構（ASCII 圖）
- 使用組件清單
- UX 重點

### 📊 技術規格

- 資料結構（TypeScript Interface）
- API 定義
- 查詢邏輯（SQL 範例）

### 🔄 業務邏輯

- 狀態流轉
- 驗證規則
- 計算公式

### 🧪 測試指引

- 測試案例
- 邊界條件
- 錯誤處理

### 📌 開發注意事項

- 關鍵提醒
- 最佳實踐
- 相關頁面連結

---

## 🔍 文檔使用指南

### 開發者

1. **初次接觸**：先閱讀 `README.md` 了解整體架構
2. **資料庫設計**：參考 `DATA_MODELS.md` 建立 Prisma Schema
3. **開發單頁**：閱讀對應的頁面文檔（如 `COURSES.md`）
4. **查詢組件**：參考 `COMPONENTS.md` 尋找可用組件
5. **權限設計**：依照 `PERMISSIONS.md` 實作權限檢查

### 產品經理

1. **了解流程**：閱讀 `BUSINESS_FLOW.md`
2. **查看頁面**：瀏覽 `pages/` 目錄下的頁面文檔
3. **驗收標準**：每個頁面文檔的「功能」和「UX 重點」章節

### UI/UX 設計師

1. **頁面結構**：參考頁面文檔的 ASCII 圖
2. **組件清單**：參考 `COMPONENTS.md`
3. **狀態設計**：參考各頁面的「狀態視覺化」章節

---

## 📈 開發建議順序

根據業務流程和依賴關係，建議的開發順序：

### Phase 1 - 資料層 (Week 1)

1. ✅ 建立 Prisma Schema（參考 `DATA_MODELS.md`）
2. ✅ 執行資料庫 Migration
3. ✅ 建立基礎 API 端點

### Phase 2 - 報價模組 (Week 2-3)

4. ✅ 新增報價 (`QUOTATIONS_NEW.md`)
5. ✅ 報價列表 (`QUOTATIONS.md`)
6. ✅ 報價詳情 (`QUOTATIONS_DETAIL.md`)
7. ✅ 轉換為課程 (`QUOTATIONS_CONVERT.md`)

### Phase 3 - 課程模組 (Week 4-5)

8. ✅ 課程列表 (`COURSES.md`)
9. ✅ 新增課程 (`COURSES_NEW.md`)
10. ✅ 課程詳情+排課 (`COURSES_DETAIL.md`)
11. ✅ 我的課堂 (`MY_LESSONS.md`)

### Phase 4 - 財務模組 (Week 6-7)

12. ✅ 生成發票 (`INVOICES_GENERATE.md`)
13. ✅ 發票列表 (`INVOICES.md`)
14. ✅ 發票詳情 (`INVOICES_DETAIL.md`)
15. ✅ 記錄收款 (`INVOICES_PAYMENT.md`)

### Phase 5 - 儀表板與排班 (Week 8)

16. ✅ 管理儀表板 (`OVERVIEW.md`)
17. ✅ 財務儀表板 (`FINANCE.md`)
18. ✅ 導師排班 (`SCHEDULE.md`)

---

## 🎨 設計系統

### 顏色編碼（狀態）

```typescript
const statusColors = {
  // 報價狀態
  DRAFT: "gray", // 草稿
  SENT: "blue", // 已發送
  ACCEPTED: "green", // 已接受
  REJECTED: "red", // 已拒絕
  EXPIRED: "orange", // 已過期

  // 課程狀態
  ACTIVE: "green", // 活躍
  COMPLETED: "gray", // 已完成
  CANCELLED: "red", // 已取消

  // 發票狀態
  OVERDUE: "red", // 已逾期
  PARTIAL: "orange", // 部分付款
  PAID: "green", // 已付款
};
```

### 字型大小

- 頁面標題：24px+
- 卡片標題：18px
- 正文：14-16px
- 小字備註：12px

### 間距規範

- 卡片間距：16-24px
- 內容間距：8-16px
- 區塊間距：24-32px

---

## 🔒 安全性考量

### 1. 權限檢查

每個 API 端點都需要權限驗證：

```typescript
// 範例
const canView = await checkPermission(session, "quotation:read");
if (!canView) throw new Error("Unauthorized");
```

### 2. 資料過濾

根據用戶角色過濾資料：

```typescript
// SCHOOL_ADMIN 只能查看自己學校
if (session.user.role === "SCHOOL_ADMIN") {
  where.schoolId = session.user.schoolId;
}
```

### 3. Soft Delete

所有資料採用軟刪除（`deletedAt` 欄位），不做物理刪除。

### 4. 輸入驗證

使用 Zod 進行表單驗證，防止 SQL Injection 和 XSS。

---

## 🧪 測試建議

### 單元測試

- 每個 API 端點的 CRUD 操作
- 資料驗證邏輯
- 計算函數（金額、日期等）

### 整合測試

- 完整業務流程（查詢 → 報價 → 課程 → 發票 → 收款）
- 權限檢查
- 資料一致性

### E2E 測試

- 使用 Playwright 測試關鍵流程
- 測試不同角色的操作權限
- 測試響應式佈局（手機/平板/桌面）

---

## 📊 資料庫索引建議

為提升查詢效能，建議建立以下索引：

```sql
-- 學校
CREATE INDEX idx_schools_partnership_status ON schools(partnership_status);
CREATE INDEX idx_schools_deleted_at ON schools(deleted_at);

-- 報價
CREATE INDEX idx_quotations_school_id ON school_quotations(school_id);
CREATE INDEX idx_quotations_status ON school_quotations(status);
CREATE INDEX idx_quotations_deleted_at ON school_quotations(deleted_at);

-- 課程
CREATE INDEX idx_courses_school_id ON school_courses(school_id);
CREATE INDEX idx_courses_status ON school_courses(status);
CREATE INDEX idx_courses_academic_year ON school_courses(academic_year);

-- 課堂
CREATE INDEX idx_lessons_course_id ON school_lessons(course_id);
CREATE INDEX idx_lessons_lesson_date ON school_lessons(lesson_date);
CREATE INDEX idx_lessons_lesson_status ON school_lessons(lesson_status);

-- 導師任教
CREATE INDEX idx_tutor_lessons_user_id ON school_tutor_lessons(user_id);
CREATE INDEX idx_tutor_lessons_lesson_date ON school_tutor_lessons(lesson_date);

-- 發票
CREATE INDEX idx_invoices_school_id ON school_invoices(school_id);
CREATE INDEX idx_invoices_status ON school_invoices(status);
CREATE INDEX idx_invoices_due_date ON school_invoices(due_date);
```

---

## 🚀 部署檢查清單

在部署到生產環境前，請確認：

- [ ] 所有 Prisma Migration 已執行
- [ ] 環境變數已設定（資料庫、儲存空間、電郵服務）
- [ ] 權限檢查中介軟體已啟用
- [ ] API Rate Limiting 已設定
- [ ] 錯誤監控已整合（Sentry 等）
- [ ] 備份策略已建立
- [ ] SSL 憑證已安裝
- [ ] CORS 設定已確認

---

## 📞 技術支援

如對文檔有任何疑問，請參考：

1. **README.md** - 快速索引
2. **BUSINESS_FLOW.md** - 業務流程
3. **對應的頁面文檔** - 詳細規格

---

## ✅ 下一步行動

### 立即可做

1. ✅ 閱讀 `README.md` 了解整體架構
2. ✅ 根據 `DATA_MODELS.md` 建立資料庫
3. ✅ 選擇優先級 P0 的頁面開始開發

### 未來擴展

以下功能可在 MVP 完成後考慮：

- 📊 進階報表和圖表
- 📧 自動化電郵提醒
- 📱 手機 App（React Native）
- 🔔 即時通知（WebSocket）
- 📸 課堂相簿功能
- 💬 內部通訊系統
- 📈 數據分析儀表板
- 🔄 與會計系統整合

---

## 🎉 總結

本次文檔工作已完整覆蓋學校服務系統的所有核心功能，包括：

✅ **4 份核心文檔** - 組件、資料、流程、權限  
✅ **15 份頁面文檔** - 涵蓋所有頁面的詳細規格  
✅ **完整的業務流程** - 從查詢到收款的 7 個階段  
✅ **權限設計** - 4 種角色的完整權限矩陣  
✅ **技術規格** - API、資料結構、驗證規則

所有文檔均採用統一格式，包含頁面結構、資料定義、業務邏輯、測試案例和開發注意事項，可直接作為開發參考。

---

**文檔版本**: v1.0  
**完成日期**: 2026-01-30  
**總頁數**: 19 份文檔  
**狀態**: ✅ 已完成

---

_如需修改或補充文檔內容，請參考對應的 `.md` 文件進行更新。_
