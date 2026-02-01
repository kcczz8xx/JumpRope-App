import { prisma } from "@/lib/prisma";

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

/**
 * 生成有序的會員編號
 * 格式：YYMMTXXXX
 * - YY: 年份後兩位
 * - MM: 月份
 * - T: 類別 (1=用戶自行註冊, 2=學生, 3=自定)
 * - XXXX: 四位數序號
 * 例如：260210001 (2026年02月，類別1，序號0001)
 */
export async function generateMemberNumber(
    type: MemberType = MemberType.SELF_REGISTERED
): Promise<string> {
    const now = new Date();
    const yy = now.getFullYear().toString().slice(-2);
    const mm = (now.getMonth() + 1).toString().padStart(2, "0");
    const prefix = `${yy}${mm}${type}`;

    // 查詢當月該類別最大的會員編號
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
        // 解析現有編號，取得序號部分（最後4位）
        const seqStr = latestUser.memberNumber.slice(-4);
        nextNumber = parseInt(seqStr, 10) + 1;
    }

    // 格式化為四位數（不足補零）
    const paddedNumber = nextNumber.toString().padStart(4, "0");

    return `${prefix}${paddedNumber}`;
}

/**
 * 生成學員會員編號
 * 格式：YYMMTXXXX（T=2 學生）
 */
export async function generateChildMemberNumber(): Promise<string> {
    const now = new Date();
    const yy = now.getFullYear().toString().slice(-2);
    const mm = (now.getMonth() + 1).toString().padStart(2, "0");
    const prefix = `${yy}${mm}${MemberType.STUDENT}`;

    // 查詢當月最大的學員編號
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

    return `${prefix}${paddedNumber}`;
}
