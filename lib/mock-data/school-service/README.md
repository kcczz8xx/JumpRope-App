# 🎭 模擬數據系統

> 統一管理的模擬數據系統，用於開發和測試

## 📋 功能說明

本系統提供統一管理的模擬數據，包含：

- ✅ **15 所學校**（涵蓋所有合作狀態：ACTIVE, CONFIRMED, INQUIRY, SUSPENDED, TERMINATED）
- ✅ **12 個課程**（涵蓋所有狀態和類型：恆常班、興趣班、暑期班、校隊班、試堂等）
- ✅ **3 份報價單**（草稿、已發送、已接受）
- ✅ **16 堂課**（部分已完成、已開票、已付款）
- ✅ **3 張發票**（已付款、已發送、逾期）
- ✅ **1 張收據**

## 🎯 架構特點

### 統一數據源

所有模擬數據集中在 `lib/mock-data/school-service/` 管理：

```
lib/mock-data/school-service/
├── schools.ts      # 15 所學校數據
├── courses.ts      # 12 個課程數據 + getCoursesWithSchool() 方法
├── quotations.ts   # 3 份報價單數據
├── lessons.ts      # 16 堂課數據
├── invoices.ts     # 3 張發票 + 1 張收據數據
├── index.ts        # 統一導出和 seed 函數
└── README.md       # 本文檔
```

### 頁面引用方式

頁面的 `data.ts` 不再重複定義模擬數據，而是直接引用：

```typescript
// ❌ 舊方式：在 data.ts 中硬編碼模擬數據
function getMockCourses() {
  return [
    /* 重複的數據 */
  ];
}

// ✅ 新方式：引用統一的模擬數據
import { courseMockData } from "@/lib/mock-data/school-service";

export async function getCourses() {
  return courseMockData.getCoursesWithSchool();
}
```

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

- **15 所學校**（涵蓋香港、九龍、新界各區知名學校）
- **15 位聯絡人**（每所學校一位主要聯絡人）
- **12 個課程**（涵蓋 9 所學校，多種課程類型和狀態）
- **3 份報價單**（對應 3 所學校）
- **3 個報價項目**
- **16 堂課**（對應 course_001）
- **3 張發票**（對應香港第一小學）
- **1 張收據**

**總計**: 約 68 條記錄，涵蓋所有主要業務流程

## 🏫 學校列表

| ID                   | 學校名稱         | 合作狀態   | 課程數量 |
| -------------------- | ---------------- | ---------- | -------- |
| school_hk_primary_1  | 香港第一小學     | ACTIVE     | 2        |
| school_kowloon_sec_1 | 九龍第二中學     | CONFIRMED  | 1        |
| school_nt_primary_3  | 新界第三小學     | INQUIRY    | 0        |
| school_004           | 聖保羅小學       | ACTIVE     | 1        |
| school_005           | 培正小學         | ACTIVE     | 1        |
| school_006           | 喇沙小學         | ACTIVE     | 1        |
| school_007           | 拔萃男書院       | ACTIVE     | 1        |
| school_008           | 瑪利諾修院學校   | CONFIRMED  | 1        |
| school_009           | 聖若瑟小學       | ACTIVE     | 1        |
| school_010           | 英華小學         | TERMINATED | 1        |
| school_011           | 九龍塘學校       | SUSPENDED  | 1        |
| school_012           | 協恩中學         | CONFIRMED  | 0        |
| school_013           | 保良局蔡繼有學校 | ACTIVE     | 1        |
| school_014           | 聖士提反女子中學 | ACTIVE     | 0        |
| school_015           | 華仁書院         | ACTIVE     | 0        |

## 📚 課程列表

| ID         | 課程名稱             | 學校             | 類型     | 狀態      |
| ---------- | -------------------- | ---------------- | -------- | --------- |
| course_001 | 跳繩恆常班（上學期） | 香港第一小學     | 恆常班   | ACTIVE    |
| course_002 | 跳繩恆常班（下學期） | 香港第一小學     | 恆常班   | SCHEDULED |
| course_003 | 花式跳繩進階班       | 九龍第二中學     | 恆常班   | SCHEDULED |
| course_004 | 花式跳繩興趣班       | 聖保羅小學       | 興趣班   | ACTIVE    |
| course_005 | 暑期跳繩訓練營       | 喇沙小學         | 暑期班   | COMPLETED |
| course_006 | 跳繩比賽培訓班       | 拔萃男書院       | 校隊班   | ACTIVE    |
| course_007 | 親子跳繩體驗班       | 瑪利諾修院學校   | 試堂     | COMPLETED |
| course_008 | 課後跳繩興趣班       | 聖若瑟小學       | 課後班   | ACTIVE    |
| course_009 | 跳繩密集班           | 培正小學         | 集訓課程 | DRAFT     |
| course_010 | 教師跳繩工作坊       | 英華小學         | 興趣班   | CANCELLED |
| course_011 | 跳繩恆常班 A 組      | 九龍塘學校       | 恆常班   | SUSPENDED |
| course_012 | 新手跳繩入門班       | 保良局蔡繼有學校 | 試堂     | ACTIVE    |
