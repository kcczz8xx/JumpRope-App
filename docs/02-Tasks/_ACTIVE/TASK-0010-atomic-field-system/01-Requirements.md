# 原子化欄位系統 - 需求規格

## 背景

JumpRope-App 目前有多個 features（school-service, user, tutor）需要管理資料庫欄位的表單。相同欄位類型（如電話、電郵、日期）在不同表單中重複實作，導致：

1. 代碼重複率高
2. UI/UX 不一致
3. 驗證邏輯分散
4. 維護成本高

## 目標

建立一套**原子化欄位組件系統**，實現：

- **單一來源**：每種欄位類型只有一個實作
- **多模式支援**：edit / readonly / compact
- **統一驗證**：Zod schema 驗證集中管理
- **樣式一致**：統一 Tailwind 樣式常數

---

## 功能需求

### FR-01：基礎欄位組件

| 欄位類型 | 組件名稱 | 使用場景 |
|:---------|:---------|:---------|
| 電話號碼 | `PhoneField` | User, School, SchoolContact, Invoice |
| 電郵地址 | `EmailField` | User, School, SchoolContact, Invoice |
| 中文姓名 | `ChineseNameField` | User, SchoolContact |
| 英文姓名 | `EnglishNameField` | User, SchoolContact |
| 日期選擇 | `DateField` | Course, Lesson, Invoice, Quotation |
| 時間選擇 | `TimeField` | Lesson, Schedule |
| 金額輸入 | `CurrencyField` | FeeStructure, Invoice, Quotation |
| 備註欄位 | `RemarksField` | 所有 Model |
| 地址欄位 | `AddressField` | School, User |

### FR-02：狀態/選項欄位

| 欄位類型 | 組件名稱 | Enum 來源 |
|:---------|:---------|:----------|
| 合作狀態 | `PartnershipStatusField` | PartnershipStatus |
| 課程狀態 | `CourseStatusField` | CourseStatus |
| 課堂狀態 | `LessonStatusField` | LessonStatus |
| 發票狀態 | `InvoiceStatusField` | InvoiceStatus |
| 付款方式 | `PaymentMethodField` | PaymentMethod |
| 課程學期 | `CourseTermField` | CourseTerm |
| 課堂類型 | `LessonTypeField` | LessonType |
| 收費模式 | `ChargingModelField` | ChargingModel |

### FR-03：複合欄位組件

| 欄位類型 | 組件名稱 | 說明 |
|:---------|:---------|:-----|
| 聯絡人 | `ContactField` | 姓名 + 電話 + 電郵 組合 |
| 日期範圍 | `DateRangeField` | 開始日期 + 結束日期 |
| 時間範圍 | `TimeRangeField` | 開始時間 + 結束時間 |
| 學年選擇 | `AcademicYearField` | 學年格式（2024-2025） |

### FR-04：模式支援

每個欄位必須支援三種模式：

```typescript
type FieldMode = 'edit' | 'readonly' | 'compact';
```

| 模式 | 說明 |
|:-----|:-----|
| `edit` | 可編輯輸入框，帶驗證 |
| `readonly` | 純顯示，無輸入框 |
| `compact` | 精簡顯示（用於列表/卡片） |

### FR-05：統一接口

```typescript
interface FieldProps<T> {
  value: T;
  onChange?: (value: T) => void;
  mode?: FieldMode;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  label?: string;
  placeholder?: string;
  className?: string;
}
```

---

## 非功能需求

### NFR-01：性能

- 使用 `React.memo` 優化渲染
- 使用 `useCallback` 防止不必要的 re-render

### NFR-02：可訪問性

- 所有欄位必須有正確的 `label` 關聯
- 支援鍵盤導航
- 錯誤訊息要清晰可讀

### NFR-03：類型安全

- 完整 TypeScript 定義
- 禁止使用 `any`

---

## 驗收標準

### AC-01：代碼重用

- [ ] 單一欄位組件可用於 3+ 個不同表單
- [ ] 無重複的欄位實作

### AC-02：模式切換

- [ ] 每個欄位支援 edit/readonly/compact 三種模式
- [ ] 模式切換無 layout shift

### AC-03：驗證一致

- [ ] 所有欄位使用統一的 Zod schema
- [ ] 錯誤訊息格式一致

### AC-04：樣式統一

- [ ] 使用 `FIELD_STYLES` 常數
- [ ] 無 inline style

### AC-05：測試覆蓋

- [ ] 每個欄位組件有單元測試
- [ ] 覆蓋率 > 80%
