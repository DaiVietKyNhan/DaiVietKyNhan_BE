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
import { UserAchievementAlreadyExistsException } from './dto/user-achievement.error'
import {
    CreateUserAchievementBodySchema,
    CreateUserAchievementBodyType,
    UpdateUserAchievementBodySchema,
    UpdateUserAchievementBodyType
} from './entities/user-achievement.entity'
import { UserAchievementRepo } from './user-achievement.repo'
import { SharedUserRepository } from '@/shared/repositories/shared-user.repo'

@Injectable()
export class UserAchievementService {
    constructor(
        private userAchievementRepo: UserAchievementRepo,
        private sharedUserRepo: SharedUserRepository
    ) { }

    async list(pagination: PaginationQueryType) {
        const data = await this.userAchievementRepo.list(pagination)
        return {
            statusCode: HttpStatus.OK,
            data,
            message: ENTITY_MESSAGE.GET_LIST_SUCCESS
        }
    }

    /**
     * Initialize all active achievements as PENDING for a verified user
     */
    async initializeForUser(userId: number) {
        const result = await this.userAchievementRepo.createManyForUserFromActiveAchievements(userId, userId)
        return {
            statusCode: HttpStatus.CREATED,
            data: { initialized: result.count },
            message: ENTITY_MESSAGE.CREATE_SUCCESS
        }
    }

    /**
     * Initialize a specific achievement for all active users
     * Called when a new achievement is added to the system
     */
    async initializeAchievementForAllUsers(achievementId: number, createdById: number) {
        const result = await this.userAchievementRepo.createAchievementForAllUsers(achievementId, createdById)
        return {
            statusCode: HttpStatus.CREATED,
            data: { initialized: result.count },
            message: `Achievement initialized for ${result.count} users`
        }
    }

    async findById(id: number) {
        const userAchievement = await this.userAchievementRepo.findUnique({ id })
        if (!userAchievement) {
            throw NotFoundRecordException
        }

        return {
            statusCode: HttpStatus.OK,
            data: userAchievement,
            message: ENTITY_MESSAGE.GET_SUCCESS
        }
    }

    async findByUserId(userId: number) {
        // First, check if user has any achievements
        let userAchievements = await this.userAchievementRepo.findByUserId(userId)

        // If user has no achievements, initialize them automatically
        if (!userAchievements || userAchievements.length === 0) {
            try {
                console.log(`Initializing achievements for user ${userId}`)
                const result = await this.userAchievementRepo.createManyForUserFromActiveAchievements(userId, userId)
                console.log(`Initialized ${result.count} achievements for user ${userId}`)

                if (result.count === 0) {
                    console.log('No active achievements found to initialize for user')
                }

                // Fetch again after initialization
                userAchievements = await this.userAchievementRepo.findByUserId(userId)
            } catch (error) {
                console.error('Failed to initialize achievements for user:', error)
                // Continue with empty array if initialization fails
            }
        }

        return {
            statusCode: HttpStatus.OK,
            data: userAchievements || [],
            message: ENTITY_MESSAGE.GET_LIST_SUCCESS
        }
    }

    async findByUserIdAndStatus(userId: number, status: 'PENDING' | 'COMPLETED' | 'CLAIMED') {
        const userAchievements = await this.userAchievementRepo.findByUserIdAndStatus(userId, status)

        return {
            statusCode: HttpStatus.OK,
            data: userAchievements,
            message: ENTITY_MESSAGE.GET_LIST_SUCCESS
        }
    }

    async create({
        data,
        createdById
    }: {
        data: CreateUserAchievementBodyType
        createdById: number
    }) {
        try {
            // Validate & coerce using Zod schema
            const parsed = CreateUserAchievementBodySchema.safeParse(data)
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

            const userAchievement = await this.userAchievementRepo.create({
                createdById,
                data: parsed.data as CreateUserAchievementBodyType
            })

            return {
                statusCode: HttpStatus.CREATED,
                data: userAchievement,
                message: ENTITY_MESSAGE.CREATE_SUCCESS
            }
        } catch (error) {
            if (isUniqueConstraintPrismaError(error)) {
                throw UserAchievementAlreadyExistsException
            }
            if (isForeignKeyConstraintPrismaError(error)) {
                throw NotFoundRecordException
            }
            if (isNotFoundPrismaError(error)) {
                throw UserAchievementAlreadyExistsException
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
        data: UpdateUserAchievementBodyType
        updatedById: number
    }) {
        try {
            // Validate & coerce using Zod schema
            const parsed = UpdateUserAchievementBodySchema.safeParse(data)
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

            const userAchievement = await this.userAchievementRepo.update({
                id,
                data: parsed.data as UpdateUserAchievementBodyType,
                updatedById
            })

            return {
                statusCode: HttpStatus.OK,
                data: userAchievement,
                message: ENTITY_MESSAGE.UPDATE_SUCCESS
            }
        } catch (error) {
            if (isUniqueConstraintPrismaError(error)) {
                throw UserAchievementAlreadyExistsException
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

    async claimReward({ userId, achievementId, updatedById }: { userId: number; achievementId: number; updatedById: number }) {
        try {
            const userAchievement = await this.userAchievementRepo.findByUserAndAchievement({ userId, achievementId })

            if (!userAchievement) {
                throw NotFoundRecordException
            }

            if (userAchievement.status !== 'COMPLETED') {
                throw new BadRequestException('Achievement is not completed yet')
            }

            if (userAchievement.rewardClaimed) {
                throw new BadRequestException('Reward already claimed')
            }

            // Get achievement reward amount
            const achievement = await this.userAchievementRepo.findByUserAndAchievement({ userId, achievementId })
            const rewardAmount = achievement?.achievement?.reward || 0

            // Update user achievement to claimed status
            const updatedUserAchievement = await this.userAchievementRepo.update({
                id: userAchievement.id,
                data: {
                    status: 'CLAIMED',
                    rewardClaimed: true
                },
                updatedById
            })

            // 🌟 Cộng reward vào coin của user
            if (rewardAmount > 0) {
                await this.sharedUserRepo.addCoinByUserId({
                    userId,
                    amount: rewardAmount
                })
            }

            return {
                statusCode: HttpStatus.OK,
                data: updatedUserAchievement,
                message: `nhận thưởng thành tựu thành công! +${rewardAmount} coin đã được cộng vào tài khoản của bạn`
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
            await this.userAchievementRepo.delete({ id, deletedById })

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
