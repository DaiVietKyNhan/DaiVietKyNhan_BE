import { ENTITY_MESSAGE } from '@/common/constants/message'
import { RoleName } from '@/common/constants/role.constant'
import { PaginationQueryType } from '@/shared/models/request.model'
import { ForbiddenException, HttpStatus, Injectable } from '@nestjs/common'

import { SharedUserRepository } from '@/shared/repositories/shared-user.repo'
import { BadRequestException } from '@nestjs/common'
import { NotFoundRecordException } from 'src/shared/error'
import {
    isForeignKeyConstraintPrismaError,
    isNotFoundPrismaError,
    isUniqueConstraintPrismaError
} from 'src/shared/helpers'
import { PrismaService } from 'src/shared/services/prisma.service'
import {
    createInsufficientValueException,
    InvalidCodeException,
    RewardExpiredException,
    RewardLimitExceededException,
    RewardNotActiveException
} from './dto/reward.error'
import { GetListUserRewardQueryType } from './dto/user-reward.zod-dto'
import {
    CreateUserRewardBodySchema,
    CreateUserRewardBodyType,
    UpdateUserRewardBodySchema,
    UpdateUserRewardBodyType
} from './entities/user-reward.entity'
import { RewardRepo } from './reward.repo'
import { UserRewardRepo } from './user-reward.repo'
import { UserRewardHistoryRepo } from './user-reward-history.repo' // Add this

@Injectable()
export class UserRewardService {
    constructor(
        private userRewardRepo: UserRewardRepo,
        private rewardRepo: RewardRepo,
        private sharedUserRepo: SharedUserRepository,
        private prismaService: PrismaService,
        private userRewardHistoryRepo: UserRewardHistoryRepo // Add this
    ) { }

    async getListUserReward(query: GetListUserRewardQueryType) {
        const data = await this.userRewardRepo.getListUserReward(query)
        return {
            statusCode: HttpStatus.OK,
            data,
            message: ENTITY_MESSAGE.GET_LIST_SUCCESS
        }
    }

    async list(pagination: PaginationQueryType) {
        const data = await this.userRewardRepo.list(pagination)
        return {
            statusCode: HttpStatus.OK,
            data,
            message: ENTITY_MESSAGE.GET_LIST_SUCCESS
        }
    }

    /**
     * Lấy danh sách UserRewardHistory với format chuẩn
     */
    async listHistory(pagination: PaginationQueryType) {
        const repoData = await this.userRewardHistoryRepo.list(pagination)

        return {
            statusCode: HttpStatus.OK,
            message: ENTITY_MESSAGE.GET_LIST_SUCCESS,
            data: {
                results: repoData.data,
                pagination: {
                    current: repoData.currentPage,
                    pageSize: repoData.pageSize,
                    totalPage: repoData.totalPage,
                    totalItem: repoData.total
                }
            }
        }
    }

    async findById(id: number) {
        const userReward = await this.userRewardRepo.findUnique({ id })
        if (!userReward) {
            throw NotFoundRecordException
        }

        return {
            statusCode: HttpStatus.OK,
            data: userReward,
            message: ENTITY_MESSAGE.GET_SUCCESS
        }
    }

    async findByUserId(userId: number) {
        const user = await this.sharedUserRepo.findUnique({ id: userId })
        if (!user) {
            throw NotFoundRecordException
        }
        const userRewards = await this.userRewardRepo.findByUserId(userId)

        // Check and update userRewards based on user's coin/point balance
        for (const userReward of userRewards) {
            const reward = userReward.reward


            // Chỉ xử lý POINT và COIN type, bỏ CODE
            if (reward.type === 'POINT' || reward.type === 'COIN') {
                let hasEnoughResources = false

                // Kiểm tra user có đủ coin/point không
                if (reward.type === 'POINT' && user.point >= reward.requireValue) {
                    hasEnoughResources = true
                } else if (reward.type === 'COIN' && user.coin >= reward.requireValue) {
                    hasEnoughResources = true
                }

                // Nếu đủ điểm/coin và đang PENDING -> chuyển thành COMPLETED
                if (hasEnoughResources && userReward.status === 'PENDING') {
                    await this.userRewardRepo.update({
                        id: userReward.id,
                        data: {
                            status: 'COMPLETED',
                            exchangedAt: new Date()
                        },
                        updatedById: userId
                    })
                    userReward.status = 'COMPLETED'
                    userReward.exchangedAt = new Date()
                }
                // Nếu không đủ điểm/coin và đang COMPLETED -> chuyển về PENDING
                else if (!hasEnoughResources && userReward.status === 'COMPLETED') {
                    await this.userRewardRepo.update({
                        id: userReward.id,
                        data: {
                            status: 'PENDING',
                            exchangedAt: null
                        },
                        updatedById: userId
                    })
                    userReward.status = 'PENDING'
                    userReward.exchangedAt = null
                }
            }
        }

        return {
            statusCode: HttpStatus.OK,
            data: userRewards,
            message: ENTITY_MESSAGE.GET_LIST_SUCCESS
        }
    }

