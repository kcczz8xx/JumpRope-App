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
const dirs = [
  "",
  "actions",
  "schemas",
  "queries",
  "components",
];

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
fs.writeFileSync(path.join(featurePath, "actions", "index.ts"), actionsIndexContent);
fs.writeFileSync(path.join(featurePath, "schemas", "index.ts"), schemasIndexContent);
fs.writeFileSync(path.join(featurePath, "queries", "index.ts"), queriesIndexContent);

console.log(`✅ Feature "${featureName}" 已建立！`);
console.log("");
console.log("📁 目錄結構：");
console.log(`   src/features/${featureName}/`);
console.log("   ├── actions/");
console.log("   │   └── index.ts");
console.log("   ├── schemas/");
console.log("   │   └── index.ts");
console.log("   ├── queries/");
console.log("   │   └── index.ts");
console.log("   ├── components/");
console.log("   ├── index.ts");
console.log("   └── server.ts");
console.log("");
console.log("📖 下一步：");
console.log("   1. 在 actions/ 建立你的 Server Actions");
console.log("   2. 在 schemas/ 建立對應的 Zod schemas");
console.log("   3. 在 queries/ 建立資料查詢函式");
console.log("   4. 更新各個 index.ts 導出");
console.log("");
console.log(`📚 參考規範：src/features/STRUCTURE.md`);
