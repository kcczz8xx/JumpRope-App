import { prisma } from '../prisma';
import { PartnershipStatus } from '@prisma/client';

const schools = [
    {
        id: 'school_hk_primary_1',
        schoolName: '香港第一小學',
        schoolNameEn: 'Hong Kong Primary School No.1',
        schoolCode: 'HKPS001',
        address: '香港島中西區堅道123號',
        phone: '2123-4567',
        email: 'info@hkps1.edu.hk',
        partnershipStatus: PartnershipStatus.ACTIVE,
        partnershipStartDate: new Date('2024-09-01'),
        partnershipStartYear: '2024-2025',
        contacts: [
            {
                nameChinese: '陳大文',
                nameEnglish: 'Chan Tai Man',
                position: '體育科主任',
                phone: '2123-4567',
                mobile: '9123-4567',
                email: 'chan@hkps1.edu.hk',
                isPrimary: true,
            },
        ],
    },
    {
        id: 'school_kowloon_sec_1',
        schoolName: '九龍第二中學',
        schoolNameEn: 'Kowloon Secondary School No.2',
        schoolCode: 'KLSS002',
        address: '九龍油尖旺區彌敦道456號',
        phone: '2234-5678',
        email: 'info@klss2.edu.hk',
        partnershipStatus: PartnershipStatus.CONFIRMED,
        partnershipStartDate: new Date('2025-01-15'),
        partnershipStartYear: '2024-2025',
        contacts: [
            {
                nameChinese: '李小明',
                nameEnglish: 'Lee Siu Ming',
                position: '課外活動主任',
                phone: '2234-5678',
                mobile: '9234-5678',
                email: 'lee@klss2.edu.hk',
                isPrimary: true,
            },
        ],
    },
    {
        id: 'school_nt_primary_3',
        schoolName: '新界第三小學',
        schoolNameEn: 'New Territories Primary School No.3',
        schoolCode: 'NTPS003',
        address: '新界沙田區大圍道789號',
        phone: '2345-6789',
        email: 'info@ntps3.edu.hk',
        partnershipStatus: PartnershipStatus.INQUIRY,
        contacts: [
            {
                nameChinese: '王美玲',
                nameEnglish: 'Wong Mei Ling',
                position: '校長',
                phone: '2345-6789',
                mobile: '9345-6789',
                email: 'wong@ntps3.edu.hk',
                isPrimary: true,
            },
        ],
    },
];

export const schoolMockData = {
    async seed() {
        for (const schoolData of schools) {
            const { contacts, ...school } = schoolData;

            await prisma.school.upsert({
                where: { id: school.id },
                update: school,
                create: {
                    ...school,
                    contacts: {
                        create: contacts,
                    },
                },
            });
        }
    },

    schools,
};
