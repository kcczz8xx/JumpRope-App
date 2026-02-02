import { prisma } from '@/lib/db/prisma';
import { InvoiceStatus, PaymentStatus, PaymentMethod } from '@prisma/client';

const invoices = [
    {
        id: 'invoice_001',
        schoolId: 'school_hk_primary_1',
        invoiceNumber: 'INV-2024-09-001',
        invoiceDate: new Date('2024-10-05'),
        paymentTermsDays: 30,
        dueDate: new Date('2024-11-04'),
        status: InvoiceStatus.PAID,
        invoiceAmount: 4000,
        sentDate: new Date('2024-10-05'),
        recipientNameChinese: '陳大文',
        contactEmail: 'chan@hkps1.edu.hk',
        receipt: {
            receiptNumber: 'REC-2024-09-001',
            paymentConfirmedDate: new Date('2024-10-20'),
            actualReceivedAmount: 4000,
            paymentMethod: PaymentMethod.FPS,
            paymentStatus: PaymentStatus.PAID,
            paymentTransactionNumber: 'FPS202410201430',
        },
    },
    {
        id: 'invoice_002',
        schoolId: 'school_hk_primary_1',
        invoiceNumber: 'INV-2024-11-002',
        invoiceDate: new Date('2024-12-05'),
        paymentTermsDays: 30,
        dueDate: new Date('2025-01-04'),
        status: InvoiceStatus.SENT,
        invoiceAmount: 4000,
        sentDate: new Date('2024-12-05'),
        recipientNameChinese: '陳大文',
        contactEmail: 'chan@hkps1.edu.hk',
    },
    {
        id: 'invoice_003',
        schoolId: 'school_hk_primary_1',
        invoiceNumber: 'INV-2025-01-003',
        invoiceDate: new Date('2025-01-10'),
        paymentTermsDays: 30,
        dueDate: new Date('2024-12-25'),
        status: InvoiceStatus.OVERDUE,
        invoiceAmount: 4000,
        sentDate: new Date('2025-01-10'),
        recipientNameChinese: '陳大文',
        contactEmail: 'chan@hkps1.edu.hk',
    },
];

export const invoiceMockData = {
    async seed() {
        for (const invoiceData of invoices) {
            const { receipt, ...invoice } = invoiceData;

            await prisma.schoolInvoice.upsert({
                where: { id: invoice.id },
                update: invoice,
                create: {
                    ...invoice,
                    ...(receipt && {
                        receipt: {
                            create: {
                                ...receipt,
                                schoolId: invoice.schoolId,
                            },
                        },
                    }),
                },
            });
        }
    },

    invoices,
};
