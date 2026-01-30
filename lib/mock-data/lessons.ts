import { prisma } from '../prisma';
import { LessonType, LessonStatus, CourseTerm, PaymentStatus } from '@prisma/client';

function generateLessons() {
    const lessons = [];
    const startDate = new Date('2024-09-09');

    for (let i = 0; i < 16; i++) {
        const lessonDate = new Date(startDate);
        lessonDate.setDate(startDate.getDate() + i * 7);

        const isCompleted = i < 12;

        lessons.push({
            id: `lesson_${String(i + 1).padStart(3, '0')}`,
            courseId: 'course_001',
            lessonDate,
            startTime: '14:00',
            endTime: '15:30',
            weekday: 1,
            lessonType: LessonType.REGULAR,
            lessonTerm: CourseTerm.FIRST_TERM,
            studentCount: isCompleted ? 20 : null,
            lessonStatus: isCompleted ? LessonStatus.COMPLETED : LessonStatus.SCHEDULED,
            feeMode: 'STUDENT_PER_LESSON',
            feePerMode: 50,
            feeLesson: isCompleted ? 1000 : null,
            invoiceStatus: i < 8 ? 'INVOICED' : 'NOT_INVOICED',
            paymentStatus: i < 4 ? PaymentStatus.PAID : PaymentStatus.PENDING,
        });
    }

    return lessons;
}

const lessons = generateLessons();

export const lessonMockData = {
    async seed() {
        for (const lesson of lessons) {
            await prisma.schoolLesson.upsert({
                where: { id: lesson.id },
                update: lesson,
                create: lesson,
            });
        }
    },

    lessons,
};