    async findByUserIdAndStatus(
        userId: number,
        status: 'PENDING' | 'COMPLETED' | 'CLAIMED' | 'CANCELLED'
    ) {
        const userRewards = await this.userRewardRepo.findByUserIdAndStatus(userId, status)

        return {
            statusCode: HttpStatus.OK,
            data: userRewards,
            message: ENTITY_MESSAGE.GET_LIST_SUCCESS
        }
    }

    async create({
        data,
        createdById
    }: {
        data: CreateUserRewardBodyType
        createdById: number
    }) {
        try {
            // Validate & coerce using Zod schema
            const parsed = CreateUserRewardBodySchema.safeParse(data)
            if (!parsed.success) {
                const errors = parsed.error.errors.map((e) => ({
                    message: e.message,
                    path: e.path.join('.')
                }))
                throw new BadRequestException({
                    message: errors,
                    error: 'Unprocessable Entity',
                    statusCode: 422
                })
            }

            // Tự động set exchangedAt nếu status là COMPLETED
            const dataToCreate = { ...(parsed.data as CreateUserRewardBodyType) }
            if (dataToCreate.status === 'COMPLETED' && !dataToCreate.exchangedAt) {
                dataToCreate.exchangedAt = new Date()
            }

            const userReward = await this.userRewardRepo.create({
                createdById,
                data: dataToCreate
            })

            return {
                statusCode: HttpStatus.CREATED,
                data: userReward,
                message: ENTITY_MESSAGE.CREATE_SUCCESS
            }
        } catch (error) {
            if (isUniqueConstraintPrismaError(error)) {
                throw new BadRequestException('Thưởng đã tồn tại')
            }
            if (isForeignKeyConstraintPrismaError(error)) {
                throw NotFoundRecordException
            }
            if (isNotFoundPrismaError(error)) {
                throw NotFoundRecordException
            }

            throw error
        }
    }

    async update({
        id,
        data,
        updatedById
    }: {
        id: number
        data: UpdateUserRewardBodyType
        updatedById: number
    }) {
        try {
            // Validate & coerce using Zod schema
            const parsed = UpdateUserRewardBodySchema.safeParse(data)
            if (!parsed.success) {
                const errors = parsed.error.errors.map((e) => ({
                    message: e.message,
                    path: e.path.join('.')
                }))
                throw new BadRequestException({
                    message: errors,
                    error: 'Unprocessable Entity',
                    statusCode: 422
                })
            }

            // Tự động set exchangedAt nếu status chuyển thành COMPLETED
            const dataToUpdate = { ...(parsed.data as UpdateUserRewardBodyType) }
            if (dataToUpdate.status === 'COMPLETED' && !dataToUpdate.exchangedAt) {
                dataToUpdate.exchangedAt = new Date()
            }

            // Lấy thông tin user reward hiện tại để kiểm tra status cũ
            const currentUserReward = await this.userRewardRepo.findUnique({ id })
            if (!currentUserReward) {
                throw NotFoundRecordException
            }

            const userReward = await this.userRewardRepo.update({
                id,
                data: dataToUpdate,
                updatedById
            })

            return {
                statusCode: HttpStatus.OK,
                data: userReward,
                message: ENTITY_MESSAGE.UPDATE_SUCCESS
            }
        } catch (error) {
            if (isUniqueConstraintPrismaError(error)) {
                throw new BadRequestException('Thưởng đã tồn tại')
            }
            if (isForeignKeyConstraintPrismaError(error)) {
                throw NotFoundRecordException
            }
            if (isNotFoundPrismaError(error)) {
                throw NotFoundRecordException
            }

            throw error
        }
    }

