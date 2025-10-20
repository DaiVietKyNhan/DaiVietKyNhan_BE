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
                type: 'KY_NHAN_SUMMARY_COUNT' as const,
                requirement: 5,
                reward: 100,
                isActive: true,
                order: 1
            },
            {
                name: 'Thu thập được 15 Kỳ Ấn',
                description: 'Thu thập được 15 Kỳ Ấn',
                type: 'KY_NHAN_SUMMARY_COUNT' as const,
                requirement: 15,
                reward: 200,
                isActive: true,
                order: 2
            },
            {
                name: 'Thu thập được 30 Kỳ Ấn',
                description: 'Thu thập được 30 Kỳ Ấn',
                type: 'KY_NHAN_SUMMARY_COUNT' as const,
                requirement: 30,
                reward: 300,
                isActive: true,
                order: 3
            },
            {
                name: 'Thu thập được 40 Kỳ Ấn',
                description: 'Thu thập được 40 Kỳ Ấn',
                type: 'KY_NHAN_SUMMARY_COUNT' as const,
                requirement: 40,
                reward: 400,
                isActive: true,
                order: 4
            }
        ]

        // Tạo thành tựu cho Land
        const landAchievements = [
            {
                name: 'Thu thập được Núi Tản Viên',
                description: 'Thu thập được Núi Tản Viên',
                type: 'LAND_COLLECTION' as const,
                requirement: 1,
                reward: 200,
                isActive: true,
                order: 1,
                landId: 1 // Giả sử Núi Tản Viên có ID = 1
            },
            {
                name: 'Thu thập được Đầm Dạ Trạch',
                description: 'Thu thập được Đầm Dạ Trạch',
                type: 'LAND_COLLECTION' as const,
                requirement: 1,
                reward: 200,
                isActive: true,
                order: 2,
                landId: 2 // Giả sử Đầm Dạ Trạch có ID = 2
            },
            {
                name: 'Thu thập được Làng Phù Đổng',
                description: 'Thu thập được Làng Phù Đổng',
                type: 'LAND_COLLECTION' as const,
                requirement: 1,
                reward: 200,
                isActive: true,
                order: 3,
                landId: 3 // Giả sử Làng Phù Đổng có ID = 3
            },
            {
                name: 'Thu thập được Phủ Tây Hồ',
                description: 'Thu thập được Phủ Tây Hồ',
                type: 'LAND_COLLECTION' as const,
                requirement: 1,
                reward: 200,
                isActive: true,
                order: 4,
                landId: 4 // Giả sử Phủ Tây Hồ có ID = 4
            }
        ]

        // Tạo thành tựu cho việc thu thập tất cả 4 vùng đất
        const allLandsAchievement = {
            name: 'Thu thập được cả 4 vùng đất',
            description: 'Thu thập được cả 4 vùng đất',
            type: 'ALL_LANDS_COLLECTED' as const,
            requirement: 4,
            reward: 500,
            isActive: true,
            order: 1
        }

        // Tạo thành tựu Kỳ Ấn
        for (const achievement of kyNhanAchievements) {
            await prisma.achievement.create({
                data: {
                    ...achievement,
                    createdById: 1 // Admin user
                }
            })
            console.log(`Created achievement: ${achievement.name}`)
        }

        // Tạo thành tựu Land
        for (const achievement of landAchievements) {
            await prisma.achievement.create({
                data: {
                    ...achievement,
                    createdById: 1 // Admin user
                }
            })
            console.log(`Created achievement: ${achievement.name}`)
        }

        // Tạo thành tựu thu thập tất cả vùng đất
        await prisma.achievement.create({
            data: {
                ...allLandsAchievement,
                createdById: 1 // Admin user
            }
        })
        console.log(`Created achievement: ${allLandsAchievement.name}`)

        console.log('All achievements created successfully!')
    } catch (error) {
        console.error('Error creating achievements:', error)
    } finally {
        await prisma.$disconnect()
    }
}

createAchievements()
