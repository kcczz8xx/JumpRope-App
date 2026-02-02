# JumpRope-App 開發指引系統

> 以文檔夾為數據來源的迭代開發管理系統  
> **版本**：1.0.0 | **建立日期**：2026-02-02 | **管理人**：AI Developer  
> **專案**：JumpRope-App (Next.js 15 + Neon + Prisma 7.3)

---

## 🎯 系統目標

1. **清晰的知識管理** - 每個對話生成嘅文檔按文件夾分類存放
2. **快速迭代開發** - 減少重複解釋，建立可復用嘅指引模板
3. **完整的追蹤記錄** - 功能進度、技術決策、已知 Bug 全數記錄
4. **AI 與人類協作** - AI 管理文檔組織，人類專注代碼實現

---

## 📂 系統架構

### 核心文件夾結構

```
docs/
├── 00-Context/                    # 📋 業務與技術背景
│   ├── 01-Project-Overview.md     # 項目總體描述
│   ├── 02-Tech-Stack.md           # 技術棧詳解
│   └── 03-Key-Concepts.md         # 核心概念與業務規則
│
├── 01-Architecture/               # 🏗️ 系統架構文檔
│   ├── 00-System-Design.md        # 系統整體設計
│   ├── 01-Data-Models.md          # Prisma Schema 解析
│   ├── 02-API-Routes.md           # API 路由架構
│   ├── 03-Components-Structure.md # React 組件架構
│   ├── decisions.md               # 架構決策記錄 (Decision Snapshot)
│   └── _assets/                   # 架構圖表 (PNG/SVG)
│
├── 02-Tasks/                      # 📝 開發任務管理
│   ├── _ACTIVE/                   # 🔴 進行中任務
│   │   └── [task-id]-feature-name/
│   │       ├── 00-task-info.yaml           # 任務元資訊
│   │       ├── 01-Requirements.md          # 需求分析
│   │       ├── 02-Technical-Plan.md        # 技術方案
│   │       ├── 03-Implementation-Progress.md # 實施進度
│   │       ├── 04-Code-Changes.md          # 代碼變更說明
│   │       ├── 05-Testing-Checklist.md     # 測試清單
│   │       └── _code-samples/              # 代碼片段存檔
│   │
│   ├── _PAUSED/                   # ⏸️ 暫停任務
│   │   └── [task-id]-feature-name/
│   │       ├── 00-pause-reason.md          # 暫停原因
│   │       └── 01-pause-state.yaml         # 暫停狀態快照
│   │
│   └── _ARCHIVE/                  # ✅ 已完成任務
│       └── 2026-02/
│           └── [task-id]-feature-name/
│               ├── 00-completion-report.md      # 完成報告
│               ├── 01-changeset-summary.md      # 變更集摘要
│               ├── 02-test-results.md           # 測試結果
│               ├── 03-lessons-learned.md        # 經驗總結
│               └── _final-code-snapshot/        # 最終代碼快照
│
├── 03-Knowledge-Base/             # 📚 知識庫
│   ├── Next.js-15-Patterns.md     # Next.js 15 最佳實踐
│   ├── Prisma-7-Patterns.md       # Prisma 7.3 最佳實踐
│   ├── TypeScript-Standards.md    # TS 代碼規範
│   ├── API-Integration-Guide.md   # API 集成指南
│   ├── Error-Handling.md          # 錯誤處理規範
│   └── Performance-Optimization.md # 性能優化指南
│
├── 04-Reference/                  # 🔍 快速參考
│   ├── Command-Cheatsheet.md      # 常用命令速查
│   ├── File-Structure-Map.md      # 完整檔案樹圖
│   ├── Dependencies-Tree.md       # 依賴關係樹
│   ├── API-Endpoint-Catalog.md    # API 端點目錄
│   └── Component-Registry.md      # 組件註冊表
│
├── 05-Issues-Log/                 # 🐛 問題與解決方案
│   ├── Known-Issues.md            # 已知問題列表
│   ├── Bug-Fixes-Log.md           # Bug 修復記錄
│   ├── Performance-Issues.md       # 性能問題
│   └── Resolved-Challenges.md      # 已解決的挑戰
│
├── 06-Deployment/                 # 🚀 部署與運維
│   ├── Deployment-Guide.md        # 部署指南
│   ├── Environment-Config.md       # 環境配置
│   ├── Monitoring-Alerts.md       # 監控告警
│   └── Rollback-Procedures.md      # 回滾流程
│
└── 99-Meta/                       # ⚙️ 系統元配置
    ├── .index.yaml                # 文檔索引（AI 讀取）
    ├── .structure.txt              # 結構說明
    ├── naming-conventions.md       # 命名規範
    ├── doc-template-guide.md       # 文檔模板指南
    └── maintenance-log.md          # 系統維護記錄
```

---

## 📋 各層級說明

### Layer 0: Context（業務背景）
**目的**：新開發者快速理解業務與技術背景  
**內容**：
- 項目簡介、用戶角色、業務流程
- 技術棧版本、依賴列表、架構概述
- 核心概念解釋（如「課程報名」「學員分組」等業務邏輯）

