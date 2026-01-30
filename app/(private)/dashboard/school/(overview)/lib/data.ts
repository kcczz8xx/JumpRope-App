import { prisma } from '@/lib/prisma';

const USE_MOCK_DATA = process.env.USE_MOCK_DATA === 'true' || true;

export interface DashboardMetrics {
    revenue: {
        current: number;
        previous: number;
        change: number;
    };
    activeCourses: {
        count: number;
        change: number;
    };
    pendingQuotations: number;
    pendingPayment: {
        amount: number;
        overdueCount: number;
    };
}

export interface Activity {
    id: string;
    type: 'QUOTATION_ACCEPTED' | 'QUOTATION_SENT' | 'COURSE_CREATED' | 'LESSON_COMPLETED' | 'INVOICE_PAID' | 'TUTOR_ASSIGNED';
    title: string;
    description?: string;
    timestamp: Date;
    relatedId?: string;
    relatedType?: 'quotation' | 'course' | 'invoice';
    schoolName?: string;
}

export async function getDashboardMetrics(
    role: string,
    schoolId?: string
): Promise<DashboardMetrics> {
    if (USE_MOCK_DATA) {
        return getMockMetrics();
    }

    const isSchoolAdmin = role === 'SCHOOL_ADMIN';
    const filter = isSchoolAdmin && schoolId ? { schoolId } : {};

    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const [currentRevenue, previousRevenue, activeCourses, previousActiveCourses, pendingQuotations, pendingInvoices] = await Promise.all([
        prisma.schoolReceipt.aggregate({
            where: {
                ...filter,
                paymentConfirmedDate: {
                    gte: startOfCurrentMonth,
                },
                paymentStatus: 'PAID',
            },
            _sum: {
                actualReceivedAmount: true,
            },
        }),

        prisma.schoolReceipt.aggregate({
            where: {
                ...filter,
                paymentConfirmedDate: {
                    gte: startOfPreviousMonth,
                    lte: endOfPreviousMonth,
                },
                paymentStatus: 'PAID',
            },
            _sum: {
                actualReceivedAmount: true,
            },
        }),

        prisma.schoolCourse.count({
            where: {
                ...filter,
                status: 'ACTIVE',
            },
        }),

        prisma.schoolCourse.count({
            where: {
                ...filter,
                status: 'ACTIVE',
                updatedAt: {
                    lt: startOfCurrentMonth,
                },
            },
        }),

        prisma.schoolQuotation.count({
            where: {
                ...filter,
                status: 'DRAFT',
            },
        }),

        prisma.schoolInvoice.findMany({
            where: {
                ...filter,
                status: {
                    in: ['SENT', 'OVERDUE'],
                },
            },
            select: {
                invoiceAmount: true,
                dueDate: true,
            },
        }),
    ]);

    const currentRevenueAmount = Number(currentRevenue._sum.actualReceivedAmount || 0);
    const previousRevenueAmount = Number(previousRevenue._sum.actualReceivedAmount || 0);
    const revenueChange = previousRevenueAmount > 0
        ? ((currentRevenueAmount - previousRevenueAmount) / previousRevenueAmount) * 100
        : 0;

    const coursesChange = activeCourses - previousActiveCourses;

    const totalPendingAmount = pendingInvoices.reduce(
        (sum, inv) => sum + Number(inv.invoiceAmount),
        0
    );

    const overdueInvoices = pendingInvoices.filter(
        (inv) => inv.dueDate && new Date(inv.dueDate) < now
    );

    return {
        revenue: {
            current: currentRevenueAmount,
            previous: previousRevenueAmount,
            change: Math.round(revenueChange),
        },
        activeCourses: {
            count: activeCourses,
            change: coursesChange,
        },
        pendingQuotations,
        pendingPayment: {
            amount: totalPendingAmount,
            overdueCount: overdueInvoices.length,
        },
    };
}

