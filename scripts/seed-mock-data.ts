import { seedMockData } from '../lib/mock-data/school-service';

async function main() {
    console.log('🌱 Starting database seeding with mock data...\n');

    await seedMockData({
        enabled: true,
        clearBeforeSeed: true,
    });

    console.log('\n✅ Database seeding completed successfully!');
    process.exit(0);
}

main().catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
});
