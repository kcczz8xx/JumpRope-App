import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
    checkPermission,
    unauthorizedResponse,
    forbiddenResponse,
} from "@/lib/rbac/check-permission";

interface UpdateBankRequest {
    bankName: string;
    accountNumber: string;
    accountHolderName: string;
    fpsId?: string;
    fpsEnabled?: boolean;
    notes?: string;
}

export async function GET() {
    try {
        const authResult = await checkPermission("USER_PROFILE_READ_OWN");

        if (!authResult.authorized) {
            return authResult.status === 401
                ? unauthorizedResponse(authResult.error)
                : forbiddenResponse(authResult.error);
        }

        const bankAccount = await prisma.userBankAccount.findUnique({
            where: { userId: authResult.userId },
        });

        return NextResponse.json({ bankAccount }, { status: 200 });
    } catch (error) {
        console.error("Get bank account error:", error);
        return NextResponse.json(
            { error: "獲取收款資料失敗，請稍後再試" },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const authResult = await checkPermission("USER_PROFILE_UPDATE_OWN");

        if (!authResult.authorized) {
            return authResult.status === 401
                ? unauthorizedResponse(authResult.error)
                : forbiddenResponse(authResult.error);
        }

        const userId = authResult.userId!;
        const body: UpdateBankRequest = await request.json();
        const {
            bankName,
            accountNumber,
            accountHolderName,
            fpsId,
            fpsEnabled,
            notes,
        } = body;

        if (!bankName || !accountNumber || !accountHolderName) {
            return NextResponse.json(
                { error: "請填寫銀行名稱、戶口號碼和持有人姓名" },
                { status: 400 }
            );
        }

        const updatedBankAccount = await prisma.userBankAccount.upsert({
            where: { userId },
            update: {
                bankName,
                accountNumber,
                accountHolderName,
                fpsId: fpsId || null,
                fpsEnabled: fpsEnabled || false,
                notes: notes || null,
            },
            create: {
                userId,
                bankName,
                accountNumber,
                accountHolderName,
                fpsId: fpsId || null,
                fpsEnabled: fpsEnabled || false,
                notes: notes || null,
            },
        });

        return NextResponse.json(
            { message: "收款資料更新成功", bankAccount: updatedBankAccount },
            { status: 200 }
        );
    } catch (error) {
        console.error("Update bank account error:", error);
        return NextResponse.json(
            { error: "更新收款資料失敗，請稍後再試" },
            { status: 500 }
        );
    }
}

export async function DELETE() {
    try {
        const authResult = await checkPermission("USER_PROFILE_UPDATE_OWN");

        if (!authResult.authorized) {
            return authResult.status === 401
                ? unauthorizedResponse(authResult.error)
                : forbiddenResponse(authResult.error);
        }

        const userId = authResult.userId!;

        const existingAccount = await prisma.userBankAccount.findUnique({
            where: { userId },
        });

        if (!existingAccount) {
            return NextResponse.json(
                { error: "沒有收款資料可刪除" },
                { status: 404 }
            );
        }

        await prisma.userBankAccount.delete({
            where: { userId },
        });

        return NextResponse.json({ message: "收款資料已刪除" }, { status: 200 });
    } catch (error) {
        console.error("Delete bank account error:", error);
        return NextResponse.json(
            { error: "刪除收款資料失敗，請稍後再試" },
            { status: 500 }
        );
    }
}
