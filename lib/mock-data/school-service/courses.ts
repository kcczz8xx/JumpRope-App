import { prisma } from '../../prisma';
import { ChargingModel, CourseTerm, CourseStatus } from '@prisma/client';

export interface CourseWithSchool {
    id: string;
    courseName: string;
    courseType: string;
    courseTerm: CourseTerm;
    academicYear: string;
    chargingModels: ChargingModel[];
    status: CourseStatus;
    requiredTutors: number;
    maxStudents: number | null;
    startDate: Date | null;
    endDate: Date | null;
    school: {
        id: string;
        schoolName: string;
    };
    _count: {
        lessons: number;
    };
}

const courses = [
    {
        id: 'course_001',
        schoolId: 'school_hk_primary_1',
        courseName: '跳繩恆常班（上學期）',
        courseCode: 'HKPS-2024-RC-01',
        courseType: "恆常班",
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
        courseType: "恆常班",
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
        courseType: "恆常班",
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
    {
        id: 'course_004',
        schoolId: 'school_004',
        courseName: '花式跳繩興趣班',
        courseCode: 'SPPS-2024-IC-01',
        courseType: "興趣班",
        courseTerm: CourseTerm.FULL_YEAR,
        academicYear: '2024-2025',
        startDate: new Date('2024-09-01'),
        endDate: new Date('2025-06-30'),
        requiredTutors: 3,
        maxStudents: 30,
        chargingModel: ChargingModel.STUDENT_PER_LESSON,
        studentPerLessonFee: 60,
        tutorPerLessonFee: 350,
        status: CourseStatus.ACTIVE,
    },
    {
        id: 'course_005',
        schoolId: 'school_006',
        courseName: '暑期跳繩訓練營',
        courseCode: 'LSPS-2024-SC-01',
        courseType: "暑期班",
        courseTerm: CourseTerm.SUMMER,
        academicYear: '2024-2025',
        startDate: new Date('2024-07-15'),
        endDate: new Date('2024-08-09'),
        requiredTutors: 4,
        maxStudents: 40,
        chargingModel: ChargingModel.STUDENT_FULL_COURSE,
        studentFullCourseFee: 2400,
        tutorPerLessonFee: 400,
        status: CourseStatus.COMPLETED,
    },
    {
        id: 'course_006',
        schoolId: 'school_007',
        courseName: '跳繩比賽培訓班',
        courseCode: 'DBS-2024-TC-01',
        courseType: "校隊班",
        courseTerm: CourseTerm.FIRST_TERM,
        academicYear: '2024-2025',
        startDate: new Date('2024-10-01'),
        endDate: new Date('2024-12-20'),
        requiredTutors: 2,
        maxStudents: 15,
        chargingModel: ChargingModel.TUTOR_PER_LESSON,
        tutorPerLessonFee: 500,
        status: CourseStatus.ACTIVE,
    },
    {
        id: 'course_007',
        schoolId: 'school_008',
        courseName: '親子跳繩體驗班',
        courseCode: 'MCS-2024-TR-01',
        courseType: "試堂",
        courseTerm: CourseTerm.FIRST_TERM,
        academicYear: '2024-2025',
        startDate: new Date('2024-09-15'),
        endDate: new Date('2024-09-15'),
        requiredTutors: 2,
        maxStudents: 20,
        chargingModel: ChargingModel.TEAM_ACTIVITY,
        teamActivityFee: 3000,
        tutorPerLessonFee: 600,
        status: CourseStatus.COMPLETED,
    },
    {
        id: 'course_008',
        schoolId: 'school_009',
        courseName: '課後跳繩興趣班',
        courseCode: 'SJPS-2024-AC-01',
        courseType: "課後班",
        courseTerm: CourseTerm.FULL_YEAR,
        academicYear: '2024-2025',
        startDate: new Date('2024-09-01'),
        endDate: new Date('2025-06-30'),
        requiredTutors: 1,
        maxStudents: 20,
        chargingModel: ChargingModel.STUDENT_HOURLY,
        studentHourlyFee: 80,
        tutorHourlyFee: 200,
        status: CourseStatus.ACTIVE,
    },
    {
        id: 'course_009',
        schoolId: 'school_005',
        courseName: '跳繩密集班',
        courseCode: 'PCPS-2025-IC-01',
        courseType: "集訓課程",
        courseTerm: CourseTerm.FIRST_TERM,
        academicYear: '2025-2026',
        startDate: new Date('2025-09-01'),
        endDate: new Date('2025-10-31'),
        requiredTutors: 3,
        maxStudents: 25,
        chargingModel: ChargingModel.STUDENT_PER_LESSON,
        studentPerLessonFee: 70,
        tutorPerLessonFee: 380,
        status: CourseStatus.DRAFT,
    },
    {
        id: 'course_010',
        schoolId: 'school_010',
        courseName: '教師跳繩工作坊',
        courseCode: 'YWPS-2025-WS-01',
        courseType: "興趣班",
        courseTerm: CourseTerm.SECOND_TERM,
        academicYear: '2024-2025',
        startDate: new Date('2025-03-01'),
        endDate: new Date('2025-03-01'),
        requiredTutors: 1,
        maxStudents: 30,
        chargingModel: ChargingModel.TUTOR_HOURLY,
        tutorHourlyFee: 800,
        status: CourseStatus.CANCELLED,
        remarks: '學校臨時取消',
    },
    {
        id: 'course_011',
        schoolId: 'school_011',
        courseName: '跳繩恆常班 A 組',
        courseCode: 'KTS-2024-RC-A',
        courseType: "恆常班",
        courseTerm: CourseTerm.FULL_YEAR,
        academicYear: '2024-2025',
        startDate: new Date('2024-09-01'),
        endDate: new Date('2025-06-30'),
        requiredTutors: 2,
        maxStudents: 25,
        chargingModel: ChargingModel.STUDENT_PER_LESSON,
        studentPerLessonFee: 55,
        tutorPerLessonFee: 320,
        status: CourseStatus.SUSPENDED,
        remarks: '因疫情暫停',
    },
    {
        id: 'course_012',
        schoolId: 'school_013',
        courseName: '新手跳繩入門班',
        courseCode: 'PLKCKY-2025-BG-01',
        courseType: "試堂",
        courseTerm: CourseTerm.SECOND_TERM,
        academicYear: '2024-2025',
        startDate: new Date('2025-02-10'),
        endDate: new Date('2025-03-28'),
        requiredTutors: 1,
        maxStudents: 15,
        chargingModel: ChargingModel.STUDENT_PER_LESSON,
        studentPerLessonFee: 45,
        tutorPerLessonFee: 280,
        status: CourseStatus.ACTIVE,
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

    async getCoursesWithSchool() {
        const schools = await prisma.school.findMany();
        const lessons = await prisma.schoolLesson.findMany();

        return courses.map(course => {
            const school = schools.find(s => s.id === course.schoolId);
            const lessonCount = lessons.filter(l => l.courseId === course.id).length;

            return {
                id: course.id,
                courseName: course.courseName,
                courseType: course.courseType,
                courseTerm: course.courseTerm,
                academicYear: course.academicYear,
                chargingModels: [course.chargingModel],
                status: course.status,
                requiredTutors: course.requiredTutors,
                maxStudents: course.maxStudents,
                startDate: course.startDate,
                endDate: course.endDate,
                school: school ? {
                    id: school.id,
                    schoolName: school.schoolName,
                } : {
                    id: course.schoolId,
                    schoolName: '未知學校',
                },
                _count: {
                    lessons: lessonCount,
                },
            };
        });
    },
};
