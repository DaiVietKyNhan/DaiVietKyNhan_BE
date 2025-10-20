import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createAchievements() {
    try {
        console.log('Starting achievements setup...')

        // Kiểm tra xem đã có achievements nào chưa
        const existingAchievements = await prisma.achievement.findMany({
            where: { deletedAt: null },
            select: { id: true, name: true }
        })

        if (existingAchievements.length > 0) {
            console.log(`Found ${existingAchievements.length} existing achievements. Cleaning up related data...`)

            // Lấy danh sách achievement IDs
            const achievementIds = existingAchievements.map(a => a.id)

            // Xóa UserAchievement records liên quan trước
            const deletedUserAchievements = await prisma.userAchievement.updateMany({
                where: {
                    achievementId: { in: achievementIds },
                    deletedAt: null
                },
                data: {
                    deletedAt: new Date(),
                    deletedById: 1 // Admin user
                }
            })

            console.log(`Deleted ${deletedUserAchievements.count} related user achievements.`)

            // Soft delete: set deletedAt instead of hard delete
            await prisma.achievement.updateMany({
                where: { deletedAt: null },
                data: {
                    deletedAt: new Date(),
                    deletedById: 1 // Admin user
                }
            })

            console.log('All existing achievements have been deleted.')
        } else {
            console.log('No existing achievements found.')
        }

        console.log('Creating new achievements...')

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

        // Gộp tất cả achievements và tạo một lần để tránh quá nhiều kết nối DB
        const allAchievements = [
            ...kyNhanAchievements.map(achievement => ({ ...achievement, createdById: 1 })),
            ...landAchievements.map(achievement => ({ ...achievement, createdById: 1 })),
            { ...allLandsAchievement, createdById: 1 }
        ]

        console.log(`Creating ${allAchievements.length} achievements...`)

        const result = await prisma.achievement.createMany({
            data: allAchievements
        })

        console.log(`Successfully created ${result.count} achievements.`)

        // Log tất cả achievements đã tạo
        allAchievements.forEach(achievement => console.log(`✓ Created achievement: ${achievement.name} (${achievement.type})`))

        console.log('🎉 All achievements created successfully!')
    } catch (error) {
        console.error('Error creating achievements:', error)
    } finally {
        await prisma.$disconnect()
    }
}

// Wrapper để đảm bảo đóng kết nối database
async function main() {
    try {
        await createAchievements()
    } catch (error) {
        console.error('Fatal error:', error)
        process.exit(1)
    } finally {
        await prisma.$disconnect()
    }
}

main()
