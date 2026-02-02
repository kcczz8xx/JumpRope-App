import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";
import { rateLimit, getClientIP, RATE_LIMIT_CONFIGS } from "@/lib/server";

interface SendResetCodeRequest {
    phone?: string;
    email?: string;
}

function generateOtpCode(): string {
    return crypto.randomInt(100000, 999999).toString();
}

export async function POST(request: NextRequest) {
    try {
        const clientIP = getClientIP(request);
        const rateLimitResult = await rateLimit(
            `reset_send:${clientIP}`,
            RATE_LIMIT_CONFIGS.RESET_PASSWORD
        );

        if (!rateLimitResult.success) {
            return NextResponse.json(
                { error: "請求過於頻繁，請稍後再試" },
                { status: 429 }
            );
        }

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
            await prisma.otp.deleteMany({
                where: {
                    phone,
                    purpose: "RESET_PASSWORD",
                    verified: false,
                },
            });

            const code = generateOtpCode();
            const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

            await prisma.otp.create({
                data: {
                    phone,
                    code,
                    purpose: "RESET_PASSWORD",
                    expiresAt,
                },
            });

        } else if (email) {
            return NextResponse.json(
                { error: "電郵重設功能尚未開放，請使用電話號碼重設密碼" },
                { status: 501 }
            );
        }

        return NextResponse.json(
            {
                message: "驗證碼已發送",
                method: "phone",
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
