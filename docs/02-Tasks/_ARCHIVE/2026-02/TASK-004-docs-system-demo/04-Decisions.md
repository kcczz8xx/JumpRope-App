# 決策記錄

## 2026-02-02-initial

### 決策：採用 Multi-Level AGENTS.md 架構

**背景**：需要讓 AI 在不同目錄下有不同的行為規範。

**選項**：
1. 單一 AGENTS.md 放根目錄
2. Multi-Level AGENTS.md（根目錄 + 各子目錄）

**決定**：選項 2

**理由**：
- Windsurf 支援 Automatic Scoping 功能
- 子目錄的 AGENTS.md 會自動限定作用範圍
- 讓 AI 在不同工作區域有更精確的指引

**影響**：
- 需維護多個 AGENTS.md 文件
- 更新規範時需考慮範圍層級
