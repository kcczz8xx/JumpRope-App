# Code Review 修復報告

**日期**: 2026-02-02  
**審查 Commit**: `511ae29` → `f9731da` → 最新

---

## 修復摘要

### 第一輪修復（Commit `f9731da`）

| 嚴重度 | 問題                           | 狀態      |
| ------ | ------------------------------ | --------- |
| 🔴     | Race Condition - 會員編號生成  | ✅ 已修復 |
| 🔴     | Rate Limit Fail-Open           | ✅ 已修復 |
| 🔴     | OTP 驗證後重用風險             | ✅ 已修復 |
| 🟡     | Children API 缺少 memberNumber | ✅ 已修復 |
| 🟡     | Email 重設假成功訊息           | ✅ 已修復 |
| 🟡     | OTP verify 缺少 purpose 驗證   | ✅ 已修復 |
| 🟢     | Profile API 缺少 OTP 驗證      | ✅ 已修復 |

### 第二輪修復（最新）

| 嚴重度 | 問題                         | 狀態      |
| ------ | ---------------------------- | --------- |
| 🟡     | rateLimitSync 仍為 fail-open | ✅ 已修復 |
| 🟡     | Children API race condition  | ✅ 已修復 |
| 🟢     | Register 多餘資料庫查詢      | ✅ 已優化 |
| 🟢     | Profile OTP 驗證後未清除     | ✅ 已修復 |

---

## 詳細修復內容

### 1. Race Condition - 會員編號生成 🔴

**問題**: `generateMemberNumber()` 與 `prisma.user.create()` 之間存在 TOCTOU 競爭條件，並發請求可能生成重複編號。

**修復檔案**: `app/api/auth/register/route.ts`

**修復方式**:

- 改用 `createUserWithMemberNumber()` 函數（內建 P2002 unique constraint 錯誤重試機制）
- 導出該函數至 `lib/services/index.ts`

```typescript
// Before
const memberNumber = await generateMemberNumber();
const user = await prisma.user.create({ data: { memberNumber, ... } });

// After
const { id, memberNumber } = await createUserWithMemberNumber({ ... });
```

---

### 2. Rate Limit Fail-Open 🔴

**問題**: Redis 連接失敗時默認允許所有請求（`success: true`），可能導致 DDoS 或暴力攻擊。

**修復檔案**: `lib/server/rate-limit.ts`

**修復方式**:

- 改為 fail-closed 策略（Redis 失敗時拒絕請求）
- 環境變數未設定時給予明確警告
- 空環境變數不再嘗試連接 Redis

```typescript
// Before (fail-open)
catch (error) {
    return { success: true, remaining: 999, resetIn: 0 };
}

// After (fail-closed)
if (!rateLimiters) {
    console.warn("Rate limit: Redis not configured, using fail-closed strategy");
    return { success: false, remaining: 0, resetIn: 60000 };
}
catch (error) {
    return { success: false, remaining: 0, resetIn: 60000 };
}
```

---

### 3. OTP 驗證後重用風險 🔴

**問題**: OTP 驗證後 30 分鐘內可多次使用同一驗證記錄進行註冊。

**修復檔案**: `app/api/auth/register/route.ts`

**修復方式**:

- 註冊成功後立即刪除已驗證的 OTP 記錄

```typescript
await prisma.otp.deleteMany({
  where: {
    phone,
    purpose: "REGISTER",
    verified: true,
  },
});
```

---

### 4. Children API 缺少 memberNumber 🟡

**問題**: POST 建立學員時沒有生成 `memberNumber`，但 GET 回傳包含該欄位。

**修復檔案**: `app/api/user/children/route.ts`

**修復方式**:

- 建立學員前調用 `generateChildMemberNumber()`

```typescript
const memberNumber = await generateChildMemberNumber();

const child = await prisma.userChild.create({
    data: {
        parentId: userId,
        memberNumber,
        ...
    },
});
```

---

### 5. Email 重設假成功訊息 🟡

