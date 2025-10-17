import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function initializeAchievementsForAllUsers() {
    try {
        console.log('Initializing achievements for all users...')

        // Lấy tất cả achievement đang active
        const achievements = await prisma.achievement.findMany({
            where: {
                isActive: true,
                deletedAt: null
            },
            select: { id: true, name: true }
        })

        if (!achievements.length) {
            console.log('No active achievements found')
            return
        }

        // Lấy tất cả user đang active
        const users = await prisma.user.findMany({
            where: {
                status: 'ACTIVE',
                deletedAt: null
            },
            select: { id: true, email: true }
        })

        if (!users.length) {
            console.log('No active users found')
            return
        }

        console.log(`Found ${achievements.length} achievements and ${users.length} users`)

        let totalCreated = 0

        // Tạo UserAchievement cho mỗi user và achievement
        for (const achievement of achievements) {
            console.log(`Processing achievement: ${achievement.name}`)

            const rows = users.map((user) => ({
                userId: user.id,
                achievementId: achievement.id,
                status: 'PENDING' as const,
                completedAt: null,
                rewardClaimed: false,
                createdById: 1 // System user
            }))

            const result = await prisma.userAchievement.createMany({
                data: rows,
                skipDuplicates: true
            })

            console.log(`Created ${result.count} user achievements for ${achievement.name}`)
            totalCreated += result.count
        }

        console.log(`Total user achievements created: ${totalCreated}`)
        console.log('Initialization completed successfully!')
    } catch (error) {
        console.error('Error initializing achievements for all users:', error)
    } finally {
        await prisma.$disconnect()
    }
}

initializeAchievementsForAllUsers()
