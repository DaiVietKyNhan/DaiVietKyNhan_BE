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
    RewardExpiredException,
    RewardLimitExceededException,
    InvalidCodeException
} from './dto/reward.error'
import {
    CreateUserRewardBodySchema,
    CreateUserRewardBodyType,
    UpdateUserRewardBodySchema,
    UpdateUserRewardBodyType,
    ExchangeRewardBodyType
} from './entities/user-reward.entity'
import { UserRewardRepo } from './user-reward.repo'
import { RewardRepo } from './reward.repo'

@Injectable()
export class UserRewardService {
    constructor(
        private userRewardRepo: UserRewardRepo,
        private rewardRepo: RewardRepo,
        private sharedUserRepo: SharedUserRepository
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
                throw new BadRequestException('User reward already exists')
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

            // 🌟 Xử lý trả lại coin/point khi chuyển từ COMPLETED sang CANCELLED
            if (currentUserReward.status === 'COMPLETED' && dataToUpdate.status === 'CANCELLED') {
                // Lấy thông tin reward để biết type
                const rewardData = await this.userRewardRepo.findRewardByUserRewardId(id)
                if (rewardData && rewardData.reward) {
                    if (rewardData.reward.type === 'POINT') {
                        // Trả lại điểm
                        await this.sharedUserRepo.addpointByUserId({
                            userId: currentUserReward.userId,
                            amount: currentUserReward.valuePaid
                        })
                    } else if (rewardData.reward.type === 'COIN') {
                        // Trả lại xu
                        await this.sharedUserRepo.addCoinByUserId({
                            userId: currentUserReward.userId,
                            amount: currentUserReward.valuePaid
                        })
                    }
                    // CODE type không cần trả lại gì
                }
            }

            return {
                statusCode: HttpStatus.OK,
                data: userReward,
                message: ENTITY_MESSAGE.UPDATE_SUCCESS
            }
        } catch (error) {
            if (isUniqueConstraintPrismaError(error)) {
                throw new BadRequestException('User reward already exists')
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

    async exchangeReward({ userId, rewardId, code }: { userId: number; rewardId: number; code?: string }) {
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

            // Kiểm tra đủ giá trị không
            if (reward.type === 'POINT') {
                if (user.point < reward.requireValue) {
                    throw InsufficientValueException
                }
            } else if (reward.type === 'COIN') {
                if (user.coin < reward.requireValue) {
                    throw InsufficientValueException
                }
            } else if (reward.type === 'CODE') {
                if (!code) {
                    throw InvalidCodeException
                }
            }

            // Trừ điểm/coin của user trước (chỉ với POINT và COIN)
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

            // Tạo user reward record với status PENDING
            const userReward = await this.userRewardRepo.create({
                createdById: userId,
                data: {
                    userId,
                    rewardId,
                    status: 'PENDING',
                    valuePaid: reward.type === 'CODE' ? 0 : reward.requireValue,
                    code: code || null,
                    exchangedAt: null
                }
            })

            return {
                statusCode: HttpStatus.OK,
                data: userReward,
                message: 'Reward exchanged successfully'
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
}