**問題**: Email 重設功能未實作但回傳「重設連結已發送」成功訊息。

**修復檔案**: `app/api/auth/reset-password/send/route.ts`

**修復方式**:

- 未實作功能返回 HTTP 501 錯誤

```typescript
} else if (email) {
    return NextResponse.json(
        { error: "電郵重設功能尚未開放，請使用電話號碼重設密碼" },
        { status: 501 }
    );
}
```

---

### 6. OTP verify 缺少 purpose 驗證 🟡

**問題**: 未驗證 `purpose` 參數是否為有效值，可能導致非預期行為。

**修復檔案**: `app/api/auth/otp/verify/route.ts`

**修復方式**:

- 加入 `purpose` 參數的白名單驗證

```typescript
if (
  !purpose ||
  !["register", "reset-password", "update-contact"].includes(purpose)
) {
  return NextResponse.json({ error: "無效的驗證用途" }, { status: 400 });
}
```

---

### 7. Profile API 缺少 OTP 驗證 🟢

**問題**: 更新電話/電郵時只檢查是否重複，沒有要求 OTP 驗證，可能被繞過前端直接調用。

**修復檔案**: `app/api/user/profile/route.ts`

**修復方式**:

- 更新電話或電郵前必須檢查已驗證的 OTP（10 分鐘內有效）

```typescript
if (currentUser?.phone !== phone) {
  const verifiedOtp = await prisma.otp.findFirst({
    where: {
      phone,
      purpose: "UPDATE_CONTACT",
      verified: true,
      expiresAt: { gte: new Date(Date.now() - 10 * 60 * 1000) },
    },
  });

  if (!verifiedOtp) {
    return NextResponse.json(
      { error: "請先完成新電話號碼驗證" },
      { status: 403 }
    );
  }
}
```

---

2. **Email 重設**: 目前返回 501，待後續實作 email 發送功能。

3. **OTP 有效期**: Profile 更新的 OTP 驗證窗口為 10 分鐘，與前端邏輯一致。

---

## 第二輪修復詳細內容

### 8. rateLimitSync Fail-Open 🟡

**問題**: 雖然 `rateLimit()` 已改為 fail-closed，但 `rateLimitSync` 仍然返回 `success: true`。

**修復檔案**: `lib/server/rate-limit.ts`

**修復方式**:

- 將 `rateLimitSync` 改為 fail-closed，始終返回 `success: false`
- 標記為 `@deprecated`，輸出 `console.error` 警告

```typescript
export function rateLimitSync(
  _identifier: string,
  _config: Partial<RateLimitConfig> = {}
): { success: boolean; remaining: number; resetIn: number } {
  console.error("rateLimitSync is deprecated and disabled.");
  return { success: false, remaining: 0, resetIn: 60000 };
}
```

---

### 9. Children API Race Condition 🟡

**問題**: `generateChildMemberNumber()` 與 `prisma.userChild.create()` 之間存在競爭條件。

**修復檔案**:

- `lib/services/member-number.ts`
- `lib/services/index.ts`
- `app/api/user/children/route.ts`

**修復方式**:

- 新增 `createChildWithMemberNumber()` 函數，包含 P2002 錯誤重試機制
- 更新 Children API 使用新函數

```typescript
const child = await createChildWithMemberNumber({
    parentId: userId,
    nameChinese: body.nameChinese,
    ...
});
```

---

### 10. Register 多餘資料庫查詢 🟢

**問題**: `createUserWithMemberNumber()` 後又執行 `findUnique` 查詢。

**修復檔案**:

- `lib/services/member-number.ts`
- `app/api/auth/register/route.ts`

**修復方式**:

- 擴展 `createUserWithMemberNumber()` 返回完整用戶資料
- 移除 register route 中多餘的 `findUnique` 查詢

---

### 11. Profile OTP 驗證後未清除 🟢

**問題**: Profile 更新成功後沒有刪除已使用的 OTP，允許 10 分鐘內重複使用。

**修復檔案**: `app/api/user/profile/route.ts`

