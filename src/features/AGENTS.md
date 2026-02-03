# Feature Module Guidelines

**Scope**: All feature modules (`src/features/**`).

> 📖 詳細規範請參考 [STRUCTURE.md](./STRUCTURE.md)

## 當前模組

| 模組             | 用途                                         |
| :--------------- | :------------------------------------------- |
| `_core`          | 跨 feature 共用（錯誤碼、權限、審計、常數）  |
| `auth`           | 認證（登入、註冊、OTP、密碼重設）            |
| `user`           | 用戶（個人資料、地址、銀行、子女、導師文件） |
| `school-service` | 學校服務（學校、課程管理）                   |

## 核心規則

1. **Public API** — 透過 `index.ts` 導出公開介面
2. **Server-only** — 透過 `server.ts` 分離 server-only exports
3. **封裝性** — 不直接 import 其他 feature 內部檔案
4. **Colocation** — 功能專用 components、hooks、actions 放此目錄

## Import 規則

```typescript
// ✅ 正確：透過功能的公開 API
import { SignInForm, sendOtpAction } from "@/features/auth";
import { getSchoolByIdAction } from "@/features/school-service";

// ✅ 正確：Server-only imports（僅限 Server Components）
import { getProfile } from "@/features/user/server";

// ❌ 錯誤：直接 import 內部檔案
import { SignInForm } from "@/features/auth/components/SignInForm";
```

## 依賴流向

```
app/ → features/ → lib/
                 → components/ui/
                 → _core/
```

- **可以** import `@/lib/*`、`@/components/ui/*`、`@/features/_core`
- **不應** 跨 feature import（如需共用，提取到 `lib/` 或 `_core/`）
