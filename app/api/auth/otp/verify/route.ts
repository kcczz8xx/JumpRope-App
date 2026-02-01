import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { OtpPurpose } from "@prisma/client";
import { rateLimit, getClientIP, RATE_LIMIT_CONFIGS } from "@/lib/server";

interface VerifyOtpRequest {
    phone: string;
    code: string;
    purpose: "register" | "reset-password" | "update-contact";
}

function mapPurpose(purpose: "register" | "reset-password" | "update-contact"): OtpPurpose {
    if (purpose === "register") return OtpPurpose.REGISTER;
    if (purpose === "reset-password") return OtpPurpose.RESET_PASSWORD;
    return OtpPurpose.UPDATE_CONTACT;
}

export async function POST(request: NextRequest) {
    try {
        const clientIP = getClientIP(request);
        const rateLimitResult = rateLimit(
            `otp_verify:${clientIP}`,
            RATE_LIMIT_CONFIGS.OTP_VERIFY
        );

        if (!rateLimitResult.success) {
            return NextResponse.json(
                { error: "請求過於頻繁，請稍後再試" },
                { status: 429 }
            );
        }

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

        const otpPurpose = mapPurpose(purpose);

        const otp = await prisma.otp.findFirst({
            where: {
                phone,
                purpose: otpPurpose,
                verified: false,
            },
            orderBy: { createdAt: "desc" },
        });

        if (!otp) {
            return NextResponse.json(
                { error: "驗證碼不存在，請重新發送" },
                { status: 400 }
            );
        }

        if (new Date() > otp.expiresAt) {
            return NextResponse.json(
                { error: "驗證碼已過期，請重新發送" },
                { status: 400 }
            );
        }

        if (otp.attempts >= 5) {
            return NextResponse.json(
                { error: "嘗試次數過多，請重新發送驗證碼" },
                { status: 429 }
            );
        }

        if (otp.code !== code) {
            await prisma.otp.update({
                where: { id: otp.id },
                data: { attempts: { increment: 1 } },
            });

            return NextResponse.json(
                { error: "驗證碼錯誤" },
                { status: 400 }
            );
        }

        await prisma.otp.update({
            where: { id: otp.id },
            data: { verified: true },
        });

        console.log(`[OTP] Verified OTP for ${phone}, purpose: ${purpose}`);

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