**修復方式**:

- 追蹤需要刪除的 OTP 電話號碼
- 更新成功後刪除相關 OTP 記錄

```typescript
if (otpPhonesToDelete.length > 0) {
  await prisma.otp.deleteMany({
    where: {
      phone: { in: otpPhonesToDelete },
      purpose: "UPDATE_CONTACT",
      verified: true,
    },
  });
}
```

---

## 完整修改檔案清單

| 檔案                                        | 第一輪 | 第二輪 | 第三輪    |
| ------------------------------------------- | ------ | ------ | --------- |
| `app/api/auth/register/route.ts`            | ✅     | ✅     | ✅        |
| `app/api/auth/otp/verify/route.ts`          | ✅     | -      | -         |
| `app/api/auth/reset-password/send/route.ts` | ✅     | -      | -         |
| `app/api/user/children/route.ts`            | ✅     | ✅     | ✅        |
| `app/api/user/profile/route.ts`             | ✅     | ✅     | ✅        |
| `lib/server/rate-limit.ts`                  | ✅     | ✅     | ✅        |
| `lib/services/index.ts`                     | ✅     | ✅     | -         |
| `lib/services/member-number.ts`             | -      | ✅     | -         |
| `lib/constants/otp.ts`                      | -      | -      | ✅ (新增) |

---

## 第三輪修復詳細內容

### 12. Profile API 重複查詢優化 🟢

**問題**: 同時更新 email 和 phone 時會執行兩次 `findUnique` 查詢。

**修復檔案**: `app/api/user/profile/route.ts`

**修復方式**:

- 在 PATCH 開始時一次性查詢當前用戶資料
- 使用 `needsContactCheck` 條件判斷是否需要查詢

```typescript
const needsContactCheck = (email !== undefined && email) || phone !== undefined;
const currentUser = needsContactCheck
  ? await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, phone: true },
    })
  : null;
```

---

### 13. OTP 驗證窗口統一 🟢

**問題**: OTP 驗證窗口時間不一致（30 分鐘 vs 10 分鐘）。

**修復方式**:

- 新增 `lib/constants/otp.ts` 統一定義 OTP 相關常量
- 更新 register 和 profile API 使用常量

```typescript
export const OTP_CONFIG = {
  EXPIRY_MS: 10 * 60 * 1000,
  REGISTER_VERIFY_WINDOW_MS: 30 * 60 * 1000,
  UPDATE_CONTACT_VERIFY_WINDOW_MS: 10 * 60 * 1000,
  CODE_LENGTH: 6,
  MAX_ATTEMPTS: 5,
} as const;
```

---

### 14. Children API Rate Limit 🟢

**問題**: POST 創建學員沒有速率限制，可能被濫用。

**修復檔案**:

- `lib/server/rate-limit.ts`
- `app/api/user/children/route.ts`

**修復方式**:

- 新增 `CHILD_CREATE` 速率限制配置（每小時 10 次）
- 在 POST 函數加入速率限制檢查

---

### 15. getClientIP Fallback 改進 🟢

**問題**: 無法獲取 IP 時返回 "unknown"，多個用戶共享同一個 rate limit bucket。

**修復檔案**: `lib/server/rate-limit.ts`

**修復方式**:

- 支持更多代理頭（`cf-connecting-ip`、`true-client-ip`）
- 使用唯一隨機識別符作為 fallback

