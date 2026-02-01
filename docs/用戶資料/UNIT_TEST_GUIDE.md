# 單元測試指引

本文檔提供用戶資料模組的單元測試指引，涵蓋測試範圍、案例設計與執行方式。

---

## 測試範圍與優先級

| 模組                      | 測試類型 | 優先級 | 位置                                     |
| ------------------------- | -------- | ------ | ---------------------------------------- |
| `lib/client/api.ts`       | 單元測試 | **高** | `lib/client/__tests__/api.test.ts`       |
| `lib/rbac/permissions.ts` | 單元測試 | **高** | `lib/rbac/__tests__/permissions.test.ts` |
| `hooks/useFormSubmit.ts`  | 單元測試 | 中     | `hooks/__tests__/useFormSubmit.test.ts`  |
| `hooks/useUserProfile.ts` | 整合測試 | 中     | `hooks/__tests__/useUserProfile.test.ts` |
| API Routes                | 整合測試 | **高** | `app/api/**/__tests__/`                  |

---

## 1. API Client 測試 (`lib/client/api.ts`)

### 測試檔案位置

```
lib/client/__tests__/api.test.ts
```

### 測試案例

```typescript
import { api, apiGet, apiPost } from "../api";

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("API Client", () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe("apiGet", () => {
    it("成功請求返回 { data, error: null }", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { id: 1, name: "Test" } }),
      });

      const result = await apiGet("/api/test");

      expect(result.data).toEqual({ id: 1, name: "Test" });
      expect(result.error).toBeNull();
    });

    it("HTTP 404 返回 { data: null, error: '...' }", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: "Not found" }),
      });

      const result = await apiGet("/api/test");

      expect(result.data).toBeNull();
      expect(result.error).toBe("Not found");
    });

    it("HTTP 500 返回 { data: null, error: '...' }", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ message: "Internal server error" }),
      });

      const result = await apiGet("/api/test");

      expect(result.data).toBeNull();
      expect(result.error).toBe("Internal server error");
    });

    it("網絡錯誤返回 { data: null, error: '網絡錯誤' }", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const result = await apiGet("/api/test");

      expect(result.data).toBeNull();
      expect(result.error).toBe("Network error");
    });
  });

  describe("apiPost", () => {
    it("成功 POST 請求", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { id: 1 } }),
      });

      const result = await apiPost("/api/test", { name: "Test" });

      expect(mockFetch).toHaveBeenCalledWith("/api/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Test" }),
      });
      expect(result.data).toEqual({ id: 1 });
    });

    it("success: false 返回錯誤", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: false, error: "Validation failed" }),
      });

      const result = await apiPost("/api/test", {});

      expect(result.data).toBeNull();
      expect(result.error).toBe("Validation failed");
    });
  });
});
```

---

## 2. RBAC Permissions 測試 (`lib/rbac/permissions.ts`)

### 測試檔案位置

```
lib/rbac/__tests__/permissions.test.ts
```

### 測試案例

```typescript
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  isRoleAtLeast,
  isAdmin,
  isStaffOrAdmin,
} from "../permissions";

describe("RBAC Permissions", () => {
  describe("hasPermission", () => {
    it("ADMIN 可存取 ADMIN_DASHBOARD", () => {
      expect(hasPermission("ADMIN", "ADMIN_DASHBOARD")).toBe(true);
    });

    it("USER 無法存取 ADMIN_DASHBOARD", () => {
      expect(hasPermission("USER", "ADMIN_DASHBOARD")).toBe(false);
    });

    it("STAFF 可存取 STAFF_DASHBOARD", () => {
      expect(hasPermission("STAFF", "STAFF_DASHBOARD")).toBe(true);
    });

    it("undefined 角色返回 false", () => {
      expect(hasPermission(undefined, "USER_PROFILE_READ_OWN")).toBe(false);
    });

    it("null 角色返回 false", () => {
      expect(hasPermission(null, "USER_PROFILE_READ_OWN")).toBe(false);
    });
  });

  describe("hasAnyPermission", () => {
    it("有任一權限返回 true", () => {
      expect(
        hasAnyPermission("USER", ["ADMIN_DASHBOARD", "USER_PROFILE_READ_OWN"])
      ).toBe(true);
    });

    it("無任何權限返回 false", () => {
      expect(
        hasAnyPermission("USER", ["ADMIN_DASHBOARD", "STAFF_DASHBOARD"])
      ).toBe(false);
    });
  });

  describe("hasAllPermissions", () => {
    it("擁有所有權限返回 true", () => {
      expect(
        hasAllPermissions("ADMIN", ["ADMIN_DASHBOARD", "STAFF_DASHBOARD"])
      ).toBe(true);
    });

    it("缺少任一權限返回 false", () => {
      expect(
        hasAllPermissions("STAFF", ["ADMIN_DASHBOARD", "STAFF_DASHBOARD"])
      ).toBe(false);
    });
  });

  describe("isRoleAtLeast", () => {
    it("STAFF 角色至少是 USER", () => {
      expect(isRoleAtLeast("STAFF", "USER")).toBe(true);
    });

    it("USER 角色不是 ADMIN", () => {
      expect(isRoleAtLeast("USER", "ADMIN")).toBe(false);
    });

    it("ADMIN 角色至少是 ADMIN", () => {
      expect(isRoleAtLeast("ADMIN", "ADMIN")).toBe(true);
    });

    it("undefined 角色返回 false", () => {
      expect(isRoleAtLeast(undefined, "USER")).toBe(false);
    });
  });

  describe("Helper Functions", () => {
    it("isAdmin 正確識別管理員", () => {
      expect(isAdmin("ADMIN")).toBe(true);
      expect(isAdmin("STAFF")).toBe(false);
    });

    it("isStaffOrAdmin 正確識別職員或管理員", () => {
      expect(isStaffOrAdmin("ADMIN")).toBe(true);
      expect(isStaffOrAdmin("STAFF")).toBe(true);
      expect(isStaffOrAdmin("USER")).toBe(false);
    });
  });
});
```

