# 待人手檢查清單

> 生成日期：2026-02-02

## 🔴 需優先處理

### 1. Git 提交變更
```bash
# Prisma Schema 模組化
git add prisma/schema/
git commit -m "refactor(prisma): modularize all schemas into 21 files"

# 文件更新
git add docs/
git commit -m "docs: update prisma schema structure and archive tasks"
```

### 2. 驗證開發環境
```bash
pnpm dev        # 確認開發伺服器正常啟動
pnpm build      # 確認生產構建成功
pnpm type-check # 確認 TypeScript 無錯誤
```

---

## 🟡 建議檢查

### 3. Prisma Schema 相關
- [ ] 確認資料庫連線正常（`pnpm prisma:studio`）
- [ ] 確認現有 seed 資料仍可正常執行（`pnpm prisma:seed`）
- [ ] 確認 migration 狀態（`npx prisma migrate status`）

### 4. 功能測試
- [ ] 登入/註冊流程
- [ ] 用戶資料編輯
- [ ] 學校服務相關功能

---

## 🟢 可選優化

### 5. 文件目錄清理
- [ ] `docs/06-Deployment/` — 空目錄，考慮刪除或添加內容
- [ ] `docs/02-Tasks/_PAUSED/` — 空目錄，暫時保留

### 6. 代碼清理（來自之前會話的待辦）
- [ ] 移除測試用 `console.log`（SidebarContext、ThemeContext、layout.tsx）
- [ ] 加入 Error Boundary
- [ ] Prefetch 關鍵路由
- [ ] Logo 轉 inline SVG

---

## 📊 當前狀態摘要

| 項目 | 狀態 |
|------|------|
| Prisma Schema | ✅ 21 個模組化檔案 |
| 驗證 | ✅ format/validate/generate 通過 |
| 歸檔任務 | ✅ 10 個任務（TASK-001 ~ TASK-010） |
| 活躍任務 | ✅ 無（_ACTIVE 已清空） |
