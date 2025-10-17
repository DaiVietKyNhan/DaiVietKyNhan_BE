import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createAchievements() {
    try {
        console.log('Creating achievements...')

        // Tạo thành tựu cho Kỳ Ấn (KyNhanSummary)
        const kyNhanAchievements = [
            {
                name: 'Thu thập được 5 Kỳ Ấn',
                description: 'Thu thập được 5 Kỳ Ấn',
                type: 'KY_NHAN_SUMMARY_COUNT',
                requirement: 5,
                reward: 100,
                isActive: true,
                order: 1
            },
            {
                name: 'Thu thập được 15 Kỳ Ấn',
                description: 'Thu thập được 15 Kỳ Ấn',
                type: 'KY_NHAN_SUMMARY_COUNT',
                requirement: 15,
                reward: 200,
                isActive: true,
                order: 2
            },
            {
                name: 'Thu thập được 30 Kỳ Ấn',
                description: 'Thu thập được 30 Kỳ Ấn',
                type: 'KY_NHAN_SUMMARY_COUNT',
                requirement: 30,
                reward: 700,
                isActive: true,
                order: 3
            }
        ]

        // Tạo thành tựu cho Land
        const landAchievements = [
            {
                name: 'Thu thập được Núi Tản Viên',
                description: 'Thu thập được Núi Tản Viên',
                type: 'LAND_COLLECTION',
                requirement: 1,
                reward: 200,
                isActive: true,
                order: 1,
                landId: 1 // Giả sử Núi Tản Viên có ID = 1
            },
            {
                name: 'Thu thập được Đầm Dạ Trạch',
                description: 'Thu thập được Đầm Dạ Trạch',
                type: 'LAND_COLLECTION',
                requirement: 1,
                reward: 200,
                isActive: true,
                order: 2,
                landId: 2 // Giả sử Đầm Dạ Trạch có ID = 2
            },
            {
                name: 'Thu thập được Làng Phù Đổng',
                description: 'Thu thập được Làng Phù Đổng',
                type: 'LAND_COLLECTION',
                requirement: 1,
                reward: 200,
                isActive: true,
                order: 3,
                landId: 3 // Giả sử Làng Phù Đổng có ID = 3
            }
        ]

        // Tạo thành tựu Kỳ Ấn
        for (const achievement of kyNhanAchievements) {
            await prisma.achievement.create({
                data: achievement
            })
            console.log(`Created achievement: ${achievement.name}`)
        }

        // Tạo thành tựu Land
        for (const achievement of landAchievements) {
            await prisma.achievement.create({
                data: achievement
            })
            console.log(`Created achievement: ${achievement.name}`)
        }

        console.log('All achievements created successfully!')
    } catch (error) {
        console.error('Error creating achievements:', error)
    } finally {
        await prisma.$disconnect()
    }
}

createAchievements()
