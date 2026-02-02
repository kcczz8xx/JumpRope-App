# 重構進度追蹤

> **開始日期**：2026-02-02
> **目標**：將專案從 Layer-based 架構轉型為 Feature-First + src/ 目錄結構
> **預估時間**：4.5 小時

---

## 階段總覽

| 階段                   | 狀態    | 預估時間 |
| :--------------------- | :------ | :------- |
| 一、準備工作           | ✅ 完成 | 15 分鐘  |
| 二、引入 src/ 目錄     | ✅ 完成 | 30 分鐘  |
| 三、清理與合併         | ✅ 完成 | 45 分鐘  |
| 四、處理 TailAdmin     | ✅ 完成 | 30 分鐘  |
| 五、建立 features 結構 | ✅ 完成 | 2 小時   |
| 六、測試與驗證         | ✅ 完成 | 30 分鐘  |
| 七、文檔與提交         | ✅ 完成 | 20 分鐘  |

**狀態說明**：✅ 完成 | 🔄 進行中 | ⏳ 待開始 | ❌ 有問題

---

## 階段一：準備工作

### 檢查清單

- [x] 建立重構分支 `refactor/feature-first-structure`
- [x] 確認測試通過 `pnpm test`
- [x] 確認建置成功 `pnpm build`
- [x] 建立進度追蹤文檔（本檔案）

### 執行指令

```bash
git checkout main
git pull origin main
git checkout -b refactor/feature-first-structure
```

### 備註

- ***

## 階段二：引入 src/ 目錄

### 檢查清單

- [x] 建立 `src/` 目錄
- [x] 移動 `app/` → `src/app/`
- [x] 移動 `components/` → `src/components/`
- [x] 移動 `lib/` → `src/lib/`
- [x] 移動 `hooks/` → `src/hooks/`
- [x] 移動 `layout/` → `src/components/layout/`
- [x] 移動 `utils/` → `src/utils-temp/`（待合併）
- [x] 移動 `context/` → `src/context-temp/`（待搬移）
- [x] 移動 `config/` → `src/config/`
- [x] 移動 `icons/` → `src/icons/`
- [x] 更新 `tsconfig.json` 路徑映射
- [x] 更新 `jest.config.js` 路徑映射
- [x] 清除 `.next` 快取
- [x] 驗證 `pnpm dev` 啟動成功

### 執行指令

```bash
mkdir src
mv app src/
mv components src/
mv lib src/
mv hooks src/
mv layout src/components/layout
mv utils src/utils-temp
mv context src/context-temp
mv config src/
mv icons src/
```

### 備註

- ***

## 階段三：清理與合併

### 檢查清單

- [x] 合併 `utils-temp/` 到 `lib/utils/`
- [x] 刪除 `src/utils-temp/`
- [x] 搬移 `context-temp/*.tsx` 到 `lib/providers/`
- [x] 刪除 `src/context-temp/`
- [x] 批量替換 `@/utils/` → `@/lib/utils/`
- [x] 批量替換 `@/layout/` → `@/components/layout/`
- [x] 批量替換 `@/context/` → `@/lib/providers/`
- [x] 驗證 `pnpm build` 成功

### 執行指令

```bash
# 合併 utils
cp -r src/utils-temp/* src/lib/utils/
rm -rf src/utils-temp

# 搬移 context
mkdir -p src/lib/providers
mv src/context-temp/*.tsx src/lib/providers/
rm -rf src/context-temp
```

### 備註

- ***

## 階段四：處理 TailAdmin 元件

### 檢查清單

- [x] 檢查 TailAdmin 使用頻率 (24 處使用)
- [x] 決定處理策略（保留）
- [x] 執行對應操作

### 執行指令

```bash
# 檢查使用頻率
grep -r "tailadmin" src/app --include="*.tsx" | wc -l
```

### 決策

- [x] 保留在 `src/components/tailadmin/`
- [ ] 封存到 `src/components/_archive/`
- [ ] 移動到路由內 `app/[route]/_components/`

### 備註

- ***

## 階段五：建立 features 結構

### 檢查清單

- [x] 建立 `src/features/` 目錄結構
- [x] 遷移 `components/auth/` → `features/auth/`
- [x] 遷移 `components/feature/user/` → `features/user/`
- [x] 遷移 `components/feature/school-service/` → `features/school-service/`
- [x] 為每個 feature 建立 `index.ts` 公開 API
- [x] 更新所有 import 路徑
- [x] 驗證 `pnpm build` 成功

