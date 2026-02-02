# API Route Guidelines

**Scope**: API Route Handlers (`src/app/api/**`).

## Next.js 15 Route Handler 規範

使用具名導出的 HTTP 方法：

```typescript
// src/app/api/users/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // ...
  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  // ...
  return NextResponse.json({ success: true });
}
```

## 核心規則

1. **Response** — 使用 `NextResponse.json()` 返回 JSON
2. **Validation** — 使用 Zod 驗證 request body
3. **Error Handling** — 使用 try/catch 包裹，返回適當的 HTTP 狀態碼
4. **Auth** — 使用 `auth()` 檢查權限

## 優先使用 Server Actions

對於表單提交和 CRUD 操作，**優先使用 Server Actions** 而非 API Routes：

```typescript
// ✅ 優先：Server Action
"use server";
export async function createUser(data: FormData) { ... }

// ⚠️ 次選：API Route（用於外部 webhook、第三方整合）
export async function POST(request: NextRequest) { ... }
```

## 錯誤處理模板

```typescript
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = schema.parse(body);
    // ... 業務邏輯
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
```
