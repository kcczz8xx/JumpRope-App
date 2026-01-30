import { prisma } from '../prisma';
import { CourseType, ChargingModel, CourseTerm, CourseStatus } from '@prisma/client';

const courses = [
    {
        id: 'course_001',
        schoolId: 'school_hk_primary_1',
        courseName: '跳繩恆常班（上學期）',
        courseCode: 'HKPS-2024-RC-01',
        courseType: CourseType.REGULAR_CLASS,
        courseTerm: CourseTerm.FIRST_TERM,
        academicYear: '2024-2025',
        startDate: new Date('2024-09-09'),
        endDate: new Date('2025-01-17'),
        requiredTutors: 2,
        maxStudents: 25,
        chargingModel: ChargingModel.STUDENT_PER_LESSON,
        studentPerLessonFee: 50,
        tutorPerLessonFee: 300,
        status: CourseStatus.ACTIVE,
    },
    {
        id: 'course_002',
        schoolId: 'school_hk_primary_1',
        courseName: '跳繩恆常班（下學期）',
        courseCode: 'HKPS-2025-RC-02',
        courseType: CourseType.REGULAR_CLASS,
        courseTerm: CourseTerm.SECOND_TERM,
        academicYear: '2024-2025',
        startDate: new Date('2025-02-03'),
        endDate: new Date('2025-06-20'),
        requiredTutors: 2,
        maxStudents: 25,
        chargingModel: ChargingModel.STUDENT_PER_LESSON,
        studentPerLessonFee: 50,
        tutorPerLessonFee: 300,
        status: CourseStatus.SCHEDULED,
    },
    {
        id: 'course_003',
        schoolId: 'school_kowloon_sec_1',
        courseName: '花式跳繩進階班',
        courseCode: 'KLSS-2025-RC-01',
        courseType: CourseType.REGULAR_CLASS,
        courseTerm: CourseTerm.SECOND_TERM,
        academicYear: '2024-2025',
        startDate: new Date('2025-02-01'),
        endDate: new Date('2025-06-30'),
        requiredTutors: 3,
        maxStudents: 30,
        chargingModel: ChargingModel.STUDENT_PER_LESSON,
        studentPerLessonFee: 60,
        tutorPerLessonFee: 350,
        status: CourseStatus.SCHEDULED,
        remarks: '口頭確認，無書面報價',
    },
];

export const courseMockData = {
    async seed() {
        for (const course of courses) {
            await prisma.schoolCourse.upsert({
                where: { id: course.id },
                update: course,
                create: course,
            });
        }
    },

    courses,
};
