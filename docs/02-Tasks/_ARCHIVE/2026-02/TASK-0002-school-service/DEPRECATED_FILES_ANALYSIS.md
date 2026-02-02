# 📂 課程表單文件使用狀態分析

## 分析日期

2026-01-30

---

## 📊 文件使用狀態總覽

| 文件名                  | 狀態      | 原因                          | 使用位置                                       |
| ----------------------- | --------- | ----------------------------- | ---------------------------------------------- |
| `CourseFormStep1.tsx`   | ❌ 已棄用 | 被 `SchoolFormStep.tsx` 取代  | 無                                             |
| `CourseFormStep2.tsx`   | ❌ 已棄用 | 被 `CoursesFormStep.tsx` 取代 | 無                                             |
| `CourseFormStep3.tsx`   | ❌ 已棄用 | 被 `SummaryFormStep.tsx` 取代 | 無                                             |
| `CoursesFormStep.tsx`   | ✅ 使用中 | 新流程步驟 2                  | `NewCourseForm.tsx`                            |
| `BatchCreateForm.tsx`   | ✅ 使用中 | 批次新增功能                  | `/dashboard/school/courses/batch/page.tsx`     |
| `TemplateFormModal.tsx` | ✅ 使用中 | 模板管理功能                  | `/dashboard/school/courses/templates/page.tsx` |
| `TemplateCard.tsx`      | ✅ 使用中 | 模板管理功能                  | `/dashboard/school/courses/templates/page.tsx` |

---

## ❌ 已棄用的文件（可安全刪除）

### 1. CourseFormStep1.tsx

**原功能**: 步驟 1 - 課程基本資料

**內容**:

- 選擇學校
- 課程名稱
- 課程類型、學期
- 學年
- 開始/結束日期
- 所需導師、最大學生數
- 課程描述

**被取代原因**:

- 舊流程是「課程為中心」
- 新流程改為「學校為中心」
- 現在由 `SchoolFormStep.tsx` 處理學校資料

**引用位置**:

- `components/school-service/course/index.ts` (僅導出，無實際使用)

---

### 2. CourseFormStep2.tsx

**原功能**: 步驟 2 - 收費設定

**內容**:

- 收費模式選擇
- 根據收費模式顯示對應欄位
- 導師薪資設定

**被取代原因**:

- 收費設定已整合到 `CoursesFormStep.tsx` 中
- 新流程支持一次新增多個課程
- 每個課程都包含完整的收費設定

**引用位置**:

- `components/school-service/course/index.ts` (僅導出，無實際使用)

---

### 3. CourseFormStep3.tsx

**原功能**: 步驟 3 - 課程預覽

**內容**:

- 顯示課程基本資料
- 顯示收費設定
- 顯示財務預估（收入、成本、利潤）

**被取代原因**:

- 新流程的總結頁面更全面
- `SummaryFormStep.tsx` 顯示學校、聯絡人和所有課程
- 包含總財務預估

**引用位置**:

- `components/school-service/course/index.ts` (僅導出，無實際使用)

---

## ✅ 仍在使用的文件

### 1. CoursesFormStep.tsx

**狀態**: ✅ **正在使用**

**功能**: 新流程步驟 2 - 課程資料

**特點**:

- 支持新增多個課程
- 每個課程包含完整資料（基本資料 + 收費設定）
- 動態顯示收費欄位
- 支持移除課程（至少保留一個）

**使用位置**:

```typescript
// NewCourseForm.tsx
import CoursesFormStep from "./CoursesFormStep";

// 在步驟 1 (currentStep === 1) 時渲染
<CoursesFormStep
  courses={formData.courses}
  onCoursesChange={handleCoursesChange}
  errors={errors}
/>;
```

**依賴關係**:

- 被 `NewCourseForm.tsx` 使用
- 用於 `/dashboard/school/courses/new` 頁面

---

### 2. BatchCreateForm.tsx

**狀態**: ✅ **正在使用**

**功能**: 批次新增課程

**特點**:

- 一次性建立多個課程
- 每個課程可選擇不同學校
- 簡化的表單欄位
- 適用於快速批量創建

**使用位置**:

```typescript
// app/(private)/dashboard/school/courses/batch/page.tsx
import BatchCreateForm from "@/components/school-service/course/BatchCreateForm";

<BatchCreateForm schools={schools} />;
```

**頁面路徑**: `/dashboard/school/courses/batch`

**API 端點**: `/api/school-service/courses/batch`

---

### 3. TemplateFormModal.tsx

**狀態**: ✅ **正在使用**

**功能**: 課程模板表單彈窗

**特點**:

- 新增/編輯課程模板
- 設定模板預設值
- 支持設為預設模板
- Modal 彈窗形式

**使用位置**:

```typescript
// app/(private)/dashboard/school/courses/templates/page.tsx
import TemplateFormModal from "@/components/school-service/course/TemplateFormModal";

<TemplateFormModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  onSubmit={handleSubmit}
  initialData={editingTemplate}
/>;
```