```typescript
return `fallback_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
```

---

## 總結

| 輪次     | 嚴重  | 中等  | 建議  | 總計   |
| -------- | ----- | ----- | ----- | ------ |
| 第一輪   | 3     | 3     | 1     | 7      |
| 第二輪   | 0     | 2     | 2     | 4      |
| 第三輪   | 0     | 0     | 4     | 4      |
| **總計** | **3** | **5** | **7** | **15** |

所有 **15 項問題** 已全部修復。

---

## 注意事項

1. **環境變數**: 確保生產環境已設定 `UPSTASH_REDIS_REST_URL` 和 `UPSTASH_REDIS_REST_TOKEN`。

2. **Email 重設**: 目前返回 501，待後續實作 email 發送功能。

3. **OTP 有效期**: 現已統一定義於 `lib/constants/otp.ts`。

---

## 第四輪修復詳細內容

### 16. OTP Send 缺少 purpose 驗證 🟡

**問題**: OTP send 端點沒有驗證 purpose 是否為有效值，可能接受非預期的用途。

**修復檔案**: `app/api/auth/otp/send/route.ts`

**修復方式**:

- 加入 `VALID_PURPOSES` 常量和白名單驗證

```typescript
const VALID_PURPOSES = [
  "register",
  "reset-password",
  "update-contact",
] as const;

if (!purpose || !VALID_PURPOSES.includes(purpose)) {
  return NextResponse.json({ error: "無效的驗證用途" }, { status: 400 });
}
```

---

### 17. OTP 過期時間硬編碼 🟢

**問題**: OTP 過期時間在多處硬編碼為 `10 * 60 * 1000`，不一致且難以維護。

**修復檔案**:

- `app/api/auth/otp/send/route.ts`
- `app/api/auth/reset-password/send/route.ts`

**修復方式**:

- 導入 `OTP_CONFIG` 並使用 `OTP_CONFIG.EXPIRY_MS`

---

### 18. MAX_ATTEMPTS 硬編碼 🟢

**問題**: OTP 最大嘗試次數在多處硬編碼為 `5`。

**修復檔案**:

- `app/api/auth/otp/verify/route.ts`
- `app/api/auth/reset-password/verify/route.ts`

**修復方式**:

- 導入 `OTP_CONFIG` 並使用 `OTP_CONFIG.MAX_ATTEMPTS`

---

### 19. Profile API Email OTP 邏輯不明確 🟢

**問題**: 更新 email 時查詢的是用戶手機的 OTP，設計意圖不明確。

**修復檔案**: `app/api/user/profile/route.ts`

**修復方式**:

- 加入設計說明註釋

```typescript
// 設計說明：更新 email 需要先用當前手機號碼驗證身份
// OTP 發送到用戶現有手機，確認是本人操作後才允許更改 email
```

---

### 20. getClientIP Fallback 可繞過 Rate Limit 🟡

**問題**: 每次請求生成唯一識別符，攻擊者若能觸發此 fallback 可完全繞過 rate limit。

**修復檔案**: `lib/server/rate-limit.ts`

**修復方式**:

- 改用固定的 `"unknown_ip"` 標識符
- 所有無法識別 IP 的請求共享同一個 rate limit bucket

```typescript
console.warn(
  "getClientIP: Unable to determine client IP, using shared fallback bucket"
);
return "unknown_ip";
```

---

## 第四輪修改檔案清單

| 檔案                                          | 修改內容                  |
| --------------------------------------------- | ------------------------- |
| `app/api/auth/otp/send/route.ts`              | purpose 驗證 + OTP_CONFIG |
| `app/api/auth/otp/verify/route.ts`            | OTP_CONFIG.MAX_ATTEMPTS   |
| `app/api/auth/reset-password/send/route.ts`   | OTP_CONFIG.EXPIRY_MS      |
| `app/api/auth/reset-password/verify/route.ts` | OTP_CONFIG.MAX_ATTEMPTS   |
| `app/api/user/profile/route.ts`               | 設計說明註釋              |
| `lib/server/rate-limit.ts`                    | getClientIP fallback 改進 |

---

## 最終總結

| 輪次     | 嚴重  | 中等  | 建議   | 總計   |
| -------- | ----- | ----- | ------ | ------ |
| 第一輪   | 3     | 3     | 1      | 7      |
| 第二輪   | 0     | 2     | 2      | 4      |
| 第三輪   | 0     | 0     | 4      | 4      |
| 第四輪   | 0     | 2     | 3      | 5      |
| **總計** | **3** | **7** | **10** | **20** |

所有 **20 項問題** 已全部修復。
