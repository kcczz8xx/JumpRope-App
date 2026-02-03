# 原子化欄位系統 - 實作進度

## 當前狀態

**階段**：Phase 5 完成，任務主體已完成  
**最後更新**：2026-02-03

---

## 進度總覽

| Phase | 內容                  |  狀態   | 完成度 |
| :---- | :-------------------- | :-----: | :----: |
| 0     | 架構設置              | ✅ Done |  100%  |
| 1     | 核心共用欄位 + Schema | ✅ Done |  100%  |
| 2     | 日期時間欄位          | ✅ Done |  100%  |
| 3     | Enum 欄位 + 工廠      | ✅ Done |  100%  |
| 4     | 複合欄位 + 整合       | ✅ Done |  100%  |
| 5     | 測試與文檔            | ✅ Done |  100%  |

---

## 架構審視 ✅

### 已完成

- [x] 審視 Prisma Schema（school, user, tutor 模組）
- [x] 分析欄位使用頻率
- [x] 建立任務文檔
- [x] 定義技術方案
- [x] **架構審視**：採納 Model-Aligned 目錄結構
- [x] **開發規範**：新增命名一致性 + Props 結構順序
- [x] **Phase 調整**：Schema 同步到 Phase 1，測試獨立成 Phase 5

### 欄位頻率分析結果

| 優先級 | 欄位數量 | 說明                         |
| :----: | :------: | :--------------------------- |
|   P0   |    7     | 高頻（10+ 次使用）— 必做     |
|   P1   |    6     | 中頻（3-9 次使用）— 強烈建議 |
|   P2   |    5+    | 低頻（1-2 次使用）— 視情況   |

---

## Phase 0：架構設置 ✅

### 已完成

- [x] 建立 `_core/components/fields/` 目錄結構
  - [x] `_shared/` — 跨 Model 共用欄位
  - [x] `_enum/` — Enum 工廠 + 標籤
  - [x] ~~其他文件夾按需建立~~（school/, course/ 等在對應 Phase 動態建）
- [x] `types.ts` — FieldProps 接口（按規範 B 順序）
- [x] `styles.ts` — FIELD_STYLES 常數
- [x] `index.ts` — 公開 API
- [x] 建立 `_core/schemas/_shared/` 目錄
- [x] 更新 `_core/index.ts` 導出 fields 模組
- [x] 類型檢查通過

---

## Phase 1：核心共用欄位 + Schema ✅

### 已完成（`_shared/`）

| 欄位     | 組件                   | Schema               | 依賴    | 狀態 |
| :------- | :--------------------- | :------------------- | :------ | :--: |
| 電話     | `PhoneField.tsx`       | `phone.schema.ts`    | types ✓ |  ✅  |
| 電郵     | `EmailField.tsx`       | `email.schema.ts`    | types ✓ |  ✅  |
| 中文姓名 | `ChineseNameField.tsx` | `name.schema.ts`     | types ✓ |  ✅  |
| 英文姓名 | `EnglishNameField.tsx` | `name.schema.ts`     | types ✓ |  ✅  |
| 金額     | `CurrencyField.tsx`    | `currency.schema.ts` | types ✓ |  ✅  |
| 備註     | `RemarksField.tsx`     | —                    | types ✓ |  ✅  |

### 額外完成

- [x] `schemas/_shared/index.ts` — Schema 公開 API
- [x] `schemas/index.ts` — 統一導出
- [x] 類型檢查通過

---

## Phase 2：日期時間欄位 ✅

### 已完成

| 欄位     | 組件                    | 放置位置   | 狀態 |
| :------- | :---------------------- | :--------- | :--: |
| 日期     | `DateField.tsx`         | `_shared/` |  ✅  |
| 時間     | `TimeField.tsx`         | `_shared/` |  ✅  |
| 日期範圍 | `DateRangeField.tsx`    | `course/`  |  ✅  |
| 時間範圍 | `TimeRangeField.tsx`    | `lesson/`  |  ✅  |
| 學年     | `AcademicYearField.tsx` | `course/`  |  ✅  |

### 額外完成

- [x] `date.schema.ts` — 日期/時間/範圍/學年 Schemas
- [x] 建立 `course/` 文件夾
- [x] 建立 `lesson/` 文件夾
- [x] 類型檢查通過

---

## Phase 3：Enum 欄位 + 工廠 ✅

### 已完成

**Enum 工具**（`_enum/`）：

- [x] `factory.tsx` — createEnumField() 工廠函數
- [x] `labels.ts` — 中文標籤對照（9 個 Enum）

**狀態欄位**（按 Model 分組）：

