# 測試清單

## 編譯驗證

- [x] `pnpm build` 通過
- [x] 無 TypeScript 編譯錯誤（user feature 相關）

## Import 路徑驗證

- [x] `import { updateProfileAction } from "@/features/user"` 正常運作
- [x] `import { getProfile } from "@/features/user"` 正常運作
- [x] `import { updateProfileSchema } from "@/features/user"` 正常運作
- [x] `import type { UpdateProfileInput } from "@/features/user"` 正常運作

## 功能測試（建議手動驗證）

- [ ] Profile 更新功能
- [ ] Address 更新/刪除功能
- [ ] Bank 更新/刪除功能
- [ ] Children 新增/更新/刪除功能
- [ ] Tutor Documents 上傳/更新/刪除功能

## 備註

由於是純重構（不改變業務邏輯），功能測試預期全部通過。建議在下次使用相關功能時順便驗證。
