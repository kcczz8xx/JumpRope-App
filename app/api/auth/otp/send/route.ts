import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OtpPurpose } from "@prisma/client";
import { rateLimit, getClientIP, RATE_LIMIT_CONFIGS } from "@/lib/rate-limit";

interface SendOtpRequest {
    phone: string;
    email?: string;
    purpose: "register" | "reset-password" | "update-contact";
}

function generateOtpCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
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
            `otp_send:${clientIP}`,
            RATE_LIMIT_CONFIGS.OTP_SEND
        );

        if (!rateLimitResult.success) {
            return NextResponse.json(
                { error: "請求過於頻繁，請稍後再試" },
                {
                    status: 429,
                    headers: {
                        "X-RateLimit-Remaining": "0",
                        "X-RateLimit-Reset": String(rateLimitResult.resetIn),
                    },
                }
            );
        }

        const body: SendOtpRequest = await request.json();
        const { phone, email, purpose } = body;

        if (!phone) {
            return NextResponse.json(
                { error: "請提供電話號碼" },
                { status: 400 }
            );
        }

        if (purpose === "register") {
            if (!email) {
                return NextResponse.json(
                    { error: "請提供電郵地址" },
                    { status: 400 }
                );
            }

            const existingUser = await prisma.user.findFirst({
                where: {
                    OR: [{ phone }, { email }],
                },
            });

            if (existingUser) {
                if (existingUser.phone === phone) {
                    return NextResponse.json(
                        { error: "此電話號碼已被註冊" },
                        { status: 409 }
                    );
                }
                if (existingUser.email === email) {
                    return NextResponse.json(
                        { error: "此電郵地址已被註冊" },
                        { status: 409 }
                    );
                }
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

        if (purpose === "update-contact") {
            // 更新聯絡資料時，不需要額外驗證
            // 只需確保發送 OTP 到新的電話號碼
        }

        const otpPurpose = mapPurpose(purpose);

        await prisma.otp.deleteMany({
            where: {
                phone,
                purpose: otpPurpose,
                verified: false,
            },
        });

        const code = generateOtpCode();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await prisma.otp.create({
            data: {
                phone,
                code,
                purpose: otpPurpose,
                expiresAt,
            },
        });

        console.log(`[OTP] Created OTP for ${phone}, purpose: ${purpose}`);

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