    async exchangeReward({ userId, rewardId }: { userId: number; rewardId: number }) {
        try {
            // Lấy thông tin reward
            const reward = await this.rewardRepo.findUnique({ id: rewardId })
            if (!reward) {
                throw NotFoundRecordException
            }

            // Kiểm tra reward có hoạt động không
            if (!reward.isActive) {
                throw RewardNotActiveException
            }

            // Kiểm tra thời gian
            const now = new Date()
            if (reward.startDate && reward.startDate > now) {
                throw RewardExpiredException
            }
            if (reward.endDate && reward.endDate < now) {
                throw RewardExpiredException
            }

            // Kiểm tra giới hạn
            if (reward.limit) {
                const usedCount = await this.userRewardRepo.countUserRewardsByRewardId(rewardId)
                if (usedCount >= reward.limit) {
                    throw RewardLimitExceededException
                }
            }

            // Lấy thông tin user
            const user = await this.sharedUserRepo.findUnique({ id: userId })
            if (!user) {
                throw NotFoundRecordException
            }

            // Kiểm tra user đã có reward này chưa
            const existingUserReward = await this.userRewardRepo.findByUserAndReward({
                userId,
                rewardId
            })

            // Nếu đã có reward và status là CLAIMED thì báo lỗi
            // if (existingUserReward && existingUserReward.status === 'CLAIMED') {
            //     throw new BadRequestException('Bạn đã đổi thưởng này rồi')
            // }

            // Nếu đã có reward và status là COMPLETED, thực hiện exchange và update thành PENDING
            if (existingUserReward && existingUserReward.status === 'COMPLETED') {
                // Kiểm tra đủ giá trị và trừ điểm/coin (chỉ với POINT và COIN)
                if (reward.type === 'POINT') {
                    if (user.point < reward.requireValue) {
                        throw createInsufficientValueException('POINT')
                    }
                    await this.sharedUserRepo.minuspointByUserId({
                        userId,
                        amount: reward.requireValue
                    })
                } else if (reward.type === 'COIN') {
                    if (user.coin < reward.requireValue) {
                        throw createInsufficientValueException('COIN')
                    }
                    await this.sharedUserRepo.minusCoinByUserId({
                        userId,
                        amount: reward.requireValue
                    })
                }

                // Tính toán code và valuePaid trước khi update
                const codeToSave = reward.type === 'CODE'
                    ? `CODE_${Date.now()}`
                    : (existingUserReward.code || null)
                const valuePaidToSave = reward.type === 'CODE' ? 0 : reward.requireValue

                // Update existing record thành PENDING
                const userReward = await this.userRewardRepo.update({
                    id: existingUserReward.id,
                    data: {
                        status: 'PENDING',
                        exchangedAt: null,
                        code: codeToSave,
                        valuePaid: valuePaidToSave
                    },
                    updatedById: userId
                })

                // Parse gift để cộng coin/point cho tất cả loại reward
                await this.processGiftRewards(userId, reward.gift)

                // After successful exchange, create history record với code và valuePaid đã tính toán
                await this.userRewardHistoryRepo.create({
                    data: {
                        user: { connect: { id: userId } },
                        reward: { connect: { id: rewardId } },
                        status: 'CLAIMED',
                        exchangedAt: new Date(),
                        code: codeToSave,
                        valuePaid: valuePaidToSave
                    },
                    createdById: userId
                })

                return {
                    statusCode: HttpStatus.OK,
                    data: userReward,
                    message: 'Đổi thưởng thành công!'
                }
            }
        } catch (error) {
            if (isNotFoundPrismaError(error)) {
                throw NotFoundRecordException
            }
            throw error
        }
    }

