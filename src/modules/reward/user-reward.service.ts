import { ENTITY_MESSAGE } from '@/common/constants/message'
import { PaginationQueryType } from '@/shared/models/request.model'
import { HttpStatus, Injectable } from '@nestjs/common'

import { BadRequestException } from '@nestjs/common'
import { NotFoundRecordException } from 'src/shared/error'
import {
    isForeignKeyConstraintPrismaError,
    isNotFoundPrismaError,
    isUniqueConstraintPrismaError
} from 'src/shared/helpers'
import { parseQs } from '@/common/utils/qs-parser'
import { SharedUserRepository } from '@/shared/repositories/shared-user.repo'
import {
    RewardNotActiveException,
    InsufficientValueException,
    createInsufficientValueException,
    RewardExpiredException,
    RewardLimitExceededException,
    InvalidCodeException
} from './dto/reward.error'
import {
    CreateUserRewardBodySchema,
    CreateUserRewardBodyType,
    UpdateUserRewardBodySchema,
    UpdateUserRewardBodyType,
    ExchangeRewardBodyType,
    RedeemCodeBodyType
} from './entities/user-reward.entity'
import { UserRewardRepo } from './user-reward.repo'
import { RewardRepo } from './reward.repo'
import { PrismaService } from 'src/shared/services/prisma.service'

@Injectable()
export class UserRewardService {
    constructor(
        private userRewardRepo: UserRewardRepo,
        private rewardRepo: RewardRepo,
        private sharedUserRepo: SharedUserRepository,
        private prismaService: PrismaService
    ) { }

    async list(pagination: PaginationQueryType) {
        const data = await this.userRewardRepo.list(pagination)
        return {
            statusCode: HttpStatus.OK,
            data,
            message: ENTITY_MESSAGE.GET_LIST_SUCCESS
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
        const userRewards = await this.userRewardRepo.findByUserId(userId)

        return {
            statusCode: HttpStatus.OK,
            data: userRewards,
            message: ENTITY_MESSAGE.GET_LIST_SUCCESS
        }
    }

    async findByUserIdAndStatus(userId: number, status: 'PENDING' | 'COMPLETED' | 'CANCELLED') {
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
            const dataToCreate = { ...parsed.data as CreateUserRewardBodyType }
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
            const dataToUpdate = { ...parsed.data as UpdateUserRewardBodyType }
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
            const existingUserReward = await this.userRewardRepo.findByUserAndReward({ userId, rewardId })

            // Nếu đã có reward và status là COMPLETED thì báo lỗi
            if (existingUserReward && existingUserReward.status === 'COMPLETED') {
                throw new BadRequestException('Bạn đã đổi thưởng này rồi')
            }

            // Nếu đã có reward nhưng status là PENDING, thực hiện exchange và update thành COMPLETED
            if (existingUserReward && existingUserReward.status === 'PENDING') {
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

                // Update existing record thành COMPLETED
                const userReward = await this.userRewardRepo.update({
                    id: existingUserReward.id,
                    data: {
                        status: 'COMPLETED',
                        exchangedAt: new Date(),
                        code: reward.type === 'CODE' ? `CODE_${Date.now()}` : existingUserReward.code || undefined,
                        valuePaid: reward.type === 'CODE' ? 0 : reward.requireValue
                    },
                    updatedById: userId
                })

                // Parse gift để cộng coin/point cho tất cả loại reward
                await this.processGiftRewards(userId, reward.gift)

                return {
                    statusCode: HttpStatus.OK,
                    data: userReward,
                    message: 'Đổi thưởng thành công!'
                }
            }

            // Nếu chưa có reward, kiểm tra đủ giá trị và tạo mới
            if (reward.type === 'POINT') {
                if (user.point < reward.requireValue) {
                    throw createInsufficientValueException('POINT')
                }
            } else if (reward.type === 'COIN') {
                if (user.coin < reward.requireValue) {
                    throw createInsufficientValueException('COIN')
                }
            }

            // Trừ điểm/coin của user (chỉ với POINT và COIN)
            if (reward.type === 'POINT') {
                await this.sharedUserRepo.minuspointByUserId({
                    userId,
                    amount: reward.requireValue
                })
            } else if (reward.type === 'COIN') {
                await this.sharedUserRepo.minusCoinByUserId({
                    userId,
                    amount: reward.requireValue
                })
            }

            // Tạo user reward record mới với status COMPLETED (tự động nhận reward)
            const userReward = await this.userRewardRepo.create({
                createdById: userId,
                data: {
                    userId,
                    rewardId,
                    status: 'COMPLETED',
                    valuePaid: reward.type === 'CODE' ? 0 : reward.requireValue,
                    code: reward.type === 'CODE' ? `CODE_${Date.now()}` : null, // Auto generate code for CODE type
                    exchangedAt: new Date()
                }
            })

            // Parse gift để cộng coin/point cho tất cả loại reward
            await this.processGiftRewards(userId, reward.gift)

            return {
                statusCode: HttpStatus.OK,
                data: userReward,
                message: 'Đổi thưởng thành công!'
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
            const existingUserReward = await this.userRewardRepo.findByUserAndReward({ userId, rewardId: reward.id })

            if (existingUserReward) {
                if (existingUserReward.status === 'COMPLETED') {
                    throw new BadRequestException('Bạn đã sử dụng code này rồi')
                }
                if (existingUserReward.status === 'CANCELLED') {
                    throw new BadRequestException('Code này đã bị hủy')
                }

                // Cập nhật existing userReward thành COMPLETED
                const updatedUserReward = await this.userRewardRepo.update({
                    id: existingUserReward.id,
                    data: {
                        status: 'COMPLETED',
                        exchangedAt: new Date()
                    },
                    updatedById: userId
                })

                // Parse gift string để cộng coin và điểm cho user
                await this.processGiftRewards(userId, reward.gift)

                return {
                    statusCode: HttpStatus.OK,
                    data: updatedUserReward,
                    message: 'Đổi quà bằng code thành công!'
                }
            }

            // Tạo UserReward mới với status COMPLETED
            const newUserReward = await this.userRewardRepo.create({
                createdById: userId,
                data: {
                    userId,
                    rewardId: reward.id,
                    status: 'COMPLETED',
                    valuePaid: 0,
                    code: code,
                    exchangedAt: new Date()
                }
            })

            // Parse gift string để cộng coin và điểm cho user
            await this.processGiftRewards(userId, reward.gift)

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
                    console.log(`Added ${totalPoints} points to user ${userId} from gift: ${gift}. Result:`, result)
                } else {
                    console.log(`No points to add for user ${userId} from gift: ${gift}`)
                }
            }
        } catch (error) {
            console.error(`Error processing gift rewards for user ${userId}, gift: ${gift}`, error)
            // Không throw error để không ảnh hưởng đến flow chính
        }
    }
}
