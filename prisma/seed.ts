import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import bcrypt from "bcryptjs";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set.");
}

const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
    const passwordHash = await bcrypt.hash("hkjra6368", 12);

    // ============================================
    // 1. Admin 用戶
    // ============================================
    const admin = await prisma.user.upsert({
        where: { phone: "+85255606368" },
        update: {},
        create: {
            phone: "+85255606368",
            email: "admin@jra.hk",
            memberNumber: "260210001",
            nickname: "JRA管理員",
            nameChinese: "陳大文",
            nameEnglish: "Chan Tai Man",
            title: "先生",
            gender: "MALE",
            role: "ADMIN",
            whatsappEnabled: true,
            passwordHash,
        },
    });
    console.log("✅ Admin 用戶已建立:", admin.nickname);

    // ============================================
    // 2. Staff 職員
    // ============================================
    const staff = await prisma.user.upsert({
        where: { phone: "+85291234567" },
        update: {},
        create: {
            phone: "+85291234567",
            email: "staff@jra.hk",
            memberNumber: "260210002",
            nickname: "小明",
            nameChinese: "李小明",
            nameEnglish: "Lee Siu Ming",
            title: "先生",
            gender: "MALE",
            role: "STAFF",
            whatsappEnabled: true,
            passwordHash,
            address: {
                create: {
                    region: "HK",
                    district: "中西區",
                    address: "香港中環皇后大道中100號",
                },
            },
            bankAccount: {
                create: {
                    bankName: "恒生銀行",
                    accountNumber: "123-456789-001",
                    accountHolderName: "李小明",
                    fpsId: "91234567",
                    fpsEnabled: true,
                },
            },
        },
    });
    console.log("✅ Staff 用戶已建立:", staff.nickname);

    // ============================================
    // 3. Tutor 導師
    // ============================================
    const tutor = await prisma.user.upsert({
        where: { phone: "+85298765432" },
        update: {},
        create: {
            phone: "+85298765432",
            email: "tutor@jra.hk",
            memberNumber: "260210003",
            nickname: "王教練",
            nameChinese: "王志強",
            nameEnglish: "Wong Chi Keung",
            title: "先生",
            gender: "MALE",
            identityCardNumber: "A1234567",
            role: "TUTOR",
            whatsappEnabled: true,
            passwordHash,
            address: {
                create: {
                    region: "KLN",
                    district: "觀塘區",
                    address: "九龍觀塘道123號",
                },
            },
            bankAccount: {
                create: {
                    bankName: "中國銀行",
                    accountNumber: "012-345-67890123",
                    accountHolderName: "王志強",
                    fpsId: "98765432",
                    fpsEnabled: true,
                },
            },
            tutorProfile: {
                create: {
                    isActive: true,
                    approvedAt: new Date("2023-01-15"),
                    remarks: "資深跳繩教練，擁有10年教學經驗",
                },
            },
        },
    });
    console.log("✅ Tutor 用戶已建立:", tutor.nickname);

    // ============================================
    // 4. Parent 家長（含學員）
    // ============================================
    const parent = await prisma.user.upsert({
        where: { phone: "+85261234567" },
        update: {},
        create: {
            phone: "+85261234567",
            email: "parent@example.com",
            memberNumber: "260210004",
            nickname: "張媽媽",
            nameChinese: "張美玲",
            nameEnglish: "Cheung Mei Ling",
            title: "女士",
            gender: "FEMALE",
            role: "PARENT",
            whatsappEnabled: true,
            passwordHash,
            address: {
                create: {
                    region: "NT",
                    district: "沙田區",
                    address: "新界沙田正街88號",
                },
            },
            children: {
                create: [
                    {
                        memberNumber: "260220001",
                        nameChinese: "張小明",
                        nameEnglish: "Cheung Siu Ming",
                        birthYear: 2015,
                        school: "沙田官立小學",
                        gender: "MALE",
                    },
                    {
                        memberNumber: "260220002",
                        nameChinese: "張小美",
                        nameEnglish: "Cheung Siu Mei",
                        birthYear: 2017,
                        school: "沙田官立小學",
                        gender: "FEMALE",
                    },
                ],
            },
        },
    });
    console.log("✅ Parent 用戶已建立:", parent.nickname);

    // ============================================
    // 5. Student 學生
    // ============================================
    const student = await prisma.user.upsert({
        where: { phone: "+85251234567" },
        update: {},
        create: {
            phone: "+85251234567",
            email: "student@example.com",
            memberNumber: "260220003",
            nickname: "阿杰",
            nameChinese: "劉俊杰",
            nameEnglish: "Lau Chun Kit",
            title: "先生",
            gender: "MALE",
            identityCardNumber: "B9876543",
            role: "STUDENT",
            whatsappEnabled: false,
            passwordHash,
            address: {
                create: {
                    region: "KLN",
                    district: "黃大仙區",
                    address: "九龍黃大仙下邨龍光樓",
                },
            },
        },
    });
    console.log("✅ Student 用戶已建立:", student.nickname);

    // ============================================
    // 6. 普通會員
    // ============================================
    const user = await prisma.user.upsert({
        where: { phone: "+85241234567" },
        update: {},
        create: {
            phone: "+85241234567",
            email: "user@example.com",
            memberNumber: "260210005",
            nickname: "新會員",
            nameChinese: "何家豪",
            nameEnglish: "Ho Ka Ho",
            title: "先生",
            gender: "MALE",
            role: "USER",
            whatsappEnabled: true,
            passwordHash,
        },
    });
    console.log("✅ User 用戶已建立:", user.nickname);

    // ============================================
    // 7. 學校資料
    // ============================================
    const school = await prisma.school.upsert({
        where: { schoolCode: "SCH-2024-001" },
        update: {},
        create: {
            schoolCode: "SCH-2024-001",
            schoolName: "聖公會聖雅各小學",
            address: "香港灣仔堅尼地道110號",
            partnershipStatus: "ACTIVE",
            contacts: {
                create: [
                    {
                        nameChinese: "陳主任",
                        position: "體育科主任",
                        email: "pe@sjacps.edu.hk",
                        phone: "+85225551234",
                        isPrimary: true,
                    },
                ],
            },
        },
    });
    console.log("✅ School 已建立:", school.schoolName);

    console.log("\n🎉 Seed 完成！所有測試資料已建立。");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