**AI 職責**：定期檢視更新，確保文檔與實際代碼同步

---

### Layer 1: Architecture（系統設計）
**目的**：理解系統如何組織與運作  
**內容**：
- 系統整體架構圖
- Prisma Schema 完整解析（Models、Relations、Indexes）
- API 路由設計（端點、方法、參數、返回值）
- React 組件樹結構
- 架構決策記錄（ADR）

**AI 職責**：
- 每次修改 schema 或路由時自動更新對應文檔
- 記錄重要架構決策（為什麼這樣做）

---

### Layer 2: Tasks（開發任務）
**目的**：管理當前與過往開發任務的完整生命週期  
**結構**：按 `_ACTIVE`, `_PAUSED`, `_ARCHIVE` 分類

**每個任務資料夾包含**：
1. **00-task-info.yaml** - 任務元資訊（ID、標題、優先級、預估時數、狀態）
2. **01-Requirements.md** - 需求分析與驗收標準
3. **02-Technical-Plan.md** - 技術方案（哪些檔案改、API 設計、Schema 變更等）
4. **03-Implementation-Progress.md** - 實施進度追蹤（實時更新）
5. **04-Code-Changes.md** - 代碼變更說明（提交摘要、重點改動）
6. **05-Testing-Checklist.md** - 測試清單與結果
7. **_code-samples/** - 關鍵代碼片段存檔

**狀態流轉**：
```
建立 → _ACTIVE ⇄ _PAUSED → _ARCHIVE (依月份：2026-02/)
```

**AI 職責**：
- 每次對話完成時生成任務進度更新
- 任務完成後自動生成完成報告並存檔

---

### Layer 3: Knowledge-Base（知識庫）
**目的**：累積技術最佳實踐與模式  
**內容**：
- Next.js 15 最佳實踐（Server Components、Data Fetching、Error Handling）
- Prisma 7.3 最佳實踐（Schema 設計、Query 優化、Relations）
- TypeScript 代碼規範（介面定義、型別推導、通用型別）
- API 集成指南（認證、速率限制、錯誤處理）
- 性能優化指南（渲染優化、查詢優化、緩存策略）

**AI 職責**：
- 在知識庫中記錄每次開發中發現的最佳實踐
- 定期組織與歸納知識（避免重複）

---

### Layer 4: Reference（快速參考）
**目的**：快速查閱常用資訊  
**內容**：
- 命令速查表（pnpm 命令、git 命令、開發工具）
- 完整檔案樹圖
- 依賴關係樹
- API 端點目錄（所有路由）
- 組件註冊表（所有 React 組件）

**AI 職責**：
- 定期自動生成最新的檔案樹、依賴樹、API 目錄

---

### Layer 5: Issues-Log（問題記錄）
**目的**：記錄並解決開發中遇到的問題  
**內容**：
- 已知問題列表（優先級、影響範圍、臨時方案）
- Bug 修復記錄（症狀、根因、解決方案、測試結果）
- 性能問題（監控數據、最佳化方案）
- 已解決的挑戰（複雜技術難點的解決思路）

**AI 職責**：
- 每當發現 Bug 或挑戰時自動記錄
- 定期清理已解決的問題

---

### Layer 6: Deployment（部署運維）
**目的**：管理部署與運維流程  
**內容**：
- 部署指南（步驟、檢查清單）
- 環境配置（開發、測試、生產）
- 監控告警（關鍵指標、告警閾值）
- 回滾流程（緊急措施）

**AI 職責**：
- 記錄每次部署的檢查結果
- 監控告警觸發時記錄根因

---

### Layer 99: Meta（系統元配置）
**目的**：管理文檔系統本身  
**內容**：
- `.index.yaml` - 文檔索引（讓 AI 快速定位文件）
- `.structure.txt` - 結構說明（本檔案）
- `naming-conventions.md` - 命名規範
- `doc-template-guide.md` - 文檔模板與示例
- `maintenance-log.md` - 系統維護記錄

**AI 職責**：
- 定期檢查文檔索引是否最新
- 當新增文件夾或檔案類型時更新命名規範

---

## 🔄 工作流程

### 新功能開發流程

```
1️⃣ 需求確認
   └─ 用戶提出需求
   └─ AI 在 02-Tasks/_ACTIVE 建立新資料夾：[task-id]-feature-name
   └─ AI 生成 01-Requirements.md（需求分析）

2️⃣ 技術設計
   └─ AI 分析影響範圍（Prisma Schema 變更？API 新增？組件改動？）
   └─ AI 生成 02-Technical-Plan.md（詳細技術方案）
   └─ 更新 docs/01-Architecture/* 相關文檔

3️⃣ 代碼實現
   └─ 人類編寫代碼（遵循 TS 規範）
   └─ AI 追蹤進度，更新 03-Implementation-Progress.md
   └─ 在 _code-samples/ 存檔關鍵代碼片段

4️⃣ 測試驗證
   └─ 執行測試清單（05-Testing-Checklist.md）
   └─ 記錄測試結果

5️⃣ 任務完成
   └─ 生成 04-Code-Changes.md（變更摘要）
   └─ 生成完成報告（00-completion-report.md）
   └─ 將任務資料夾移動到 _ARCHIVE/2026-02/
   └─ 更新主架構文檔（docs/01-Architecture/*）
   └─ 生成經驗總結（03-lessons-learned.md）
```

### 對話結束時 AI 檢查清單

- [ ] 任務進度是否已更新到 03-Implementation-Progress.md？
- [ ] 是否有新的架構決策需要記錄到 01-Architecture/decisions.md？
- [ ] 是否有新的知識點需要記錄到 03-Knowledge-Base/?
- [ ] 是否有 Bug 或問題需要記錄到 05-Issues-Log/?
- [ ] 是否需要更新 04-Reference 中的目錄或速查表？
- [ ] Prisma Schema 有改動嗎？需要更新 01-Architecture/01-Data-Models.md
- [ ] API 路由有新增嗎？需要更新 01-Architecture/02-API-Routes.md
- [ ] 組件結構有變化嗎？需要更新 01-Architecture/03-Components-Structure.md

---

## 💾 文檔命名規範

### 任務資料夾命名
```
[task-id]-[feature-name]
例如：TASK-0001-course-enrollment
      TASK-0002-student-grouping
```

**task-id 格式**：
- `TASK-XXXX` - 按建立順序遞增
- 查看 `02-Tasks/_ACTIVE/` 中最大的 ID，+1 即可

### 任務內檔案命名
```
[priority]-[name].md
例如：00-task-info.yaml      # P0：任務定義
      01-Requirements.md     # P1：需求
      02-Technical-Plan.md   # P2：技術方案
      03-Implementation-Progress.md  # P3：進度
      04-Code-Changes.md     # P4：代碼變更
      05-Testing-Checklist.md # P5：測試
```

### 歸檔檔案命名
```
年份月份/[task-id]-[feature-name]/
例如：2026-02/TASK-0001-course-enrollment/
```

---

## 🔍 快速查找指南

| 我想... | 看這裡 |
|--------|--------|
| 了解項目背景 | `00-Context/01-Project-Overview.md` |
| 查看技術棧 | `00-Context/02-Tech-Stack.md` |
| 理解 Prisma Schema | `01-Architecture/01-Data-Models.md` |
| 查所有 API 端點 | `04-Reference/API-Endpoint-Catalog.md` |
| 檢視進行中任務 | `02-Tasks/_ACTIVE/[task-id]-*/` |
| 查前月完成任務 | `02-Tasks/_ARCHIVE/2026-01/` |
| 了解最佳實踐 | `03-Knowledge-Base/` 任意檔案 |
| 找已知 Bug | `05-Issues-Log/Known-Issues.md` |
| 查命令速查 | `04-Reference/Command-Cheatsheet.md` |

---

## 📊 系統狀態儀表板

### 當前配置
| 項目 | 狀態 | 備註 |
|------|------|------|
| 系統版本 | 1.0.0 | 初始版本 |
| 建立日期 | 2026-02-02 | - |
| 進行中任務 | 0 | - |
| 已完成任務 | 0 | - |
| 已知問題 | 0 | - |
| 最後更新 | - | 待更新 |

---

## 📌 重點規則

### 禁止事項 ❌
- ❌ 直接修改已完成的任務文檔（應存檔）
- ❌ 在多個地方重複記錄同一信息（Single Source of Truth）
- ❌ 在任務文檔中存放代碼（使用 `_code-samples/` 資料夾）
- ❌ 忘記更新相應的架構文檔（Schema/API 變更必須同步）

### 必做事項 ✅
- ✅ 每次對話完成時更新任務進度
- ✅ 任務完成後生成完成報告並存檔
- ✅ 記錄每次重要的架構決策
- ✅ 定期更新 04-Reference 的快速查找表
- ✅ 發現 Bug 時立即記錄到 05-Issues-Log

---

## 🚀 初始化步驟

1. **創建目錄結構**
   ```bash
   mkdir -p docs/{00-Context,01-Architecture,02-Tasks/{_ACTIVE,_PAUSED,_ARCHIVE},03-Knowledge-Base,04-Reference,05-Issues-Log,06-Deployment,99-Meta}
   ```

2. **填充初始文檔** - 使用提供的模板
   
3. **建立第一個任務** - 試著建立 `TASK-0001` 測試流程

4. **配置 AI 讀取** - 在 `.cursorrules` 中指向 `docs/99-Meta/.index.yaml`

---

## 📞 版本記錄

| 版本 | 日期 | 變更 |
|------|------|------|
| 1.0.0 | 2026-02-02 | 初始版本完成 |

---

**最後更新**：2026-02-02  
**下一步**：根據你的反饋優化結構，然後開始執行第一個任務！