| 欄位     | 組件                         | 放置位置   | 狀態 |
| :------- | :--------------------------- | :--------- | :--: |
| 合作狀態 | `PartnershipStatusField.tsx` | `school/`  |  ✅  |
| 課程狀態 | `CourseStatusField.tsx`      | `course/`  |  ✅  |
| 課程學期 | `CourseTermField.tsx`        | `course/`  |  ✅  |
| 收費模式 | `ChargingModelField.tsx`     | `course/`  |  ✅  |
| 課堂狀態 | `LessonStatusField.tsx`      | `lesson/`  |  ✅  |
| 課堂類型 | `LessonTypeField.tsx`        | `lesson/`  |  ✅  |
| 發票狀態 | `InvoiceStatusField.tsx`     | `invoice/` |  ✅  |
| 付款方式 | `PaymentMethodField.tsx`     | `invoice/` |  ✅  |

### 額外完成

- [x] 建立 `school/` 文件夾
- [x] 建立 `invoice/` 文件夾
- [x] 類型檢查通過

---

## Phase 4：複合欄位 + 整合 ✅

### 已完成

| 欄位       | 組件                     | 放置位置   | 狀態 |
| :--------- | :----------------------- | :--------- | :--: |
| 聯絡人     | `ContactField.tsx`       | `invoice/` |  ✅  |
| 學校聯絡人 | `SchoolContactField.tsx` | `school/`  |  ✅  |
| 地址       | `AddressField.tsx`       | `school/`  |  ✅  |

### 額外完成

- [x] 類型檢查通過

**待整合**（Phase 5 或後續任務）：

- [ ] `school-service/components/` 整合
- [ ] `user/components/` 整合

---

## Phase 5：測試與文檔 ✅

### 已完成

- [x] `PhoneField` 單元測試（edit/readonly/compact）— 14 個測試
- [x] `createEnumField` 單元測試（edit/readonly/compact）— 14 個測試
- [x] `ContactField` 單元測試（edit/readonly/compact）— 14 個測試
- [x] **總計：42 個測試全部通過**
- [x] 更新 `DEVELOPMENT-GUIDE.md`（使用範例）

### 後續可選

- [ ] 更新 `docs/03-Knowledge-Base/`（抽取最佳實踐）

---

## Phase 6：Single Source Architecture ✅

### 已完成

**基礎架構**（`configs/enums/`）：

- [x] `types.ts` — `EnumConfig`, `EnumOption`, `EnumHelpers` 類型定義
- [x] `utils.ts` — `createEnumHelpers()` 工廠函數
- [x] `index.ts` — 統一導出

**Enum Config 檔案**（12 個）：

| Config                         | Prisma Enum         | 狀態 |
| :----------------------------- | :------------------ | :--: |
| `course-status.config.ts`      | `CourseStatus`      |  ✅  |
| `course-term.config.ts`        | `CourseTerm`        |  ✅  |
| `lesson-status.config.ts`      | `LessonStatus`      |  ✅  |
| `lesson-type.config.ts`        | `LessonType`        |  ✅  |
| `invoice-status.config.ts`     | `InvoiceStatus`     |  ✅  |
| `payment-method.config.ts`     | `PaymentMethod`     |  ✅  |
| `payment-status.config.ts`     | `PaymentStatus`     |  ✅  |
| `partnership-status.config.ts` | `PartnershipStatus` |  ✅  |
| `charging-model.config.ts`     | `ChargingModel`     |  ✅  |
| `tutor-role.config.ts`         | `TutorRole`         |  ✅  |
| `user-role.config.ts`          | `UserRole`          |  ✅  |
| `gender.config.ts`             | `Gender`            |  ✅  |

### 驗證

- [x] `pnpm type-check` 通過

### Phase 6B：遷移現有組件

- [x] 更新 8 個 Enum Field 組件使用新 Config
- [x] 刪除舊 `_enum/labels.ts`
- [x] 更新 `school-service/components/types.ts` 從 `@prisma/client` 導入 Enum
- [x] 修復 `form-fixtures.ts` 類型錯誤
- [x] `pnpm type-check` 通過

### Phase 6C：一致性測試

- [x] 建立 `configs/enums/__tests__/sync.test.ts`
- [x] 修復 Jest/Prisma 兼容性問題（TextEncoder polyfill）
- [x] **60 個測試全部通過**

---

## Next Steps

1. **刪除舊重複定義**：`school-service/schemas/common.ts` 中的 Enum 常數陣列（可選）
2. **整合**：將欄位組件整合到 `school-service/components/`
3. **整合**：將欄位組件整合到 `user/components/`

---

## 決策記錄

| 日期       | 決策                              | 原因                           |
| :--------- | :-------------------------------- | :----------------------------- |
| 2026-02-03 | 放在 `_core` feature              | 跨 feature 共用，避免循環依賴  |
| 2026-02-03 | 使用工廠函數建立 Enum 欄位        | 減少重複代碼，統一行為         |
| 2026-02-03 | 三種模式（edit/readonly/compact） | 滿足列表、詳情、表單不同場景   |
| 2026-02-03 | Model-Aligned 文件夾組織          | 與 Prisma Schema 對齊，AI 友善 |
| 2026-02-03 | 開發規範補充                      | 確保組件風格一致               |
| 2026-02-03 | Single Source Architecture        | Enum 只定一次，避免多邊維護    |
