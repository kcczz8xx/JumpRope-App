# 文檔命名規範

## 任務資料夾命名

```
[task-id]-[feature-name]
例如：TASK-0001-course-enrollment
      TASK-0002-student-grouping
```

**task-id 格式**：
- `TASK-XXXX` - 按建立順序遞增
- 查看 `02-Tasks/_ACTIVE/` 中最大的 ID，+1 即可

## 任務內檔案命名

```
[priority]-[name].md
例如：00-task-info.yaml      # P0：任務定義
      01-Requirements.md     # P1：需求
      02-Technical-Plan.md   # P2：技術方案
      03-Implementation-Progress.md  # P3：進度
      04-Code-Changes.md     # P4：代碼變更
      05-Testing-Checklist.md # P5：測試
```

## 歸檔檔案命名

```
年份月份/[task-id]-[feature-name]/
例如：2026-02/TASK-0001-course-enrollment/
```

## 知識庫檔案命名

- 使用 `PascalCase-With-Hyphen.md` 格式
- 例如：`Next.js-15-Patterns.md`、`Prisma-7-Patterns.md`

## 參考檔案命名

- 使用描述性名稱加 `-` 分隔
- 例如：`Command-Cheatsheet.md`、`API-Endpoint-Catalog.md`
