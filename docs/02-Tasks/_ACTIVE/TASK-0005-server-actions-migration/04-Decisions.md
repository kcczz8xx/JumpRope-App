# 決策記錄

## DEC-001：統一 ActionResult 回傳格式

**日期**：2026-02-02  
**狀態**：已決定

### 背景

需要統一 Server Actions 的回傳格式，方便 Client 端處理。

### 選項

1. **Option A**：簡單 `{ success: boolean, data?, error? }`
2. **Option B**：Discriminated union `{ ok: true, data } | { ok: false, error }`
3. **Option C**：使用 next-safe-action 套件

### 決定

採用 **Option B**：Discriminated union

### 理由

- TypeScript 類型收窄更好
- 強制處理錯誤情況
- 不需要額外依賴
- 與現有 RBAC 的 AuthResult 風格一致

---

## DEC-002：Rate Limit 取得 IP 方式

**日期**：2026-02-02  
**狀態**：已決定

### 背景

Server Actions 無法直接存取 Request 物件，需要用 `headers()` 取得 IP。

### 決定

使用 `headers()` 從 Next.js 取得 IP header。

### 實作

```typescript
import { headers } from "next/headers";

const headersList = await headers();
const ip = headersList.get("x-forwarded-for")?.split(",")[0] || "unknown";
```

---

## DEC-003：保留 NextAuth API Route

**日期**：2026-02-02  
**狀態**：已決定

### 背景

NextAuth v5 需要 `/api/auth/[...nextauth]` 處理 OAuth callbacks。

### 決定

保留 `/api/auth/[...nextauth]`，不遷移。

### 理由

這是 NextAuth 核心功能，不是內部 UI 調用，必須保留為 HTTP endpoint。
