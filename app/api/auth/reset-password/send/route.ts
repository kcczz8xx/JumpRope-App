import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface SendResetCodeRequest {
    phone?: string;
    email?: string;
}

export async function POST(request: NextRequest) {
    try {
        const body: SendResetCodeRequest = await request.json();
        const { phone, email } = body;

        if (!phone && !email) {
            return NextResponse.json(
                { error: "請提供電話號碼或電郵地址" },
                { status: 400 }
            );
        }

        const user = await prisma.user.findFirst({
            where: phone ? { phone } : { email },
        });

        if (!user) {
            return NextResponse.json(
                { error: phone ? "此電話號碼未註冊" : "此電郵地址未註冊" },
                { status: 404 }
            );
        }

        if (phone) {
            // TODO: 發送 SMS 驗證碼
            console.log(`[Reset Password] Sending OTP to phone: ${phone}`);
        } else if (email) {
            // TODO: 發送電郵重設連結
            console.log(`[Reset Password] Sending reset link to email: ${email}`);
        }

        return NextResponse.json(
            {
                message: phone ? "驗證碼已發送" : "重設連結已發送到您的電郵",
                method: phone ? "phone" : "email",
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Send reset code error:", error);
        return NextResponse.json(
            { error: "發送失敗，請稍後再試" },
            { status: 500 }
        );
    }
}
