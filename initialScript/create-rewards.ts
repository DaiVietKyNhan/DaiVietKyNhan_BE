import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createRewards() {
    try {
        console.log('Creating rewards...')

        // Tạo reward đổi bằng điểm
        const pointRewards = [
            {
                name: 'Voucher 50k',
                description: 'Voucher giảm giá 50.000 VNĐ',
                requireValue: 1000,
                gift: 'Voucher 50k',
                type: 'POINT' as const,
                limit: 100,
                startDate: new Date(),
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 ngày
                isActive: true
            },
            {
                name: 'Voucher 100k',
                description: 'Voucher giảm giá 100.000 VNĐ',
                requireValue: 2000,
                gift: 'Voucher 100k',
                type: 'POINT' as const,
                limit: 50,
                startDate: new Date(),
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 ngày
                isActive: true
            }
        ]

        // Tạo reward đổi bằng xu
        const coinRewards = [
            {
                name: 'Áo thun Đại Việt Kỳ Nhân',
                description: 'Áo thun chính thức của game',
                requireValue: 5000,
                gift: 'Áo thun Đại Việt Kỳ Nhân',
                type: 'COIN' as const,
                limit: 20,
                startDate: new Date(),
                endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 ngày
                isActive: true
            },
            {
                name: 'Móc khóa Kỳ Nhân',
                description: 'Móc khóa hình Kỳ Nhân',
                requireValue: 2000,
                gift: 'Móc khóa Kỳ Nhân',
                type: 'COIN' as const,
                limit: 100,
                startDate: new Date(),
                endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 ngày
                isActive: true
            }
        ]

        // Tạo reward đổi bằng code
        const codeRewards = [
            {
                name: 'Code đặc biệt',
                description: 'Code đổi quà đặc biệt',
                requireValue: 0, // CODE type không cần requireValue
                gift: 'Code đặc biệt',
                type: 'CODE' as const,
                limit: null, // Không giới hạn
                startDate: new Date(),
                endDate: null, // Không có ngày kết thúc
                isActive: true
            }
        ]

        // Tạo reward đổi bằng điểm
        for (const reward of pointRewards) {
            await prisma.reward.create({
                data: reward
            })
            console.log(`Created reward: ${reward.name}`)
        }

        // Tạo reward đổi bằng xu
        for (const reward of coinRewards) {
            await prisma.reward.create({
                data: reward
            })
            console.log(`Created reward: ${reward.name}`)
        }

        // Tạo reward đổi bằng code
        for (const reward of codeRewards) {
            await prisma.reward.create({
                data: reward
            })
            console.log(`Created reward: ${reward.name}`)
        }

        console.log('All rewards created successfully!')
    } catch (error) {
        console.error('Error creating rewards:', error)
    } finally {
        await prisma.$disconnect()
    }
}

createRewards()
