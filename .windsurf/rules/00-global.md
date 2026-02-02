<activation_mode>always_on</activation_mode>

<global_rules>

# 全局開發規則

本規則適用於所有代碼變更，無條件啟用。

</global_rules>

<language>

## 語言要求

- 所有回覆使用**繁體中文**
- 程式碼註解可用英文
- 變數/函式名稱用英文

</language>

<code_style>

## 代碼風格

- **縮排**: 2 空格
- **引號**: 單引號
- **分號**: 必須
- **路徑別名**: `@/` 指向 `src/`
- **命名規範**:
  - React 元件: `PascalCase.tsx`
  - 函式/變數: `camelCase`
  - 常數: `UPPER_SNAKE_CASE`
  - 型別/介面: `PascalCase`

</code_style>

<imports>

## Import 規範

```typescript
// 順序：外部套件 → 內部模組 → 相對路徑 → 型別
import { useState } from "react";
import { Button } from "@/components/ui";
import { loginAction } from "@/features/auth";
import { formatDate } from "./utils";
import type { User } from "@/features/user";
```

- 使用 `eslint-plugin-simple-import-sort` 自動排序
- 型別 import 使用 `import type`

</imports>

<path_aliases>

## 路徑別名對照

| 別名           | 實際路徑         |
| :------------- | :--------------- |
| `@/app`        | `src/app`        |
| `@/features`   | `src/features`   |
| `@/components` | `src/components` |
| `@/lib`        | `src/lib`        |
| `@/hooks`      | `src/hooks`      |

### 已棄用路徑

| ❌ 舊路徑   | ✅ 新路徑             |
| :---------- | :-------------------- |
| `@/utils`   | `@/lib/utils`         |
| `@/layout`  | `@/components/layout` |
| `@/context` | `@/lib/providers`     |

</path_aliases>

<commits>

## 提交規範

使用 Conventional Commits：

- `feat:` 新功能
- `fix:` 錯誤修復
- `docs:` 文檔更新
- `chore:` 維護任務
- `refactor:` 重構
- `test:` 測試相關
- `style:` 格式調整

</commits>

<security>

## 安全規範

- ✅ 所有 user input 必須通過 Zod 驗證
- ✅ Server Actions 必須加 `"use server"` 標記
- ✅ 使用 NextAuth `auth()` 檢查權限
- ❌ 不要在 Client Components 暴露敏感邏輯
- ❌ 不要硬編碼 API keys 或密碼

</security>