    async redeemCode({ userId, code }: { userId: number; code: string }) {
        try {
            // Tìm reward bằng code trước
            const reward = await this.rewardRepo.findByCode({ code })
            if (!reward) {
                throw InvalidCodeException
            }

            // Kiểm tra đây phải là reward type CODE
            if (reward.type !== 'CODE') {
                throw InvalidCodeException
            }

            // Kiểm tra reward có hoạt động không
            if (!reward.isActive) {
                throw RewardNotActiveException
            }

            // Kiểm tra thời gian
            const now = new Date()
            if (reward.startDate && reward.startDate > now) {
                throw RewardExpiredException
            }
            if (reward.endDate && reward.endDate < now) {
                throw RewardExpiredException
            }

            // Kiểm tra giới hạn (nếu có)
            if (reward.limit) {
                const usedCount = await this.userRewardRepo.countUserRewardsByRewardId(reward.id)
                if (usedCount >= reward.limit) {
                    throw RewardLimitExceededException
                }
            }

            // Kiểm tra user đã đổi code này chưa
            const existingUserReward = await this.userRewardRepo.findByUserAndReward({
                userId,
                rewardId: reward.id
            })

            if (existingUserReward) {
                if (existingUserReward.status === 'COMPLETED') {
                    throw new BadRequestException('Bạn đã sử dụng code này rồi')
                }
                if (existingUserReward.status === 'CANCELLED') {
                    throw new BadRequestException('Code này đã bị hủy')
                }

                // Cập nhật existing userReward thành COMPLETED với code và valuePaid
                const codeToSave = code
                const valuePaidToSave = 0 // CODE type luôn có valuePaid = 0

                const updatedUserReward = await this.userRewardRepo.update({
                    id: existingUserReward.id,
                    data: {
                        status: 'COMPLETED',
                        exchangedAt: new Date(),
                        code: codeToSave,
                        valuePaid: valuePaidToSave
                    },
                    updatedById: userId
                })

                // Parse gift string để cộng coin và điểm cho user
                await this.processGiftRewards(userId, reward.gift)

                // After successful exchange, create history record với code và valuePaid đã tính toán
                await this.userRewardHistoryRepo.create({
                    data: {
                        user: { connect: { id: userId } },
                        reward: { connect: { id: reward.id } },
                        status: 'CLAIMED',
                        exchangedAt: new Date(),
                        code: codeToSave,
                        valuePaid: valuePaidToSave
                    },
                    createdById: userId
                })

                return {
                    statusCode: HttpStatus.OK,
                    data: updatedUserReward,
                    message: 'Đổi quà bằng code thành công!'
                }
            }

            // Tạo UserReward mới với status COMPLETED
            const codeToSave = code
            const valuePaidToSave = 0 // CODE type luôn có valuePaid = 0

            const newUserReward = await this.userRewardRepo.create({
                createdById: userId,
                data: {
                    userId,
                    rewardId: reward.id,
                    status: 'COMPLETED',
                    valuePaid: valuePaidToSave,
                    code: codeToSave,
                    exchangedAt: new Date()
                }
            })

            // Parse gift string để cộng coin và điểm cho user
            await this.processGiftRewards(userId, reward.gift)

            // After successful exchange, create history record với code và valuePaid đã tính toán
            await this.userRewardHistoryRepo.create({
                data: {
                    user: { connect: { id: userId } },
                    reward: { connect: { id: reward.id } },
                    status: 'CLAIMED',
                    exchangedAt: new Date(),
                    code: codeToSave,
                    valuePaid: valuePaidToSave
                },
                createdById: userId
            })

            return {
                statusCode: HttpStatus.OK,
                data: newUserReward,
                message: 'Đổi quà bằng code thành công!'
            }
        } catch (error) {
            if (isNotFoundPrismaError(error)) {
                throw NotFoundRecordException
            }
            throw error
        }
    }

    async delete({ id, deletedById }: { id: number; deletedById: number }) {
        try {
            await this.userRewardRepo.delete({ id, deletedById })

            return {
                statusCode: HttpStatus.OK,
                data: null,
                message: ENTITY_MESSAGE.DELETE_SUCCESS
            }
        } catch (error) {
            if (isNotFoundPrismaError(error)) {
                throw NotFoundRecordException
            }
            throw error
        }
    }

