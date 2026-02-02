<activation_mode>glob</activation_mode>
<glob_pattern>**/\*.test.ts, **/_.test.tsx, **/**tests**/**/_</glob_pattern>

<testing_rules>

# 測試規則

當編輯測試檔案時啟用。

</testing_rules>

<setup>

## 測試環境

- **框架**: Jest + Testing Library
- **環境**: JSDOM
- **設定檔**: `jest.config.js`, `jest.setup.js`

```bash
# 執行測試
pnpm test              # 單次執行
pnpm test:watch        # 監看模式
pnpm test:coverage     # 覆蓋率報告
```

</setup>

<file_location>

## 測試檔案位置

### 選項 A：`__tests__/` 目錄

```
src/features/auth/
├── components/
│   └── LoginForm.tsx
├── __tests__/
│   ├── LoginForm.test.tsx
│   └── actions.test.ts
└── actions.ts
```

### 選項 B：同層 `.test.ts` 檔案

```
src/features/auth/
├── components/
│   ├── LoginForm.tsx
│   └── LoginForm.test.tsx
└── actions.ts
```

本專案偏好 **選項 A**（`__tests__/` 目錄）。

</file_location>

<naming>

## 命名規範

### 測試描述

```typescript
describe("LoginForm", () => {
  // given [context]: [expected behavior]
  test("given valid credentials: submits successfully", () => {});
  test("given empty email: shows validation error", () => {});
  test("given server error: displays error message", () => {});
});
```

### 檔案命名

- 元件測試: `ComponentName.test.tsx`
- 函式測試: `functionName.test.ts`
- Hook 測試: `useHookName.test.ts`

</naming>

<aaa_pattern>

## AAA 模式

```typescript
import { render, screen, fireEvent } from "@testing-library/react";
import { LoginForm } from "../components/LoginForm";

describe("LoginForm", () => {
  test("given valid input: calls onSubmit with data", async () => {
    // Arrange - 準備測試資料和環境
    const mockOnSubmit = jest.fn();
    render(<LoginForm onSubmit={mockOnSubmit} />);

    // Act - 執行測試動作
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "登入" }));

    // Assert - 驗證結果
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
    });
  });
});
```

</aaa_pattern>

<mocking>

## Mock 技巧

### Mock 模組

```typescript
// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => "/dashboard",
}));

// Mock Server Action
jest.mock("@/features/auth/actions", () => ({
  loginAction: jest.fn(),
}));
```

### Mock Prisma

```typescript
// __mocks__/@/lib/db.ts
export const prisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};
```

</mocking>

<hooks_testing>

## Hook 測試

```typescript
import { renderHook, act } from "@testing-library/react";
import { useCounter } from "../useCounter";

describe("useCounter", () => {
  test("given initial value: returns that value", () => {
    const { result } = renderHook(() => useCounter(5));
    expect(result.current.count).toBe(5);
  });

  test("given increment called: increases count", () => {
    const { result } = renderHook(() => useCounter(0));

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });
});
```

</hooks_testing>

<best_practices>

## 最佳實踐

### ✅ DO

- 測試用戶行為，不測試實作細節
- 使用 `getByRole`, `getByLabelText` 而非 `getByTestId`
- 每個測試獨立，不依賴其他測試的狀態
- 使用 `waitFor` 處理非同步操作

### ❌ DON'T

- 不要測試 CSS 樣式
- 不要測試第三方套件的行為
- 不要 mock 太多（如果需要大量 mock，可能是代碼設計問題）

</best_practices>