---

## 3. useFormSubmit Hook 測試

### 測試檔案位置

```
hooks/__tests__/useFormSubmit.test.ts
```

### 測試案例

```typescript
import { renderHook, act, waitFor } from "@testing-library/react";
import { useFormSubmit } from "../useFormSubmit";

// Mock toast
jest.mock("@/lib/client", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe("useFormSubmit", () => {
  const mockOnSubmit = jest.fn();
  const mockOnSuccess = jest.fn();
  const mockOnError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("提交成功時 isSubmitting 變化正確", async () => {
    mockOnSubmit.mockResolvedValueOnce({ data: { id: 1 }, error: null });

    const { result } = renderHook(() =>
      useFormSubmit({
        onSubmit: mockOnSubmit,
        onSuccess: mockOnSuccess,
      })
    );

    expect(result.current.isSubmitting).toBe(false);

    let submitPromise: Promise<boolean>;
    act(() => {
      submitPromise = result.current.submit({ name: "Test" });
    });

    expect(result.current.isSubmitting).toBe(true);

    await act(async () => {
      await submitPromise;
    });

    expect(result.current.isSubmitting).toBe(false);
  });

  it("連續點擊被防止", async () => {
    mockOnSubmit.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ data: {}, error: null }), 100)
        )
    );

    const { result } = renderHook(() =>
      useFormSubmit({ onSubmit: mockOnSubmit })
    );

    act(() => {
      result.current.submit({});
      result.current.submit({});
      result.current.submit({});
    });

    await waitFor(() => expect(result.current.isSubmitting).toBe(false));

    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
  });

  it("onSuccess callback 正確觸發", async () => {
    const responseData = { id: 1, name: "Test" };
    mockOnSubmit.mockResolvedValueOnce({ data: responseData, error: null });

    const { result } = renderHook(() =>
      useFormSubmit({
        onSubmit: mockOnSubmit,
        onSuccess: mockOnSuccess,
      })
    );

    await act(async () => {
      await result.current.submit({});
    });

    expect(mockOnSuccess).toHaveBeenCalledWith(responseData);
  });

  it("onError callback 正確觸發", async () => {
    mockOnSubmit.mockResolvedValueOnce({ data: null, error: "提交失敗" });

    const { result } = renderHook(() =>
      useFormSubmit({
        onSubmit: mockOnSubmit,
        onError: mockOnError,
      })
    );

    await act(async () => {
      await result.current.submit({});
    });

    expect(mockOnError).toHaveBeenCalledWith("提交失敗");
  });

  it("reset 函數正確重置狀態", async () => {
    const { result } = renderHook(() =>
      useFormSubmit({ onSubmit: mockOnSubmit })
    );

    act(() => {
      result.current.reset();
    });

    expect(result.current.isSubmitting).toBe(false);
  });
});
```

---

## 執行測試

### 單次執行

```bash
pnpm test
```

### 監看模式

```bash
pnpm test:watch
```

### 覆蓋率報告

```bash
pnpm test:coverage
```

### 執行特定檔案

```bash
pnpm test lib/client/__tests__/api.test.ts
pnpm test lib/rbac/__tests__/permissions.test.ts
```

---

## 測試配置

專案使用 Jest + Testing Library，配置位於：

- `jest.config.js` - Jest 主配置
- `jest.setup.js` - 測試環境設置

### 重要配置項

```javascript
// jest.config.js
module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
};
```

---

## Mock 指引

### Mock Fetch

```typescript
const mockFetch = jest.fn();
global.fetch = mockFetch;
```

### Mock Next.js Router

```typescript
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));
```

### Mock SWR

```typescript
jest.mock("swr", () => ({
  __esModule: true,
  default: jest.fn(() => ({
    data: undefined,
    error: undefined,
    isLoading: false,
    mutate: jest.fn(),
  })),
}));
```

---

## 建議優先順序

1. **`lib/rbac/permissions.ts`** - 純函數，無依賴，最容易測試
2. **`lib/client/api.ts`** - 核心 API 客戶端，mock fetch 即可
3. **`hooks/useFormSubmit.ts`** - Hook 測試需要 `@testing-library/react`
4. **API Routes** - 整合測試，需要 mock Prisma

---

## 注意事項

- 測試檔案命名：`*.test.ts` 或 `*.spec.ts`
- 測試目錄：`__tests__/` 或與源碼同級
- 使用 `@/` alias 導入模組
- 測試應獨立運行，不依賴外部狀態
