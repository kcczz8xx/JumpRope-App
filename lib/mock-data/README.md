# 🎭 模擬數據系統

> 快速開關的模擬數據系統，用於開發和測試

## 📋 功能說明

本系統提供可快速切換的模擬數據，包含：

- ✅ 3 所學校（不同合作狀態）
- ✅ 3 份報價單（草稿、已發送、已接受）
- ✅ 3 個課程（活躍、已排程）
- ✅ 16 堂課（部分已完成、已開票、已付款）
- ✅ 3 張發票（已付款、已發送、逾期）
- ✅ 1 張收據

## 🚀 快速開始

### 1. 啟用模擬數據

在 `.env.local` 文件中添加：

```bash
NEXT_PUBLIC_MOCK_DATA=true
```

### 2. 種子數據到數據庫

```bash
# 使用 tsx 直接運行
pnpm tsx scripts/seed-mock-data.ts

# 或添加到 package.json scripts
pnpm run seed:mock
```

### 3. 清除模擬數據

```bash
# 關閉模擬數據功能
NEXT_PUBLIC_MOCK_DATA=false
```

## 📦 數據結構

### 學校數據

```typescript
- 香港第一小學 (ACTIVE - 合作中)
  └─ 聯絡人: 陳大文 (體育科主任)

- 九龍第二中學 (CONFIRMED - 已確認)
  └─ 聯絡人: 李小明 (課外活動主任)

- 新界第三小學 (INQUIRY - 查詢中)
  └─ 聯絡人: 王美玲 (校長)
```

### 報價數據

```typescript
- Q2026-001 (香港第一小學) - ACCEPTED
  └─ 跳繩恆常班（上學期）- HK$12,000

- Q2026-002 (九龍第二中學) - SENT
  └─ 花式跳繩進階班 - HK$18,000

- Q2026-003 (新界第三小學) - DRAFT
  └─ 跳繩試堂體驗 - HK$2,400
```

### 課程數據

```typescript
- 課程 001 - 跳繩恆常班（上學期）[ACTIVE]
  └─ 16 堂課（12 堂已完成，4 堂待進行）

- 課程 002 - 跳繩恆常班（下學期）[SCHEDULED]
  └─ 待排課

- 課程 003 - 花式跳繩進階班 [SCHEDULED]
  └─ 口頭確認，無書面報價
```

### 發票數據

```typescript
- INV-2024-09-001 (已付款) - HK$4,000
  └─ 收據 REC-2024-09-001 (FPS 支付)

- INV-2024-11-002 (已發送) - HK$4,000
  └─ 待收款

- INV-2025-01-003 (已逾期) - HK$4,000
  └─ 逾期未付
```

## 🔧 使用方式

### 方式 1：環境變量控制（推薦）

在應用啟動時自動加載模擬數據（如果啟用）：

```typescript
// app/layout.tsx 或 app/api/route.ts
import { isMockDataEnabled } from "@/lib/mock-data";

if (isMockDataEnabled()) {
  console.log("📊 Mock data mode enabled");
}
```

### 方式 2：條件查詢

在查詢函數中使用模擬數據：

```typescript
import { getMockData } from "@/lib/mock-data";

export async function getSchools() {
  return getMockData(
    // 實際數據查詢
    () => prisma.school.findMany(),
    // 模擬數據（可選）
    mockSchools
  );
}
```

### 方式 3：手動種子

需要重置數據時：

```bash
pnpm tsx scripts/seed-mock-data.ts
```

## 📝 自定義模擬數據

### 添加新學校

編輯 `lib/mock-data/schools.ts`:

```typescript
const schools = [
  // 現有學校...
  {
    id: "school_new_1",
    schoolName: "新學校名稱",
    // ...其他欄位
  },
];
```

### 添加新課程

編輯 `lib/mock-data/courses.ts`:

```typescript
const courses = [
  // 現有課程...
  {
    id: "course_new_1",
    courseName: "新課程名稱",
    // ...其他欄位
  },
];
```

## ⚠️ 注意事項

1. **開發環境專用** - 不要在生產環境啟用模擬數據
2. **數據一致性** - 種子數據會清除現有數據，請謹慎使用
3. **ID 固定** - 模擬數據使用固定 ID，方便測試
4. **類型安全** - 所有模擬數據都有 TypeScript 類型檢查

## 🧪 測試場景

模擬數據涵蓋以下測試場景：

### 學校合作狀態

- ✅ INQUIRY - 查詢中
- ✅ CONFIRMED - 已確認合作
- ✅ ACTIVE - 合作中

### 報價流程

- ✅ DRAFT - 草稿
- ✅ SENT - 已發送
- ✅ ACCEPTED - 已接受

### 課程狀態

- ✅ SCHEDULED - 已排程
- ✅ ACTIVE - 進行中

### 課堂狀態

- ✅ COMPLETED - 已完成
- ✅ SCHEDULED - 已排程

### 發票狀態

- ✅ PAID - 已付款
- ✅ SENT - 已發送
- ✅ OVERDUE - 已逾期

### 特殊場景

- ✅ 無報價直接建立課程（口頭確認）
- ✅ 部分課堂已開票、已付款
- ✅ 逾期發票提醒

## 🔄 快速切換

開發時快速切換模擬數據：

```bash
# 啟用模擬數據
echo "NEXT_PUBLIC_MOCK_DATA=true" >> .env.local

# 關閉模擬數據
echo "NEXT_PUBLIC_MOCK_DATA=false" >> .env.local

# 重新種子
pnpm tsx scripts/seed-mock-data.ts
```

## 📊 數據統計

模擬數據包含：

- 3 所學校
- 3 位聯絡人
- 3 份報價單
- 4 個報價項目
- 3 個課程
- 16 堂課
- 3 張發票
- 1 張收據

**總計**: 約 33 條記錄，涵蓋所有主要業務流程
