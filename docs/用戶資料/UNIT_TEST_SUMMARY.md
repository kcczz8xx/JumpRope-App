# 單元測試執行總結

> 建立日期：2026-02-02

---

## 測試概覽

| 類別       | 測試檔案                                 | 測試數量 | 狀態    |
| ---------- | ---------------------------------------- | -------- | ------- |
| RBAC 權限  | `lib/rbac/__tests__/permissions.test.ts` | 29       | ✅ PASS |
| API Client | `lib/client/__tests__/api.test.ts`       | 21       | ✅ PASS |
| Hook       | `hooks/__tests__/useFormSubmit.test.ts`  | 22       | ✅ PASS |

**總計：6 個測試套件、115 個測試全部通過**

> **備註**：API Route 測試需要額外的 Web API polyfill（`undici` 或 `@edge-runtime/jest-environment`），暫不納入。

---

## 測試檔案詳情

### 1. RBAC Permissions (`lib/rbac/__tests__/permissions.test.ts`)

**測試函數：**

- `hasPermission` - 單一權限檢查
- `hasAnyPermission` - 任一權限檢查
- `hasAllPermissions` - 全部權限檢查
- `isRoleAtLeast` - 角色層級檢查
- `isAdmin`, `isStaffOrAdmin`, `isTutor` - Helper 函數
- 常數驗證（ROLE_HIERARCHY, ROLE_LABELS, PERMISSIONS）

**邊界案例：**

- undefined/null 角色處理
- 空權限陣列處理

---

### 2. API Client (`lib/client/__tests__/api.test.ts`)

**測試函數：**

- `apiGet` - GET 請求
- `apiPost` - POST 請求
- `apiPut` - PUT 請求
- `apiPatch` - PATCH 請求
- `apiDelete` - DELETE 請求
- `api` 物件參照驗證

**覆蓋場景：**

- 成功回應（200）
- HTTP 錯誤（404, 500）
- 網絡錯誤
- JSON 解析失敗
- `success: false` 業務錯誤

---

### 3. useFormSubmit Hook (`hooks/__tests__/useFormSubmit.test.ts`)

**測試函數：**

- `useFormSubmit` - 表單提交 Hook
- `useAsyncSubmit` - 非同步執行 Hook

**覆蓋場景：**

- 提交狀態變化（isSubmitting）
- 防重複提交
- callback 觸發（onSuccess, onError）
- Toast 顯示控制
- 異常處理
- reset 函數

---

## 執行指令

```bash
# 執行所有測試
pnpm test

# 監看模式
pnpm test:watch

# 覆蓋率報告
pnpm test:coverage

# 執行特定檔案
pnpm test lib/rbac/__tests__/permissions.test.ts
pnpm test lib/client/__tests__/api.test.ts
pnpm test hooks/__tests__/useFormSubmit.test.ts
```

---

## Mock 模式

### Prisma Mock

```typescript
jest.mock("@/lib/db", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  },
}));
```

### RBAC Check Permission Mock

```typescript
jest.mock("@/lib/rbac/check-permission", () => ({
  checkPermission: jest.fn(),
  unauthorizedResponse: jest.fn(),
  forbiddenResponse: jest.fn(),
}));
```

### Toast Mock

```typescript
jest.mock("@/lib/client", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));
```

---

## 檔案結構

```
├── lib/
│   ├── client/
│   │   └── __tests__/
│   │       └── api.test.ts
│   └── rbac/
│       └── __tests__/
│           └── permissions.test.ts
├── hooks/
│   └── __tests__/
│       └── useFormSubmit.test.ts
```

---

## 下一步建議

1. **執行覆蓋率報告** - `pnpm test:coverage` 檢視覆蓋率
2. **Hook 測試擴展** - `useUserProfile`, `useModal` 等
3. **API Route 測試** - 需安裝 `@edge-runtime/jest-environment` 或 `undici`

---

## 注意事項

- 測試使用 Jest + Testing Library（JSDOM 環境）
- 路徑使用 `@/` alias
- API Route 測試需 mock Prisma 和 checkPermission
- 測試檔案命名：`*.test.ts` 或 `*.spec.ts`
