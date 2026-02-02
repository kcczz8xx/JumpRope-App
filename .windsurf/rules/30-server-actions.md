<activation_mode>manual</activation_mode>
<trigger_phrase>@server-action</trigger_phrase>

<server_actions_rules>

# Server Actions 開發規則

使用 `@server-action` 觸發此規則。

</server_actions_rules>

<structure>

## 標準結構

```typescript
// src/features/[feature]/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createUserSchema } from "./schema";
import type { ActionResult } from "./types";

export async function createUserAction(
  input: z.infer<typeof createUserSchema>
): Promise<ActionResult> {
  // 1. 驗證權限（如需要）
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "未授權" };
  }

  // 2. 驗證輸入
  const validated = createUserSchema.safeParse(input);
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.flatten().fieldErrors,
    };
  }

  // 3. 執行業務邏輯
  try {
    const user = await prisma.user.create({
      data: validated.data,
    });

    // 4. 重新驗證快取（如需要）
    revalidatePath("/dashboard/users");

    // 5. 返回結果
    return { success: true, data: user };
  } catch (error) {
    console.error("[createUserAction]", error);
    return { success: false, error: "建立失敗" };
  }
}
```

</structure>

<steps>

## 開發步驟

1. **建立 Schema** (`schema.ts`)

   ```typescript
   import { z } from "zod";

   export const createUserSchema = z.object({
     name: z.string().min(1, "名稱必填"),
     email: z.string().email("Email 格式錯誤"),
   });
   ```

2. **定義型別** (`types.ts`)

   ```typescript
   export type ActionResult<T = unknown> =
     | { success: true; data: T }
     | { success: false; error: string | Record<string, string[]> };
   ```

3. **建立 Action** (`actions.ts`)

   - 加上 `"use server"` 標記
   - 驗證權限 → 驗證輸入 → 執行邏輯 → 返回結果

4. **匯出** (`index.ts`)
   ```typescript
   export { createUserAction } from "./actions";
   export { createUserSchema } from "./schema";
   export type { ActionResult } from "./types";
   ```

</steps>

<patterns>

## 常用模式

### 表單提交

```tsx
"use client";

import { useTransition } from "react";
import { createUserAction } from "@/features/user";

function CreateUserForm() {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await createUserAction({
        name: formData.get("name") as string,
        email: formData.get("email") as string,
      });

      if (result.success) {
        // 成功處理
      } else {
        // 錯誤處理
      }
    });
  };

  return (
    <form action={handleSubmit}>
      {/* 表單欄位 */}
      <button type="submit" disabled={isPending}>
        {isPending ? "處理中..." : "提交"}
      </button>
    </form>
  );
}
```

### 樂觀更新

```tsx
"use client";

import { useOptimistic } from "react";

function LikeButton({ initialLikes }: { initialLikes: number }) {
  const [optimisticLikes, addOptimisticLike] = useOptimistic(
    initialLikes,
    (state) => state + 1
  );

  const handleLike = async () => {
    addOptimisticLike(null);
    await likeAction();
  };

  return <button onClick={handleLike}>{optimisticLikes} Likes</button>;
}
```

</patterns>

<anti_patterns>

## 避免事項

```typescript
// ❌ 不要在 Action 內 redirect 後還返回值
export async function badAction() {
  redirect("/dashboard"); // redirect 會拋出異常
  return { success: true }; // 永遠不會執行
}

// ✅ redirect 應該是最後一步
export async function goodAction() {
  await prisma.user.update({ ... });
  redirect("/dashboard");
}

// ❌ 不要缺少 "use server"
export async function forgotDirective() { ... }

// ❌ 不要直接拋出錯誤給 Client
export async function badErrorHandling() {
  throw new Error("敏感錯誤訊息"); // 會暴露給 Client
}

// ✅ 返回結構化錯誤
export async function goodErrorHandling() {
  return { success: false, error: "操作失敗" };
}
```

</anti_patterns>
