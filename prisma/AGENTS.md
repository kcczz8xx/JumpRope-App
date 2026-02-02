# Prisma Schema Guidelines

當處理 `prisma/` 目錄下的檔案時，遵循以下規範：

## Schema 變更流程

1. 修改 `schema.prisma`
2. 記錄到任務的 `04-Decisions.md`
3. 執行 `pnpm prisma:migrate <name>`
4. 更新 `docs/01-Architecture/01-Data-Models.md`

## 命名規範

- **Model**: PascalCase（`User`, `SchoolService`）
- **Field**: camelCase（`createdAt`, `userId`）
- **Enum**: PascalCase + UPPER_SNAKE_CASE 值

```prisma
enum Role {
  SUPER_ADMIN
  ADMIN
  USER
}
```

## 關聯定義

```prisma
model User {
  id       String   @id @default(cuid())
  posts    Post[]   // 一對多
  profile  Profile? // 一對一
}

model Post {
  id       String @id @default(cuid())
  author   User   @relation(fields: [authorId], references: [id])
  authorId String
}
```

## 常用指令

```bash
pnpm prisma:migrate <name>  # 建立 migration
pnpm prisma:deploy          # 部署 + 產生 Client
pnpm prisma:push            # 直接推送（prototyping）
pnpm prisma:studio          # GUI 工具
```

## 注意事項

- 使用 `@map` 和 `@@map` 控制資料庫命名
- 添加適當的 `@index` 優化查詢
- 使用 `@default(now())` 和 `@updatedAt` 處理時間戳
