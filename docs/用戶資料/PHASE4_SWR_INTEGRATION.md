# Phase 4: SWR Hooks 整合到 Modal 組件

> **完成日期**：2026-02-02

## 概述

本次更新將 SWR Hooks 整合到用戶資料的 Card 和 Modal 組件，實現自動快取更新和更好的用戶體驗。

---

## 變更摘要

### 重構的組件

| 組件 | 變更 | 使用的 Hooks |
|------|------|--------------|
| `UserInfoCard` | 整合 SWR | `useUpdateProfile()` |
| `UserAddressCard` | 整合 SWR | `useUpdateAddress()`, `useDeleteAddress()` |
| `UserBankCard` | 整合 SWR | `useUpdateBank()`, `useDeleteBank()` |
| `ProfilePageContent` | 新建 | `useUserProfile()`, `useUserAddress()`, `useUserBank()` |

### 新建的組件

| 組件 | 路徑 | 說明 |
|------|------|------|
| `ProfilePageContent` | `components/feature/user/profile/ProfilePageContent.tsx` | 客戶端組件，整合 SWR 資料獲取 |

---

## 技術細節

### 1. UserInfoCard 重構

**之前**：手動 `fetch()` + `useState` 管理 loading 狀態

```typescript
const [isLoading, setIsLoading] = useState(false);
const handleSave = async (data) => {
  setIsLoading(true);
  const response = await fetch("/api/user/profile", { ... });
  // 手動更新本地狀態
  setIsLoading(false);
};
```

**之後**：使用 `useUpdateProfile()` Hook

```typescript
const { isSubmitting, submit } = useUpdateProfile(closeModal);
const handleSave = async (data) => {
  await submit(data);
};
```

**優點**：
- 自動顯示 Toast 通知
- 自動更新 SWR 快取（`mutate()`）
- 防重複提交
- 代碼更簡潔

---

### 2. UserAddressCard 重構

**之前**：手動 `fetch()` + `router.refresh()`

```typescript
const router = useRouter();
const handleSave = async (data) => {
  await fetch("/api/user/address", { method: "PUT", ... });
  router.refresh();
};
```

**之後**：使用 SWR Hooks

```typescript
const { isSubmitting: isSaving, submit: saveAddress } = useUpdateAddress(closeModal);
const { isSubmitting: isDeleting, submit: deleteAddress } = useDeleteAddress(closeModal);
const isLoading = isSaving || isDeleting;
```

**優點**：
- 無需 `router.refresh()` 刷新頁面
- SWR 自動更新快取
- 刪除操作也有獨立的 Hook

---

### 3. UserBankCard 重構

同樣的模式：

```typescript
const { isSubmitting: isSaving, submit: saveBank } = useUpdateBank(closeModal);
const { isSubmitting: isDeleting, submit: deleteBank } = useDeleteBank(closeModal);
```

---

### 4. ProfilePageContent 客戶端組件

新建的客戶端組件，負責：
- 使用 SWR Hooks 獲取最新資料
- 接收伺服器端渲染的 `initialData` 作為初始值
- 當 SWR 資料更新時自動切換顯示

```typescript
export default function ProfilePageContent({ initialData }) {
  const { profile } = useUserProfile();
  const { address: swrAddress } = useUserAddress();
  const { bankAccount: swrBank } = useUserBank();

  // 優先使用 SWR 資料，沒有時用 initialData
  const info = profile ? { ... } : initialData.info;
  const address = swrAddress ? { ... } : initialData.address;
  const bank = swrBank ? { ... } : initialData.bank;

  return (
    <div className="space-y-6">
      <UserInfoCard {...info} />
      <UserAddressCard {...address} />
      <UserBankCard {...bank} />
      ...
    </div>
  );
}
```

---

### 5. Profile Page 更新

伺服器端頁面現在只負責：
- 認證檢查
- 初始資料獲取
- 傳遞資料給客戶端組件

```typescript
export default async function ProfilePage() {
  const session = await auth();
  const userData = await getUserProfile(session.user.id);

  return (
    <ProfilePageContent initialData={userData} />
  );
}
```

---

## 資料流

```
┌─────────────────────────────────────────────────────────────────┐
│                        Profile Page                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Server Component 獲取初始資料                                │
│           ↓                                                      │
│  2. 傳遞 initialData 給 ProfilePageContent                       │
│           ↓                                                      │
│  3. ProfilePageContent 使用 SWR Hooks 獲取最新資料               │
│           ↓                                                      │
│  4. Card 組件顯示資料（優先 SWR，fallback initialData）          │
│           ↓                                                      │
│  5. 用戶點擊編輯 → 開啟 Modal                                    │
│           ↓                                                      │
│  6. 用戶提交 → useUpdateXxx() 呼叫 API                           │
│           ↓                                                      │
│  7. 成功後 mutate() 自動更新快取                                 │
│           ↓                                                      │
│  8. Card 組件自動顯示最新資料                                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 修改的檔案列表

| 檔案 | 操作 |
|------|------|
| `components/feature/user/profile/UserInfoCard.tsx` | 修改 |
| `components/feature/user/profile/UserAddressCard.tsx` | 修改 |
| `components/feature/user/profile/UserBankCard.tsx` | 修改 |
| `components/feature/user/profile/ProfilePageContent.tsx` | 新建 |
| `app/(private)/dashboard/(user)/profile/page.tsx` | 修改 |

---

## 使用的 Hooks

| Hook | 來源 | 用途 |
|------|------|------|
| `useUserProfile()` | `hooks/useUserProfile.ts` | GET 用戶資料 |
| `useUpdateProfile()` | `hooks/useUserProfile.ts` | PATCH 用戶資料 |
| `useUserAddress()` | `hooks/useUserProfile.ts` | GET 地址 |
| `useUpdateAddress()` | `hooks/useUserProfile.ts` | PUT 地址 |
| `useDeleteAddress()` | `hooks/useUserProfile.ts` | DELETE 地址 |
| `useUserBank()` | `hooks/useUserProfile.ts` | GET 銀行資料 |
| `useUpdateBank()` | `hooks/useUserProfile.ts` | PUT 銀行資料 |
| `useDeleteBank()` | `hooks/useUserProfile.ts` | DELETE 銀行資料 |

---

## 待完成項目

### UserChildrenCard 整合

目前 `UserChildrenCard` 尚未整合 SWR，需要：
1. 建立 `useUserChildren()` Hook
2. 建立 `useCreateChild()`, `useUpdateChild()`, `useDeleteChild()` Hooks
3. 重構 `UserChildrenCard` 使用這些 Hooks

### 導師文件整合

`UserTutorCard` 需要：
1. 建立 `useTutorDocuments()` Hook
2. 建立文件 CRUD Hooks
3. 整合到 `UserTutorCard` 和 `TutorDocumentEditModal`

---

## 注意事項

1. **初始資料與 SWR 資料**
   - Server Component 提供初始資料（SEO 友好）
   - Client Component 使用 SWR 獲取最新資料
   - 編輯後 SWR 自動更新，無需刷新頁面

2. **Toast 通知**
   - 所有更新操作自動顯示成功/失敗通知
   - 由 `useFormSubmit` Hook 統一處理

3. **錯誤處理**
   - SWR 自動處理網絡錯誤和重試
   - 用戶看到的是統一的錯誤提示

---

## 相關文檔

- `docs/用戶資料/API_INTEGRATION.md` - API 整合說明
- `docs/用戶資料/DEVELOPMENT_CHECKLIST.md` - 開發檢查清單
- `hooks/useUserProfile.ts` - SWR Hooks 實作
