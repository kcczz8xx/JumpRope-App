import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit, getClientIP, RATE_LIMIT_CONFIGS } from "@/lib/rate-limit";

interface SendResetCodeRequest {
    phone?: string;
    email?: string;
}

function generateOtpCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
    try {
        const clientIP = getClientIP(request);
        const rateLimitResult = rateLimit(
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

            console.log(`[Reset Password] Created OTP for phone: ${phone}`);
        } else if (email) {
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
