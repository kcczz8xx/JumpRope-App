import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface SendOtpRequest {
    phone: string;
    purpose: "register" | "reset-password";
}

export async function POST(request: NextRequest) {
    try {
        const body: SendOtpRequest = await request.json();
        const { phone, purpose } = body;

        if (!phone) {
            return NextResponse.json(
                { error: "請提供電話號碼" },
                { status: 400 }
            );
        }

        if (purpose === "register") {
            const existingUser = await prisma.user.findUnique({
                where: { phone },
            });

            if (existingUser) {
                return NextResponse.json(
                    { error: "此電話號碼已被註冊" },
                    { status: 409 }
                );
            }
        }

        if (purpose === "reset-password") {
            const existingUser = await prisma.user.findUnique({
                where: { phone },
            });

            if (!existingUser) {
                return NextResponse.json(
                    { error: "此電話號碼未註冊" },
                    { status: 404 }
                );
            }
        }

        // TODO: 實作 SMS 發送邏輯
        // 目前為模擬發送，實際整合時需要：
        // 1. 生成 6 位數隨機驗證碼
        // 2. 儲存驗證碼到資料庫或快取（設定過期時間）
        // 3. 調用 SMS 服務發送驗證碼
        console.log(`[OTP] Sending OTP to ${phone} for ${purpose}`);

        return NextResponse.json(
            { message: "驗證碼已發送", phone },
            { status: 200 }
        );
    } catch (error) {
        console.error("Send OTP error:", error);
        return NextResponse.json(
            { error: "發送驗證碼失敗，請稍後再試" },
            { status: 500 }
        );
    }
}
