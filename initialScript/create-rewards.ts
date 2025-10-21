import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createRewards() {
    try {
        console.log('Starting rewards setup...')

        // Kiểm tra xem đã có rewards nào chưa
        const existingRewards = await prisma.reward.findMany({
            where: { deletedAt: null },
            select: { id: true, name: true }
        })

        if (existingRewards.length > 0) {
            console.log(`Found ${existingRewards.length} existing rewards. Cleaning up related data...`)

            // Lấy danh sách reward IDs
            const rewardIds = existingRewards.map(r => r.id)

            // Xóa UserReward records liên quan trước
            const deletedUserRewards = await prisma.userReward.updateMany({
                where: {
                    rewardId: { in: rewardIds },
                    deletedAt: null
                },
                data: {
                    deletedAt: new Date(),
                    deletedById: 1 // Admin user
                }
            })

            console.log(`Deleted ${deletedUserRewards.count} related user rewards.`)

            // Soft delete: set deletedAt instead of hard delete
            await prisma.reward.updateMany({
                where: { deletedAt: null },
                data: {
                    deletedAt: new Date(),
                    deletedById: 1 // Admin user
                }
            })

            console.log('All existing rewards have been deleted.')
        } else {
            console.log('No existing rewards found.')
        }

        console.log('Creating new rewards...')

        // Tạo reward đổi bằng điểm (không cần giới hạn thời gian)
        const pointRewards = [
            {
                name: 'Voucher 50k',
                description: 'Voucher giảm giá 50.000 VNĐ',
                requireValue: 1000,
                gift: 'Voucher 50k',
                type: 'POINT' as const,
                limit: 100,
                startDate: null, // Không giới hạn thời gian
                endDate: null, // Không giới hạn thời gian
                isActive: true
            },
            {
                name: 'Voucher 100k',
                description: 'Voucher giảm giá 100.000 VNĐ',
                requireValue: 2000,
                gift: 'Voucher 100k',
                type: 'POINT' as const,
                limit: 50,
                startDate: null, // Không giới hạn thời gian
                endDate: null, // Không giới hạn thời gian
                isActive: true
            }
        ]

        // Tạo reward đổi bằng xu (không cần giới hạn thời gian)
        const coinRewards = [
            {
                name: 'Áo thun Đại Việt Kỳ Nhân',
                description: 'Áo thun chính thức của game',
                requireValue: 5000,
                gift: 'Áo thun Đại Việt Kỳ Nhân',
                type: 'COIN' as const,
                limit: 20,
                startDate: null, // Không giới hạn thời gian
                endDate: null, // Không giới hạn thời gian
                isActive: true
            },
            {
                name: 'Móc khóa Kỳ Nhân',
                description: 'Móc khóa hình Kỳ Nhân',
                requireValue: 2000,
                gift: 'Móc khóa Kỳ Nhân',
                type: 'COIN' as const,
                limit: 100,
                startDate: null, // Không giới hạn thời gian
                endDate: null, // Không giới hạn thời gian
                isActive: true
            }
        ]

        // Tạo reward đổi bằng code (có giới hạn thời gian)
        const codeRewards = [
            {
                name: 'Code đặc biệt',
                description: 'Code đổi quà đặc biệt',
                requireValue: 0, // CODE type không cần requireValue
                gift: 'Gói quà đặc biệt',
                code: 'XXXXXX', // Code để đổi quà
                type: 'CODE' as const,
                limit: null, // Không giới hạn
                startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 ngày trước
                endDate: null, // Không có ngày kết thúc
                isActive: true
            },
            {
                name: 'Code Sự Kiện Tết',
                description: 'Code đặc biệt cho sự kiện Tết Nguyên Đán',
                requireValue: 0,
                gift: 'Gói quà Tết đặc biệt + 1000 coin',
                code: 'qqqqqqqqq', // Code để đổi quà
                type: 'CODE' as const,
                limit: 5000,
                startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 ngày trước
                endDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 ngày trước
                isActive: true
            },
            {
                name: 'Code 500 Coin + 500 Điểm',
                description: 'Code đổi 500 coin và 500 điểm',
                requireValue: 0,
                gift: 'Quà tặng đặc biệt + 500 coin + 500 điểm',
                code: 'ABC123XYZ', // Code để đổi quà
                type: 'CODE' as const,
                limit: 1000, // Giới hạn 1000 lần sử dụng
                startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 ngày trước
                endDate: null, // Không có ngày kết thúc
                isActive: true
            },
        ]

        // Gộp tất cả rewards và tạo một lần để tránh quá nhiều kết nối DB
        const allRewards = [
            ...pointRewards.map(reward => ({ ...reward, createdById: 1 })),
            ...coinRewards.map(reward => ({ ...reward, createdById: 1 })),
            ...codeRewards.map(reward => ({ ...reward, createdById: 1 }))
        ]

        console.log(`Creating ${allRewards.length} rewards...`)

        const result = await prisma.reward.createMany({
            data: allRewards
        })

        console.log(`Successfully created ${result.count} rewards.`)

        // Log tất cả rewards đã tạo
        allRewards.forEach(reward => console.log(`✓ Created reward: ${reward.name} (${reward.type})`))

        console.log('🎉 All rewards created successfully!')
    } catch (error) {
        console.error('Error creating rewards:', error)
    } finally {
        await prisma.$disconnect()
    }
}

// Wrapper để đảm bảo đóng kết nối database
async function main() {
    try {
        await createRewards()
    } catch (error) {
        console.error('Fatal error:', error)
        process.exit(1)
    } finally {
        await prisma.$disconnect()
    }
}

main()
