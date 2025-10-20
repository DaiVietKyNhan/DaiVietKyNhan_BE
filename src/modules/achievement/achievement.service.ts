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
import { AchievementAlreadyExistsException } from './dto/achievement.error'
import {
    CreateAchievementBodySchema,
    CreateAchievementBodyType,
    UpdateAchievementBodySchema,
    UpdateAchievementBodyType
} from './entities/achievement.entity'
import { AchievementRepo } from './achievement.repo'
import { UserAchievementService } from './user-achievement.service'

@Injectable()
export class AchievementService {
    constructor(
        private achievementRepo: AchievementRepo,
        private userAchievementService: UserAchievementService
    ) { }

    async list(pagination: PaginationQueryType) {
        const data = await this.achievementRepo.list(pagination)
        return {
            statusCode: HttpStatus.OK,
            data,
            message: ENTITY_MESSAGE.GET_LIST_SUCCESS
        }
    }

    async findById(id: number) {
        const achievement = await this.achievementRepo.findUnique({ id })
        if (!achievement) {
            throw NotFoundRecordException
        }

        return {
            statusCode: HttpStatus.OK,
            data: achievement,
            message: ENTITY_MESSAGE.GET_SUCCESS
        }
    }

    async create({
        data,
        createdById
    }: {
        data: CreateAchievementBodyType
        createdById: number
    }) {
        try {
            // Validate & coerce using Zod schema
            const parsed = CreateAchievementBodySchema.safeParse(data)
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

            // Tự động set order = max(order) + 1
            const maxOrderRow = await this.achievementRepo.findMaxOrder()
            const nextOrder = (maxOrderRow?.order ?? 0) + 1

            const achievement = await this.achievementRepo.create({
                createdById,
                data: parsed.data as CreateAchievementBodyType,
                order: nextOrder
            })

            // 🌟 Tự động tạo UserAchievement cho tất cả user hiện tại khi có achievement mới
            if (achievement.isActive) {
                try {
                    await this.userAchievementService.initializeAchievementForAllUsers(achievement.id, createdById)
                } catch (error) {
                    // Log error but don't fail the achievement creation
                    console.error('Failed to initialize achievement for all users:', error)
                }
            }

            return {
                statusCode: HttpStatus.CREATED,
                data: achievement,
                message: ENTITY_MESSAGE.CREATE_SUCCESS
            }
        } catch (error) {
            if (isUniqueConstraintPrismaError(error)) {
                throw AchievementAlreadyExistsException
            }
            if (isForeignKeyConstraintPrismaError(error)) {
                throw NotFoundRecordException
            }
            if (isNotFoundPrismaError(error)) {
                throw AchievementAlreadyExistsException
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
        data: UpdateAchievementBodyType
        updatedById: number
    }) {
        try {
            // Validate & coerce using Zod schema
            const parsed = UpdateAchievementBodySchema.safeParse(data)
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

            const achievement = await this.achievementRepo.update({
                id,
                data: parsed.data as UpdateAchievementBodyType,
                updatedById
            })

            return {
                statusCode: HttpStatus.OK,
                data: achievement,
                message: ENTITY_MESSAGE.UPDATE_SUCCESS
            }
        } catch (error) {
            if (isUniqueConstraintPrismaError(error)) {
                throw AchievementAlreadyExistsException
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

    async delete({ id, deletedById }: { id: number; deletedById: number }) {
        try {
            await this.achievementRepo.delete({ id, deletedById })

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

    async getActiveAchievements() {
        const achievements = await this.achievementRepo.findActiveAchievements()

        return {
            statusCode: HttpStatus.OK,
            data: achievements,
            message: ENTITY_MESSAGE.GET_LIST_SUCCESS
        }
    }

    async getAchievementsByType(type: 'KY_NHAN_SUMMARY_COUNT' | 'LAND_COLLECTION' | 'ALL_LANDS_COLLECTED') {
        const achievements = await this.achievementRepo.findByType(type)

        return {
            statusCode: HttpStatus.OK,
            data: achievements,
            message: ENTITY_MESSAGE.GET_LIST_SUCCESS
        }
    }

    /**
     * Initialize all active achievements for all users
     * Admin endpoint to manually trigger initialization
     */
    async initializeForAllUsers(createdById: number) {
        try {
            // Get all active achievements
            const achievements = await this.achievementRepo.findActiveAchievements()

            if (!achievements.length) {
                return {
                    statusCode: HttpStatus.OK,
                    data: { initialized: 0 },
                    message: 'No active achievements found'
                }
            }

            let totalInitialized = 0

            // Initialize each achievement for all users
            for (const achievement of achievements) {
                const result = await this.userAchievementService.initializeAchievementForAllUsers(achievement.id, createdById)
                totalInitialized += result.data.initialized
            }

            return {
                statusCode: HttpStatus.OK,
                data: { initialized: totalInitialized },
                message: `Initialized ${totalInitialized} user achievements for all users`
            }
        } catch (error) {
            throw error
        }
    }
}
