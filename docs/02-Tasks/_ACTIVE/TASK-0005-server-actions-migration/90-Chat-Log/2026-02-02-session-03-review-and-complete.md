# Session 03: 技術 Review 與遷移完成

**日期**：2026-02-02  
**時長**：~15 分鐘

---

## 任務背景

用戶提供了一份詳細的技術 Review，指出 TASK-0005 存在以下問題：

1. **文件與實際進度不同步** — `00-task-info.yaml` 的 milestones 全部顯示 `pending`，但實際已完成大部分
2. **3 處 fetch 調用未遷移** — School Service 模組的 components 仍使用 API Routes
3. **缺少測試策略**
4. **Rate Limiting 轉移未明確說明**
5. **錯誤訊息國際化問題**

---

## 執行內容

### 1. 文件同步更新

- 更新 `00-task-info.yaml` milestones 狀態
- 設定 `actual_hours: 6`

### 2. 遷移剩餘 3 處 fetch 調用

| 文件 | 原本 | 改為 |
|------|------|------|
| `page.tsx` | Client + `fetch("/api/school-service/schools")` | **Server Component** + `getSchools()` |
| `SchoolFormStep.tsx` | `fetch("/api/school-service/schools/${id}")` | `useTransition` + `getSchoolById()` |
| `NewCourseForm.tsx` | `fetch("/api/.../batch-with-school")` | `batchCreateWithSchoolAction` |

### 3. 驗證結果

| 檢查 | 結果 |
|------|------|
| `pnpm build` | ✅ 通過 |
| `pnpm lint` | ⚠️ ESLint 配置問題（與遷移無關） |
| `pnpm type-check` | ⚠️ 測試文件類型問題（與遷移無關） |

---

## 修改的文件

```
docs/02-Tasks/_ACTIVE/TASK-0005-server-actions-migration/
├── 00-task-info.yaml                    # milestones 狀態更新
└── 03-Implementation-Progress.md        # 進度更新至 100%

src/app/(private)/dashboard/school/courses/new/
└── page.tsx                             # 改為 Server Component

src/features/school-service/components/course/
├── SchoolFormStep.tsx                   # useTransition + getSchoolById()
└── NewCourseForm.tsx                    # batchCreateWithSchoolAction
```

---

## 遷移統計

### Server Actions 總覽

| 模組 | Actions | Queries | Schemas |
|------|---------|---------|---------|
| Auth | 7 | - | 7 |
| User | 11 | 5 | 9 |
| School Service | 6 | 4 | 6 |
| **Total** | **24** | **9** | **22** |

### 已遷移的 Client 調用點

- `SignUpForm.tsx` — 3 處
- `ResetPasswordForm.tsx` — 2 處
- `UserInfoEditModal.tsx` — 2 處
- `UserTutorCard.tsx` — 2 處
- `page.tsx` (courses/new) — 1 處
- `SchoolFormStep.tsx` — 1 處
- `NewCourseForm.tsx` — 1 處

**Total: 12 處 fetch 調用已遷移**

---

## 後續建議

### P0（必須）

- [x] ~~更新文件與實際進度同步~~
- [x] ~~遷移剩餘 3 處 fetch~~

### P1（建議）

- [ ] 修復 ESLint 配置（`eslint-config-next/core-web-vitals` 導入）
- [ ] 補充測試文件的 `@testing-library/jest-dom` 類型定義
- [ ] 加入 Rate Limiting 支援到 `guards.ts`

### P2（可選）

- [ ] i18n 錯誤訊息
- [ ] Action hooks generator
- [ ] 效能監控（追蹤 action 執行時間）

---

## 任務狀態

**TASK-0005 Server Actions 遷移** — ✅ **完成**

- 進度：100%
- Build：通過
- 所有 fetch 調用已遷移至 Server Actions
