import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

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
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "請先登入" }, { status: 401 });
        }

        const bankAccount = await prisma.userBankAccount.findUnique({
            where: { userId: session.user.id },
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
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "請先登入" }, { status: 401 });
        }

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
            where: { userId: session.user.id },
            update: {
                bankName,
                accountNumber,
                accountHolderName,
                fpsId: fpsId || null,
                fpsEnabled: fpsEnabled || false,
                notes: notes || null,
            },
            create: {
                userId: session.user.id,
                bankName,
                accountNumber,
                accountHolderName,
                fpsId: fpsId || null,
                fpsEnabled: fpsEnabled || false,
                notes: notes || null,
            },
        });

        console.log(`[Update Bank] User ${session.user.id} updated bank account`);

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
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "請先登入" }, { status: 401 });
        }

        const existingAccount = await prisma.userBankAccount.findUnique({
            where: { userId: session.user.id },
        });

        if (!existingAccount) {
            return NextResponse.json(
                { error: "沒有收款資料可刪除" },
                { status: 404 }
            );
        }

        await prisma.userBankAccount.delete({
            where: { userId: session.user.id },
        });

        console.log(`[Delete Bank] User ${session.user.id} deleted bank account`);

        return NextResponse.json({ message: "收款資料已刪除" }, { status: 200 });
    } catch (error) {
        console.error("Delete bank account error:", error);
        return NextResponse.json(
            { error: "刪除收款資料失敗，請稍後再試" },
            { status: 500 }
        );
    }
}
