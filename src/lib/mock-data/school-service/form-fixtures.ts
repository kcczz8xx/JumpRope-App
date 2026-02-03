import { SchoolBasicData, SchoolContactData, CourseItemData, CourseTerm, ChargingModel } from '@/features/school-service/components/types';

const random = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;
const randomDate = (start: Date, end: Date): string => {
    const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return date.toISOString().split('T')[0];
};

const schoolNames = [
    { zh: "聖保羅小學", en: "St. Paul's Primary School" },
    { zh: "培正小學", en: "Pui Ching Primary School" },
    { zh: "喇沙小學", en: "La Salle Primary School" },
    { zh: "拔萃男書院", en: "Diocesan Boys' School" },
    { zh: "瑪利諾修院學校", en: "Maryknoll Convent School" },
    { zh: "協恩中學", en: "Heep Yunn School" },
    { zh: "英華小學", en: "Ying Wa Primary School" },
    { zh: "華仁書院", en: "Wah Yan College" },
];

const districts = [
    "中西區", "灣仔區", "東區", "南區",
    "油尖旺區", "深水埗區", "九龍城區", "黃大仙區", "觀塘區",
    "葵青區", "荃灣區", "屯門區", "元朗區", "北區", "大埔區", "沙田區", "西貢區", "離島區"
];

const streets = ["道", "街", "路", "里", "徑", "坊"];

const confirmationChannels = ["電話", "電郵", "會議", "WhatsApp", "面談", "Zoom", "Teams"];

const surnames = ["陳", "李", "張", "黃", "林", "王", "吳", "劉", "梁", "鄭", "何", "周"];
const givenNames = ["大文", "小明", "美玲", "志強", "詩琪", "俊傑", "雅文", "家豪", "嘉欣", "偉明"];
const englishNames = [
    { first: "Chan", given: "Tai Man" },
    { first: "Lee", given: "Siu Ming" },
    { first: "Wong", given: "Mei Ling" },
    { first: "Cheung", given: "Chi Keung" },
    { first: "Lam", given: "Ka Ho" },
    { first: "Ng", given: "Wai Ming" },
];

const positions = ["校長", "副校長", "體育科主任", "課外活動主任", "主任", "老師", "教練"];

const courseNames = [
    "跳繩恆常班（上學期）",
    "跳繩恆常班（下學期）",
    "花式跳繩校隊訓練",
    "跳繩興趣班",
    "跳繩體驗班",
    "競技跳繩訓練班",
    "親子跳繩班",
    "暑期跳繩密集班",
];

const courseTypes = ["興趣班", "校隊", "體驗班", "訓練班", "密集班", "親子班"];

const courseDescriptions = [
    "適合小三至小五學生，教授基本跳繩技巧及花式跳繩",
    "校隊成員專屬訓練，準備參加校際比賽",
    "初學者體驗課程，讓學生認識跳繩運動",
    "進階訓練課程，提升學生跳繩技巧及體能",
    "暑期密集訓練，快速提升跳繩水平",
    "親子同樂課程，增進親子關係",
    "競技跳繩專項訓練，培養專業運動員",
];

export const formFixtures = {
    school: (): Partial<SchoolBasicData> => {
        const school = random(schoolNames);
        const district = random(districts);
        const street = `${random(["中", "東", "西", "南", "北", "大", "小", "新", "舊"])}${random(["文", "明", "華", "德", "仁", "義", "禮", "智"])}${random(streets)}`;
        const streetNum = randomInt(1, 999);
        const phone = `2${randomInt(100, 999)}${randomInt(1000, 9999)}`;
        const schoolCode = school.en.split(' ').map(w => w[0]).join('').toUpperCase() + randomInt(100, 999);

        const startDate = randomDate(new Date(2025, 0, 1), new Date(2026, 11, 31));
        const endDate = randomDate(new Date(2027, 0, 1), new Date(2028, 11, 31));

        return {
            schoolName: school.zh,
            schoolNameEn: school.en,
            address: `${district}${street}${streetNum}號`,
            phone,
            email: `info@${schoolCode.toLowerCase()}.edu.hk`,
            website: `https://www.${schoolCode.toLowerCase()}.edu.hk`,
            partnershipStartDate: startDate,
            partnershipEndDate: endDate,
            confirmationChannel: random(confirmationChannels),
            remarks: Math.random() > 0.5 ? `${random(["已確認", "待確認", "需跟進"])}合作細節` : undefined,
        };
    },

    contact: (): Partial<SchoolContactData> => {
        const surname = random(surnames);
        const givenName = random(givenNames);
        const englishName = random(englishNames);
        const position = random(positions);
        const phone = `2${randomInt(100, 999)}${randomInt(1000, 9999)}`;
        const mobile = `9${randomInt(100, 999)}${randomInt(1000, 9999)}`;

        return {
            nameChinese: `${surname}${givenName}`,
            nameEnglish: `${englishName.first} ${englishName.given}`,
            position,
            phone,
            mobile,
            email: `${englishName.first.toLowerCase()}@school.edu.hk`,
        };
    },

    course: (): Partial<CourseItemData> => {
        const courseName = random(courseNames);
        const courseType = random(courseTypes);
        const courseTerm = random([CourseTerm.FIRST_TERM, CourseTerm.SECOND_TERM, CourseTerm.FULL_YEAR]);
        const requiredTutors = randomInt(1, 3);
        const maxStudents = randomInt(15, 40);

        const chargingModels: ChargingModel[][] = [
            [ChargingModel.STUDENT_PER_LESSON],
            [ChargingModel.TUTOR_PER_LESSON],
            [ChargingModel.STUDENT_PER_LESSON, ChargingModel.TUTOR_PER_LESSON],
            [ChargingModel.STUDENT_HOURLY],
            [ChargingModel.STUDENT_FULL_COURSE],
        ];
        const chargingModel: ChargingModel[] = random(chargingModels);

        const fees: Partial<CourseItemData> = {};
        if (chargingModel.includes(ChargingModel.STUDENT_PER_LESSON)) {
            fees.studentPerLessonFee = randomInt(30, 80);
        }
        if (chargingModel.includes(ChargingModel.TUTOR_PER_LESSON)) {
            fees.tutorPerLessonFee = randomInt(600, 1200);
        }
        if (chargingModel.includes(ChargingModel.STUDENT_HOURLY)) {
            fees.studentHourlyFee = randomInt(80, 150);
        }
        if (chargingModel.includes(ChargingModel.TUTOR_HOURLY)) {
            fees.tutorHourlyFee = randomInt(250, 400);
        }
        if (chargingModel.includes(ChargingModel.STUDENT_FULL_COURSE)) {
            fees.studentFullCourseFee = randomInt(1500, 3000);
        }
        if (chargingModel.includes(ChargingModel.TEAM_ACTIVITY)) {
            fees.teamActivityFee = randomInt(3000, 8000);
        }

        return {
            courseName,
            courseType,
            courseTerm,
            requiredTutors,
            maxStudents,
            chargingModel: chargingModel as ChargingModel[],
            ...fees,
            courseDescription: random(courseDescriptions),
        };
    },

    multipleCourses: (count: number = 2): Partial<CourseItemData>[] => {
        return Array.from({ length: count }, () => formFixtures.course());
    },
};
