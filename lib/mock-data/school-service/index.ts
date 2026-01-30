import { prisma } from '../../prisma';
import { schoolMockData } from './schools';
import { getSchoolsList } from './schools.data';
import { courseMockData } from './courses';
import { quotationMockData } from './quotations';
import { invoiceMockData } from './invoices';
import { lessonMockData } from './lessons';
import { dashboardMockData } from './dashboard';

export { schoolMockData, courseMockData, quotationMockData, invoiceMockData, lessonMockData, dashboardMockData, getSchoolsList };

const isMockEnabled = process.env.NEXT_PUBLIC_MOCK_DATA === 'true';

export interface MockDataConfig {
    enabled: boolean;
    clearBeforeSeed?: boolean;
}

export async function seedMockData(config: MockDataConfig = { enabled: isMockEnabled }) {
    if (!config.enabled) {
        console.log('📊 Mock data is disabled');
        return;
    }

    console.log('🌱 Starting mock data seeding...');

    try {
        if (config.clearBeforeSeed) {
            console.log('🗑️ Clearing existing data...');
            await clearData();
        }

        console.log('📚 Seeding schools...');
        await schoolMockData.seed();

        console.log('💼 Seeding quotations...');
        await quotationMockData.seed();

        console.log('🎓 Seeding courses...');
        await courseMockData.seed();

        console.log('📅 Seeding lessons...');
        await lessonMockData.seed();

        console.log('💰 Seeding invoices...');
        await invoiceMockData.seed();

        console.log('✅ Mock data seeding completed!');
    } catch (error) {
        console.error('❌ Error seeding mock data:', error);
        throw error;
    }
}

async function clearData() {
    await prisma.schoolTutorLesson.deleteMany();
    await prisma.schoolLesson.deleteMany();
    await prisma.schoolInvoiceCourse.deleteMany();
    await prisma.schoolReceipt.deleteMany();
    await prisma.schoolInvoice.deleteMany();
    await prisma.schoolCourse.deleteMany();
    await prisma.schoolQuotationItem.deleteMany();
    await prisma.schoolQuotation.deleteMany();
    await prisma.schoolContact.deleteMany();
    await prisma.school.deleteMany();
}

export function isMockDataEnabled(): boolean {
    return isMockEnabled;
}

export async function getMockData<T>(
    realDataFn: () => Promise<T>,
    mockData?: T
): Promise<T> {
    if (isMockEnabled && mockData !== undefined) {
        return mockData;
    }
    return realDataFn();
}
