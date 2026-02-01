import { prisma } from '@/lib/db/prisma';
import { schools } from './schools.data';

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
