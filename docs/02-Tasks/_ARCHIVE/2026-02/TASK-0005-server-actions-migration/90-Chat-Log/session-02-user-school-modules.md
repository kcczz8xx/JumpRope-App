# Session 02 - User & School Service 模組遷移

**日期**: 2026-02-02  
**進度**: 95%

---

## 本次完成項目

### 階段三：User 模組 ✅

#### 建立的檔案

| 檔案 | 內容 |
|:-----|:-----|
| `src/features/user/schema.ts` | 9 個 Zod schemas |
| `src/features/user/queries.ts` | 5 個 queries |
| `src/features/user/actions.ts` | 11 個 Server Actions |

#### Schemas

- `updateProfileSchema`
- `updateAddressSchema`
- `updateBankSchema`
- `createChildSchema`
- `updateChildSchema`
- `deleteChildSchema`
- `createTutorDocumentSchema`
- `updateTutorDocumentSchema`
- `deleteTutorDocumentSchema`

#### Queries

- `getProfile`
- `getAddress`
- `getBankAccount`
- `getChildren`
- `getTutorDocuments`

#### Actions

- `updateProfileAction`
- `updateAddressAction`
- `deleteAddressAction`
- `updateBankAction`
- `deleteBankAction`
- `createChildAction`
- `updateChildAction`
- `deleteChildAction`
- `createTutorDocumentAction`
- `updateTutorDocumentAction`
- `deleteTutorDocumentAction`

#### 更新的組件

- `UserInfoEditModal.tsx` — 移除 2 處 fetch，改用 `sendOtpAction`、`verifyOtpAction`
- `UserTutorCard.tsx` — 移除 2 處 fetch，改用 tutor document actions

---

### 階段四：School Service 模組 ✅

#### 建立的檔案

| 檔案 | 內容 |
|:-----|:-----|
| `src/features/school-service/schema.ts` | 6 個 Zod schemas |
| `src/features/school-service/queries.ts` | 4 個 queries |
| `src/features/school-service/actions.ts` | 6 個 Server Actions |

#### Schemas

- `createSchoolSchema`
- `updateSchoolSchema`
- `schoolContactSchema`
- `createCourseSchema`
- `updateCourseSchema`
- `batchCreateWithSchoolSchema`

#### Queries

- `getSchools`
- `getSchoolById`
- `getCourses`
- `getCourseById`

#### Actions

- `createSchoolAction`
- `updateSchoolAction`
- `deleteSchoolAction`
- `createCourseAction`
- `deleteCourseAction`
- `batchCreateWithSchoolAction`

---

### 階段五：收尾 ✅

#### 標記廢棄的 API Routes

已添加 `@deprecated` 註釋的文件：

**User 模組（5 個）**
- `/api/user/profile`
- `/api/user/address`
- `/api/user/bank`
- `/api/user/children`
- `/api/user/tutor/document`

**School Service 模組（4 個）**
- `/api/school-service/schools`
- `/api/school-service/schools/[id]`
- `/api/school-service/courses`
- `/api/school-service/courses/batch-with-school`

---

## 遷移統計

| 模組 | Schemas | Queries | Actions |
|:-----|:--------|:--------|:--------|
| Auth | 7 | - | 7 |
| User | 9 | 5 | 11 |
| School Service | 6 | 4 | 6 |
| **總計** | **22** | **9** | **24** |

---

## 待完成項目

1. **驗證通過**
   ```bash
   pnpm lint
   pnpm build
   ```

2. **更新相關組件**（可選）
   - School Service 模組的組件目前仍使用 fetch，可在下一階段遷移

3. **移除廢棄 API Routes**（未來版本）
   - 確認所有 fetch 調用已遷移後，可刪除標記為 deprecated 的 API Route 文件

---

## 使用示例

### User 模組

```typescript
// 導入
import { 
  updateProfileAction, 
  getProfile,
  updateProfileSchema 
} from "@/features/user";

// Server Component 中使用 query
async function ProfilePage() {
  const result = await getProfile();
  if (!result.ok) return <div>錯誤: {result.error.message}</div>;
  return <div>{result.data.nickname}</div>;
}

// Client Component 中使用 action
"use client";
function ProfileForm() {
  const [isPending, startTransition] = useTransition();
  
  const handleSubmit = (data) => {
    startTransition(async () => {
      const result = await updateProfileAction(data);
      if (result.ok) {
        // 成功
      } else {
        // 處理錯誤
      }
    });
  };
}
```

### School Service 模組

```typescript
// 導入
import { 
  createCourseAction,
  getCourses,
  createCourseSchema
} from "@/features/school-service";

// Server Component 中使用 query
async function CoursesPage() {
  const result = await getCourses({ status: "ACTIVE" });
  if (!result.ok) return <div>錯誤: {result.error.message}</div>;
  return <CourseList courses={result.data} />;
}
```