export async function getRecentActivities(
    role: string,
    schoolId?: string,
    limit: number = 10
): Promise<Activity[]> {
    if (USE_MOCK_DATA) {
        return getMockActivities(limit);
    }

    const isSchoolAdmin = role === 'SCHOOL_ADMIN';
    const filter = isSchoolAdmin && schoolId ? { schoolId } : {};

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [quotations, lessons, receipts] = await Promise.all([
        prisma.schoolQuotation.findMany({
            where: {
                ...filter,
                OR: [
                    { status: 'ACCEPTED', respondedDate: { gte: sevenDaysAgo } },
                    { status: 'SENT', sentDate: { gte: sevenDaysAgo } },
                ],
            },
            orderBy: { updatedAt: 'desc' },
            take: 5,
            include: { school: true },
        }),

        prisma.schoolLesson.findMany({
            where: {
                lessonStatus: 'COMPLETED',
                updatedAt: { gte: sevenDaysAgo },
                course: filter,
            },
            orderBy: { updatedAt: 'desc' },
            take: 5,
            include: {
                course: {
                    include: { school: true },
                },
            },
        }),

        prisma.schoolReceipt.findMany({
            where: {
                ...filter,
                paymentStatus: 'PAID',
                paymentConfirmedDate: { gte: sevenDaysAgo },
            },
            orderBy: { paymentConfirmedDate: 'desc' },
            take: 5,
            include: {
                invoice: true,
                school: true,
            },
        }),
    ]);

    const activities: Activity[] = [
        ...quotations.map((q) => ({
            id: q.id,
            type: (q.status === 'ACCEPTED' ? 'QUOTATION_ACCEPTED' : 'QUOTATION_SENT') as Activity['type'],
            title: `${q.school.schoolName}的報價${q.status === 'ACCEPTED' ? '被接受' : '已發送'}`,
            timestamp: (q.status === 'ACCEPTED' ? q.respondedDate : q.sentDate) || q.updatedAt,
            relatedId: q.id,
            relatedType: 'quotation' as const,
            schoolName: q.school.schoolName,
        })),

        ...lessons.map((l) => ({
            id: l.id,
            type: 'LESSON_COMPLETED' as const,
            title: `課程「${l.course.courseName}」已完成一堂`,
            description: `${l.course.school.schoolName}`,
            timestamp: l.updatedAt,
            relatedId: l.courseId,
            relatedType: 'course' as const,
            schoolName: l.course.school.schoolName,
        })),

        ...receipts.map((r) => ({
            id: r.id,
            type: 'INVOICE_PAID' as const,
            title: `發票 ${r.invoice.invoiceNumber} 已收款`,
            description: r.school.schoolName,
            timestamp: r.paymentConfirmedDate || r.createdAt,
            relatedId: r.invoiceId,
            relatedType: 'invoice' as const,
            schoolName: r.school.schoolName,
        })),
    ];

    return activities
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, limit);
}

function getMockMetrics(): DashboardMetrics {
    return {
        revenue: {
            current: 125000,
            previous: 108700,
            change: 15,
        },
        activeCourses: {
            count: 18,
            change: 2,
        },
        pendingQuotations: 3,
        pendingPayment: {
            amount: 45000,
            overdueCount: 2,
        },
    };
}

function getMockActivities(limit: number): Activity[] {
    const now = new Date();
    const activities: Activity[] = [
        {
            id: '1',
            type: 'QUOTATION_ACCEPTED',
            title: '聖保祿學校的報價被接受',
            timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000),
            relatedId: 'q-001',
            relatedType: 'quotation',
            schoolName: '聖保祿學校',
        },
        {
            id: '2',
            type: 'LESSON_COMPLETED',
            title: '課程「花式跳繩初班」已完成一堂',
            description: '培正小學',
            timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000),
            relatedId: 'c-001',
            relatedType: 'course',
            schoolName: '培正小學',
        },
        {
            id: '3',
            type: 'INVOICE_PAID',
            title: '發票 INV-2026-012 已收款',
            description: '嘉諾撒聖心學校',
            timestamp: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
            relatedId: 'inv-012',
            relatedType: 'invoice',
            schoolName: '嘉諾撒聖心學校',
        },
        {
            id: '4',
            type: 'QUOTATION_SENT',
            title: '瑪利諾修院學校的報價已發送',
            timestamp: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
            relatedId: 'q-002',
            relatedType: 'quotation',
            schoolName: '瑪利諾修院學校',
        },
        {
            id: '5',
            type: 'LESSON_COMPLETED',
            title: '課程「競技跳繩訓練」已完成一堂',
            description: '喇沙書院',
            timestamp: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
            relatedId: 'c-002',
            relatedType: 'course',
            schoolName: '喇沙書院',
        },
        {
            id: '6',
            type: 'INVOICE_PAID',
            title: '發票 INV-2026-010 已收款',
            description: '拔萃女書院',
            timestamp: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
            relatedId: 'inv-010',
            relatedType: 'invoice',
            schoolName: '拔萃女書院',
        },
    ];

    return activities.slice(0, limit);
}
