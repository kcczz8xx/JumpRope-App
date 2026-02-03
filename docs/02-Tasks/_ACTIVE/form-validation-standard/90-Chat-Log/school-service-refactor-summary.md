# School Service 重構總結

**日期**：2026-02-03  
**任務**：按 `auth/components` 結構重構 `school-service/components` + 表單驗證規範化

---

## 1. Components 結構重構

### 變更對照

| 舊結構                                         | 新結構                      | 說明             |
| :--------------------------------------------- | :-------------------------- | :--------------- |
| `components/course/`                           | `components/new-course/`    | 新增課程表單流程 |
| `components/pages/overview/`                   | `components/overview/`      | 扁平化           |
| `components/pages/detailed/school-info-cards/` | `components/school-detail/` | 扁平化           |
| `components/pages/detailed/course-cards/`      | `components/course-detail/` | 扁平化           |
| `components/types/` 目錄                       | `components/types.ts` 檔案  | 合併為單一檔案   |
| `components/pages/`                            | 已刪除                      | -                |

### 最終結構

```
src/features/school-service/components/
├── common/           # 跨域共用元件
│   ├── AmountInput.tsx
│   ├── FormField.tsx
│   └── index.ts
├── new-course/       # 新增課程表單流程
│   ├── NewCourseForm.tsx
│   ├── SchoolFormStep.tsx
│   ├── CoursesFormStep.tsx
│   ├── SummaryFormStep.tsx
│   ├── useNewCourseFormValidation.ts  ← 已重構使用 Zod
│   └── index.ts
├── school-detail/    # 學校詳情頁元件
│   ├── SchoolInfoCards.tsx
│   ├── SchoolBasicInfoSection.tsx
│   ├── PartnershipInfoSection.tsx
│   └── index.ts
├── course-detail/    # 課程詳情頁元件
│   ├── CourseCards.tsx
│   ├── CourseCardItem.tsx
│   ├── AddCourseModal.tsx
│   └── index.ts
├── overview/         # 總覽頁元件
│   ├── ActivityTimeline.tsx
│   ├── MetricCards.tsx
│   ├── QuickActions.tsx
│   └── index.ts
├── list/             # 列表元件
│   ├── CourseList.tsx
│   ├── LessonList.tsx
│   └── index.ts
├── types.ts          # 統一型別定義
└── index.ts          # 統一導出
```

---

## 2. 表單驗證規範化

### 新增 Schema 檔案

| 檔案                    | 用途                          |
| :---------------------- | :---------------------------- |
| `schemas/common.ts`     | 共用 schema（欄位驗證、常數） |
| `schemas/new-course.ts` | NewCourseForm 多步驟表單驗證  |

### Schema 結構

```typescript
// schemas/common.ts
export const requiredStringSchema = (fieldName: string) => ...
export const optionalEmailSchema = ...
export const COURSE_TERMS = [...] as const;
export const CHARGING_MODELS = [...] as const;

// schemas/new-course.ts
export const newCourseSchoolSchema = z.object({...});
export const newCourseContactSchema = z.object({...});
export const newCourseStep1Schema = z.object({...});
export const newCourseCourseItemSchema = z.object({...});  // 含條件驗證
export const newCourseStep2Schema = z.object({...});
export const newCourseFormSchema = z.object({...});
```

### useNewCourseFormValidation 重構

**Before**：手動驗證邏輯（129 行）

```typescript
if (!school.schoolName.trim()) {
  newErrors.schoolName = "請輸入學校名稱";
}
// ... 大量手動檢查
```

**After**：使用 Zod safeParse（111 行）

```typescript
const result = newCourseStep1Schema.safeParse({
  school: formData.school,
  contact: formData.contact,
});
if (!result.success) {
  const errors = zodErrorsToFormErrors(result.error.issues);
  setErrors(errors);
  return false;
}
```

---

## 3. 修改的檔案列表

### 新增檔案

- `src/features/school-service/schemas/common.ts`
- `src/features/school-service/schemas/new-course.ts`
- `src/features/school-service/components/types.ts`
- `src/features/school-service/components/index.ts`
- `src/features/school-service/components/overview/index.ts`

### 修改檔案

- `src/features/school-service/schemas/index.ts` - 添加導出
- `src/features/school-service/schemas/course.ts` - 使用 common.ts 常數
- `src/features/school-service/schemas/batch.ts` - 使用 common.ts 常數
- `src/features/school-service/index.ts` - 更新導入路徑
- `src/features/school-service/components/new-course/useNewCourseFormValidation.ts` - Zod 重構
- `src/features/school-service/components/new-course/*.tsx` - 更新 types 導入
- `src/features/school-service/components/list/*.tsx` - 更新 types 導入
- `src/features/school-service/components/course-detail/*.tsx` - 更新導入
- `src/lib/mock-data/school-service/*.ts` - 更新 types 導入

### 刪除檔案/目錄

- `src/features/school-service/components/pages/` 目錄
- `src/features/school-service/components/types/` 目錄
- `src/features/school-service/components/course/` 目錄（已重命名為 new-course）

---

## 4. 驗證

- ✅ TypeScript 編譯通過（`pnpm type-check`）
- ✅ 遵循 `docs/03-Knowledge-Base/Form-Validation-Guide.md` 規範
- ✅ 遵循 `src/features/STRUCTURE.md` 目錄規範

---

---

## 5. new-course 子目錄細分（追加）

### 最終結構

```
new-course/
├── steps/                        # 多步驟表單容器
│   ├── SchoolFormStep.tsx
│   ├── CoursesFormStep.tsx
│   ├── SummaryFormStep.tsx
│   └── index.ts
├── cards/                        # 表單卡片元件
│   ├── SchoolBasicInfoCard.tsx
│   ├── PartnershipInfoCard.tsx
│   ├── ContactInfoCard.tsx
│   ├── CourseItemCard.tsx
│   ├── ChargingFieldsRenderer.tsx
│   └── index.ts
├── hooks/                        # 表單相關 Hooks
│   ├── useNewCourseFormValidation.ts
│   └── index.ts
├── NewCourseForm.tsx             # 主表單入口
└── index.ts                      # 統一導出
```

### 分類原則

| 子目錄   | 用途                   | 元件類型                  |
| :------- | :--------------------- | :------------------------ |
| `steps/` | 多步驟表單的各步驟容器 | 組合多個 cards 的容器元件 |
| `cards/` | 可複用的表單卡片       | 單一職責的表單區塊        |
| `hooks/` | 表單邏輯抽離           | 驗證、狀態管理等          |

### 優勢

- **清晰分類**：按職責分組，易於定位
- **可複用性**：cards 可在其他地方使用（如 AddCourseModal）
- **可維護性**：每個子目錄有獨立 index.ts 控制導出
- **符合規範**：遵循 STRUCTURE.md 的 >15 元件分類建議

---

## 6. 後續建議

1. **其他表單重構**：將相同模式應用到其他需要驗證的表單
2. **測試**：為 `useNewCourseFormValidation` 添加單元測試
3. **文檔**：更新 STRUCTURE.md 中的 school-service 範例