**頁面路徑**: `/dashboard/school/courses/templates`

**API 端點**:

- `POST /api/school-service/course-templates`
- `PUT /api/school-service/course-templates/:id`

---

### 4. TemplateCard.tsx

**狀態**: ✅ **正在使用**

**功能**: 課程模板卡片顯示

**特點**:

- 顯示模板資訊
- 使用次數統計
- 操作按鈕（使用、編輯、刪除）
- 預設模板標記

**使用位置**:

```typescript
// app/(private)/dashboard/school/courses/templates/page.tsx
import TemplateCard from "@/components/school-service/course/TemplateCard";

{
  filteredTemplates.map((template) => (
    <TemplateCard
      key={template.id}
      template={template}
      onUse={handleUse}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  ));
}
```

**頁面路徑**: `/dashboard/school/courses/templates`

---

## 🔄 新舊流程對比

### 舊流程（已棄用）

```
步驟 1：課程基本資料 (CourseFormStep1.tsx)
  ↓
步驟 2：收費設定 (CourseFormStep2.tsx)
  ↓
步驟 3：確認建立 (CourseFormStep3.tsx)
```

**特點**:

- 以「課程」為中心
- 一次只能建立一個課程
- 需要先選擇現有學校

---

### 新流程（正在使用）

```
步驟 1：學校資料 (SchoolFormStep.tsx)
  - 學校基本資料
  - 聯絡人資料
  ↓
步驟 2：課程資料 (CoursesFormStep.tsx)
  - 可新增多個課程
  - 每個課程包含完整資料
  ↓
步驟 3：總結 (SummaryFormStep.tsx)
  - 學校 + 聯絡人 + 所有課程
  - 總財務預估
```

**特點**:

- 以「學校」為中心
- 一次可建立多個課程
- 支持新增學校或選擇現有學校
- 同時處理學校、聯絡人和課程資料

---

## 🗑️ 清理步驟

### 1. 刪除已棄用的文件

```bash
cd /Users/kchung/Documents/Project/Next.js/jumprope-app

# 刪除舊的步驟組件
rm components/school-service/course/CourseFormStep1.tsx
rm components/school-service/course/CourseFormStep2.tsx
rm components/school-service/course/CourseFormStep3.tsx
```

### 2. 更新 index.ts 導出文件

**文件**: `components/school-service/course/index.ts`

**修改前**:

```typescript
export { default as NewCourseForm } from "./NewCourseForm";
export { default as CourseFormStep1 } from "./CourseFormStep1";
export { default as CourseFormStep2 } from "./CourseFormStep2";
export { default as CourseFormStep3 } from "./CourseFormStep3";
export { default as BatchCreateForm } from "./BatchCreateForm";
export { default as TemplateCard } from "./TemplateCard";
export { default as TemplateFormModal } from "./TemplateFormModal";
```

**修改後**:

```typescript
export { default as NewCourseForm } from "./NewCourseForm";
export { default as BatchCreateForm } from "./BatchCreateForm";
export { default as TemplateCard } from "./TemplateCard";
export { default as TemplateFormModal } from "./TemplateFormModal";
```

### 3. 檢查是否有其他引用

執行搜尋確認沒有其他地方引用這些文件：

```bash
# 搜尋 CourseFormStep1 的引用
grep -r "CourseFormStep1" --include="*.tsx" --include="*.ts" .

# 搜尋 CourseFormStep2 的引用
grep -r "CourseFormStep2" --include="*.tsx" --include="*.ts" .

# 搜尋 CourseFormStep3 的引用
grep -r "CourseFormStep3" --include="*.tsx" --include="*.ts" .
```

---

## 📝 相關文檔

- [課程表單重構文檔](./COURSE_FORM_REFACTOR.md) - 詳細的重構說明
- [業務流程文檔](./BUSINESS_FLOW.md) - 業務流程說明
- [組件清單](./COMPONENTS.md) - 組件使用說明

---

## ✅ 驗證清單

清理完成後，請確認以下項目：

- [ ] 已刪除 `CourseFormStep1.tsx`
- [ ] 已刪除 `CourseFormStep2.tsx`
- [ ] 已刪除 `CourseFormStep3.tsx`
- [ ] 已更新 `index.ts` 移除相關導出
- [ ] 執行 `pnpm build` 確認沒有編譯錯誤
- [ ] 測試新增課程功能正常運作
- [ ] 測試批次新增功能正常運作
- [ ] 測試模板管理功能正常運作

---

## 📊 統計資訊

- **可刪除文件數**: 3
- **保留文件數**: 4
- **新增文件數**: 3 (SchoolFormStep, CoursesFormStep, SummaryFormStep)
- **代碼行數減少**: 約 600 行（3 個舊文件）
- **功能增強**: 支持一次新增多個課程

---

**文檔版本**: 1.0  
**最後更新**: 2026-01-30  
**分析者**: AI Assistant
