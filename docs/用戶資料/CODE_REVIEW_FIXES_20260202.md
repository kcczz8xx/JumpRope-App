# Code Review 修復報告

**日期**: 2026-02-02  
**審查 Commit**: `511ae29` - "refactor: enhance security and fix validation issues in auth and user APIs"

---

## 修復摘要

| 嚴重度 | 問題 | 狀態 |
|--------|------|------|
| 🔴 | Race Condition - 會員編號生成 | ✅ 已修復 |
| 🔴 | Rate Limit Fail-Open | ✅ 已修復 |
| 🔴 | OTP 驗證後重用風險 | ✅ 已修復 |
| 🟡 | Children API 缺少 memberNumber | ✅ 已修復 |
| 🟡 | Email 重設假成功訊息 | ✅ 已修復 |
| 🟡 | OTP verify 缺少 purpose 驗證 | ✅ 已修復 |
| 🟢 | Profile API 缺少 OTP 驗證 | ✅ 已修復 |

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
if (!purpose || !["register", "reset-password", "update-contact"].includes(purpose)) {
    return NextResponse.json(
        { error: "無效的驗證用途" },
        { status: 400 }
    );
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

## 修改檔案清單

| 檔案 | 變更類型 |
|------|----------|
| `app/api/auth/register/route.ts` | 修改 |
| `app/api/auth/otp/verify/route.ts` | 修改 |
| `app/api/auth/reset-password/send/route.ts` | 修改 |
| `app/api/user/children/route.ts` | 修改 |
| `app/api/user/profile/route.ts` | 修改 |
| `lib/server/rate-limit.ts` | 修改 |
| `lib/services/index.ts` | 修改 |

---

## 注意事項

1. **環境變數**: 確保生產環境已設定 `UPSTASH_REDIS_REST_URL` 和 `UPSTASH_REDIS_REST_TOKEN`，否則 Rate Limit 將拒絕所有請求。

2. **Email 重設**: 目前返回 501，待後續實作 email 發送功能。

3. **OTP 有效期**: Profile 更新的 OTP 驗證窗口為 10 分鐘，與前端邏輯一致。