    async addAllSystemRewardsToAllUsers({ createdById }: { createdById: number }) {
        try {
            console.log('Initializing rewards for all users...')

            // Lấy tất cả các reward đang hoạt động trong hệ thống
            const activeRewards = await this.rewardRepo.findActiveRewards()

            if (!activeRewards || activeRewards.length === 0) {
                return {
                    statusCode: HttpStatus.OK,
                    data: {
                        totalCreated: 0,
                        totalRewards: 0,
                        totalUsers: 0
                    },
                    message: 'Không có reward nào trong hệ thống để thêm'
                }
            }

            // Lấy tất cả user đang active
            const users = await this.prismaService.user.findMany({
                where: {
                    status: 'ACTIVE',
                    deletedAt: null
                },
                select: { id: true }
            })

            if (!users || users.length === 0) {
                return {
                    statusCode: HttpStatus.OK,
                    data: {
                        totalCreated: 0,
                        totalRewards: activeRewards.length,
                        totalUsers: 0
                    },
                    message: 'Không có user nào trong hệ thống'
                }
            }

            console.log(`Found ${activeRewards.length} rewards and ${users.length} users`)

            let totalCreated = 0

            // Tạo UserReward cho mỗi reward và user
            for (const reward of activeRewards) {
                console.log(`Processing reward: ${reward.name}`)

                const rows = users.map((user) => ({
                    userId: user.id,
                    rewardId: reward.id,
                    status: 'PENDING' as const,
                    valuePaid: reward.requireValue,
                    code: null,
                    exchangedAt: null,
                    createdById
                }))

                // Sử dụng createMany với skipDuplicates để tránh lỗi duplicate
                const result = await this.prismaService.userReward.createMany({
                    data: rows,
                    skipDuplicates: true
                })

                console.log(`Created ${result.count} user rewards for ${reward.name}`)
                totalCreated += result.count
            }

            return {
                statusCode: HttpStatus.OK,
                data: {
                    totalCreated,
                    totalRewards: activeRewards.length,
                    totalUsers: users.length
                },
                message: `Đã tạo ${totalCreated} user rewards cho ${users.length} users với ${activeRewards.length} rewards`
            }
        } catch (error) {
            console.error('Error initializing rewards for all users:', error)
            throw error
        }
    }

    /**
     * Parse gift string và tự động cộng coin/point cho user
     * Ví dụ: "Gói quà Tết đặc biệt + 1000 coin" -> cộng 1000 coin
     */
    private async processGiftRewards(userId: number, gift: string): Promise<void> {
        if (!gift) return

        console.log(`Processing gift rewards for user ${userId}, gift: "${gift}"`)

        try {
            // Regex để tìm số coin trong gift string
            // Ví dụ: "+ 1000 coin", "+1000 coin", "+ 1000 COIN", "+1000coin", "+1000COIN", "150 COIN", "300 COIN"
            const coinMatch = gift.match(/(\d+)\s*coin/gi)
            console.log(`Coin matches for "${gift}":`, coinMatch)
            if (coinMatch && coinMatch.length > 0) {
                // Lấy số lượng coin từ tất cả matches (tổng cộng)
                let totalCoins = 0
                for (const match of coinMatch) {
                    const coinAmount = parseInt(match.replace(/[^0-9]/g, ''))
                    if (!isNaN(coinAmount)) {
                        totalCoins += coinAmount
                    }
                }

                if (totalCoins > 0) {
                    await this.sharedUserRepo.addCoinByUserId({
                        userId,
                        amount: totalCoins
                    })
                    console.log(`Added ${totalCoins} coins to user ${userId} from gift: ${gift}`)
                }
            }

            // Regex để tìm số điểm trong gift string
            // Ví dụ: "+ 500 điểm", "+500 điểm", "+ 500 point", "+500point", "+500POINT", "+500 Point", "500 điểm", "1000 point"
            const pointMatch = gift.match(/(\d+)\s*(điểm|point)/gi)
            console.log(`Point matches for "${gift}":`, pointMatch)
            if (pointMatch && pointMatch.length > 0) {
                // Lấy số lượng điểm từ tất cả matches (tổng cộng)
                let totalPoints = 0
                for (const match of pointMatch) {
                    const pointAmount = parseInt(match.replace(/[^0-9]/g, ''))
                    if (!isNaN(pointAmount)) {
                        totalPoints += pointAmount
                    }
                }

                if (totalPoints > 0) {
                    console.log(`Adding ${totalPoints} points to user ${userId}`)
                    const result = await this.sharedUserRepo.addpointByUserId({
                        userId,
                        amount: totalPoints
                    })
                    console.log(
                        `Added ${totalPoints} points to user ${userId} from gift: ${gift}. Result:`,
                        result
                    )
                } else {
                    console.log(`No points to add for user ${userId} from gift: ${gift}`)
                }
            }
        } catch (error) {
            console.error(
                `Error processing gift rewards for user ${userId}, gift: ${gift}`,
                error
            )
            // Không throw error để không ảnh hưởng đến flow chính
        }
    }

