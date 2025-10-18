import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function initializeRewardsForAllUsers() {
    try {
        console.log('Initializing rewards for all users...')

        // Lấy tất cả reward đang active
        const rewards = await prisma.reward.findMany({
            where: {
                isActive: true,
                deletedAt: null,
                OR: [
                    { startDate: null },
                    { startDate: { lte: new Date() } }
                ],
                AND: [
                    {
                        OR: [
                            { endDate: null },
                            { endDate: { gte: new Date() } }
                        ]
                    }
                ]
            },
            select: { id: true, name: true, requireValue: true }
        })

        if (!rewards.length) {
            console.log('No active rewards found')
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

        console.log(`Found ${rewards.length} rewards and ${users.length} users`)

        let totalCreated = 0

        // Tạo UserReward cho mỗi reward và user
        for (const reward of rewards) {
            console.log(`Processing reward: ${reward.name}`)

            const rows = users.map((user) => ({
                userId: user.id,
                rewardId: reward.id,
                status: 'PENDING' as const,
                valuePaid: reward.requireValue,
                code: null,
                exchangedAt: null,
                createdById: 1 // System user
            }))

            const result = await prisma.userReward.createMany({
                data: rows,
                skipDuplicates: true
            })

            console.log(`Created ${result.count} user rewards for ${reward.name}`)
            totalCreated += result.count
        }

        console.log(`Total user rewards created: ${totalCreated}`)
        console.log('Initialization completed successfully!')
    } catch (error) {
        console.error('Error initializing rewards for all users:', error)
    } finally {
        await prisma.$disconnect()
    }
}

initializeRewardsForAllUsers()
