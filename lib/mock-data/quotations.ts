import { prisma } from '../prisma';
import { QuotationStatus, CourseType, ChargingModel } from '@prisma/client';

const quotations = [
    {
        id: 'quotation_001',
        schoolId: 'school_hk_primary_1',
        quotationNumber: 'Q2026-001',
        status: QuotationStatus.ACCEPTED,
        inquiryDate: new Date('2024-08-15'),
        desiredStartDate: new Date('2024-09-09'),
        estimatedStudentCount: 20,
        desiredSchedule: '每週一 14:00-15:30',
        quotationDate: new Date('2024-08-16'),
        validUntil: new Date('2024-09-15'),
        totalAmount: 12000,
        sentDate: new Date('2024-08-16'),
        respondedDate: new Date('2024-08-20'),
        items: [
            {
                courseName: '跳繩恆常班（上學期）',
                courseType: CourseType.REGULAR_CLASS,
                chargingModel: ChargingModel.STUDENT_PER_LESSON,
                unitPrice: 50,
                quantity: 12,
                totalPrice: 12000,
                lessonsPerWeek: 1,
                durationMinutes: 90,
                estimatedStudents: 20,
                requiredTutors: 2,
            },
        ],
    },
    {
        id: 'quotation_002',
        schoolId: 'school_kowloon_sec_1',
        quotationNumber: 'Q2026-002',
        status: QuotationStatus.SENT,
        inquiryDate: new Date('2025-01-10'),
        desiredStartDate: new Date('2025-02-01'),
        estimatedStudentCount: 30,
        desiredSchedule: '每週三、五 15:30-17:00',
        quotationDate: new Date('2025-01-11'),
        validUntil: new Date('2025-02-10'),
        totalAmount: 18000,
        sentDate: new Date('2025-01-11'),
        items: [
            {
                courseName: '花式跳繩進階班',
                courseType: CourseType.REGULAR_CLASS,
                chargingModel: ChargingModel.STUDENT_PER_LESSON,
                unitPrice: 60,
                quantity: 10,
                totalPrice: 18000,
                lessonsPerWeek: 2,
                durationMinutes: 90,
                estimatedStudents: 30,
                requiredTutors: 3,
            },
        ],
    },
    {
        id: 'quotation_003',
        schoolId: 'school_nt_primary_3',
        quotationNumber: 'Q2026-003',
        status: QuotationStatus.DRAFT,
        inquiryDate: new Date('2025-01-25'),
        desiredStartDate: new Date('2025-02-15'),
        estimatedStudentCount: 15,
        desiredSchedule: '每週二 14:30-16:00',
        quotationDate: new Date('2025-01-26'),
        validUntil: new Date('2025-02-25'),
        items: [
            {
                courseName: '跳繩試堂體驗',
                courseType: CourseType.TRIAL_CLASS,
                chargingModel: ChargingModel.STUDENT_PER_LESSON,
                unitPrice: 40,
                quantity: 4,
                totalPrice: 2400,
                lessonsPerWeek: 1,
                durationMinutes: 90,
                estimatedStudents: 15,
                requiredTutors: 2,
            },
        ],
    },
];

export const quotationMockData = {
    async seed() {
        for (const quotationData of quotations) {
            const { items, ...quotation } = quotationData;

            await prisma.schoolQuotation.upsert({
                where: { id: quotation.id },
                update: quotation,
                create: {
                    ...quotation,
                    items: {
                        create: items,
                    },
                },
            });
        }
    },

    quotations,
};
