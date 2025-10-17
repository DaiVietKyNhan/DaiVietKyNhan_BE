import { ENTITY_MESSAGE } from '@/common/constants/message'
import { PaginationQueryType } from '@/shared/models/request.model'
import { HttpStatus, Injectable, Logger } from '@nestjs/common'

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

@Injectable()
export class UserAchievementService {
    constructor(
        private userAchievementRepo: UserAchievementRepo,
        private logger: Logger
    ) { }

    async findMany({ pagination, where, orderBy }: { pagination: PaginationQueryType; where?: any; orderBy?: any }) {
        const [results, total] = await Promise.all([
            this.userAchievementRepo.findMany({ pagination, where, orderBy }),
            this.userAchievementRepo.findManyCount({ where })
        ])

        const { page, limit } = parseQs(pagination)

        return {
            statusCode: HttpStatus.OK,
            data: {
                results,
                total,
                page,
                limit
            },
            message: ENTITY_MESSAGE.GET_LIST_SUCCESS
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
        const userAchievements = await this.userAchievementRepo.findByUserId(userId)

        return {
            statusCode: HttpStatus.OK,
            data: userAchievements,
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

            // Update user achievement to claimed status
            const updatedUserAchievement = await this.userAchievementRepo.update({
                id: userAchievement.id,
                data: {
                    status: 'CLAIMED',
                    rewardClaimed: true
                },
                updatedById
            })

            return {
                statusCode: HttpStatus.OK,
                data: updatedUserAchievement,
                message: 'Reward claimed successfully'
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
