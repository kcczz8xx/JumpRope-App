# Profile API GET 方法修復

## 問題描述

在 `/dashboard/profile` 頁面更新個人資料後，卡片沒有即時更新，且再次點擊編輯時只顯示舊資料。

### 錯誤日誌

```
GET /api/user/profile 405 in 20ms
GET /api/user/profile 405 in 11ms
```

## 根本原因

`/api/user/profile` 路由只有 `PATCH` 方法，缺少 `GET` 方法。

`useUserProfile` hook 使用 SWR 對 `/api/user/profile` 發送 GET 請求獲取用戶資料，但 API 返回 405 (Method Not Allowed)，導致 SWR 無法獲取數據，更新後無法刷新卡片。

## 解決方案

在 `app/api/user/profile/route.ts` 添加 `GET` 方法。

### 修改內容

```typescript
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "請先登入" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        memberNumber: true,
        title: true,
        phone: true,
        email: true,
        nameChinese: true,
        nameEnglish: true,
        nickname: true,
        gender: true,
        identityCardNumber: true,
        whatsappEnabled: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "用戶不存在" }, { status: 404 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json(
      { error: "獲取資料失敗，請稍後再試" },
      { status: 500 }
    );
  }
}
```

## 附加修復

### Toast 關閉按鈕位置

修改 `components/ui/Toaster.tsx`，將關閉按鈕 (x) 移到 toast 內部右側，與左側圖標對齊：

```typescript
closeButton:
  "!left-auto !right-3 !top-4 !translate-y-0 !translate-x-0 !border-0 !bg-transparent !shadow-none !opacity-50 hover:!opacity-100 !transition-opacity [&>svg]:!w-4 [&>svg]:!h-4",
```

**樣式說明**：

- `!left-auto !right-3` - 移到右側
- `!top-4` - 與左側圖標對齊
- `!bg-transparent` - 透明背景
- `!opacity-50 hover:!opacity-100` - 淡化效果，hover 時完全顯示
- `[&>svg]:!w-4 [&>svg]:!h-4` - 較小的圖標尺寸

## 修改文件

| 文件                            | 變更                    |
| ------------------------------- | ----------------------- |
| `app/api/user/profile/route.ts` | 添加 `GET` 方法         |
| `components/ui/Toaster.tsx`     | 調整 `closeButton` 樣式 |

## 驗證

1. 刷新 `/dashboard/profile` 頁面
2. 編輯個人資料（如姓名）
3. 保存後確認卡片即時更新
4. 再次點擊編輯確認顯示新資料
5. 確認 toast 關閉按鈕在右邊
