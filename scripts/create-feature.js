#!/usr/bin/env node

/**
 * Feature Generator Script
 * 自動生成符合規範的 feature 目錄結構
 *
 * 使用方式：
 *   pnpm create:feature <feature-name>
 *
 * 範例：
 *   pnpm create:feature notification
 *   pnpm create:feature payment
 */

const fs = require("fs");
const path = require("path");

const featureName = process.argv[2];

if (!featureName) {
  console.error("❌ 請提供 feature 名稱");
  console.error("   用法：pnpm create:feature <feature-name>");
  console.error("   範例：pnpm create:feature notification");
  process.exit(1);
}

// 驗證名稱格式（kebab-case）
if (!/^[a-z][a-z0-9-]*$/.test(featureName)) {
  console.error("❌ Feature 名稱必須使用 kebab-case（小寫字母、數字、連字符）");
  console.error("   範例：notification, payment-gateway, user-profile");
  process.exit(1);
}

const featurePath = path.join(__dirname, "..", "src", "features", featureName);

// 檢查是否已存在
if (fs.existsSync(featurePath)) {
  console.error(`❌ Feature "${featureName}" 已存在於 src/features/`);
  process.exit(1);
}

// 建立目錄結構
const dirs = ["", "actions", "schemas", "queries", "components"];

dirs.forEach((dir) => {
  const dirPath = path.join(featurePath, dir);
  fs.mkdirSync(dirPath, { recursive: true });
});

// 轉換為 PascalCase（用於註釋）
const pascalCase = featureName
  .split("-")
  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
  .join("");

// 生成 index.ts
const indexContent = `/**
 * ${pascalCase} Feature - 公開 API
 *
 * ✅ 允許 import：Client Components、Server Components、頁面
 * ❌ 禁止 import：其他 features（用 Dependency Injection）
 *
 * Server-only exports 請用：
 * import { ... } from '@/features/${featureName}/server'
 */

// ===== Components =====
// export { default as ComponentName } from "./components/ComponentName";

// ===== Server Actions =====
// export { someAction } from "./actions";

// ===== Queries =====
// export { someQuery } from "./queries";

// ===== Schemas =====
// export { someSchema } from "./schemas";

// ===== Types =====
// export type { SomeInput } from "./schemas";
`;

// 生成 server.ts
const serverContent = `/**
 * ${pascalCase} Feature - Server-only exports
 * 僅供 Server Components 使用
 */

import "server-only";

// export { someQuery } from "./queries";
`;

// 生成 actions/index.ts
const actionsIndexContent = `/**
 * ${pascalCase} Actions - Index
 * 統一導出所有 Actions
 */

// export { someAction } from "./some-action";
`;

// 生成 actions/_template.ts（範例檔案）
const actionsTemplateContent = `"use server";

/**
 * ${pascalCase} Actions - 範例模板
 *
 * 使用 createAction wrapper 自動處理：
 * - Schema 驗證
 * - 認證檢查
 * - 審計日誌
 * - 錯誤處理
 *
 * 使用完成後請刪除此範例檔案
 */

import { createAction, success, failure } from "@/lib/patterns";
// import { someSchema, type SomeInput } from "../schemas/some";
import { z } from "zod";

// 臨時 schema（實際使用時請放到 schemas/ 目錄）
const exampleSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100),
});
type ExampleInput = z.infer<typeof exampleSchema>;

/**
 * 範例 Action
 */
export const exampleAction = createAction<ExampleInput, { message: string }>(
  async (input, ctx) => {
    // ctx.session 自動提供認證資訊
    if (!ctx.session?.user) {
      return failure("UNAUTHORIZED", "請先登入");
    }

    const { id, name } = input;

    // 你的業務邏輯...
    console.log(\`Processing: \${id}, \${name}\`);

    return success({ message: "操作成功" });
  },
  {
    schema: exampleSchema,
    requireAuth: true,
    audit: true,
    auditAction: "${featureName.toUpperCase().replace(/-/g, "_")}_ACTION",
    auditResource: "${featureName}",
    auditResourceId: (input) => input.id,
  }
);
`;

// 生成 schemas/index.ts
const schemasIndexContent = `/**
 * ${pascalCase} Schemas - Index
 * 統一導出所有 Schemas
 */

// export * from "./some-schema";
`;

// 生成 queries/index.ts
const queriesIndexContent = `/**
 * ${pascalCase} Queries - Index
 * 統一導出所有 Queries
 */

// export { someQuery } from "./some-query";
`;

// 寫入檔案
fs.writeFileSync(path.join(featurePath, "index.ts"), indexContent);
fs.writeFileSync(path.join(featurePath, "server.ts"), serverContent);
fs.writeFileSync(
  path.join(featurePath, "actions", "index.ts"),
  actionsIndexContent
);
fs.writeFileSync(
  path.join(featurePath, "actions", "_template.ts"),
  actionsTemplateContent
);
fs.writeFileSync(
  path.join(featurePath, "schemas", "index.ts"),
  schemasIndexContent
);
fs.writeFileSync(
  path.join(featurePath, "queries", "index.ts"),
  queriesIndexContent
);

console.log(`✅ Feature "${featureName}" 已建立！`);
console.log("");
console.log("📁 目錄結構：");
console.log(`   src/features/${featureName}/`);
console.log("   ├── actions/");
console.log("   │   ├── index.ts");
console.log("   │   └── _template.ts   ← createAction 範例");
console.log("   ├── schemas/");
console.log("   │   └── index.ts");
console.log("   ├── queries/");
console.log("   │   └── index.ts");
console.log("   ├── components/");
console.log("   ├── index.ts");
console.log("   └── server.ts");
console.log("");
console.log("📖 下一步：");
console.log("   1. 參考 actions/_template.ts 建立你的 Server Actions");
console.log("   2. 在 schemas/ 建立對應的 Zod schemas");
console.log("   3. 在 queries/ 建立資料查詢函式");
console.log("   4. 更新各個 index.ts 導出");
console.log("   5. 刪除 actions/_template.ts（完成後）");
console.log("");
console.log(`📚 參考規範：src/features/STRUCTURE.md`);
