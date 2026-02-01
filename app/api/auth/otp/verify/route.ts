import { NextRequest, NextResponse } from "next/server";

interface VerifyOtpRequest {
    phone: string;
    code: string;
    purpose: "register" | "reset-password";
}

export async function POST(request: NextRequest) {
    try {
        const body: VerifyOtpRequest = await request.json();
        const { phone, code, purpose } = body;

        if (!phone || !code) {
            return NextResponse.json(
                { error: "請提供電話號碼和驗證碼" },
                { status: 400 }
            );
        }

        if (code.length !== 6) {
            return NextResponse.json(
                { error: "驗證碼格式錯誤" },
                { status: 400 }
            );
        }

        // TODO: 實作驗證邏輯
        // 目前為模擬驗證，實際整合時需要：
        // 1. 從資料庫或快取取得儲存的驗證碼
        // 2. 比對驗證碼是否正確
        // 3. 檢查驗證碼是否過期
        // 4. 驗證成功後刪除或標記已使用
        console.log(`[OTP] Verifying OTP ${code} for ${phone}, purpose: ${purpose}`);

        // 模擬驗證：接受任何 6 位數驗證碼
        const isValid = /^\d{6}$/.test(code);

        if (!isValid) {
            return NextResponse.json(
                { error: "驗證碼錯誤" },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { message: "驗證成功", verified: true },
            { status: 200 }
        );
    } catch (error) {
        console.error("Verify OTP error:", error);
        return NextResponse.json(
            { error: "驗證失敗，請稍後再試" },
            { status: 500 }
        );
    }
}
