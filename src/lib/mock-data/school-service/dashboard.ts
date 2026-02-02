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
            title: '香港第一小學的報價被接受',
            timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000),
            relatedId: 'quotation_001',
            relatedType: 'quotation',
            schoolName: '香港第一小學',
        },
        {
            id: '2',
            type: 'LESSON_COMPLETED',
            title: '課程「跳繩恆常班（上學期）」已完成一堂',
            description: '香港第一小學',
            timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000),
            relatedId: 'course_001',
            relatedType: 'course',
            schoolName: '香港第一小學',
        },
        {
            id: '3',
            type: 'INVOICE_PAID',
            title: '發票 INV-2024-09-001 已收款',
            description: '香港第一小學',
            timestamp: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
            relatedId: 'invoice_001',
            relatedType: 'invoice',
            schoolName: '香港第一小學',
        },
        {
            id: '4',
            type: 'QUOTATION_SENT',
            title: '九龍第二中學的報價已發送',
            timestamp: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
            relatedId: 'quotation_002',
            relatedType: 'quotation',
            schoolName: '九龍第二中學',
        },
        {
            id: '5',
            type: 'LESSON_COMPLETED',
            title: '課程「花式跳繩進階班」已完成一堂',
            description: '九龍第二中學',
            timestamp: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
            relatedId: 'course_003',
            relatedType: 'course',
            schoolName: '九龍第二中學',
        },
        {
            id: '6',
            type: 'COURSE_CREATED',
            title: '新課程「花式跳繩興趣班」已建立',
            description: '聖保羅小學',
            timestamp: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
            relatedId: 'course_004',
            relatedType: 'course',
            schoolName: '聖保羅小學',
        },
    ];

    return activities.slice(0, limit);
}

export const dashboardMockData = {
    getMetrics: getMockMetrics,
    getActivities: getMockActivities,
};