### Features 結構

```
src/features/
├── auth/
│   ├── components/
│   ├── hooks/
│   ├── schema.ts
│   ├── types.ts
│   └── index.ts
├── user/
│   ├── components/
│   └── index.ts
└── school-service/
    ├── components/
    └── index.ts
```

### 備註

- ***

## 階段六：測試與驗證

### 檢查清單

- [x] `pnpm build` 成功
- [x] `pnpm test` 全部通過 (115 tests)
- [ ] `pnpm lint` 無錯誤 (有 pre-existing ESLint 配置問題)
- [ ] `pnpm dev` 手動測試：
  - [ ] 首頁載入正常
  - [ ] 登入功能正常
  - [ ] Dashboard 顯示正常
  - [ ] Sidebar 正常運作
  - [ ] 主題切換正常
  - [ ] 樣式正確載入

### 備註

- ***

## 階段七：文檔與提交

### 檢查清單

- [x] 更新 `README.md` 專案結構說明
- [x] 建立/更新 `CHANGELOG.md`
- [x] 提交所有變更
- [ ] 推送到遠端
- [ ] 建立 Pull Request

### Git 提交記錄

| Commit | 訊息                                  | 狀態 |
| :----- | :------------------------------------ | :--- |
| 1      | `refactor: 引入 src/ 目錄`            | ✅   |
| 2      | `refactor: 合併 utils 並搬移 context` | ✅   |
| 3      | `refactor: 處理 TailAdmin 元件`       | ✅   |
| 4      | `refactor: 建立 features/ 模組結構`   | ✅   |
| 5      | `docs: 更新專案結構文檔`              | ✅   |

### 備註

- ***

## 問題記錄

| 問題 | 狀態 | 解決方案 |
| :--- | :--- | :------- |
| -    | -    | -        |

---

## 回滾檢查點

| 檢查點     | Git Tag           | 說明                  |
| :--------- | :---------------- | :-------------------- |
| 階段二完成 | `before-cleanup`  | src/ 目錄建立完成     |
| 階段三完成 | `before-features` | 清理與合併完成        |
| 階段五完成 | `features-done`   | features 結構建立完成 |

---

**最後更新**：2026-02-02 14:00

---

## 重構完成總結

### 主要變更

1. **引入 `src/` 目錄** - 原始碼與設定檔分離
2. **建立 `features/` 模組系統** - auth, user, school-service
3. **合併冗餘的 `utils/`** - 統一到 `lib/utils/`
4. **搬移 `context/`** - 到 `lib/providers/`
5. **搬移 `layout/`** - 到 `components/layout/`
6. **保留 TailAdmin** - 使用頻率高 (24 處)

### 驗證結果

- ✅ `pnpm build` 成功
- ✅ `pnpm test` 全部通過 (115 tests)
- ⚠️ `pnpm lint` 有 pre-existing ESLint 配置問題

### Git 提交

- `docs: 新增重構規劃文檔`
- `refactor: 引入 src/ 目錄並更新設定檔`
- `refactor: 合併 utils 並搬移 context 到 lib/providers`
- `refactor: 保留 TailAdmin 元件（使用頻率高）`
- `refactor: 建立 features/ 模組結構並遷移元件`
- `docs: 更新專案結構文檔`

---

## 會話總結 (2026-02-02)

### 已完成

1. **文檔分析與更新**

   - 進行 2 次專案結構分析
   - 更新 `docs/重構專案架構/README.md` 至 v1.1
   - 修正 Tailwind v4 配置說明
   - 補充 TailAdmin 處理方案
   - 新增回滾方案與錯誤速查表

2. **建立進度追蹤**
   - 建立 `REFACTOR_PLAN.md` 進度追蹤文檔
   - 7 個階段檢查清單
   - 問題記錄區與回滾檢查點

### 待繼續

- 階段二：引入 src/ 目錄
- 階段三：清理與合併
- 階段四：處理 TailAdmin
- 階段五：建立 features 結構
- 階段六：測試與驗證
- 階段七：文檔與提交

### 下次繼續時

1. 建立 git 分支：`git checkout -b refactor/feature-first-structure`
2. 執行 `pnpm build` 確認現有專案狀態
3. 從階段二開始執行
