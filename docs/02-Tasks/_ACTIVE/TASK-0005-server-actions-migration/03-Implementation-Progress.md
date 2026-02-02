# 實施進度追蹤

## 當前狀態

**階段**：階段五完成  
**進度**：95%  
**最後更新**：2026-02-02

---

## 階段進度

### 階段一：Action 基礎設施 ✅

- [x] `src/lib/actions/types.ts` — ActionResult, ActionErrorCode, success(), failure()
- [x] `src/lib/actions/safe-action.ts` — safeAction(), safeActionWithoutSchema()
- [x] `src/lib/actions/guards.ts` — requireUser(), requirePermission(), requireRole()
- [x] `src/lib/actions/index.ts` — 統一導出

### 階段二：Auth 模組 ✅

- [x] `src/features/auth/schema.ts` — 7 個 Zod schemas
- [x] `src/features/auth/actions.ts` — 7 個 Server Actions
- [x] 更新 `SignUpForm.tsx` — 改用 `useTransition` + Actions
- [x] 更新 `ResetPasswordForm.tsx` — 改用 `useTransition` + Actions
- [x] 更新 `index.ts` exports — 導出 Actions、Schemas、Types

### 階段三：User 模組 ✅

- [x] `src/features/user/schema.ts` — 9 個 Zod schemas
- [x] `src/features/user/queries.ts` — 5 個 queries（getProfile, getAddress, getBankAccount, getChildren, getTutorDocuments）
- [x] `src/features/user/actions.ts` — 11 個 Server Actions
- [x] 更新 `UserInfoEditModal.tsx` — 改用 `useTransition` + Actions（移除 2 處 fetch）
- [x] 更新 `UserTutorCard.tsx` — 改用 `useTransition` + Actions（移除 2 處 fetch）
- [x] 更新 `index.ts` exports — 導出 Actions、Queries、Schemas、Types

### 階段四：School Service 模組 ✅

- [x] `src/features/school-service/schema.ts` — 6 個 Zod schemas
- [x] `src/features/school-service/queries.ts` — 4 個 queries（getSchools, getSchoolById, getCourses, getCourseById）
- [x] `src/features/school-service/actions.ts` — 6 個 Server Actions
- [x] 更新 `index.ts` exports — 導出 Actions、Queries、Schemas、Types
- [ ] 更新相關 components（待下一步）

### 階段五：收尾 ✅

- [x] 標記廢棄 API Routes — 9 個 API Route 文件已添加 `@deprecated` 註釋
- [x] 更新進度文檔
- [ ] 驗證通過（lint、build）— 待用戶執行

---

## 驗證狀態

| 檢查項            | 狀態      |
| :---------------- | :-------- |
| `pnpm lint`       | ⏳ 待執行 |
| `pnpm type-check` | ⏳ 待執行 |
| `pnpm build`      | ⏳ 待執行 |

---

## Next Steps

1. ~~建立 `src/lib/actions/` 基礎設施~~ ✅
2. ~~Auth 模組遷移~~ ✅
3. ~~User 模組遷移~~ ✅
4. ~~School Service 模組遷移~~ ✅
5. ~~標記廢棄 API Routes~~ ✅
6. 待用戶執行 `pnpm lint` 和 `pnpm build` 驗證
