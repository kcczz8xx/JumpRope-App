import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { rateLimit, getClientIP, RATE_LIMIT_CONFIGS } from "@/lib/rate-limit";

interface ResetPasswordRequest {
    phone: string;
    password: string;
    resetToken: string;
}

export async function POST(request: NextRequest) {
    try {
        const clientIP = getClientIP(request);
        const rateLimitResult = rateLimit(
            `reset_password:${clientIP}`,
            RATE_LIMIT_CONFIGS.RESET_PASSWORD
        );

        if (!rateLimitResult.success) {
            return NextResponse.json(
                { error: "請求過於頻繁，請稍後再試" },
                { status: 429 }
            );
        }

        const body: ResetPasswordRequest = await request.json();
        const { phone, password, resetToken } = body;

        if (!phone || !password || !resetToken) {
            return NextResponse.json(
                { error: "請提供電話號碼、新密碼和重設令牌" },
                { status: 400 }
            );
        }

        if (password.length < 8) {
            return NextResponse.json(
                { error: "密碼至少需要 8 個字元" },
                { status: 400 }
            );
        }

        const tokenRecord = await prisma.passwordResetToken.findFirst({
            where: {
                phone,
                token: resetToken,
                used: false,
            },
        });

        if (!tokenRecord) {
            return NextResponse.json(
                { error: "重設令牌無效" },
                { status: 400 }
            );
        }

        if (new Date() > tokenRecord.expiresAt) {
            return NextResponse.json(
                { error: "重設令牌已過期，請重新驗證" },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { phone },
        });

        if (!user) {
            return NextResponse.json(
                { error: "用戶不存在" },
                { status: 404 }
            );
        }

        const passwordHash = await bcrypt.hash(password, 12);

        await prisma.$transaction([
            prisma.user.update({
                where: { phone },
                data: { passwordHash },
            }),
            prisma.passwordResetToken.update({
                where: { id: tokenRecord.id },
                data: { used: true },
            }),
        ]);

        console.log(`[Reset Password] Password reset successful for ${phone}`);

        return NextResponse.json(
            { message: "密碼重設成功" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Reset password error:", error);
        return NextResponse.json(
            { error: "重設密碼失敗，請稍後再試" },
            { status: 500 }
        );
    }
}
