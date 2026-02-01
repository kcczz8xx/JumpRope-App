import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";
import { rateLimit, getClientIP, RATE_LIMIT_CONFIGS } from "@/lib/server";

interface VerifyResetCodeRequest {
    phone: string;
    code: string;
}

export async function POST(request: NextRequest) {
    try {
        const clientIP = getClientIP(request);
        const rateLimitResult = rateLimit(
            `reset_verify:${clientIP}`,
            RATE_LIMIT_CONFIGS.OTP_VERIFY
        );

        if (!rateLimitResult.success) {
            return NextResponse.json(
                { error: "請求過於頻繁，請稍後再試" },
                { status: 429 }
            );
        }

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

        const otp = await prisma.otp.findFirst({
            where: {
                phone,
                purpose: "RESET_PASSWORD",
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

        await prisma.passwordResetToken.deleteMany({
            where: { phone, used: false },
        });

        const resetToken = crypto.randomBytes(32).toString("hex");
        const tokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

        await prisma.passwordResetToken.create({
            data: {
                phone,
                token: resetToken,
                expiresAt: tokenExpiresAt,
            },
        });

        console.log(`[Reset Password] Verified OTP and created reset token for ${phone}`);

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