    /**
     * Migrate các UserReward type CODE với status COMPLETED sang UserRewardHistory
     * Chỉ admin mới có quyền thực hiện
     */
    async initMigrateCodeRewardsToHistory(adminUserId: number) {
        // Kiểm tra admin
        const admin = await this.prismaService.user.findUnique({
            where: { id: adminUserId },
            include: { role: true }
        })

        if (!admin || admin.role.name !== RoleName.Admin) {
            throw new ForbiddenException('Chỉ admin mới có quyền thực hiện migration')
        }

        try {
            // Tìm tất cả UserReward có status COMPLETED và reward type CODE
            const codeRewards = await this.prismaService.userReward.findMany({
                where: {
                    status: 'COMPLETED',
                    deletedAt: null,
                    reward: {
                        type: 'CODE',
                        deletedAt: null
                    }
                },
                include: {
                    reward: true
                }
            })

            if (codeRewards.length === 0) {
                return {
                    statusCode: HttpStatus.OK,
                    data: {
                        totalFound: 0,
                        migrated: 0,
                        skipped: 0
                    },
                    message: 'Không có UserReward type CODE với status COMPLETED nào để migrate'
                }
            }

            // Tối ưu: Lấy tất cả existing history trước (ngoài transaction) để tránh timeout
            const existingHistories = await this.prismaService.userRewardHistory.findMany({
                where: {
                    status: 'CLAIMED',
                    deletedAt: null,
                    OR: codeRewards.map((ur) => ({
                        userId: ur.userId,
                        rewardId: ur.rewardId,
                        exchangedAt: ur.exchangedAt
                    }))
                },
                select: {
                    userId: true,
                    rewardId: true,
                    exchangedAt: true
                }
            })

            // Tạo Set để check nhanh hơn
            const existingHistorySet = new Set(
                existingHistories.map((h) => `${h.userId}-${h.rewardId}-${h.exchangedAt?.getTime()}`)
            )

            let migrated = 0
            let skipped = 0

            // Chuẩn bị data để insert batch
            const dataToInsert: Array<{
                userId: number
                rewardId: number
                status: 'CLAIMED'
                exchangedAt: Date
                code: string | null
                valuePaid: number
                createdById: number
            }> = []

            for (const userReward of codeRewards) {
                const key = `${userReward.userId}-${userReward.rewardId}-${userReward.exchangedAt?.getTime()}`

                // Kiểm tra xem đã có trong history chưa (tránh duplicate)
                if (existingHistorySet.has(key)) {
                    skipped++
                    continue
                }

                // Thêm vào danh sách để insert batch
                dataToInsert.push({
                    userId: userReward.userId,
                    rewardId: userReward.rewardId,
                    status: 'CLAIMED' as const,
                    exchangedAt: userReward.exchangedAt || new Date(),
                    code: userReward.reward.code, // Lấy code từ reward
                    valuePaid: userReward.valuePaid,
                    createdById: adminUserId
                })
            }

            // Insert batch trong transaction với timeout tăng lên
            if (dataToInsert.length > 0) {
                await this.prismaService.$transaction(
                    async (tx) => {
                        // Sử dụng createMany để insert batch (nhanh hơn)
                        await tx.userRewardHistory.createMany({
                            data: dataToInsert,
                            skipDuplicates: true // Bỏ qua nếu có duplicate
                        })
                    },
                    {
                        maxWait: 30000, // 30 giây
                        timeout: 60000 // 60 giây
                    }
                )
                migrated = dataToInsert.length
            }

            return {
                statusCode: HttpStatus.OK,
                data: {
                    totalFound: codeRewards.length,
                    migrated,
                    skipped
                },
                message: `Migration thành công! Tìm thấy ${codeRewards.length} records, đã migrate ${migrated} records, bỏ qua ${skipped} records (đã tồn tại)`
            }
        } catch (error) {
            throw error
        }
    }
}
