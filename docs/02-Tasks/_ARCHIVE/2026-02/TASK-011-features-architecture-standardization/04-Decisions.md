# 決策記錄

## DEC-001：採用分層式結構

**日期**：2026-02-02

**背景**：
三個 features 使用不同組織模式（扁平式、分層式、混合式）

**選項**：
1. **方案 A**：採用分層式（`user` 模式）
2. **方案 B**：保持扁平式（`auth` 模式）

**決策**：採用 **方案 A - 分層式**

**理由**：
- `user` 已成功實踐，證明可行
- 可擴展性強（單個檔案不會過大）
- Git 衝突機會少（多人開發時）
- 符合 Next.js 15 App Router 的 colocation 思想

---

## DEC-002：加入 server.ts 分離

**日期**：2026-02-02

**背景**：
只有 `user` 有 `server.ts`，其他 features 缺少 server-only export 分離

**決策**：所有 features 必須有 `server.ts`

**理由**：
- 防止 queries 被 client 誤 import
- 優化 bundle size
- 明確標示 server-only 邏輯

---

## DEC-003：暫不實作 package.json exports

**日期**：2026-02-02

**背景**：
原分析建議在 `package.json` 加入 exports 設定強制檢查

**決策**：**暫不實作**

**理由**：
- Next.js 15 已內建 tree-shaking
- 增加設定複雜度
- `server.ts` 命名慣例已足夠清晰
- 可作為後續優化項目
