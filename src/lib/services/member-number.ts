import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

/**
 * 會員編號類別
 * 1 = 用戶自行註冊
 * 2 = 學生
 * 3 = 自定（後台新增）
 */
export enum MemberType {
    SELF_REGISTERED = "1",
    STUDENT = "2",
    CUSTOM = "3",
}

const MAX_RETRIES = 5;

/**
 * 生成有序的會員編號（含重試機制防止併發競爭）
 * 格式：YYMMTXXXX
 * - YY: 年份後兩位
 * - MM: 月份
 * - T: 類別 (1=用戶自行註冊, 2=學生, 3=自定)
 * - XXXX: 四位數序號
 * 例如：260210001 (2026年02月，類別1，序號0001)
 * 
 * 注意：此函數應在 prisma.$transaction 外部調用，
 * 若發生 unique constraint 衝突會自動重試
 */
export async function generateMemberNumber(
    type: MemberType = MemberType.SELF_REGISTERED
): Promise<string> {
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        const now = new Date();
        const yy = now.getFullYear().toString().slice(-2);
        const mm = (now.getMonth() + 1).toString().padStart(2, "0");
        const prefix = `${yy}${mm}${type}`;

        const latestUser = await prisma.user.findFirst({
            where: {
                memberNumber: {
                    startsWith: prefix,
                },
            },
            orderBy: {
                memberNumber: "desc",
            },
            select: {
                memberNumber: true,
            },
        });

        let nextNumber = 1;

        if (latestUser?.memberNumber) {
            const seqStr = latestUser.memberNumber.slice(-4);
            nextNumber = parseInt(seqStr, 10) + 1;
        }

        const paddedNumber = nextNumber.toString().padStart(4, "0");
        const memberNumber = `${prefix}${paddedNumber}`;

        const exists = await prisma.user.findUnique({
            where: { memberNumber },
            select: { id: true },
        });

        if (!exists) {
            return memberNumber;
        }

        await new Promise((resolve) => setTimeout(resolve, 50 * (attempt + 1)));
    }

    throw new Error("無法生成唯一會員編號，請稍後再試");
}

/**
 * 在 transaction 內生成會員編號並創建用戶
 * 使用樂觀鎖定策略：如果發生衝突則重試
 */
export async function createUserWithMemberNumber(
    userData: Omit<Prisma.UserCreateInput, "memberNumber">,
    type: MemberType = MemberType.SELF_REGISTERED
): Promise<{
    id: string;
    phone: string;
    email: string | null;
    nickname: string | null;
    title: string | null;
    memberNumber: string;
    role: string;
    createdAt: Date;
}> {
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
            const memberNumber = await generateMemberNumber(type);

            const user = await prisma.user.create({
                data: {
                    ...userData,
                    memberNumber,
                },
                select: {
                    id: true,
                    phone: true,
                    email: true,
                    nickname: true,
                    title: true,
                    memberNumber: true,
                    role: true,
                    createdAt: true,
                },
            });

            return {
                ...user,
                memberNumber: user.memberNumber!,
            };
        } catch (error) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === "P2002"
            ) {
                await new Promise((resolve) => setTimeout(resolve, 100 * (attempt + 1)));
                continue;
            }
            throw error;
        }
    }

    throw new Error("無法創建用戶，會員編號衝突，請稍後再試");
}

/**
 * 生成學員會員編號（含重試機制）
 * 格式：YYMMTXXXX（T=2 學生）
 */
export async function generateChildMemberNumber(): Promise<string> {
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        const now = new Date();
        const yy = now.getFullYear().toString().slice(-2);
        const mm = (now.getMonth() + 1).toString().padStart(2, "0");
        const prefix = `${yy}${mm}${MemberType.STUDENT}`;

        const latestChild = await prisma.userChild.findFirst({
            where: {
                memberNumber: {
                    startsWith: prefix,
                },
            },
            orderBy: {
                memberNumber: "desc",
            },
            select: {
                memberNumber: true,
            },
        });

        let nextNumber = 1;

        if (latestChild?.memberNumber) {
            const seqStr = latestChild.memberNumber.slice(-4);
            nextNumber = parseInt(seqStr, 10) + 1;
        }

        const paddedNumber = nextNumber.toString().padStart(4, "0");
        const memberNumber = `${prefix}${paddedNumber}`;

        const exists = await prisma.userChild.findFirst({
            where: { memberNumber },
            select: { id: true },
        });

        if (!exists) {
            return memberNumber;
        }

        await new Promise((resolve) => setTimeout(resolve, 50 * (attempt + 1)));
    }

    throw new Error("無法生成唯一學員編號，請稍後再試");
}

/**
 * 在 transaction 內生成學員會員編號並創建學員
 * 使用樂觀鎖定策略：如果發生衝突則重試
 */
export async function createChildWithMemberNumber(
    childData: Omit<Prisma.UserChildCreateInput, "memberNumber" | "parent"> & { parentId: string }
): Promise<{
    id: string;
    memberNumber: string;
    nameChinese: string;
    nameEnglish: string | null;
    birthYear: number | null;
    school: string | null;
    gender: string | null;
}> {
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
            const memberNumber = await generateChildMemberNumber();

            const child = await prisma.userChild.create({
                data: {
                    parentId: childData.parentId,
                    memberNumber,
                    nameChinese: childData.nameChinese,
                    nameEnglish: childData.nameEnglish ?? null,
                    birthYear: childData.birthYear ?? null,
                    school: childData.school ?? null,
                    gender: childData.gender ?? null,
                },
                select: {
                    id: true,
                    memberNumber: true,
                    nameChinese: true,
                    nameEnglish: true,
                    birthYear: true,
                    school: true,
                    gender: true,
                },
            });

            return {
                ...child,
                memberNumber: child.memberNumber!,
                gender: child.gender as string | null,
            };
        } catch (error) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === "P2002"
            ) {
                await new Promise((resolve) => setTimeout(resolve, 100 * (attempt + 1)));
                continue;
            }
            throw error;
        }
    }

    throw new Error("無法創建學員，會員編號衝突，請稍後再試");
}
