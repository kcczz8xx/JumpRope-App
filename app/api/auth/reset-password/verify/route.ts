import { NextRequest, NextResponse } from "next/server";

interface VerifyResetCodeRequest {
    phone: string;
    code: string;
}

export async function POST(request: NextRequest) {
    try {
        const body: VerifyResetCodeRequest = await request.json();
        const { phone, code } = body;

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
        // 1. 從資料庫或快取取得儲存的驗證碼
        // 2. 比對驗證碼是否正確
        // 3. 檢查驗證碼是否過期
        // 4. 生成重設密碼 token
        console.log(`[Reset Password] Verifying OTP ${code} for ${phone}`);

        // 模擬驗證：接受任何 6 位數驗證碼
        const isValid = /^\d{6}$/.test(code);

        if (!isValid) {
            return NextResponse.json(
                { error: "驗證碼錯誤" },
                { status: 400 }
            );
        }

        // TODO: 生成並返回重設密碼 token
        const resetToken = `reset_${Date.now()}_${Math.random().toString(36).slice(2)}`;

        return NextResponse.json(
            { message: "驗證成功", verified: true, resetToken },
            { status: 200 }
        );
    } catch (error) {
        console.error("Verify reset code error:", error);
        return NextResponse.json(
            { error: "驗證失敗，請稍後再試" },
            { status: 500 }
        );
    }
}
