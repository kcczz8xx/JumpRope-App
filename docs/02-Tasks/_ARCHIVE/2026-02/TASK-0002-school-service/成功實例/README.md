# 新增課程功能 - 完整開發指南

## 📚 文檔導航

本開發指南提供了「新增課程」功能的完整實作細節，適合作為未來開發類似多步驟表單功能的參考。

### 核心文檔

1. **[01\_總覽.md](./01_總覽.md)**

   - 功能簡介與核心特點
   - 技術架構圖
   - 資料流說明
   - 快速開始指南

2. **[02\_頁面與路由.md](./02_頁面與路由.md)**

   - 路由結構與群組說明
   - 頁面元件實作
   - 設計決策
   - 頁面生命週期

3. **[03\_類型定義.md](./03_類型定義.md)**
   - 核心類型定義
   - 列舉類型
   - 工具函式
   - 類型與 Prisma Schema 對應

### 前端實作

4. **[04*表單元件*主表單.md](./04_表單元件_主表單.md)**

   - NewCourseForm 元件
   - 狀態管理
   - 驗證邏輯
   - 表單提交

5. **[05*表單元件*步驟元件.md](./05_表單元件_步驟元件.md)**
   - SchoolFormStep - 學校資料步驟
   - CoursesFormStep - 課程資料步驟
   - SummaryFormStep - 總結步驟
   - 共用元件

### 後端實作

6. **[06_API_Route.md](./06_API_Route.md)**

   - API 端點設計
   - 請求/回應格式
   - 核心邏輯詳解
   - 資料類型轉換

7. **[07\_資料庫操作.md](./07_資料庫操作.md)**
   - Prisma 配置
   - 資料庫 Schema
   - Transaction 操作
   - 效能優化

### 品質保證

8. **[08\_錯誤處理與使用者體驗.md](./08_錯誤處理與使用者體驗.md)**

   - 錯誤處理策略
   - 使用者體驗優化
   - 日誌記錄
   - 無障礙設計

9. **[09\_最佳實踐.md](./09_最佳實踐.md)**
   - 核心設計決策
   - 效能優化
   - 程式碼組織
   - 測試建議

## 🚀 快速開始

### 1. 閱讀順序建議

**初學者：**

```
01_總覽 → 02_頁面與路由 → 03_類型定義 → 09_最佳實踐
```

**前端開發者：**

```
01_總覽 → 04_表單元件_主表單 → 05_表單元件_步驟元件 → 08_錯誤處理
```

**後端開發者：**

```
01_總覽 → 06_API_Route → 07_資料庫操作 → 09_最佳實踐
```

**全端開發者：**

```
依序閱讀所有文檔
```

### 2. 實作步驟

1. **了解需求** - 閱讀 `01_總覽.md`
2. **設計類型** - 參考 `03_類型定義.md`
3. **建立 Schema** - 參考 `07_資料庫操作.md`
4. **實作前端** - 參考 `04_表單元件_主表單.md` 和 `05_表單元件_步驟元件.md`
5. **實作後端** - 參考 `06_API_Route.md`
6. **錯誤處理** - 參考 `08_錯誤處理與使用者體驗.md`
7. **優化與測試** - 參考 `09_最佳實踐.md`

## 📊 功能概覽

### 核心功能

- ✅ 多步驟表單（學校資料 → 課程資料 → 總結確認）
- ✅ 支援新增/更新學校
- ✅ 一次建立多個課程
- ✅ 6 種收費模式組合
- ✅ 完整的資料驗證
- ✅ Prisma Transaction 確保資料一致性

### 技術棧

- **前端框架**：Next.js 15 (App Router)
- **語言**：TypeScript
- **樣式**：Tailwind CSS
- **資料庫**：PostgreSQL (Neon)
- **ORM**：Prisma 7.x
- **狀態管理**：React useState + useCallback

## 🎯 關鍵檔案

### 前端

```
app/(private)/dashboard/school/courses/new/page.tsx
components/feature/school-service/course/
├── NewCourseForm.tsx
├── SchoolFormStep.tsx
├── CoursesFormStep.tsx
├── SummaryFormStep.tsx
└── index.ts
components/feature/school-service/types/course.ts
```

### 後端

```
app/api/school-service/courses/batch-with-school/route.ts
lib/prisma.ts
prisma/schema/school.prisma
```

## 💡 核心概念

### 1. 多步驟表單

將複雜表單拆分為三個步驟，降低使用者認知負擔，提升完成率。

### 2. 狀態管理

使用 React Hooks 管理表單狀態，`useCallback` 優化效能。

### 3. 資料驗證

多層次驗證：即時驗證 → 步驟驗證 → 提交驗證 → 後端驗證。

### 4. Transaction 處理

使用 Prisma Transaction 確保學校、聯絡人、課程資料的原子性操作。

### 5. 錯誤處理

完善的錯誤處理機制，提供友善的錯誤訊息和恢復策略。

## 🔧 開發環境設定

### 1. 安裝依賴

```bash
pnpm install
```

### 2. 環境變量

```bash
# .env
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. 資料庫設定

```bash
pnpm prisma migrate dev
pnpm prisma generate
```

### 4. 啟動開發伺服器

```bash
pnpm dev
```

## 📝 使用範例

### 訪問頁面

```
http://localhost:3000/dashboard/school/courses/new
```

### API 請求

```bash
curl -X POST http://localhost:3000/api/school-service/courses/batch-with-school \
  -H "Content-Type: application/json" \
  -d '{
    "school": { ... },
    "contact": { ... },
    "academicYear": "2026-2027",
    "courses": [ ... ]
  }'
```

## 🧪 測試

### 使用測試數據

每個步驟都提供「🧪 填充測試數據」按鈕，方便快速測試。

### 測試場景

1. **新增學校 + 課程** - 不選擇現有學校
2. **更新學校 + 新增課程** - 選擇現有學校
3. **多個課程** - 新增多個課程測試
4. **不同收費模式** - 測試各種收費模式組合
5. **驗證錯誤** - 測試各種驗證場景

## 🐛 常見問題

### 1. 資料庫連接錯誤

**問題：** `DATABASE_URL environment variable is not set`

**解決：**

- 檢查 `.env` 文件是否存在
- 確認 `DATABASE_URL` 已設定
- 重啟開發伺服器

### 2. Prisma Client 錯誤

**問題：** `chargingModel` 欄位類型錯誤

**解決：**

```bash
pnpm prisma generate
```

### 3. 表單提交失敗

**問題：** Transaction 超時

**解決：**

- 檢查資料庫連線
- 檢查 Neon adapter 配置
- 確認 `bufferutil` 已安裝

## 📖 延伸閱讀

### 官方文檔

- [Next.js App Router](https://nextjs.org/docs/app)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Neon Serverless Driver](https://neon.tech/docs/serverless/serverless-driver)
- [Tailwind CSS](https://tailwindcss.com/docs)

### 相關文檔

- [學校服務業務流程](../BUSINESS_FLOW.md)
- [元件文檔](../COMPONENTS.md)
- [資料庫設計](../DATABASE_DESIGN.md)

## 🤝 貢獻

如發現文檔錯誤或有改進建議，歡迎提出。

## 📄 授權

本文檔為內部開發指南，僅供團隊成員參考使用。

---

**最後更新：** 2026-01-31  
**版本：** 1.0.0  
**維護者：** 開發團隊
