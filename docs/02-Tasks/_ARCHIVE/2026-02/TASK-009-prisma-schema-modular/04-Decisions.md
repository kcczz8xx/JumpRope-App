# 決策記錄

## DEC-001: Schema 拆分粒度

**日期**: 2026-02-02

**決策**: 按業務模組拆分，而非按 model 類型拆分

**原因**:
- 相關 models 放在一起更易維護
- 符合 Feature-First 架構理念
- 業務邏輯變更時只需修改單一資料夾

**結構**:
```
school/
├── _enums.prisma      # 所有 enums 集中
├── school.prisma      # School + Contact
├── quotation/         # 報價相關
├── course/            # 課程相關
├── lesson/            # 課堂相關
└── invoice/           # 發票相關
```

## DEC-002: Enum 放置位置

**日期**: 2026-02-02

**決策**: School 模組的 enums 放在 `school/_enums.prisma`

**原因**:
- 這些 enums 只在 school 模組使用
- 集中管理避免重複定義
- 使用 `_` 前綴表示非 model 檔案
